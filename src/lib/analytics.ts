import "server-only";
import { readDB } from "./store";
import { sections as sectionList } from "@/content/profile";
import { fmtTime } from "./format";

const DAY = 86_400_000;
const AR_OFFSET = 3 * 3_600_000; // Argentina: UTC-3

export type Stats = Awaited<ReturnType<typeof getStats>>;

const arDate = (t: number) => new Date(t - AR_OFFSET);
const dayKey = (t: number) => arDate(t).toISOString().slice(0, 10);

function countBy<T>(items: T[], key: (x: T) => string | undefined) {
  const map = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    if (k) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const LANGS: Record<string, string> = { es: "Español", en: "Inglés", pt: "Portugués", fr: "Francés", it: "Italiano", de: "Alemán" };
const DEVICES: Record<string, string> = { desktop: "Escritorio", mobile: "Celular", tablet: "Tablet" };
const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export async function getStats(days = 30) {
  const db = await readDB();
  const now = Date.now();
  const from = now - days * DAY;
  const prevFrom = from - days * DAY;
  const inRange = (t: number) => t >= from;
  const inPrev = (t: number) => t >= prevFrom && t < from;

  const visits = db.visits.filter((v) => inRange(v.t));
  const prevVisits = db.visits.filter((v) => inPrev(v.t));
  const sectionViews = db.sections.filter((s) => inRange(s.t));
  const engagements = db.engagements.filter((e) => inRange(e.t));
  const prevEngagements = db.engagements.filter((e) => inPrev(e.t));
  const messages = db.messages.filter((m) => inRange(m.t));
  const prevMessages = db.messages.filter((m) => inPrev(m.t));

  const uniqueSet = new Set(visits.map((v) => v.vid));
  const unique = uniqueSet.size;
  const prevUnique = new Set(prevVisits.map((v) => v.vid)).size;

  // Visitantes que ya habían venido antes del período
  const before = new Set(db.visits.filter((v) => v.t < from).map((v) => v.vid));
  const returning = [...uniqueSet].filter((v) => before.has(v)).length;

  // Serie diaria con todos los días (incluso los que tienen 0)
  const perDay = new Map<string, { value: number; unique: Set<string> }>();
  for (let i = days - 1; i >= 0; i--) perDay.set(dayKey(now - i * DAY), { value: 0, unique: new Set() });
  for (const v of visits) {
    const d = perDay.get(dayKey(v.t));
    if (d) {
      d.value++;
      d.unique.add(v.vid);
    }
  }

  const hours = Array.from({ length: 24 }, (_, h) => ({ label: String(h).padStart(2, "0"), value: 0 }));
  const weekdays = WEEKDAYS.map((label) => ({ label, value: 0 }));
  for (const v of visits) {
    const d = arDate(v.t);
    hours[d.getUTCHours()].value++;
    weekdays[d.getUTCDay()].value++;
  }
  // Semana empezando el lunes
  weekdays.push(weekdays.shift()!);

  const labels = Object.fromEntries(sectionList.map((s) => [s.id, s.label]));
  const reach = sectionList.map((s) => {
    const seen = new Set(sectionViews.filter((x) => x.section === s.id).map((x) => x.vid)).size;
    return { label: s.label, value: unique ? Math.round((seen / unique) * 100) : 0 };
  });

  const avgTime = median(engagements.map((e) => e.ms));
  const prevAvgTime = median(prevEngagements.map((e) => e.ms));

  // Feed de actividad reciente (visitas, mensajes y preguntas al chatbot)
  const activity = [
    ...db.visits.slice(-40).map((v) => ({
      t: v.t,
      kind: "visit" as const,
      text: `Visita desde ${v.source ? `link "${v.source}"` : v.ref === "directo" ? "acceso directo" : v.ref}`,
      meta: [DEVICES[v.device], v.browser, v.country].filter(Boolean).join(" · "),
    })),
    ...db.messages.slice(0, 20).map((m) => ({ t: m.t, kind: "message" as const, text: `Mensaje de ${m.name}`, meta: m.email })),
    ...db.chats.slice(-20).map((c) => ({ t: c.t, kind: "chat" as const, text: `"${c.question}"`, meta: "Pregunta al chatbot" })),
  ]
    .sort((a, b) => b.t - a.t)
    .slice(0, 12);

  return {
    days,
    pageviews: visits.length,
    prevPageviews: prevVisits.length,
    unique,
    prevUnique,
    returning,
    avgTime,
    prevAvgTime,
    messagesInRange: messages.length,
    prevMessagesInRange: prevMessages.length,
    conversion: unique ? Math.round((messages.length / unique) * 1000) / 10 : 0,
    daily: [...perDay.entries()].map(([date, d]) => ({ date, value: d.value, unique: d.unique.size })),
    hours,
    weekdays,
    referrers: countBy(visits, (v) => v.ref).slice(0, 8),
    sources: countBy(visits, (v) => v.source).slice(0, 8),
    devices: countBy(visits, (v) => DEVICES[v.device] ?? v.device),
    browsers: countBy(visits, (v) => v.browser).slice(0, 6),
    languages: countBy(visits, (v) => (v.lang ? LANGS[v.lang] ?? v.lang.toUpperCase() : undefined)).slice(0, 6),
    countries: countBy(visits, (v) => v.country).slice(0, 8),
    sections: countBy(sectionViews, (s) => labels[s.section] ?? s.section),
    reach,
    messagesTotal: db.messages.length,
    messagesUnread: db.messages.filter((m) => !m.read).length,
    chatQuestions: db.chats.filter((c) => inRange(c.t)).length,
    chats: db.chats.slice(-50).reverse(),
    activity,
    firstEvent: db.visits[0]?.t ?? null,
  };
}


/** Resumen en texto para que Gemini pueda analizar las métricas. */
export function statsAsText(s: Stats) {
  return [
    `Últimos ${s.days} días: ${s.pageviews} visitas (${s.prevPageviews} el período anterior), ${s.unique} visitantes únicos (${s.prevUnique} antes), ${s.returning} recurrentes.`,
    `Tiempo mediano en la página: ${fmtTime(s.avgTime)} (antes ${fmtTime(s.prevAvgTime)}).`,
    `Mensajes de contacto en el período: ${s.messagesInRange} (conversión ${s.conversion}% de visitantes).`,
    `Fuentes de tráfico: ${s.referrers.map((r) => `${r.label} ${r.value}`).join(", ") || "sin datos"}.`,
    `Links con seguimiento (?ref=): ${s.sources.map((r) => `${r.label} ${r.value}`).join(", ") || "ninguno usado"}.`,
    `Dispositivos: ${s.devices.map((d) => `${d.label} ${d.value}`).join(", ") || "sin datos"}.`,
    `Alcance por sección (% de visitantes que la vieron): ${s.reach.map((r) => `${r.label} ${r.value}%`).join(", ")}.`,
    `Horas con más visitas: ${
      s.pageviews
        ? [...s.hours].sort((a, b) => b.value - a.value).slice(0, 3).map((h) => `${h.label}h (${h.value})`).join(", ")
        : "sin datos"
    }.`,
    `Mensajes totales: ${s.messagesTotal} (${s.messagesUnread} sin leer). Preguntas al chatbot: ${s.chatQuestions}.`,
    s.chats.length ? `Últimas preguntas de visitantes al chatbot: ${s.chats.slice(0, 15).map((q) => `"${q.question}"`).join("; ")}` : "",
  ].join("\n");
}
