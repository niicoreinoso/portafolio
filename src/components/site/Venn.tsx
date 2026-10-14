// Las tres áreas de la carrera. Los círculos llegan separados y se juntan
// cuando el bloque .reveal que los contiene entra en pantalla (ver globals.css).
export default function Venn() {
  return (
    <svg className="draw venn w-full max-w-[420px]" viewBox="0 0 420 380" role="img" aria-label="Tecnología, datos y administración se cruzan en Sistemas de Información">
      <g className="c c1">
        <path d="M210 30 C290 28, 320 100, 302 150 C284 204, 136 206, 118 150 C100 96, 130 32, 210 30z" />
        <text x="210" y="82" textAnchor="middle" fontSize="17" fontWeight="600">Tecnología</text>
      </g>
      <g className="c c2">
        <path d="M140 140 C210 136, 246 196, 228 254 C210 312, 84 320, 60 262 C36 204, 76 144, 140 140z" />
        <text x="104" y="262" textAnchor="middle" fontSize="17" fontWeight="600">Datos</text>
      </g>
      <g className="c c3">
        <path d="M280 140 C344 144, 384 204, 360 262 C336 320, 210 312, 192 254 C174 196, 210 136, 280 140z" />
        <text x="318" y="262" textAnchor="middle" fontSize="17" fontWeight="600">Administración</text>
      </g>
      <circle className="e me" cx="210" cy="196" r="6" style={{ fill: "var(--accent)" }} />
      <path className="e arrow" pathLength={1} d="M210 206 C206 250, 214 300, 210 330 M204 322 l6 9 6 -9" />
      <text className="e me" x="210" y="362" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13">
        acá estoy yo
      </text>
    </svg>
  );
}
