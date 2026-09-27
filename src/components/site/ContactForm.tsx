"use client";

import { useState } from "react";
import { profile } from "@/content/profile";
import { Check, Copy } from "@/components/icons";

const field =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted outline-none transition focus:border-ink-2";

export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(profile.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-ink"
      aria-label="Copiar email"
    >
      {copied ? <Check width={14} height={14} /> : <Copy width={14} height={14} />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    }).catch(() => null);
    if (res?.ok) {
      setStatus("ok");
      form.reset();
    } else {
      setStatus("error");
      setError((await res?.json().catch(() => null))?.error ?? "No se pudo enviar. Escribime directo por mail.");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-xl border border-line bg-surface p-6">
        <p className="font-medium">¡Gracias por escribir!</p>
        <p className="mt-1 text-sm text-ink-2">Recibí tu mensaje y te respondo a la brevedad.</p>
        <button onClick={() => setStatus("idle")} className="mt-4 text-sm text-accent hover:underline">
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Nombre</span>
          <input name="name" required maxLength={100} placeholder="Tu nombre" className={field} />
        </label>
        <label className="block">
          <span className="sr-only">Email</span>
          <input name="email" type="email" required maxLength={200} placeholder="Tu email" className={field} />
        </label>
      </div>
      <label className="block">
        <span className="sr-only">Mensaje</span>
        <textarea name="message" required minLength={5} maxLength={4000} rows={5} placeholder="¿En qué te puedo ayudar?" className={`${field} resize-y`} />
      </label>
      {/* Campo trampa anti-spam, invisible para personas */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex flex-wrap items-center gap-4">
        <button
          disabled={status === "sending"}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {status === "sending" ? "Enviando…" : "Enviar mensaje"}
        </button>
        {status === "error" && <p className="text-sm text-bad">{error}</p>}
      </div>
    </form>
  );
}
