import "server-only";
import { promises as fs } from "fs";
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

const empty = (): DB => ({ visits: [], sections: [], engagements: [], messages: [], chats: [] });

let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

async function save(db: DB) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db));
  await fs.rename(tmp, DB_FILE);
}

/** Lecturas y escrituras pasan por una cola para no pisarse entre requests. */
function withDB<T>(fn: (db: DB) => T | Promise<T>, write = false): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    if (write) {
      db.visits = db.visits.slice(-MAX_EVENTS);
      db.sections = db.sections.slice(-MAX_EVENTS);
      db.engagements = db.engagements.slice(-MAX_EVENTS);
      db.chats = db.chats.slice(-5_000);
      await save(db);
    }
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const readDB = () => withDB((db) => db);

export const addVisit = (v: VisitEvent) => withDB((db) => void db.visits.push(v), true);
export const addSection = (s: SectionEvent) => withDB((db) => void db.sections.push(s), true);
export const addEngagement = (e: Engagement) => withDB((db) => void db.engagements.push(e), true);
export const addChat = (c: ChatLog) => withDB((db) => void db.chats.push(c), true);

export const addMessage = (m: ContactMessage) => withDB((db) => void db.messages.unshift(m), true);

export const updateMessage = (id: string, patch: Partial<Pick<ContactMessage, "read" | "starred">>) =>
  withDB((db) => {
    for (const m of db.messages) if (id === "*" || m.id === id) Object.assign(m, patch);
  }, true);

export const deleteMessage = (id: string) =>
  withDB((db) => {
    db.messages = db.messages.filter((x) => x.id !== id);
  }, true);

/** Borra estadísticas (visitas, secciones, tiempos y preguntas al chatbot). Los mensajes se conservan. */
export const resetStats = () =>
  withDB((db) => {
    db.visits = [];
    db.sections = [];
    db.engagements = [];
    db.chats = [];
  }, true);

export const getSettings = () => withDB((db) => ({ ...defaultSettings(), ...db.settings }) as Settings);

export const saveSettings = (s: Settings) =>
  withDB((db) => {
    db.settings = s;
  }, true);
