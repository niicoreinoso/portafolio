import type { Metadata } from "next";
import { Geist, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { profile } from "@/content/profile";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans-body" });
const serif = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  variable: "--font-serif-display",
});
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: { default: `${profile.name} - Portafolio`, template: `%s | ${profile.name}` },
  description: `${profile.role}. ${profile.headline}`,
  openGraph: {
    title: `${profile.name} - Portafolio`,
    description: profile.headline,
    type: "website",
    locale: "es_AR",
  },
};

// Aplica el tema antes de pintar, para evitar un parpadeo al cargar.
// También restaura la pausa de efectos (data-motion="off").
// Prioridad: ?theme=light|dark en la URL (no se guarda) y después la elección guardada.
const themeScript = `try{var q=new URLSearchParams(location.search).get("theme");var t=q||localStorage.getItem("theme");if(t==="light")document.documentElement.dataset.theme="light";if(localStorage.getItem("motion")==="off")document.documentElement.dataset.motion="off"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans min-h-screen">{children}</body>
    </html>
  );
}
