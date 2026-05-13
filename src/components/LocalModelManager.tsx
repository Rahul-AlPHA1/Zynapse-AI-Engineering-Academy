import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Cpu, Download, HardDrive, MemoryStick, RefreshCw, X, Zap } from 'lucide-react';
import { LOCAL_OLLAMA_MODEL, LOCAL_OLLAMA_MODEL_NAME } from '../services/geminiService';

interface LocalModelManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PCSpecs {
  totalRamGb?: number;
  cpus?: number;
  cpuModel?: string;
}

export function LocalModelManager({ isOpen, onClose }: LocalModelManagerProps) {
  const [specs, setSpecs] = useState<PCSpecs | null>(null);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'ok' | 'offline'>('checking');
  const [refreshing, setRefreshing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [message, setMessage] = useState('');

  const modelInstalled = installedModels.some(model => (
    model === LOCAL_OLLAMA_MODEL || model.split(':')[0] === LOCAL_OLLAMA_MODEL.split(':')[0]
  ));

  const selectLocalModel = () => {
    localStorage.setItem('AI_PROVIDER', 'ollama');
    localStorage.setItem('AI_FALLBACK', 'false');
    localStorage.setItem('OLLAMA_URL', 'http://localhost:11434');
    localStorage.setItem('OLLAMA_MODEL', LOCAL_OLLAMA_MODEL);
  };

  const checkOllama = useCallback(async () => {
    setRefreshing(true);
    try {
      const [statusRes, specsRes] = await Promise.all([
        fetch('/api/ollama/status'),
        fetch('/api/system/specs').catch(() => null),
      ]);

      if (specsRes?.ok) setSpecs(await specsRes.json());

      const statusData = await statusRes.json();
      if (!statusRes.ok || !statusData.ok) throw new Error(statusData.error || 'Ollama offline');

      setInstalledModels((statusData.models || []).map((model: { name: string }) => model.name));
      setOllamaStatus('ok');
      selectLocalModel();
    } catch {
      setOllamaStatus('offline');
      setInstalledModels([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    checkOllama();
  }, [isOpen, checkOllama]);

  const pullModel = async () => {
    setPulling(true);
    setPullProgress(0);
    setMessage(`Starting ${LOCAL_OLLAMA_MODEL} download...`);

    try {
      const res = await fetch('/api/ollama/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: LOCAL_OLLAMA_MODEL }),
      });

      if (!res.ok || !res.body) {
        const err = await res.text();
        throw new Error(err || `Could not download ${LOCAL_OLLAMA_MODEL}.`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.status) setMessage(event.status);
            if (event.total && event.completed) {
              setPullProgress(Math.min(100, Math.round((event.completed / event.total) * 100)));
            }
          } catch {
            setMessage(line);
          }
        }
      }

      setPullProgress(100);
      setMessage(`${LOCAL_OLLAMA_MODEL} is ready. Local Ollama mode is active.`);
      selectLocalModel();
      await checkOllama();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ollama download failed.');
    } finally {
      setPulling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#0a0a14', border: '1px solid rgba(16,185,129,0.22)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'rgba(16,185,129,0.14)', background: 'rgba(16,185,129,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.14)' }}>
              <HardDrive className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Local Ollama</h2>
              <p className="text-xs text-zinc-500">One small CPU model. No model confusion.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="rounded-xl p-4 border space-y-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" /> Locked Local Model
              </span>
              <span className="text-xs font-mono text-emerald-300">{LOCAL_OLLAMA_MODEL}</span>
            </div>
            <p className="text-2xl font-black text-white">{LOCAL_OLLAMA_MODEL_NAME}</p>
            <p className="text-sm text-zinc-500">
              Zynapse local mode only uses this 1.6 GB model so low-end PCs do not get stuck choosing heavier models.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-black/30">
              <MemoryStick className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-zinc-500">RAM</p>
                <p className="text-zinc-200 font-semibold">{specs?.totalRamGb ?? 'Detecting'} GB</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-black/30">
              <Cpu className="w-4 h-4 text-purple-400" />
              <div className="min-w-0">
                <p className="text-zinc-500">CPU</p>
                <p className="text-zinc-200 font-semibold">{specs?.cpus ?? navigator.hardwareConcurrency ?? 4} cores</p>
                {specs?.cpuModel && <p className="text-[10px] text-zinc-600 truncate max-w-[190px]">{specs.cpuModel}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 text-sm">
              {ollamaStatus === 'ok'
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                : <AlertCircle className="w-4 h-4 text-red-400" />}
              <span className={ollamaStatus === 'ok' ? 'text-emerald-400' : 'text-red-400'}>
                Ollama {ollamaStatus === 'ok' ? 'running' : 'not detected'}
              </span>
              {modelInstalled && <span className="text-zinc-500">· {LOCAL_OLLAMA_MODEL} installed</span>}
            </div>
            <button onClick={checkOllama} disabled={refreshing} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {ollamaStatus === 'offline' && (
            <div className="p-3 rounded-xl text-xs text-amber-300 border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.08)' }}>
              <strong>Ollama is not running.</strong> Install Ollama from{' '}
              <a href="https://ollama.com" target="_blank" rel="noreferrer" className="underline text-amber-400">ollama.com</a>
              {' '}then open Ollama or run <code className="bg-black/30 px-1 rounded font-mono">ollama serve</code>.
            </div>
          )}

          {(pulling || message) && (
            <div className="p-3 rounded-xl border border-emerald-500/20" style={{ background: 'rgba(16,185,129,0.08)' }}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm font-semibold text-emerald-300">{pulling ? `Downloading ${LOCAL_OLLAMA_MODEL}` : 'Ollama status'}</span>
                <span className="text-xs font-mono text-emerald-300">{pullProgress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-black/30 mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${pullProgress}%`, background: 'linear-gradient(90deg,#10b981,#22d3ee)' }} />
              </div>
              <p className="text-xs text-zinc-400">{message}</p>
            </div>
          )}

          <button
            onClick={pullModel}
            disabled={pulling || modelInstalled}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#10b981,#22d3ee)', color: 'white', boxShadow: '0 12px 24px rgba(16,185,129,0.22)' }}
          >
            <Download className="w-4 h-4" />
            {modelInstalled ? `${LOCAL_OLLAMA_MODEL} already installed` : pulling ? 'Downloading local model...' : `Install ${LOCAL_OLLAMA_MODEL}`}
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-xs text-zinc-600">Local mode uses Ollama only and disables fallback.</p>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
