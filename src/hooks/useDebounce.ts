import { useState, useEffect } from 'react';

/**
 * useDebounce hook with 700ms default delay as required by SankaVerse rate-limit policy.
 */
export function useDebounce<T>(value: T, delay = 700): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
