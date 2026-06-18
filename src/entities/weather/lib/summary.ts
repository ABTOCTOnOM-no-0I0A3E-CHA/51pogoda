import type { City } from "@/entities/city";
import type { DaylightInfo } from "@/shared/lib/daylight";
import type { CityWeather } from "../model/types";

export interface WeatherSummary {
  accurate: string;
  advice: string;
}

/* Текстовая сводка «простым языком» — детерминированно из данных, без LLM */
export function buildSummary(city: City, weather: CityWeather, daylight: DaylightInfo): WeatherSummary {
  const { current, days } = weather;
  const today = days[0];

  const tempStr = withSign(current.temp);
  const condStr = current.conditionLabel.toLowerCase();
  const range = today ? `Днём воздух прогреется до ${withSign(today.tmax)} °C, к ночи похолодает до ${withSign(today.tmin)} °C.` : "";
  const precipChance = chanceOfPrecip(weather);

  /* без «в <город>»: название уже над сводкой, а склонять 224 точки (базы, маяки) нечем */
  const accurate =
    `Сейчас ${tempStr} °C, ${condStr}, ветер ${windWord(current.windDir)} ${current.wind} м/с. ` +
    `${range} Вероятность осадков ${precipChance}.`;

  return { accurate, advice: buildAdvice(current.temp, weather, daylight) };
}

function buildAdvice(temp: number, weather: CityWeather, daylight: DaylightInfo): string {
  const parts: string[] = [];

  if (temp >= 18) parts.push("Тепло — подойдёт лёгкая одежда.");
  else if (temp >= 10) parts.push("Можно выйти в лёгкой куртке.");
  else if (temp >= 0) parts.push("Прохладно — пригодится тёплая куртка.");
  else parts.push("Холодно — одевайтесь основательно, шапка и перчатки не помешают.");

  const wetSoon = weather.hours.slice(0, 6).some((h) => h.precip >= 0.2);
  if (wetSoon) parts.push("В ближайшие часы возможен дождь — захватите зонт.");

  if (daylight.polarDay) {
    parts.push("Полярный день в разгаре — солнце не сядет, так что для крепкого сна пригодятся плотные шторы или маска для сна.");
  } else if (daylight.polarNight) {
    parts.push("Полярная ночь — световой день отсутствует, не забывайте про витамин D и яркий свет днём.");
  }

  return parts.join(" ");
}

function chanceOfPrecip(weather: CityWeather): string {
  const wet = weather.hours.filter((h) => h.precip >= 0.1).length;
  const ratio = weather.hours.length ? wet / weather.hours.length : 0;
  const percent = Math.round(ratio * 100);

  if (percent < 20) return "низкая — около 20 %";
  if (percent < 50) return `умеренная — около ${percent} %`;
  return `высокая — около ${percent} %`;
}

function withSign(value: number): string {
  return value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : "0";
}

function windWord(dir: string): string {
  const map: Record<string, string> = {
    С: "северный",
    СВ: "северо-восточный",
    В: "восточный",
    ЮВ: "юго-восточный",
    Ю: "южный",
    ЮЗ: "юго-западный",
    З: "западный",
    СЗ: "северо-западный",
  };
  return map[dir] ?? "переменный";
}
