import { unstable_cache } from "next/cache";
import type { City } from "@/entities/city";
import type { DaylightInfo } from "@/shared/lib/daylight";
import type { CityWeather, ForecastConsensus } from "../model/types";
import { buildSummary, type WeatherSummary } from "../lib/summary";
import { getPromptTemplate } from "../lib/prompt-store";
import { renderTemplate } from "../lib/prompt-template";
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
/*
  Граница слова через lookbehind по кириллице (ASCII-\b с кириллицей не работает):
  иначе «очк» ловит «точка росы», давая ложный фолбэк. Перед стеблем не должно быть
  кириллической буквы — так «очки/крем» в начале слова ловятся, а «точка» — нет.
*/
const FORBIDDEN = /(?<![а-яё])(очк|крем)|ультрафиолет|солнцезащит|(?<![а-яё])уф(?![а-яё])/i;

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

  /* направление ощущаемой отдаём готовым — модель не должна сама выводить знак */
  const feelsDelta = current.feels - current.temp;
  const feelsNote =
    feelsDelta <= -1
      ? " (ощущается ХОЛОДНЕЕ фактической из-за ветра и/или влажности)"
      : feelsDelta >= 1
      ? " (ощущается теплее фактической)"
      : " (примерно как фактическая)";

  return [
    "Данные сейчас:",
    `- температура ${current.temp}°C, ощущается как ${current.feels}°C${feelsNote}`,
    `- ${current.conditionLabel.toLowerCase()}`,
    `- ветер ${current.windDir} ${current.wind} м/с (порывы до ${current.gust} м/с)`,
    `- влажность ${current.humidity}%`,
    today ? `- днём до ${today.tmax}°C, ночью до ${today.tmin}°C` : "",
    polarNote,
  ]
    .filter(Boolean)
    .join("\n");
}

/*
  Когда модели прогноза расходятся по сегодняшнему дню — отдаём это ИИ как факт,
  чтобы сводка честно отметила неустойчивость. При согласии (high) молчим, чтобы
  не зашумлять промпт.
*/
function buildConsensusNote(consensus: ForecastConsensus | null): string {
  const today = consensus?.days[0];
  if (!today || today.confidence === "high") return "";

  const tempPart =
    today.spread >= 2
      ? `дневной максимум по разным моделям от ${today.tmaxMin}°C до ${today.tmaxMax}°C`
      : "";
  const precipPart =
    today.precipAgreement > 0 && today.precipAgreement < 1
      ? "часть моделей даёт осадки, часть — нет"
      : "";
  const detail = [tempPart, precipPart].filter(Boolean).join("; ");
  if (!detail) return "";
  return `- ВАЖНО: прогноз на сегодня неустойчивый (${detail}) — кратко отметь, что возможны изменения`;
}

/* Шаблон (глобальный или по slug из админки) + подстановка названия и данных */
function buildPrompt(
  city: City,
  weather: CityWeather,
  daylight: DaylightInfo,
  consensus: ForecastConsensus | null,
): string {
  const note = buildConsensusNote(consensus);
  const dataBlock = note ? `${buildDataBlock(weather, daylight)}\n${note}` : buildDataBlock(weather, daylight);
  return renderTemplate(getPromptTemplate(city.slug), { city: city.name, data: dataBlock });
}

export async function getAiSummary(
  city: City,
  weather: CityWeather,
  daylight: DaylightInfo,
  consensus: ForecastConsensus | null = null,
): Promise<WeatherSummary> {
  const hourKey = new Date().toISOString().slice(0, 13); /* кеш ломается раз в час */
  const prompt = buildPrompt(city, weather, daylight, consensus);

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
