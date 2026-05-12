import { useState, useEffect, useCallback } from 'react';
import { HardDrive, Cpu, MemoryStick, Download, RefreshCw, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp, Zap, Monitor } from 'lucide-react';
import { fetchOllamaModels, getAIConfig } from '../services/geminiService';

interface LocalModelManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PCSpecs {
  ram: number;        // GB (estimated)
  cpuCores: number;
  gpuName: string;
  hasGpu: boolean;
  tier: 1 | 2 | 3 | 4 | 5;
  source?: 'browser' | 'system';
  cpuModel?: string;
}

interface ModelRecommendation {
  id: string;
  name: string;
  size: string;        // GB
  sizeNum: number;     // for sorting
  best: string;        // use case
  tier: number;        // min tier required
  pullCmd: string;
  tag: 'recommended' | 'optional' | 'heavy';
}

const ALL_MODELS: ModelRecommendation[] = [
  // Tier 1 — 4 GB RAM
  { id: 'tinyllama',    name: 'TinyLlama 1.1B',   size: '637 MB', sizeNum: 0.6,  best: 'Ultra fast, very basic',    tier: 1, pullCmd: 'ollama pull tinyllama',     tag: 'optional'     },
  { id: 'qwen2.5:0.5b', name: 'Qwen 2.5 0.5B',   size: '397 MB', sizeNum: 0.4,  best: 'Smallest usable model',     tier: 1, pullCmd: 'ollama pull qwen2.5:0.5b', tag: 'optional'     },
  { id: 'gemma2:2b',    name: 'Gemma 2 2B',       size: '1.6 GB', sizeNum: 1.6,  best: "Google's tiny model",       tier: 1, pullCmd: 'ollama pull gemma2:2b',     tag: 'recommended'  },
  { id: 'phi3:mini',    name: 'Phi 3 Mini 3.8B',  size: '2.2 GB', sizeNum: 2.2,  best: 'Best for 4 GB RAM',         tier: 1, pullCmd: 'ollama pull phi3:mini',     tag: 'recommended'  },
  // Tier 2 — 8 GB RAM
  { id: 'llama3.2:3b',        name: 'Llama 3.2 3B',      size: '2.0 GB', sizeNum: 2.0,  best: 'Great balance for 8 GB',    tier: 2, pullCmd: 'ollama pull llama3.2:3b',         tag: 'recommended' },
  { id: 'qwen2.5:3b',         name: 'Qwen 2.5 3B',       size: '1.9 GB', sizeNum: 1.9,  best: 'Smart & fast',              tier: 2, pullCmd: 'ollama pull qwen2.5:3b',          tag: 'recommended' },
  { id: 'deepseek-coder:1.3b',name: 'DeepSeek Coder 1.3B',size:'776 MB',sizeNum: 0.8, best: 'Best tiny coding model',    tier: 2, pullCmd: 'ollama pull deepseek-coder:1.3b',  tag: 'recommended' },
  // Tier 3 — 16 GB RAM
  { id: 'llama3.1:8b',       name: 'Llama 3.1 8B',       size: '4.7 GB', sizeNum: 4.7,  best: 'Best for 16 GB RAM',        tier: 3, pullCmd: 'ollama pull llama3.1:8b',         tag: 'recommended' },
  { id: 'qwen2.5:7b',        name: 'Qwen 2.5 7B',        size: '4.4 GB', sizeNum: 4.4,  best: 'Excellent reasoning',       tier: 3, pullCmd: 'ollama pull qwen2.5:7b',          tag: 'recommended' },
  { id: 'mistral:7b',        name: 'Mistral 7B',          size: '4.1 GB', sizeNum: 4.1,  best: 'Great instruction model',   tier: 3, pullCmd: 'ollama pull mistral:7b',          tag: 'optional'    },
  { id: 'codellama:7b',      name: 'CodeLlama 7B',        size: '3.8 GB', sizeNum: 3.8,  best: 'Code specialist',           tier: 3, pullCmd: 'ollama pull codellama:7b',        tag: 'optional'    },
  { id: 'deepseek-r1:8b',    name: 'DeepSeek R1 8B',      size: '5.5 GB', sizeNum: 5.5,  best: 'Reasoning model',           tier: 3, pullCmd: 'ollama pull deepseek-r1:8b',      tag: 'optional'    },
  { id: 'phi4:14b',          name: 'Phi 4 14B',           size: '8.5 GB', sizeNum: 8.5,  best: "Microsoft's best small",    tier: 3, pullCmd: 'ollama pull phi4:14b',            tag: 'optional'    },
  // Tier 4 — 32 GB RAM
  { id: 'qwen2.5:32b',       name: 'Qwen 2.5 32B',        size: '19 GB',  sizeNum: 19,   best: 'Excellent for 32 GB RAM',   tier: 4, pullCmd: 'ollama pull qwen2.5:32b',         tag: 'recommended' },
  { id: 'deepseek-r1:32b',   name: 'DeepSeek R1 32B',     size: '19 GB',  sizeNum: 19,   best: 'Best local reasoning',      tier: 4, pullCmd: 'ollama pull deepseek-r1:32b',     tag: 'recommended' },
  { id: 'codellama:34b',     name: 'CodeLlama 34B',        size: '19 GB',  sizeNum: 19,   best: 'Best local code model',     tier: 4, pullCmd: 'ollama pull codellama:34b',       tag: 'optional'    },
  // Tier 5 — 64 GB+ RAM
  { id: 'llama3.1:70b',      name: 'Llama 3.1 70B',        size: '40 GB',  sizeNum: 40,   best: 'Full precision, best open', tier: 5, pullCmd: 'ollama pull llama3.1:70b',        tag: 'recommended' },
  { id: 'qwen2.5:72b',       name: 'Qwen 2.5 72B',         size: '41 GB',  sizeNum: 41,   best: 'Best open-source model',    tier: 5, pullCmd: 'ollama pull qwen2.5:72b',         tag: 'recommended' },
  { id: 'deepseek-r1:70b',   name: 'DeepSeek R1 70B',      size: '42 GB',  sizeNum: 42,   best: 'Best local reasoning ever', tier: 5, pullCmd: 'ollama pull deepseek-r1:70b',     tag: 'recommended' },
];

