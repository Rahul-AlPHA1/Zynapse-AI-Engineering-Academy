import { useState, useMemo } from 'react';
import {
  Terminal, BookOpen, Code2, Cpu, Database, LayoutTemplate, Briefcase,
  Target, ChevronRight, ChevronDown, Globe, Settings, HardDrive, Search,
  Map, BrainCircuit, Sparkles, Box, Cloud, Network, GraduationCap, Menu, X,
  Flame, Zap, Sun, Moon, Brain, BarChart2, Lightbulb, MessageSquareCode, FlipHorizontal2, CalendarDays,
  Compass, FileText, ShieldCheck, Activity, Palette, Users, Share2, Plug, ClipboardCheck, Mail,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { curriculum } from '../data/curriculum';
import { SUPPORTED_LEARNING_LANGUAGES } from '../data/languages';

interface SidebarProps {
  selectedTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  onOpenSettings: () => void;
  onOpenPalette?: () => void;
  onOpenModelManager?: () => void;
  completedTopics?: Set<string>;
  bookmarkedTopics?: string[];
  xp?: number;
  streak?: number;
  level?: number;
  levelTitle?: string;
  levelPct?: number;
  unlockedAchievements?: number;
  totalAchievements?: number;
  onOpenAchievements?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Code2, Cpu, Map, Database, Terminal, LayoutTemplate, Briefcase, BookOpen, Target,
  BrainCircuit, Sparkles, Box, Cloud, Network,
};

function isInterviewTopic(title: string, id: string) {
  const t = title.toLowerCase(), i = id.toLowerCase();
  return t.includes('interview') || i.includes('interview') || t.includes('q&a') || t.includes('faq');
}
function isQuizTopic(title: string, id: string) {
  const t = title.toLowerCase(), i = id.toLowerCase();
  return t.includes('quiz') || i.includes('quiz');
}

export function Sidebar({
  selectedTopicId, onSelectTopic,
  isDarkMode, toggleDarkMode,
  language, setLanguage,
  onOpenSettings, onOpenPalette, onOpenModelManager,
  completedTopics = new Set(),
  bookmarkedTopics = [],
  xp = 0, streak = 0, level = 1, levelTitle = 'Initiate', levelPct = 0,
  unlockedAchievements = 0, totalAchievements = 0, onOpenAchievements,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (curriculum[0]) init[curriculum[0].id] = true;
    return init;
  });

  const toggleSection = (id: string) => setExpandedSections(p => ({ ...p, [id]: !p[id] }));
  const toggleModule  = (id: string) => setExpandedModules(p => ({ ...p, [id]: !p[id] }));

  const topicMap = useMemo((): Record<string, { title: string; moduleTitle: string }> => {
    const map: Record<string, { title: string; moduleTitle: string }> = {};
    for (const m of curriculum) {
      for (const s of m.sections) {
        for (const t of s.topics) {
          map[t.id] = { title: t.title, moduleTitle: m.title };
        }
      }
    }
    return map;
  }, []);

  const allLearnTopics = curriculum.flatMap(m =>
    m.sections.flatMap(s =>
      s.topics.filter(t => !isInterviewTopic(t.title, t.id) && !isQuizTopic(t.title, t.id))
    )
  );
  const totalTopics = allLearnTopics.length;
  const completedCount = allLearnTopics.filter(t => completedTopics.has(t.id)).length;
  const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const quickNavBtn = (
    id: string,
    label: string,
    Icon: React.ElementType,
    badge?: { text: string; color: string; bg: string; border: string },
    accentColor?: string,
  ) => {
    const active = selectedTopicId === id;
    const ac = accentColor ?? '#6366f1';
    return (
      <button
        key={id}
        onClick={() => { onSelectTopic(id); setMobileOpen(false); }}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border',
          active
            ? 'text-zinc-900 dark:text-white'
            : 'border-transparent hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:border-zinc-200 dark:hover:border-white/10',
          !active && 'text-zinc-500'
        )}
        style={active ? { background: `${ac}18`, borderColor: `${ac}55` } : {}}
      >
        <Icon className="w-4 h-4 shrink-0" style={{ color: active ? ac : undefined }} />
        <span>{label}</span>
        {badge && (
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
            {badge.text}
          </span>
        )}
        {!badge && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />}
      </button>
    );
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 flex md:hidden p-2 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all"
        style={{ background: 'var(--sidebar-bg)' }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'w-72 flex flex-col h-screen shrink-0 z-50 overflow-hidden border-r transition-transform duration-300',
          'fixed md:relative',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
        style={{
          background: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(34,211,238,0.3), transparent)' }} />

        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-4 shrink-0 border-b"
          style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-black text-zinc-900 dark:text-white text-sm tracking-tight leading-none">Zynapse</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--primary-light)' }}>
                AI Engineering Academy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onOpenPalette} title="Search topics (Ctrl+K)"
              className="p-1.5 rounded-lg transition-all text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10">
              <Search className="w-4 h-4" />
            </button>
            <button onClick={toggleDarkMode} title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 rounded-lg transition-all text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={onOpenSettings} title="AI Provider Settings"
              className="p-1.5 rounded-lg transition-all text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10">
              <Settings className="w-4 h-4" />
            </button>
            {/* Mobile close */}
            <button onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg transition-all text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 md:hidden">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player card — XP / Streak / Level */}
        <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide"
                style={{ background: 'rgba(99,102,241,0.18)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                Lv.{level} {levelTitle}
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: streak > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(128,128,128,0.08)', color: streak > 0 ? '#f59e0b' : '#6b7280', border: `1px solid ${streak > 0 ? 'rgba(245,158,11,0.25)' : 'transparent'}` }}>
              <Flame className="w-3 h-3" />
              <span>{streak}d streak</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="font-bold text-yellow-500/80">{xp.toLocaleString()} XP</span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{levelPct}% to Lv.{level + 1}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${levelPct}%`, background: 'linear-gradient(90deg,#f59e0b,#f97316)' }} />
          </div>

          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Completion</span>
              <span className="text-[10px] font-bold" style={{ color: progressPct === 100 ? '#34d399' : 'var(--primary-light)' }}>
                {completedCount}/{totalTopics} · {progressPct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100
                    ? 'linear-gradient(90deg, #34d399, #10b981)'
                    : 'linear-gradient(90deg, #6366f1, #818cf8)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">

          {/* Language selector */}
          <div className="px-1 pb-2">
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <Globe className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Language</span>
            </div>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm font-medium border outline-none appearance-none cursor-pointer transition-all"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              {SUPPORTED_LEARNING_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* ── Quick Nav ─────────────────────────── */}
          <p className="px-1 pt-1 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Quick Nav</p>

          {quickNavBtn('ROADMAP',   'Learning Roadmap', Map,
            { text: 'VISUAL', color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.25)' }, '#22d3ee')}
          {quickNavBtn('COMPILER',  'Online Compiler',  Code2, undefined, '#6366f1')}
          {quickNavBtn('DAILY_CHALLENGE', 'Daily Challenge', Zap,
            { text: '+75 XP', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' }, '#f97316')}
          {quickNavBtn('STUDY_PLANNER', 'Study Planner', CalendarDays,
            { text: 'PLAN', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' }, '#10b981')}
          {quickNavBtn('RECOMMENDATIONS', 'Smart Next Step', Compass,
            { text: 'SMART', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)' }, '#6366f1')}

          <p className="px-1 pt-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Practice Hubs</p>

          {quickNavBtn('INTERVIEW_HUB', 'Interview Questions', Briefcase,
            { text: 'Q&A', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' }, '#f59e0b')}
          {quickNavBtn('QUIZ_HUB',      'Quiz Practice',       GraduationCap,
            { text: '50 Qs', color: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)' }, '#818cf8')}
          {quickNavBtn('MOCK_INTERVIEW', 'Mock Interview', MessageSquareCode,
            { text: 'AI', color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.25)' }, '#22d3ee')}
          {quickNavBtn('CHALLENGE_ARENA', 'Code Challenge Arena', Target,
            { text: 'DRILL', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' }, '#ef4444')}

          <p className="px-1 pt-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>AI Tools</p>

          {quickNavBtn('FLASHCARDS',    'Flashcards', FlipHorizontal2,
            { text: 'SRS', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' }, '#a78bfa')}
          {quickNavBtn('CODE_REVIEW',   'AI Code Review', Brain,
            { text: 'NEW', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)' }, '#34d399')}
          {quickNavBtn('GUIDED_TUTOR', 'Guided Tutor', GraduationCap,
            { text: 'TEACH', color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.25)' }, '#22d3ee')}
          {quickNavBtn('PROJECT_IDEAS', 'Project Ideas', Lightbulb,
            { text: 'AI', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' }, '#f97316')}
          {quickNavBtn('PORTFOLIO_BUILDER', 'Portfolio Builder', FileText,
            { text: 'CV', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' }, '#a78bfa')}
          {quickNavBtn('ANALYTICS',     'My Analytics',  BarChart2,
            undefined, '#6366f1')}

          <p className="px-1 pt-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>System</p>

          {quickNavBtn('PROVIDER_HEALTH', 'Provider Health', Activity,
            { text: 'TEST', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' }, '#10b981')}
          {quickNavBtn('THEME_STUDIO', 'Theme Studio', Palette,
            { text: 'UI', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' }, '#a78bfa')}
          {quickNavBtn('DATA_MANAGER', 'Data Manager', ShieldCheck,
            { text: 'SYNC', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)' }, '#6366f1')}
          {quickNavBtn('CLOUD_SYNC', 'Cloud Sync', Cloud,
            { text: 'BYO', color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.25)' }, '#22d3ee')}
          {quickNavBtn('CLASSROOM_MODE', 'Classroom Mode', Users,
            { text: 'TEAM', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' }, '#10b981')}
          {quickNavBtn('SHARE_CENTER', 'Share Center', Share2,
            { text: 'CARD', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' }, '#f97316')}
          {quickNavBtn('PLUGIN_MARKETPLACE', 'Plugin Marketplace', Plug,
            { text: 'LOCAL', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' }, '#a78bfa')}
          {quickNavBtn('QA_CHECKS', 'QA Checks', ClipboardCheck,
            { text: 'SMOKE', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)' }, '#34d399')}

          {/* Achievements */}
          {onOpenAchievements && (
            <button onClick={onOpenAchievements}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border border-transparent hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:border-zinc-200 dark:hover:border-white/10"
              style={{ color: 'var(--text-muted)' }}>
              <span className="text-base leading-none shrink-0">🏆</span>
              <span>Achievements</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded text-yellow-400 border border-yellow-500/30"
                style={{ background: 'rgba(251,191,36,0.08)' }}>
                {unlockedAchievements}/{totalAchievements}
              </span>
            </button>
          )}

          {/* Local Models */}
          {onOpenModelManager && (
            <button onClick={onOpenModelManager}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border border-transparent hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:border-zinc-200 dark:hover:border-white/10"
              style={{ color: 'var(--text-muted)' }}>
              <HardDrive className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Local AI Models</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded text-emerald-400 border border-emerald-500/30"
                style={{ background: 'rgba(16,185,129,0.1)' }}>FREE</span>
            </button>
          )}

          {/* ── Bookmarks ────────────────────────── */}
          {bookmarkedTopics.length > 0 && (
            <div className="pt-2 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
              <p className="px-1 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                ⭐ Bookmarks ({bookmarkedTopics.length})
              </p>
              <div className="space-y-0.5">
                {bookmarkedTopics.slice(0, 8).map(id => {
                  const info = topicMap[id];
                  if (!info) return null;
                  const isActive = selectedTopicId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { onSelectTopic(id); setMobileOpen(false); }}
                      className={cn(
                        'sidebar-item w-full flex items-center gap-2 px-2.5 py-2 text-xs transition-all text-left',
                        isActive ? 'active' : 'hover:text-zinc-800 dark:hover:text-zinc-300'
                      )}
                      style={{ color: isActive ? undefined : 'var(--text-muted)' }}
                    >
                      <span className="text-yellow-500 opacity-80 shrink-0 text-[10px]">★</span>
                      <div className="min-w-0">
                        <p className="truncate leading-snug">{info.title}</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-subtle)' }}>{info.moduleTitle}</p>
                      </div>
                    </button>
                  );
                })}
                {bookmarkedTopics.length > 8 && (
                  <p className="px-2.5 text-[10px]" style={{ color: 'var(--text-subtle)' }}>+{bookmarkedTopics.length - 8} more</p>
                )}
              </div>
            </div>
          )}

          {/* ── Curriculum ────────────────────────── */}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
            <p className="px-1 py-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Curriculum — {curriculum.length} Modules
            </p>

            {curriculum.map(module => {
              const Icon = iconMap[module.icon] || BookOpen;
              const isModuleOpen = expandedModules[module.id];

              return (
                <div key={module.id}>
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <div className="p-1 rounded-md shrink-0" style={{ background: 'rgba(99,102,241,0.12)' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: 'var(--primary-light)' }} />
                    </div>
                    <span className="flex-1 text-left truncate">{module.title}</span>
                    {isModuleOpen
                      ? <ChevronDown className="w-3 h-3 shrink-0" style={{ color: 'var(--text-subtle)' }} />
                      : <ChevronRight className="w-3 h-3 shrink-0" style={{ color: 'var(--text-subtle)' }} />}
                  </button>

                  {isModuleOpen && (
                    <div className="ml-3 mt-0.5 pl-3 border-l space-y-0.5"
                      style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
                      {module.sections.map(section => {
                        const learnTopics = section.topics.filter(
                          t => !isInterviewTopic(t.title, t.id) && !isQuizTopic(t.title, t.id)
                        );
                        const hasExtra = learnTopics.length < section.topics.length;
                        if (learnTopics.length === 0) return null;

                        const isSectionOpen = expandedSections[section.id];
                        return (
                          <div key={section.id}>
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <span className="truncate pr-1 text-left">{section.title}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                {hasExtra && (
                                  <span className="text-[9px] px-1 rounded text-indigo-500 border border-indigo-500/30">+HUB</span>
                                )}
                                {isSectionOpen
                                  ? <ChevronDown className="w-3 h-3" />
                                  : <ChevronRight className="w-3 h-3" />}
                              </div>
                            </button>

                            {isSectionOpen && (
                              <div className="space-y-0.5 mt-0.5 pb-1">
                                {learnTopics.map(topic => {
                                  const isActive = selectedTopicId === topic.id;
                                  const isDone = completedTopics.has(topic.id);
                                  return (
                                    <button
                                      key={topic.id}
                                      onClick={() => { onSelectTopic(topic.id); setMobileOpen(false); }}
                                      className={cn(
                                        'sidebar-item w-full flex items-center gap-2 px-2.5 py-2 text-xs transition-all text-left',
                                        isActive ? 'active' : 'hover:text-zinc-800 dark:hover:text-zinc-300'
                                      )}
                                      style={{ color: isActive ? undefined : 'var(--text-muted)' }}
                                    >
                                      {isActive ? (
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0"
                                          style={{ background: 'var(--primary-light)' }} />
                                      ) : isDone ? (
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500" />
                                      ) : (
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0 opacity-0" />
                                      )}
                                      <span className={cn(
                                        'flex-1 truncate leading-relaxed',
                                        isDone && !isActive && 'line-through'
                                      )}
                                        style={isDone && !isActive ? { color: 'var(--text-subtle)' } : undefined}>
                                        {topic.title}
                                      </span>
                                      {isDone && !isActive && (
                                        <span className="shrink-0 text-emerald-500 opacity-60 text-[10px]">✓</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-3 border-t shrink-0 space-y-2" style={{ borderColor: 'var(--sidebar-border)' }}>
          <button
            onClick={() => { onSelectTopic('CONTACT'); setMobileOpen(false); }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-left',
              selectedTopicId === 'CONTACT'
                ? 'text-zinc-900 dark:text-white'
                : 'border-transparent hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            )}
            style={selectedTopicId === 'CONTACT'
              ? { background: 'rgba(99,102,241,0.14)', borderColor: 'rgba(99,102,241,0.34)' }
              : { color: 'var(--text-muted)' }}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary-light)' }} />
            <div className="min-w-0 flex-1">
              <span className="block truncate">Contact Developer</span>
              <span className="block truncate text-[10px] font-medium" style={{ color: 'var(--text-subtle)' }}>
                Rahool Gir
              </span>
            </div>
          </button>
          <button onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            style={{ color: 'var(--text-muted)' }}>
            <Settings className="w-3.5 h-3.5" />
            <span>AI Provider Settings</span>
            <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--text-subtle)' }}>9 providers</span>
          </button>
        </div>
      </aside>
    </>
  );
}
