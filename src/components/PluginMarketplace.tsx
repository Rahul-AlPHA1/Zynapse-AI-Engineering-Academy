import { useState } from 'react';
import { Blocks, CheckCircle2, Download, Plug, ToggleLeft, ToggleRight } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

const KEY = 'ZYNAPSE_PLUGINS';
const DEFAULT_PLUGINS: Plugin[] = [
  { id: 'github-portfolio', name: 'GitHub Portfolio Export', description: 'Format portfolio output for GitHub profiles and pinned repositories.', category: 'Export', enabled: true },
  { id: 'mentor-rubrics', name: 'Mentor Rubrics', description: 'Adds stricter scoring language for interviews and code reviews.', category: 'Practice', enabled: false },
  { id: 'offline-first', name: 'Offline First Pack', description: 'Prioritizes cached curriculum and local AI workflows.', category: 'System', enabled: true },
  { id: 'startup-projects', name: 'Startup Project Ideas', description: 'Biases project generation toward SaaS/product ideas.', category: 'Projects', enabled: false },
];

function loadPlugins(): Plugin[] {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') || DEFAULT_PLUGINS; } catch { return DEFAULT_PLUGINS; }
}

export function PluginMarketplace() {
  const [plugins, setPlugins] = useState<Plugin[]>(loadPlugins);
  const [manifest, setManifest] = useState('');

  const save = (items: Plugin[]) => {
    setPlugins(items);
    localStorage.setItem(KEY, JSON.stringify(items));
  };

  const toggle = (id: string) => save(plugins.map(plugin => plugin.id === id ? { ...plugin, enabled: !plugin.enabled } : plugin));

  const importPlugin = () => {
    try {
      const parsed = JSON.parse(manifest) as Partial<Plugin>;
      if (!parsed.id || !parsed.name) throw new Error('Plugin manifest needs id and name.');
      save([{ id: parsed.id, name: parsed.name, description: parsed.description || 'Custom local plugin.', category: parsed.category || 'Custom', enabled: true }, ...plugins.filter(p => p.id !== parsed.id)]);
      setManifest('');
    } catch (err) {
      setManifest(`Invalid JSON: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'var(--border)', color: 'var(--primary-light)' }}>
            <Plug className="w-3.5 h-3.5" />
            Plugin Marketplace
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Extend Zynapse locally</h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>Manage local plugin manifests that can influence workflows, exports, and AI instructions.</p>
        </header>

        <div className="grid xl:grid-cols-[1fr_380px] gap-5">
          <main className="grid md:grid-cols-2 gap-4">
            {plugins.map(plugin => (
              <div key={plugin.id} className="rounded-3xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,var(--primary),var(--accent))' }}>
                    <Blocks className="w-5 h-5" />
                  </div>
                  <button onClick={() => toggle(plugin.id)} style={{ color: plugin.enabled ? 'var(--success)' : 'var(--text-muted)' }}>
                    {plugin.enabled ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                  </button>
                </div>
                <h2 className="mt-4 font-black text-lg" style={{ color: 'var(--text)' }}>{plugin.name}</h2>
                <p className="mt-1 text-sm min-h-12" style={{ color: 'var(--text-muted)' }}>{plugin.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)' }}>{plugin.category}</span>
                  {plugin.enabled && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Enabled</span>}
                </div>
              </div>
            ))}
          </main>

          <aside className="rounded-3xl border p-5 h-fit" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <h2 className="font-black text-lg mb-3" style={{ color: 'var(--text)' }}>Import Manifest</h2>
            <textarea value={manifest} onChange={e => setManifest(e.target.value)} rows={10}
              className="w-full rounded-2xl border p-4 font-mono text-xs outline-none"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder='{"id":"my-plugin","name":"My Plugin","description":"What it does","category":"Custom"}' />
            <button onClick={importPlugin} className="mt-4 w-full px-4 py-3 rounded-xl text-white font-black flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,var(--primary),#4f46e5)' }}>
              <Download className="w-4 h-4" /> Import Plugin
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
