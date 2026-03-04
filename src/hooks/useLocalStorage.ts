import { useState, useEffect, useCallback } from "react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(newValue));
      window.dispatchEvent(new CustomEvent("ordo-storage", { detail: { key } }));
      return newValue;
    });
  }, [key]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === key) {
        try {
          const item = window.localStorage.getItem(key);
          if (item) setStoredValue(JSON.parse(item));
        } catch { /* ignore */ }
      }
    };
    window.addEventListener("ordo-storage", handler);
    return () => window.removeEventListener("ordo-storage", handler);
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
