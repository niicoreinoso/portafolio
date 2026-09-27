// Piezas de interfaz compartidas por las vistas del panel.

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="-mt-2 mb-4 text-xs leading-relaxed text-muted">{children}</p>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm leading-relaxed text-muted">{children}</p>;
}

export function Button({
  variant = "ghost",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-ink text-bg hover:bg-accent hover:text-accent-ink",
    ghost: "border border-line text-ink-2 hover:border-line-strong hover:text-ink",
    danger: "border border-bad/40 text-bad hover:bg-bad hover:text-bg",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${styles} ${className}`}
    />
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${checked ? "border-accent bg-accent" : "border-line-strong bg-bg"}`}
    >
      <span className={`absolute top-0.5 left-0.5 size-[18px] rounded-full transition-transform duration-300 ${checked ? "translate-x-5 bg-accent-ink" : "bg-muted"}`} />
    </button>
  );
}

export const inputCls =
  "w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent";
