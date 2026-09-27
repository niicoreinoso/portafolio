"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { Send, Sparkle, X } from "@/components/icons";

type Msg = { role: "user" | "model"; text: string };

const suggestions = ["¿Qué estudia?", "¿Qué habilidades tiene?", "¿Qué tipo de trabajo busca?"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function ask(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next: Msg[] = [...messages, { role: "user", text: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: next }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setMessages([...next, { role: "model", text: data?.reply ?? data?.error ?? "No pude responder ahora." }]);
    setLoading(false);
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {open && (
        <div className="mb-3 flex h-[min(520px,calc(100vh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] sm:w-[360px]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-medium">Preguntale a mi asistente</p>
              <p className="text-xs text-muted">Respuestas con IA sobre mi perfil</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 text-muted hover:text-ink" aria-label="Cerrar chat">
              <X />
            </button>
          </div>
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-ink-2">
                  Hola 👋 Soy un asistente que conoce el perfil de {profile.shortName}. ¿Qué te gustaría saber?
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => ask(s)} className="rounded-full border border-line px-3 py-1 text-xs text-ink-2 hover:border-line-strong hover:text-ink">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 leading-relaxed ${
                    m.role === "user" ? "bg-ink text-bg" : "bg-bg text-ink"
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {loading && <p className="animate-pulse text-xs text-muted">Escribiendo…</p>}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-line p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Escribí tu pregunta…"
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted"
              aria-label="Pregunta"
            />
            <button disabled={loading || !input.trim()} className="rounded-full bg-ink p-2 text-bg disabled:opacity-30" aria-label="Enviar">
              <Send width={14} height={14} />
            </button>
          </form>
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface p-3 text-sm shadow-[0_6px_24px_-10px_rgba(0,0,0,0.3)] transition hover:border-line-strong sm:px-4 sm:py-2.5"
          aria-expanded={open}
          aria-label={open ? "Cerrar chat" : "Preguntale a mi asistente"}
        >
          {open ? <X /> : <Sparkle />}
          {/* En celular solo el ícono, para no tapar contenido */}
          <span className="hidden sm:inline">{open ? "Cerrar" : "Preguntame"}</span>
        </button>
      </div>
    </div>
  );
}
