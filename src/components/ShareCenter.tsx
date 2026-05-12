import { useMemo, useState } from 'react';
import { Copy, Share2, Sparkles } from 'lucide-react';
import { curriculum } from '../data/curriculum';

function readArray(key: string, legacy?: string): string[] {
  try {
    const raw = localStorage.getItem(key) ?? (legacy ? localStorage.getItem(legacy) : null);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function ShareCenter() {
  const [copied, setCopied] = useState(false);
  const stats = useMemo(() => {
    const completed = new Set(readArray('ZYNAPSE_COMPLETED_TOPICS', 'AURA_COMPLETED_TOPICS'));
    const total = curriculum.flatMap(m => m.sections.flatMap(s => s.topics)).filter(t => {
      const text = `${t.id} ${t.title}`.toLowerCase();
      return !text.includes('quiz') && !text.includes('interview');
    }).length;
    const gam = JSON.parse(localStorage.getItem('ZYNAPSE_GAMIFICATION') ?? localStorage.getItem('AURA_GAMIFICATION') ?? '{"xp":0,"streak":0}');
    return { completed: completed.size, total, xp: gam.xp || 0, streak: gam.streak || 0 };
  }, []);

  const markdown = `# My Zynapse Progress

- Completed topics: ${stats.completed}/${stats.total}
- XP: ${stats.xp}
- Streak: ${stats.streak} days
- Focus: AI Engineering Academy

Generated with Zynapse.`;

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-5xl mx-auto p-5 lg:p-8">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'var(--border)', color: 'var(--primary-light)' }}>
            <Share2 className="w-3.5 h-3.5" />
            Share Center
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Share progress beautifully</h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>Generate a clean markdown share card for GitHub, LinkedIn, Discord, or mentor updates.</p>
        </header>

        <div className="grid lg:grid-cols-[1fr_360px] gap-5">
          <section className="rounded-3xl border p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <div className="aspect-[1.9/1] rounded-3xl p-8 relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg,var(--primary),var(--accent))' }}>
              <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 20% 10%, white 0, transparent 26%)' }} />
              <Sparkles className="w-8 h-8 mb-6 relative" />
              <h2 className="text-4xl font-black relative">Zynapse Progress</h2>
              <div className="mt-8 grid grid-cols-3 gap-4 relative">
                <div><p className="text-3xl font-black">{stats.completed}</p><p className="text-sm opacity-80">Topics</p></div>
                <div><p className="text-3xl font-black">{stats.xp}</p><p className="text-sm opacity-80">XP</p></div>
                <div><p className="text-3xl font-black">{stats.streak}</p><p className="text-sm opacity-80">Streak</p></div>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <h2 className="font-black text-lg mb-3" style={{ color: 'var(--text)' }}>Markdown Export</h2>
            <pre className="rounded-2xl border p-4 text-xs whitespace-pre-wrap min-h-64" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>{markdown}</pre>
            <button onClick={copy} className="mt-4 w-full px-4 py-3 rounded-xl text-white font-black flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,var(--primary),#4f46e5)' }}>
              <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Share Card'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
