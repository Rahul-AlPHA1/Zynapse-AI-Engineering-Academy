import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, BookOpen, Code2, Cpu, X, Map, Zap, Brain, BarChart2, Compass,
  Database, Activity, Palette, Cloud, Users, Share2, Plug, ClipboardCheck, Mail,
} from 'lucide-react';
import { curriculum } from '../data/curriculum';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (id: string) => void;
}

interface FlatTopic {
  id: string;
  title: string;
  moduleTitle: string;
  sectionTitle: string;
  moduleId: string;
  kind?: 'topic' | 'action' | 'bookmark' | 'recent';
}

// Flatten all topics once at module level
const ALL_TOPICS: FlatTopic[] = curriculum.flatMap(mod =>
  mod.sections.flatMap(sec =>
    sec.topics.map(t => ({
      id: t.id,
      title: t.title,
      moduleTitle: mod.title,
      sectionTitle: sec.title,
      moduleId: mod.id,
    }))
  )
);

const MODULE_ICON_MAP: Record<string, typeof BookOpen> = {
  'java-mastery': Code2,
  'spring-boot-mastery': Cpu,
};

const QUICK_ACTIONS: FlatTopic[] = [
  { id: 'ROADMAP', title: 'Learning Roadmap', moduleTitle: 'Quick Action', sectionTitle: 'AI stack diagram', moduleId: 'action-roadmap', kind: 'action' },
  { id: 'COMPILER', title: 'Online Compiler', moduleTitle: 'Quick Action', sectionTitle: 'Run code locally/cloud', moduleId: 'action-compiler', kind: 'action' },
  { id: 'GUIDED_TUTOR', title: 'Guided Tutor', moduleTitle: 'Quick Action', sectionTitle: 'AI step-by-step lesson', moduleId: 'action-tutor', kind: 'action' },
  { id: 'CHALLENGE_ARENA', title: 'Code Challenge Arena', moduleTitle: 'Quick Action', sectionTitle: 'Practice coding drills', moduleId: 'action-challenge', kind: 'action' },
  { id: 'RECOMMENDATIONS', title: 'Smart Recommendations', moduleTitle: 'Quick Action', sectionTitle: 'Best next topic', moduleId: 'action-recs', kind: 'action' },
  { id: 'ANALYTICS', title: 'Analytics Dashboard', moduleTitle: 'Quick Action', sectionTitle: 'Progress charts', moduleId: 'action-analytics', kind: 'action' },
  { id: 'DATA_MANAGER', title: 'Data Manager', moduleTitle: 'Quick Action', sectionTitle: 'Export/import backup', moduleId: 'action-data', kind: 'action' },
  { id: 'CLOUD_SYNC', title: 'Cloud Sync', moduleTitle: 'Quick Action', sectionTitle: 'Bring-your-own sync endpoint', moduleId: 'action-cloud-sync', kind: 'action' },
  { id: 'CLASSROOM_MODE', title: 'Classroom Mode', moduleTitle: 'Quick Action', sectionTitle: 'Assignments and cohorts', moduleId: 'action-classroom', kind: 'action' },
  { id: 'SHARE_CENTER', title: 'Share Center', moduleTitle: 'Quick Action', sectionTitle: 'Progress share card', moduleId: 'action-share', kind: 'action' },
  { id: 'PLUGIN_MARKETPLACE', title: 'Plugin Marketplace', moduleTitle: 'Quick Action', sectionTitle: 'Local plugin manifest manager', moduleId: 'action-plugins', kind: 'action' },
  { id: 'QA_CHECKS', title: 'QA Checks', moduleTitle: 'Quick Action', sectionTitle: 'Production smoke checklist', moduleId: 'action-qa', kind: 'action' },
  { id: 'PROVIDER_HEALTH', title: 'Provider Health', moduleTitle: 'Quick Action', sectionTitle: 'Test AI providers', moduleId: 'action-health', kind: 'action' },
  { id: 'THEME_STUDIO', title: 'Theme Studio', moduleTitle: 'Quick Action', sectionTitle: 'Dark/light and accent palettes', moduleId: 'action-theme', kind: 'action' },
  { id: 'CONTACT', title: 'Contact Developer', moduleTitle: 'Quick Action', sectionTitle: 'Email, GitHub, portfolio, LinkedIn', moduleId: 'action-contact', kind: 'action' },
];

