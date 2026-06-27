import type { WeatherCondition } from "../model/types";

export const CONDITION_LABEL: Record<WeatherCondition, string> = {
  clear: "Ясно",
  partly: "Малооблачно",
  cloudy: "Облачно",
  overcast: "Пасмурно",
  lightrain: "Небольшой дождь",
  rain: "Дождь",
  snow: "Снег",
  fog: "Туман",
};

export function conditionLabel(condition: WeatherCondition): string {
  return CONDITION_LABEL[condition];
}

/* Преобразование symbol_code MET Norway в наш ограниченный набор условий */
export function symbolToCondition(symbol: string | undefined): WeatherCondition {
  if (!symbol) return "cloudy";

  const base = symbol.replace(/_(day|night|polartwilight)$/, "");

  if (base.includes("thunder")) return "rain";
  if (base.includes("sleet") || base.includes("snow")) return "snow";
  if (base.includes("heavyrain") || base === "rain" || base.includes("rainshowers")) return "rain";
  if (base.includes("rain") || base.includes("drizzle")) return "lightrain";
  if (base === "fog") return "fog";
  if (base === "cloudy") return "overcast";
  if (base === "partlycloudy") return "partly";
  if (base === "fair") return "partly";
  if (base === "clearsky") return "clear";

  return "cloudy";
}

/* WMO weather code (Open-Meteo) в наш ограниченный набор условий */
export function wmoToCondition(code: number): WeatherCondition {
  if (code >= 95) return "rain"; /* гроза → дождь */
  if (code >= 85) return "snow"; /* снежные ливни */
  if (code >= 80) return "rain"; /* ливни */
  if (code >= 71) return "snow"; /* снег */
  if (code >= 66) return "rain"; /* ледяной дождь */
  if (code >= 63) return "rain"; /* умеренный/сильный дождь */
  if (code >= 51) return "lightrain"; /* морось и слабый дождь */
  if (code >= 45) return "fog"; /* туман */
  if (code === 3) return "overcast";
  if (code === 1 || code === 2) return "partly";
  return "clear"; /* 0 */
}

const COMPASS = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];

/* Направление, ОТКУДА дует ветер (как принято в метеорологии) */
export function degToCompass(deg: number): string {
  const index = Math.round(deg / 45) % 8;
  return COMPASS[index] ?? "С";
}

const HPA_TO_MMHG = 0.750062;

export function hpaToMmHg(hpa: number): number {
  return Math.round(hpa * HPA_TO_MMHG);
}
