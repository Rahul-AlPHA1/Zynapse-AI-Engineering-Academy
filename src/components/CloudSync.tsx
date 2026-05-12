import { useState } from 'react';
import { Cloud, Download, KeyRound, Loader2, Upload } from 'lucide-react';

function zynapsePayload() {
  const data = Object.fromEntries(
    Object.keys(localStorage)
      .filter(key => key.startsWith('ZYNAPSE_'))
      .map(key => [key, localStorage.getItem(key)])
  );
  return { app: 'Zynapse', version: 1, exportedAt: new Date().toISOString(), data };
}

export function CloudSync() {
  const [endpoint, setEndpoint] = useState(localStorage.getItem('ZYNAPSE_SYNC_ENDPOINT') || '');
  const [token, setToken] = useState(localStorage.getItem('ZYNAPSE_SYNC_TOKEN') || '');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const saveConfig = () => {
    localStorage.setItem('ZYNAPSE_SYNC_ENDPOINT', endpoint);
    localStorage.setItem('ZYNAPSE_SYNC_TOKEN', token);
    setStatus('Sync profile saved locally.');
  };

  const push = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(zynapsePayload()),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('Cloud push complete.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Cloud push failed.');
    } finally {
      setLoading(false);
    }
  };

  const pull = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(endpoint, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error(await res.text());
      const payload = await res.json();
      Object.entries(payload.data ?? payload).forEach(([key, value]) => {
        if (key.startsWith('ZYNAPSE_') && typeof value === 'string') localStorage.setItem(key, value);
      });
      setStatus('Cloud pull complete. Refresh to apply all data.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Cloud pull failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-5xl mx-auto p-5 lg:p-8">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'var(--border)', color: 'var(--primary-light)' }}>
            <Cloud className="w-3.5 h-3.5" />
            Cloud Sync
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Bring your own sync backend</h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Push or pull a Zynapse JSON snapshot from any endpoint you control. Works with serverless functions, private APIs, or local sync services.
          </p>
        </header>

        <div className="rounded-3xl border p-5 lg:p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
          <div className="grid lg:grid-cols-2 gap-4">
            <label>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Sync endpoint</span>
              <input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="https://your-api.example.com/zynapse-sync"
                className="mt-2 w-full px-4 py-3 rounded-xl border outline-none"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            </label>
            <label>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Bearer token</span>
              <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <KeyRound className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input value={token} onChange={e => setToken(e.target.value)} type="password" placeholder="optional"
                  className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--text)' }} />
              </div>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={saveConfig} className="px-5 py-3 rounded-xl border font-black" style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--bg-card)' }}>
              Save Profile
            </button>
            <button onClick={push} disabled={!endpoint || loading} className="px-5 py-3 rounded-xl text-white font-black flex items-center gap-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg,var(--primary),#4f46e5)' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Push
            </button>
            <button onClick={pull} disabled={!endpoint || loading} className="px-5 py-3 rounded-xl text-white font-black flex items-center gap-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg,var(--accent),var(--primary))' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Pull
            </button>
          </div>

          <pre className="mt-6 rounded-2xl border p-4 text-xs overflow-auto" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            {JSON.stringify(zynapsePayload(), null, 2).slice(0, 2500)}
          </pre>
          {status && <p className="mt-4 text-sm font-bold" style={{ color: 'var(--primary-light)' }}>{status}</p>}
        </div>
      </div>
    </div>
  );
}
