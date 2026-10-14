"use client";

import { useEffect, useState } from "react";

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function ago(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const hours = Math.round(diff / 36e5);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(diff / 864e5);
  if (Math.abs(days) < 31) return rtf.format(days, "day");
  return rtf.format(Math.round(days / 30), "month");
}

/** "hace 3 horas", calculado en el navegador para que no quede viejo por la caché de la página. */
export default function RelativeTime({ iso }: { iso: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => setText(ago(iso)), [iso]);
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text ?? new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
    </time>
  );
}
