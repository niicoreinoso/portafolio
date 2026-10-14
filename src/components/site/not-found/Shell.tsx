import Link from "next/link";
import { profile } from "@/content/profile";
import { ArrowRight } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";
import MotionToggle from "@/components/MotionToggle";

/**
 * Marco de la página 404: barra mínima (sin menú de secciones, que no existen
 * fuera del inicio), el contenido centrado y un pie discreto. `bg` dibuja el fondo.
 */
export default function NotFoundShell({ bg, children }: { bg?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      {bg}
      <header className="relative z-10">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group font-serif text-lg">
            {profile.name}
            <span className="inline-block text-accent transition-transform duration-300 group-hover:scale-150">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <MotionToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-10 sm:px-8">{children}</main>

      <footer className="relative z-10 mx-auto w-full max-w-5xl px-5 py-6 text-sm text-muted sm:px-8">
        © {new Date().getFullYear()} <span className="font-serif text-ink italic">{profile.name}</span>
      </footer>
    </div>
  );
}

/** Los dos botones de salida, con el mismo trato que los del inicio. */
export function Actions({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <Link
        href="/"
        className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-accent-ink"
      >
        Volver al inicio <ArrowRight width={14} height={14} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
      <Link
        href="/#proyectos"
        className="rounded-full border border-line-strong px-6 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-ink"
      >
        Ver proyectos
      </Link>
    </div>
  );
}
