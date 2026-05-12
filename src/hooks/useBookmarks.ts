import { useState, useCallback } from 'react';

const KEY = 'ZYNAPSE_BOOKMARKS';
const LEGACY_KEY = 'AURA_BOOKMARKS';

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (raw && !localStorage.getItem(KEY)) localStorage.setItem(KEY, raw);
    return JSON.parse(raw || '[]');
  } catch { return []; }
}
function save(ids: string[]) { localStorage.setItem(KEY, JSON.stringify(ids)); }

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(load);

  const toggle = useCallback((topicId: string) => {
    setBookmarks(prev => {
      const next = prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [topicId, ...prev];
      save(next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback((topicId: string) => bookmarks.includes(topicId), [bookmarks]);
  const remove = useCallback((topicId: string) => {
    setBookmarks(prev => { const n = prev.filter(id => id !== topicId); save(n); return n; });
  }, []);

  return { bookmarks, toggle, isBookmarked, remove };
}
