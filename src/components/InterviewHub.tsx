import { useState, useMemo } from 'react';
import { Search, ChevronRight, Briefcase, Star, Filter, MessageSquare } from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { cn } from '../lib/utils';

interface InterviewHubProps {
  onSelectTopic: (topicId: string) => void;
  language: string;
}

interface InterviewEntry {
  topicId: string;
  topicTitle: string;
  moduleId: string;
  moduleTitle: string;
  sectionId: string;
  sectionTitle: string;
}

function buildInterviewIndex(): InterviewEntry[] {
  const entries: InterviewEntry[] = [];
  for (const module of curriculum) {
    for (const section of module.sections) {
      for (const topic of section.topics) {
        const t = topic.title.toLowerCase();
        const i = topic.id.toLowerCase();
        if (t.includes('interview') || i.includes('interview') || t.includes('q&a') || t.includes('faq')) {
          entries.push({
            topicId: topic.id,
            topicTitle: topic.title,
            moduleId: module.id,
            moduleTitle: module.title,
            sectionId: section.id,
            sectionTitle: section.title,
          });
        }
      }
    }
  }
  return entries;
}

interface SectionGroup {
  sectionId: string;
  sectionTitle: string;
  topics: InterviewEntry[];
}

interface ModuleGroup {
  moduleId: string;
  moduleTitle: string;
  sections: SectionGroup[];
  totalTopics: number;
}

function groupByModuleAndSection(entries: InterviewEntry[]): ModuleGroup[] {
  const moduleMap = new Map<string, ModuleGroup>();
  for (const e of entries) {
    if (!moduleMap.has(e.moduleId)) {
      moduleMap.set(e.moduleId, { moduleId: e.moduleId, moduleTitle: e.moduleTitle, sections: [], totalTopics: 0 });
    }
    const mg = moduleMap.get(e.moduleId)!;
    let sg = mg.sections.find(s => s.sectionId === e.sectionId);
    if (!sg) {
      sg = { sectionId: e.sectionId, sectionTitle: e.sectionTitle, topics: [] };
      mg.sections.push(sg);
    }
    sg.topics.push(e);
    mg.totalTopics++;
  }
  return [...moduleMap.values()];
}

function groupByModuleFlat(entries: InterviewEntry[]) {
  const map = new Map<string, { moduleId: string; moduleTitle: string; count: number }>();
  for (const e of entries) {
    if (!map.has(e.moduleId)) map.set(e.moduleId, { moduleId: e.moduleId, moduleTitle: e.moduleTitle, count: 0 });
    map.get(e.moduleId)!.count++;
  }
  return [...map.values()];
}

const ALL_INTERVIEWS = buildInterviewIndex();

const CATEGORY_COLORS: Record<string, string> = {
  Java: '#f59e0b', JavaScript: '#facc15', Python: '#3b82f6', React: '#22d3ee',
  Node: '#34d399', Docker: '#38bdf8', AWS: '#fb923c', Go: '#06b6d4',
  Rust: '#ef4444', System: '#a78bfa', Database: '#8b5cf6', DSA: '#ec4899',
  Microservice: '#f97316', REST: '#6366f1', Spring: '#84cc16', TypeScript: '#6366f1',
  Linux: '#94a3b8', Machine: '#c084fc', Prompt: '#e879f9', Agentic: '#e879f9',
};
function getColor(title: string): string {
  for (const [k, v] of Object.entries(CATEGORY_COLORS)) {
    if (title.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return '#818cf8';
}

export function InterviewHub({ onSelectTopic }: InterviewHubProps) {
  const [query, setQuery] = useState('');
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_INTERVIEWS;
    const q = query.toLowerCase();
    return ALL_INTERVIEWS.filter(e =>
      e.topicTitle.toLowerCase().includes(q) ||
      e.moduleTitle.toLowerCase().includes(q) ||
      e.sectionTitle.toLowerCase().includes(q)
    );
  }, [query]);

  const moduleGroups = useMemo(() => groupByModuleAndSection(filtered), [filtered]);
  const sidebarModules = useMemo(() => groupByModuleFlat(ALL_INTERVIEWS), []);
  const shown = activeModule ? moduleGroups.filter(g => g.moduleId === activeModule) : moduleGroups;

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-void)' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl border border-amber-500/30" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <Briefcase className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Interview Questions Hub</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {ALL_INTERVIEWS.length} questions across {sidebarModules.length} technologies · AI-powered streaming answers
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search technology, topic, or section…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — module filter */}
        <div className="w-56 shrink-0 flex flex-col overflow-y-auto py-3 px-2 gap-0.5 border-r"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          <p className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}>
            <Filter className="w-3 h-3" /> Filter by Tech
          </p>
          <button
            onClick={() => setActiveModule(null)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all border',
              activeModule === null ? 'border-indigo-500/30' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
            )}
            style={activeModule === null ? {
              background: 'rgba(99,102,241,0.12)', color: '#818cf8',
            } : { color: 'var(--text-muted)' }}
          >
            All Technologies ({ALL_INTERVIEWS.length})
          </button>
          {sidebarModules.map(m => {
            const color = getColor(m.moduleTitle);
            const active = activeModule === m.moduleId;
            return (
              <button
                key={m.moduleId}
                onClick={() => setActiveModule(active ? null : m.moduleId)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-xs transition-all border',
                  !active && 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                )}
                style={active ? { background: `${color}15`, borderColor: `${color}40`, color } : { color: 'var(--text-muted)' }}
              >
                <span className="truncate block font-semibold">{m.moduleTitle}</span>
                <span className="text-[10px] opacity-60">{m.count} topics</span>
              </button>
            );
          })}
        </div>

        {/* Right — module → section → topics */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {shown.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
              <Briefcase className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No interview topics found</p>
            </div>
          )}

          {shown.map(module => {
            const color = getColor(module.moduleTitle);
            return (
              <div key={module.moduleId} className="rounded-2xl border overflow-hidden"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                {/* Module header */}
                <div className="px-5 py-3.5 border-b flex items-center gap-3"
                  style={{ borderColor: 'var(--border)', background: `${color}0a` }}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{module.moduleTitle}</h3>
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                    {module.totalTopics} topics
                  </span>
                </div>

                {/* Sections */}
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {module.sections.map(section => (
                    <div key={section.sectionId} className="p-4">
                      {/* Section label — only show if module has multiple sections */}
                      {module.sections.length > 1 && (
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3 px-1"
                          style={{ color: 'var(--text-muted)' }}>
                          {section.sectionTitle}
                        </p>
                      )}
                      <div className="space-y-1">
                        {section.topics.map(entry => (
                          <button
                            key={entry.topicId}
                            onClick={() => onSelectTopic(entry.topicId)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group border border-transparent hover:border-current/20"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = `${color}0d`;
                              (e.currentTarget as HTMLElement).style.borderColor = `${color}30`;
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                              (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                            }}
                          >
                            <div className="p-1.5 rounded-lg shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                              style={{ background: `${color}18` }}>
                              <Star className="w-3 h-3" style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate transition-colors" style={{ color: 'var(--text)' }}>
                                {entry.topicTitle}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <MessageSquare className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" style={{ color }} />
                              <ChevronRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
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
