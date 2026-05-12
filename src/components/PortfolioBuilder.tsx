import { useMemo, useState } from 'react';
import { Copy, Download, FileText, Loader2, Sparkles, UserRound } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { curriculum } from '../data/curriculum';
import { streamContent } from '../services/geminiService';

function readArray(key: string, legacy?: string): string[] {
  try {
    const raw = localStorage.getItem(key) ?? (legacy ? localStorage.getItem(legacy) : null);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function PortfolioBuilder() {
  const [name, setName] = useState('Your Name');
  const [role, setRole] = useState('Software Engineer');
  const [summary, setSummary] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const completed = useMemo(() => new Set(readArray('ZYNAPSE_COMPLETED_TOPICS', 'AURA_COMPLETED_TOPICS')), []);
  const savedIdeas = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ZYNAPSE_SAVED_IDEAS') || '[]'); } catch { return []; }
  }, []);
  const completedTitles = useMemo(() => curriculum.flatMap(m => m.sections.flatMap(s => s.topics.filter(t => completed.has(t.id)).map(t => `${m.title}: ${t.title}`))).slice(0, 60), [completed]);

  const generate = async () => {
    setLoading(true);
    setMarkdown('');
    const prompt = `Create a polished developer portfolio/resume markdown for:
Name: ${name}
Target role: ${role}
Personal summary: ${summary || 'Not provided'}
Completed Zynapse topics: ${completedTitles.join(', ') || 'No completed topics yet'}
Saved project ideas: ${JSON.stringify(savedIdeas).slice(0, 4000)}

Return markdown with:
# Name
## Profile
## Core Skills
## Project Portfolio
## Learning Highlights
## Interview Strengths
## Next Steps
Make it honest, concise, and GitHub README friendly.`;
    try {
      let text = '';
      for await (const chunk of streamContent([{ role: 'user', content: prompt }])) {
        text += chunk;
        setMarkdown(text);
      }
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-') || 'portfolio'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.25)', color: 'var(--primary-light)' }}>
            <FileText className="w-3.5 h-3.5" />
            Portfolio Builder
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Turn progress into proof</h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>Generate a GitHub-ready profile from your Zynapse progress and saved project ideas.</p>
        </header>

        <div className="grid lg:grid-cols-[360px_1fr] gap-5">
          <aside className="rounded-3xl border p-5 h-fit" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Name</span>
                <input value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full px-3 py-3 rounded-xl border outline-none"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Target Role</span>
                <input value={role} onChange={e => setRole(e.target.value)} className="mt-2 w-full px-3 py-3 rounded-xl border outline-none"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Personal Summary</span>
                <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={5} className="mt-2 w-full px-3 py-3 rounded-xl border outline-none resize-y"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border p-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <p className="text-2xl font-black" style={{ color: 'var(--text)' }}>{completedTitles.length}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>completed topics</p>
                </div>
                <div className="rounded-2xl border p-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <p className="text-2xl font-black" style={{ color: 'var(--text)' }}>{savedIdeas.length}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>saved ideas</p>
                </div>
              </div>
              <button onClick={generate} disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,var(--primary),#4f46e5)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Portfolio
              </button>
            </div>
          </aside>

          <main className="rounded-3xl border overflow-hidden min-h-[640px]" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-black flex items-center gap-2" style={{ color: 'var(--text)' }}><UserRound className="w-5 h-5" /> Preview</h2>
              {markdown && (
                <div className="flex items-center gap-2">
                  <button onClick={() => navigator.clipboard.writeText(markdown)} className="px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <button onClick={download} className="px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              )}
            </div>
            <div className="p-5 lg:p-7 markdown-body">
              {markdown ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown> : <p style={{ color: 'var(--text-muted)' }}>Generate a portfolio to preview it here.</p>}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
