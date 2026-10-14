// Dibujos a mano de "Qué me interesa". Cada parte animable lleva una clase
// (.bar, .link, .arrow...) que globals.css mueve cuando la tarjeta tiene .play.

const glyphs = {
  paper: (
    <>
      <path d="M4 6 q0 18 1 36 l20 0 q-1 -18 0 -36z" />
      <path d="M9 14 h11 M9 20 h11 M9 26 h8" />
      <g className="arrow">
        <path className="e" d="M30 24 C36 23, 40 25, 46 24" />
        <path className="e" d="M42 20 l5 4 -5 4" />
      </g>
      <path className="screen" d="M50 8 q11 -1 22 0 q1 12 0 24 q-11 1 -22 0 q-1 -12 0 -24z" />
      <path d="M56 40 h10 M61 32 v8" />
    </>
  ),
  bars: (
    <>
      <path d="M4 44 h68" />
      {["M10 44 v-12", "M22 44 v-20", "M34 44 v-15", "M46 44 v-28", "M58 44 v-34"].map((d, i) => (
        <path key={d} className="bar" style={{ "--b": i } as React.CSSProperties} d={d} />
      ))}
      <path className="e trend" pathLength={1} d="M8 30 C20 26, 26 30, 34 22 S50 12, 66 6" />
      <circle className="e" cx="66" cy="6" r="2.5" />
    </>
  ),
  nodes: (
    <>
      {["M15 14 L31 21", "M15 34 L31 27", "M45 21 L61 12", "M45 27 L61 36"].map((d, i) => (
        <path key={d} className="link" pathLength={1} style={{ "--b": i } as React.CSSProperties} d={d} />
      ))}
      <circle cx="10" cy="12" r="5" />
      <circle cx="10" cy="36" r="5" />
      <circle className="e hub" cx="38" cy="24" r="7" />
      <circle cx="66" cy="10" r="5" />
      <circle cx="66" cy="38" r="5" />
    </>
  ),
  cursor: (
    <>
      <path className="btnfill" d="M6 12 q30 -2 52 0 q2 9 0 18 q-26 2 -52 0 q-2 -9 0 -18z" />
      <path d="M16 21 h26" />
      <path className="e cursor" d="M50 22 l14 22 3 -9 9 -1z" />
    </>
  ),
};

export type GlyphName = keyof typeof glyphs;

export default function Glyph({ name }: { name: string }) {
  const content = glyphs[name as GlyphName];
  if (!content) return null;
  return (
    <svg className="draw glyph" width="76" height="48" viewBox="0 0 76 48" aria-hidden>
      {content}
    </svg>
  );
}
