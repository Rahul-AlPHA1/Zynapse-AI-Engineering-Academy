import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'ZYNAPSE_COMPLETED_TOPICS';
const LEGACY_STORAGE_KEY = 'AURA_COMPLETED_TOPICS';

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw && !localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, raw);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompleted());

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCompleted(loadCompleted());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const markComplete = useCallback((topicId: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(topicId);
      saveCompleted(next);
      return next;
    });
  }, []);

  const markIncomplete = useCallback((topicId: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.delete(topicId);
      saveCompleted(next);
      return next;
    });
  }, []);

  const toggleComplete = useCallback((topicId: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      saveCompleted(next);
      return next;
    });
  }, []);

  const isComplete = useCallback((topicId: string) => completed.has(topicId), [completed]);

  return { completed, markComplete, markIncomplete, toggleComplete, isComplete };
}
