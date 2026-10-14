import { profile } from "@/content/profile";
import { publicChatEnabled } from "@/lib/gemini";
import { getSettings } from "@/lib/store";
import { getRepoActivity } from "@/lib/github";
import Header from "@/components/site/Header";
import Section from "@/components/site/Section";
import Projects from "@/components/site/Projects";
import NowBoard from "@/components/site/NowBoard";
import Untangle from "@/components/site/Untangle";
import Glyph from "@/components/site/Glyph";
import Route from "@/components/site/Route";
import Venn from "@/components/site/Venn";
import ToolIcon, { toolBrand } from "@/components/site/ToolIcon";
import ContactForm, { CopyEmail } from "@/components/site/ContactForm";
import ChatWidget from "@/components/site/ChatWidget";
import Tracker from "@/components/site/Tracker";
import Effects from "@/components/site/Effects";
import { ArrowUpRight, GitHub, LinkedIn, Mail } from "@/components/icons";

export const revalidate = 3600;

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const TOOL_GROUPS = [
  { id: "data", label: "Para entender datos" },
  { id: "build", label: "Para construir" },
  { id: "team", label: "Para trabajar con otros" },
];

/** Titular con la última palabra destacada subrayada a mano (se dibuja al cargar). */
function Headline({ text, highlights }: { text: string; highlights: string[] }) {
  const mark = highlights[highlights.length - 1];
  if (!mark) return <>{text}</>;
  const at = text.toLowerCase().lastIndexOf(mark.toLowerCase());
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="relative whitespace-nowrap text-ink">
        {text.slice(at, at + mark.length)}
        <svg className="draw hand absolute -bottom-[0.2em] -left-[3%] h-[0.42em] w-[106%]" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
          <path className="e" pathLength={1} d="M4 12 C80 4, 180 6, 296 10" strokeWidth="5" />
        </svg>
      </span>
      {text.slice(at + mark.length)}
    </>
  );
}

