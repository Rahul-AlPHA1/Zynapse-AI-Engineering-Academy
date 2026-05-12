import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lightbulb, Sparkles, Loader2, Bookmark, BookmarkCheck,
  Clock, Code2, Users, GitBranch, Trash2,
} from 'lucide-react';
import { streamContent } from '../services/geminiService';
import { curriculum } from '../data/curriculum';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProjectIdea {
  title: string;
  description: string;
  techStack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  features: string[];
}

interface SavedIdea extends ProjectIdea {
  savedAt: number;
}

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type ProjectType = 'Solo Project' | 'Team Project' | 'Open Source';
type Timeframe = 'Weekend' | '1 Week' | '1 Month' | 'Long-term';

// ─── Constants ───────────────────────────────────────────────────────────────

const SAVED_IDEAS_KEY = 'ZYNAPSE_SAVED_IDEAS';
const COMPLETED_KEY = 'ZYNAPSE_COMPLETED_TOPICS';
const LEGACY_COMPLETED_KEY = 'AURA_COMPLETED_TOPICS';

const CARD_BORDER_COLORS = [
  'var(--primary)',
  'var(--accent)',
  '#10b981',
  '#f59e0b',
  '#ec4899',
];

const TAG_PALETTES = [
  { bg: 'rgba(99,102,241,0.15)', color: 'var(--primary)' },
  { bg: 'rgba(14,165,233,0.15)', color: '#0ea5e9' },
  { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  { bg: 'rgba(236,72,153,0.15)', color: '#ec4899' },
  { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
];

const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; color: string }> = {
  Beginner: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  Intermediate: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  Advanced: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

// ─── Helper: extract JSON array from streamed text ────────────────────────

function extractJsonArray(text: string): ProjectIdea[] | null {
  // try fenced block first
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/);
  const raw = fenced ? fenced[1] : text;

  // find outermost [ ... ]
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) return null;

  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (Array.isArray(parsed)) return parsed as ProjectIdea[];
  } catch {
    // fall through
  }
  return null;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PillGroup<T extends string>({
  options,
  value,
  onChange,
  icon: Icon,
  label,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  icon?: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Icon && (
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          <Icon className="w-3.5 h-3.5" /> {label}
        </span>
      )}
      {!Icon && (
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}
      <div className="flex gap-1.5 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
            style={
              value === opt
                ? {
                    background: 'var(--primary)',
                    color: '#fff',
                    boxShadow: '0 0 12px var(--primary-glow)',
                  }
                : {
                    background: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }
            }
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 animate-pulse"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div className="h-5 rounded-lg mb-3" style={{ background: 'var(--border)', width: '60%' }} />
      <div className="space-y-2 mb-4">
        <div className="h-3 rounded" style={{ background: 'var(--border)', width: '100%' }} />
        <div className="h-3 rounded" style={{ background: 'var(--border)', width: '85%' }} />
        <div className="h-3 rounded" style={{ background: 'var(--border)', width: '70%' }} />
      </div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-16 rounded-full" style={{ background: 'var(--border)' }} />
        ))}
      </div>
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 rounded" style={{ background: 'var(--border)', width: i === 3 ? '55%' : '80%' }} />
        ))}
      </div>
    </div>
  );
}

