import { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts';
import {
  Zap, Flame, Trophy, BookOpen, Target, Calendar,
  BookMarked, FileText, Clock, TrendingUp,
} from 'lucide-react';
import { curriculum } from '../data/curriculum';

// ─── helpers ─────────────────────────────────────────────────────────────────

function isLearnableTopic(title: string, id: string): boolean {
  const t = title.toLowerCase();
  const i = id.toLowerCase();
  return (
    !t.includes('interview') && !i.includes('interview') &&
    !t.includes('quiz')      && !i.includes('quiz')
  );
}

function shortLabel(title: string): string {
  // Strip common prefixes and keep ≤16 chars
  const cleaned = title
    .replace(/Complete Syllabus/i, '')
    .replace(/Architecture/i, 'Arch.')
    .trim();
  return cleaned.length > 16 ? cleaned.slice(0, 15) + '…' : cleaned;
}

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getLevelTitle(level: number): string {
  const TITLES = [
    '', 'Initiate', 'Apprentice', 'Developer', 'Engineer', 'Architect',
    'Senior Dev', 'Tech Lead', 'Principal', 'Staff Eng', 'Distinguished', 'Fellow',
  ];
  return TITLES[Math.min(level, TITLES.length - 1)] || 'Master';
}

// ─── Tooltip style ───────────────────────────────────────────────────────────

const tooltipStyle = {
  contentStyle: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '0.8rem',
  },
  cursor: { fill: 'rgba(99,102,241,0.08)' },
};

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`rounded-2xl border p-5 ${className}`}
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <Card delay={delay} className="flex flex-col gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '22' }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <p className="text-3xl font-bold mt-0.5 leading-none" style={{ color: 'var(--text)' }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

