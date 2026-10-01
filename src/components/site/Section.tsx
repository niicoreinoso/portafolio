export default function Section({
  id,
  title,
  kicker,
  divider = true,
  children,
}: {
  id: string;
  title: string;
  kicker?: string;
  divider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`section py-20 sm:py-28 ${divider ? "border-t border-line" : ""}`}>
      <div className="reveal grid gap-8 md:grid-cols-[230px_1fr] md:gap-14">
        <div className="md:sticky md:top-28 md:self-start">
          <span className="section-bar block h-px bg-accent/50" />
          <h2 className="section-title mt-4 font-serif text-4xl leading-[1.1] font-normal sm:text-[2.6rem]">
            <span className="section-title-inner">{title}</span>
          </h2>
          {kicker && <p className="mt-3 text-sm leading-relaxed text-muted">{kicker}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
