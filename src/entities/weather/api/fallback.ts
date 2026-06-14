import type { City } from "@/entities/city";
import { dayMonth, hhmm, weekdayShort } from "@/shared/lib/format";
import { apparentTemperature, estimateVisibility } from "../lib/apparent";
import { conditionLabel } from "../lib/condition";
import type { CityWeather, DayPoint, HourPoint, WeatherCondition } from "../model/types";

const PATTERN: { hour: number; delta: number; condition: WeatherCondition; precip: number; wind: number }[] = [
  { hour: 0, delta: 0, condition: "partly", precip: 0, wind: 4 },
  { hour: 2, delta: 1, condition: "clear", precip: 0, wind: 3 },
  { hour: 4, delta: 2, condition: "clear", precip: 0, wind: 3 },
  { hour: 6, delta: 1, condition: "partly", precip: 0, wind: 4 },
  { hour: 8, delta: -1, condition: "partly", precip: 0.1, wind: 5 },
  { hour: 10, delta: -2, condition: "cloudy", precip: 0.2, wind: 5 },
  { hour: 12, delta: -3, condition: "cloudy", precip: 0.3, wind: 6 },
  { hour: 14, delta: -3, condition: "lightrain", precip: 0.4, wind: 6 },
  { hour: 16, delta: -2, condition: "lightrain", precip: 0.3, wind: 5 },
  { hour: 18, delta: -1, condition: "cloudy", precip: 0.1, wind: 4 },
  { hour: 20, delta: 1, condition: "partly", precip: 0, wind: 3 },
  { hour: 22, delta: 2, condition: "clear", precip: 0, wind: 3 },
  { hour: 24, delta: 1, condition: "partly", precip: 0, wind: 4 },
];

const DAY_CYCLE: { condition: WeatherCondition; precip: number; wind: string }[] = [
  { condition: "partly", precip: 0.3, wind: "СЗ 4 м/с" },
  { condition: "clear", precip: 0, wind: "З 3 м/с" },
  { condition: "cloudy", precip: 0.2, wind: "С 4 м/с" },
  { condition: "rain", precip: 3.2, wind: "СЗ 6 м/с" },
  { condition: "lightrain", precip: 1.1, wind: "С 5 м/с" },
  { condition: "partly", precip: 0.2, wind: "З 3 м/с" },
  { condition: "clear", precip: 0, wind: "Ю 2 м/с" },
  { condition: "partly", precip: 0.4, wind: "СЗ 4 м/с" },
  { condition: "cloudy", precip: 0.6, wind: "С 5 м/с" },
  { condition: "partly", precip: 0.1, wind: "З 3 м/с" },
];

/* Детерминированный сид: севернее — холоднее, чтобы города различались */
export function buildFallbackWeather(city: City, now: Date): CityWeather {
  const base = Math.round(16 - (city.lat - 67) * 1.6);
  const startHour = now.getHours();

  const hours: HourPoint[] = PATTERN.map((p, i) => {
    const at = new Date(now.getTime() + i * HOURLY_STEP_MS);
    const temp = base + p.delta;
    return {
      iso: at.toISOString(),
      time: hhmm(at),
      temp,
      feels: apparentTemperature(temp, p.wind, 68),
      condition: p.condition,
      precip: p.precip,
      wind: p.wind,
      windDir: "СЗ",
      pressure: 755 - i,
    };
  });

  const days: DayPoint[] = DAY_CYCLE.map((d, i) => {
    const at = new Date(now.getTime() + i * 86_400_000);
    const tmax = base + 2 - (i % 4);
    const tmin = base - 4 - (i % 3);
    return {
      iso: at.toISOString(),
      dow: weekdayShort(at),
      date: dayMonth(at),
      tmax,
      tmin,
      condition: d.condition,
      conditionLabel: conditionLabel(d.condition),
      precip: d.precip,
      wind: d.wind,
    };
  });

  const condition: WeatherCondition = "partly";

  return {
    current: {
      temp: base,
      feels: apparentTemperature(base, 4, 68),
      condition,
      conditionLabel: conditionLabel(condition),
      wind: 4,
      windDir: "СЗ",
      gust: 8,
      pressure: 755,
      humidity: 68,
      visibility: estimateVisibility(condition, 0),
      uv: 3,
      precip: 0.3,
      tmax: days[0]!.tmax,
      tmin: days[0]!.tmin,
    },
    hours,
    days,
    updatedAt: hhmm(now),
    fallback: true,
  };
}

const HOURLY_STEP_MS = 2 * 60 * 60 * 1000;
