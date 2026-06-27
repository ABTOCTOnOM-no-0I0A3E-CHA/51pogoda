/*
  Свод прогноза по нескольким численным моделям. Чистый модуль без fs/server-only,
  чтобы покрывался тестами: на вход — блок `daily` Open-Meteo и список моделей,
  на выходе — согласие/разброс/уверенность по дням.
*/
import type {
  Confidence,
  DayConsensus,
  ForecastConsensus,
  SourceDay,
  WeatherCondition,
} from "../model/types";
import { conditionLabel, wmoToCondition } from "./condition";
import { dayMonth, weekdayShort } from "@/shared/lib/format";

export interface ForecastModel {
  id: string;
  label: string;
}

/* Структурный тип блока daily — без импорта из api-слоя (зависимость только вниз) */
interface DailyData {
  time: string[];
  [variable: string]: Array<number | null> | string[];
}

export function buildConsensus(
  daily: DailyData | undefined,
  models: readonly ForecastModel[],
): ForecastConsensus | null {
  if (!daily?.time?.length) return null;

  const days: DayConsensus[] = [];
  for (let i = 0; i < daily.time.length; i++) {
    const sources: SourceDay[] = [];

    for (const model of models) {
      const tmax = num(daily[`temperature_2m_max_${model.id}`], i);
      const tmin = num(daily[`temperature_2m_min_${model.id}`], i);
      if (tmax === null || tmin === null) continue;

      const precip = num(daily[`precipitation_sum_${model.id}`], i);
      const code = num(daily[`weather_code_${model.id}`], i);
      sources.push({
        source: model.label,
        tmax: Math.round(tmax),
        tmin: Math.round(tmin),
        precip: precip === null ? 0 : Number(precip.toFixed(1)),
        condition: wmoToCondition(code ?? 0),
      });
    }

    /* меньше двух источников — сравнивать нечего, день пропускаем */
    if (sources.length >= 2) {
      days.push(buildDay(daily.time[i]!, sources));
    }
  }

  if (!days.length) return null;
  return { days, sources: models.map((m) => m.label) };
}

function buildDay(iso: string, sources: SourceDay[]): DayConsensus {
  const tmaxs = sources.map((s) => s.tmax);
  const tmaxMin = Math.min(...tmaxs);
  const tmaxMax = Math.max(...tmaxs);
  const tmaxAvg = Math.round(tmaxs.reduce((a, b) => a + b, 0) / tmaxs.length);
  const tminAvg = Math.round(sources.reduce((a, s) => a + s.tmin, 0) / sources.length);
  const spread = tmaxMax - tmaxMin;

  const wet = sources.filter((s) => s.precip >= 0.2).length;
  const precipAgreement = wet / sources.length;

  const condition = consensusCondition(sources);
  const day = new Date(iso);

  return {
    iso,
    dow: weekdayShort(day),
    date: dayMonth(day),
    sources,
    tmaxMin,
    tmaxMax,
    tmaxAvg,
    tminAvg,
    spread,
    precipAgreement,
    condition,
    conditionLabel: conditionLabel(condition),
    confidence: rateConfidence(spread, precipAgreement),
  };
}

/* От тяжёлых к ясным: при равенстве голосов выбираем более суровое условие */
const SEVERITY: WeatherCondition[] = [
  "snow",
  "rain",
  "lightrain",
  "fog",
  "overcast",
  "cloudy",
  "partly",
  "clear",
];

function consensusCondition(sources: SourceDay[]): WeatherCondition {
  const counts = new Map<WeatherCondition, number>();
  for (const s of sources) counts.set(s.condition, (counts.get(s.condition) ?? 0) + 1);

  let best: WeatherCondition = sources[0]!.condition;
  let bestCount = 0;
  for (const c of SEVERITY) {
    const n = counts.get(c) ?? 0;
    if (n > bestCount) {
      bestCount = n;
      best = c;
    }
  }
  return best;
}

/*
  Уверенность: главный сигнал — размах дневного максимума между моделями.
  Расхождение по осадкам (часть моделей «за», часть «против») понижает планку.
*/
function rateConfidence(spread: number, precipAgreement: number): Confidence {
  const precipSplit = precipAgreement > 0 && precipAgreement < 1;
  if (spread <= 2 && !precipSplit) return "high";
  if (spread <= 4) return "medium";
  return "low";
}

function num(arr: Array<number | null> | string[] | undefined, i: number): number | null {
  if (!Array.isArray(arr)) return null;
  const v = arr[i];
  return typeof v === "number" ? v : null;
}
