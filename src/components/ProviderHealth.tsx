import { useState } from 'react';
import { Activity, CheckCircle2, KeyRound, Loader2, ServerCog, XCircle } from 'lucide-react';
import { AIProvider, getAIConfig, PROVIDER_CONFIGS, testProviderConnection } from '../services/geminiService';

type Status = Record<string, { state: 'idle' | 'testing' | 'ok' | 'fail'; message: string }>;

export function ProviderHealth() {
  const [status, setStatus] = useState<Status>({});
  const cfg = getAIConfig();
  const providers = Object.values(PROVIDER_CONFIGS);

  const hasKey = (provider: AIProvider) => {
    if (provider === 'ollama') return true;
    const keyName = `${provider}` as keyof typeof cfg;
    return Boolean(cfg[keyName]);
  };

  const testOne = async (provider: AIProvider) => {
    setStatus(prev => ({ ...prev, [provider]: { state: 'testing', message: 'Testing connection...' } }));
    try {
      const result = await testProviderConnection(provider);
      setStatus(prev => ({ ...prev, [provider]: { state: result.ok ? 'ok' : 'fail', message: result.message } }));
    } catch (err) {
      setStatus(prev => ({ ...prev, [provider]: { state: 'fail', message: err instanceof Error ? err.message : 'Connection failed' } }));
    }
  };

  const testAll = async () => {
    for (const provider of providers) {
      if (hasKey(provider.id)) await testOne(provider.id);
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <header className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
              style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.25)', color: 'var(--primary-light)' }}>
              <Activity className="w-3.5 h-3.5" />
              Provider Health
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>AI provider diagnostics</h1>
            <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>Check configured keys, active models, and live provider connections.</p>
          </div>
          <button onClick={testAll} className="px-5 py-3 rounded-xl text-white font-black flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,var(--primary),#4f46e5)' }}>
            <ServerCog className="w-4 h-4" /> Test Configured Providers
          </button>
        </header>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {providers.map(provider => {
            const item = status[provider.id] ?? { state: 'idle', message: provider.requiresKey && !hasKey(provider.id) ? 'API key not configured' : 'Ready to test' };
            const configured = hasKey(provider.id);
            return (
              <div key={provider.id} className="rounded-3xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-black text-lg" style={{ color: 'var(--text)' }}>{provider.name}</h2>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{provider.defaultModel}</p>
                  </div>
                  {item.state === 'testing' ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--primary-light)' }} /> :
                    item.state === 'ok' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                    item.state === 'fail' ? <XCircle className="w-5 h-5 text-red-500" /> :
                    <KeyRound className="w-5 h-5" style={{ color: configured ? 'var(--primary-light)' : 'var(--text-subtle)' }} />}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{ background: configured ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)', color: configured ? '#10b981' : '#ef4444' }}>
                    {configured ? 'Configured' : 'Missing Key'}
                  </span>
                  {provider.isLocal && <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)' }}>Local</span>}
                </div>
                <p className="mt-4 text-sm min-h-12" style={{ color: 'var(--text-muted)' }}>{item.message}</p>
                <button onClick={() => testOne(provider.id)} disabled={!configured || item.state === 'testing'}
                  className="mt-4 w-full px-4 py-2.5 rounded-xl border text-sm font-black disabled:opacity-50"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  Test {provider.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
