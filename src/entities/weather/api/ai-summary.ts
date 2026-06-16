import { unstable_cache } from "next/cache";
import type { City } from "@/entities/city";
import type { DaylightInfo } from "@/shared/lib/daylight";
import type { CityWeather } from "../model/types";
import { buildSummary, type WeatherSummary } from "../lib/summary";
import { getPromptTemplate } from "../lib/prompt-store";
import { callGigaChat } from "./gigachat";

async function generateSummary(prompt: string): Promise<WeatherSummary> {
  let lastErr: Error = new Error("no attempts");

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 800 * attempt));

    let raw: string;
    try {
      raw = await callGigaChat(prompt);
    } catch (e) {
      lastErr = e as Error;
      continue;
    }

    const parsed = parseSummary(raw);
    if (!parsed) {
      lastErr = new Error("не удалось распарсить JSON из ответа модели");
      continue;
    }
    if (violatesRules(parsed)) {
      lastErr = new Error("ответ нарушает правила (очки/УФ/крем) — перегенерация");
      continue;
    }
    return parsed;
  }
  throw lastErr;
}

/*
  GigaChat слабее держит негативные инструкции и периодически советует
  очки/крем/защиту от УФ, что в Заполярье неуместно (правило промпта).
  Ловим это и перегенерируем; если все попытки нарушают — уходим в fallback.
*/
const FORBIDDEN = /очк|крем|ультрафиолет|солнцезащит|\bуф\b/i;

function violatesRules(s: WeatherSummary): boolean {
  return FORBIDDEN.test(s.accurate) || FORBIDDEN.test(s.advice);
}

/* GigaChat может обернуть JSON в текст или ```-фенсы — вытаскиваем объект */
function parseSummary(raw: string): WeatherSummary | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    const obj = JSON.parse(match[0]) as Partial<WeatherSummary>;
    if (!obj.accurate || !obj.advice) return null;
    return { accurate: String(obj.accurate), advice: String(obj.advice) };
  } catch {
    return null;
  }
}

/* Блок фактических данных — собирается кодом, в шаблон подставляется как {data} */
function buildDataBlock(weather: CityWeather, daylight: DaylightInfo): string {
  const { current, days } = weather;
  const today = days[0];
  const polarNote = daylight.polarDay
    ? "- сейчас полярный день: светло круглые сутки, солнце не заходит"
    : daylight.polarNight
    ? "- сейчас полярная ночь: темно круглые сутки, солнце не восходит"
    : "";

  return [
    "Данные сейчас:",
    `- температура ${current.temp}°C, ощущается как ${current.feels}°C`,
    `- ${current.conditionLabel.toLowerCase()}`,
    `- ветер ${current.windDir} ${current.wind} м/с (порывы до ${current.gust} м/с)`,
    `- влажность ${current.humidity}%`,
    today ? `- днём до ${today.tmax}°C, ночью до ${today.tmin}°C` : "",
    polarNote,
  ]
    .filter(Boolean)
    .join("\n");
}

/* Шаблон (глобальный или по slug из админки) + подстановка названия и данных */
function buildPrompt(city: City, weather: CityWeather, daylight: DaylightInfo): string {
  const dataBlock = buildDataBlock(weather, daylight);
  return getPromptTemplate(city.slug)
    .split("{city}")
    .join(city.name)
    .split("{data}")
    .join(dataBlock);
}

export async function getAiSummary(
  city: City,
  weather: CityWeather,
  daylight: DaylightInfo,
): Promise<WeatherSummary> {
  const hourKey = new Date().toISOString().slice(0, 13); /* кеш ломается раз в час */
  const prompt = buildPrompt(city, weather, daylight);

  try {
    return await unstable_cache(
      () => generateSummary(prompt),
      [`ai-summary-${city.slug}`, hourKey],
      { revalidate: 3600, tags: ["ai", `ai:${city.slug}`] },
    )();
  } catch (err) {
    console.error(`[ai-summary] ${city.slug}:`, err);
    return buildSummary(city, weather, daylight);
  }
}
