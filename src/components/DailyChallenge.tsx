import { useState, useEffect, useRef } from 'react';
import { Zap, RefreshCw, CheckCircle2, Clock, Flame, Trophy, ChevronRight } from 'lucide-react';
import { createChatSession } from '../services/geminiService';

interface DailyChallengeProps {
  language: string;
  streak: number;
  onXP: (amount: number) => void;
}

const TOPICS = [
  'JavaScript closures and scope', 'Python list comprehensions', 'Java generics',
  'React hooks patterns', 'SQL JOIN types', 'Git branching strategy',
  'REST API design principles', 'Big-O complexity analysis', 'Docker networking',
  'System design: rate limiting', 'CSS flexbox vs grid', 'TypeScript utility types',
  'Node.js event loop', 'Kubernetes pods and services', 'Redis caching patterns',
  'Microservices vs monolith', 'Database indexing strategies', 'OAuth 2.0 flow',
  'WebSockets vs HTTP polling', 'CI/CD pipeline design',
];

function getTodayTopic(): string {
  const d = new Date();
  const dayIndex = Math.floor(d.getTime() / 86_400_000) % TOPICS.length;
  return TOPICS[dayIndex];
}

const todayStamp = new Date().toISOString().slice(0, 10);
const TODAY_KEY = 'ZYNAPSE_DAILY_' + todayStamp;
const LEGACY_TODAY_KEY = 'AURA_DAILY_' + todayStamp;

export function DailyChallenge({ language, streak, onXP }: DailyChallengeProps) {
  const [challenge, setChallenge] = useState<string>('');
  const [answer, setAnswer]       = useState('');
  const [feedback, setFeedback]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [done, setDone]           = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const abortRef = useRef(false);
  const sessionRef = useRef<any>(null);
  const topic = getTodayTopic();

  // Timer
  useEffect(() => {
    const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
    const tick = () => setSecondsLeft(Math.floor((midnight.getTime() - Date.now()) / 1000));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  // Check if already done today
  useEffect(() => {
    const saved = localStorage.getItem(TODAY_KEY) ?? localStorage.getItem(LEGACY_TODAY_KEY);
    if (saved && !localStorage.getItem(TODAY_KEY)) localStorage.setItem(TODAY_KEY, saved);
    if (saved) { setChallenge(saved); setDone(true); }
    else generateChallenge();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateChallenge() {
    setLoading(true); setChallenge(''); abortRef.current = false;
    const session = createChatSession(language);
    sessionRef.current = session;
    const prompt = `You are Zynapse, a senior software engineering mentor.

Generate ONE daily coding/concept challenge on the topic: "${topic}".

Format (use markdown):
## 🎯 Daily Challenge
**Topic:** ${topic}

[2-3 sentence problem description or question]

**Task:** [What they need to write/explain/solve]

\`\`\`[language hint if applicable]
// starter code or hint if needed
\`\`\`

Keep it solvable in 5-10 minutes. Generate in ${language}.`;
    try {
      let text = '';
      for await (const chunk of session.sendMessageStream(prompt)) {
        if (abortRef.current) break;
        text += chunk; setChallenge(text);
      }
      setLoading(false);
    } catch { setLoading(false); }
  }

  async function evaluateAnswer() {
    if (!answer.trim() || !sessionRef.current) return;
    setEvaluating(true); setFeedback('');
    try {
      const prompt = `The user answered the daily challenge on "${topic}". Evaluate concisely:

Their answer:
${answer}

Give:
1. Score (1–10)
2. What's correct
3. What could be improved (2-3 lines max)
4. One key takeaway

Be encouraging. Respond in ${language}.`;
      let text = '';
      for await (const chunk of sessionRef.current.sendMessageStream(prompt)) {
        text += chunk; setFeedback(text);
      }
      // Mark done
      localStorage.setItem(TODAY_KEY, challenge);
      setDone(true);
      onXP(75);
    } catch { /* ignore */ }
    setEvaluating(false);
  }

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-10" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-orange-500/30" style={{ background: 'rgba(249,115,22,0.12)' }}>
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Daily Challenge</h2>
              <p className="text-zinc-500 text-xs">One challenge per day · +75 XP on completion</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-500/20"
                style={{ background: 'rgba(249,115,22,0.08)' }}>
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-400 text-sm font-bold">{streak} day streak</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-zinc-600">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{hh}:{mm}:{ss}</span>
            </div>
          </div>
        </div>

        {/* Topic badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Today's Topic</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-orange-300 border border-orange-500/25"
            style={{ background: 'rgba(249,115,22,0.1)' }}>
            {topic}
          </span>
          {done && <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Completed today!</span>}
        </div>

        {/* Challenge card */}
        <div className="rounded-2xl border border-white/10 overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400">Challenge</span>
            {!loading && !done && (
              <button onClick={() => { setChallenge(''); setAnswer(''); setFeedback(''); generateChallenge(); }}
                className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            )}
          </div>
          <div className="p-5">
            {loading && !challenge ? (
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                Generating today's challenge…
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{challenge}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Answer area */}
        {!done && challenge && (
          <div className="rounded-2xl border border-white/10 overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <span className="text-xs font-bold text-zinc-400">Your Answer</span>
            </div>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Write your solution or explanation here…"
              rows={8}
              className="w-full p-5 bg-transparent text-sm text-zinc-300 placeholder-zinc-700 resize-y focus:outline-none font-mono leading-relaxed"
            />
          </div>
        )}

        {/* Submit */}
        {!done && challenge && (
          <button
            onClick={evaluateAnswer}
            disabled={evaluating || !answer.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 mb-4"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', color: 'white', boxShadow: '0 0 20px rgba(249,115,22,0.25)' }}
          >
            {evaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {evaluating ? 'Evaluating…' : 'Submit Answer (+75 XP)'}
          </button>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="rounded-2xl border border-emerald-500/20 overflow-hidden" style={{ background: 'rgba(52,211,153,0.05)' }}>
            <div className="px-5 py-3 border-b border-emerald-500/10 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">AI Mentor Feedback</span>
            </div>
            <div className="p-5 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{feedback}</div>
          </div>
        )}

        {done && !feedback && (
          <div className="text-center py-8 text-zinc-600">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-600 opacity-50" />
            <p className="font-semibold text-zinc-400">Challenge completed for today!</p>
            <p className="text-sm mt-1">Come back tomorrow for a new challenge.</p>
          </div>
        )}
      </div>
    </div>
  );
}
