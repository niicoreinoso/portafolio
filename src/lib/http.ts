import "server-only";

/**
 * Lee el cuerpo JSON de un pedido con un tope de tamaño.
 * Devuelve null si falta, no es un objeto JSON válido o supera `maxBytes`.
 * El resultado viene sin validar: cada ruta debe comprobar los tipos que usa.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readJson(req: Request, maxBytes = 16 * 1024): Promise<Record<string, any> | null> {
  if (Number(req.headers.get("content-length")) > maxBytes) return null;
  try {
    const text = await req.text();
    if (Buffer.byteLength(text) > maxBytes) return null;
    const data: unknown = JSON.parse(text);
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
