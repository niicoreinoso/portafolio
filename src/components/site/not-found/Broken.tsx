import NotFoundShell, { Actions } from "./Shell";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** Medidas de cada versión del dibujo: la ancha (computadora) y la compacta (celular). */
const LAYOUTS = {
  wide: {
    w: 900, h: 140, y: 80, font: 16, mono: 13,
    stops: [60, 250, 440], labels: ["inicio", "sobre mí", "proyectos"], end: 560, cut: 600,
    tangle: "M640 80 C680 80, 690 40, 720 50 S760 120, 790 90 S800 30, 830 60 S850 110, 880 70",
  },
  compact: {
    w: 400, h: 150, y: 84, font: 19, mono: 15,
    stops: [40, 160], labels: ["inicio", "proyectos"], end: 220, cut: 250,
    tangle: "M282 84 C300 84, 306 44, 324 52 S348 122, 364 96 S372 40, 388 58 S398 96, 400 80",
  },
};

function Line({ layout, className }: { layout: keyof typeof LAYOUTS; className: string }) {
  const L = LAYOUTS[layout];
  return (
    <svg className={`draw nf-line overflow-visible ${className}`} viewBox={`0 0 ${L.w} ${L.h}`} aria-hidden>
      {/* Tramo ordenado */}
      <path className="l" pathLength={1} d={`M${L.stops[0] - 20} ${L.y} H${L.end}`} strokeWidth="3" />
      {/* Extremo suelto que se vuelve a enredar */}
      <path className="l e" pathLength={1} d={L.tangle} strokeWidth="3" style={{ animationDelay: "1.6s" }} />
      {L.stops.map((x, i) => (
        <g key={x} className="n" style={{ "--k": i } as Vars}>
          <circle cx={x} cy={L.y} r="7" style={{ fill: "var(--bg)" }} />
          <text x={x} y={L.y - 30} textAnchor="middle" fontSize={L.font} fontWeight="600">
            {L.labels[i]}
          </text>
        </g>
      ))}
      {/* El corte */}
      <g className="n" style={{ "--k": 3 } as Vars}>
        <path className="e" d={`M${L.cut - 10} ${L.y - 18} L${L.cut - 22} ${L.y + 18} M${L.cut + 12} ${L.y - 18} L${L.cut} ${L.y + 18}`} strokeWidth="2.5" />
        <text className="e" x={L.cut} y={L.y - 40} textAnchor="middle" fontSize={L.font} fontWeight="700">
          404
        </text>
        <text className="m" x={L.cut} y={L.y + 48} textAnchor="middle" fontSize={L.mono} fontFamily="var(--font-mono)">
          esta página
        </text>
      </g>
    </svg>
  );
}

/**
 * Página 404, "Camino cortado": retoma la línea de "Cómo encaro un problema".
 * La línea ordenada avanza por las secciones y se corta donde debería estar esta página;
 * el extremo suelto se vuelve a enredar.
 */
export default function Broken() {
  return (
    <NotFoundShell>
      <div className="intro">
        <p style={{ "--d": 0 } as Vars} className="kicker">
          Error 404 · página no encontrada
        </p>
        <h1 style={{ "--d": 1 } as Vars} className="mt-5 max-w-3xl text-[clamp(3rem,9vw,5.6rem)] leading-[0.92] font-extrabold tracking-[-0.055em]">
          Acá se cortó el camino<span className="text-accent">.</span>
        </h1>

        <div style={{ "--d": 2 } as Vars} className="mt-12">
          <Line layout="wide" className="hidden w-full sm:block" />
          <Line layout="compact" className="w-full sm:hidden" />
        </div>

        <div style={{ "--d": 4 } as Vars} className="mt-12 flex flex-wrap items-end justify-between gap-8">
          <p className="max-w-md text-xl leading-relaxed text-ink-2">La dirección no lleva a ningún lado. Todo lo demás sigue en orden.</p>
          <Actions />
        </div>
      </div>
    </NotFoundShell>
  );
}
