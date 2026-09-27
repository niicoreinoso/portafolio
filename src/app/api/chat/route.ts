import { NextResponse } from "next/server";
import { generate, publicChatEnabled, type ChatTurn } from "@/lib/gemini";
import { profile, profileAsText } from "@/content/profile";
import { getShowcaseRepos } from "@/lib/github";
import { addChat, getSettings } from "@/lib/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Chatbot público: responde preguntas de visitantes sobre Nicolás.
export async function POST(req: Request) {
  if (!publicChatEnabled() || !(await getSettings()).chatEnabled) return NextResponse.json({ error: "Chat no disponible." }, { status: 503 });
  if (!rateLimit(`chat:${await clientIp()}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Alcanzaste el límite de preguntas por ahora. Probá más tarde." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const turns: ChatTurn[] = Array.isArray(body?.messages)
    ? body.messages
        .filter((m: ChatTurn) => (m.role === "user" || m.role === "model") && typeof m.text === "string")
        .slice(-8)
        .map((m: ChatTurn) => ({ role: m.role, text: m.text.slice(0, 1000) }))
    : [];
  if (!turns.length || turns.at(-1)!.role !== "user") {
    return NextResponse.json({ error: "Mensaje inválido." }, { status: 400 });
  }

  const repos = await getShowcaseRepos(8);
  const system = `Sos el asistente virtual del portafolio de ${profile.name}. Respondés en español rioplatense, de forma breve (máximo 4 oraciones), cordial y profesional, en tercera persona sobre ${profile.shortName}.
Usá SOLO la información de abajo. Si te preguntan algo que no está, decí que no tenés ese dato y sugerí escribirle a ${profile.email}. No inventes experiencia, notas ni datos personales. Si la pregunta no tiene que ver con ${profile.shortName} o su perfil profesional, redirigí amablemente la conversación.

${profileAsText()}
Proyectos en GitHub: ${repos?.map((r) => `${r.name} (${r.language ?? "s/lenguaje"}): ${r.description ?? "sin descripción"}`).join("; ") || "no disponibles"}`;

  try {
    const reply = await generate({ system, turns, temperature: 0.4, maxOutputTokens: 400 });
    await addChat({ t: Date.now(), question: turns.at(-1)!.text.slice(0, 300), answer: reply.slice(0, 1500) });
    return NextResponse.json({ reply });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No pude responder ahora. Probá de nuevo en un rato." }, { status: 502 });
  }
}
