import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { getSettings, saveSettings, type Settings } from "@/lib/store";
import { readJson } from "@/lib/http";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const b = await readJson(req, 4 * 1024);
  const current = await getSettings();

  const next: Settings = {
    available: typeof b?.available === "boolean" ? b.available : current.available,
    availableText: str(b?.availableText, 80) || current.availableText,
    now: {
      studying: str(b?.now?.studying, 80) || current.now.studying,
      learning: str(b?.now?.learning, 80) || current.now.learning,
      seeking: str(b?.now?.seeking, 80) || current.now.seeking,
    },
    chatEnabled: typeof b?.chatEnabled === "boolean" ? b.chatEnabled : current.chatEnabled,
  };

  await saveSettings(next);
  // Regenera la página pública para que el cambio se vea enseguida
  revalidatePath("/");
  return NextResponse.json({ ok: true, settings: next });
}
