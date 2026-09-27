"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Stats } from "@/lib/analytics";
import type { GitHubUser, Repo } from "@/lib/github";
import type { ContactMessage, Settings } from "@/lib/store";
import { profile } from "@/content/profile";
import Overview from "./Overview";
import Traffic from "./Traffic";
import GitHubView from "./GitHubView";
import Messages from "./Messages";
import Assistant from "./Assistant";
import SettingsView from "./SettingsView";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowUpRight, Chart, Gear, GitHub, Grid, Inbox, Logout, Sparkle } from "@/components/icons";

type Tab = "resumen" | "trafico" | "github" | "mensajes" | "asistente" | "configuracion";

const TABS: { id: Tab; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: "resumen", label: "Resumen", icon: <Grid />, hint: "Cómo viene tu portafolio de un vistazo." },
  { id: "trafico", label: "Tráfico", icon: <Chart />, hint: "Quién te visita, desde dónde y cuándo." },
  { id: "github", label: "GitHub", icon: <GitHub />, hint: "Tus repositorios y qué les falta." },
  { id: "mensajes", label: "Mensajes", icon: <Inbox />, hint: "Lo que te escribieron desde el formulario." },
  { id: "asistente", label: "Asistente IA", icon: <Sparkle />, hint: "Gemini con el contexto de tu perfil y tus datos." },
  { id: "configuracion", label: "Configuración", icon: <Gear />, hint: "Contenido del inicio, links y datos." },
];

const RANGE_TABS: Tab[] = ["resumen", "trafico"];

export default function Dashboard({
  stats,
  repos,
  user,
  messages,
  settings,
  ranges,
  gemini,
  chatAvailable,
  model,
}: {
  stats: Stats;
  repos: Repo[] | null;
  user: GitHubUser | null;
  messages: ContactMessage[];
  settings: Settings;
  ranges: number[];
  gemini: boolean;
  chatAvailable: boolean;
  model: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("resumen");
  const [unread, setUnread] = useState(stats.messagesUnread);
  const [pending, setPending] = useState<{ action: string; messageId?: string; label: string } | null>(null);

  // Recuerda la pestaña en la URL (#mensajes) para poder recargar o compartir el acceso directo
  useEffect(() => {
    const h = location.hash.slice(1) as Tab;
    if (TABS.some((t) => t.id === h)) setTab(h);
  }, []);
  const go = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", `${location.pathname}${location.search}#${t}`);
    window.scrollTo({ top: 0 });
  };

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }

  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      {/* Barra lateral (escritorio) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line px-4 py-6 lg:flex">
        <Link href="/" target="_blank" className="group px-2 font-serif text-lg">
          {profile.name}
          <span className="text-accent">.</span>
        </Link>
        <p className="label-mono mt-1 px-2">panel</p>

        <nav className="mt-8 space-y-0.5" aria-label="Secciones del panel">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => go(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                tab === t.id ? "bg-accent-soft text-accent" : "text-ink-2 hover:bg-surface hover:text-ink"
              }`}
            >
              {tab === t.id && <span className="absolute top-2 bottom-2 -left-4 w-0.5 rounded-full bg-accent" />}
              <span className="[&>svg]:size-4">{t.icon}</span>
              {t.label}
              {t.id === "mensajes" && unread > 0 && (
                <span className="tabular ml-auto rounded-full bg-warm px-1.5 py-0.5 font-mono text-[10px] text-bg">{unread}</span>
              )}
              {t.id === "asistente" && !gemini && <span className="ml-auto font-mono text-[10px] text-muted">off</span>}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-line pt-4">
          <Link href="/" target="_blank" className="flex items-center gap-2 px-2 text-sm text-ink-2 hover:text-ink">
            <ArrowUpRight width={14} height={14} /> Ver sitio
          </Link>
          <button onClick={logout} className="flex items-center gap-2 px-2 text-sm text-ink-2 hover:text-ink">
            <Logout width={14} height={14} /> Cerrar sesión
          </button>
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="label-mono">tema</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barra superior (celular) */}
        <header className="sticky top-0 z-30 border-b border-line bg-bg/95 lg:hidden">
          <div className="flex h-14 items-center justify-between px-5">
            <p className="font-serif text-lg">
              Panel<span className="text-accent">.</span>
            </p>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button onClick={logout} aria-label="Cerrar sesión" className="text-ink-2">
                <Logout width={18} height={18} />
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2" aria-label="Secciones del panel">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${tab === t.id ? "bg-accent-soft text-accent" : "text-ink-2"}`}
              >
                <span className="[&>svg]:size-3.5">{t.icon}</span>
                {t.label}
                {t.id === "mensajes" && unread > 0 && <span className="tabular rounded-full bg-warm px-1.5 font-mono text-[10px] text-bg">{unread}</span>}
              </button>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
          {/* Encabezado de la vista */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl">{current.label}</h1>
              <p className="mt-1 text-sm text-muted">{current.hint}</p>
            </div>
            {RANGE_TABS.includes(tab) && (
              <div className="flex rounded-full border border-line p-0.5 text-xs" aria-label="Rango de fechas">
                {ranges.map((r) => (
                  <Link
                    key={r}
                    href={`/admin?range=${r}#${tab}`}
                    className={`rounded-full px-3 py-1 font-mono transition-colors ${stats.days === r ? "bg-ink text-bg" : "text-ink-2 hover:text-ink"}`}
                  >
                    {r}d
                  </Link>
                ))}
              </div>
            )}
          </div>

          {tab === "resumen" && <Overview stats={stats} repos={repos} settings={settings} gemini={gemini} unread={unread} go={go} />}
          {tab === "trafico" && <Traffic stats={stats} onGoLinks={() => go("configuracion")} />}
          {tab === "github" && <GitHubView repos={repos} user={user} />}
          {/* Estas vistas quedan montadas para no perder cambios al cambiar de pestaña */}
          <div hidden={tab !== "mensajes"}>
            <Messages
              initial={messages}
              onChange={setUnread}
              onDraft={(m) => {
                setPending({ action: "reply", messageId: m.id, label: `Borrador de respuesta para ${m.name}` });
                go("asistente");
              }}
            />
          </div>
          <div hidden={tab !== "configuracion"}>
            <SettingsView initial={settings} gemini={gemini} chatAvailable={chatAvailable} />
          </div>
          <div hidden={tab !== "asistente"}>
            <Assistant enabled={gemini} model={model} pending={pending} onPendingHandled={() => setPending(null)} />
          </div>
        </main>
      </div>
    </div>
  );
}