function IdeaCard({
  idea,
  index,
  isSaved,
  onSave,
  onRemove,
  showRemove,
}: {
  idea: ProjectIdea;
  index: number;
  isSaved: boolean;
  onSave: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
}) {
  const borderColor = CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];
  const difficultyStyle = DIFFICULTY_COLORS[idea.difficulty as Difficulty] ?? DIFFICULTY_COLORS.Intermediate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      {/* Card header */}
      <div className="p-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base leading-tight mb-1" style={{ color: 'var(--text)' }}>
            {idea.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {idea.description}
          </p>
        </div>
      </div>

      {/* Badges row */}
      <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
        <span
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: difficultyStyle.bg, color: difficultyStyle.color }}
        >
          {idea.difficulty}
        </span>
        <span
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}
        >
          <Clock className="w-3 h-3" />
          {idea.estimatedTime}
        </span>
      </div>

      {/* Tech stack tags */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-1 mb-2">
          <Code2 className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Tech Stack
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {idea.techStack.map((tech, ti) => {
            const palette = TAG_PALETTES[ti % TAG_PALETTES.length];
            return (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: palette.bg, color: palette.color }}
              >
                {tech}
              </span>
            );
          })}
        </div>
      </div>

      {/* Key features */}
      <div className="px-5 pb-4 flex-1">
        <div className="flex items-center gap-1 mb-2">
          <GitBranch className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Key Features
          </span>
        </div>
        <ul className="space-y-1">
          {idea.features.map((feat, fi) => (
            <li key={fi} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full" style={{ background: borderColor }} />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div
        className="px-5 py-3 flex items-center justify-between gap-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          onClick={onSave}
          disabled={isSaved}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          style={
            isSaved
              ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', cursor: 'default' }
              : {
                  background: 'var(--bg-surface)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }
          }
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5" /> Saved
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5" /> Save Idea
            </>
          )}
        </button>

        {showRemove && onRemove && (
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-80"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ProjectIdeas() {
  // Preferences
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [projectType, setProjectType] = useState<ProjectType>('Solo Project');
  const [timeframe, setTimeframe] = useState<Timeframe>('1 Week');

  // State
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_IDEAS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Completed topics
  const studiedTopics = (() => {
    try {
      const raw = localStorage.getItem(COMPLETED_KEY) ?? localStorage.getItem(LEGACY_COMPLETED_KEY);
      if (raw && !localStorage.getItem(COMPLETED_KEY)) localStorage.setItem(COMPLETED_KEY, raw);
      const completed: string[] = raw ? JSON.parse(raw) : [];
      const completedSet = new Set(completed);
      const titles: string[] = [];
      for (const module of curriculum) {
        for (const section of module.sections) {
          for (const topic of section.topics) {
            if (completedSet.has(topic.id)) {
              titles.push(topic.title);
            }
          }
        }
      }
      return titles;
    } catch {
      return [];
    }
  })();

  const hasCompletedTopics = studiedTopics.length > 0;

  // Persist saved ideas
  useEffect(() => {
    localStorage.setItem(SAVED_IDEAS_KEY, JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  // Check if idea is saved
  const isIdeaSaved = useCallback(
    (idea: ProjectIdea) => savedIdeas.some((s) => s.title === idea.title),
    [savedIdeas]
  );

  // Save idea
  const saveIdea = useCallback((idea: ProjectIdea) => {
    setSavedIdeas((prev) => {
      if (prev.some((s) => s.title === idea.title)) return prev;
      return [{ ...idea, savedAt: Date.now() }, ...prev];
    });
  }, []);

  // Remove saved idea
  const removeIdea = useCallback((title: string) => {
    setSavedIdeas((prev) => prev.filter((s) => s.title !== title));
  }, []);

  // Generate ideas
  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIdeas([]);

    const studiedText =
      hasCompletedTopics
        ? studiedTopics.slice(0, 20).join(', ')
        : 'general web development, JavaScript, HTML, CSS';

    const typeIcon =
      projectType === 'Team Project'
        ? 'collaborative team'
        : projectType === 'Open Source'
        ? 'open source community'
        : 'solo developer';

    const prompt = `Generate 5 unique, practical project ideas for a ${typeIcon} who has studied: ${studiedText}.
Preferences: ${difficulty} difficulty, ${projectType}, ${timeframe} timeframe.

Each project should be exciting, buildable, and portfolio-worthy. Think of projects that would impress hiring managers or the dev community.

Return ONLY a valid JSON array (no markdown, no extra text):
[{
  "title": "Project name (short, catchy)",
  "description": "2-3 sentence description of what it does and why it's useful",
  "techStack": ["tech1", "tech2", "tech3", "tech4"],
  "difficulty": "${difficulty}",
  "estimatedTime": "e.g. 2-3 days",
  "features": ["feature 1", "feature 2", "feature 3"]
}]`;

    try {
      let buffer = '';
      for await (const chunk of streamContent([{ role: 'user', content: prompt }])) {
        buffer += chunk;
      }

      const parsed = extractJsonArray(buffer);
      if (!parsed || parsed.length === 0) {
        throw new Error('Could not parse project ideas from AI response. Please try again.');
      }
      setIdeas(parsed.slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [difficulty, projectType, timeframe, studiedTopics, hasCompletedTopics]);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-void)' }}>
      {/* ── Header ── */}
      <div
        className="shrink-0 px-6 py-5 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--primary)', boxShadow: '0 0 16px var(--primary-glow)' }}
        >
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight" style={{ color: 'var(--text)' }}>
            Project Ideas Generator
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            AI-powered project ideas tailored to your learning journey
          </p>
        </div>
      </div>

      {/* ── Settings Panel ── */}
      <div
        className="shrink-0 px-6 py-4"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <PillGroup
            label="Difficulty"
            options={['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]}
            value={difficulty}
            onChange={(v) => setDifficulty(v)}
          />
          <PillGroup
            label="Type"
            options={['Solo Project', 'Team Project', 'Open Source'] as ProjectType[]}
            value={projectType}
            onChange={(v) => setProjectType(v)}
            icon={Users}
          />
          <PillGroup
            label="Timeframe"
            options={['Weekend', '1 Week', '1 Month', 'Long-term'] as Timeframe[]}
            value={timeframe}
            onChange={(v) => setTimeframe(v)}
            icon={Clock}
          />

          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 ml-auto"
            style={{
              background: 'var(--primary)',
              boxShadow: loading ? 'none' : '0 0 18px var(--primary-glow)',
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? 'Generating…' : 'Generate Ideas'}
          </button>
        </div>

        {!hasCompletedTopics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              color: '#f59e0b',
            }}
          >
            <Lightbulb className="w-3.5 h-3.5 shrink-0" />
            <span>
              Complete some topics first to get personalized ideas — but you can still generate
              based on your selections above.
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444',
              }}
            >
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeletons */}
        {loading && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 animate-pulse" style={{ color: 'var(--primary)' }} />
              <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Crafting your ideas…
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
        )}

        {/* Generated ideas */}
        {!loading && ideas.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {ideas.length} Ideas Generated
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {ideas.map((idea, i) => (
                <IdeaCard
                  key={idea.title + i}
                  idea={idea}
                  index={i}
                  isSaved={isIdeaSaved(idea)}
                  onSave={() => saveIdea(idea)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && ideas.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <Lightbulb className="w-7 h-7" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>
                Ready to spark ideas?
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Set your preferences above and click <strong>Generate Ideas</strong> to get
                personalized project suggestions.
              </p>
            </div>
          </motion.div>
        )}

        {/* Saved ideas */}
        <AnimatePresence>
          {savedIdeas.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="flex items-center gap-2 mb-4 pt-2"
                style={{ borderTop: ideas.length > 0 ? '1px solid var(--border)' : 'none' }}
              >
                <BookmarkCheck className="w-4 h-4" style={{ color: '#10b981' }} />
                <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Saved Ideas ({savedIdeas.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {savedIdeas.map((idea, i) => (
                  <IdeaCard
                    key={idea.title + idea.savedAt}
                    idea={idea}
                    index={i}
                    isSaved={true}
                    onSave={() => {}}
                    onRemove={() => removeIdea(idea.title)}
                    showRemove
                  />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
