import { FORECAST_REVALIDATE } from "@/shared/config/site";
import type { ForecastModel } from "../lib/consensus";
import type { OpenMeteoForecast } from "./open-meteo-types";

/*
  Независимые численные модели для свода прогноза. metno_seamless — региональная
  (MET Nordic, та же основа, что у yr.no); ecmwf/gfs/icon — глобальные. Все четыре
  приходят одним запросом: каждая переменная в `daily` суффиксируется id модели.
*/
export const CONSENSUS_MODELS: readonly ForecastModel[] = [
  { id: "ecmwf_ifs025", label: "ECMWF" },
  { id: "gfs_seamless", label: "GFS" },
  { id: "icon_seamless", label: "ICON" },
  { id: "metno_seamless", label: "MET Nordic" },
];

const DAILY = "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code";
const FORECAST_DAYS = 3;
const MAX_ATTEMPTS = 2;
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

/*
  Запросы идут напрямую на бекенд-прокси (отдельный докер-контейнер),
  который форвардит на api.open-meteo.com из-за блокировки в РФ.
*/
const PROXY_BASE = process.env.OPEN_METEO_PROXY ?? "http://127.0.0.1:3001/forecast";

export async function fetchOpenMeteo(
  lat: number,
  lon: number,
  slug?: string,
): Promise<OpenMeteoForecast> {
  const models = CONSENSUS_MODELS.map((m) => m.id).join(",");
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    daily: DAILY,
    models,
    forecast_days: String(FORECAST_DAYS),
    timezone: "Europe/Moscow",
  });
  const url = `${PROXY_BASE}?${params}`;
  const tags = slug ? ["weather", `weather:${slug}`] : ["weather"];
  let lastErr: Error = new Error("no attempts");

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 600 * attempt));

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
        next: { revalidate: FORECAST_REVALIDATE, tags },
      });
    } catch (e) {
      lastErr = e as Error;
      continue;
    }

    if (response.ok) {
      return (await response.json()) as OpenMeteoForecast;
    }

    lastErr = new Error(`Open-Meteo ответил ${response.status}`);
    if (!RETRYABLE.has(response.status)) break;
  }

  throw lastErr;
}
