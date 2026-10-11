import { useState, useCallback } from 'react';

export interface BookmarkItem {
  id: string; // animeId or comicSlug
  type: 'anime' | 'comic' | 'donghua';
  title: string;
  poster: string;
  slug: string;
  score?: string;
  status?: string;
  addedAt: number;
}

const STORAGE_KEY = 'sankaverse_bookmarks';

const getInitialBookmarks = (): BookmarkItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load bookmarks:', e);
    return [];
  }
};

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(getInitialBookmarks);

  const isBookmarked = useCallback(
    (id: string) => {
      return bookmarks.some((b) => b.id === id);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback((item: Omit<BookmarkItem, 'addedAt'>) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      let updated: BookmarkItem[];
      if (exists) {
        updated = prev.filter((b) => b.id !== item.id);
      } else {
        updated = [{ ...item, addedAt: Date.now() }, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save bookmarks:', e);
      }
      return updated;
    });
  }, []);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
  };
}
