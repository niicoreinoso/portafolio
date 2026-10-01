"use client";

import { useEffect, useState } from "react";

const Pause = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);
const Play = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
  </svg>
);

/** Pausa o reactiva los efectos de movimiento del sitio. Se recuerda en el navegador. */
export default function MotionToggle({ className = "" }: { className?: string }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setPaused(document.documentElement.dataset.motion === "off");
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = !paused;
    if (next) root.dataset.motion = "off";
    else delete root.dataset.motion;
    try {
      localStorage.setItem("motion", next ? "off" : "on");
    } catch {}
    setPaused(next);
  }

  return (
    <button
      type="button"
      aria-pressed={paused}
      aria-label={paused ? "Activar efectos de movimiento" : "Pausar efectos de movimiento"}
      title={paused ? "Activar efectos" : "Pausar efectos"}
      onClick={toggle}
      className={`flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-ink ${className}`}
    >
      {paused ? <Play /> : <Pause />}
    </button>
  );
}
