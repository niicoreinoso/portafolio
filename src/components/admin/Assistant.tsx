"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "./Markdown";
import { Check, Copy, Send, Sparkle } from "@/components/icons";

type Msg = { role: "user" | "model"; text: string; label?: string };

export const QUICK_ACTIONS = [
  { group: "Analizar", id: "review", title: "Auditar mi portafolio", text: "Fortalezas y mejoras priorizadas." },
  { group: "Analizar", id: "report", title: "Reporte semanal", text: "Qué pasó y una prioridad." },
  { group: "Analizar", id: "metrics", title: "Interpretar métricas", text: "Qué dicen los datos y qué probar." },
  { group: "Analizar", id: "chatbot", title: "Revisar el chatbot", text: "Qué preguntan y qué falta." },
  { group: "Crear", id: "post", title: "Post para LinkedIn", text: "Anunciá tu portafolio." },
  { group: "Crear", id: "linkedin", title: "Bio para LinkedIn", text: "Acerca de y titulares." },
  { group: "Crear", id: "readme", title: "README profesional", text: "Para tu mejor repo." },
  { group: "Crecer", id: "projects", title: "Ideas de proyectos", text: "Qué sumar a GitHub." },
  { group: "Crecer", id: "interview", title: "Preparar entrevistas", text: "Preguntas y respuestas." },
];

const STORAGE_KEY = "admin-assistant-history";

function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
    >
      {ok ? <Check width={13} height={13} /> : <Copy width={13} height={13} />} {ok ? "Copiado" : "Copiar"}
    </button>
  );
}

export default function Assistant({
  enabled,
  model,
  pending,
  onPendingHandled,
}: {
  enabled: boolean;
  model: string;
  pending: { action: string; messageId?: string; label: string } | null;
  onPendingHandled: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // La conversación se conserva en este navegador aunque recargues el panel
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function run(payload: { messages?: Msg[]; action?: string; messageId?: string }, userMsg: Msg) {
    setMessages([...messages, userMsg]);
    setLoading(true);
    const res = await fetch("/api/admin/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        payload.action
          ? payload
          : { messages: [...messages, userMsg].map(({ role, text }) => ({ role, text })) },
      ),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    const reply = data?.reply ?? `⚠️ ${data?.error ?? "Error de conexión."}`;
    // Para las acciones rápidas guardamos el prompt real, así la conversación puede continuar con contexto
    setMessages((prev) => {
      const copy = [...prev];
      if (payload.action && data?.prompt) copy[copy.length - 1] = { ...userMsg, text: data.prompt };
      return [...copy, { role: "model", text: reply }];
    });
    setLoading(false);
  }

  useEffect(() => {
    if (pending && enabled && !loading) {
      run({ action: pending.action, messageId: pending.messageId }, { role: "user", text: pending.label, label: pending.label });
      onPendingHandled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  if (!enabled) {
    return (
      <div className="rounded-xl border border-dashed border-line-strong p-8">
        <p className="font-medium">Conectá Gemini para activar el asistente</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink-2">
          <li>
            Creá una API key gratis en{" "}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-accent hover:underline">
              Google AI Studio
            </a>.
          </li>
          <li>
            Agregala en <code className="rounded bg-bg px-1">.env.local</code> como <code className="rounded bg-bg px-1">GEMINI_API_KEY=...</code>
          </li>
          <li>Reiniciá el servidor. También se activa el chatbot público del sitio.</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
      {/* Acciones rápidas agrupadas */}
      <aside className="space-y-5">
        {["Analizar", "Crear", "Crecer"].map((g) => (
          <div key={g}>
            <p className="label-mono mb-2">{g}</p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {QUICK_ACTIONS.filter((a) => a.group === g).map((a) => (
                <button
                  key={a.id}
                  disabled={loading}
                  onClick={() => run({ action: a.id }, { role: "user", text: a.title, label: a.title })}
                  className="group flex items-start gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 text-left transition hover:border-accent/50 disabled:opacity-50"
                >
                  <Sparkle width={14} height={14} className="mt-0.5 shrink-0 text-accent transition-transform duration-500 group-hover:rotate-90" />
                  <span>
                    <span className="block text-sm font-medium">{a.title}</span>
                    <span className="block text-xs text-muted">{a.text}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="font-mono text-[10px] text-muted">modelo: {model}</p>
      </aside>

      <div className="flex flex-col rounded-xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="text-sm font-medium">Conversación</p>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="text-xs text-muted hover:text-ink">
              Limpiar
            </button>
          )}
        </div>
        <div ref={listRef} className="h-[62vh] min-h-[320px] space-y-5 overflow-y-auto px-5 py-5">
          {messages.length === 0 && !loading && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Sparkle width={22} height={22} className="text-accent" />
              <p className="mt-3 font-serif text-xl">¿En qué te ayudo hoy?</p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Elegí una acción o preguntá lo que quieras. El asistente conoce tu perfil, tus repos, las métricas del sitio y lo que pregunta la gente en el chatbot.
              </p>
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-ink px-4 py-2 text-sm text-bg">{m.label ?? m.text}</p>
              </div>
            ) : (
              <div key={i} className="rounded-xl bg-bg/60 p-4">
                <Markdown text={m.text} />
                <div className="mt-3 border-t border-line pt-2">
                  <CopyButton text={m.text} />
                </div>
              </div>
            ),
          )}
          {loading && (
            <p className="flex items-center gap-2 text-sm text-muted">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${i * 120}ms` }} />
                ))}
              </span>
              Pensando…
            </p>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = input.trim();
            if (!q || loading) return;
            setInput("");
            run({}, { role: "user", text: q });
          }}
          className="flex items-end gap-2 border-t border-line p-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            placeholder="Preguntale algo a tu asistente…"
            className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted"
            aria-label="Mensaje al asistente"
          />
          <button disabled={loading || !input.trim()} className="rounded-full bg-ink p-2.5 text-bg disabled:opacity-30" aria-label="Enviar">
            <Send width={14} height={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
