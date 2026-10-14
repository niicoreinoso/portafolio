/**
 * Sección de la página. `room` la convierte en "sala" (el bloque que contrasta con el fondo).
 * El encabezado es una etiqueta numerada y, si hay `title`, un titular grande con punto de acento.
 */
export default function Section({
  id,
  index,
  label,
  title,
  room = false,
  divider = true,
  children,
}: {
  id: string;
  index: number;
  label: string;
  title?: React.ReactNode;
  room?: boolean;
  divider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`section ${room ? "room" : ""}`}>
      <div className={`mx-auto max-w-[1080px] px-5 py-24 sm:px-10 sm:py-32 ${divider && !room ? "border-t border-line" : ""}`}>
        <div className="reveal">
          {/* Sin titular grande, la etiqueta es el h2: así los h3 de adentro no saltan un nivel */}
          {title ? (
            <p className="kicker">
              {String(index).padStart(2, "0")} · {label}
            </p>
          ) : (
            <h2 className="kicker">
              {String(index).padStart(2, "0")} · {label}
            </h2>
          )}
          {title && (
            <h2 className="mt-4 text-[2.6rem] leading-[1.02] font-bold tracking-[-0.04em] sm:text-6xl">
              {title}
              <span className="text-accent">.</span>
            </h2>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
