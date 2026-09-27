import { NextResponse } from "next/server";
import { checkPassword, clearSessionCookie, setSessionCookie } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Configurá ADMIN_PASSWORD en .env.local" }, { status: 500 });
  }
  if (!rateLimit(`login:${await clientIp()}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Esperá unos minutos." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!checkPassword(String(body?.password ?? ""))) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }
  await setSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
