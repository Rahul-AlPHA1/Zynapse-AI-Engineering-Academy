import { useState, useCallback } from 'react';

const PREFIX = 'ZYNAPSE_NOTE_';
const LEGACY_PREFIX = 'AURA_NOTE_';

function loadNote(topicId: string): string {
  const value = localStorage.getItem(PREFIX + topicId) ?? localStorage.getItem(LEGACY_PREFIX + topicId) ?? '';
  if (value && !localStorage.getItem(PREFIX + topicId)) localStorage.setItem(PREFIX + topicId, value);
  return value;
}

export function useNotes() {
  const [cache, setCache] = useState<Record<string, string>>({});

  const getNote = useCallback((topicId: string): string => {
    if (cache[topicId] !== undefined) return cache[topicId];
    return loadNote(topicId);
  }, [cache]);

  const setNote = useCallback((topicId: string, text: string) => {
    localStorage.setItem(PREFIX + topicId, text);
    setCache(prev => ({ ...prev, [topicId]: text }));
  }, []);

  const hasNote = useCallback((topicId: string): boolean => {
    const val = cache[topicId] ?? localStorage.getItem(PREFIX + topicId) ?? localStorage.getItem(LEGACY_PREFIX + topicId);
    return !!val && val.trim().length > 0;
  }, [cache]);

  const getAllNoteIds = useCallback((): string[] => {
    const ids = new Set<string>();
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX) && localStorage.getItem(k)?.trim())
      .forEach(k => ids.add(k.slice(PREFIX.length)));
    Object.keys(localStorage)
      .filter(k => k.startsWith(LEGACY_PREFIX) && localStorage.getItem(k)?.trim())
      .forEach(k => ids.add(k.slice(LEGACY_PREFIX.length)));
    return [...ids];
  }, []);

  return { getNote, setNote, hasNote, getAllNoteIds };
}
