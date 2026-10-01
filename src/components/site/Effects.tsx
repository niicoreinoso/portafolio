"use client";

import { useEffect } from "react";
import { highlightSection, smoothScrollTo } from "@/lib/scroll";

/**
 * Comportamiento visual de la página (no pinta nada por sí mismo):
 * aparición al hacer scroll, brillo de tarjetas y links internos.
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

    // Brillo que sigue al mouse dentro de las tarjetas .spotlight (solo con puntero fino)
    const onPointerMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".spotlight");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (finePointer) document.addEventListener("pointermove", onPointerMove, { passive: true });

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
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointermove", onPointerMove);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return null;
}