function getIcon(moduleId: string) {
  if (moduleId.includes('roadmap')) return Map;
  if (moduleId.includes('compiler')) return Code2;
  if (moduleId.includes('tutor')) return Brain;
  if (moduleId.includes('challenge')) return Zap;
  if (moduleId.includes('recs')) return Compass;
  if (moduleId.includes('analytics')) return BarChart2;
  if (moduleId.includes('data')) return Database;
  if (moduleId.includes('cloud')) return Cloud;
  if (moduleId.includes('classroom')) return Users;
  if (moduleId.includes('share')) return Share2;
  if (moduleId.includes('plugin')) return Plug;
  if (moduleId.includes('qa')) return ClipboardCheck;
  if (moduleId.includes('health')) return Activity;
  if (moduleId.includes('theme')) return Palette;
  if (moduleId.includes('contact')) return Mail;
  return MODULE_ICON_MAP[moduleId] ?? BookOpen;
}

export function CommandPalette({ isOpen, onClose, onSelectTopic }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const bookmarkedIds = new Set<string>(JSON.parse(localStorage.getItem('ZYNAPSE_BOOKMARKS') ?? localStorage.getItem('AURA_BOOKMARKS') ?? '[]'));
    const recentIds = JSON.parse(localStorage.getItem('ZYNAPSE_RECENT_COMMANDS') || '[]') as string[];
    const bookmarked = ALL_TOPICS.filter(t => bookmarkedIds.has(t.id)).slice(0, 5).map(t => ({ ...t, kind: 'bookmark' as const }));
    const recent = recentIds.map(id => [...QUICK_ACTIONS, ...ALL_TOPICS].find(t => t.id === id)).filter(Boolean).slice(0, 5).map(t => ({ ...t!, kind: 'recent' as const }));
    if (!q) return [...QUICK_ACTIONS, ...recent, ...bookmarked, ...ALL_TOPICS.slice(0, 8)].slice(0, 18);
    return [...QUICK_ACTIONS, ...ALL_TOPICS].filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.moduleTitle.toLowerCase().includes(q) ||
      t.sectionTitle.toLowerCase().includes(q)
    ).slice(0, 18);
  }, [query]);

  const selectItem = (id: string) => {
    const recent = JSON.parse(localStorage.getItem('ZYNAPSE_RECENT_COMMANDS') || '[]') as string[];
    localStorage.setItem('ZYNAPSE_RECENT_COMMANDS', JSON.stringify([id, ...recent.filter(x => x !== id)].slice(0, 10)));
    onSelectTopic(id);
    onClose();
  };

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor(c => Math.min(c + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor(c => Math.max(c - 1, 0));
      } else if (e.key === 'Enter') {
        const item = results[cursor];
        if (item) selectItem(item.id);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, cursor, results]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(99,102,241,0.25)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
          <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--primary-light)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0); }}
            placeholder="Search topics, modules, skills..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-zinc-600 hover:text-zinc-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-600">
              No topics found for &quot;{query}&quot;
            </p>
          ) : (
            <>
              <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                {query ? `${results.length} results` : 'Actions / Recent / Bookmarks'}
              </p>
              {results.map((item, idx) => {
                const Icon = getIcon(item.moduleId);
                const isActive = idx === cursor;
                return (
                  <button
                    key={item.id}
                    data-idx={idx}
                    onClick={() => selectItem(item.id)}
                    onMouseEnter={() => setCursor(idx)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{
                      background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                      borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                    }}
                  >
                    <div
                      className="p-1.5 rounded-lg shrink-0"
                      style={{ background: isActive ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)' }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: isActive ? 'var(--primary-light)' : 'var(--text-muted)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{item.title}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                        {item.moduleTitle} › {item.sectionTitle}
                      </p>
                    </div>
                    {item.kind && item.kind !== 'topic' && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)' }}>
                        {item.kind}
                      </span>
                    )}
                    {isActive && (
                      <kbd className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 border border-zinc-700">
                        ↵
                      </kbd>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-white/[0.05]">
          <span className="text-[10px] text-zinc-700">↑↓ navigate</span>
          <span className="text-[10px] text-zinc-700">↵ open</span>
          <span className="text-[10px] text-zinc-700">ESC close</span>
          <span className="ml-auto text-[10px] text-zinc-700">{ALL_TOPICS.length} topics</span>
        </div>
      </div>
    </div>
  );
}
