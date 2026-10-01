// Diagrama de proceso estilo BPMN: el "motivo" visual del sitio.
// Resume la idea de la carrera: de las personas a las decisiones, pasando por procesos y datos.

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;
const d = (n: number) => ({ "--d": n }) as Vars;

const tasks = [
  { x: 80, w: 120, label: "personas" },
  { x: 260, w: 120, label: "procesos" },
  { x: 500, w: 120, label: "datos" },
  { x: 680, w: 140, label: "decisiones" },
];

// Versión vertical para pantallas chicas: mismos nodos, recorrido de arriba hacia abajo.
const vTasks = [
  { y: 58, x: 40, w: 120, label: "personas" },
  { y: 132, x: 40, w: 120, label: "procesos" },
  { y: 284, x: 40, w: 120, label: "datos" },
  { y: 358, x: 30, w: 140, label: "decisiones" },
];

function Arrow({ x, delay }: { x: number; delay: number }) {
  return <path className="flow-node fill-line-strong" style={d(delay)} d={`M${x - 7} 40.5 L${x} 45 L${x - 7} 49.5 Z`} />;
}

export default function ProcessFlow() {
  return (
    <figure className="flow w-full" aria-label="Diagrama: personas, procesos, datos y decisiones, con un ciclo de mejora continua">
      <figcaption className="label-mono mb-3 flex items-center gap-2">
        <span className="text-accent">{"//"}</span> del problema a la decisión
      </figcaption>
      <svg viewBox="0 0 900 96" className="hidden h-auto w-full overflow-visible sm:block" role="img" aria-hidden>
        {/* Conectores principales */}
        {[
          [33, 78],
          [200, 258],
          [380, 418],
          [460, 498],
          [620, 678],
          [820, 866],
        ].map(([a, b], i) => (
          <path key={i} className="flow-line stroke-line-strong" style={d(i + 1)} pathLength={1} d={`M${a} 45 H${b}`} strokeWidth={1.5} fill="none" />
        ))}

        {/* Ciclo de mejora continua: vuelve desde la decisión a los procesos */}
        <path className="flow-node stroke-accent/50" style={d(6)} d="M440 65 V84 H320 V63" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
        <path className="flow-node fill-accent/60" style={d(7)} d="M315.5 70 L320 63 L324.5 70 Z" />
        <text className="flow-node fill-muted font-mono" style={d(7)} x={380} y={80} fontSize={10} textAnchor="middle" letterSpacing={1}>
          mejora continua
        </text>

        {/* Punto que recorre el proceso (se esconde al pasar por las tareas) */}
        <circle className="flow-pulse fill-accent" r={3.5} cx={0} cy={0}>
          <animateMotion dur="5.5s" repeatCount="indefinite" path="M33 45 H866" keyTimes="0;1" calcMode="linear" />
        </circle>

        {/* Evento de inicio */}
        <circle className="flow-node stroke-muted fill-bg" style={d(0)} cx={24} cy={45} r={9} strokeWidth={1.5} />

        {/* Tareas */}
        {tasks.map((t, i) => (
          <g key={t.label} className="flow-node" style={d(i * 2 + 1)}>
            <rect className="fill-bg stroke-line-strong" x={t.x} y={27} width={t.w} height={36} rx={9} strokeWidth={1.5} />
            <text className="fill-ink-2 font-mono" x={t.x + t.w / 2} y={49} fontSize={12.5} textAnchor="middle">
              {t.label}
            </text>
          </g>
        ))}

        {/* Compuerta (gateway) */}
        <g className="flow-node" style={d(4)}>
          <path className="fill-bg stroke-accent" d="M440 25 L460 45 L440 65 L420 45 Z" strokeWidth={1.5} />
          <path className="stroke-accent" d="M434 39 L446 51 M446 39 L434 51" strokeWidth={1.5} strokeLinecap="round" />
        </g>

        {/* Evento de fin */}
        <circle className="flow-node stroke-ink fill-bg" style={d(9)} cx={878} cy={45} r={10} strokeWidth={3} />

        {[78, 258, 418, 498, 678, 866].map((x, i) => (
          <Arrow key={x} x={x} delay={i + 2} />
        ))}
      </svg>
      <svg viewBox="0 0 300 446" className="h-auto w-full max-w-[250px] overflow-visible sm:hidden" role="img" aria-hidden>
        {/* Conectores principales */}
        {[
          [21, 58],
          [94, 132],
          [168, 206],
          [246, 284],
          [320, 358],
          [394, 422],
        ].map(([a, b], i) => (
          <path key={i} className="flow-line stroke-line-strong" style={d(i + 1)} pathLength={1} d={`M100 ${a} V${b}`} strokeWidth={1.5} fill="none" />
        ))}

        {/* Ciclo de mejora continua: vuelve desde la compuerta a procesos */}
        <path className="flow-node stroke-accent/50" style={d(6)} d="M120 226 H230 V150 H168" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
        <path className="flow-node fill-accent/60" style={d(7)} d="M167 145.5 L160 150 L167 154.5 Z" />
        <text className="flow-node fill-muted font-mono" style={d(7)} x={240} y={184} fontSize={10} letterSpacing={0.5}>
          mejora
        </text>
        <text className="flow-node fill-muted font-mono" style={d(7)} x={240} y={198} fontSize={10} letterSpacing={0.5}>
          continua
        </text>

        {/* Punto que recorre el proceso */}
        <circle className="flow-pulse fill-accent" r={3.5} cx={0} cy={0}>
          <animateMotion dur="5.5s" repeatCount="indefinite" path="M100 21 V422" keyTimes="0;1" calcMode="linear" />
        </circle>

        {/* Evento de inicio */}
        <circle className="flow-node stroke-muted fill-bg" style={d(0)} cx={100} cy={12} r={9} strokeWidth={1.5} />

        {/* Tareas */}
        {vTasks.map((t, i) => (
          <g key={t.label} className="flow-node" style={d(i * 2 + 1)}>
            <rect className="fill-bg stroke-line-strong" x={t.x} y={t.y} width={t.w} height={36} rx={9} strokeWidth={1.5} />
            <text className="fill-ink-2 font-mono" x={100} y={t.y + 22} fontSize={12.5} textAnchor="middle">
              {t.label}
            </text>
          </g>
        ))}

        {/* Compuerta (gateway) */}
        <g className="flow-node" style={d(4)}>
          <path className="fill-bg stroke-accent" d="M100 206 L120 226 L100 246 L80 226 Z" strokeWidth={1.5} />
          <path className="stroke-accent" d="M94 220 L106 232 M106 220 L94 232" strokeWidth={1.5} strokeLinecap="round" />
        </g>

        {/* Evento de fin */}
        <circle className="flow-node stroke-ink fill-bg" style={d(9)} cx={100} cy={434} r={10} strokeWidth={3} />

        {[58, 132, 206, 284, 358, 424].map((y, i) => (
          <path key={y} className="flow-node fill-line-strong" style={d(i + 2)} d={`M95.5 ${y - 7} L100 ${y} L104.5 ${y - 7} Z`} />
        ))}
      </svg>
    </figure>
  );
}
