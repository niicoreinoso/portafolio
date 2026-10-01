import "server-only";
import { headers } from "next/headers";

type Bucket = { hits: number[]; until: number };

const MAX_KEYS = 10_000;
const SWEEP_EVERY_MS = 60_000;
const buckets = new Map<string, Bucket>();
let lastSweep = 0;

/**
 * IP del visitante según el proxy. Detrás de Vercel/Cloudflare estas cabeceras las
 * pone la plataforma; si se publica sin proxy, un cliente podría falsearlas.
 */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

/** Libera las claves vencidas para que el mapa no crezca sin límite. */
function sweep(now: number) {
  if (now - lastSweep < SWEEP_EVERY_MS && buckets.size < MAX_KEYS) return;
  lastSweep = now;
  for (const [key, b] of buckets) if (b.until <= now) buckets.delete(key);
  // Defensa extra: si aun así hay demasiadas claves, se descartan las más viejas
  for (const key of buckets.keys()) {
    if (buckets.size <= MAX_KEYS) break;
    buckets.delete(key);
  }
}

/** Límite en memoria: `limit` pedidos por `windowMs` por clave. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  sweep(now);
  const hits = (buckets.get(key)?.hits ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, { hits, until: now + windowMs });
    return false;
  }
  hits.push(now);
  buckets.set(key, { hits, until: now + windowMs });
  return true;
}
