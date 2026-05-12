import { ChangeEvent, useRef, useState } from 'react';
import { Database, Download, FileUp, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';

const ZYNAPSE_KEYS = [
  'ZYNAPSE_COMPLETED_TOPICS',
  'ZYNAPSE_BOOKMARKS',
  'ZYNAPSE_GAMIFICATION',
  'ZYNAPSE_ACHIEVEMENTS',
  'ZYNAPSE_FLASHCARDS',
  'ZYNAPSE_SAVED_IDEAS',
  'ZYNAPSE_XP_HISTORY',
  'ZYNAPSE_STUDY_PLANS',
  'ZYNAPSE_STUDY_PLAN_DONE',
  'ZYNAPSE_THEME',
];

function allZynapseKeys() {
  return Object.keys(localStorage).filter(key =>
    key.startsWith('ZYNAPSE_') ||
    key.startsWith('GEMINI_') ||
    key.startsWith('GROQ_') ||
    key.startsWith('OPENAI_') ||
    key.startsWith('CLAUDE_') ||
    key.startsWith('JDOODLE_') ||
    ZYNAPSE_KEYS.includes(key)
  );
}

export function DataManager() {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const keys = allZynapseKeys();

  const exportData = () => {
    const payload = {
      app: 'Zynapse',
      exportedAt: new Date().toISOString(),
      version: 1,
      data: Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zynapse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Backup exported.');
  };

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      const data = payload.data ?? payload;
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string' && (key.startsWith('ZYNAPSE_') || key.includes('_API_KEY') || key.startsWith('JDOODLE_'))) {
          localStorage.setItem(key, value);
        }
      });
      setMessage('Backup imported. Refresh the app to see all changes.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      event.target.value = '';
    }
  };

  const clearLearningData = () => {
    keys.filter(key => key.startsWith('ZYNAPSE_')).forEach(key => localStorage.removeItem(key));
    setMessage('Learning data cleared. API keys were kept.');
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-5xl mx-auto p-5 lg:p-8">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.25)', color: 'var(--primary-light)' }}>
            <Database className="w-3.5 h-3.5" />
            Data Manager
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Own your learning data</h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>Export, import, or clear local Zynapse data. Everything stays on your machine.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <button onClick={exportData} className="rounded-3xl border p-5 text-left hover:-translate-y-0.5 transition-all" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <Download className="w-7 h-7 mb-4" style={{ color: 'var(--primary-light)' }} />
            <h2 className="font-black" style={{ color: 'var(--text)' }}>Export Backup</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Download progress, notes, flashcards, settings, and saved ideas.</p>
          </button>
          <button onClick={() => inputRef.current?.click()} className="rounded-3xl border p-5 text-left hover:-translate-y-0.5 transition-all" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <FileUp className="w-7 h-7 mb-4 text-emerald-500" />
            <h2 className="font-black" style={{ color: 'var(--text)' }}>Import Backup</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Restore a previous Zynapse JSON backup.</p>
          </button>
          <button onClick={clearLearningData} className="rounded-3xl border p-5 text-left hover:-translate-y-0.5 transition-all" style={{ background: 'var(--bg-surface)', borderColor: 'rgba(239,68,68,0.25)', boxShadow: 'var(--card-shadow)' }}>
            <Trash2 className="w-7 h-7 mb-4 text-red-500" />
            <h2 className="font-black" style={{ color: 'var(--text)' }}>Clear Learning Data</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Reset progress and generated assets while keeping API credentials.</p>
          </button>
        </div>

        <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={importData} />

        <section className="rounded-3xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="font-black" style={{ color: 'var(--text)' }}>Stored keys</h2>
            <button onClick={() => setMessage(`Found ${allZynapseKeys().length} stored keys.`)} className="ml-auto text-xs font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {keys.map(key => (
              <div key={key} className="rounded-xl border px-3 py-2 text-xs font-mono truncate" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                {key}
              </div>
            ))}
          </div>
          {message && <p className="mt-4 text-sm font-bold" style={{ color: 'var(--primary-light)' }}>{message}</p>}
        </section>
      </div>
    </div>
  );
}
