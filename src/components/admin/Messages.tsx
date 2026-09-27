"use client";

import { useMemo, useState } from "react";
import type { ContactMessage } from "@/lib/store";
import { timeAgo } from "@/lib/format";
import { Button, Empty, inputCls } from "./ui";
import { Download, Mail, Search, Sparkle, Star, Trash } from "@/components/icons";

const fmt = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" });

type Filter = "all" | "unread" | "starred";

async function patch(body: object) {
  await fetch("/api/admin/messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

function exportCsv(items: ContactMessage[]) {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = [["fecha", "nombre", "email", "mensaje", "leido"], ...items.map((m) => [new Date(m.t).toISOString(), m.name, m.email, m.message, m.read ? "si" : "no"])];
  const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `mensajes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Messages({
  initial,
  onDraft,
  onChange,
}: {
  initial: ContactMessage[];
  onDraft: (m: ContactMessage) => void;
  onChange: (unread: number) => void;
}) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(initial[0]?.id ?? null);

  function update(next: ContactMessage[]) {
    setItems(next);
    onChange(next.filter((m) => !m.read).length);
  }

  const set = (id: string, p: Partial<ContactMessage>) => {
    update(items.map((x) => (id === "*" || x.id === id ? { ...x, ...p } : x)));
    patch({ id, ...p });
  };

  async function remove(m: ContactMessage) {
    if (!confirm(`¿Eliminar el mensaje de ${m.name}? No se puede deshacer.`)) return;
    update(items.filter((x) => x.id !== m.id));
    await fetch("/api/admin/messages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id }) });
  }

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (m) =>
        (filter === "all" || (filter === "unread" ? !m.read : m.starred)) &&
        (!q || `${m.name} ${m.email} ${m.message}`.toLowerCase().includes(q)),
    );
  }, [items, filter, query]);

  const counts = { all: items.length, unread: items.filter((m) => !m.read).length, starred: items.filter((m) => m.starred).length };
  const open = shown.find((m) => m.id === openId) ?? null;

  function select(m: ContactMessage) {
    setOpenId(m.id);
    if (!m.read) set(m.id, { read: true });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 text-sm">
          {(["all", "unread", "starred"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 ${filter === f ? "bg-ink text-bg" : "text-ink-2 hover:bg-surface"}`}
            >
              {{ all: "Todos", unread: "Sin leer", starred: "Destacados" }[f]} <span className="tabular opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>
        <label className="relative ml-auto w-full sm:w-64">
          <Search width={14} height={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar…" className={`${inputCls} py-1.5 pl-9`} aria-label="Buscar mensajes" />
        </label>
        <Button onClick={() => set("*", { read: true })} disabled={!counts.unread}>Marcar todo leído</Button>
        <Button onClick={() => exportCsv(items)} disabled={!items.length}>
          <Download width={13} height={13} /> CSV
        </Button>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong">
          <Empty>{query ? "Ningún mensaje coincide con la búsqueda." : "No hay mensajes acá todavía."}</Empty>
        </div>
      ) : (
        <div className="grid overflow-hidden rounded-xl border border-line bg-surface lg:grid-cols-[320px_1fr]">
          {/* Lista */}
          <ul className="max-h-[65vh] divide-y divide-line overflow-y-auto border-line lg:border-r">
            {shown.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => select(m)}
                  className={`w-full px-4 py-3 text-left transition-colors ${open?.id === m.id ? "bg-accent-soft/60" : "hover:bg-bg/60"}`}
                >
                  <div className="flex items-center gap-2">
                    {!m.read && <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-label="Sin leer" />}
                    <span className={`truncate text-sm ${m.read ? "text-ink-2" : "font-medium text-ink"}`}>{m.name}</span>
                    {m.starred && <Star width={12} height={12} className="shrink-0 fill-warm text-warm" />}
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-muted" suppressHydrationWarning>{timeAgo(m.t)}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted">{m.message}</p>
                </button>
              </li>
            ))}
          </ul>

          {/* Detalle */}
          {open ? (
            <article className="flex flex-col p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl">{open.name}</p>
                  <a href={`mailto:${open.email}`} className="text-sm text-accent hover:underline">{open.email}</a>
                </div>
                <p className="font-mono text-[11px] text-muted">{fmt.format(new Date(open.t))}</p>
              </div>
              <p className="mt-6 flex-1 leading-relaxed whitespace-pre-wrap text-ink-2">{open.message}</p>
              <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-4">
                <a
                  href={`mailto:${open.email}?subject=${encodeURIComponent("Re: tu mensaje en mi portafolio")}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-bg hover:bg-accent hover:text-accent-ink"
                >
                  <Mail width={13} height={13} /> Responder
                </a>
                <Button onClick={() => onDraft(open)}>
                  <Sparkle width={13} height={13} /> Borrador con IA
                </Button>
                <Button onClick={() => set(open.id, { starred: !open.starred })}>
                  <Star width={13} height={13} className={open.starred ? "fill-warm text-warm" : ""} /> {open.starred ? "Quitar destacado" : "Destacar"}
                </Button>
                <Button onClick={() => set(open.id, { read: !open.read })}>Marcar como {open.read ? "no leído" : "leído"}</Button>
                <Button variant="danger" className="ml-auto" onClick={() => remove(open)}>
                  <Trash width={13} height={13} /> Eliminar
                </Button>
              </div>
            </article>
          ) : (
            <Empty>Elegí un mensaje para leerlo.</Empty>
          )}
        </div>
      )}
    </div>
  );
}
