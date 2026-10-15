"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HeroField from "@/components/site/HeroField";

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
      <HeroField />

      <form onSubmit={onSubmit} className="relative w-full max-w-sm overflow-hidden rounded-[26px] border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="font-bold">Acceso privado</p>
          <p className="font-mono text-xs text-muted">
            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-accent align-[1px]" />
            solo admin
          </p>
        </div>
        <div className="px-6 pt-6 pb-7">
          <h1 className="text-5xl leading-[0.9] font-extrabold tracking-[-0.05em]">
            Panel<span className="text-accent">.</span>
          </h1>
          <p className="mt-3 text-[15px] text-ink-2">Ingresá tu contraseña de administrador.</p>
          <label className="mt-7 block">
            <span className="kicker">Contraseña</span>
            <span className="relative mt-2 block">
              <input
                name="password"
                type={show ? "text" : "password"}
                required
                autoFocus
                autoComplete="current-password"
                className="w-full rounded-xl border border-line bg-bg py-3 pr-16 pl-4 text-[15px] outline-none transition focus:border-ink-2"
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
            className="mt-6 w-full rounded-full bg-accent py-3.5 text-[15px] font-semibold text-accent-ink transition-transform active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
          <a href="/" className="mt-5 block text-center text-sm text-muted hover:text-ink">← Volver al sitio</a>
        </div>
      </form>
    </main>
  );
}
