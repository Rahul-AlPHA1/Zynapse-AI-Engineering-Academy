import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock, Loader2, Sparkles, Target, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { streamContent } from '../services/geminiService';
import { curriculum } from '../data/curriculum';
import { cn } from '../lib/utils';

type Difficulty = 'steady' | 'focused' | 'intense';

interface StudyTask {
  id: string;
  title: string;
  description: string;
  moduleId?: string;
  topicId?: string;
  xp: number;
}

interface StudyDay {
  day: number;
  focus: string;
  estimatedMinutes: number;
  tasks: StudyTask[];
}

interface StudyPlan {
  id: string;
  title: string;
  summary: string;
  stack: string;
  days: number;
  hoursPerDay: number;
  createdAt: number;
  schedule: StudyDay[];
}

const PLANS_KEY = 'ZYNAPSE_STUDY_PLANS';
const DONE_KEY = 'ZYNAPSE_STUDY_PLAN_DONE';

const STACKS = [
  'Full Stack JavaScript',
  'Java Backend Engineer',
  'Frontend Engineer',
  'AI / Agent Engineer',
  'DevOps / Cloud Engineer',
  'Systems Engineer',
  'Interview Preparation',
];

function loadPlans(): StudyPlan[] {
  try { return JSON.parse(localStorage.getItem(PLANS_KEY) || '[]'); } catch { return []; }
}

function loadDone(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]')); } catch { return new Set(); }
}

function saveDone(done: Set<string>) {
  localStorage.setItem(DONE_KEY, JSON.stringify([...done]));
}

function learnableTopics() {
  return curriculum.flatMap(module =>
    module.sections.flatMap(section =>
      section.topics
        .filter(topic => {
          const text = `${topic.id} ${topic.title}`.toLowerCase();
          return !text.includes('interview') && !text.includes('quiz');
        })
        .map(topic => ({ moduleId: module.id, moduleTitle: module.title, topicId: topic.id, title: topic.title }))
    )
  );
}

function extractPlan(text: string): StudyPlan | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const source = fenced ? fenced[1] : text;
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  return JSON.parse(source.slice(start, end + 1));
}

function fallbackPlan(stack: string, days: number, hoursPerDay: number): StudyPlan {
  const topics = learnableTopics();
  const perDay = Math.max(2, Math.min(5, Math.round(hoursPerDay * 1.5)));
  const schedule: StudyDay[] = [];

  for (let day = 1; day <= days; day++) {
    const start = (day - 1) * perDay;
    const slice = topics.slice(start, start + perDay);
    schedule.push({
      day,
      focus: day === days ? 'Review, build, and consolidate' : slice[0]?.moduleTitle || stack,
      estimatedMinutes: hoursPerDay * 60,
      tasks: slice.map((topic, index) => ({
        id: `day-${day}-${topic.topicId}`,
        title: topic.title,
        description: index === slice.length - 1 ? 'Review notes and create one practical example.' : 'Study the concept and write a short summary.',
        moduleId: topic.moduleId,
        topicId: topic.topicId,
        xp: 20,
      })),
    });
  }

  return {
    id: `plan-${Date.now()}`,
    title: `${stack} ${days}-Day Study Plan`,
    summary: `A practical ${days}-day plan with daily focus blocks and learning tasks.`,
    stack,
    days,
    hoursPerDay,
    createdAt: Date.now(),
    schedule,
  };
}

