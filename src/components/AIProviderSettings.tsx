import { useState, useEffect, useCallback } from 'react';
import {
  X, Save, Key, CheckCircle2, AlertCircle, Loader2,
  ExternalLink, ChevronDown, ChevronUp, Cpu, Zap,
  Globe, HardDrive, RotateCcw, GripVertical, Info, Code2,
} from 'lucide-react';
import {
  PROVIDER_CONFIGS, AIProvider, getAIConfig,
  testProviderConnection, fetchOllamaModels, LOCAL_OLLAMA_MODEL, LOCAL_OLLAMA_MODEL_NAME,
} from '../services/geminiService';

interface AIProviderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDER_ORDER: AIProvider[] = [
  'gemini', 'groq', 'claude', 'openai',
  'mistral', 'deepseek', 'together', 'nvidia', 'ollama',
];
const CLOUD_PROVIDER_ORDER = PROVIDER_ORDER.filter((p) => p !== 'ollama');

const PROVIDER_LINKS: Record<AIProvider, string> = {
  gemini:   'https://aistudio.google.com/app/apikey',
  groq:     'https://console.groq.com/keys',
  claude:   'https://console.anthropic.com/settings/keys',
  openai:   'https://platform.openai.com/api-keys',
  mistral:  'https://console.mistral.ai/api-keys',
  together: 'https://api.together.xyz/settings/api-keys',
  deepseek: 'https://platform.deepseek.com/api_keys',
  nvidia:   'https://org.ngc.nvidia.com/setup/api-key',
  ollama:   'https://ollama.com/library',
};

const PROVIDER_COLORS: Record<AIProvider, string> = {
  gemini:   'from-blue-500 to-cyan-400',
  groq:     'from-orange-500 to-yellow-400',
  claude:   'from-amber-600 to-orange-400',
  openai:   'from-emerald-500 to-teal-400',
  mistral:  'from-violet-500 to-purple-400',
  together: 'from-pink-500 to-rose-400',
  deepseek: 'from-sky-500 to-blue-400',
  nvidia:   'from-green-500 to-lime-400',
  ollama:   'from-slate-500 to-zinc-400',
};

const PROVIDER_BADGES: Record<AIProvider, string> = {
  gemini:   'Free tier',
  groq:     'Ultra fast',
  claude:   'Best reasoning',
  openai:   'Most popular',
  mistral:  'Best for code',
  together: 'Cheapest',
  deepseek: 'Best value',
  nvidia:   'Enterprise',
  ollama:   '100% local',
};

const KEY_STORAGE_MAP: Partial<Record<AIProvider, string>> = {
  gemini: 'GEMINI_API_KEY',
  groq: 'GROQ_API_KEY',
  claude: 'CLAUDE_API_KEY',
  openai: 'OPENAI_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  together: 'TOGETHER_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  nvidia: 'NVIDIA_API_KEY',
};

const MODEL_STORAGE_MAP: Record<AIProvider, string> = {
  gemini: 'GEMINI_MODEL',
  groq: 'GROQ_MODEL',
  claude: 'CLAUDE_MODEL',
  openai: 'OPENAI_MODEL',
  mistral: 'MISTRAL_MODEL',
  together: 'TOGETHER_MODEL',
  deepseek: 'DEEPSEEK_MODEL',
  nvidia: 'NVIDIA_MODEL',
  ollama: 'OLLAMA_MODEL',
};

type TestStatus = { loading: boolean; ok: boolean | null; message: string };

