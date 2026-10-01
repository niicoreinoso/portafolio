import { profile } from "@/content/profile";
import { publicChatEnabled } from "@/lib/gemini";
import { getSettings, type Settings } from "@/lib/store";
import Header from "@/components/site/Header";
import Section from "@/components/site/Section";
import Projects from "@/components/site/Projects";
import ProcessFlow from "@/components/site/ProcessFlow";
import ToolIcon, { AreaIcon, toolBrand } from "@/components/site/ToolIcon";
import ContactForm, { CopyEmail } from "@/components/site/ContactForm";
import ChatWidget from "@/components/site/ChatWidget";
import Tracker from "@/components/site/Tracker";
import Effects from "@/components/site/Effects";
import HeroField from "@/components/site/HeroField";
import { ArrowRight, ArrowUpRight, Book, Code, GitHub, LinkedIn, Mail, MapPin, Target } from "@/components/icons";

export const revalidate = 3600;

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** Marca en cursiva y con color las palabras destacadas del titular. */
function Headline({ text, highlights }: { text: string; highlights: string[] }) {
  if (!highlights.length) return <>{text}</>;
  const re = new RegExp(`(${highlights.join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) =>
        highlights.some((h) => h.toLowerCase() === part.toLowerCase()) ? (
          <em key={i} className="hl font-serif text-accent italic">{part}</em>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Tarjeta "Ahora mismo" del inicio (con foto si está configurada). */
function NowCard({ now }: { now: Settings["now"] }) {
  const p = profile;
  const initials = p.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  const rows = [
    { icon: <Book width={15} height={15} />, label: "cursando", value: now.studying },
    { icon: <Code width={15} height={15} />, label: "aprendiendo", value: now.learning },
    { icon: <Target width={15} height={15} />, label: "buscando", value: now.seeking },
  ];
  return (
    <aside className="now-card rounded-3xl border border-line bg-surface p-6 transition-colors duration-500 hover:border-line-strong sm:p-7">
      <div className="flex items-center gap-4">
        {p.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo} alt={p.name} className="size-14 rounded-2xl object-cover" />
        ) : (
          <span className="relative flex size-14 items-center justify-center rounded-2xl border border-line-strong bg-bg font-serif text-2xl text-ink italic">
            {initials}
          </span>
        )}
        <div>
          <p className="font-serif text-lg leading-tight">{p.name}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
            <MapPin width={12} height={12} /> {p.location}
          </p>
        </div>
      </div>

      <p className="label-mono mt-7">ahora mismo</p>
      <ul className="mt-2 divide-y divide-line">
        {rows.map((r, i) => (
          <li
            key={r.label}
            style={{ "--r": i } as Vars}
            className="now-row group -mx-2 flex items-start gap-3 rounded-xl px-2 py-3.5 transition-colors duration-300 hover:bg-accent-soft/30"
          >
            <span className="relative mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-line text-accent transition-colors duration-300 group-hover:border-accent/50">
              {r.icon}
              {r.label === "buscando" && <span aria-hidden className="now-ripple absolute inset-0 rounded-lg border border-accent" />}
            </span>
            <div>
              <p className="font-mono text-[11px] text-muted">{r.label}</p>
              <p className="mt-0.5 text-sm text-ink">{r.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default async function Home() {
  const p = profile;
  const settings = await getSettings();
  const year = new Date().getFullYear();
  const firstName = p.name.split(" ")[0];
  const lastName = p.name.split(" ").slice(1).join(" ");

  return (
    <>
      <Header />

      {/* Inicio */}
      <section id="inicio" className="hero-wash relative overflow-hidden">
        {/* Una sola luz de color, la del acento, que respira muy despacio */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="glow absolute -top-48 right-[-15%] size-[620px] rounded-full [--glow-color:var(--accent)] sm:size-[820px]" />
        </div>

        <HeroField />

        <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-5xl content-center items-center gap-x-14 gap-y-14 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_330px]">
          <div className="intro">
            <p style={{ "--d": 0 } as Vars} className="label-mono flex items-center gap-2">
              <span className="relative flex size-2">
                {settings.available && <span className="now-ripple absolute inset-0 rounded-full bg-good" />}
                <span className={`relative size-2 rounded-full ${settings.available ? "bg-good" : "bg-muted"}`} />
              </span>
              {settings.availableText}
              <span className="caret text-accent">_</span>
            </p>

            {/* Cada línea del nombre sube desde una máscara */}
            <h1 style={{ opacity: 1, animation: "none" }} className="mt-7 font-serif text-[3.4rem] leading-[0.98] font-light sm:text-8xl">
              <span className="intro-line" style={{ "--d": 1 } as Vars}>
                <span>{firstName}</span>
              </span>
              <span className="intro-line" style={{ "--d": 2 } as Vars}>
                <span>
                  <span className="pr-[0.08em] text-ink-2 italic">{lastName}</span>
                  <span className="text-accent">.</span>
                </span>
              </span>
            </h1>

            <p style={{ "--d": 4 } as Vars} className="mt-8 max-w-xl text-xl leading-relaxed text-ink-2 sm:text-2xl sm:leading-[1.5]">
              <Headline text={p.headline} highlights={p.headlineHighlights} />
            </p>

            <div style={{ "--d": 5 } as Vars} className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#proyectos"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-accent-ink"
              >
                Ver proyectos <ArrowRight width={14} height={14} className="transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#contacto"
                className="rounded-full border border-line-strong px-6 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-ink"
              >
                Escribime
              </a>
              {p.cvUrl && (
                <a href={p.cvUrl} className="px-3 py-3 text-sm text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                  Descargar CV
                </a>
              )}
            </div>
          </div>

          <div className="intro">
            <div style={{ "--d": 6 } as Vars}>
              <NowCard now={settings.now} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <ProcessFlow />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* 01 · Sobre mí: presentación + intereses + hacia dónde voy */}
        <Section id="sobre-mi" title="Sobre mí">
          <div data-stagger className="space-y-6 text-lg leading-relaxed text-ink-2 sm:text-xl sm:leading-relaxed">
            {p.about.map((para, i) => (
              <p key={i} className={i === 0 ? "text-ink first-letter:float-left first-letter:mt-1.5 first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-accent" : ""}>
                {para}
              </p>
            ))}
          </div>

          <div className="mt-16">
            <h3 className="font-serif text-2xl">Qué me interesa</h3>
            <ul data-stagger className="mt-5 border-t border-line">
              {p.interests.map((it) => (
                <li
                  key={it.title}
                  className="group grid items-baseline gap-x-8 border-b border-line py-5 sm:grid-cols-[14rem_1fr]"
                >
                  <h4 className="font-serif text-xl transition-colors duration-300 group-hover:text-accent">{it.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2 transition-colors duration-300 group-hover:text-ink sm:mt-0">{it.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-16">
            <h3 className="font-serif text-2xl">Hacia dónde voy</h3>
            <p className="mt-5 max-w-2xl leading-relaxed text-ink-2 sm:text-lg">{p.growth.intro}</p>
            <div className="relative mt-10">
              <span aria-hidden className="grow-y absolute inset-y-0 left-0 w-px bg-gradient-to-b from-accent/60 via-line-strong to-transparent" />
              <ol data-stagger className="space-y-9 pl-8">
                {p.growth.goals.map((g, i) => (
                  <li key={g.title} className="relative">
                    <span className="tabular absolute top-0 -left-[calc(2rem+14px)] flex size-7 items-center justify-center rounded-full border border-accent/30 bg-bg font-mono text-xs text-accent">
                      {i + 1}
                    </span>
                    <h4 className="font-serif text-xl">{g.title}</h4>
                    <p className="mt-1.5 leading-relaxed text-ink-2">{g.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Section>

        {/* 02 · Formación */}
        <Section id="formacion" title="Formación">
          <div className="spotlight relative overflow-hidden rounded-2xl border border-line bg-surface p-7 sm:p-9">
            <div aria-hidden className="grow-y absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent to-warm" />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted">{p.education.university}</p>
                <h3 className="mt-2 font-serif text-2xl leading-snug sm:text-[1.7rem]">{p.education.degree}</h3>
                <p className="mt-1.5 text-ink-2">{p.education.faculty}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 px-3 py-1 font-mono text-[11px] text-accent">
                <span className="size-1.5 rounded-full bg-accent" /> {p.education.status.toLowerCase()}
              </span>
            </div>
            <p className="mt-7 leading-relaxed text-ink-2">{p.education.description}</p>
          </div>
        </Section>

        {/* 03 · Habilidades: herramientas con logo + competencias por área */}
        <Section id="habilidades" title="Habilidades">
          <h3 className="font-serif text-2xl">Herramientas</h3>
          <ul data-stagger className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4 lg:grid-cols-6">
            {p.tools.map((t) => (
              <li
                key={t.name}
                style={{ "--brand": toolBrand(t.icon) } as Vars}
                className="tool group flex flex-col items-center justify-center gap-3 bg-bg px-2 py-6 text-ink-2 hover:bg-surface"
              >
                <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                  <ToolIcon name={t.icon} size={24} />
                </span>
                <span className="font-mono text-[11px] text-muted transition-colors group-hover:text-ink">{t.name}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-14 font-serif text-2xl">Competencias</h3>
          <div data-stagger className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-3">
            {p.competencies.map((c) => (
              <div key={c.group} className="group/area">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-line bg-surface text-accent transition-all duration-500 group-hover/area:rotate-[-8deg] group-hover/area:border-accent group-hover/area:bg-accent group-hover/area:text-accent-ink">
                    <AreaIcon name={c.icon} />
                  </span>
                  <h4 className="font-serif text-lg leading-tight">{c.group}</h4>
                </div>
                {/* Ítems colgando de una línea, como un árbol de diagrama */}
                <ul className="mt-3 ml-[17px] space-y-2.5 border-l border-line pt-2 pl-5">
                  {c.items.map((s) => (
                    <li
                      key={s}
                      className="relative text-sm leading-snug text-ink-2 transition-colors before:absolute before:top-[0.6em] before:-left-5 before:h-px before:w-3 before:bg-line-strong before:transition-colors hover:text-ink hover:before:bg-accent"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* 04 · Proyectos */}
        <Section id="proyectos" title="Proyectos">
          <Projects />
        </Section>
      </main>

      {/* 05 · Contacto + pie, en una franja azul noche que cierra la página */}
      <div className="band relative mt-10 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="glow absolute -top-64 -right-48 size-[680px] rounded-full [--glow-color:var(--accent)]" />
          <div className="glow absolute bottom-[-35%] left-[-18%] size-[520px] rounded-full [--glow-color:var(--warm)] [animation-delay:-9s]" style={{ opacity: 0.18 }} />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          <Section id="contacto" title="Contacto" divider={false}>
            <p className="font-serif text-4xl leading-tight font-light sm:text-6xl">
              Hablemos<span className="text-accent">.</span>
            </p>
            <p className="mt-4 max-w-xl text-lg text-ink-2">
              ¿Tenés una propuesta, una pregunta o simplemente querés charlar? Escribime y te respondo a la brevedad.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${p.email}`}
                className="group inline-flex items-center gap-2.5 text-lg font-medium underline decoration-accent/40 decoration-2 underline-offset-8 transition-colors hover:text-accent hover:decoration-accent sm:text-2xl"
              >
                <Mail width={20} height={20} className="text-accent" />
                {p.email}
                <ArrowUpRight width={16} height={16} className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <CopyEmail />
            </div>
            <div className="mt-12 rounded-2xl border border-line bg-surface/60 p-6 sm:p-8">
                            <ContactForm />
            </div>
          </Section>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 pb-24 text-sm text-muted sm:pb-10">
            <p>
              © {year} <span className="font-serif text-ink italic">{p.name}</span>
              <span className="ml-3 hidden text-xs sm:inline">Hecho a mano en Buenos Aires</span>
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
                  className="flex size-9 items-center justify-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent"
                >
                  {l.icon}
                </a>
              ))}
            </div>
          </footer>
        </div>
      </div>

      <Tracker />
      <Effects />
      {publicChatEnabled() && settings.chatEnabled && <ChatWidget />}
    </>
  );
}
