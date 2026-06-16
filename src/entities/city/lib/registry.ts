import "server-only";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { CITIES, CAPITAL_SLUG, getCity, getRegionCities } from "../model/cities";
import { getCityByYrId } from "./lookup";
import { validateSlug, validateCityAttrs } from "./city-validation";
import type { City } from "../model/types";

/*
  Реестр локаций для серверных путей: встроенный список (cities.ts, client-safe)
  + кастомные точки, добавленные через админку и хранящиеся в data/custom-cities.json.
  Модуль server-only — не попадает в клиентский бандл (CitySearch остаётся на
  встроенном списке). Кастомные точки доступны по прямому URL, в каталоге и сетке.
*/

const DATA_DIR = join(process.cwd(), "data");
const CUSTOM_FILE = join(DATA_DIR, "custom-cities.json");

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

/* Запись списка кастомных точек + синхронизация кэша. null — успех, строка — ошибка. */
function persist(next: City[]): string | null {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(CUSTOM_FILE, JSON.stringify(next, null, 2), "utf-8");
  } catch (e) {
    return (e as Error).message;
  }
  cache = next;
  cachedMtime = fileMtime();
  return null;
}

/* Добавление новой кастомной точки. */
export function addCity(input: Partial<City>): AddCityResult {
  const slug = String(input.slug ?? "").trim();
  const slugErr = validateSlug(slug);
  if (slugErr) return { ok: false, error: slugErr };
  if (getCityMerged(slug)) return { ok: false, error: `slug "${slug}" уже занят` };

  const v = validateCityAttrs(input);
  if (v.error) return { ok: false, error: v.error };

  const city: City = { slug, ...v.value! };
  const err = persist([...loadCustom(), city]);
  if (err) return { ok: false, error: `запись файла: ${err}` };
  return { ok: true, city };
}

/* Редактирование кастомной точки (slug неизменяем — это URL и ключ). */
export function updateCity(slug: string, input: Partial<City>): AddCityResult {
  const custom = loadCustom();
  const idx = custom.findIndex((c) => c.slug === slug);
  if (idx < 0) return { ok: false, error: `точка "${slug}" не найдена среди кастомных` };

  const v = validateCityAttrs(input);
  if (v.error) return { ok: false, error: v.error };

  const city: City = { slug, ...v.value! };
  const next = custom.slice();
  next[idx] = city;
  const err = persist(next);
  if (err) return { ok: false, error: `запись файла: ${err}` };
  return { ok: true, city };
}

/* Удаление кастомной точки. Встроенные точки удалить нельзя — они в коде. */
export function deleteCity(slug: string): AddCityResult {
  const custom = loadCustom();
  if (!custom.some((c) => c.slug === slug)) {
    return { ok: false, error: `точка "${slug}" не найдена среди кастомных` };
  }
  const err = persist(custom.filter((c) => c.slug !== slug));
  if (err) return { ok: false, error: `запись файла: ${err}` };
  return { ok: true };
}
