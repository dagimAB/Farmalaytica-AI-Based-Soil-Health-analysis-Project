"use client";

import React, { useEffect, useState } from "react";

const THEME_KEY = "farmalytica_theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    // determine initial theme: saved -> system -> dark
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
        return;
      }
    } catch (e) {
      // ignore
    }
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = prefersDark ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={theme === "dark"}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      style={{
        border: "none",
        background: "transparent",
        color: "var(--color-text)",
        cursor: "pointer",
        padding: "0.35rem 0.5rem",
        borderRadius: 8,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      {theme === "dark" ? (
        // Moon icon
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // Sun icon
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3v1m0 16v1M4.2 4.2l.7.7M18.1 18.1l.7.7M1 12h1m20 0h1M4.2 19.8l.7-.7M18.1 5.9l.7-.7"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
}