function ActivityHeatmap({ history }: { history: { date: string; xp: number }[] }) {
  const days = getLast30Days();
  const xpByDate: Record<string, number> = {};
  history.forEach(h => { xpByDate[h.date] = h.xp; });

  // Compute daily gain (diff between consecutive entries)
  const gainByDate: Record<string, number> = {};
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  sorted.forEach((entry, idx) => {
    if (idx === 0) {
      gainByDate[entry.date] = entry.xp;
    } else {
      gainByDate[entry.date] = Math.max(0, entry.xp - sorted[idx - 1].xp);
    }
  });

  const maxGain = Math.max(1, ...Object.values(gainByDate));

  function cellColor(date: string): string {
    const gain = gainByDate[date] ?? 0;
    if (gain === 0) return 'var(--bg-surface)';
    const ratio = gain / maxGain;
    if (ratio < 0.33) return 'rgba(99,102,241,0.30)';
    if (ratio < 0.66) return 'rgba(99,102,241,0.60)';
    return '#6366f1';
  }

  const hasAnyActivity = Object.values(gainByDate).some(v => v > 0);

  return (
    <div>
      {!hasAnyActivity ? (
        <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
          Start learning to build your activity history
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {days.map(day => {
            const gain = gainByDate[day] ?? 0;
            return (
              <div
                key={day}
                title={`${day}: +${gain} XP`}
                className="w-7 h-7 rounded-md transition-all duration-150 hover:scale-110 cursor-default"
                style={{ background: cellColor(day), border: '1px solid var(--border)' }}
              />
            );
          })}
        </div>
      )}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Less</span>
        {['rgba(99,102,241,0)', 'rgba(99,102,241,0.30)', 'rgba(99,102,241,0.60)', '#6366f1'].map((c, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded"
            style={{ background: c === 'rgba(99,102,241,0)' ? 'var(--bg-surface)' : c, border: '1px solid var(--border)' }}
          />
        ))}
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  // ── Read from localStorage ──────────────────────────────────────────────
  const completedRaw = localStorage.getItem('ZYNAPSE_COMPLETED_TOPICS') ?? localStorage.getItem('AURA_COMPLETED_TOPICS');
  const completed: string[] = completedRaw ? JSON.parse(completedRaw) : [];
  const completedSet = new Set(completed);

  const gamRaw = localStorage.getItem('ZYNAPSE_GAMIFICATION') ?? localStorage.getItem('AURA_GAMIFICATION');
  const gam = gamRaw ? JSON.parse(gamRaw) : { xp: 0, streak: 0, level: 1 };
  const xp: number = gam.xp ?? 0;
  const streak: number = gam.streak ?? 0;
  const level: number = gam.level ?? 1;

  const bkRaw = localStorage.getItem('ZYNAPSE_BOOKMARKS') ?? localStorage.getItem('AURA_BOOKMARKS');
  const bookmarks: string[] = bkRaw ? JSON.parse(bkRaw) : [];

  const noteIds = Object.keys(localStorage).filter(k => k.startsWith('ZYNAPSE_NOTE_') || k.startsWith('AURA_NOTE_'));

  // ── XP History: record today's snapshot on mount ─────────────────────
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const history = JSON.parse(localStorage.getItem('ZYNAPSE_XP_HISTORY') || '[]');
    const todayEntry = history.find((h: { date: string; xp: number }) => h.date === today);
    if (!todayEntry) {
      history.push({ date: today, xp });
      if (history.length > 60) history.shift();
      localStorage.setItem('ZYNAPSE_XP_HISTORY', JSON.stringify(history));
    }
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const xpHistory: { date: string; xp: number }[] = JSON.parse(
    localStorage.getItem('ZYNAPSE_XP_HISTORY') || '[]'
  );

  // ── Derived analytics ────────────────────────────────────────────────
  const { allLearnTopics, moduleStats, overallPct } = useMemo(() => {
    const allLearnTopics = curriculum.flatMap(m =>
      m.sections.flatMap(s =>
        s.topics.filter(t => isLearnableTopic(t.title, t.id))
      )
    );

    const moduleStats = curriculum.map(mod => {
      const learnTopics = mod.sections.flatMap(s =>
        s.topics.filter(t => isLearnableTopic(t.title, t.id))
      );
      const completedCount = learnTopics.filter(t => completedSet.has(t.id)).length;
      const total = learnTopics.length;
      const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
      return {
        name: shortLabel(mod.title),
        fullName: mod.title,
        total,
        completed: completedCount,
        pct,
      };
    }).filter(m => m.total > 0);

    const totalLearnable = allLearnTopics.length;
    const totalCompleted = allLearnTopics.filter(t => completedSet.has(t.id)).length;
    const overallPct = totalLearnable > 0
      ? Math.round((totalCompleted / totalLearnable) * 100)
      : 0;

    return { allLearnTopics, moduleStats, overallPct };
  }, [completedSet]);

  // Top 10 modules by total topic count
  const top10Modules = useMemo(() =>
    [...moduleStats]
      .sort((a, b) => b.total - a.total)
      .slice(0, 10),
    [moduleStats]
  );

  // Top 5 completed modules
  const top5Completed = useMemo(() =>
    [...moduleStats]
      .sort((a, b) => b.completed - a.completed)
      .filter(m => m.completed > 0)
      .slice(0, 5),
    [moduleStats]
  );

  const studyMinutes = completed.length * 15;
  const studyHours = Math.floor(studyMinutes / 60);
  const studyMins = studyMinutes % 60;
  const studyTimeLabel = studyHours > 0
    ? `${studyHours}h ${studyMins}m`
    : `${studyMins}m`;

  const radialData = [
    { name: 'Progress', value: overallPct, fill: '#6366f1' },
  ];

  const levelTitle = getLevelTitle(level);

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: 'var(--bg-void)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--primary)', boxShadow: '0 0 16px var(--primary-glow)' }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Learning Analytics
            </h1>
          </div>
          <p className="text-sm ml-12" style={{ color: 'var(--text-muted)' }}>
            Your personalized progress snapshot across the entire curriculum
          </p>
        </motion.div>

        {/* ── Hero stats row ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Zap}
            label="Total XP Earned"
            value={xp.toLocaleString()}
            sub="experience points"
            color="#6366f1"
            delay={0.05}
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={streak}
            sub={streak === 1 ? 'day in a row' : 'days in a row'}
            color="#f97316"
            delay={0.10}
          />
          <StatCard
            icon={BookOpen}
            label="Topics Completed"
            value={completed.length}
            sub={`of ${allLearnTopics.length} learnable`}
            color="#10b981"
            delay={0.15}
          />
          <StatCard
            icon={Trophy}
            label="Level Achieved"
            value={level}
            sub={levelTitle}
            color="#f59e0b"
            delay={0.20}
          />
        </div>

        {/* ── Charts row ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Module Progress Bar Chart — takes 2/3 width */}
          <Card delay={0.25} className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                Module Progress
              </h2>
              <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                Top 10 by topic count
              </span>
            </div>
            {top10Modules.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>
                No data yet — start completing topics!
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={top10Modules}
                  margin={{ top: 4, right: 8, left: -20, bottom: 40 }}
                  barCategoryGap="28%"
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(val: number, _name: string, props: { payload?: { fullName: string; completed: number; total: number } }) => [
                      `${val}% (${props.payload?.completed ?? 0}/${props.payload?.total ?? 0} topics)`,
                      props.payload?.fullName ?? '',
                    ]}
                  />
                  <Bar
                    dataKey="pct"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Completion Ring — takes 1/3 width */}
          <Card delay={0.30} className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-3 self-start">
              <div
                className="w-4 h-4 rounded"
                style={{ background: 'var(--primary)' }}
              />
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                Overall Completion
              </h2>
            </div>
            <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="95%"
                  startAngle={90}
                  endAngle={-270}
                  data={radialData}
                  barSize={12}
                >
                  <RadialBar
                    background={{ fill: 'var(--bg-surface)' }}
                    dataKey="value"
                    cornerRadius={6}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              {/* Center number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>
                  {overallPct}%
                </span>
                <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  complete
                </span>
              </div>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
              {completed.length} of {allLearnTopics.length} topics
            </p>
          </Card>
        </div>

        {/* ── Activity Heatmap ─────────────────────────────────── */}
        <Card delay={0.35}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              Activity — Last 30 Days
            </h2>
            <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
              XP gained per day
            </span>
          </div>
          <ActivityHeatmap history={xpHistory} />
        </Card>

        {/* ── Breakdown row ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top completed modules */}
          <Card delay={0.40}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--success)' }} />
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                Top Completed Modules
              </h2>
            </div>
            {top5Completed.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                Complete topics to see module rankings
              </p>
            ) : (
              <ol className="space-y-2.5">
                {top5Completed.map((mod, idx) => (
                  <li key={mod.name} className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: idx === 0 ? '#f59e0b22' : 'var(--bg-surface)',
                        color: idx === 0 ? '#f59e0b' : 'var(--text-muted)',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                        {mod.fullName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'var(--bg-surface)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${mod.pct}%`, background: 'var(--primary)' }}
                          />
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {mod.completed}/{mod.total}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {/* Quick stats */}
          <Card delay={0.45}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                Quick Stats
              </h2>
            </div>
            <ul className="space-y-3">
              {[
                {
                  icon: BookMarked,
                  label: 'Bookmarked Topics',
                  value: bookmarks.length.toLocaleString(),
                  color: '#0ea5e9',
                },
                {
                  icon: FileText,
                  label: 'Notes Taken',
                  value: noteIds.length.toLocaleString(),
                  color: '#10b981',
                },
                {
                  icon: Clock,
                  label: 'Est. Study Time',
                  value: studyTimeLabel,
                  color: '#f59e0b',
                },
                {
                  icon: Trophy,
                  label: 'XP This Level',
                  value: `Lv. ${level} — ${levelTitle}`,
                  color: '#6366f1',
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <li key={label} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: color + '22' }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="flex-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

      </div>
    </div>
  );
}
