import { useState, useCallback, useEffect, useRef } from 'react';

const KEY = 'ZYNAPSE_ACHIEVEMENTS';
const LEGACY_KEY = 'AURA_ACHIEVEMENTS';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  unlockedAt?: number; // timestamp
}

const DEFINITIONS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_step',    title: 'First Step',       desc: 'Complete your first topic',          icon: '👣', color: '#34d399' },
  { id: 'on_fire',       title: 'On Fire',           desc: 'Reach a 3-day streak',               icon: '🔥', color: '#f97316' },
  { id: 'week_warrior',  title: 'Week Warrior',      desc: 'Reach a 7-day streak',               icon: '⚔️',  color: '#f59e0b' },
  { id: 'bookworm',      title: 'Bookworm',          desc: 'Complete 10 topics',                 icon: '📚', color: '#6366f1' },
  { id: 'halfway',       title: 'Halfway There',     desc: 'Complete 50% of the curriculum',     icon: '🏅', color: '#22d3ee' },
  { id: 'completionist', title: 'Completionist',     desc: 'Complete 100% of the curriculum',    icon: '🏆', color: '#fbbf24' },
  { id: 'note_taker',   title: 'Note Taker',         desc: 'Write your first topic note',        icon: '📝', color: '#a78bfa' },
  { id: 'collector',    title: 'Collector',           desc: 'Bookmark 5 topics',                  icon: '⭐', color: '#facc15' },
  { id: 'level5',       title: 'Rising Star',         desc: 'Reach Level 5',                      icon: '🌟', color: '#818cf8' },
  { id: 'level10',      title: 'Fellow Engineer',     desc: 'Reach Level 10',                     icon: '🎓', color: '#c084fc' },
  { id: 'xp1000',       title: 'XP Grinder',          desc: 'Earn 1000 XP',                       icon: '⚡', color: '#fb923c' },
  { id: 'quiz_champ',   title: 'Quiz Champion',       desc: 'Open 5 quiz topics',                 icon: '🧠', color: '#38bdf8' },
];

type UnlockedMap = Record<string, number>; // id → timestamp

function load(): UnlockedMap {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (raw && !localStorage.getItem(KEY)) localStorage.setItem(KEY, raw);
    return JSON.parse(raw || '{}');
  } catch { return {}; }
}
function save(m: UnlockedMap) { localStorage.setItem(KEY, JSON.stringify(m)); }

export interface AchievementCheckInput {
  completedCount: number;
  totalTopics: number;
  streak: number;
  level: number;
  xp: number;
  bookmarkCount: number;
  hasNote: boolean;
  quizOpenCount: number;
}

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<UnlockedMap>(load);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const checkedRef = useRef<Set<string>>(new Set(Object.keys(load())));

  const check = useCallback((input: AchievementCheckInput) => {
    const { completedCount, totalTopics, streak, level, xp, bookmarkCount, hasNote, quizOpenCount } = input;
    const pct = totalTopics > 0 ? completedCount / totalTopics : 0;

    const conditions: Record<string, boolean> = {
      first_step:    completedCount >= 1,
      on_fire:       streak >= 3,
      week_warrior:  streak >= 7,
      bookworm:      completedCount >= 10,
      halfway:       pct >= 0.5,
      completionist: pct >= 1,
      note_taker:    hasNote,
      collector:     bookmarkCount >= 5,
      level5:        level >= 5,
      level10:       level >= 10,
      xp1000:        xp >= 1000,
      quiz_champ:    quizOpenCount >= 5,
    };

    setUnlocked(prev => {
      const next = { ...prev };
      const fresh: Achievement[] = [];
      for (const def of DEFINITIONS) {
        if (!next[def.id] && conditions[def.id]) {
          next[def.id] = Date.now();
          if (!checkedRef.current.has(def.id)) {
            fresh.push({ ...def, unlockedAt: next[def.id] });
            checkedRef.current.add(def.id);
          }
        }
      }
      if (fresh.length) {
        save(next);
        setNewlyUnlocked(q => [...q, ...fresh]);
      }
      return fresh.length ? next : prev;
    });
  }, []);

  const dismissNew = useCallback(() => setNewlyUnlocked([]), []);

  const allAchievements: Achievement[] = DEFINITIONS.map(d => ({
    ...d,
    unlockedAt: unlocked[d.id],
  }));

  return { allAchievements, newlyUnlocked, dismissNew, check, unlockedCount: Object.keys(unlocked).length };
}