export function AIProviderSettings({ isOpen, onClose }: AIProviderSettingsProps) {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [models, setModels] = useState<Record<string, string>>({});
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [primaryProvider, setPrimaryProvider] = useState<AIProvider>('gemini');
  const [fallbackEnabled, setFallbackEnabled] = useState(true);
  const [fallbackChain, setFallbackChain] = useState<AIProvider[]>(PROVIDER_ORDER);
  const [expanded, setExpanded] = useState<AIProvider | null>('gemini');
  const [testStatus, setTestStatus] = useState<Record<string, TestStatus>>({});
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'providers' | 'local' | 'fallback' | 'executor'>('providers');
  const [jdoodleId, setJdoodleId] = useState('');
  const [jdoodleSecret, setJdoodleSecret] = useState('');
  const [pistonUrl, setPistonUrl] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const cfg = getAIConfig();
    setKeys({
      gemini: cfg.gemini,
      groq: cfg.groq,
      claude: cfg.claude,
      openai: cfg.openai,
      mistral: cfg.mistral,
      together: cfg.together,
      deepseek: cfg.deepseek,
      nvidia: cfg.nvidia,
    });
    setModels({
      gemini: cfg.geminiModel,
      groq: cfg.groqModel,
      claude: cfg.claudeModel,
      openai: cfg.openaiModel,
      mistral: cfg.mistralModel,
      together: cfg.togetherModel,
      deepseek: cfg.deepseekModel,
      nvidia: cfg.nvidiaModel,
      ollama: cfg.ollamaModel,
    });
    setOllamaUrl(cfg.ollamaUrl);
    setPrimaryProvider(cfg.primaryProvider);
    setFallbackEnabled(cfg.fallbackEnabled);
    setFallbackChain(cfg.fallbackChain);
    setTestStatus({});
    setSaved(false);
    setJdoodleId(localStorage.getItem('JDOODLE_CLIENT_ID') || '');
    setJdoodleSecret(localStorage.getItem('JDOODLE_CLIENT_SECRET') || '');
    setPistonUrl(localStorage.getItem('PISTON_CUSTOM_URL') || '');
  }, [isOpen]);

  const loadOllamaModels = useCallback(async () => {
    const list = await fetchOllamaModels();
    if (list.length > 0) setOllamaModels(list);
  }, []);

  useEffect(() => {
    if (expanded === 'ollama' || activeTab === 'local') loadOllamaModels();
  }, [activeTab, expanded, loadOllamaModels]);

  const persistSettings = useCallback(() => {
    Object.entries(KEY_STORAGE_MAP).forEach(([p, k]) => localStorage.setItem(k, (keys[p] || '').trim()));
    Object.entries(MODEL_STORAGE_MAP).forEach(([p, k]) => localStorage.setItem(k, (models[p] || '').trim()));
    localStorage.setItem('OLLAMA_URL', ollamaUrl.trim());
    localStorage.setItem('AI_PROVIDER', primaryProvider);
    localStorage.setItem('AI_FALLBACK', String(fallbackEnabled));
    localStorage.setItem('AI_FALLBACK_CHAIN', JSON.stringify(fallbackChain));
    localStorage.setItem('JDOODLE_CLIENT_ID', jdoodleId.trim());
    localStorage.setItem('JDOODLE_CLIENT_SECRET', jdoodleSecret.trim());
    localStorage.setItem('PISTON_CUSTOM_URL', pistonUrl.trim());
  }, [fallbackChain, fallbackEnabled, jdoodleId, jdoodleSecret, keys, models, ollamaUrl, pistonUrl, primaryProvider]);

  const handleSave = () => {
    persistSettings();
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const handleTest = async (provider: AIProvider) => {
    persistSettings();
    setTestStatus(s => ({ ...s, [provider]: { loading: true, ok: null, message: 'Testing...' } }));
    const result = await testProviderConnection(provider);
    setTestStatus(s => ({ ...s, [provider]: { loading: false, ok: result.ok, message: result.message } }));
  };

  const moveFallback = (idx: number, dir: -1 | 1) => {
    const next = [...fallbackChain];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setFallbackChain(next);
  };

  const useOllamaOnly = async () => {
    await loadOllamaModels();
    const selectedModel = LOCAL_OLLAMA_MODEL;
    setModels(m => ({ ...m, ollama: selectedModel }));
    localStorage.setItem('AI_PROVIDER', 'ollama');
    localStorage.setItem('AI_FALLBACK', 'false');
    localStorage.setItem('OLLAMA_URL', ollamaUrl.trim());
    localStorage.setItem('OLLAMA_MODEL', selectedModel.trim());
    setPrimaryProvider('ollama');
    setFallbackEnabled(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#0a0a14] shadow-2xl shadow-indigo-500/10 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">AI Providers</h2>
              <p className="text-zinc-500 text-xs">9 providers — configure &amp; test connections</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 shrink-0">
          {(['providers', 'local', 'fallback', 'executor'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'providers' ? 'Cloud Providers' : tab === 'local' ? 'Local Ollama' : tab === 'fallback' ? 'Fallback Chain' : 'Code Executor'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          {/* ── PROVIDERS TAB ── */}
          {activeTab === 'providers' && (
            <>
              {/* Primary provider selector */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-3">
                <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" /> Primary Provider
                </p>
                <div className="flex flex-wrap gap-2">
                  {CLOUD_PROVIDER_ORDER.map(p => (
                    <button
                      key={p}
                      onClick={() => setPrimaryProvider(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                        primaryProvider === p
                          ? 'bg-indigo-500/30 border-indigo-400/60 text-indigo-300'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
                      }`}
                    >
                      {PROVIDER_CONFIGS[p].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider cards */}
              {CLOUD_PROVIDER_ORDER.map(provider => {
                const cfg = PROVIDER_CONFIGS[provider];
                const isExpanded = expanded === provider;
                const status = testStatus[provider];
                const isPrimary = primaryProvider === provider;

                return (
                  <div
                    key={provider}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isPrimary
                        ? 'border-indigo-500/40 bg-indigo-500/5'
                        : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    {/* Card header */}
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      onClick={() => setExpanded(isExpanded ? null : provider)}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br shrink-0 ${PROVIDER_COLORS[provider]}`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-semibold">{cfg.name}</span>
                          {isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                              PRIMARY
                            </span>
                          )}
                          {cfg.isLocal && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <HardDrive className="w-2.5 h-2.5" /> LOCAL
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-500 text-xs">{PROVIDER_BADGES[provider]}</p>
                      </div>

                      {status && !status.loading && (
                        <span className={`text-xs font-medium ${status.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                          {status.ok ? '✓ OK' : '✗ Failed'}
                        </span>
                      )}
                      {status?.loading && <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />}

                      {!cfg.isLocal && (
                        <Key className={`w-3.5 h-3.5 shrink-0 ${keys[provider] ? 'text-emerald-400' : 'text-zinc-600'}`} />
                      )}

                      {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
                    </button>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                        {!cfg.isLocal && (
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs text-zinc-400">API Key</label>
                              <a href={PROVIDER_LINKS[provider]} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                Get key <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <input
                              type="password"
                              value={keys[provider] || ''}
                              onChange={e => setKeys(k => ({ ...k, [provider]: e.target.value }))}
                              placeholder={`${cfg.name} API key...`}
                              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors font-mono"
                            />
                          </div>
                        )}

                        {cfg.isLocal && (
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">Ollama Server URL</label>
                            <input
                              type="text"
                              value={ollamaUrl}
                              onChange={e => setOllamaUrl(e.target.value)}
                              placeholder="http://localhost:11434"
                              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors font-mono"
                            />
                            <p className="mt-1.5 text-xs text-zinc-600 flex items-center gap-1">
                              <Info className="w-3 h-3" /> Install from
                              <a href="https://ollama.com" target="_blank" rel="noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 ml-1 inline-flex items-center gap-0.5">
                                ollama.com <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="text-xs text-zinc-400 block mb-1.5">Model</label>
                          <select
                            value={models[provider] || cfg.defaultModel}
                            onChange={e => setModels(m => ({ ...m, [provider]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/60 transition-colors appearance-none cursor-pointer"
                          >
                            {cfg.isLocal && ollamaModels.length > 0 && (
                              <optgroup label="Installed on your PC">
                                {ollamaModels.map(m => <option key={m} value={m}>{m}</option>)}
                              </optgroup>
                            )}
                            <optgroup label={cfg.isLocal ? 'Available to download' : 'Available models'}>
                              {cfg.models.map(m => (
                                <option key={m.id} value={m.id}>{m.name} — {m.description}</option>
                              ))}
                            </optgroup>
                          </select>
                        </div>

                        {cfg.isLocal && (
                          <div>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                              Local Ollama defaults to {LOCAL_OLLAMA_MODEL}, but you can use any installed chat model from your PC.
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleTest(provider)}
                            disabled={status?.loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {status?.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                            Test Connection
                          </button>

                          {cfg.isLocal && (
                            <button
                              onClick={loadOllamaModels}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-medium transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Refresh Models
                            </button>
                          )}

                          {status && !status.loading && (
                            <span className={`flex items-center gap-1 text-xs ml-auto ${status.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                              {status.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                              {status.message}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── FALLBACK TAB ── */}
          {activeTab === 'local' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <HardDrive className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-bold">Local Ollama Mode</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Use Zynapse without API keys. This mode disables hosted fallback and sends AI requests only to your local Ollama server.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Ollama Server URL</label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={e => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Local Model</label>
                  <div className="px-3 py-2 rounded-lg bg-black/40 border border-emerald-500/25 text-white text-sm">
                    <span className="font-mono">{LOCAL_OLLAMA_MODEL}</span>
                    <span className="ml-2 text-zinc-500">({LOCAL_OLLAMA_MODEL_NAME}, low-end default)</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Zynapse local mode uses your selected Ollama model. {LOCAL_OLLAMA_MODEL} remains the low-end default, and installed models appear in the selector.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleTest('ollama')}
                    disabled={testStatus.ollama?.loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {testStatus.ollama?.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                    Test Ollama
                  </button>
                  <button
                    onClick={loadOllamaModels}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Refresh Models
                  </button>
                  <button
                    onClick={useOllamaOnly}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                  >
                    <HardDrive className="w-3.5 h-3.5" /> Use Ollama Only
                  </button>
                </div>

                {testStatus.ollama && !testStatus.ollama.loading && (
                  <div className={`flex items-center gap-2 text-xs ${testStatus.ollama.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testStatus.ollama.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {testStatus.ollama.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'fallback' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm text-white font-medium">Auto Fallback</p>
                  <p className="text-xs text-zinc-500">If primary fails, try next providers automatically</p>
                </div>
                <button
                  onClick={() => setFallbackEnabled(!fallbackEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${fallbackEnabled ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${fallbackEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-zinc-400 mb-3 flex items-center gap-1.5">
                  <GripVertical className="w-3.5 h-3.5" /> Fallback order
                </p>
                <div className="space-y-1.5">
                  {fallbackChain.map((p, idx) => (
                    <div key={p} className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/10">
                      <span className="text-xs text-zinc-600 w-5 text-center">{idx + 1}</span>
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-br shrink-0 ${PROVIDER_COLORS[p]}`} />
                      <span className="text-sm text-zinc-300 flex-1">{PROVIDER_CONFIGS[p].name}</span>
                      <div className="flex gap-1">
                        <button onClick={() => moveFallback(idx, -1)} disabled={idx === 0}
                          className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-20 transition-colors">▲</button>
                        <button onClick={() => moveFallback(idx, 1)} disabled={idx === fallbackChain.length - 1}
                          className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-20 transition-colors">▼</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <strong>Tip:</strong> Put your fastest/cheapest provider first. Ollama at end as local fallback is a good pattern.
              </div>
            </div>
          )}

          {/* ── CODE EXECUTOR TAB ── */}
          {activeTab === 'executor' && (
            <div className="space-y-4">
              {/* Info banner */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-200">Public Piston API is whitelist-only</strong> as of Feb 15, 2026.
                  Set up JDoodle (free, 200 runs/day) or point to your own Piston instance.
                </div>
              </div>

              {/* JDoodle section */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-orange-500/15 border border-orange-500/25">
                    <Code2 className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-semibold">JDoodle API</p>
                    <p className="text-xs text-zinc-500">Free — 200 executions/day</p>
                  </div>
                  <a
                    href="https://www.jdoodle.com/compiler-api"
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Get credentials <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Client ID</label>
                  <input
                    type="text"
                    value={jdoodleId}
                    onChange={e => setJdoodleId(e.target.value)}
                    placeholder="your jdoodle client id..."
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Client Secret</label>
                  <input
                    type="password"
                    value={jdoodleSecret}
                    onChange={e => setJdoodleSecret(e.target.value)}
                    placeholder="your jdoodle client secret..."
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60 transition-colors font-mono"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  {jdoodleId && jdoodleSecret
                    ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Credentials set — JDoodle will be used as fallback</span></>
                    : <><AlertCircle className="w-3.5 h-3.5" /><span>No credentials — compiler will show setup instructions</span></>
                  }
                </div>
              </div>

              {/* Custom Piston section */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25">
                    <Globe className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-semibold">Custom Piston Instance</p>
                    <p className="text-xs text-zinc-500">Self-hosted or alternative Piston API</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Piston API Base URL</label>
                  <input
                    type="text"
                    value={pistonUrl}
                    onChange={e => setPistonUrl(e.target.value)}
                    placeholder="https://your-piston-instance.com/api/v2/piston"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60 transition-colors font-mono"
                  />
                </div>

                <p className="text-xs text-zinc-600 flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" />
                  Leave blank to use the default Piston proxy. Self-host at
                  <a href="https://github.com/engineer-man/piston" target="_blank" rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 ml-1 inline-flex items-center gap-0.5">
                    github.com/engineer-man/piston <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <strong>Execution priority:</strong> Custom Piston URL → Public Piston → JDoodle (if credentials set)
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-white/10 shrink-0 bg-black/20">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              saved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30'
            }`}
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
