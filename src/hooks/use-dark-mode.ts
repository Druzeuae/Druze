import { useEffect, useState } from "react";

const STORAGE_KEY = "druze_theme_v2";

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === "true";
    return true; // luxury dark theme by default
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(STORAGE_KEY, String(isDark));
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((d) => !d), setIsDark };
}
