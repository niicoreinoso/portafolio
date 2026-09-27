// Utilidades de formato compartidas entre servidor y cliente.

export const fmtTime = (ms: number) =>
  ms < 60_000 ? `${Math.round(ms / 1000)} s` : `${Math.floor(ms / 60_000)} min ${Math.round((ms % 60_000) / 1000)} s`;

const rtf = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });

/** "hace 5 minutos", "ayer", etc. */
export function timeAgo(t: number, now = Date.now()) {
  const s = Math.round((t - now) / 1000);
  const abs = Math.abs(s);
  if (abs < 60) return "recién";
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(s / 86400), "day");
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(t);
}
