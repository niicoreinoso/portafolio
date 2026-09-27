"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { profile, sections } from "@/content/profile";
import { Menu, X } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Estado de scroll + barra de progreso de lectura
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Detecta qué sección está en pantalla
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id === "inicio" ? null : e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ["inicio", ...sections.map((s) => s.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // Mueve la "píldora" detrás del link activo
  useLayoutEffect(() => {
    const measure = () => {
      const link = active ? navRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`) : null;
      setPill(link ? { left: link.offsetLeft, width: link.offsetWidth } : null);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  // El desplazamiento animado y el resaltado los maneja Tracker para todos los links "#..."
  const go = (id: string) => {
    setOpen(false);
    setActive(id);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,border-color] duration-500 ${
        scrolled || open ? "border-b border-line bg-bg/95" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <a href="#inicio" onClick={() => setActive(null)} className="group font-serif text-lg">
          {profile.name}
          <span className="inline-block text-accent transition-transform duration-300 group-hover:scale-150">.</span>
        </a>

        <nav ref={navRef} className="relative hidden items-center gap-1 md:ml-auto md:flex" aria-label="Principal">
          <span
            aria-hidden
            className="absolute top-1/2 h-8 -translate-y-1/2 rounded-full bg-accent-soft transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ left: pill?.left ?? 0, width: pill?.width ?? 0, opacity: pill ? 1 : 0 }}
          />
          {sections.map((s) => (
            <a
              key={s.id}
              data-id={s.id}
              href={`#${s.id}`}
              onClick={() => go(s.id)}
              className={`relative rounded-full px-3 py-1.5 text-sm transition-colors duration-300 ${
                active === s.id ? "text-accent" : "text-ink-2 hover:text-ink"
              }`}
              aria-current={active === s.id ? "location" : undefined}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:ml-4">
        <ThemeToggle />
        <button
          className="-mr-2 p-2 text-ink-2 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          <span className="relative block size-5">
            <Menu width={20} height={20} className={`absolute inset-0 transition-all duration-300 ${open ? "rotate-90 opacity-0" : ""}`} />
            <X width={20} height={20} className={`absolute inset-0 transition-all duration-300 ${open ? "" : "-rotate-90 opacity-0"}`} />
          </span>
        </button>
        </div>
      </div>

      {/* Menú móvil con apertura animada */}
      <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <nav className="overflow-hidden" aria-label="Principal móvil">
          <div className="border-t border-line px-5 pb-4">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => go(s.id)}
                style={{ transitionDelay: open ? `${80 + i * 40}ms` : "0ms" }}
                className={`flex items-center justify-between border-b border-line py-3 text-sm transition-all duration-500 last:border-0 ${
                  open ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"
                } ${active === s.id ? "text-accent" : "text-ink-2"}`}
              >
                {s.label}
                <span className="tabular text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* Barra de progreso de lectura */}
      <div
        ref={progressRef}
        aria-hidden
        className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-gradient-to-r from-accent to-warm"
        style={{ transform: "scaleX(0)" }}
      />
    </header>
  );
}
