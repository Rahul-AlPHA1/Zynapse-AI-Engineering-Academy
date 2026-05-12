import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  ChevronRight,
  Star,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Mic,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { streamContent } from '../services/geminiService';

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'setup' | 'interview' | 'results';
type Difficulty = 'Junior' | 'Mid-level' | 'Senior';

interface RoundResult {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  missed: string;
}

const TRACKS = [
  'Java', 'Spring Boot', 'JavaScript', 'React', 'Node.js',
  'Python', 'System Design', 'DSA', 'Docker', 'AWS',
  'Microservices', 'TypeScript', 'DevOps', 'Machine Learning',
];

const DIFFICULTIES: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'Junior',     label: 'Junior',     desc: '0–2 yrs exp',      color: 'var(--success)' },
  { value: 'Mid-level',  label: 'Mid-level',  desc: '2–5 yrs exp',      color: 'var(--warning)' },
  { value: 'Senior',     label: 'Senior',     desc: '5+ yrs exp',       color: 'var(--danger)'  },
];

const TRACK_ICONS: Record<string, string> = {
  Java: '☕', 'Spring Boot': '🍃', JavaScript: '⚡', React: '⚛️', 'Node.js': '🟢',
  Python: '🐍', 'System Design': '🏗️', DSA: '🧮', Docker: '🐳', AWS: '☁️',
  Microservices: '🔷', TypeScript: '🔷', DevOps: '⚙️', 'Machine Learning': '🤖',
};

const TOTAL_ROUNDS = 5;

// ─── Score color helper ───────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 8) return 'var(--success)';
  if (score >= 5) return 'var(--warning)';
  return 'var(--danger)';
}

function scoreLabel(avg: number): { label: string; icon: typeof CheckCircle2 } {
  if (avg > 7) return { label: 'Excellent',   icon: CheckCircle2 };
  if (avg >= 5) return { label: 'Good',        icon: TrendingUp   };
  return          { label: 'Needs Work',   icon: XCircle      };
}

// ─── Animated score number ────────────────────────────────────────────────────

function ScorePill({ score }: { score: number }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="inline-flex items-center justify-center w-14 h-14 rounded-full text-2xl font-black border-2"
      style={{
        borderColor: scoreColor(score),
        color: scoreColor(score),
        background: `${scoreColor(score)}18`,
      }}
    >
      {score}
    </motion.div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({
  onStart,
}: {
  onStart: (track: string, difficulty: Difficulty) => void;
}) {
  const [track, setTrack]           = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  return (
    <motion.div
      key="setup"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35 }}
      className="flex-1 overflow-y-auto p-6 md:p-10 flex items-start justify-center"
    >
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border mb-2"
            style={{ borderColor: 'var(--border-bright)', color: 'var(--primary)', background: 'var(--primary-glow)' }}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Mock Interview Simulator
          </div>
          <h1 className="text-3xl md:text-4xl font-black" style={{ color: 'var(--text)' }}>
            Practice Like It's <span style={{ color: 'var(--primary)' }}>Real</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            5 rounds with an AI interviewer — personalized questions, instant feedback, and a performance score.
          </p>
        </div>

        {/* Track selection */}
        <div
          className="rounded-2xl border p-6 space-y-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            1. Choose Technology Track
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {TRACKS.map(t => (
              <button
                key={t}
                onClick={() => setTrack(t)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: track === t ? 'var(--primary-glow)' : 'var(--bg-surface)',
                  borderColor: track === t ? 'var(--primary)' : 'var(--border)',
                  color: track === t ? 'var(--primary)' : 'var(--text)',
                  boxShadow: track === t ? '0 0 0 2px var(--primary)33' : undefined,
                }}
              >
                <span className="text-xl">{TRACK_ICONS[t] || '💡'}</span>
                <span className="text-center leading-tight">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty selection */}
        <div
          className="rounded-2xl border p-6 space-y-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            2. Select Difficulty Level
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className="flex flex-col items-center gap-1 p-4 rounded-xl border text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: difficulty === d.value ? `${d.color}18` : 'var(--bg-surface)',
                  borderColor: difficulty === d.value ? d.color : 'var(--border)',
                  color: difficulty === d.value ? d.color : 'var(--text)',
                  boxShadow: difficulty === d.value ? `0 0 0 2px ${d.color}33` : undefined,
                }}
              >
                <span className="text-base font-bold">{d.label}</span>
                <span className="text-xs opacity-70">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Mic,       label: '5 Rounds',       sub: 'Real questions' },
            { icon: Target,    label: 'AI Feedback',     sub: 'After each answer' },
            { icon: Award,     label: 'Score Report',    sub: 'Full breakdown' },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl border text-center"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              <Icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{label}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</span>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          disabled={!track || !difficulty}
          onClick={() => track && difficulty && onStart(track, difficulty)}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.99]"
          style={{
            background: track && difficulty
              ? 'linear-gradient(135deg, var(--primary), var(--accent))'
              : 'var(--bg-card)',
            color: track && difficulty ? '#fff' : 'var(--text-muted)',
            boxShadow: track && difficulty ? '0 8px 32px var(--primary-glow)' : undefined,
          }}
        >
          {!track || !difficulty
            ? 'Select a track and difficulty to begin'
            : <>Start Interview — {track} ({difficulty}) <ChevronRight className="w-5 h-5" /></>
          }
        </button>
      </div>
    </motion.div>
  );
}

