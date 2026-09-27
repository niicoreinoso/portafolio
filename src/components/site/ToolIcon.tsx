import { siCss, siGit, siGithub, siHtml5, siJavascript, siNextdotjs, siPython, siReact, siTypescript } from "simple-icons";

// Logos de marca (Simple Icons, CC0). Excel, Power BI y SQL no están en la librería
// por temas de marca registrada, así que llevan un dibujo propio.
const brands = {
  python: siPython,
  javascript: siJavascript,
  typescript: siTypescript,
  react: siReact,
  nextjs: siNextdotjs,
  html: siHtml5,
  css: siCss,
  git: siGit,
  github: siGithub,
} as const;

const custom: Record<string, { hex: string; svg: React.ReactNode }> = {
  sql: {
    hex: "",
    svg: (
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
        <path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" />
      </g>
    ),
  },
  excel: {
    hex: "217346",
    svg: (
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
        <path d="M3.5 9.2h17M3.5 14.8h17M9.2 9.2v11.3" />
      </g>
    ),
  },
  powerbi: {
    hex: "F2C811",
    svg: (
      <g fill="currentColor">
        <rect x="4" y="12" width="3.6" height="8.5" rx="1" />
        <rect x="10.2" y="7.5" width="3.6" height="13" rx="1" />
        <rect x="16.4" y="3.5" width="3.6" height="17" rx="1" />
      </g>
    ),
  },
};

/** Color de marca para el hover; si es casi negro o casi blanco se usa el color del texto. */
function brandColor(hex: string) {
  if (!hex) return undefined;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum < 0.12 || lum > 0.92 ? "var(--ink)" : `#${hex}`;
}

export function toolBrand(key: string) {
  const b = brands[key as keyof typeof brands];
  return brandColor(b ? b.hex : custom[key]?.hex ?? "");
}

export default function ToolIcon({ name, size = 22 }: { name: string; size?: number }) {
  const b = brands[name as keyof typeof brands];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="tool-logo transition-colors duration-300">
      {b ? <path d={b.path} fill="currentColor" /> : custom[name]?.svg}
    </svg>
  );
}

/** Íconos de línea para las áreas de competencias. */
export function AreaIcon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    // Proceso: nodos conectados, como un diagrama BPMN mínimo
    process: (
      <>
        <rect x="2.5" y="4" width="6" height="5" rx="1.2" />
        <rect x="15.5" y="15" width="6" height="5" rx="1.2" />
        <path d="M8.5 6.5h4.5a2 2 0 0 1 2 2v1.5M12 13.5l3 3-3 3" />
        <path d="m15 10 2.5 2.5L15 15l-2.5-2.5z" />
      </>
    ),
    data: (
      <>
        <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
        <path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
        <path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.8c1.9.6 3 2.4 3 5.2" />
      </>
    ),
    build: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[name] ?? paths.build}
    </svg>
  );
}
