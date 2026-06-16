import type { City, CityKind } from "../model/types";

/*
  Чистая валидация атрибутов точки — без fs и server-only, чтобы покрывалась
  юнит-тестами и переиспользовалась реестром (registry.ts).
*/

export const KINDS: readonly CityKind[] = [
  "город", "пгт", "село", "турбаза", "база отдыха", "рыболовный лагерь",
  "КПП", "маяк", "аэропорт", "порт", "станция", "акватория",
];

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,60}$/;

/* Проверка slug. null — ок, строка — текст ошибки. */
export function validateSlug(slug: string): string | null {
  return SLUG_RE.test(slug) ? null : "slug: только a-z, 0-9, дефис (до 61 символа)";
}

/* Валидация атрибутов точки (без slug — он identity и проверяется отдельно). */
export function validateCityAttrs(input: Partial<City>): { value?: Omit<City, "slug">; error?: string } {
  const name = String(input.name ?? "").trim();
  const kind = input.kind as CityKind;
  const lat = Number(input.lat);
  const lon = Number(input.lon);
  const yrId = String(input.yrId ?? "").trim();

  if (!name) return { error: "name: обязательно" };
  if (!KINDS.includes(kind)) return { error: "kind: недопустимый тип" };
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return { error: "lat: -90..90" };
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) return { error: "lon: -180..180" };
  if (!/^2-\d+$/.test(yrId)) return { error: "yrId: формат 2-XXXXXXX" };

  return { value: { name, kind, lat, lon, yrId } };
}
