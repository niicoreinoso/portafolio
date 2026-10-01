"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const Sun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const Moon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
  </svg>
);

/** Switch de tema. Oscuro es el predeterminado; la elección se guarda en el navegador. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function apply(next: Theme) {
    const root = document.documentElement;
    if (next === "light") root.dataset.theme = "light";
    else delete root.dataset.theme;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  }

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

    if (!doc.startViewTransition || document.documentElement.dataset.motion === "off") return apply(next);

    // El nuevo tema se expande en círculo desde el botón
    const { clientX: x, clientY: y } = e;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(() => apply(next)).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      onClick={toggle}
      className={`relative flex h-8 w-[3.25rem] shrink-0 items-center rounded-full border border-line bg-surface px-1 text-muted transition-colors hover:border-line-strong ${className}`}
    >
      <span
        className={`flex size-6 items-center justify-center rounded-full bg-bg text-ink shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isDark ? "translate-x-0" : "translate-x-[1.25rem]"
        }`}
      >
        <span className={`transition-transform duration-500 ${isDark ? "rotate-0" : "rotate-180"}`}>{isDark ? <Moon /> : <Sun />}</span>
      </span>
    </button>
  );
}
