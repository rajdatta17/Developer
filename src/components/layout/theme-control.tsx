"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function resolveTheme(): Theme {
  const stored = window.localStorage.getItem("daybreak-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeControl() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setTheme(resolveTheme()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem("daybreak-theme", nextTheme);
    setTheme(nextTheme);
  }

  const nextLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button className="icon-button theme-control" type="button" onClick={toggleTheme} aria-label={nextLabel}>
      <Sun className="theme-icon theme-icon--sun" aria-hidden="true" size={17} />
      <Moon className="theme-icon theme-icon--moon" aria-hidden="true" size={17} />
    </button>
  );
}
