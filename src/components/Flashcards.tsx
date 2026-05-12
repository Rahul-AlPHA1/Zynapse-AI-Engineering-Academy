import { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Sparkles,
  RotateCcw,
  ChevronRight,
  BookOpen,
  BarChart3,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  Layers,
  AlertCircle,
  Play,
} from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { streamContent } from '../services/geminiService';
import { useFlashcards, Flashcard } from '../hooks/useFlashcards';
import { cn } from '../lib/utils';

// ── Helpers ──────────────────────────────────────────────────────────────────

interface TopicEntry {
  id: string;
  title: string;
  moduleTitle: string;
}

function buildTopicList(): TopicEntry[] {
  const entries: TopicEntry[] = [];
  for (const mod of curriculum) {
    for (const sec of mod.sections) {
      for (const topic of sec.topics) {
        const t = topic.title.toLowerCase();
        const i = topic.id.toLowerCase();
        if (
          t.includes('quiz') || i.includes('quiz') ||
          t.includes('interview') || i.includes('interview') ||
          i === 'ai-plan-generator'
        ) continue;
        entries.push({ id: topic.id, title: topic.title, moduleTitle: mod.title });
      }
    }
  }
  return entries;
}

const ALL_TOPICS = buildTopicList();

function extractJsonArray(raw: string): Array<{ front: string; back: string }> {
  // Strip markdown fences if present
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = fence ? fence[1] : raw;
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('No JSON array found');
  return JSON.parse(text.slice(start, end + 1));
}

function formatNextReview(ms: number): string {
  const diff = ms - Date.now();
  if (diff <= 0) return 'Due now';
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days > 0) return `in ${days}d ${hours}h`;
  const mins = Math.floor(diff / 60_000);
  return mins > 0 ? `in ${mins}m` : 'in <1m';
}

// ── Flip Card ─────────────────────────────────────────────────────────────────

interface FlipCardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  cardIndex: number;
  totalCards: number;
}

