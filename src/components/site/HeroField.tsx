/**
 * Fondo vivo del inicio: una grilla de puntos, como el papel de un mapa de procesos,
 * y una luz que la recorre sola y enciende los puntos que toca.
 * Es solo CSS (ver .hero-field en globals.css): sin JavaScript y sin seguir el cursor.
 */
export default function HeroField() {
  return (
    <div aria-hidden className="hero-field pointer-events-none absolute inset-0">
      <div className="hero-field-dots text-line-strong opacity-50" />
      <div className="hero-field-dots hero-field-lit text-accent" />
      <div className="hero-field-glow" />
    </div>
  );
}
