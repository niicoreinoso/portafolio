import { getShowcaseRepos } from "@/lib/github";
import { profile } from "@/content/profile";
import { ArrowUpRight, Fork, GitHub, Star } from "@/components/icons";

const fmt = new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" });

export default async function Projects() {
  const repos = await getShowcaseRepos(6);
  const profileUrl = `https://github.com/${profile.github}`;

  return (
    <div>
      <p className="max-w-xl text-ink-2">
        Lo que estoy construyendo. El código está en mi GitHub.
      </p>

      {repos && repos.length > 0 ? (
        <ul data-stagger className="mt-8 grid gap-4 sm:grid-cols-2">
          {repos.map((r) => (
            <li key={r.name}>
              <a
                href={r.homepage || r.url}
                target="_blank"
                rel="noreferrer"
                className="spotlight group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-lg capitalize">{r.name.replace(/[-_]/g, " ")}</h3>
                  <ArrowUpRight className="mt-0.5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                </div>
                <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-ink-2">
                  {r.description ?? "Proyecto sin descripción todavía."}
                </p>
                {r.topics.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {r.topics.slice(0, 4).map((t) => (
                      <span key={t} className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent">{t}</span>
                    ))}
                  </div>
                )}
                <div className="tabular mt-4 flex items-center gap-4 text-xs text-muted">
                  {r.language && <span>{r.language}</span>}
                  {r.stars > 0 && <span className="inline-flex items-center gap-1"><Star width={12} height={12} />{r.stars}</span>}
                  {r.forks > 0 && <span className="inline-flex items-center gap-1"><Fork width={12} height={12} />{r.forks}</span>}
                  <span className="ml-auto">{fmt.format(new Date(r.updatedAt))}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        // Estado "en construcción": transmite que hay trabajo en marcha, no que falta algo
        <div className="spotlight relative mt-8 overflow-hidden rounded-2xl border border-line bg-surface p-7 sm:p-9">
          <div aria-hidden className="absolute inset-0 opacity-50 [background-image:repeating-linear-gradient(135deg,transparent_0_14px,var(--line)_14px_15px)] [mask-image:linear-gradient(to_left,#000,transparent_65%)]" />
          <div className="relative max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full bg-warm-soft px-3 py-1 text-xs font-medium text-ink-2">
              <span className="size-1.5 animate-pulse rounded-full bg-warm" />
              {repos ? "En construcción" : "Sin conexión con GitHub"}
            </span>
            <h3 className="mt-5 font-serif text-2xl">
              {repos ? "Mis primeros proyectos están en camino." : "No pude cargar los proyectos ahora."}
            </h3>
            <p className="mt-3 leading-relaxed text-ink-2">
              {repos
                ? "Estoy trabajando en proyectos que combinan datos, procesos y desarrollo. Mientras tanto, podés seguir mi actividad en GitHub."
                : "Podés verlos directamente en mi perfil de GitHub."}
            </p>
          </div>
        </div>
      )}

      <a
        href={profileUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
      >
        <GitHub /> Ver todo en github.com/{profile.github} <ArrowUpRight width={14} height={14} />
      </a>
    </div>
  );
}
