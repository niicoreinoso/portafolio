"use client";

import { useEffect } from "react";
import { highlightSection, smoothScrollTo } from "@/lib/scroll";

/**
 * Comportamiento visual de la página (no pinta nada por sí mismo):
 * aparición al hacer scroll, dibujos que se animan y links internos.
 */
export default function Effects() {
  useEffect(() => {
    // Aparición suave de cada bloque .reveal al entrar en pantalla
    const revealObs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            revealObs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

    // Índice de cada hijo para la aparición en cascada
    document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((list) => {
      Array.from(list.children).forEach((child, i) => (child as HTMLElement).style.setProperty("--i", String(i)));
    });

    // Dibujos de "Qué me interesa": se animan una vez al aparecer y cada vez que se pasa el mouse
    const play = (card: Element) => {
      if (document.documentElement.dataset.motion === "off") return;
      card.classList.remove("play");
      void (card as HTMLElement).offsetWidth; // reinicia la animación
      card.classList.add("play");
    };
    const glyphTimers: ReturnType<typeof setTimeout>[] = [];
    const glyphObs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).style.getPropertyValue("--i")) || 0;
          glyphTimers.push(setTimeout(() => play(e.target), 500 + i * 150));
          glyphObs.unobserve(e.target);
        }
      },
      { threshold: 0.4 },
    );
    const glyphCards = document.querySelectorAll("[data-glyph]");
    const onGlyphEnter = (e: Event) => play(e.currentTarget as Element);
    glyphCards.forEach((card) => {
      glyphObs.observe(card);
      card.addEventListener("pointerenter", onGlyphEnter);
    });

    // Todos los links internos (#seccion) bajan con desplazamiento animado
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute("href")?.slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      smoothScrollTo(id, () => highlightSection(id));
    };
    document.addEventListener("click", onClick);

    // Si se entra con un #ancla en la URL, resaltar esa sección
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    if (target?.classList.contains("section")) {
      t1 = setTimeout(() => {
        target.classList.add("is-targeted");
        t2 = setTimeout(() => target.classList.remove("is-targeted"), 1800);
      }, 600);
    }

    return () => {
      revealObs.disconnect();
      glyphObs.disconnect();
      glyphTimers.forEach(clearTimeout);
      glyphCards.forEach((card) => card.removeEventListener("pointerenter", onGlyphEnter));
      document.removeEventListener("click", onClick);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return null;
}
