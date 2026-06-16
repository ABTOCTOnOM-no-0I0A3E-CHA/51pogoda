import "server-only";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { CITIES, CAPITAL_SLUG, getCity, getRegionCities } from "../model/cities";
import { getCityByYrId } from "./lookup";
import type { City, CityKind } from "../model/types";

/*
  Реестр локаций для серверных путей: встроенный список (cities.ts, client-safe)
  + кастомные точки, добавленные через админку и хранящиеся в data/custom-cities.json.
  Модуль server-only — не попадает в клиентский бандл (CitySearch остаётся на
  встроенном списке). Кастомные точки доступны по прямому URL, в каталоге и сетке.
*/

const DATA_DIR = join(process.cwd(), "data");
const CUSTOM_FILE = join(DATA_DIR, "custom-cities.json");

const KINDS: readonly CityKind[] = [
  "город", "пгт", "село", "турбаза", "база отдыха", "рыболовный лагерь",
  "КПП", "маяк", "аэропорт", "порт", "станция", "акватория",
];

/*
  Кэш инвалидируется по mtime файла: route handlers и серверные рендеры живут
  в разных бандлах (= разные инстансы модуля), память не шарится. Сверяем mtime,
  чтобы любой процесс перечитал файл после записи из админки.
*/
let cache: City[] | null = null;
let cachedMtime = -1;

function fileMtime(): number {
  try {
    return existsSync(CUSTOM_FILE) ? statSync(CUSTOM_FILE).mtimeMs : 0;
  } catch {
    return 0;
  }
}

function loadCustom(): City[] {
  const mtime = fileMtime();
  if (cache && mtime === cachedMtime) return cache;
  cachedMtime = mtime;
  try {
    if (mtime === 0) {
      cache = [];
      return cache;
    }
    const parsed = JSON.parse(readFileSync(CUSTOM_FILE, "utf-8")) as unknown;
    cache = Array.isArray(parsed) ? (parsed as City[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

/* Принудительный сброс кэша. */
export function reloadCities(): void {
  cache = null;
  cachedMtime = -1;
}

/* Встроенные + кастомные точки. */
export function getAllCities(): City[] {
  return [...CITIES, ...loadCustom()];
}

/* Только кастомные — для списка в админке. */
export function getCustomCities(): City[] {
  return [...loadCustom()];
}

export function getCityMerged(slug: string): City | undefined {
  return getCity(slug) ?? loadCustom().find((c) => c.slug === slug);
}

export function getCityByYrIdMerged(yrId: string): City | undefined {
  return getCityByYrId(yrId) ?? loadCustom().find((c) => c.yrId === yrId);
}

/* Города для сетки на главной (kind === "город", без столицы). */
export function getRegionCitiesMerged(): City[] {
  const custom = loadCustom().filter((c) => c.kind === "город" && c.slug !== CAPITAL_SLUG);
  return [...getRegionCities(), ...custom];
}

export interface AddCityResult {
  ok: boolean;
  error?: string;
  city?: City;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,60}$/;

/* Валидирует и добавляет кастомную точку, пишет файл, сбрасывает кэш. */
export function addCity(input: Partial<City>): AddCityResult {
  const slug = String(input.slug ?? "").trim();
  const name = String(input.name ?? "").trim();
  const kind = input.kind as CityKind;
  const lat = Number(input.lat);
  const lon = Number(input.lon);
  const yrId = String(input.yrId ?? "").trim();

  if (!SLUG_RE.test(slug)) return { ok: false, error: "slug: только a-z, 0-9, дефис (до 61 символа)" };
  if (!name) return { ok: false, error: "name: обязательно" };
  if (!KINDS.includes(kind)) return { ok: false, error: "kind: недопустимый тип" };
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return { ok: false, error: "lat: -90..90" };
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) return { ok: false, error: "lon: -180..180" };
  if (!/^2-\d+$/.test(yrId)) return { ok: false, error: "yrId: формат 2-XXXXXXX" };
  if (getCityMerged(slug)) return { ok: false, error: `slug "${slug}" уже занят` };

  const city: City = { slug, name, kind, lat, lon, yrId };
  const next = [...loadCustom(), city];

  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(CUSTOM_FILE, JSON.stringify(next, null, 2), "utf-8");
  } catch (e) {
    return { ok: false, error: `запись файла: ${(e as Error).message}` };
  }

  cache = next;
  cachedMtime = fileMtime();
  return { ok: true, city };
}
