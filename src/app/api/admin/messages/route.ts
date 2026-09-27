import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteMessage, updateMessage } from "@/lib/store";

// PATCH { id, read?, starred? }  — id "*" aplica a todos (ej: marcar todo como leído)
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (typeof body?.id !== "string") return NextResponse.json({ error: "Falta id" }, { status: 400 });
  const patch: { read?: boolean; starred?: boolean } = {};
  if (typeof body.read === "boolean") patch.read = body.read;
  if (typeof body.starred === "boolean") patch.starred = body.starred;
  await updateMessage(body.id, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (typeof body?.id !== "string" || body.id === "*") return NextResponse.json({ error: "Falta id" }, { status: 400 });
  await deleteMessage(body.id);
  return NextResponse.json({ ok: true });
}
