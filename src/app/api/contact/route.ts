import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addMessage } from "@/lib/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  // Campo trampa para bots: si viene completo, fingimos éxito
  if (body?.website) return NextResponse.json({ ok: true });

  const name = String(body?.name ?? "").trim().slice(0, 100);
  const email = String(body?.email ?? "").trim().slice(0, 200);
  const message = String(body?.message ?? "").trim().slice(0, 4000);

  if (!name || !EMAIL.test(email) || message.length < 5) {
    return NextResponse.json({ error: "Revisá los datos: nombre, email válido y mensaje." }, { status: 400 });
  }
  if (!rateLimit(`contact:${await clientIp()}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados mensajes. Probá más tarde." }, { status: 429 });
  }

  await addMessage({ id: randomUUID(), t: Date.now(), name, email, message, read: false });
  return NextResponse.json({ ok: true });
}
