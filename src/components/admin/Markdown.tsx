// Renderizador de Markdown mínimo para las respuestas de Gemini (sin dependencias).

function inline(text: string, keyBase: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    const k = `${keyBase}-${i}`;
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={k} className="font-medium text-ink">{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={k} className="rounded bg-bg px-1 py-0.5 text-[0.9em]">{p.slice(1, -1)}</code>;
    return p;
  });
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const out: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let code: string[] | null = null;

  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    out.push(
      <Tag key={`l${out.length}`} className={`my-2 space-y-1 pl-5 ${list.ordered ? "list-decimal" : "list-disc"} marker:text-muted`}>
        {list.items.map((it, i) => <li key={i}>{inline(it, `li${out.length}-${i}`)}</li>)}
      </Tag>,
    );
    list = null;
  };

  lines.forEach((raw, idx) => {
    if (raw.trim().startsWith("```")) {
      if (code) {
        out.push(<pre key={`c${idx}`} className="my-3 overflow-x-auto rounded-lg bg-bg p-3 text-xs leading-relaxed">{code.join("\n")}</pre>);
        code = null;
      } else {
        flushList();
        code = [];
      }
      return;
    }
    if (code) return void code.push(raw);

    const line = raw.trimEnd();
    const ul = line.match(/^\s*[-*•]\s+(.*)/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (ul || ol) {
      const ordered = Boolean(ol);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push((ul ?? ol)![1]);
      return;
    }
    flushList();
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) {
      out.push(<p key={idx} className="mt-4 mb-1 font-medium text-ink first:mt-0">{inline(h[2], `h${idx}`)}</p>);
    } else if (line.trim()) {
      out.push(<p key={idx} className="my-2 first:mt-0">{inline(line, `p${idx}`)}</p>);
    }
  });
  flushList();
  if (code) out.push(<pre key="c-end" className="my-3 overflow-x-auto rounded-lg bg-bg p-3 text-xs">{(code as string[]).join("\n")}</pre>);

  return <div className="text-sm leading-relaxed text-ink-2">{out}</div>;
}
