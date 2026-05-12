import { useState } from 'react';
import { Code2, Loader2, Play, Sparkles, Target, Trophy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { streamContent } from '../services/geminiService';

const LANGS = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export function CodeChallengeArena() {
  const [language, setLanguage] = useState('JavaScript');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [topic, setTopic] = useState('arrays and data structures');
  const [challenge, setChallenge] = useState('');
  const [solution, setSolution] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const generate = async () => {
    setLoading(true);
    setChallenge('');
    setFeedback('');
    const prompt = `Create one ${difficulty} ${language} coding challenge about ${topic}.
Return markdown with:
## Problem
## Input / Output
## Constraints
## Examples
## Starter Code
## Hidden Test Ideas
Keep it practical and solvable in 20-40 minutes.`;
    try {
      let text = '';
      for await (const chunk of streamContent([{ role: 'user', content: prompt }])) {
        text += chunk;
        setChallenge(text);
      }
    } finally {
      setLoading(false);
    }
  };

  const evaluate = async () => {
    if (!solution.trim()) return;
    setChecking(true);
    setFeedback('');
    const prompt = `Evaluate this ${language} solution for the challenge below.

Challenge:
${challenge}

Solution:
\`\`\`${language}
${solution}
\`\`\`

Return markdown:
## Score
X/10
## Correctness
## Complexity
## Bugs / Edge Cases
## Improved Solution`;
    try {
      let text = '';
      for await (const chunk of streamContent([{ role: 'user', content: prompt }])) {
        text += chunk;
        setFeedback(text);
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.25)', color: 'var(--primary-light)' }}>
            <Target className="w-3.5 h-3.5" />
            Code Challenge Arena
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Practice like a real interview</h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>Generate a challenge, solve it, and get AI feedback on correctness, complexity, and edge cases.</p>
        </header>

        <div className="rounded-3xl border p-4 mb-5 grid md:grid-cols-[1fr_180px_180px_auto] gap-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            className="px-3 py-3 rounded-xl border text-sm outline-none"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}
            placeholder="Topic e.g. recursion, APIs, SQL joins" />
          <select value={language} onChange={e => setLanguage(e.target.value)}
            className="px-3 py-3 rounded-xl border text-sm font-bold outline-none"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            {LANGS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
            className="px-3 py-3 rounded-xl border text-sm font-bold outline-none"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          <button onClick={generate} disabled={loading}
            className="px-5 py-3 rounded-xl text-white font-black flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,var(--primary),#4f46e5)' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate
          </button>
        </div>

        <div className="grid xl:grid-cols-2 gap-5">
          <section className="rounded-3xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <Code2 className="w-5 h-5" style={{ color: 'var(--primary-light)' }} />
              <h2 className="font-black" style={{ color: 'var(--text)' }}>Challenge</h2>
            </div>
            <div className="p-5 markdown-body min-h-[460px]">
              {challenge ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{challenge}</ReactMarkdown> : <p style={{ color: 'var(--text-muted)' }}>Generate a challenge to begin.</p>}
            </div>
          </section>

          <section className="rounded-3xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-black flex items-center gap-2" style={{ color: 'var(--text)' }}><Trophy className="w-5 h-5 text-yellow-500" /> Your Solution</h2>
              <button onClick={evaluate} disabled={checking || !solution.trim() || !challenge}
                className="px-3 py-2 rounded-xl text-xs text-white font-black flex items-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,var(--success),#059669)' }}>
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Evaluate
              </button>
            </div>
            <textarea value={solution} onChange={e => setSolution(e.target.value)}
              className="w-full min-h-[240px] p-5 resize-y border-b outline-none font-mono text-sm"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder={`Write your ${language} solution here...`} />
            <div className="p-5 markdown-body min-h-[220px]">
              {feedback ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown> : <p style={{ color: 'var(--text-muted)' }}>Submit your solution to get a structured review.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
