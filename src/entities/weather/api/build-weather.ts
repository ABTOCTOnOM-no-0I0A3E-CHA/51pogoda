import { dayKey, dayMonth, hhmm, weekdayShort } from "@/shared/lib/format";
import type { CityWeather, CurrentWeather, DayPoint, HourPoint, WeatherCondition } from "../model/types";
import {
  conditionLabel,
  degToCompass,
  hpaToMmHg,
  symbolToCondition,
} from "../lib/condition";
import {
  apparentTemperature,
  estimateVisibility,
} from "../lib/apparent";
import type { MetForecast, MetTimeseriesEntry } from "./met-types";

const HOURLY_STEP = 2;
const HOURLY_COUNT = 13;
const FORECAST_DAYS = 10;

/* Сборка нашей модели погоды из сырого ответа MET Norway */
export function buildCityWeather(raw: MetForecast): CityWeather {
  const series = raw.properties.timeseries;
  const first = series[0];

  if (!first) {
    throw new Error("Пустой ответ MET Norway");
  }

  const updatedAt = hhmm(new Date(raw.properties.meta.updated_at));
  const fetchedAt = Date.now();

  const hours = buildHours(series);
  const days = buildDays(series);
  const today = days[0];
  const current = buildCurrent(first, today);

  return { current, hours, days, updatedAt, fallback: false, fetchedAt };
}

function buildHours(series: MetTimeseriesEntry[]): HourPoint[] {
  const hourly = series.filter((s) => s.data.next_1_hours?.summary?.symbol_code);

  return hourly
    .filter((_, i) => i % HOURLY_STEP === 0)
    .slice(0, HOURLY_COUNT)
    .map((entry) => toHourPoint(entry));
}

function toHourPoint(entry: MetTimeseriesEntry): HourPoint {
  const d = entry.data.instant.details;
  const temp = Math.round(d.air_temperature ?? 0);
  const wind = d.wind_speed ?? 0;
  const humidity = d.relative_humidity ?? 70;

  return {
    iso: entry.time,
    time: hhmm(new Date(entry.time)),
    temp,
    feels: apparentTemperature(d.air_temperature ?? 0, wind, humidity),
    condition: symbolToCondition(entry.data.next_1_hours?.summary?.symbol_code),
    precip: entry.data.next_1_hours?.details?.precipitation_amount ?? 0,
    wind: Math.round(wind),
    windDir: degToCompass(d.wind_from_direction ?? 0),
    pressure: hpaToMmHg(d.air_pressure_at_sea_level ?? 1013),
  };
}

function buildCurrent(entry: MetTimeseriesEntry, today: DayPoint | undefined): CurrentWeather {
  const d = entry.data.instant.details;
  const symbol = entry.data.next_1_hours?.summary?.symbol_code ?? entry.data.next_6_hours?.summary?.symbol_code;
  const condition = symbolToCondition(symbol);
  const wind = d.wind_speed ?? 0;
  const humidity = Math.round(d.relative_humidity ?? 70);

  return {
    temp: Math.round(d.air_temperature ?? 0),
    feels: apparentTemperature(d.air_temperature ?? 0, wind, humidity),
    condition,
    conditionLabel: conditionLabel(condition),
    wind: Math.round(wind),
    windDir: degToCompass(d.wind_from_direction ?? 0),
    gust: Math.round(d.wind_speed_of_gust ?? wind),
    pressure: hpaToMmHg(d.air_pressure_at_sea_level ?? 1013),
    humidity,
    visibility: estimateVisibility(condition, d.fog_area_fraction ?? 0),
    uv: Math.round(d.ultraviolet_index_clear_sky ?? 0),
    precip: entry.data.next_1_hours?.details?.precipitation_amount ?? 0,
    tmax: today?.tmax ?? Math.round(d.air_temperature ?? 0),
    tmin: today?.tmin ?? Math.round(d.air_temperature ?? 0),
  };
}

function buildDays(series: MetTimeseriesEntry[]): DayPoint[] {
  const groups = new Map<string, MetTimeseriesEntry[]>();
  const order: string[] = [];

  for (const entry of series) {
    const key = dayKey(new Date(entry.time));
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(entry);
    } else {
      groups.set(key, [entry]);
      order.push(key);
    }
  }

  return order.slice(0, FORECAST_DAYS).map((key) => toDayPoint(groups.get(key)!));
}

function toDayPoint(entries: MetTimeseriesEntry[]): DayPoint {
  const temps = entries.map((e) => e.data.instant.details.air_temperature ?? 0);
  const tmax = Math.round(Math.max(...temps));
  const tmin = Math.round(Math.min(...temps));

  const hasHourly = entries.some((e) => e.data.next_1_hours);
  const precip = entries.reduce((acc, e) => {
    const value = hasHourly
      ? e.data.next_1_hours?.details?.precipitation_amount ?? 0
      : e.data.next_6_hours?.details?.precipitation_amount ?? 0;
    return acc + value;
  }, 0);

  const midday = pickMidday(entries);
  const symbol =
    midday.data.next_6_hours?.summary?.symbol_code ??
    midday.data.next_1_hours?.summary?.symbol_code ??
    midday.data.next_12_hours?.summary?.symbol_code;
  const condition: WeatherCondition = symbolToCondition(symbol);

  const day = new Date(entries[0]!.time);
  const wind = midday.data.instant.details.wind_speed ?? 0;
  const windDir = degToCompass(midday.data.instant.details.wind_from_direction ?? 0);

  return {
    iso: entries[0]!.time,
    dow: weekdayShort(day),
    date: dayMonth(day),
    tmax,
    tmin,
    condition,
    conditionLabel: conditionLabel(condition),
    precip: Number(precip.toFixed(1)),
    wind: `${windDir} ${Math.round(wind)} м/с`,
  };
}

function pickMidday(entries: MetTimeseriesEntry[]): MetTimeseriesEntry {
  let best = entries[0]!;
  let bestDelta = Number.POSITIVE_INFINITY;

  for (const entry of entries) {
    const hour = new Date(entry.time).getUTCHours();
    const delta = Math.abs(hour - 9); /* ~12:00 по Москве = 09:00 UTC */
    if (delta < bestDelta) {
      bestDelta = delta;
      best = entry;
    }
  }

  return best;
}
