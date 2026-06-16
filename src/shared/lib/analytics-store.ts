import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

/*
  Самохостовая аналитика просмотров — без кук, без внешних скриптов (не режется
  адблоком). Считаем на сервере в proxy (срабатывает на каждый запрос, в отличие
  от ISR-кэшированных страниц). Чтобы не писать на диск на каждый хит: копим в
  памяти процесса и флашим пачкой по порогу/таймеру. proxy пишет файл, админка
  его читает (разные бандлы → обмен через data/analytics.json).

  NB: модуль НЕ server-only — его импортит proxy. fs доступен только в Node-
  рантайме (proxy в Next 16 — Node).
*/

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "analytics.json");

/* Зарезервированный ключ главной страницы. */
export const HOME_KEY = "__home";

const FLUSH_EVERY = 20; /* событий */
const FLUSH_INTERVAL = 10_000; /* мс */

export interface DayStat {
  total: number;
  perSlug: Record<string, number>;
}
export interface AnalyticsData {
  days: Record<string, DayStat>;
}

/* буфер несброшенных инкрементов этого процесса: day -> slug -> count */
const pending: Record<string, Record<string, number>> = {};
let pendingCount = 0;
let lastFlush = 0;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readFile(): AnalyticsData {
  try {
    if (existsSync(FILE)) {
      const parsed = JSON.parse(readFileSync(FILE, "utf-8")) as Partial<AnalyticsData>;
      if (parsed && typeof parsed.days === "object" && parsed.days) return { days: parsed.days };
    }
  } catch {
    /* битый файл — начинаем заново */
  }
  return { days: {} };
}

function flush(): void {
  if (pendingCount === 0) return;
  const data = readFile();
  for (const [day, slugs] of Object.entries(pending)) {
    const d = (data.days[day] ??= { total: 0, perSlug: {} });
    for (const [slug, c] of Object.entries(slugs)) {
      d.perSlug[slug] = (d.perSlug[slug] ?? 0) + c;
      d.total += c;
    }
  }
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(FILE, JSON.stringify(data), "utf-8");
  } catch {
    return; /* не теряем буфер — попробуем на следующем флаше */
  }
  for (const k of Object.keys(pending)) delete pending[k];
  pendingCount = 0;
  lastFlush = Date.now();
}

/* Регистрирует просмотр. Безопасна — не бросает в вызывающий код. */
export function recordHit(slug: string): void {
  try {
    const day = todayKey();
    (pending[day] ??= {})[slug] = (pending[day]![slug] ?? 0) + 1;
    pendingCount += 1;
    if (pendingCount >= FLUSH_EVERY || Date.now() - lastFlush > FLUSH_INTERVAL) flush();
  } catch {
    /* аналитика не должна влиять на отдачу страницы */
  }
}

/* Чтение для админки: mtime-кэш, как в остальных сторах. */
let readCache: AnalyticsData | null = null;
let cachedMtime = -1;

export function getAnalytics(): AnalyticsData {
  let mtime = 0;
  try {
    mtime = existsSync(FILE) ? statSync(FILE).mtimeMs : 0;
  } catch {
    mtime = 0;
  }
  if (readCache && mtime === cachedMtime) return readCache;
  cachedMtime = mtime;
  readCache = readFile();
  return readCache;
}

/* Полный сброс статистики. */
export function resetAnalytics(): void {
  for (const k of Object.keys(pending)) delete pending[k];
  pendingCount = 0;
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(FILE, JSON.stringify({ days: {} }), "utf-8");
  } catch {
    /* ignore */
  }
  readCache = null;
  cachedMtime = -1;
}
