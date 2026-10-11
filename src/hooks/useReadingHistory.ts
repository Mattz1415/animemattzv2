import { useState, useCallback } from 'react';

export interface ReadingHistoryItem {
  comicSlug: string;
  comicTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  image?: string;
  scrollProgress?: number;
  timestamp: number;
}

const STORAGE_KEY = 'sankaverse_reading_history';

const getInitialReadingHistory = (): ReadingHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load reading history:', e);
    return [];
  }
};

export function useReadingHistory() {
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(getInitialReadingHistory);

  const addReadingItem = useCallback((item: Omit<ReadingHistoryItem, 'timestamp'>) => {
    setReadingHistory((prev) => {
      const filtered = prev.filter((h) => !(h.comicSlug === item.comicSlug && h.chapterSlug === item.chapterSlug));
      const updated: ReadingHistoryItem[] = [
        { ...item, timestamp: Date.now() },
        ...filtered,
      ].slice(0, 50);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save reading history:', e);
      }
      return updated;
    });
  }, []);

  const removeItem = useCallback((chapterSlug: string) => {
    setReadingHistory((prev) => {
      const updated = prev.filter((h) => h.chapterSlug !== chapterSlug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearReadingHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setReadingHistory([]);
  }, []);

  return {
    readingHistory,
    addReadingItem,
    removeItem,
    clearReadingHistory,
  };
}
