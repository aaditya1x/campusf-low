
import { Palette } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import styles from "./ThemeSwitcher.module.css";

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor="theme-select">
        <Palette size={17} />
        <span className={styles.labelText}>Theme</span>
      </label>

      <select
        id="theme-select"
        className={styles.select}
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
        aria-label="Select website color theme"
      >
        {theme === "system" && (
          <option value="system">System Default</option>
        )}

        {themes.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
