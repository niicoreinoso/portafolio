"use client";

import { useRef, useState } from "react";

const dayFmt = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtDate = (d: string) => dayFmt.format(new Date(d + "T00:00:00Z"));

function niceMax(v: number) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

type Day = { date: string; value: number; unique?: number };

/** Área + línea de visitas por día, con crosshair y tooltip al pasar el mouse. */
export function AreaChart({ data }: { data: Day[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = 220;
  const pad = { l: 32, r: 8, t: 12, b: 26 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const x = (i: number) => pad.l + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / max) * ih;

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join("");
  const area = `${line}L${x(data.length - 1)},${pad.t + ih}L${x(0)},${pad.t + ih}Z`;
  const ticks = [0, max / 2, max];
  const labelEvery = Math.ceil(data.length / 6);

  function onMove(e: React.PointerEvent) {
    const r = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pad.l) / iw) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  }

  const h = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Gráfico de visitas por día"
      >
        <defs>
          <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--chart)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--chart)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} strokeDasharray={t ? "3 4" : undefined} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--muted)" className="tabular font-mono">
              {Math.round(t)}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#area-fill)" />
        <path d={line} fill="none" stroke="var(--chart)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text key={d.date} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize={11} fill="var(--muted)">
              {fmtDate(d.date)}
            </text>
          ) : null,
        )}
        {h && hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="var(--line-strong)" strokeWidth={1} />
            <circle cx={x(hover)} cy={y(h.value)} r={4.5} fill="var(--chart)" stroke="var(--surface)" strokeWidth={2} />
          </g>
        )}
      </svg>
      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-sm"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            transform: `translateX(${hover > data.length / 2 ? "calc(-100% - 10px)" : "10px"})`,
          }}
        >
          <p className="text-muted">{fmtDate(h.date)}</p>
          <p className="tabular mt-0.5 font-medium text-ink">{h.value} visitas</p>
          {h.unique !== undefined && <p className="tabular text-ink-2">{h.unique} únicos</p>}
        </div>
      )}
    </div>
  );
}

/** Columnas verticales (horas del día, días de la semana), con tooltip al pasar el mouse. */
export function ColumnChart({
  data,
  unit = "visitas",
  labelEvery = 1,
  height = 120,
}: {
  data: { label: string; value: number }[];
  unit?: string;
  labelEvery?: number;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 0);
  if (!max) return <p className="py-8 text-center text-sm text-muted">Sin datos todavía</p>;

  return (
    <div>
      <div className="relative flex items-end gap-[3px]" style={{ height }} onPointerLeave={() => setHover(null)}>
        {data.map((d, i) => (
          <div key={d.label} className="relative flex h-full flex-1 items-end" onPointerEnter={() => setHover(i)}>
            <div
              className="w-full rounded-t-[3px] bg-[var(--chart)] transition-opacity"
              style={{ height: `${Math.max(d.value ? 3 : 1, (d.value / max) * 100)}%`, opacity: d.value ? (hover === null || hover === i ? 0.9 : 0.35) : 0.15 }}
            />
            {hover === i && (
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md border border-line bg-surface px-2 py-1 text-xs whitespace-nowrap shadow-sm">
                <span className="text-muted">{d.label}</span> · <span className="tabular font-medium">{d.value}</span> {unit}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[3px] border-t border-line pt-1.5">
        {data.map((d, i) => (
          <span key={d.label} className="flex-1 text-center font-mono text-[10px] text-muted">
            {i % labelEvery === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Lista de barras horizontales con etiqueta y valor. */
export function BarList({
  data,
  suffix = "",
  max,
  empty = "Sin datos todavía",
}: {
  data: { label: string; value: number }[];
  suffix?: string;
  max?: number;
  empty?: string;
}) {
  if (!data.length || data.every((d) => d.value === 0)) {
    return <p className="py-6 text-center text-sm text-muted">{empty}</p>;
  }
  const top = max ?? Math.max(...data.map((d) => d.value));
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label} className="group" title={`${d.label}: ${d.value}${suffix}${suffix ? "" : ` (${Math.round((d.value / total) * 100)}%)`}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink-2 group-hover:text-ink">{d.label}</span>
            <span className="tabular text-ink">
              {d.value}
              {suffix}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-[var(--chart)] opacity-85 transition-opacity group-hover:opacity-100"
              style={{ width: `${top ? Math.max(2, (d.value / top) * 100) : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Mini gráfico de tendencia para las tarjetas de métricas. */
function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const W = 100;
  const H = 28;
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * W},${H - (v / max) * (H - 2) - 1}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-7 w-full" aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--chart)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

/** Tarjeta de métrica con variación contra el período anterior. */
export function StatTile({
  label,
  value,
  current,
  prev,
  hint,
  trend,
  invert = false,
}: {
  label: string;
  value: React.ReactNode;
  current?: number;
  prev?: number;
  hint?: string;
  trend?: number[];
  invert?: boolean;
}) {
  let delta: React.ReactNode = null;
  if (typeof current === "number" && typeof prev === "number") {
    if (prev === 0) delta = current > 0 ? <span className="text-muted">nuevo</span> : null;
    else {
      const pct = Math.round(((current - prev) / prev) * 100);
      const good = invert ? pct <= 0 : pct >= 0;
      delta = (
        <span className={good ? "text-good" : "text-bad"}>
          {pct >= 0 ? "▲" : "▼"} {Math.abs(pct)}%
        </span>
      );
    }
  }
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="label-mono">{label}</p>
      <p className="mt-2 font-serif text-3xl tracking-tight">{value}</p>
      <p className="mt-1 min-h-4 text-xs">
        {delta} {hint && <span className="text-muted">{hint}</span>}
      </p>
      {trend && trend.length > 1 && (
        <div className="mt-3 opacity-80">
          <Sparkline values={trend} />
        </div>
      )}
    </div>
  );
}
