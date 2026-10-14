import { getShowcaseRepos, type Repo } from "@/lib/github";
import { profile } from "@/content/profile";
import { ArrowUpRight, GitHub, Star } from "@/components/icons";

const fmt = new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" });
const title = (r: Repo) => r.name.replace(/[-_]/g, " ");

/** El proyecto destacado, como una "sala" oscura con su ficha. */
function Featured({ r }: { r: Repo }) {
  const facts = [
    r.language && { k: "Lenguaje", v: r.language },
    r.topics.length > 0 && { k: "Temas", v: r.topics.slice(0, 5).join(" · ") },
    { k: "Actualizado", v: fmt.format(new Date(r.updatedAt)) },
  ].filter((f): f is { k: string; v: string } => Boolean(f));

  return (
    <a
      href={r.homepage || r.url}
      target="_blank"
      rel="noreferrer"
      className="room group grid gap-10 rounded-[28px] p-7 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 sm:p-12 md:grid-cols-2 md:gap-14"
    >
      <div>
        <p className="kicker">Proyecto destacado</p>
        <h3 className="mt-3 text-5xl leading-none font-extrabold tracking-[-0.045em] capitalize sm:text-6xl">{title(r)}</h3>
        <p className="mt-5 leading-relaxed text-ink-2">{r.description ?? "Proyecto sin descripción todavía."}</p>
        <p className="mt-6 inline-flex items-center gap-1.5 font-semibold">
          Ver en GitHub <ArrowUpRight width={15} height={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </p>
      </div>
      <dl className="self-end">
        {facts.map((f) => (
          <div key={f.k} className="grid grid-cols-[110px_1fr] gap-4 border-t border-line py-4 last:border-b">
            <dt className="text-sm text-muted">{f.k}</dt>
            <dd className="text-[15px]">{f.v}</dd>
          </div>
        ))}
      </dl>
    </a>
  );
}

function Card({ r }: { r: Repo }) {
  return (
    <a
      href={r.homepage || r.url}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col rounded-[20px] border border-line bg-surface p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold tracking-[-0.02em] capitalize">{title(r)}</h3>
        <ArrowUpRight className="mt-1 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
      </div>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-2">{r.description ?? "Proyecto sin descripción todavía."}</p>
      <div className="tabular mt-5 flex items-center gap-4 text-xs text-muted">
        {r.language && <span>{r.language}</span>}
        {r.stars > 0 && (
          <span className="inline-flex items-center gap-1">
            <Star width={12} height={12} />
            {r.stars}
          </span>
        )}
        <span className="ml-auto">{fmt.format(new Date(r.updatedAt))}</span>
      </div>
    </a>
  );
}

export default async function Projects() {
  const repos = await getShowcaseRepos(5);
  const profileUrl = `https://github.com/${profile.github}`;
  const [first, ...rest] = repos ?? [];

  return (
    <div className="mt-10">
      {first ? (
        <div className="reveal">
          <Featured r={first} />
          {rest.length > 0 && (
            <ul data-stagger className="mt-4 grid gap-4 sm:grid-cols-2">
              {rest.map((r) => (
                <li key={r.name}>
                  <Card r={r} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="reveal rounded-[24px] border border-line bg-surface p-7 sm:p-10">
          <p className="kicker">{repos ? "En construcción" : "Sin conexión con GitHub"}</p>
          <h3 className="mt-4 text-2xl font-bold tracking-[-0.02em]">
            {repos ? "Mis primeros proyectos están en camino." : "No pude cargar los proyectos ahora."}
          </h3>
          <p className="mt-3 max-w-md leading-relaxed text-ink-2">
            {repos
              ? "Estoy trabajando en proyectos que combinan datos, procesos y desarrollo. Mientras tanto, podés seguir mi actividad en GitHub."
              : "Podés verlos directamente en mi perfil de GitHub."}
          </p>
        </div>
      )}

      <a
        href={profileUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex items-center gap-2 text-[15px] text-ink-2 transition-colors hover:text-ink"
      >
        <GitHub /> Ver todo en github.com/{profile.github} <ArrowUpRight width={14} height={14} />
      </a>
    </div>
  );
}
