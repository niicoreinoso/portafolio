"use client";

import type { GitHubUser, Repo } from "@/lib/github";
import { profile } from "@/content/profile";
import { timeAgo } from "@/lib/format";
import { BarList, StatTile } from "./charts";
import { Card, Empty, Hint } from "./ui";
import { ArrowUpRight, Check, X } from "@/components/icons";

const checks = (r: Repo) => [
  { ok: Boolean(r.description), label: "descripción" },
  { ok: r.topics.length > 0, label: "topics" },
  { ok: Boolean(r.homepage), label: "demo" },
];

export default function GitHubView({ repos, user }: { repos: Repo[] | null; user: GitHubUser | null }) {
  if (!repos) {
    return (
      <Card>
        <Empty>
          No se pudo conectar con GitHub (usuario <b>{profile.github}</b>). Revisá el usuario en profile.ts o agregá un GITHUB_TOKEN si superaste el límite de la API.
        </Empty>
      </Card>
    );
  }

  const own = repos.filter((r) => !r.fork);
  const stars = own.reduce((a, r) => a + r.stars, 0);
  const languages = Object.entries(
    own.reduce<Record<string, number>>((acc, r) => {
      if (r.language) acc[r.language] = (acc[r.language] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const lastPush = repos.reduce((a, r) => Math.max(a, new Date(r.updatedAt).getTime()), 0);
  const healthy = own.filter((r) => checks(r).every((c) => c.ok)).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="repos propios" value={own.length} hint={`${repos.length - own.length} forks`} />
        <StatTile label="estrellas" value={stars} />
        <StatTile label="seguidores" value={user?.followers ?? "—"} />
        <StatTile label="última actividad" value={lastPush ? <span suppressHydrationWarning>{timeAgo(lastPush)}</span> : "—"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Lenguajes principales">
          <BarList data={languages} empty="Sin lenguajes detectados" />
        </Card>

        <Card
          title={`Salud de los repos · ${healthy}/${own.length}`}
          className="lg:col-span-2"
          action={
            <a href={`https://github.com/${profile.github}?tab=repositories`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
              Abrir GitHub <ArrowUpRight width={12} height={12} />
            </a>
          }
        >
          <Hint>Un repo "sano" tiene descripción, topics y una demo. Es lo que ve un reclutador en tu portafolio.</Hint>
          {repos.length ? (
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="label-mono px-5 pb-2 font-normal">nombre</th>
                    <th className="label-mono px-2 pb-2 font-normal">lenguaje</th>
                    <th className="label-mono px-2 pb-2 text-right font-normal">★</th>
                    <th className="label-mono px-2 pb-2 font-normal">checklist</th>
                    <th className="label-mono px-5 pb-2 text-right font-normal">actualizado</th>
                  </tr>
                </thead>
                <tbody className="tabular">
                  {repos.map((r) => (
                    <tr key={r.name} className="border-b border-line last:border-0 hover:bg-bg/60">
                      <td className="px-5 py-2.5">
                        <a href={r.url} target="_blank" rel="noreferrer" className="hover:text-accent">{r.name}</a>
                        {r.fork && <span className="ml-2 rounded border border-line px-1 font-mono text-[10px] text-muted">fork</span>}
                        {profile.featuredRepos.includes(r.name) && <span className="ml-2 rounded border border-accent/40 px-1 font-mono text-[10px] text-accent">destacado</span>}
                      </td>
                      <td className="px-2 py-2.5 text-ink-2">{r.language ?? "—"}</td>
                      <td className="px-2 py-2.5 text-right text-ink-2">{r.stars}</td>
                      <td className="px-2 py-2.5">
                        <span className="flex gap-2">
                          {checks(r).map((c) => (
                            <span key={c.label} className={`inline-flex items-center gap-0.5 font-mono text-[10px] ${c.ok ? "text-good" : "text-muted"}`}>
                              {c.ok ? <Check width={11} height={11} /> : <X width={11} height={11} />}
                              {c.label}
                            </span>
                          ))}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right text-xs whitespace-nowrap text-muted" suppressHydrationWarning>{timeAgo(new Date(r.updatedAt).getTime())}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty>Todavía no hay repos públicos.</Empty>
          )}
        </Card>
      </div>
    </div>
  );
}
