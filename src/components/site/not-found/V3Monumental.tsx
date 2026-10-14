import NotFoundShell, { Actions } from "./Shell";
import HeroField from "../HeroField";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;
const d = (n: number) => ({ "--d": n }) as Vars;

/**
 * Página 404: "404 monumental".
 * Tipografía a gran escala, como el nombre del inicio: un 404 en Fraunces liviana
 * donde el 0 es un planeta con un punto en órbita, sobre la grilla de puntos viva.
 */
export default function V3Monumental() {
  return (
    <NotFoundShell
      bg={
        <>
          <div aria-hidden className="hero-wash pointer-events-none absolute inset-0">
            <div className="glow absolute -top-48 right-[-15%] size-[620px] rounded-full [--glow-color:var(--accent)] sm:size-[820px]" />
          </div>
          <HeroField />
        </>
      }
    >
      <div className="intro flex flex-col items-center text-center">
        <p style={d(0)} className="label-mono flex items-center gap-2">
          <span className="size-2 rounded-full bg-warm" />
          página no encontrada<span className="caret text-accent">_</span>
        </p>

        <div
          style={{ ...d(1), fontSize: "clamp(8rem, 31vw, 19rem)" }}
          role="img"
          aria-label="Error 404"
          className="mt-4 flex items-center justify-center font-serif leading-[0.9] font-light tracking-tight select-none"
        >
          <span aria-hidden>4</span>
          <span aria-hidden className="relative mx-[0.03em] inline-block text-accent italic">
            0
            {/* Órbita: un anillo punteado que gira con un punto, como el pulso del diagrama de proceso */}
            <span className="nf-orbit absolute top-[56%] left-1/2 size-[0.92em] rounded-full border border-dashed border-muted/60">
              <span className="absolute -top-[0.045em] left-1/2 size-[0.09em] -translate-x-1/2 rounded-full bg-accent" />
            </span>
          </span>
          <span aria-hidden>4</span>
        </div>

        <p style={d(3)} className="mt-6 max-w-lg text-lg leading-relaxed text-ink-2 sm:text-xl">
          Esta página no existe, pero el resto del portafolio <em className="hl font-serif text-accent italic">sí</em>.
        </p>
        <Actions className="mt-9 justify-center" />
      </div>
    </NotFoundShell>
  );
}
