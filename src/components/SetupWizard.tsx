import { useEffect, useState } from 'react';
import { X, ArrowRight, ExternalLink, Activity, KeyRound, HardDrive, Loader2, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { LOCAL_OLLAMA_MODEL, LOCAL_OLLAMA_MODEL_NAME } from '../services/geminiService';

interface SetupWizardProps {
  onComplete: () => void;
  onOpenSettings: () => void;
}

type LocalSetupState = 'idle' | 'checking' | 'pulling' | 'ready' | 'error';
type InstallChoice = 'ai-providers' | 'local-ollama' | null;

interface RecommendationResponse {
  totalRamGb: number;
  cpuCores: number;
  cpuModel: string;
  recommended: {
    id: string;
    name: string;
    reason: string;
  };
}

export function SetupWizard({ onComplete, onOpenSettings }: SetupWizardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [localState, setLocalState] = useState<LocalSetupState>('idle');
  const [localMessage, setLocalMessage] = useState('');
  const [pullProgress, setPullProgress] = useState(0);
  const [installChoice, setInstallChoice] = useState<InstallChoice>(null);

  useEffect(() => {
    const hasSeenSetup = localStorage.getItem('SETUP_COMPLETED') === 'true';
    if (!hasSeenSetup) {
      setIsOpen(true);
      loadInstallChoice();
      loadRecommendation();
    }
  }, []);

  const complete = () => {
    localStorage.setItem('SETUP_COMPLETED', 'true');
    setIsOpen(false);
    onComplete();
  };

  const loadRecommendation = async () => {
    try {
      const res = await fetch('/api/ollama/recommend');
      if (!res.ok) throw new Error('Could not detect this PC.');
      setRecommendation(await res.json());
    } catch {
      setRecommendation({
        totalRamGb: 8,
        cpuCores: navigator.hardwareConcurrency || 4,
        cpuModel: 'Browser estimate',
        recommended: {
          id: LOCAL_OLLAMA_MODEL,
          name: LOCAL_OLLAMA_MODEL_NAME,
          reason: 'Single low-end CPU model for local Ollama mode.',
        },
      });
    }
  };

  const loadInstallChoice = async () => {
    try {
      const res = await fetch('/api/setup/install-choice');
      if (!res.ok) return;
      const data = await res.json();
      if (data.mode === 'local-ollama' || data.mode === 'ai-providers') {
        setInstallChoice(data.mode);
        if (data.mode === 'local-ollama') {
          localStorage.setItem('AI_PROVIDER', 'ollama');
          localStorage.setItem('AI_FALLBACK', 'false');
          localStorage.setItem('OLLAMA_MODEL', LOCAL_OLLAMA_MODEL);
          setLocalMessage('Installer selected Local Ollama. Zynapse will verify this PC and recommend the fastest safe model below.');
        } else {
          localStorage.setItem('AI_FALLBACK', 'true');
        }
      }
    } catch {
      // Installer choice is optional.
    }
  };

  const useProviderMode = () => {
    localStorage.setItem('AI_FALLBACK', 'true');
    complete();
    onOpenSettings();
  };

  const useLocalOllama = async () => {
    const model = LOCAL_OLLAMA_MODEL;
    setLocalState('checking');
    setLocalMessage('Checking Ollama on this PC...');
    setPullProgress(0);

    try {
      const status = await fetch('/api/ollama/status');
      const statusData = await status.json().catch(() => ({}));
      if (!status.ok || !statusData.ok) {
        throw new Error('Ollama is not running. Install Ollama, open it once, then run setup again.');
      }

      const installed = (statusData.models || []).map((m: { name: string }) => m.name);
      const isInstalled = installed.includes(model);

      if (!isInstalled) {
        setLocalState('pulling');
        setLocalMessage(`Downloading ${model}. This can take a few minutes the first time...`);
        const res = await fetch('/api/ollama/pull', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model }),
        });

        if (!res.ok || !res.body) {
          const err = await res.text();
          throw new Error(err || `Could not download ${model}.`);
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
              const evt = JSON.parse(line);
              if (evt.status) setLocalMessage(evt.status);
              if (evt.total && evt.completed) {
                setPullProgress(Math.min(100, Math.round((evt.completed / evt.total) * 100)));
              }
            } catch {
              setLocalMessage(line);
            }
          }
        }
      }

      localStorage.setItem('AI_PROVIDER', 'ollama');
      localStorage.setItem('AI_FALLBACK', 'false');
      localStorage.setItem('OLLAMA_URL', 'http://localhost:11434');
      localStorage.setItem('OLLAMA_MODEL', model);
      setPullProgress(100);
      setLocalState('ready');
      setLocalMessage(`${model} is ready. Zynapse will use local Ollama only.`);
      setTimeout(complete, 900);
    } catch (error) {
      setLocalState('error');
      setLocalMessage(error instanceof Error ? error.message : 'Local Ollama setup failed.');
    }
  };

  if (!isOpen) return null;

  const recommended = recommendation?.recommended;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-500" />
              Choose Your AI Mode
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Use hosted API providers, or let Zynapse configure a local Ollama model automatically.
            </p>
          </div>
          <button onClick={complete} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-zinc-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid lg:grid-cols-2 gap-5">
            <button
              onClick={useProviderMode}
              className={`text-left rounded-2xl border p-6 hover:bg-indigo-500/10 transition-all ${installChoice === 'ai-providers' ? 'border-indigo-400 bg-indigo-500/15' : 'border-indigo-500/20 bg-indigo-500/5'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white">Use AI Providers</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Fastest cloud responses</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Best if you already have Groq, Gemini, OpenAI, Claude, Mistral, DeepSeek, Together, or NVIDIA keys.
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-indigo-500">
                Configure provider keys <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            <div className={`rounded-2xl border p-6 bg-emerald-500/5 ${installChoice === 'local-ollama' ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-emerald-500/20'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white">Use Local Ollama</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">No API key needed</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Zynapse uses one small CPU-safe model only: {LOCAL_OLLAMA_MODEL}. It will configure the app to use Ollama only.
              </p>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                <p className="font-bold text-slate-900 dark:text-white">
                  Recommended: {recommended?.name || 'Detecting...'}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                  {recommendation ? `${recommendation.totalRamGb} GB RAM, ${recommendation.cpuCores} CPU cores` : 'Checking system specs...'}
                </p>
                <p className="text-xs text-emerald-500 mt-2">{recommended?.reason || 'Choosing the fastest safe model...'}</p>
              </div>

              {(localState === 'pulling' || localState === 'ready') && (
                <div className="mt-4">
                  <div className="h-2 rounded-full overflow-hidden bg-black/20">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pullProgress}%` }} />
                  </div>
                </div>
              )}

              {localMessage && (
                <div className={`mt-4 flex items-start gap-2 text-xs ${localState === 'error' ? 'text-red-400' : localState === 'ready' ? 'text-emerald-400' : 'text-slate-500 dark:text-zinc-400'}`}>
                  {localState === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : localState === 'ready' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                  <span>{localMessage}</span>
                </div>
              )}

              <button
                onClick={useLocalOllama}
                disabled={localState === 'checking' || localState === 'pulling'}
                className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {localState === 'checking' || localState === 'pulling' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Auto Configure Local Ollama
              </button>

              <p className="mt-3 text-[11px] text-slate-500 dark:text-zinc-600">
                Requires Ollama installed and running. Install from{' '}
                <a href="https://ollama.com" target="_blank" rel="noreferrer" className="text-emerald-500 underline inline-flex items-center gap-1">
                  ollama.com <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900/50 rounded-b-2xl flex justify-between items-center gap-3">
          <button onClick={complete} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors">
            Skip for now
          </button>
          <p className="text-xs text-slate-500 dark:text-zinc-600">
            You can change this later from AI Provider Settings or Local Model Manager.
          </p>
        </div>
      </div>
    </div>
  );
}
