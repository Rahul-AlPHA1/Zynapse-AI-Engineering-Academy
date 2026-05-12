import { useState, useMemo } from 'react';
import { Search, ChevronRight, GraduationCap, Zap, Target, BookOpen, Filter, Trophy } from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { cn } from '../lib/utils';

interface QuizHubProps {
  onSelectTopic: (topicId: string) => void;
}

type Level = 'beginner' | 'intermediate' | 'advanced';

interface QuizEntry {
  topicId: string;
  topicTitle: string;
  moduleId: string;
  moduleTitle: string;
  sectionId: string;
  sectionTitle: string;
  level: Level;
}

function detectLevel(title: string): Level {
  const t = title.toLowerCase();
  if (t.includes('advanced') || t.includes('expert')) return 'advanced';
  if (t.includes('intermediate')) return 'intermediate';
  return 'beginner';
}

function buildQuizIndex(): QuizEntry[] {
  const entries: QuizEntry[] = [];
  for (const module of curriculum) {
    for (const section of module.sections) {
      for (const topic of section.topics) {
        const t = topic.title.toLowerCase();
        const i = topic.id.toLowerCase();
        if (t.includes('quiz') || i.includes('quiz')) {
          entries.push({
            topicId: topic.id,
            topicTitle: topic.title,
            moduleId: module.id,
            moduleTitle: module.title,
            sectionId: section.id,
            sectionTitle: section.title,
            level: detectLevel(topic.title),
          });
        }
      }
    }
  }
  return entries;
}

interface ModuleQuizGroup {
  moduleId: string;
  moduleTitle: string;
  beginner: QuizEntry | null;
  intermediate: QuizEntry | null;
  advanced: QuizEntry | null;
  extra: QuizEntry[];
}

function groupByModule(entries: QuizEntry[]): ModuleQuizGroup[] {
  const map = new Map<string, ModuleQuizGroup>();
  for (const e of entries) {
    if (!map.has(e.moduleId)) {
      map.set(e.moduleId, { moduleId: e.moduleId, moduleTitle: e.moduleTitle, beginner: null, intermediate: null, advanced: null, extra: [] });
    }
    const g = map.get(e.moduleId)!;
    if (e.level === 'beginner' && !g.beginner) g.beginner = e;
    else if (e.level === 'intermediate' && !g.intermediate) g.intermediate = e;
    else if (e.level === 'advanced' && !g.advanced) g.advanced = e;
    else g.extra.push(e);
  }
  return [...map.values()];
}

const ALL_QUIZZES = buildQuizIndex();

const LEVEL_META: Record<Level, { label: string; color: string; bg: string; border: string; Icon: React.ElementType; desc: string }> = {
  beginner:     { label: 'Beginner',     color: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.25)',  Icon: BookOpen, desc: 'Core concepts & fundamentals' },
  intermediate: { label: 'Intermediate', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.25)',  Icon: Target,   desc: 'Applied knowledge & patterns' },
  advanced:     { label: 'Advanced',     color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.25)', Icon: Zap,      desc: 'Expert-level & edge cases' },
};

const MODULE_COLORS: Record<string, string> = {
  Java: '#f59e0b', JavaScript: '#facc15', Python: '#3b82f6', React: '#22d3ee',
  Node: '#34d399', Docker: '#38bdf8', AWS: '#fb923c', Go: '#06b6d4',
  Rust: '#ef4444', System: '#a78bfa', Database: '#8b5cf6', DSA: '#ec4899',
  Micro: '#f97316', REST: '#6366f1', Spring: '#84cc16', TypeScript: '#6366f1',
  Linux: '#94a3b8', Prompt: '#e879f9', Agentic: '#e879f9', Machine: '#c084fc',
  RAG: '#38bdf8', Flutter: '#22d3ee', Kotlin: '#a855f7',
};
function getColor(title: string) {
  for (const [k, v] of Object.entries(MODULE_COLORS)) {
    if (title.includes(k)) return v;
  }
  return '#818cf8';
}

