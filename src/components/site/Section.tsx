import { sections } from "@/content/profile";

export default function Section({
  id,
  index,
  title,
  kicker,
  divider = true,
  children,
}: {
  id: string;
  index: number;
  title: string;
  kicker?: string;
  divider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`section py-20 sm:py-28 ${divider ? "border-t border-line" : ""}`}>
      <div className="reveal grid gap-8 md:grid-cols-[230px_1fr] md:gap-14">
        <div className="md:sticky md:top-28 md:self-start">
          <p className="flex items-center gap-3 font-mono text-xs tracking-wider">
            <span className="text-accent">{String(index).padStart(2, "0")}</span>
            <span className="text-muted">/ {String(sections.length).padStart(2, "0")}</span>
            <span className="section-bar h-px bg-accent/50" />
          </p>
          <h2 className="section-title mt-3 font-serif text-4xl leading-[1.1] font-normal sm:text-[2.6rem]">
            <span className="section-title-inner">{title}</span>
          </h2>
          {kicker && <p className="mt-3 text-sm leading-relaxed text-muted">{kicker}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