export default async function Home() {
  const p = profile;
  const [settings, activity] = await Promise.all([getSettings(), getRepoActivity(p.featuredRepos[0] ?? "portafolio")]);
  const year = new Date().getFullYear();
  const [firstName, ...rest] = p.name.split(" ");
  const facts = p.facts.filter((f) => f.value.trim());

  return (
    <>
      <Header />

      {/* Inicio: nombre grande y el tablero "En este momento" */}
      <section id="inicio" className="mx-auto grid max-w-[1080px] items-center gap-14 px-5 pt-14 pb-24 sm:px-10 sm:pt-20 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1fr_400px] lg:pb-28">
        <div className="intro">
          <p style={{ "--d": 0 } as Vars} className="flex items-center gap-2.5 text-[15px] text-ink-2">
            <span className={`size-2 shrink-0 rounded-full ${settings.available ? "bg-accent" : "bg-muted"}`} />
            <span className="first-letter:uppercase">{settings.availableText}</span>
          </p>
          <h1
            style={{ opacity: 1, animation: "none" }}
            className="mt-6 text-[clamp(3.6rem,15vw,7.4rem)] leading-[0.88] font-extrabold tracking-[-0.06em]"
          >
            <span className="intro-line" style={{ "--d": 1 } as Vars}>
              <span>{firstName}</span>
            </span>
            <span className="intro-line" style={{ "--d": 2 } as Vars}>
              <span>
                {rest.join(" ")}
                <span className="text-accent">.</span>
              </span>
            </span>
          </h1>
          <p style={{ "--d": 5 } as Vars} className="mt-8 max-w-[34rem] text-xl leading-relaxed text-ink-2">
            <Headline text={p.headline} highlights={p.headlineHighlights} />
          </p>
          <div style={{ "--d": 6 } as Vars} className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#como-trabajo" className="rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold text-bg transition-transform active:scale-[0.97]">
              Ver cómo trabajo ↓
            </a>
            <a href="#contacto" className="rounded-full border border-line px-6 py-3.5 text-[15px] font-semibold transition-colors hover:border-line-strong">
              Escribime
            </a>
            {p.cvUrl && (
              <a href={p.cvUrl} className="px-3 py-3 text-[15px] text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                Descargar CV
              </a>
            )}
          </div>
        </div>
        <NowBoard now={settings.now} activity={activity} />
      </section>

      <Untangle />

      <main>
        {/* 01 · Sobre mí */}
        <Section id="sobre-mi" index={1} label="Sobre mí">
          <div className="mt-8 grid gap-12 md:grid-cols-[300px_1fr] md:gap-16">
            <div className="reveal">
              {p.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt={p.name} className="aspect-[4/5] w-full rounded-[22px] object-cover" />
              ) : (
                <div className="flex aspect-[4/5] w-full flex-col justify-between rounded-[22px] border border-line bg-surface p-6">
                  <span className="font-serif text-7xl leading-none text-accent">
                    {p.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <span className="text-sm text-muted">{p.location}</span>
                </div>
              )}
              {facts.length > 0 && (
                <dl className="mt-6 text-sm">
                  {facts.map((f) => (
                    <div key={f.label} className="grid grid-cols-[120px_1fr] gap-3 border-t border-line py-3 last:border-b">
                      <dt className="text-muted">{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div>
              <div className="reveal">
                <p className="text-[1.9rem] leading-[1.2] font-semibold tracking-[-0.03em] sm:text-[2.1rem]">{p.aboutLead}</p>
                {p.about.map((para) => (
                  <p key={para.slice(0, 24)} className="mt-5 text-lg leading-relaxed text-ink-2">
                    {para}
                  </p>
                ))}
              </div>
              <div className="reveal mt-14">
                <p className="kicker">Mis reglas de trabajo</p>
                <ol data-stagger className="mt-3">
                  {p.principles.map((r, i) => (
                    <li key={r} className="grid grid-cols-[48px_1fr] items-baseline border-t border-line py-5 sm:grid-cols-[64px_1fr]">
                      <span className="font-serif text-4xl leading-none text-accent">{i + 1}</span>
                      <span className="text-2xl leading-tight font-bold tracking-[-0.03em] sm:text-[1.85rem]">{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div className="reveal mt-24">
            <h3 className="text-[1.75rem] font-bold tracking-[-0.025em]">Qué me interesa</h3>
            <ul data-stagger className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {p.interests.map((it, i) => (
                <li
                  key={it.title}
                  data-glyph
                  style={{ "--i": i } as Vars}
                  className="flex flex-col gap-6 rounded-[20px] border border-line bg-surface p-6 hover:border-line-strong sm:min-h-56"
                >
                  <Glyph name={it.glyph} />
                  <div className="mt-auto">
                    <h4 className="text-lg font-bold tracking-[-0.015em]">{it.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{it.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-24">
            <h3 className="reveal text-[1.75rem] font-bold tracking-[-0.025em]">Hacia dónde voy</h3>
            <p className="reveal mt-3 max-w-2xl leading-relaxed text-ink-2">{p.growth.intro}</p>
            <div className="mt-10 md:mt-14">
              <Route goals={p.growth.goals} />
            </div>
          </div>
        </Section>

        {/* 02 · Habilidades (sala) */}
        <Section id="habilidades" index={2} label="Habilidades" title="Mis herramientas" room>
          <p className="reveal mt-4 max-w-xl text-lg text-ink-2">Agrupadas por para qué las uso.</p>
          <div className="mt-12">
            {TOOL_GROUPS.map((g) => {
              const tools = p.tools.filter((t) => t.group === g.id);
              if (!tools.length) return null;
              return (
                <div key={g.id} className="reveal grid gap-4 border-t border-line py-5 md:grid-cols-[220px_1fr] md:items-center md:gap-8">
                  <p className="font-semibold">{g.label}</p>
                  <ul data-stagger className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {tools.map((t) => (
                      <li
                        key={t.name}
                        style={{ "--brand": toolBrand(t.icon) } as Vars}
                        className="tile flex min-h-[84px] flex-col justify-between gap-3 rounded-[14px] border border-line p-3.5 pb-4"
                      >
                        <span className="text-ink-2">
                          <ToolIcon name={t.icon} size={20} />
                        </span>
                        <span className="text-sm font-semibold">{t.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div data-stagger className="reveal mt-20 grid gap-12 sm:grid-cols-3 sm:gap-10">
            {p.competencies.map((c) => (
              <div key={c.group}>
                <h3 className="text-xl font-bold tracking-[-0.015em]">{c.group}</h3>
                <ul className="mt-3.5">
                  {c.items.map((s) => (
                    <li key={s} className="border-t border-line py-2.5 text-[15px] text-ink-2">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* 03 · Formación */}
        <Section id="formacion" index={3} label="Formación" divider={false}>
          <div className="reveal mt-8 grid items-center gap-10 md:grid-cols-[minmax(0,420px)_1fr] md:gap-16">
            <div className="text-ink">
              <Venn />
            </div>
            <div>
              <p className="text-[15px] text-muted">
                {p.education.university} · {p.education.faculty}
              </p>
              <h3 className="mt-3 text-3xl leading-[1.08] font-bold tracking-[-0.035em] sm:text-[2.5rem]">{p.education.degree}</h3>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm">
                <span className="size-2 rounded-full bg-accent" />
                {p.education.status}
              </p>
              <p className="mt-6 leading-relaxed text-ink-2">{p.education.description}</p>
              <ol className="mt-6">
                {p.education.topics.map((t, i) => (
                  <li key={t} className="grid grid-cols-[44px_1fr] gap-4 border-t border-line py-3.5 last:border-b">
                    <span className="font-mono text-[13px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[17px]">{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Section>

        {/* 04 · Proyectos */}
        <Section id="proyectos" index={4} label="Proyectos" title="Lo que estoy construyendo">
          <Projects />
        </Section>
      </main>

      {/* 05 · Contacto + pie (sala) */}
      <div className="room">
        <Section id="contacto" index={5} label="Contacto" room>
          <div className="mt-6 grid gap-14 lg:grid-cols-2 lg:gap-16">
            <div className="reveal">
              <p className="text-[clamp(4rem,14vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.05em]">
                Hablemos<span className="text-accent">.</span>
              </p>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">
                ¿Tenés una propuesta, una pregunta o simplemente querés charlar? Escribime y te respondo a la brevedad.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${p.email}`}
                  className="group inline-flex items-center gap-2 text-lg font-semibold break-all underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent sm:text-xl"
                >
                  {p.email}
                  <ArrowUpRight width={16} height={16} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <CopyEmail />
              </div>
            </div>
            <div className="reveal lg:pt-6">
              <ContactForm />
            </div>
          </div>
        </Section>

        <footer className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-4 border-t border-line px-5 pt-8 pb-24 text-sm text-muted sm:px-10 sm:pb-10">
          <p>
            © {year} <span className="font-semibold text-ink">{p.name}</span>
            <span className="ml-3 hidden sm:inline">Hecho a mano en Buenos Aires</span>
          </p>
          <div className="flex items-center gap-2">
            {[
              { href: `https://github.com/${p.github}`, label: "GitHub", icon: <GitHub width={17} height={17} /> },
              ...(p.linkedin ? [{ href: p.linkedin, label: "LinkedIn", icon: <LinkedIn width={17} height={17} /> }] : []),
              { href: `mailto:${p.email}`, label: "Email", icon: <Mail width={17} height={17} /> },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={l.label}
                className="flex size-10 items-center justify-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent"
              >
                {l.icon}
              </a>
            ))}
          </div>
        </footer>
      </div>

      <Tracker />
      <Effects />
      {publicChatEnabled() && settings.chatEnabled && <ChatWidget />}
    </>
  );
}