function buildPrompt(stack: string, days: number, hoursPerDay: number, difficulty: Difficulty) {
  const moduleList = curriculum.map(m => `${m.id}: ${m.title}`).join('\n');
  return `You are Zynapse, a senior learning architect.

Create a ${days}-day study plan for: ${stack}
Daily availability: ${hoursPerDay} hours
Intensity: ${difficulty}

Available Zynapse modules:
${moduleList}

Return ONLY valid JSON:
{
  "title": "Plan title",
  "summary": "One sentence summary",
  "stack": "${stack}",
  "days": ${days},
  "hoursPerDay": ${hoursPerDay},
  "schedule": [
    {
      "day": 1,
      "focus": "day focus",
      "estimatedMinutes": 90,
      "tasks": [
        {
          "id": "stable-task-id",
          "title": "task title",
          "description": "specific action",
          "moduleId": "optional existing module id",
          "topicId": "optional existing topic id",
          "xp": 20
        }
      ]
    }
  ]
}

Rules:
- 2 to 5 tasks per day.
- Include review/build days.
- Use real moduleId/topicId when possible.
- Keep task descriptions actionable and short.`;
}

export function StudyPlanner() {
  const [stack, setStack] = useState(STACKS[0]);
  const [days, setDays] = useState(14);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [difficulty, setDifficulty] = useState<Difficulty>('focused');
  const [plans, setPlans] = useState<StudyPlan[]>(loadPlans);
  const [done, setDone] = useState<Set<string>>(loadDone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activePlan = plans[0] ?? null;
  const totalTasks = activePlan?.schedule.reduce((sum, day) => sum + day.tasks.length, 0) ?? 0;
  const doneTasks = activePlan?.schedule.reduce((sum, day) => sum + day.tasks.filter(task => done.has(task.id)).length, 0) ?? 0;
  const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const moduleTitleById = useMemo(() => new Map(curriculum.map(m => [m.id, m.title])), []);

  const generatePlan = async () => {
    setLoading(true);
    setError('');
    try {
      let buffer = '';
      for await (const chunk of streamContent([{ role: 'user', content: buildPrompt(stack, days, hoursPerDay, difficulty) }])) {
        buffer += chunk;
      }
      const parsed = extractPlan(buffer) ?? fallbackPlan(stack, days, hoursPerDay);
      const plan: StudyPlan = {
        ...parsed,
        id: `plan-${Date.now()}`,
        stack,
        days,
        hoursPerDay,
        createdAt: Date.now(),
        schedule: parsed.schedule?.length ? parsed.schedule : fallbackPlan(stack, days, hoursPerDay).schedule,
      };
      const next = [plan, ...plans].slice(0, 8);
      setPlans(next);
      localStorage.setItem(PLANS_KEY, JSON.stringify(next));
    } catch (err) {
      const plan = fallbackPlan(stack, days, hoursPerDay);
      const next = [plan, ...plans].slice(0, 8);
      setPlans(next);
      localStorage.setItem(PLANS_KEY, JSON.stringify(next));
      setError(err instanceof Error ? `${err.message}. Showing a built-in plan.` : 'AI failed. Showing a built-in plan.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      saveDone(next);
      return next;
    });
  };

  const clearPlans = () => {
    setPlans([]);
    localStorage.removeItem(PLANS_KEY);
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
              style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.25)', color: 'var(--primary-light)' }}>
              <CalendarDays className="w-3.5 h-3.5" />
              Study Planner
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Build your weekly execution plan</h1>
            <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>
              Pick a target stack, daily time, and intensity. Zynapse turns it into a day-by-day learning plan.
            </p>
          </div>

          {activePlan && (
            <div className="rounded-2xl border p-4 min-w-[240px]" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Current Plan</span>
                <span className="text-xs font-black" style={{ color: 'var(--primary-light)' }}>{progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,var(--primary),var(--accent))' }} />
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>{doneTasks}/{totalTasks} tasks completed</p>
            </div>
          )}
        </div>

        <div className="grid xl:grid-cols-[380px_1fr] gap-5">
          <aside className="rounded-2xl border p-5 h-fit" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Target Stack</span>
                <select value={stack} onChange={e => setStack(e.target.value)} className="mt-2 w-full px-3 py-3 rounded-xl border text-sm font-bold outline-none"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  {STACKS.map(item => <option key={item}>{item}</option>)}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Days</span>
                  <input type="number" min={3} max={90} value={days} onChange={e => setDays(Number(e.target.value))}
                    className="mt-2 w-full px-3 py-3 rounded-xl border text-sm font-bold outline-none"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Hours / day</span>
                  <input type="number" min={1} max={8} value={hoursPerDay} onChange={e => setHoursPerDay(Number(e.target.value))}
                    className="mt-2 w-full px-3 py-3 rounded-xl border text-sm font-bold outline-none"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                </label>
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Intensity</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(['steady', 'focused', 'intense'] as Difficulty[]).map(item => (
                    <button key={item} onClick={() => setDifficulty(item)}
                      className="px-3 py-2 rounded-xl border text-xs font-black capitalize transition-all"
                      style={{
                        background: difficulty === item ? 'rgba(99,102,241,0.18)' : 'var(--bg-card)',
                        borderColor: difficulty === item ? 'var(--primary)' : 'var(--border)',
                        color: difficulty === item ? 'var(--primary-light)' : 'var(--text-muted)',
                      }}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generatePlan} disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,var(--primary),#4f46e5)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Generating Plan...' : 'Generate Study Plan'}
              </button>

              {plans.length > 0 && (
                <button onClick={clearPlans} className="w-full px-4 py-2 rounded-xl border text-sm font-bold flex items-center justify-center gap-2"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <Trash2 className="w-4 h-4" />
                  Clear Plans
                </button>
              )}

              {error && <p className="text-xs leading-relaxed text-amber-500">{error}</p>}
            </div>
          </aside>

          <main className="space-y-4">
            {!activePlan ? (
              <div className="rounded-3xl border min-h-[420px] flex items-center justify-center p-8 text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
                <div className="max-w-md">
                  <Target className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--primary-light)' }} />
                  <h2 className="text-2xl font-black" style={{ color: 'var(--text)' }}>No study plan yet</h2>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Generate your first plan and Zynapse will turn your target stack into daily execution blocks.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="rounded-3xl border p-5 mb-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
                  <h2 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{activePlan.title}</h2>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{activePlan.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)' }}>{activePlan.stack}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>{activePlan.days} days</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                      <Clock className="w-3 h-3" /> {activePlan.hoursPerDay}h/day
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {activePlan.schedule.map((day, dayIndex) => {
                    const dayDone = day.tasks.every(task => done.has(task.id));
                    return (
                      <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: dayIndex * 0.03 }}
                        className="rounded-2xl border overflow-hidden"
                        style={{ background: 'var(--bg-surface)', borderColor: dayDone ? 'rgba(16,185,129,0.45)' : 'var(--border)', boxShadow: 'var(--card-shadow)' }}
                      >
                        <div className="px-4 py-3 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider" style={{ color: dayDone ? '#10b981' : 'var(--primary-light)' }}>Day {day.day}</p>
                            <h3 className="font-bold" style={{ color: 'var(--text)' }}>{day.focus}</h3>
                          </div>
                          <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{day.estimatedMinutes} min</span>
                        </div>
                        <div className="p-3 space-y-2">
                          {day.tasks.map(task => {
                            const checked = done.has(task.id);
                            return (
                              <button key={task.id} onClick={() => toggleTask(task.id)}
                                className={cn('w-full text-left p-3 rounded-xl border transition-all flex gap-3', checked && 'opacity-70')}
                                style={{ background: checked ? 'rgba(16,185,129,0.08)' : 'var(--bg-card)', borderColor: checked ? 'rgba(16,185,129,0.35)' : 'var(--border)' }}>
                                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: checked ? '#10b981' : 'var(--text-subtle)' }} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{task.title}</p>
                                    {task.moduleId && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)' }}>
                                        {moduleTitleById.get(task.moduleId) || task.moduleId}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
                                </div>
                                <span className="text-xs font-black text-yellow-500">+{task.xp || 20} XP</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
