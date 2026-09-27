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
import { ArrowRight, ArrowUpRight, Book, Code, GitHub, LinkedIn, Mail, MapPin, Target } from "@/components/icons";

export const revalidate = 3600;

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const MARQUEE = ["Sistemas", "procesos", "Datos", "personas", "Decisiones", "organizaciones", "Tecnología", "gestión"];

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
function NowCard({ now, available }: { now: Settings["now"]; available: boolean }) {
  const p = profile;
  const initials = p.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  const rows = [
    { icon: <Book width={15} height={15} />, label: "cursando", value: now.studying },
    { icon: <Code width={15} height={15} />, label: "aprendiendo", value: now.learning },
    { icon: <Target width={15} height={15} />, label: "buscando", value: now.seeking },
  ];
  return (
    <aside data-tilt className="spotlight border-flow rounded-3xl border border-line bg-surface p-6 hover:border-line-strong sm:p-7">
      <div className="flex items-center gap-4">
        {p.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo} alt={p.name} className="size-14 rounded-2xl object-cover" />
        ) : (
          <span className="relative flex size-14 items-center justify-center rounded-2xl border border-line-strong bg-bg font-serif text-2xl text-ink italic">
            {initials}
            {available && <span className="absolute -right-1 -bottom-1 size-3 rounded-full border-2 border-surface bg-good" aria-label="Disponible" />}
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
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-3 py-3.5">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-line text-accent">{r.icon}</span>
            <div>
              <p className="font-mono text-[11px] text-muted">{r.label}</p>
              <p className="mt-0.5 text-sm text-ink">{r.value}</p>
            </div>
          </li>
        ))}
      </ul>
      <a href="#contacto" className="group mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        Escribime <ArrowRight width={14} height={14} className="transition-transform group-hover:translate-x-1" />
      </a>
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
        {/* Luces de color que respiran y se mueven con el scroll */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div data-parallax="0.3" className="absolute inset-0">
            <div className="glow absolute -top-48 right-[-15%] size-[620px] rounded-full [--glow-color:var(--accent)] sm:size-[820px]" />
            <div className="glow absolute top-[38%] left-[-22%] size-[560px] rounded-full [--glow-color:var(--warm)] [animation-delay:-7s]" />
          </div>
        </div>

        <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-5xl content-center items-center gap-x-14 gap-y-14 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_330px]">
          <div className="intro" data-parallax="0.14" data-fade>
            <p style={{ "--d": 0 } as Vars} className="label-mono flex items-center gap-2">
              <span className={`size-1.5 ${settings.available ? "bg-good" : "bg-muted"}`} />
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
                  <span className="text-flow pr-[0.08em] italic">{lastName}</span>
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
                data-magnetic
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-accent-ink"
              >
                Ver proyectos <ArrowRight width={14} height={14} className="transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#contacto"
                data-magnetic
                className="rounded-full border border-line-strong px-6 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-ink"
              >
                Contactarme
              </a>
              {p.cvUrl && (
                <a href={p.cvUrl} className="px-3 py-3 text-sm text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                  Descargar CV
                </a>
              )}
            </div>
          </div>

          <div className="intro" data-parallax="0.06">
            <div style={{ "--d": 6 } as Vars}>
              <NowCard now={settings.now} available={settings.available} />
            </div>
          </div>

          <div className="hidden sm:block lg:col-span-2">
            <ProcessFlow />
          </div>
        </div>
      </section>

      {/* Cinta de conceptos: se desliza sola y se pausa con el mouse */}
      <div className="marquee overflow-hidden border-y border-line py-5" aria-hidden>
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {MARQUEE.map((w, i) => (
                <span key={w} className="flex items-center">
                  <span className={`px-7 font-serif text-2xl whitespace-nowrap sm:text-3xl ${i % 2 ? "text-muted italic" : "text-ink-2"}`}>{w}</span>
                  <span className={`size-2 rotate-45 border ${i % 3 === 0 ? "border-accent bg-accent/30" : i % 3 === 1 ? "border-warm" : "border-line-strong"}`} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* 01 · Sobre mí: presentación + intereses + hacia dónde voy */}
        <Section id="sobre-mi" index={1} title="Sobre mí">
          <div data-stagger className="space-y-6 text-lg leading-relaxed text-ink-2 sm:text-xl sm:leading-relaxed">
            {p.about.map((para, i) => (
              <p key={i} className={i === 0 ? "text-ink first-letter:float-left first-letter:mt-1.5 first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-accent" : ""}>
                {para}
              </p>
            ))}
          </div>

          <div className="mt-16">
            <h3 className="label-mono">qué me interesa</h3>
            <ul data-stagger className="mt-5 border-t border-line">
              {p.interests.map((it, i) => (
                <li
                  key={it.title}
                  className="group grid grid-cols-[3.5rem_1fr] items-baseline gap-x-4 border-b border-line py-5 hover:translate-x-1.5 sm:grid-cols-[4rem_14rem_1fr]"
                >
                  <span className="tabular font-serif text-3xl text-line-strong transition-colors duration-300 group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="font-serif text-xl">{it.title}</h4>
                  <p className="col-start-2 mt-1 text-sm leading-relaxed text-ink-2 sm:col-start-3 sm:mt-0">{it.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-16">
            <h3 className="label-mono">hacia dónde voy</h3>
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
        <Section id="formacion" index={2} title="Formación">
          <div className="spotlight relative overflow-hidden rounded-2xl border border-line bg-surface p-7 sm:p-9">
            <div aria-hidden className="grow-y absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent to-warm" />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="label-mono">{p.education.university}</p>
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
        <Section id="habilidades" index={3} title="Habilidades">
          <div className="flex items-baseline justify-between">
            <h3 className="label-mono">herramientas</h3>
            <span className="label-mono tabular">{String(p.tools.length).padStart(2, "0")}</span>
          </div>
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

          <h3 className="label-mono mt-14">competencias</h3>
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
        <Section id="proyectos" index={4} title="Proyectos">
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
          <Section id="contacto" index={5} title="Contacto" divider={false}>
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
              <p className="label-mono mb-5">o dejame un mensaje</p>
              <ContactForm />
            </div>
          </Section>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 pb-24 text-sm text-muted sm:pb-10">
            <p>
              © {year} <span className="font-serif text-ink italic">{p.name}</span>
              <span className="ml-3 hidden font-mono text-[11px] sm:inline">· hecho a mano en Buenos Aires</span>
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
      {publicChatEnabled() && settings.chatEnabled && <ChatWidget />}
    </>
  );
}