// ─── Interview Screen ─────────────────────────────────────────────────────────

function InterviewScreen({
  track,
  difficulty,
  onComplete,
  onAbort,
}: {
  track: string;
  difficulty: Difficulty;
  onComplete: (results: RoundResult[]) => void;
  onAbort: () => void;
}) {
  const [round, setRound]           = useState(1);
  const [question, setQuestion]     = useState('');
  const [questionLoading, setQLoad] = useState(true);
  const [answer, setAnswer]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback]     = useState<{ score: number; feedback: string; missed: string } | null>(null);
  const [results, setResults]       = useState<RoundResult[]>([]);
  const [error, setError]           = useState('');
  const hasGenerated                = useRef(false);

  // Auto-generate question on mount and round change
  const generateQuestion = useCallback(async (currentRound: number) => {
    setQLoad(true);
    setQuestion('');
    setError('');
    const prompt = `You are a senior interviewer at a top tech company. Generate one ${difficulty} level interview question about ${track}. This is question ${currentRound} of ${TOTAL_ROUNDS}. Make it specific and practical. Return ONLY the question text, nothing else.`;
    try {
      let q = '';
      for await (const chunk of streamContent([{ role: 'user', content: prompt }])) {
        q += chunk;
        setQuestion(q);
      }
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to generate question');
    } finally {
      setQLoad(false);
    }
  }, [track, difficulty]);

  // Generate first question once
  if (!hasGenerated.current) {
    hasGenerated.current = true;
    generateQuestion(1);
  }

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    setError('');
    const prompt = `You are a senior interviewer. The candidate answered the following ${track} interview question:\nQuestion: ${question}\nAnswer: ${answer}\nEvaluate in JSON: {"score": 1-10, "feedback": "2-3 sentence evaluation", "missed": "key point they missed if any"}\nReturn ONLY the JSON object.`;
    try {
      let raw = '';
      for await (const chunk of streamContent([{ role: 'user', content: prompt }])) {
        raw += chunk;
      }
      // Extract JSON
      const m = raw.match(/\{[\s\S]*\}/);
      const json = m ? JSON.parse(m[0]) : { score: 5, feedback: raw, missed: '' };
      setFeedback({
        score:    Math.max(1, Math.min(10, Number(json.score) || 5)),
        feedback: json.feedback || '',
        missed:   json.missed   || '',
      });
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to evaluate answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!feedback) return;
    const newResult: RoundResult = { question, answer, ...feedback };
    const newResults = [...results, newResult];
    setResults(newResults);

    if (round >= TOTAL_ROUNDS) {
      onComplete(newResults);
      return;
    }

    const nextRound = round + 1;
    setRound(nextRound);
    setAnswer('');
    setFeedback(null);
    setQuestion('');
    generateQuestion(nextRound);
  };

  return (
    <motion.div
      key="interview"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {/* Top bar */}
      <div
        className="shrink-0 px-6 py-4 flex items-center gap-4 border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <button
          onClick={onAbort}
          className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Exit
        </button>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Round {round} of {TOTAL_ROUNDS}
            </span>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}
            >
              {track} · {difficulty}
            </span>
          </div>
          <ProgressBar current={round - (feedback ? 0 : 1)} total={TOTAL_ROUNDS} />
        </div>
      </div>

      {/* Main content — split layout */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Question panel */}
        <div
          className="lg:w-1/2 flex flex-col p-6 border-b lg:border-b-0 lg:border-r overflow-y-auto"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-void)' }}
        >
          <div className="mb-4">
            <div
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{ borderColor: 'var(--border-bright)', color: 'var(--accent)', background: 'var(--accent-glow)' }}
            >
              <Mic className="w-3 h-3" />
              Interviewer's Question
            </div>
          </div>

          {questionLoading ? (
            <div className="flex-1 flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} />
              <span className="text-sm">Generating your question...</span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1"
            >
              <p
                className="text-lg md:text-xl font-semibold leading-relaxed"
                style={{ color: 'var(--text)' }}
              >
                {question}
              </p>

              {/* Tips */}
              {!feedback && (
                <div
                  className="mt-6 p-4 rounded-xl border text-sm space-y-1"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  <p className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-subtle)' }}>
                    Tips
                  </p>
                  <p>• Be specific — use examples from real projects</p>
                  <p>• Cover core concepts, trade-offs, and edge cases</p>
                  <p>• Structure your answer clearly</p>
                </div>
              )}

              {/* Feedback after submit */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <ScorePill score={feedback.score} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Score: {feedback.score}/10</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {feedback.score >= 8 ? 'Excellent answer!' : feedback.score >= 5 ? 'Good effort.' : 'Keep practising.'}
                      </p>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl border text-sm leading-relaxed"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Feedback
                    </p>
                    {feedback.feedback}
                  </div>

                  {feedback.missed && (
                    <div
                      className="p-4 rounded-xl border text-sm leading-relaxed"
                      style={{ background: `var(--warning)18`, borderColor: `var(--warning)44`, color: 'var(--text)' }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--warning)' }}>
                        What was missing
                      </p>
                      {feedback.missed}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right: Answer panel */}
        <div
          className="lg:w-1/2 flex flex-col p-6 overflow-y-auto"
          style={{ background: 'var(--bg-surface)' }}
        >
          <div className="mb-3">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Your Answer
            </label>
          </div>

          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={!!feedback || submitting}
            placeholder="Type your answer here... Be thorough and specific."
            rows={10}
            className="flex-1 w-full resize-none rounded-xl border p-4 text-sm leading-relaxed transition-all duration-200 outline-none focus:ring-2 disabled:opacity-60"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              minHeight: '200px',
              // @ts-expect-error custom property
              '--tw-ring-color': 'var(--primary)',
            }}
          />

          {error && (
            <div className="mt-3 flex items-start gap-2 text-sm p-3 rounded-lg border"
              style={{ background: `var(--danger)12`, borderColor: `var(--danger)44`, color: 'var(--danger)' }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            {!feedback ? (
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || submitting || questionLoading}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: '#fff',
                  boxShadow: '0 4px 20px var(--primary-glow)',
                }}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Submit Answer</>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: '#fff',
                  boxShadow: '0 4px 20px var(--primary-glow)',
                }}
              >
                {round >= TOTAL_ROUNDS
                  ? <><Award className="w-4 h-4" /> See Results</>
                  : <><ChevronRight className="w-4 h-4" /> Next Question ({round + 1}/{TOTAL_ROUNDS})</>
                }
              </button>
            )}
          </div>

          {/* Round dots */}
          <div className="mt-5 flex items-center justify-center gap-2">
            {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  background: i < round - 1
                    ? 'var(--success)'
                    : i === round - 1
                    ? 'var(--primary)'
                    : 'var(--border)',
                  transform: i === round - 1 ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  results,
  track,
  difficulty,
  onTryAgain,
  onChangeTrack,
}: {
  results: RoundResult[];
  track: string;
  difficulty: Difficulty;
  onTryAgain: () => void;
  onChangeTrack: () => void;
}) {
  const avg = results.reduce((s, r) => s + r.score, 0) / results.length;
  const rounded = Math.round(avg * 10) / 10;
  const { label, icon: LabelIcon } = scoreLabel(avg);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  // Score circle circumference
  const R = 54;
  const circ = 2 * Math.PI * R;
  const pct = avg / 10;
  const dashOffset = circ * (1 - pct);

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 overflow-y-auto p-6 md:p-10 flex items-start justify-center"
    >
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border mb-2"
            style={{ borderColor: 'var(--border-bright)', color: 'var(--primary)', background: 'var(--primary-glow)' }}
          >
            <Award className="w-3.5 h-3.5" />
            Interview Complete
          </div>
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text)' }}>
            Your Performance Report
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {track} · {difficulty} · {TOTAL_ROUNDS} Rounds
          </p>
        </div>

        {/* Score circle */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r={R} fill="none" strokeWidth="10" stroke="var(--border)" />
              <motion.circle
                cx="64" cy="64" r={R}
                fill="none" strokeWidth="10"
                stroke={scoreColor(avg)}
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-4xl font-black"
                style={{ color: scoreColor(avg) }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {rounded}
              </motion.span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>/10</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LabelIcon
              className="w-5 h-5"
              style={{ color: scoreColor(avg) }}
            />
            <span className="text-lg font-bold" style={{ color: scoreColor(avg) }}>
              {label}
            </span>
          </div>

          <p className="text-sm text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
            {avg > 7
              ? 'Outstanding performance! You demonstrated strong expertise across all rounds.'
              : avg >= 5
              ? 'Solid effort with room to deepen your knowledge on a few topics.'
              : 'Keep practising — focus on the missed concepts and revisit core fundamentals.'}
          </p>
        </div>

        {/* Per-round breakdown */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Round Breakdown</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {results.map((r, i) => (
              <div key={i} className="divide-y" style={{ borderColor: 'var(--border)' }}>
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:opacity-80 transition-opacity"
                  onClick={() => setExpandedRound(expandedRound === i ? null : i)}
                >
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: `${scoreColor(r.score)}20`, color: scoreColor(r.score) }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {r.question.length > 80 ? r.question.slice(0, 80) + '…' : r.question}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {r.feedback.length > 60 ? r.feedback.slice(0, 60) + '…' : r.feedback}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-base font-bold" style={{ color: scoreColor(r.score) }}>
                      {r.score}/10
                    </span>
                    <Star
                      className="w-4 h-4 fill-current"
                      style={{ color: scoreColor(r.score) }}
                    />
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expandedRound === i ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-muted)' }}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedRound === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 space-y-3">
                        <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-subtle)' }}>Your Answer</p>
                          <p className="leading-relaxed">{r.answer}</p>
                        </div>
                        <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--bg-surface)', color: 'var(--text)' }}>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Feedback</p>
                          <p className="leading-relaxed">{r.feedback}</p>
                        </div>
                        {r.missed && (
                          <div className="p-3 rounded-lg text-sm" style={{ background: `var(--warning)12`, color: 'var(--text)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--warning)' }}>What was missing</p>
                            <p className="leading-relaxed">{r.missed}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onTryAgain}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 border hover:opacity-80"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={onChangeTrack}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: '#fff',
              boxShadow: '0 4px 20px var(--primary-glow)',
            }}
          >
            <TrendingUp className="w-4 h-4" />
            Change Track
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export function MockInterview() {
  const [screen, setScreen]         = useState<Screen>('setup');
  const [track, setTrack]           = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Junior');
  const [results, setResults]       = useState<RoundResult[]>([]);

  const handleStart = (t: string, d: Difficulty) => {
    setTrack(t);
    setDifficulty(d);
    setResults([]);
    setScreen('interview');
  };

  const handleComplete = (r: RoundResult[]) => {
    setResults(r);
    setScreen('results');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg-void)' }}>
      <AnimatePresence mode="wait">
        {screen === 'setup' && (
          <SetupScreen key="setup" onStart={handleStart} />
        )}
        {screen === 'interview' && (
          <InterviewScreen
            key="interview"
            track={track}
            difficulty={difficulty}
            onComplete={handleComplete}
            onAbort={() => setScreen('setup')}
          />
        )}
        {screen === 'results' && (
          <ResultsScreen
            key="results"
            results={results}
            track={track}
            difficulty={difficulty}
            onTryAgain={() => handleStart(track, difficulty)}
            onChangeTrack={() => setScreen('setup')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
