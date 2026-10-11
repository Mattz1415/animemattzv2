import { useState, useCallback, useEffect } from 'react';

export type AccentColor = 'red' | 'cyan' | 'emerald' | 'violet';

const STORAGE_KEY = 'sankaverse_accent_theme';

export function useAccentTheme() {
  const [accent, setAccent] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'cyan' || stored === 'emerald' || stored === 'violet') {
        return stored;
      }
    }
    return 'red';
  });

  const changeAccent = useCallback((color: AccentColor) => {
    setAccent(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, color);
      document.documentElement.setAttribute('data-accent', color);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
  }, [accent]);

  return { accent, changeAccent };
}
