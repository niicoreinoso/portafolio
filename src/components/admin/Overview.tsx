"use client";

import type { Stats } from "@/lib/analytics";
import type { Repo } from "@/lib/github";
import type { Settings } from "@/lib/store";
import { profile } from "@/content/profile";
import { fmtTime, timeAgo } from "@/lib/format";
import { AreaChart, BarList, StatTile } from "./charts";
import { Card, Empty, Hint } from "./ui";
import { Chat, Check, Eye, Mail, X } from "@/components/icons";

export default function Overview({
  stats,
  repos,
  settings,
  gemini,
  unread,
  go,
}: {
  stats: Stats;
  repos: Repo[] | null;
  settings: Settings;
  gemini: boolean;
  unread: number;
  go: (tab: "mensajes" | "configuracion" | "asistente") => void;
}) {
  const own = (repos ?? []).filter((r) => !r.fork);
  const trend = stats.daily.map((d) => d.value);
  const uniqueTrend = stats.daily.map((d) => d.unique);

  // Checklist para mejorar el portafolio
  const checklist = [
    { ok: Boolean(profile.photo), text: "Agregar una foto profesional" },
    { ok: Boolean(profile.linkedin), text: "Agregar tu LinkedIn" },
    { ok: Boolean(profile.cvUrl), text: "Subir tu CV en PDF" },
    { ok: own.length >= 3, text: "Tener 3 proyectos propios en GitHub" },
    { ok: own.length > 0 && own.every((r) => r.description), text: "Descripción en todos tus repos" },
    { ok: own.some((r) => r.homepage), text: "Un proyecto con demo online" },
    { ok: profile.featuredRepos.length > 0, text: "Elegir repos destacados" },
    { ok: stats.sources.length > 0, text: "Compartir un link con seguimiento" },
    { ok: gemini, text: "Conectar Gemini" },
  ];
  const done = checklist.filter((c) => c.ok).length;

  const icons = {
    visit: <Eye width={14} height={14} />,
    message: <Mail width={14} height={14} />,
    chat: <Chat width={14} height={14} />,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="visitas" value={stats.pageviews} current={stats.pageviews} prev={stats.prevPageviews} hint="vs. período anterior" trend={trend} />
        <StatTile label="visitantes únicos" value={stats.unique} current={stats.unique} prev={stats.prevUnique} hint={`${stats.returning} recurrentes`} trend={uniqueTrend} />
        <StatTile
          label="tiempo en la página"
          value={stats.avgTime ? fmtTime(stats.avgTime) : "—"}
          current={stats.avgTime}
          prev={stats.prevAvgTime}
          hint="mediana"
        />
        <StatTile
          label="contactos"
          value={stats.messagesInRange}
          current={stats.messagesInRange}
          prev={stats.prevMessagesInRange}
          hint={`${stats.conversion}% de visitantes`}
        />
      </div>

      <Card title={`Visitas por día · últimos ${stats.days} días`}>
        <AreaChart data={stats.daily} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Actividad reciente" className="lg:col-span-2">
          {stats.activity.length ? (
            <ul className="divide-y divide-line">
              {stats.activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 py-2.5 text-sm">
                  <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-line ${a.kind === "message" ? "text-warm" : a.kind === "chat" ? "text-good" : "text-accent"}`}>
                    {icons[a.kind]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">{a.text}</p>
                    <p className="truncate text-xs text-muted">{a.meta}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-muted" suppressHydrationWarning>{timeAgo(a.t)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Todavía no hay actividad. Compartí tu portafolio y vas a ver acá cada visita, mensaje y pregunta.</Empty>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Estado del sitio" action={<button onClick={() => go("configuracion")} className="text-xs text-accent hover:underline">Editar</button>}>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-ink-2">Disponibilidad</span>
                <span className={`font-mono text-xs ${settings.available ? "text-good" : "text-muted"}`}>{settings.available ? "● visible" : "○ oculta"}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-2">Chatbot público</span>
                <span className={`font-mono text-xs ${settings.chatEnabled && gemini ? "text-good" : "text-muted"}`}>
                  {!gemini ? "○ sin API key" : settings.chatEnabled ? "● activo" : "○ apagado"}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <button onClick={() => go("mensajes")} className="text-ink-2 hover:text-ink">Mensajes sin leer</button>
                <span className={`font-mono text-xs ${unread ? "text-warm" : "text-muted"}`}>{unread}</span>
              </li>
            </ul>
          </Card>

          <Card title={`Checklist · ${done}/${checklist.length}`}>
            <div className="-mt-1 mb-4 h-1 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-gradient-to-r from-accent to-warm transition-all" style={{ width: `${(done / checklist.length) * 100}%` }} />
            </div>
            <ul className="space-y-2 text-sm">
              {checklist.map((c) => (
                <li key={c.text} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 shrink-0 ${c.ok ? "text-good" : "text-muted"}`}>
                    {c.ok ? <Check width={14} height={14} /> : <X width={14} height={14} />}
                  </span>
                  <span className={c.ok ? "text-muted line-through" : "text-ink-2"}>{c.text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Alcance por sección">
          <Hint>% de visitantes que llegó a ver cada sección. Si una cae mucho, la gente no está bajando hasta ahí.</Hint>
          <BarList data={stats.reach} suffix="%" max={100} />
        </Card>
        <Card title="De dónde vienen">
          <BarList data={stats.referrers} />
        </Card>
      </div>
    </div>
  );
}
