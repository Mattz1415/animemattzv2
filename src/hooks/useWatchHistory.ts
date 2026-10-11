import { useState, useCallback } from 'react';

export interface WatchHistoryItem {
  animeId: string;
  animeTitle: string;
  episodeId: string;
  episodeTitle: string;
  poster?: string;
  timestamp: number;
}

const STORAGE_KEY = 'sankaverse_watch_history';

const getInitialWatchHistory = (): WatchHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load watch history:', e);
    return [];
  }
};

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>(getInitialWatchHistory);

  const addWatchItem = useCallback((item: Omit<WatchHistoryItem, 'timestamp'>) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => !(h.animeId === item.animeId && h.episodeId === item.episodeId));
      const updated: WatchHistoryItem[] = [
        { ...item, timestamp: Date.now() },
        ...filtered,
      ].slice(0, 50);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save watch history:', e);
      }
      return updated;
    });
  }, []);

  const removeItem = useCallback((episodeId: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.episodeId !== episodeId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return {
    history,
    addWatchItem,
    removeItem,
    clearHistory,
  };
}
