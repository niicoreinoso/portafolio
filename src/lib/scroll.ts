// Desplazamiento animado propio: no depende de `scroll-behavior` del navegador
// ni de la configuración de animaciones del sistema operativo.

const HEADER_OFFSET = 80;

// Arranca suave, acelera y frena al llegar
const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

let frame = 0;

export function smoothScrollTo(id: string, onDone?: () => void) {
  const el = document.getElementById(id);
  if (!el) return;

  const start = window.scrollY;
  // El destino se recalcula en cada cuadro por si el layout cambia (ej: se cierra el menú móvil)
  const targetNow = () => {
    if (id === "inicio") return 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(max, Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET));
  };
  const distance = targetNow() - start;
  if (Math.abs(distance) < 2) return onDone?.();

  // La duración crece con la distancia, dentro de un rango cómodo
  const duration = Math.min(1400, Math.max(650, Math.abs(distance) * 0.45));
  const t0 = performance.now();

  cancelAnimationFrame(frame);

  // Si la persona usa la rueda o toca la pantalla, se cancela la animación
  const cancel = () => {
    cancelAnimationFrame(frame);
    removeListeners();
  };
  const removeListeners = () => {
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("keydown", cancel);
  };
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("keydown", cancel);

  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / duration);
    window.scrollTo({ top: start + (targetNow() - start) * easeInOutQuart(p), behavior: "instant" });
    if (p < 1) frame = requestAnimationFrame(step);
    else {
      removeListeners();
      history.replaceState(null, "", id === "inicio" ? location.pathname : `#${id}`);
      onDone?.();
    }
  };
  frame = requestAnimationFrame(step);
}

/** Resalta la sección destino con una animación breve al llegar. */
export function highlightSection(id: string) {
  const el = document.getElementById(id);
  if (!el?.classList.contains("section")) return;
  el.classList.remove("is-targeted");
  void el.offsetWidth; // reinicia la animación si se hace clic dos veces
  el.classList.add("is-targeted");
  window.setTimeout(() => el.classList.remove("is-targeted"), 1800);
}
