import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readDB, resetStats } from "@/lib/store";
import { readJson } from "@/lib/http";

/** Descarga una copia completa de los datos (backup). */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = await readDB();
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(db, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="portafolio-backup-${date}.json"`,
    },
  });
}

/** Borra las estadísticas. Los mensajes y la configuración se conservan. */
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await readJson(req, 1024);
  if (body?.confirm !== "BORRAR") return NextResponse.json({ error: "Falta confirmación" }, { status: 400 });
  await resetStats();
  return NextResponse.json({ ok: true });
}