function FlipCard({ card, isFlipped, onFlip, cardIndex, totalCards }: FlipCardProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Progress indicator */}
      <div className="flex items-center gap-3">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
          {cardIndex + 1} / {totalCards}
        </span>
        <div
          className="flex gap-1"
          style={{ overflow: 'hidden', maxWidth: '200px' }}
        >
          {Array.from({ length: Math.min(totalCards, 12) }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '3px',
                width: `${Math.min(160 / Math.min(totalCards, 12), 16)}px`,
                borderRadius: '9px',
                background: i <= cardIndex ? 'var(--primary)' : 'var(--border)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* 3D Flip container */}
      <div
        style={{ perspective: '1200px', width: '100%', maxWidth: '680px', height: '340px', cursor: isFlipped ? 'default' : 'pointer' }}
        onClick={!isFlipped ? onFlip : undefined}
        title={!isFlipped ? 'Click to reveal answer' : undefined}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0.0, 0.2, 1] }}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Front face */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              boxShadow: 'var(--card-shadow)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem',
              gap: '1.25rem',
              overflow: 'hidden',
            }}
          >
            {/* Decorative accent bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '3px',
              borderRadius: '0 0 4px 4px',
              background: 'linear-gradient(90deg, var(--primary), var(--accent))',
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(99,102,241,0.10)',
              border: '1px solid rgba(99,102,241,0.20)',
            }}>
              <Brain style={{ width: '22px', height: '22px', color: 'var(--primary)' }} />
            </div>

            <p style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'var(--text)',
              textAlign: 'center',
              lineHeight: 1.55,
              margin: 0,
            }}>
              {card.front}
            </p>

            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginTop: '0.25rem',
            }}>
              <RotateCcw style={{ width: '12px', height: '12px' }} />
              Click to reveal answer
            </span>
          </div>

          {/* Back face */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-bright)',
              borderRadius: '20px',
              boxShadow: 'var(--card-shadow)',
              display: 'flex',
              flexDirection: 'column',
              padding: '2.5rem',
              gap: '1rem',
              overflow: 'hidden',
            }}
          >
            {/* Decorative accent bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '3px',
              borderRadius: '0 0 4px 4px',
              background: 'linear-gradient(90deg, var(--accent), var(--primary))',
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '0.25rem',
            }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Answer
              </span>
            </div>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text)',
              lineHeight: 1.7,
              margin: 0,
              flex: 1,
              overflowY: 'auto',
            }}>
              {card.back}
            </p>

            <div style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                Question: {card.front}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Quality buttons ────────────────────────────────────────────────────────────

const QUALITY_OPTS = [
  { q: 0 as const, label: 'Again', sub: 'Completely forgot', color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.30)' },
  { q: 1 as const, label: 'Hard', sub: 'Got it wrong', color: '#f97316', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.30)' },
  { q: 2 as const, label: 'Good', sub: 'Recalled with effort', color: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.30)' },
  { q: 3 as const, label: 'Easy', sub: 'Perfect recall', color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.30)' },
];

// ── Stats Panel ────────────────────────────────────────────────────────────────

interface StatsPanelProps {
  cards: Flashcard[];
  dueCount: number;
  totalCount: number;
  onStudyDue: () => void;
}

function StatsPanel({ cards, dueCount, totalCount, onStudyDue }: StatsPanelProps) {
  // Per-topic breakdown
  const topicBreakdown = useMemo(() => {
    const map = new Map<string, { topicId: string; total: number; due: number }>();
    const now = Date.now();
    for (const card of cards) {
      if (!map.has(card.topicId)) map.set(card.topicId, { topicId: card.topicId, total: 0, due: 0 });
      const entry = map.get(card.topicId)!;
      entry.total += 1;
      if (card.nextReview <= now) entry.due += 1;
    }
    return [...map.values()].sort((a, b) => b.due - a.due);
  }, [cards]);

  const topicTitles = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of ALL_TOPICS) m[t.id] = t.title;
    return m;
  }, []);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BarChart3 style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>Stats</span>
      </div>

      {/* Summary numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{
          background: dueCount > 0 ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)',
          border: `1px solid ${dueCount > 0 ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`,
          borderRadius: '10px',
          padding: '0.9rem',
        }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
            {dueCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
            Due for review
          </div>
        </div>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '0.9rem',
        }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
            Total cards
          </div>
        </div>
      </div>

      {/* Study due button */}
      {dueCount > 0 && (
        <button
          onClick={onStudyDue}
          className="btn-primary glow-indigo"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '0.7rem 1rem',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <Play style={{ width: '14px', height: '14px' }} />
          Study {dueCount} Due Card{dueCount !== 1 ? 's' : ''}
        </button>
      )}

      {/* Topic breakdown */}
      {topicBreakdown.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            By Topic
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '260px', overflowY: 'auto' }}>
            {topicBreakdown.map(t => (
              <div
                key={t.topicId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  background: 'var(--bg-card)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '140px',
                }}>
                  {topicTitles[t.topicId] || t.topicId}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {t.due > 0 && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#f97316',
                      background: 'rgba(249,115,22,0.12)',
                      border: '1px solid rgba(249,115,22,0.25)',
                      borderRadius: '5px',
                      padding: '1px 6px',
                    }}>
                      {t.due} due
                    </span>
                  )}
                  <span style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-void)',
                    borderRadius: '5px',
                    padding: '1px 6px',
                    border: '1px solid var(--border)',
                  }}>
                    {t.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type ViewMode = 'home' | 'review';

export function Flashcards() {
  const { cards, addCards, reviewCard, getDueCards, getCardsByTopic, clearTopicCards, totalCount, dueCount } = useFlashcards();

  const [view, setView] = useState<ViewMode>('home');
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generateSuccess, setGenerateSuccess] = useState('');
  const abortRef = useRef(false);

  const selectedTopicTitle = useMemo(() => {
    return ALL_TOPICS.find(t => t.id === selectedTopicId)?.title || '';
  }, [selectedTopicId]);

  const topicCardCount = useMemo(() => {
    if (!selectedTopicId) return 0;
    return getCardsByTopic(selectedTopicId).length;
  }, [selectedTopicId, getCardsByTopic, cards]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Generate flashcards via AI ──
  const handleGenerate = useCallback(async () => {
    if (!selectedTopicId || isGenerating) return;
    setIsGenerating(true);
    setGenerateError('');
    setGenerateSuccess('');
    abortRef.current = false;

    const prompt = `Generate exactly 8 flashcards for the topic "${selectedTopicTitle}".
Return ONLY a JSON array, no markdown, no explanation:
[{"front": "question or concept", "back": "clear, concise answer (2-3 sentences max)"}]`;

    try {
      let buffer = '';
      for await (const chunk of streamContent([{ role: 'user', content: prompt }])) {
        if (abortRef.current) break;
        buffer += chunk;
      }

      const parsed = extractJsonArray(buffer);
      if (!parsed || parsed.length === 0) throw new Error('No cards returned by AI');

      const valid = parsed.filter(c => c.front?.trim() && c.back?.trim());
      if (valid.length === 0) throw new Error('AI returned invalid card format');

      addCards(selectedTopicId, valid);
      setGenerateSuccess(`Generated ${valid.length} flashcards for "${selectedTopicTitle}"!`);
    } catch (err: unknown) {
      setGenerateError((err as Error).message || 'Failed to generate flashcards. Check your AI provider settings.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTopicId, selectedTopicTitle, isGenerating, addCards]);

  // ── Start review session ──
  const startReview = useCallback((cardsToReview: Flashcard[]) => {
    if (cardsToReview.length === 0) return;
    setReviewQueue(cardsToReview);
    setCurrentIdx(0);
    setIsFlipped(false);
    setSessionDone(false);
    setReviewedCount(0);
    setView('review');
  }, []);

  const startDueReview = useCallback(() => {
    startReview(getDueCards());
  }, [getDueCards, startReview]);

  // ── Handle quality rating ──
  const handleRate = useCallback((quality: 0 | 1 | 2 | 3) => {
    const card = reviewQueue[currentIdx];
    if (!card) return;

    reviewCard(card.id, quality);
    const newReviewed = reviewedCount + 1;
    setReviewedCount(newReviewed);

    const nextIdx = currentIdx + 1;
    if (nextIdx >= reviewQueue.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx(nextIdx);
      setIsFlipped(false);
    }
  }, [reviewQueue, currentIdx, reviewedCount, reviewCard]);

  // ── Review mode ──
  if (view === 'review') {
    const currentCard = reviewQueue[currentIdx];

    return (
      <div
        className="h-full flex flex-col"
        style={{ background: 'var(--bg-void)' }}
      >
        {/* Review header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setView('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain style={{ width: '16px', height: '16px', color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
              Flashcard Review
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {reviewedCount} / {reviewQueue.length} reviewed
          </div>
        </div>

        {/* Review body */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          gap: '2rem',
          overflowY: 'auto',
        }}>
          <AnimatePresence mode="wait">
            {sessionDone ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.5rem',
                  textAlign: 'center',
                  maxWidth: '400px',
                }}
              >
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(16,185,129,0.15)',
                  border: '2px solid rgba(16,185,129,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle2 style={{ width: '36px', height: '36px', color: '#10b981' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.5rem' }}>
                    Session Complete!
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                    You reviewed {reviewedCount} card{reviewedCount !== 1 ? 's' : ''}.
                    Zynapse will schedule your next reviews using spaced repetition.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={startDueReview}
                    disabled={getDueCards().length === 0}
                    className="btn-primary"
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: getDueCards().length === 0 ? 'not-allowed' : 'pointer',
                      opacity: getDueCards().length === 0 ? 0.5 : 1,
                      border: 'none',
                    }}
                  >
                    Study More ({getDueCards().length} due)
                  </button>
                  <button
                    onClick={() => setView('home')}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    Back to Home
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`card-${currentCard?.id}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}
              >
                {currentCard && (
                  <>
                    <FlipCard
                      card={currentCard}
                      isFlipped={isFlipped}
                      onFlip={() => setIsFlipped(true)}
                      cardIndex={currentIdx}
                      totalCards={reviewQueue.length}
                    />

                    {/* Show answer button or quality buttons */}
                    <AnimatePresence mode="wait">
                      {!isFlipped ? (
                        <motion.div
                          key="show-btn"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.2 }}
                        >
                          <button
                            onClick={() => setIsFlipped(true)}
                            className="btn-primary glow-indigo"
                            style={{
                              padding: '0.75rem 2.5rem',
                              borderRadius: '12px',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <RotateCcw style={{ width: '15px', height: '15px' }} />
                            Show Answer
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="quality-btns"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -16 }}
                          transition={{ duration: 0.25 }}
                          style={{
                            display: 'flex',
                            gap: '0.75rem',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                          }}
                        >
                          {QUALITY_OPTS.map(opt => (
                            <button
                              key={opt.q}
                              onClick={() => handleRate(opt.q)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '0.7rem 1.2rem',
                                borderRadius: '12px',
                                background: opt.bg,
                                border: `1px solid ${opt.border}`,
                                color: opt.color,
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                minWidth: '80px',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 18px ${opt.border}`;
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                              }}
                            >
                              {opt.label}
                              <span style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.75 }}>
                                {opt.sub}
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Next review time hint */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                    }}>
                      <Clock style={{ width: '11px', height: '11px' }} />
                      <span>Next review: {formatNextReview(currentCard.nextReview)}</span>
                      <span style={{ opacity: 0.5 }}>·</span>
                      <span>Interval: {currentCard.interval}d</span>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── Home mode ──
  return (
    <div
      className="h-full flex flex-col"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Header */}
      <div style={{
        padding: '1.25rem 2rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Brain style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
              Flashcards
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
              AI-powered spaced repetition
            </p>
          </div>
        </div>

        {dueCount > 0 && (
          <button
            onClick={startDueReview}
            className="btn-primary glow-indigo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '0.55rem 1.1rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <Play style={{ width: '13px', height: '13px' }} />
            Study Due ({dueCount})
          </button>
        )}
      </div>

      {/* Body — two columns */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          {/* Generate section */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <Sparkles style={{ width: '17px', height: '17px', color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                Generate AI Flashcards
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                value={selectedTopicId}
                onChange={e => {
                  setSelectedTopicId(e.target.value);
                  setGenerateError('');
                  setGenerateSuccess('');
                }}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '0.65rem 0.9rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'auto',
                }}
              >
                <option value="">Select a topic…</option>
                {ALL_TOPICS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.moduleTitle} — {t.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleGenerate}
                disabled={!selectedTopicId || isGenerating}
                className={cn(!selectedTopicId || isGenerating ? '' : 'btn-primary glow-indigo')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: !selectedTopicId || isGenerating ? 'not-allowed' : 'pointer',
                  opacity: !selectedTopicId || isGenerating ? 0.6 : 1,
                  background: !selectedTopicId || isGenerating ? 'var(--bg-card)' : undefined,
                  border: !selectedTopicId || isGenerating ? '1px solid var(--border)' : undefined,
                  color: !selectedTopicId || isGenerating ? 'var(--text-muted)' : undefined,
                  whiteSpace: 'nowrap',
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles style={{ width: '14px', height: '14px' }} />
                    Generate 8 Cards
                  </>
                )}
              </button>
            </div>

            {/* Topic card count hint */}
            {selectedTopicId && topicCardCount > 0 && (
              <div style={{
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.85rem',
                background: 'var(--bg-card)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <Layers style={{ width: '12px', height: '12px', display: 'inline', marginRight: '5px' }} />
                  {topicCardCount} existing cards for this topic
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => startReview(getCardsByTopic(selectedTopicId))}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      background: 'rgba(99,102,241,0.08)',
                      border: '1px solid rgba(99,102,241,0.20)',
                      borderRadius: '6px',
                      padding: '3px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <BookOpen style={{ width: '10px', height: '10px' }} />
                    Review all
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete all ${topicCardCount} cards for "${selectedTopicTitle}"?`)) {
                        clearTopicCards(selectedTopicId);
                        setGenerateSuccess('');
                        setGenerateError('');
                      }
                    }}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#ef4444',
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.20)',
                      borderRadius: '6px',
                      padding: '3px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trash2 style={{ width: '10px', height: '10px' }} />
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Status messages */}
            <AnimatePresence>
              {generateError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                  }}
                >
                  <AlertCircle style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                  {generateError}
                </motion.div>
              )}
              {generateSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                  }}
                >
                  <CheckCircle2 style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                  {generateSuccess}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card list preview for selected topic */}
          {selectedTopicId && getCardsByTopic(selectedTopicId).length > 0 && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen style={{ width: '16px', height: '16px', color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>
                    Cards for "{selectedTopicTitle}"
                  </span>
                </div>
                <button
                  onClick={() => startReview(getCardsByTopic(selectedTopicId))}
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  <Play style={{ width: '11px', height: '11px' }} />
                  Study All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
                {getCardsByTopic(selectedTopicId).map((card, i) => (
                  <div
                    key={card.id}
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      background: 'rgba(99,102,241,0.10)',
                      borderRadius: '5px',
                      padding: '2px 7px',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 3px', lineHeight: 1.4 }}>
                        {card.front}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                        {card.back}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '0.63rem',
                        color: card.nextReview <= Date.now() ? '#f97316' : 'var(--text-muted)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}>
                        {formatNextReview(card.nextReview)}
                      </span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                        ×{card.repetitions} reps
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {totalCount === 0 && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '4rem 2rem',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Brain style={{ width: '30px', height: '30px', color: 'var(--primary)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.4rem' }}>
                  No flashcards yet
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.55 }}>
                  Select a topic above and click "Generate 8 Cards" to create AI-powered flashcards.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Cards use SM-2 spaced repetition — like Anki, but AI-powered.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar — Stats */}
        <div style={{
          width: '280px',
          flexShrink: 0,
          borderLeft: '1px solid var(--border)',
          padding: '1.5rem',
          overflowY: 'auto',
          background: 'var(--bg-void)',
        }}>
          <StatsPanel
            cards={cards}
            dueCount={dueCount}
            totalCount={totalCount}
            onStudyDue={startDueReview}
          />
        </div>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
