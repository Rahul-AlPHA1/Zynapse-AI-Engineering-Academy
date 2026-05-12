import { useMemo } from 'react';
import { ArrowRight, Bookmark, Brain, CheckCircle2, Compass, Lightbulb, Sparkles, Target } from 'lucide-react';
import { curriculum } from '../data/curriculum';

interface SmartRecommendationsProps {
  onSelectTopic: (id: string) => void;
}

const completedKey = 'ZYNAPSE_COMPLETED_TOPICS';
const bookmarksKey = 'ZYNAPSE_BOOKMARKS';

function readArray(key: string, legacy?: string): string[] {
  try {
    const raw = localStorage.getItem(key) ?? (legacy ? localStorage.getItem(legacy) : null);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function isLearnTopic(title: string, id: string) {
  const text = `${title} ${id}`.toLowerCase();
  return !text.includes('quiz') && !text.includes('interview');
}

export function SmartRecommendations({ onSelectTopic }: SmartRecommendationsProps) {
  const data = useMemo(() => {
    const completed = new Set(readArray(completedKey, 'AURA_COMPLETED_TOPICS'));
    const bookmarks = new Set(readArray(bookmarksKey, 'AURA_BOOKMARKS'));
    const flat = curriculum.flatMap((module, moduleIndex) =>
      module.sections.flatMap((section, sectionIndex) =>
        section.topics
          .filter(topic => isLearnTopic(topic.title, topic.id))
          .map((topic, topicIndex) => ({ module, section, topic, moduleIndex, sectionIndex, topicIndex }))
      )
    );
    const next = flat.filter(item => !completed.has(item.topic.id)).slice(0, 8);
    const bookmarked = flat.filter(item => bookmarks.has(item.topic.id) && !completed.has(item.topic.id)).slice(0, 5);
    const moduleStats = curriculum.map(module => {
      const topics = module.sections.flatMap(section => section.topics.filter(topic => isLearnTopic(topic.title, topic.id)));
      const done = topics.filter(topic => completed.has(topic.id)).length;
      return { module, total: topics.length, done, pct: topics.length ? Math.round((done / topics.length) * 100) : 0 };
    }).filter(m => m.total > 0);
    const almostDone = moduleStats.filter(m => m.pct > 0 && m.pct < 100).sort((a, b) => b.pct - a.pct).slice(0, 4);
    const weakStarts = moduleStats.filter(m => m.pct === 0).slice(0, 4);
    return { completed, next, bookmarked, almostDone, weakStarts, total: flat.length };
  }, []);

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <div className="mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.25)', color: 'var(--primary-light)' }}>
            <Compass className="w-3.5 h-3.5" />
            Smart Recommendations
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Your best next move</h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Zynapse looks at completed topics, bookmarks, and curriculum order to suggest what to study next.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_.9fr] gap-5">
          <section className="rounded-3xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black text-xl" style={{ color: 'var(--text)' }}>Recommended Queue</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{data.completed.size}/{data.total} learnable topics completed</p>
              </div>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--primary-light)' }} />
            </div>
            <div className="space-y-2">
              {data.next.map((item, index) => (
                <button key={item.topic.id} onClick={() => onSelectTopic(item.topic.id)}
                  className="w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg,var(--primary),#4f46e5)' }}>
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate" style={{ color: 'var(--text)' }}>{item.topic.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.module.title} · {item.section.title}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-3xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
              <h2 className="font-black text-lg flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Bookmark className="w-5 h-5 text-yellow-500" />
                Saved but unfinished
              </h2>
              <div className="mt-4 space-y-2">
                {data.bookmarked.length ? data.bookmarked.map(item => (
                  <button key={item.topic.id} onClick={() => onSelectTopic(item.topic.id)}
                    className="w-full p-3 rounded-xl border text-left"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>{item.topic.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.module.title}</p>
                  </button>
                )) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No unfinished bookmarks yet.</p>}
              </div>
            </section>

            <section className="rounded-3xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
              <h2 className="font-black text-lg flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Target className="w-5 h-5" style={{ color: 'var(--primary-light)' }} />
                Finish these modules
              </h2>
              <div className="mt-4 space-y-3">
                {data.almostDone.map(({ module, pct, done, total }) => (
                  <div key={module.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold" style={{ color: 'var(--text)' }}>{module.title}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{done}/{total}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--primary),var(--accent))' }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
              <h2 className="font-black text-lg flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Brain className="w-5 h-5 text-fuchsia-500" />
                New domains to unlock
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {data.weakStarts.map(({ module }) => (
                  <div key={module.id} className="rounded-xl border p-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <CheckCircle2 className="w-4 h-4 mb-2" style={{ color: 'var(--text-subtle)' }} />
                    <p className="text-xs font-bold leading-snug" style={{ color: 'var(--text)' }}>{module.title}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
