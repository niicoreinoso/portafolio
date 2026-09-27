"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/lib/store";
import { Button, Card, Hint, Toggle, inputCls } from "./ui";
import { Check, Copy, Download, LinkIcon, Trash } from "@/components/icons";

const PRESETS = ["linkedin", "cv", "github", "email", "instagram", "whatsapp"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-mono">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function LinkBuilder() {
  const [origin, setOrigin] = useState("");
  const [source, setSource] = useState("linkedin");
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => setOrigin(location.origin), []);

  const slug = source.toLowerCase().replace(/[^a-z0-9._-]/g, "");
  const url = `${origin}/?ref=${slug || "link"}`;

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <Card title="Links con seguimiento">
      <Hint>
        Usá un link distinto en cada lugar donde compartas tu portafolio. En Tráfico vas a ver cuántas visitas trajo cada uno. Cuando publiques el sitio,
        el link va a usar tu dominio real.
      </Hint>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setSource(p)}
            className={`rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors ${slug === p ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-2 hover:border-line-strong"}`}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={source} onChange={(e) => setSource(e.target.value)} className={inputCls} placeholder="nombre del origen" aria-label="Origen del link" />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-bg px-3.5 py-2.5">
        <LinkIcon width={14} height={14} className="shrink-0 text-muted" />
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-ink">{url}</code>
        <Button onClick={() => copy(url)}>
          {copied === url ? <Check width={13} height={13} /> : <Copy width={13} height={13} />} {copied === url ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </Card>
  );
}

export default function SettingsView({ initial, gemini, chatAvailable }: { initial: Settings; gemini: boolean; chatAvailable: boolean }) {
  const [s, setS] = useState(initial);
  const [base, setBase] = useState(initial); // última versión guardada
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirty = JSON.stringify(s) !== JSON.stringify(base);

  async function save() {
    setStatus("saving");
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) }).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setS(data.settings);
      setBase(data.settings);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } else setStatus("error");
  }

  async function reset() {
    const answer = prompt('Esto borra visitas, tiempos y conversaciones del chatbot (los mensajes se conservan). Escribí BORRAR para confirmar.');
    if (answer !== "BORRAR") return;
    const res = await fetch("/api/admin/data", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: "BORRAR" }) });
    if (res.ok) location.reload();
  }

  const setNow = (k: keyof Settings["now"], v: string) => setS({ ...s, now: { ...s.now, [k]: v } });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card
        title="Contenido del inicio"
        className="lg:row-span-2"
        action={
          <Button variant="primary" onClick={save} disabled={(!dirty && status !== "saved") || status === "saving"}>
            {status === "saving" ? "Guardando…" : status === "saved" ? <><Check width={13} height={13} /> Guardado</> : "Guardar cambios"}
          </Button>
        }
      >
        <Hint>Se actualiza en la web al instante, sin tocar código. Mantenerlo al día muestra que el sitio está vivo.</Hint>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-line p-4">
            <div>
              <p className="text-sm font-medium">Mostrar disponibilidad</p>
              <p className="text-xs text-muted">Punto verde y texto de estado arriba del nombre.</p>
            </div>
            <Toggle checked={s.available} onChange={(v) => setS({ ...s, available: v })} label="Mostrar disponibilidad" />
          </div>
          <Field label="texto de estado">
            <input value={s.availableText} maxLength={80} onChange={(e) => setS({ ...s, availableText: e.target.value })} className={inputCls} />
          </Field>

          <p className="label-mono border-t border-line pt-5">tarjeta “ahora mismo”</p>
          <Field label="cursando">
            <input value={s.now.studying} maxLength={80} onChange={(e) => setNow("studying", e.target.value)} className={inputCls} />
          </Field>
          <Field label="aprendiendo">
            <input value={s.now.learning} maxLength={80} onChange={(e) => setNow("learning", e.target.value)} className={inputCls} />
          </Field>
          <Field label="buscando">
            <input value={s.now.seeking} maxLength={80} onChange={(e) => setNow("seeking", e.target.value)} className={inputCls} />
          </Field>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-line p-4">
            <div>
              <p className="text-sm font-medium">Chatbot público</p>
              <p className="text-xs text-muted">
                {chatAvailable ? "Botón “Preguntame” en la web." : gemini ? "Desactivado con PUBLIC_CHAT_ENABLED=false." : "Requiere GEMINI_API_KEY en .env.local."}
              </p>
            </div>
            <Toggle checked={s.chatEnabled} onChange={(v) => setS({ ...s, chatEnabled: v })} label="Chatbot público" />
          </div>
          {status === "error" && <p className="text-sm text-bad">No se pudo guardar. Probá de nuevo.</p>}
        </div>
      </Card>

      <LinkBuilder />

      <Card title="Datos">
        <Hint>Las visitas y mensajes se guardan en data/db.json. Descargá una copia de vez en cuando.</Hint>
        <div className="flex flex-wrap gap-2">
          <a href="/api/admin/data" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink-2 hover:border-line-strong hover:text-ink">
            <Download width={13} height={13} /> Descargar backup (JSON)
          </a>
          <Button variant="danger" onClick={reset}>
            <Trash width={13} height={13} /> Borrar estadísticas
          </Button>
        </div>
      </Card>
    </div>
  );
}
