import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, GraduationCap, Loader2, PlayCircle, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { curriculum } from '../data/curriculum';
import { streamContent } from '../services/geminiService';

function allTopics() {
  return curriculum.flatMap(module =>
    module.sections.flatMap(section =>
      section.topics.map(topic => ({ id: topic.id, title: topic.title, moduleTitle: module.title, sectionTitle: section.title }))
    )
  );
}

export function GuidedTutor() {
  const topics = useMemo(allTopics, []);
  const [topicId, setTopicId] = useState(topics[0]?.id ?? '');
  const [mode, setMode] = useState<'simple' | 'deep' | 'interview'>('simple');
  const [lesson, setLesson] = useState('');
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const topic = topics.find(t => t.id === topicId) ?? topics[0];

  const generateLesson = async () => {
    if (!topic) return;
    setLoading(true);
    setLesson('');
    const prompt = `You are Zynapse Guided Tutor. Teach "${topic.title}" from ${topic.moduleTitle}.
Mode: ${mode}

Create a guided lesson in markdown with exactly:
## Concept
## Mental Model
## Example
## Checkpoint Question
## Mini Exercise
## Common Mistakes

Keep it practical, clear, and mentor-like.`;
    try {
      let text = '';
      for await (const chunk of streamContent([{ role: 'user', content: prompt }])) {
        text += chunk;
        setLesson(text);
      }
    } catch (err) {
      setLesson(`Could not generate lesson. ${err instanceof Error ? err.message : ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-6xl mx-auto p-5 lg:p-8">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.25)', color: 'var(--primary-light)' }}>
            <GraduationCap className="w-3.5 h-3.5" />
            Guided Tutor
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Learn one concept step by step</h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Pick any curriculum topic and Zynapse turns it into a structured mentor session.
          </p>
        </header>

        <div className="grid lg:grid-cols-[340px_1fr] gap-5">
          <aside className="rounded-3xl border p-5 h-fit" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Topic</span>
              <select value={topicId} onChange={e => setTopicId(e.target.value)}
                className="mt-2 w-full px-3 py-3 rounded-xl border text-sm font-bold outline-none"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </label>

            <div className="mt-4">
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Mode</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['simple', 'deep', 'interview'] as const).map(item => (
                  <button key={item} onClick={() => setMode(item)}
                    className="px-3 py-2 rounded-xl border text-xs font-black capitalize"
                    style={{
                      background: mode === item ? 'rgba(99,102,241,0.18)' : 'var(--bg-card)',
                      borderColor: mode === item ? 'var(--primary)' : 'var(--border)',
                      color: mode === item ? 'var(--primary-light)' : 'var(--text-muted)',
                    }}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generateLesson} disabled={loading}
              className="mt-5 w-full px-4 py-3 rounded-xl text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,var(--primary),#4f46e5)' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Teaching...' : 'Start Guided Lesson'}
            </button>

            <div className="mt-5 rounded-2xl border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Session checklist</p>
              {['Understand concept', 'Run example mentally', 'Answer checkpoint', 'Do mini exercise'].map(item => (
                <button key={item} onClick={() => setChecked(prev => ({ ...prev, [item]: !prev[item] }))}
                  className="w-full flex items-center gap-2 py-1.5 text-left text-sm"
                  style={{ color: checked[item] ? 'var(--success)' : 'var(--text-muted)' }}>
                  <CheckCircle2 className="w-4 h-4" />
                  {item}
                </button>
              ))}
            </div>
          </aside>

          <main className="rounded-3xl border min-h-[560px] overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
              <BookOpen className="w-5 h-5" style={{ color: 'var(--primary-light)' }} />
              <div>
                <h2 className="font-black" style={{ color: 'var(--text)' }}>{topic?.title || 'Select a topic'}</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{topic?.moduleTitle} · {topic?.sectionTitle}</p>
              </div>
            </div>
            <div className="p-5 lg:p-7">
              {!lesson && !loading ? (
                <div className="min-h-[420px] flex items-center justify-center text-center">
                  <div className="max-w-md">
                    <PlayCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--primary-light)' }} />
                    <h3 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Ready when you are</h3>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Start a guided lesson to get a concept explanation, mental model, checkpoint, and mini exercise.</p>
                  </div>
                </div>
              ) : (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson || 'Preparing your lesson...'}</ReactMarkdown>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
