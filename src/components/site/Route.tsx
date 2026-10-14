"use client";

import { useEffect, useRef } from "react";

type Goal = { stage: string; title: string; text: string };

// Cuándo se enciende cada etapa, según cuánto se dibujó el camino (0 a 1)
const AT = [0, 0.5, 0.95];

/** "Hacia dónde voy": el camino se dibuja con el scroll; firme hasta hoy, punteado hacia adelante. */
export default function Route({ goals }: { goals: Goal[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      if (document.documentElement.dataset.motion === "off") return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.85 - r.top) / (window.innerHeight * 0.55)));
      el.style.setProperty("--p", p.toFixed(3));
      el.querySelectorAll<HTMLElement>("[data-at]").forEach((n) => n.classList.toggle("on", p >= Number(n.dataset.at)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={ref} className="route relative">
      {/* Línea horizontal (pantallas medianas) */}
      <div aria-hidden className="route-track relative hidden h-6 md:block">
        <span className="absolute top-[11px] left-2 h-0.5 w-1/3 bg-ink" />
        <span className="absolute top-[11px] right-2 left-1/3 border-t-2 border-dashed border-accent" />
      </div>
      {/* Línea vertical (celular) */}
      <div aria-hidden className="route-track-y absolute top-2 bottom-2 left-[7px] w-0.5 md:hidden">
        <span className="absolute inset-x-0 top-0 h-1/3 bg-ink" />
        <span className="absolute top-1/3 bottom-0 left-0 border-l-2 border-dashed border-accent" />
      </div>

      <ol className="grid gap-10 pl-10 md:grid-cols-3 md:gap-8 md:pl-0">
        {goals.map((g, i) => (
          <li key={g.title} className="relative">
            <span
              aria-hidden
              data-at={AT[i] ?? 1}
              className={`route-stop absolute top-1 -left-10 size-4 rounded-full border-2 md:-top-[30px] md:left-0 ${
                i === 0 ? "on border-ink bg-ink" : "border-accent bg-bg"
              }`}
            />
            <div data-at={AT[i] ?? 1} className={`route-step ${i === 0 ? "on" : ""}`}>
              <p className="kicker">{g.stage}</p>
              <h4 className="mt-2 text-xl font-bold tracking-[-0.02em]">{g.title}</h4>
              <p className="mt-2 leading-relaxed text-ink-2">{g.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
