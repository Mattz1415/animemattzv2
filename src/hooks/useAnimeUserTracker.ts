import { useState, useCallback, useEffect } from 'react';

export type WatchStatus = 'watching' | 'plan_to_watch' | 'completed' | 'on_hold' | 'dropped';

export interface UserAnimeEntry {
  animeId: string;
  title: string;
  poster: string;
  status: WatchStatus;
  userRating?: number; // 1-10
  notes?: string;
  updatedAt: number;
}

export interface EpisodeComment {
  id: string;
  episodeId: string;
  author: string;
  avatarSeed: string;
  timestamp: string; // e.g. "04:15"
  content: string;
  createdAt: number;
  likes: number;
}

export interface EpisodeReactions {
  hyped: number;
  wholesome: number;
  shocked: number;
  funny: number;
  peak: number;
}

const TRACKER_STORAGE_KEY = 'sankaverse_user_tracker';
const COMMENTS_STORAGE_KEY = 'sankaverse_episode_comments';
const REACTIONS_STORAGE_KEY = 'sankaverse_episode_reactions';

export function useAnimeUserTracker(animeId?: string) {
  const [entries, setEntries] = useState<Record<string, UserAnimeEntry>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(TRACKER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const currentEntry = animeId ? entries[animeId] : undefined;

  const updateStatus = useCallback(
    (status: WatchStatus, metadata: { title: string; poster: string }) => {
      if (!animeId) return;
      setEntries((prev) => {
        const updated: Record<string, UserAnimeEntry> = {
          ...prev,
          [animeId]: {
            ...prev[animeId],
            animeId,
            title: metadata.title,
            poster: metadata.poster,
            status,
            updatedAt: Date.now(),
          },
        };
        try {
          localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    },
    [animeId]
  );

  const updateRating = useCallback(
    (rating: number, metadata: { title: string; poster: string }) => {
      if (!animeId) return;
      setEntries((prev) => {
        const updated: Record<string, UserAnimeEntry> = {
          ...prev,
          [animeId]: {
            ...prev[animeId],
            animeId,
            title: metadata.title,
            poster: metadata.poster,
            status: prev[animeId]?.status || 'watching',
            userRating: rating,
            updatedAt: Date.now(),
          },
        };
        try {
          localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    },
    [animeId]
  );

  const updateNotes = useCallback(
    (notes: string, metadata: { title: string; poster: string }) => {
      if (!animeId) return;
      setEntries((prev) => {
        const updated: Record<string, UserAnimeEntry> = {
          ...prev,
          [animeId]: {
            ...prev[animeId],
            animeId,
            title: metadata.title,
            poster: metadata.poster,
            status: prev[animeId]?.status || 'watching',
            notes,
            updatedAt: Date.now(),
          },
        };
        try {
          localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    },
    [animeId]
  );

  const removeEntry = useCallback(() => {
    if (!animeId) return;
    setEntries((prev) => {
      const copy = { ...prev };
      delete copy[animeId];
      try {
        localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(copy));
      } catch (e) {
        console.error(e);
      }
      return copy;
    });
  }, [animeId]);

  return {
    entries,
    currentEntry,
    updateStatus,
    updateRating,
    updateNotes,
    removeEntry,
  };
}

const getInitialComments = (episodeId?: string): EpisodeComment[] => {
  if (!episodeId || typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(`${COMMENTS_STORAGE_KEY}_${episodeId}`);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore
  }
  return [
    {
      id: 'c1',
      episodeId,
      author: 'KuroNeko99',
      avatarSeed: 'Kuro',
      timestamp: '03:42',
      content: 'Animasi di bagian ini gila banget, fluid parah! Sakuga level!',
      createdAt: Date.now() - 3600000 * 5,
      likes: 12,
    },
    {
      id: 'c2',
      episodeId,
      author: 'DesuMaster',
      avatarSeed: 'Desu',
      timestamp: '11:15',
      content: 'Plot twist nya ga disangka-sangka, ending theme nya juga banger abis 🔥',
      createdAt: Date.now() - 3600000 * 2,
      likes: 8,
    },
    {
      id: 'c3',
      episodeId,
      author: 'ZeroTwo_Fan',
      avatarSeed: 'Zero',
      timestamp: '19:50',
      content: 'Cliffhanger lagi... gasabar nunggu episode minggu depan!',
      createdAt: Date.now() - 1800000,
      likes: 5,
    },
  ];
};

const getInitialReactions = (episodeId?: string): EpisodeReactions => {
  if (!episodeId || typeof window === 'undefined') return { hyped: 14, wholesome: 6, shocked: 22, funny: 9, peak: 35 };
  try {
    const stored = localStorage.getItem(`${REACTIONS_STORAGE_KEY}_${episodeId}`);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore
  }
  return { hyped: 14, wholesome: 6, shocked: 22, funny: 9, peak: 35 };
};

// Hook for episode comments & reactions
export function useEpisodeInteractions(episodeId?: string) {
  const [comments, setComments] = useState<EpisodeComment[]>(() => getInitialComments(episodeId));
  const [reactions, setReactions] = useState<EpisodeReactions>(() => getInitialReactions(episodeId));

  const addComment = useCallback(
    (content: string, timestamp: string, author = 'CyberViewer') => {
      if (!episodeId || !content.trim()) return;
      const newComment: EpisodeComment = {
        id: `c_${Date.now()}`,
        episodeId,
        author,
        avatarSeed: author,
        timestamp: timestamp || '00:00',
        content: content.trim(),
        createdAt: Date.now(),
        likes: 1,
      };

      setComments((prev) => {
        const updated = [newComment, ...prev];
        try {
          localStorage.setItem(`${COMMENTS_STORAGE_KEY}_${episodeId}`, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    },
    [episodeId]
  );

  const toggleReaction = useCallback(
    (type: keyof EpisodeReactions) => {
      if (!episodeId) return;
      setReactions((prev) => {
        const updated = { ...prev, [type]: prev[type] + 1 };
        try {
          localStorage.setItem(`${REACTIONS_STORAGE_KEY}_${episodeId}`, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    },
    [episodeId]
  );

  return {
    comments,
    reactions,
    addComment,
    toggleReaction,
  };
}
