"use client";

import type { Stats } from "@/lib/analytics";
import { timeAgo } from "@/lib/format";
import { BarList, ColumnChart } from "./charts";
import { Card, Empty, Hint } from "./ui";

export default function Traffic({ stats, onGoLinks }: { stats: Stats; onGoLinks: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Horario de visitas">
          <Hint>Hora de Argentina. Sirve para saber cuándo publicar en LinkedIn.</Hint>
          <ColumnChart data={stats.hours} labelEvery={3} />
        </Card>
        <Card title="Días de la semana">
          <Hint>Qué días entra más gente a tu portafolio.</Hint>
          <ColumnChart data={stats.weekdays} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Links con seguimiento" action={<button onClick={onGoLinks} className="text-xs text-accent hover:underline">Crear link</button>}>
          <BarList data={stats.sources} empty="Todavía no usaste links con ?ref=. Creá uno para tu CV o LinkedIn y medí cuál trae más visitas." />
        </Card>
        <Card title="Sitios de referencia">
          <BarList data={stats.referrers} />
        </Card>
        <Card title="Vistas por sección">
          <BarList data={stats.sections} />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Dispositivos">
          <BarList data={stats.devices} />
        </Card>
        <Card title="Navegadores">
          <BarList data={stats.browsers} />
        </Card>
        <Card title="Idiomas">
          <BarList data={stats.languages} />
        </Card>
        <Card title="Países">
          <BarList data={stats.countries} empty="El país se detecta cuando el sitio está publicado (Vercel o Cloudflare)." />
        </Card>
      </div>

      <Card title="Conversaciones con el chatbot">
        <Hint>Lo que preguntan los visitantes y lo que respondió el asistente. Si algo se repite, conviene sumarlo al portafolio.</Hint>
        {stats.chats.length ? (
          <ul className="divide-y divide-line">
            {stats.chats.slice(0, 20).map((c, i) => (
              <li key={i} className="py-3 text-sm">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <span className="text-ink">
                      <span className="mr-2 text-muted transition-transform group-open:rotate-90 inline-block">›</span>
                      {c.question}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-muted" suppressHydrationWarning>{timeAgo(c.t)}</span>
                  </summary>
                  <p className="mt-2 ml-5 border-l-2 border-line pl-3 whitespace-pre-wrap text-ink-2">{c.answer ?? "Sin respuesta registrada."}</p>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Todavía nadie usó el chatbot.</Empty>
        )}
      </Card>
    </div>
  );
}
