import { useEffect, useState } from "react";

export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? (typeof initialValue === "function" ? initialValue() : initialValue) : JSON.parse(stored);
    } catch {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage quota or privacy mode */ }
  }, [key, value]);
  return [value, setValue];
}
