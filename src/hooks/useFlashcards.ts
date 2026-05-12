import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'ZYNAPSE_FLASHCARDS';

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  nextReview: number;  // timestamp ms
  interval: number;    // days until next review
  easeFactor: number;  // SM-2 algorithm, starts at 2.5
  repetitions: number;
}

function load(): Flashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(cards: Flashcard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useFlashcards() {
  const [cards, setCards] = useState<Flashcard[]>(() => load());

  const persist = useCallback((next: Flashcard[]) => {
    save(next);
    setCards(next);
  }, []);

  // Add a batch of new cards for a topic
  const addCards = useCallback(
    (topicId: string, newCards: Array<{ front: string; back: string }>) => {
      setCards(prev => {
        const next = [
          ...prev,
          ...newCards.map(c => ({
            id: uid(),
            topicId,
            front: c.front,
            back: c.back,
            nextReview: Date.now(), // due immediately
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
          })),
        ];
        save(next);
        return next;
      });
    },
    []
  );

  // SM-2 spaced repetition review
  // quality: 0=again, 1=hard, 2=good, 3=easy
  const reviewCard = useCallback(
    (cardId: string, quality: 0 | 1 | 2 | 3) => {
      setCards(prev => {
        const next = prev.map(card => {
          if (card.id !== cardId) return card;

          let { interval, easeFactor, repetitions } = card;

          if (quality === 0) {
            // Again — reset
            interval = 1;
            repetitions = 0;
            // easeFactor unchanged
          } else if (quality === 1) {
            // Hard
            interval = Math.max(1, Math.round(interval * easeFactor * 0.6));
            easeFactor = Math.max(1.3, easeFactor - 0.15);
            repetitions += 1;
          } else if (quality === 2) {
            // Good
            if (repetitions === 0) interval = 1;
            else if (repetitions === 1) interval = 4;
            else interval = Math.round(interval * easeFactor);
            // easeFactor unchanged
            repetitions += 1;
          } else {
            // Easy (quality === 3) — same scheduling as good but bump ef and stretch interval
            if (repetitions === 0) interval = 1;
            else if (repetitions === 1) interval = 4;
            else interval = Math.round(interval * easeFactor);
            interval = Math.round(interval * 1.3);
            easeFactor = easeFactor + 0.1;
            repetitions += 1;
          }

          const nextReview = Date.now() + interval * 86_400_000;

          return { ...card, interval, easeFactor, repetitions, nextReview };
        });
        save(next);
        return next;
      });
    },
    []
  );

  const getDueCards = useCallback((): Flashcard[] => {
    const now = Date.now();
    return cards.filter(c => c.nextReview <= now);
  }, [cards]);

  const getCardsByTopic = useCallback(
    (topicId: string): Flashcard[] => cards.filter(c => c.topicId === topicId),
    [cards]
  );

  const clearTopicCards = useCallback((topicId: string) => {
    setCards(prev => {
      const next = prev.filter(c => c.topicId !== topicId);
      save(next);
      return next;
    });
  }, []);

  const totalCount = cards.length;

  const dueCount = useMemo(() => {
    const now = Date.now();
    return cards.filter(c => c.nextReview <= now).length;
  }, [cards]);

  return {
    cards,
    addCards,
    reviewCard,
    getDueCards,
    getCardsByTopic,
    clearTopicCards,
    totalCount,
    dueCount,
  };
}
