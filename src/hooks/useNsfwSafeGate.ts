import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nsfw_unlocked';
const NSFW_EVENT = 'sankaverse_nsfw_change';

const getInitialNsfwUnlocked = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
};

export function useNsfwSafeGate() {
  const [isNsfwUnlocked, setIsNsfwUnlocked] = useState<boolean>(getInitialNsfwUnlocked);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ unlocked: boolean }>;
      setIsNsfwUnlocked(Boolean(customEvent.detail?.unlocked));
    };

    window.addEventListener(NSFW_EVENT, handleSync);
    return () => {
      window.removeEventListener(NSFW_EVENT, handleSync);
    };
  }, []);

  const triggerToggle = useCallback(() => {
    if (isNsfwUnlocked) {
      localStorage.setItem(STORAGE_KEY, 'false');
      setIsNsfwUnlocked(false);
      window.dispatchEvent(new CustomEvent(NSFW_EVENT, { detail: { unlocked: false } }));
    } else {
      setIsModalOpen(true);
    }
  }, [isNsfwUnlocked]);

  const confirmAge = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsNsfwUnlocked(true);
    setIsModalOpen(false);
    window.dispatchEvent(new CustomEvent(NSFW_EVENT, { detail: { unlocked: true } }));
  }, []);

  const declineAge = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'false');
    setIsNsfwUnlocked(false);
    setIsModalOpen(false);
    window.dispatchEvent(new CustomEvent(NSFW_EVENT, { detail: { unlocked: false } }));
  }, []);

  return {
    isNsfwUnlocked,
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    triggerToggle,
    confirmAge,
    declineAge,
  };
}
