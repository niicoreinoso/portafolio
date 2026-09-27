import { NextResponse } from "next/server";
import { addEngagement, addSection, addVisit, type VisitEvent } from "@/lib/store";
import { sections } from "@/content/profile";
import { isAdmin } from "@/lib/auth";

const BOT = /bot|crawler|spider|crawling|preview|headless|lighthouse/i;
const validSections = new Set<string>(sections.map((s) => s.id));

function device(ua: string): VisitEvent["device"] {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function browser(ua: string) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Otro";
}

function refHost(ref: unknown, host: string | null) {
  if (typeof ref !== "string" || !ref) return "directo";
  try {
    const h = new URL(ref).hostname.replace(/^www\./, "");
    return h === host?.split(":")[0] ? "directo" : h;
  } catch {
    return "directo";
  }
}

const clean = (v: unknown, max = 40) =>
  typeof v === "string" ? v.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, max) || undefined : undefined;

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  // No contamos bots ni tus propias visitas como admin
  if (BOT.test(ua) || (await isAdmin())) return new NextResponse(null, { status: 204 });

  const body = await req.json().catch(() => null);
  const vid = typeof body?.vid === "string" ? body.vid.slice(0, 40) : "";
  if (!vid) return new NextResponse(null, { status: 204 });
  const t = Date.now();

  if (body.type === "pageview") {
    await addVisit({
      t,
      vid,
      path: typeof body.path === "string" ? body.path.slice(0, 200) : "/",
      ref: refHost(body.referrer, req.headers.get("host")),
      device: device(ua),
      browser: browser(ua),
      lang: req.headers.get("accept-language")?.slice(0, 2).toLowerCase() || undefined,
      country: clean(req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry"), 2)?.toUpperCase(),
      source: clean(body.source),
    });
  } else if (body.type === "section" && validSections.has(body.section)) {
    await addSection({ t, vid, section: body.section });
  } else if (body.type === "leave" && typeof body.ms === "number" && body.ms > 1000) {
    // Tope de 30 minutos para no distorsionar el promedio con pestañas olvidadas
    await addEngagement({ t, vid, ms: Math.min(Math.round(body.ms), 30 * 60_000) });
  }
  return new NextResponse(null, { status: 204 });
}