export function QuizHub({ onSelectTopic }: QuizHubProps) {
  const [query, setQuery]               = useState('');
  const [levelFilter, setLevelFilter]   = useState<Level | 'all'>('all');
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = ALL_QUIZZES;
    if (levelFilter !== 'all') list = list.filter(e => e.level === levelFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(e =>
        e.topicTitle.toLowerCase().includes(q) ||
        e.moduleTitle.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, levelFilter]);

  const moduleGroups = useMemo(() => groupByModule(filtered), [filtered]);
  const allModuleGroups = useMemo(() => groupByModule(ALL_QUIZZES), []);
  const shown = activeModule ? moduleGroups.filter(g => g.moduleId === activeModule) : moduleGroups;

  const totalCounts = useMemo(() => ({
    all: ALL_QUIZZES.length,
    beginner: ALL_QUIZZES.filter(e => e.level === 'beginner').length,
    intermediate: ALL_QUIZZES.filter(e => e.level === 'intermediate').length,
    advanced: ALL_QUIZZES.filter(e => e.level === 'advanced').length,
  }), []);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-void)' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl border border-indigo-500/30" style={{ background: 'rgba(99,102,241,0.12)' }}>
            <GraduationCap className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Quiz Practice Hub</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {ALL_QUIZZES.length} quizzes · 50 questions each · AI-generated & graded instantly
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search module or quiz…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
          {/* Level filter pills */}
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(lvl => {
            const meta = lvl === 'all' ? null : LEVEL_META[lvl];
            const active = levelFilter === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap"
                style={active && meta
                  ? { background: meta.bg, borderColor: meta.border, color: meta.color }
                  : active
                  ? { background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.4)', color: '#818cf8' }
                  : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                }
              >
                {lvl === 'all' ? `All (${totalCounts.all})` : `${meta!.label} (${totalCounts[lvl]})`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — module filter */}
        <div className="w-56 shrink-0 flex flex-col overflow-y-auto py-3 px-2 gap-0.5 border-r"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          <p className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}>
            <Filter className="w-3 h-3" /> By Module
          </p>
          <button
            onClick={() => setActiveModule(null)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all border',
              activeModule === null ? 'border-indigo-500/30' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
            )}
            style={activeModule === null ? { background: 'rgba(99,102,241,0.12)', color: '#818cf8' } : { color: 'var(--text-muted)' }}
          >
            All Modules ({allModuleGroups.length})
          </button>
          {allModuleGroups.map(g => {
            const color = getColor(g.moduleTitle);
            const active = activeModule === g.moduleId;
            const count = (g.beginner ? 1 : 0) + (g.intermediate ? 1 : 0) + (g.advanced ? 1 : 0) + g.extra.length;
            return (
              <button
                key={g.moduleId}
                onClick={() => setActiveModule(active ? null : g.moduleId)}
                className={cn('w-full text-left px-3 py-2 rounded-lg text-xs transition-all border', !active && 'border-transparent hover:bg-black/5 dark:hover:bg-white/5')}
                style={active ? { background: `${color}15`, borderColor: `${color}40`, color } : { color: 'var(--text-muted)' }}
              >
                <span className="truncate block font-semibold">{g.moduleTitle}</span>
                <span className="text-[10px] opacity-60">{count} quizzes</span>
              </button>
            );
          })}
        </div>

        {/* Right — module cards with level sections */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {shown.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
              <GraduationCap className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No quizzes match the filter</p>
            </div>
          )}

          {shown.map(module => {
            const modColor = getColor(module.moduleTitle);
            const levels: Level[] = ['beginner', 'intermediate', 'advanced'];

            return (
              <div key={module.moduleId} className="rounded-2xl border overflow-hidden"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                {/* Module header */}
                <div className="px-5 py-3.5 border-b flex items-center gap-3"
                  style={{ borderColor: 'var(--border)', background: `${modColor}0a` }}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: modColor }} />
                  <h3 className="text-sm font-bold flex-1" style={{ color: 'var(--text)' }}>{module.moduleTitle}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold"
                    style={{ color: modColor }}>
                    <Trophy className="w-3 h-3" />
                    <span>3 levels</span>
                  </div>
                </div>

                {/* Level cards — 3 columns */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {levels.map(lvl => {
                    const meta = LEVEL_META[lvl];
                    const Icon = meta.Icon;
                    const entry = module[lvl];

                    if (!entry) return (
                      <div key={lvl} className="rounded-xl border p-4 opacity-30"
                        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4" style={{ color: meta.color }} />
                          <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Not available</p>
                      </div>
                    );

                    return (
                      <button
                        key={lvl}
                        onClick={() => onSelectTopic(entry.topicId)}
                        className="rounded-xl border p-4 text-left transition-all group hover:scale-[1.02] active:scale-[0.99]"
                        style={{ borderColor: meta.border, background: meta.bg }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${meta.color}20`;
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                        }}
                      >
                        {/* Level badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-4 h-4" style={{ color: meta.color }} />
                            <span className="text-xs font-black uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-80 transition-opacity" style={{ color: meta.color }} />
                        </div>

                        {/* Description */}
                        <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>{meta.desc}</p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: `${meta.color}25` }}>
                          <span className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>50 Questions</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: `${meta.color}20`, color: meta.color }}>
                            AI Graded
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Extra quizzes beyond the 3 tiers */}
                  {module.extra.map(entry => (
                    <button
                      key={entry.topicId}
                      onClick={() => onSelectTopic(entry.topicId)}
                      className="rounded-xl border p-4 text-left transition-all group hover:scale-[1.02]"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                    >
                      <p className="text-xs font-semibold mb-2 truncate" style={{ color: 'var(--text)' }}>{entry.topicTitle}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>50 questions</span>
                        <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
