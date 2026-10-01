"use client";

import { useEffect } from "react";

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

/** Analítica propia y anónima: visita, secciones vistas y tiempo con la página visible. No pinta nada. */
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

    return () => {
      sectionObs.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onVisibility);
    };
  }, []);

  return null;
}
