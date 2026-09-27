"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setError((await res?.json().catch(() => null))?.error ?? "No se pudo iniciar sesión.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="glow absolute -top-60 -right-40 size-[640px] rounded-full [--glow-color:var(--accent)]" />
        <div className="glow absolute -bottom-60 -left-40 size-[520px] rounded-full [--glow-color:var(--warm)] [animation-delay:-8s]" />
      </div>

      <form onSubmit={onSubmit} className="border-flow relative w-full max-w-sm rounded-3xl border border-line bg-surface p-8">
        <p className="label-mono">acceso privado</p>
        <h1 className="mt-3 font-serif text-3xl">
          Panel<span className="text-accent">.</span>
        </h1>
        <p className="mt-1 text-sm text-muted">Ingresá tu contraseña de administrador.</p>
        <label className="mt-8 block">
          <span className="label-mono">contraseña</span>
          <span className="relative mt-2 block">
            <input
              name="password"
              type={show ? "text" : "password"}
              required
              autoFocus
              autoComplete="current-password"
              className="w-full rounded-lg border border-line bg-bg py-2.5 pr-16 pl-3.5 text-sm outline-none transition focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[11px] text-muted hover:text-ink"
            >
              {show ? "ocultar" : "mostrar"}
            </button>
          </span>
        </label>
        {error && <p className="mt-3 text-sm text-bad">{error}</p>}
        <button
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink py-2.5 text-sm font-medium text-bg transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
        <a href="/" className="mt-5 block text-center text-xs text-muted hover:text-ink">← Volver al sitio</a>
      </form>
    </main>
  );
}
