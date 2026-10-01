import "server-only";

export type ChatTurn = { role: "user" | "model"; text: string };

/** Filtra y recorta el historial que manda el navegador: solo roles válidos, con tope de turnos y de largo. */
export function sanitizeTurns(input: unknown, maxTurns: number, maxChars: number): ChatTurn[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((m): m is ChatTurn => (m?.role === "user" || m?.role === "model") && typeof m.text === "string")
    .slice(-maxTurns)
    .map((m) => ({ role: m.role, text: m.text.slice(0, maxChars) }));
}

export const geminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

export const publicChatEnabled = () =>
  geminiConfigured() && process.env.PUBLIC_CHAT_ENABLED !== "false";

/** Llama a la API REST de Gemini y devuelve el texto de la respuesta. */
export async function generate({
  system,
  turns,
  temperature = 0.7,
  maxOutputTokens = 1500,
}: {
  system: string;
  turns: ChatTurn[];
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Falta GEMINI_API_KEY en .env.local");
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        generationConfig: { temperature, maxOutputTokens },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini respondió ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim() ?? "";
  return text || "No obtuve respuesta del modelo. Probá reformular la consulta.";
}
