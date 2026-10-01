import "server-only";
import { promises as fs, renameSync, writeFileSync } from "fs";
import path from "path";
import { profile } from "@/content/profile";

// Almacenamiento simple en un archivo JSON (data/db.json).
// Funciona en cualquier servidor Node con disco persistente (VPS, Railway, Render, local).
// En hosting serverless (Vercel) el disco no persiste: ahí reemplazá estas funciones
// por una base de datos (Upstash Redis, Supabase, etc.) manteniendo la misma interfaz.

export type VisitEvent = {
  t: number; // timestamp ms
  vid: string; // id anónimo de visitante
  path: string;
  ref: string; // dominio de referencia o "directo"
  device: "desktop" | "mobile" | "tablet";
  browser?: string;
  lang?: string;
  country?: string; // solo si el hosting lo informa (Vercel, Cloudflare)
  source?: string; // ?ref= o ?utm_source= del link compartido
};

export type SectionEvent = { t: number; vid: string; section: string };

/** Tiempo que un visitante tuvo la página visible. */
export type Engagement = { t: number; vid: string; ms: number };

export type ContactMessage = {
  id: string;
  t: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  starred?: boolean;
};

export type ChatLog = { t: number; question: string; answer?: string };

/** Ajustes del sitio editables desde el panel (pisan los valores de profile.ts). */
export type Settings = {
  available: boolean;
  availableText: string;
  now: { studying: string; learning: string; seeking: string };
  chatEnabled: boolean;
};

export const defaultSettings = (): Settings => ({
  available: true,
  availableText: "disponible para pasantías y oportunidades",
  now: { ...profile.now },
  chatEnabled: true,
});

type DB = {
  visits: VisitEvent[];
  sections: SectionEvent[];
  engagements: Engagement[];
  messages: ContactMessage[];
  chats: ChatLog[];
  settings?: Partial<Settings>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const MAX_EVENTS = 50_000;
const MAX_CHATS = 5_000;
const FLUSH_DELAY_MS = 2_000;

const empty = (): DB => ({ visits: [], sections: [], engagements: [], messages: [], chats: [] });

// El estado vive en globalThis para sobrevivir a la recarga de módulos en desarrollo.
type State = { db: DB | null; dirty: boolean; timer: NodeJS.Timeout | null; queue: Promise<unknown>; exitHook: boolean };
const g = globalThis as typeof globalThis & { __portafolioStore?: State };
const state: State = (g.__portafolioStore ??= { db: null, dirty: false, timer: null, queue: Promise.resolve(), exitHook: false });

const isErrno = (e: unknown, code: string) => (e as NodeJS.ErrnoException)?.code === code;

/** Carga el archivo una sola vez y lo deja en memoria. */
async function load(): Promise<DB> {
  if (state.db) return state.db;
  let raw: string;
  try {
    raw = await fs.readFile(DB_FILE, "utf8");
  } catch (e) {
    // Solo "no existe" significa base vacía. Cualquier otro error (archivo bloqueado por
    // OneDrive, permisos) debe fallar: tratarlo como vacío y guardar borraría los datos.
    if (isErrno(e, "ENOENT")) return (state.db = empty());
    throw e;
  }
  try {
    state.db = { ...empty(), ...JSON.parse(raw) };
  } catch {
    // Archivo corrupto: se conserva una copia para recuperarlo y se arranca de cero
    const backup = path.join(DATA_DIR, `db.corrupt-${Date.now()}.json`);
    await fs.rename(DB_FILE, backup).catch(() => undefined);
    console.error(`[store] db.json ilegible; copia guardada en ${backup}`);
    state.db = empty();
  }
  return state.db!;
}

const tmpFile = () => `${DB_FILE}.${process.pid}.tmp`;

/** Escritura atómica (archivo temporal + rename), con reintentos por bloqueos pasajeros en Windows. */
async function flush() {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
  if (!state.dirty || !state.db) return;
  state.dirty = false;
  const json = JSON.stringify(state.db);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    for (let attempt = 0; ; attempt++) {
      try {
        await fs.writeFile(tmpFile(), json);
        await fs.rename(tmpFile(), DB_FILE);
        return;
      } catch (e) {
        if (attempt >= 3 || !(isErrno(e, "EPERM") || isErrno(e, "EBUSY") || isErrno(e, "EACCES"))) throw e;
        await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
      }
    }
  } catch (e) {
    state.dirty = true; // se reintenta con la próxima escritura
    throw e;
  }
}

/** Al cerrar el proceso se guarda lo pendiente (las visitas se agrupan unos segundos antes de escribirse). */
function ensureExitHook() {
  if (state.exitHook) return;
  state.exitHook = true;
  process.once("exit", () => {
    if (!state.dirty || !state.db) return;
    try {
      writeFileSync(tmpFile(), JSON.stringify(state.db));
      renameSync(tmpFile(), DB_FILE);
    } catch {}
  });
}

type Mode = "read" | "batched" | "durable";

/**
 * Todo pasa por una cola para no pisarse entre requests.
 * - batched: eventos de analítica; se escriben juntos cada pocos segundos.
 * - durable: datos que no se pueden perder (mensajes, ajustes); se escriben antes de responder.
 */
function withDB<T>(fn: (db: DB) => T | Promise<T>, mode: Mode = "read"): Promise<T> {
  const run = state.queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    if (mode !== "read") {
      db.visits = db.visits.slice(-MAX_EVENTS);
      db.sections = db.sections.slice(-MAX_EVENTS);
      db.engagements = db.engagements.slice(-MAX_EVENTS);
      db.chats = db.chats.slice(-MAX_CHATS);
      state.dirty = true;
      if (mode === "durable") await flush();
      else if (!state.timer) {
        ensureExitHook();
        state.timer = setTimeout(() => void flush().catch((e) => console.error("[store] no se pudo guardar", e)), FLUSH_DELAY_MS);
        state.timer.unref();
      }
    }
    return result;
  });
  state.queue = run.catch(() => undefined);
  return run;
}

/** Copia de los datos: quien la reciba puede ordenarla o modificarla sin afectar la base en memoria. */
export const readDB = () => withDB((db) => structuredClone(db));

export const addVisit = (v: VisitEvent) => withDB((db) => void db.visits.push(v), "batched");
export const addSection = (s: SectionEvent) => withDB((db) => void db.sections.push(s), "batched");
export const addEngagement = (e: Engagement) => withDB((db) => void db.engagements.push(e), "batched");
export const addChat = (c: ChatLog) => withDB((db) => void db.chats.push(c), "batched");

export const addMessage = (m: ContactMessage) => withDB((db) => void db.messages.unshift(m), "durable");

export const updateMessage = (id: string, patch: Partial<Pick<ContactMessage, "read" | "starred">>) =>
  withDB((db) => {
    for (const m of db.messages) if (id === "*" || m.id === id) Object.assign(m, patch);
  }, "durable");

export const deleteMessage = (id: string) =>
  withDB((db) => {
    db.messages = db.messages.filter((x) => x.id !== id);
  }, "durable");

/** Borra estadísticas (visitas, secciones, tiempos y preguntas al chatbot). Los mensajes se conservan. */
export const resetStats = () =>
  withDB((db) => {
    db.visits = [];
    db.sections = [];
    db.engagements = [];
    db.chats = [];
  }, "durable");

export const getSettings = () => withDB((db) => ({ ...defaultSettings(), ...db.settings }) as Settings);

export const saveSettings = (s: Settings) =>
  withDB((db) => {
    db.settings = s;
  }, "durable");
