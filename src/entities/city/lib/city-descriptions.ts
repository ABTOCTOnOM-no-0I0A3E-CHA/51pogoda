import "server-only";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_DESCRIPTIONS } from "./default-descriptions";

/*
  Авторские описания точек для SEO-блока на странице города. Хранятся в
  data/city-descriptions.json, редактируются из админки. Если файла нет —
  seed из default-descriptions.ts, после чего файл имеет приоритет.
*/

const DATA_DIR = join(process.cwd(), "data");
const DESCRIPTIONS_FILE = join(DATA_DIR, "city-descriptions.json");

export interface CityDescription {
  slug: string;
  description: string;
  updatedAt: string;
}

type DescriptionsMap = Record<string, CityDescription>;

/* mtime-инвалидация: route handler и серверный рендер — разные инстансы модуля. */
let cache: DescriptionsMap | null = null;
let cachedMtime = -1;

function fileMtime(): number {
  try {
    return existsSync(DESCRIPTIONS_FILE) ? statSync(DESCRIPTIONS_FILE).mtimeMs : 0;
  } catch (e) {
    console.warn(`[city-descriptions] fileMtime: ${(e as Error).message}`);
    return 0;
  }
}

function load(): DescriptionsMap {
  const mtime = fileMtime();
  if (cache && mtime === cachedMtime) return cache;
  cachedMtime = mtime;

  let data: DescriptionsMap = {};
  try {
    if (mtime !== 0) {
      const parsed = JSON.parse(readFileSync(DESCRIPTIONS_FILE, "utf-8")) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const out: DescriptionsMap = {};
        for (const [slug, entry] of Object.entries(parsed as Record<string, unknown>)) {
          if (entry && typeof entry === "object") {
            const e = entry as Partial<CityDescription>;
            if (typeof e.description === "string" && e.description.trim()) {
              out[slug] = {
                slug,
                description: e.description,
                updatedAt: typeof e.updatedAt === "string" ? e.updatedAt : new Date().toISOString(),
              };
            }
          }
        }
        data = out;
      }
    } else {
      /* Файла нет — seed дефолтных описаний и запись на диск */
      const seeded: DescriptionsMap = {};
      for (const d of DEFAULT_DESCRIPTIONS) {
        seeded[d.slug] = d;
      }
      data = seeded;
      persist(data);
    }
  } catch (e) {
    console.warn(`[city-descriptions] load: ${(e as Error).message} — деградация на пустой список`);
  }
  cache = data;
  return cache;
}

function persist(data: DescriptionsMap): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DESCRIPTIONS_FILE, JSON.stringify(data, null, 2), "utf-8");
  cache = data;
  cachedMtime = fileMtime();
}

export function getAllDescriptions(): DescriptionsMap {
  return load();
}

export function getDescription(slug: string): CityDescription | null {
  return load()[slug] ?? null;
}

export type DescriptionResult = { ok: true; description: CityDescription } | { ok: false; error: string };

export function setDescription(slug: string, description: string): DescriptionResult {
  const s = slug.trim();
  if (!s) return { ok: false, error: "slug пуст" };
  const text = description.trim();
  if (!text) return { ok: false, error: "описание пусто" };

  const data = load();
  const entry: CityDescription = { slug: s, description: text, updatedAt: new Date().toISOString() };
  persist({ ...data, [s]: entry });
  return { ok: true, description: entry };
}

export function deleteDescription(slug: string): DescriptionResult {
  const s = slug.trim();
  if (!s) return { ok: false, error: "slug пуст" };

  const data = load();
  if (!data[s]) return { ok: false, error: `описание для "${s}" не найдено` };
  const next = { ...data };
  delete next[s];
  persist(next);
  return { ok: true, description: { slug: s, description: "", updatedAt: new Date().toISOString() } };
}
