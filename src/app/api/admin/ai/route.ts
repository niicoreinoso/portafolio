import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { generate, geminiConfigured, sanitizeTurns } from "@/lib/gemini";
import { readJson } from "@/lib/http";
import { profile, profileAsText } from "@/content/profile";
import { getRepos } from "@/lib/github";
import { getStats, statsAsText } from "@/lib/analytics";
import { readDB } from "@/lib/store";

// Acciones rápidas del asistente: cada una es un prompt prearmado.
const ACTIONS: Record<string, string> = {
  review:
    "Hacé una auditoría de mi portafolio. Analizá el contenido del perfil, los proyectos y las métricas. Dame: 1) tres fortalezas, 2) las cinco mejoras más importantes ordenadas por impacto, cada una con una acción concreta. Sé directo.",
  metrics:
    "Interpretá mis métricas de tráfico de los últimos 30 días. Explicá qué significan, qué secciones funcionan y cuáles no, y proponé tres experimentos concretos para aumentar visitas y contactos.",
  projects:
    "Sugerime cuatro ideas de proyectos para sumar a mi GitHub que fortalezcan mi perfil según mi carrera y mis objetivos. Para cada uno: nombre, descripción en una línea, tecnologías y qué habilidad demuestra ante un reclutador.",
  linkedin:
    "Escribime tres versiones del 'Acerca de' para LinkedIn (una corta, una media y una más narrativa) y cinco titulares posibles, basados en mi perfil.",
  readme:
    "Elegí el proyecto de GitHub que más potencial tiene y escribime un README profesional en Markdown para él: descripción, funcionalidades, tecnologías, cómo correrlo y próximos pasos. Si falta información, dejá marcadores [COMPLETAR].",
  report:
    "Armame un reporte semanal breve del sitio: qué pasó con las visitas, de dónde vinieron, qué secciones funcionaron, qué preguntaron en el chatbot y una sola prioridad para la semana que viene.",
  chatbot:
    "Revisá las preguntas que los visitantes le hicieron al chatbot y las respuestas que dio. Decime: qué quieren saber de mí, qué información le falta a mi portafolio para responder mejor, y qué agregaría o cambiaría en el contenido.",
  post:
    "Escribime un post para LinkedIn (máximo 1200 caracteres) anunciando mi portafolio, con tono profesional y cercano, sin exagerar, con un llamado a la acción y 3 a 5 hashtags relevantes. Dame dos variantes.",
  interview:
    "Armame una guía de preparación para entrevistas de pasantía/junior acorde a mi perfil: 8 preguntas probables (técnicas y de comportamiento) con una respuesta modelo breve basada en mi experiencia real, y 3 preguntas que yo debería hacer al entrevistador.",
};

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!geminiConfigured()) {
    return NextResponse.json({ error: "Configurá GEMINI_API_KEY en .env.local para usar el asistente." }, { status: 503 });
  }

  const body = await readJson(req, 64 * 1024);
  let turns = sanitizeTurns(body?.messages, 16, 4000);

  if (typeof body?.action === "string") {
    if (body.action === "reply" && typeof body.messageId === "string") {
      const msg = (await readDB()).messages.find((m) => m.id === body.messageId);
      if (!msg) return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
      turns = [
        {
          role: "user",
          text: `Redactá una respuesta por email, cordial y profesional, a este mensaje que recibí en mi portafolio. Incluí un asunto sugerido.\n\nDe: ${msg.name} <${msg.email}>\nMensaje: ${msg.message}`,
        },
      ];
    } else if (ACTIONS[body.action]) {
      turns = [{ role: "user", text: ACTIONS[body.action] }];
    }
  }
  if (!turns.length || turns.at(-1)!.role !== "user") {
    return NextResponse.json({ error: "Mensaje inválido." }, { status: 400 });
  }

  const [stats, repos] = await Promise.all([getStats(30), getRepos()]);
  const system = `Sos el asistente personal de ${profile.name} para gestionar y hacer crecer su portafolio profesional y su carrera. Le hablás directamente a él, en español rioplatense, con tono claro, práctico y honesto. Usá listas con guiones y títulos cortos cuando ayude. No inventes datos: si algo falta, decilo y sugerí cómo conseguirlo.

== PERFIL ==
${profileAsText()}

== PROYECTOS EN GITHUB ==
${repos?.length ? repos.map((r) => `- ${r.name}${r.fork ? " (fork)" : ""} [${r.language ?? "s/lenguaje"}, ★${r.stars}, actualizado ${r.updatedAt.slice(0, 10)}]: ${r.description ?? "sin descripción"}${r.topics.length ? ` — topics: ${r.topics.join(", ")}` : ""}`).join("\n") : "No se pudieron obtener los repositorios."}

== MÉTRICAS DEL SITIO ==
${statsAsText(stats)}
${
  body?.action === "chatbot"
    ? `\n== CONVERSACIONES DEL CHATBOT ==\n${stats.chats.slice(0, 30).map((c) => `P: ${c.question}\nR: ${c.answer ?? "(sin registro)"}`).join("\n\n") || "Todavía no hay conversaciones."}`
    : ""
}`;

  try {
    const reply = await generate({ system, turns, maxOutputTokens: 2500 });
    return NextResponse.json({ reply, prompt: turns.at(-1)!.text });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error con Gemini" }, { status: 502 });
  }
}
