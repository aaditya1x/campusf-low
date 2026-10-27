import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "campusflow-theme";
export const THEMES = [
  { value: "light", label: "Light", description: "Clean and minimal" },
  { value: "dark", label: "Dark", description: "Low-light workspace" },
  { value: "system", label: "System", description: "Follow your device" },
  { value: "cyber", label: "Cyber Grid", description: "Electric violet" },
  { value: "midnight", label: "Midnight Neon", description: "Neon blue and purple" },
  { value: "sunset", label: "Sunset Amber", description: "Warm orange tones" },
  { value: "forest", label: "Forest Emerald", description: "Natural green tones" },
  { value: "ocean", label: "Ocean Blue", description: "Calm blue palette" },
  { value: "rose", label: "Rose Quartz", description: "Soft pink palette" },
  { value: "solar", label: "Solar Gold", description: "Golden high contrast" }
];
const VALID_THEMES = new Set(THEMES.map((item) => item.value));

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.has(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  );

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event) => setSystemDark(event.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.palette = theme;
    document.documentElement.style.colorScheme = ["dark", "cyber", "midnight"].includes(resolvedTheme) ? "dark" : "light";
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* storage may be unavailable */ }
  }, [theme, resolvedTheme]);

  const setTheme = useCallback((nextTheme) => {
    if (VALID_THEMES.has(nextTheme)) setThemeState(nextTheme);
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme, themes: THEMES }), [theme, resolvedTheme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
