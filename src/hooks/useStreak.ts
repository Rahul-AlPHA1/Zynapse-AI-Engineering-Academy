import { useState, useCallback, useEffect } from 'react';

const KEY = 'ZYNAPSE_GAMIFICATION';
const LEGACY_KEY = 'AURA_GAMIFICATION';

const LEVEL_TITLES = [
  '', 'Initiate', 'Apprentice', 'Developer', 'Engineer', 'Architect',
  'Senior Dev', 'Tech Lead', 'Principal', 'Staff Eng', 'Distinguished', 'Fellow',
];

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 18000, 25000];

export function getLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)] || 'Master';
}

export function xpForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)] ?? 25000;
}

export function xpForCurrentLevel(level: number): number {
  return LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)] ?? 0;
}

interface GamificationState {
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // 'YYYY-MM-DD'
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): GamificationState {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (raw && !localStorage.getItem(KEY)) localStorage.setItem(KEY, raw);
    if (raw) return JSON.parse(raw) as GamificationState;
  } catch { /* empty */ }
  return { xp: 0, streak: 0, longestStreak: 0, lastActiveDate: '' };
}

function save(s: GamificationState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function useStreak() {
  const [state, setState] = useState<GamificationState>(load);

  // Check/update streak on mount
  useEffect(() => {
    setState(prev => {
      const td = today();
      if (prev.lastActiveDate === td) return prev; // already counted today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yd = yesterday.toISOString().slice(0, 10);

      const newStreak = prev.lastActiveDate === yd ? prev.streak + 1 : 1;
      const next: GamificationState = {
        ...prev,
        streak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActiveDate: td,
        xp: prev.xp + 25, // daily login XP
      };
      save(next);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const td = today();
      const newStreak = prev.lastActiveDate === td ? prev.streak : prev.streak + 1;
      const next: GamificationState = {
        ...prev,
        xp: prev.xp + amount,
        streak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActiveDate: td,
      };
      save(next);
      return next;
    });
  }, []);

  const level = getLevel(state.xp);
  const levelTitle = getLevelTitle(level);
  const xpInLevel = state.xp - xpForCurrentLevel(level);
  const xpNeeded = xpForNextLevel(level) - xpForCurrentLevel(level);
  const levelPct = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  return {
    xp: state.xp,
    streak: state.streak,
    longestStreak: state.longestStreak,
    level,
    levelTitle,
    levelPct,
    xpInLevel,
    xpNeeded,
    addXP,
  };
}
