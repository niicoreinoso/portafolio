import type { Settings } from "@/lib/store";
import type { RepoActivity } from "@/lib/github";
import RelativeTime from "@/components/site/RelativeTime";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** Línea de commits por semana, en un lienzo de 300×56. */
function sparkPath(weeks: number[]) {
  const max = Math.max(...weeks, 1);
  const step = 300 / Math.max(weeks.length - 1, 1);
  const pts = weeks.map((w, i) => [i * step, 50 - (w / max) * 42] as const);
  return { d: pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" "), end: pts[pts.length - 1] };
}

/** Tarjeta "En este momento" del inicio: lo editable desde el panel más la actividad real de GitHub. */
export default function NowBoard({ now, activity }: { now: Settings["now"]; activity: RepoActivity | null }) {
  const rows = [
    { label: "Cursando", value: now.studying },
    { label: "Aprendiendo", value: now.learning },
    { label: "Buscando", value: now.seeking, accent: true },
  ];
  const spark = activity?.weeks?.length ? sparkPath(activity.weeks) : null;

  return (
    <aside className="overflow-hidden rounded-[26px] border border-line bg-surface" aria-label="En este momento">
      <div style={{ "--r": 0 } as Vars} className="board-row flex items-center justify-between border-b border-line px-6 py-5">
        <p className="font-bold">En este momento</p>
        <p className="font-mono text-xs text-muted">
          <span className="live mr-1.5 inline-block size-1.5 rounded-full bg-accent align-[1px]" />
          se actualiza solo
        </p>
      </div>
      {rows.map((r, i) => (
        <div key={r.label} style={{ "--r": i + 1 } as Vars} className="board-row border-b border-line px-6 py-4">
          <p className="kicker">{r.label}</p>
          <p className={`mt-1 text-lg font-semibold tracking-[-0.015em] ${r.accent ? "text-accent" : ""}`}>{r.value}</p>
        </div>
      ))}
      {activity && (
        <div style={{ "--r": 4 } as Vars} className="board-row px-6 pt-4 pb-5">
          {spark && (
            <>
              <div className="flex justify-between">
                <p className="kicker">Actividad en GitHub</p>
                <p className="font-mono text-xs text-muted">últimas {activity.weeks!.length} semanas</p>
              </div>
              <svg className="draw spark mt-2.5 h-14 w-full text-ink" viewBox="0 0 300 56" preserveAspectRatio="none" aria-hidden>
                <path className="l" pathLength={1} d={spark.d} vectorEffect="non-scaling-stroke" />
                <circle className="e" cx={spark.end[0]} cy={spark.end[1]} r="3.5" style={{ fill: "var(--accent)" }} />
              </svg>
            </>
          )}
          <a href={activity.url} target="_blank" rel="noreferrer" className={`block text-sm text-ink-2 transition-colors hover:text-ink ${spark ? "mt-2" : ""}`}>
            Último cambio en <b className="font-semibold text-ink">{activity.name}</b> · <RelativeTime iso={activity.pushedAt} />
          </a>
        </div>
      )}
    </aside>
  );
}