const TIER_LABELS = ['', '4 GB RAM', '8 GB RAM', '16 GB RAM', '32 GB RAM', '64 GB+ RAM'];

function tierFromRam(ram: number): 1 | 2 | 3 | 4 | 5 {
  if (ram >= 64) return 5;
  if (ram >= 32) return 4;
  if (ram >= 16) return 3;
  if (ram >= 8) return 2;
  return 1;
}

function detectPCSpecs(): PCSpecs {
  const ram = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
  const cpuCores = navigator.hardwareConcurrency ?? 4;

  // Try to get GPU info from WebGL
  let gpuName = 'Unknown GPU';
  let hasGpu = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        gpuName = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
        hasGpu = /nvidia|amd|radeon|geforce|rtx|gtx|rx\s/i.test(gpuName);
      }
    }
  } catch { /* ignore */ }

  return { ram, cpuCores, gpuName, hasGpu, tier: tierFromRam(ram), source: 'browser' };
}

export function LocalModelManager({ isOpen, onClose }: LocalModelManagerProps) {
  const [specs, setSpecs] = useState<PCSpecs | null>(null);
  const [manualRam, setManualRam] = useState<number | null>(null);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [expandedTier, setExpandedTier] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'ok' | 'offline'>('checking');
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullStatus, setPullStatus] = useState('');
  const [pullProgress, setPullProgress] = useState(0);

  const effectiveTier = (() => {
    if (manualRam !== null) {
      return tierFromRam(manualRam);
    }
    return specs?.tier ?? 1;
  })() as 1 | 2 | 3 | 4 | 5;

  const recommendedModel = ALL_MODELS.find(m => m.tier === effectiveTier && m.tag === 'recommended') || ALL_MODELS.find(m => m.tier === effectiveTier) || ALL_MODELS[0];

  const checkOllama = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/ollama/status');
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Ollama offline');
      setInstalledModels((data.models || []).map((m: { name: string }) => m.name));
      setOllamaStatus('ok');
    } catch {
      const models = await fetchOllamaModels();
      setInstalledModels(models);
      setOllamaStatus(models.length > 0 ? 'ok' : 'offline');
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSpecs(detectPCSpecs());
    setExpandedTier(null);
    fetch('/api/system/specs')
      .then(r => r.json())
      .then(data => {
        if (!data.totalRamGb) return;
        setSpecs(prev => ({
          ram: data.totalRamGb,
          cpuCores: data.cpus || prev?.cpuCores || 4,
          cpuModel: data.cpuModel,
          gpuName: prev?.gpuName || 'Unknown GPU',
          hasGpu: prev?.hasGpu || false,
          tier: tierFromRam(data.totalRamGb),
          source: 'system',
        }));
      })
      .catch(() => {});
    checkOllama();
  }, [isOpen, checkOllama]);

  const copyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const isInstalled = (modelId: string) =>
    installedModels.some(m => m === modelId || m.split(':')[0] === modelId.split(':')[0]);

  const pullModel = async (modelId: string) => {
    setPullingModel(modelId);
    setPullStatus(`Starting ${modelId} download...`);
    setPullProgress(0);
    try {
      const res = await fetch('/api/ollama/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId }),
      });
      if (!res.ok || !res.body) {
        const err = await res.text();
        throw new Error(err || 'Ollama pull failed');
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
            if (evt.status) setPullStatus(evt.status);
            if (evt.total && evt.completed) {
              setPullProgress(Math.min(100, Math.round((evt.completed / evt.total) * 100)));
            }
          } catch {
            setPullStatus(line);
          }
        }
      }
      localStorage.setItem('AI_PROVIDER', 'ollama');
      localStorage.setItem('OLLAMA_MODEL', modelId);
      setPullProgress(100);
      setPullStatus(`${modelId} ready. Ollama is now selected as your AI provider.`);
      await checkOllama();
    } catch (err) {
      setPullStatus(err instanceof Error ? err.message : 'Ollama pull failed');
    } finally {
      setPullingModel(null);
    }
  };

  // Group models by tier
  const tiers = [1, 2, 3, 4, 5] as const;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#0a0a14', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'rgba(99,102,241,0.12)', background: 'rgba(99,102,241,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <HardDrive className="w-5 h-5" style={{ color: 'var(--primary-light)' }} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Local Model Manager</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Run AI 100% on your PC — no API key needed
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* PC Specs card */}
          <div className="rounded-xl p-4 border space-y-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-400" /> Your PC Specs
              </span>
              <button
                onClick={() => setSpecs(detectPCSpecs())}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Re-detect
              </button>
            </div>

            {specs && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <MemoryStick className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-zinc-500">RAM {specs.source === 'system' ? '(system)' : '(browser estimate)'}</p>
                    <p className="text-zinc-200 font-semibold">{manualRam ?? specs.ram} GB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-zinc-500">CPU Cores</p>
                    <p className="text-zinc-200 font-semibold">{specs.cpuCores} cores</p>
                    {specs.cpuModel && <p className="text-[10px] text-zinc-600 truncate max-w-[220px]">{specs.cpuModel}</p>}
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-500">GPU</p>
                    <p className="text-zinc-200 font-semibold truncate">{specs.gpuName}</p>
                  </div>
                  {specs.hasGpu && (
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 border border-emerald-500/30" style={{ background: 'rgba(16,185,129,0.1)' }}>
                      GPU DETECTED
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Manual RAM override */}
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">
                Override RAM (if auto-detect is wrong)
              </label>
              <div className="flex gap-2">
                {[4, 8, 16, 32, 64].map(gb => (
                  <button
                    key={gb}
                    onClick={() => setManualRam(manualRam === gb ? null : gb)}
                    className="flex-1 py-1 rounded-lg text-xs font-semibold transition-all border"
                    style={{
                      background: (manualRam ?? specs?.ram) === gb ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                      borderColor: (manualRam ?? specs?.ram) === gb ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
                      color: (manualRam ?? specs?.ram) === gb ? '#818cf8' : '#6b7280',
                    }}
                  >
                    {gb}GB
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended tier badge */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}
            >
              <Zap className="w-4 h-4" />
              Recommended tier: <strong>Tier {effectiveTier}</strong> — {TIER_LABELS[effectiveTier]} · Best fast model: <strong>{recommendedModel.name}</strong>
            </div>

            <button
              onClick={() => pullModel(recommendedModel.id)}
              disabled={pullingModel !== null || isInstalled(recommendedModel.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#6366f1,#22d3ee)', color: 'white', boxShadow: '0 12px 24px rgba(99,102,241,0.22)' }}
            >
              <Download className="w-4 h-4" />
              {isInstalled(recommendedModel.id) ? 'Recommended model already installed' : pullingModel === recommendedModel.id ? 'Downloading recommended model...' : `Download fastest recommended: ${recommendedModel.id}`}
            </button>
          </div>

          {/* Ollama status */}
          <div
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-2 text-sm">
              {ollamaStatus === 'ok'
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                : <AlertCircle className="w-4 h-4 text-red-400" />}
              <span className={ollamaStatus === 'ok' ? 'text-emerald-400' : 'text-red-400'}>
                Ollama {ollamaStatus === 'ok' ? 'running' : 'not detected'}
              </span>
              {installedModels.length > 0 && (
                <span className="text-zinc-500">· {installedModels.length} model(s) installed</span>
              )}
            </div>
            <button
              onClick={checkOllama}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {ollamaStatus === 'offline' && (
            <div className="p-3 rounded-xl text-xs text-amber-300 border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.08)' }}>
              <strong>Ollama not running.</strong> Install from{' '}
              <a href="https://ollama.com" target="_blank" rel="noreferrer" className="underline text-amber-400">ollama.com</a>
              {' '}then run <code className="bg-black/30 px-1 rounded font-mono">ollama serve</code> in your terminal.
            </div>
          )}

          {(pullingModel || pullStatus) && (
            <div className="p-3 rounded-xl border border-indigo-500/20" style={{ background: 'rgba(99,102,241,0.08)' }}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm font-semibold text-indigo-300">{pullingModel ? `Downloading ${pullingModel}` : 'Ollama download status'}</span>
                <span className="text-xs font-mono text-indigo-300">{pullProgress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-black/30 mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${pullProgress}%`, background: 'linear-gradient(90deg,#6366f1,#22d3ee)' }} />
              </div>
              <p className="text-xs text-zinc-400">{pullStatus}</p>
            </div>
          )}

          {/* Model tiers */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 px-1">Models by PC Tier</p>

            {tiers.map(tier => {
              const tierModels = ALL_MODELS.filter(m => m.tier === tier);
              const isCurrentTier = tier === effectiveTier;
              const isExpanded = expandedTier === tier || isCurrentTier;

              return (
                <div
                  key={tier}
                  className="rounded-xl overflow-hidden border transition-all"
                  style={{
                    borderColor: isCurrentTier ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)',
                    background: isCurrentTier ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  {/* Tier header */}
                  <button
                    className="w-full flex items-center justify-between px-4 py-3"
                    onClick={() => setExpandedTier(expandedTier === tier && !isCurrentTier ? null : tier)}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                        style={{
                          background: isCurrentTier ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                          color: isCurrentTier ? '#818cf8' : '#4b5563',
                        }}
                      >
                        T{tier}
                      </span>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${isCurrentTier ? 'text-indigo-300' : 'text-zinc-400'}`}>
                          {TIER_LABELS[tier]}
                          {isCurrentTier && (
                            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
                              YOUR PC
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-600">{tierModels.length} models available</p>
                      </div>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-zinc-600" />
                      : <ChevronDown className="w-4 h-4 text-zinc-600" />}
                  </button>

                  {/* Model list */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-1.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {tierModels.map(model => {
                        const installed = isInstalled(model.id);
                        return (
                          <div
                            key={model.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg"
                            style={{ background: installed ? 'rgba(16,185,129,0.06)' : 'rgba(0,0,0,0.25)' }}
                          >
                            {/* Status dot */}
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: installed ? '#10b981' : model.tag === 'recommended' ? '#6366f1' : '#374151' }}
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-zinc-200">{model.name}</span>
                                <span className="text-[10px] font-mono text-zinc-500">{model.size}</span>
                                {model.tag === 'recommended' && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-indigo-300" style={{ background: 'rgba(99,102,241,0.15)' }}>
                                    RECOMMENDED
                                  </span>
                                )}
                                {installed && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-emerald-300" style={{ background: 'rgba(16,185,129,0.15)' }}>
                                    INSTALLED
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-600 truncate">{model.best}</p>
                            </div>

                            <div className="shrink-0 flex items-center gap-1">
                              <button
                                onClick={() => pullModel(model.id)}
                                disabled={pullingModel !== null || installed}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border disabled:opacity-45"
                                style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}
                              >
                                <Download className="w-3 h-3" />
                                {installed ? 'Ready' : pullingModel === model.id ? 'Pulling' : 'Download'}
                              </button>
                              <button
                                onClick={() => copyCmd(model.pullCmd)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border"
                                style={{
                                  background: copiedCmd === model.pullCmd ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                                  borderColor: copiedCmd === model.pullCmd ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)',
                                  color: copiedCmd === model.pullCmd ? '#34d399' : '#94a3b8',
                                }}
                              >
                                {copiedCmd === model.pullCmd ? 'Copied!' : 'Cmd'}
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* How to install hint */}
                      <div className="mt-2 p-2.5 rounded-lg text-xs text-zinc-600 font-mono" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        Open your terminal → paste the copied command → press Enter
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-xs text-zinc-600">
            Configure the active model in <strong className="text-zinc-500">AI Providers → Ollama</strong>
          </p>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
