"use client";

import { useEffect } from "react";
import { highlightSection, smoothScrollTo } from "@/lib/scroll";

function visitorId() {
  try {
    let id = localStorage.getItem("vid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("vid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function send(payload: object) {
  const body = JSON.stringify({ vid: visitorId(), ...payload });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  else fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
}

/** Registra la visita, qué secciones se ven, y activa las animaciones de aparición. */
export default function Tracker() {
  useEffect(() => {
    // ?ref=linkedin o ?utm_source=cv identifican de dónde viene el link compartido
    const params = new URLSearchParams(location.search);
    send({
      type: "pageview",
      path: location.pathname,
      referrer: document.referrer,
      source: params.get("ref") ?? params.get("utm_source") ?? undefined,
    });

    // Tiempo con la página visible: se envía una vez, al salir u ocultar la pestaña
    let visibleMs = 0;
    let since = document.visibilityState === "visible" ? performance.now() : 0;
    let sentLeave = false;
    const onVisibility = (e: Event) => {
      if (e.type === "pagehide" || document.visibilityState === "hidden") {
        if (since) visibleMs += performance.now() - since;
        since = 0;
        if (!sentLeave && visibleMs > 1000) {
          sentLeave = true;
          send({ type: "leave", ms: visibleMs });
        }
      } else since = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onVisibility);

    const seen = new Set<string>();
    const sectionObs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).id;
          if (e.isIntersecting && !seen.has(id)) {
            seen.add(id);
            send({ type: "section", section: id });
          }
        }
      },
      { threshold: 0.35 },
    );
    document.querySelectorAll("section[id]").forEach((s) => sectionObs.observe(s));

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

    // Interacciones con el mouse (solo en dispositivos con puntero fino)
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let tilted: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      const el = e.target as HTMLElement;

      // Brillo que sigue al mouse en las tarjetas .spotlight
      const card = el.closest<HTMLElement>(".spotlight");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }

      // Inclinación 3D en [data-tilt]
      const tilt = el.closest<HTMLElement>("[data-tilt]");
      if (tilted && tilted !== tilt) resetTilt();
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.setProperty("--ry", `${px * 7}deg`);
        tilt.style.setProperty("--rx", `${-py * 7}deg`);
        tilt.classList.add("is-tilting");
        tilted = tilt;
      }

      // Botones magnéticos en [data-magnetic]
      const mag = el.closest<HTMLElement>("[data-magnetic]");
      if (magnet && magnet !== mag) magnet.style.translate = "";
      if (mag) {
        const r = mag.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        mag.style.translate = `${dx * 0.18}px ${dy * 0.3}px`;
        magnet = mag;
      }
    };
    const resetTilt = () => {
      if (!tilted) return;
      tilted.classList.remove("is-tilting");
      tilted.style.setProperty("--rx", "0deg");
      tilted.style.setProperty("--ry", "0deg");
      tilted = null;
    };
    const onLeave = () => {
      resetTilt();
      if (magnet) magnet.style.translate = "";
      magnet = null;
    };
    if (finePointer) {
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    // Parallax suave del inicio al hacer scroll: [data-parallax="velocidad"]
    const layers = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          for (const l of layers) {
            const speed = Number(l.dataset.parallax) || 0;
            l.style.transform = `translate3d(0, ${y * speed}px, 0)`;
            if (l.dataset.fade !== undefined) l.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
          }
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

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
    const hash = location.hash.slice(1);
    const target = hash ? document.getElementById(hash) : null;
    if (target?.classList.contains("section")) {
      setTimeout(() => {
        target.classList.add("is-targeted");
        setTimeout(() => target.classList.remove("is-targeted"), 1800);
      }, 600);
    }

    return () => {
      sectionObs.disconnect();
      revealObs.disconnect();
      document.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onVisibility);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
