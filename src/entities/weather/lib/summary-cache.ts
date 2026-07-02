import "server-only";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { WeatherSummary } from "./summary";

/*
  Файловый кэш ИИ-сводок с привязкой к дате. Ключ: <slug>:YYYY-MM-DD.
  Позволяет:
  - хранить сводку весь день (не сбрасывается при редеплое/перезапуске)
  - предгенерацию для городов по крону в 8:00
  - генерацию для остальных точек по первому запросу
  - отладку (можно открыть файл и посмотреть, что сгенерировалось)
*/

const CACHE_FILE = join(process.cwd(), "data", "ai-summary-cache.json");

type CacheStore = Record<string, WeatherSummary>;
let cache: CacheStore | null = null;

function load(): CacheStore {
  if (cache) return cache;
  try {
    if (existsSync(CACHE_FILE)) {
      cache = JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
    }
  } catch {
    /* битый файл — стартуем с пустого */
  }
  cache ??= {};
  return cache;
}

function persist(): void {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(cache ?? {}), "utf-8");
}

export function cacheKey(slug: string): string {
  return `${slug}:${new Date().toISOString().slice(0, 10)}`;
}

export function getCachedSummary(key: string): WeatherSummary | null {
  const store = load();
  return store[key] ?? null;
}

export function setCachedSummary(key: string, summary: WeatherSummary): void {
  load()[key] = summary;
  persist();
}
