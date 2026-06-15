import { unstable_cache } from "next/cache";
import type { City } from "@/entities/city";
import type { DaylightInfo } from "@/shared/lib/daylight";
import type { CityWeather } from "../model/types";
import { buildSummary, type WeatherSummary } from "../lib/summary";

const MODEL = process.env.GOOGLE_AI_MODEL ?? "models/gemini-flash-lite-latest";

async function callGoogleAI(prompt: string): Promise<WeatherSummary> {
  const key = process.env.GOOGLE_AI_KEY;
  if (!key) throw new Error("GOOGLE_AI_KEY not set");

  let lastErr: Error = new Error("no attempts");
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 800 * attempt));

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      lastErr = new Error(`Google AI ${res.status}`);
      continue;
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) { lastErr = new Error("empty response from Google AI"); continue; }

    // Gemma 4 возвращает <thought>...</thought> перед JSON — удаляем блок мышления
    const withoutThought = raw.replace(/<thought>[\s\S]*?<\/thought>/g, "");
    const clean = withoutThought.replace(/```(?:json)?/g, "").trim();
    const parsed = JSON.parse(clean) as WeatherSummary;

    if (!parsed.accurate || !parsed.advice) { lastErr = new Error("unexpected response shape"); continue; }
    return parsed;
  }
  throw lastErr;
}

function buildPrompt(city: City, weather: CityWeather, daylight: DaylightInfo): string {
  const { current, days } = weather;
  const today = days[0];
  const polarNote = daylight.polarDay
    ? "- сейчас полярный день: светло круглые сутки, солнце не заходит"
    : daylight.polarNight
    ? "- сейчас полярная ночь: темно круглые сутки, солнце не восходит"
    : "";

  return [
    `Ты — метеоролог на сайте погоды Мурманской области (Заполярье, за полярным кругом). Напиши сводку для ${city.name} на русском языке.`,
    "",
    "Данные сейчас:",
    `- температура ${current.temp}°C, ощущается как ${current.feels}°C`,
    `- ${current.conditionLabel.toLowerCase()}`,
    `- ветер ${current.windDir} ${current.wind} м/с (порывы до ${current.gust} м/с)`,
    `- влажность ${current.humidity}%`,
    today ? `- днём до ${today.tmax}°C, ночью до ${today.tmin}°C` : "",
    polarNote,
    "",
    "Правила:",
    '1. "accurate": 1–2 предложения о текущей погоде и прогнозе на день. Если ощущаемая температура заметно отличается от фактической — коротко объясни причину (ветер и/или влажность).',
    '2. "advice": один связный совет по одежде под текущую температуру — без противоречий, не предлагай одновременно тёплую и лёгкую одежду. Укажи, нужен ли зонт.',
    "3. СТРОГО ЗАПРЕЩЕНО упоминать солнцезащитный крем, солнечные очки и защиту от ультрафиолета — это Заполярье, солнце стоит низко над горизонтом, УФ не актуален.",
    "4. Полярный день/ночь упоминай только как факт освещённости (светло или темно круглые сутки), без советов про солнце и УФ.",
    "5. Пиши простым человеческим языком, без канцелярита.",
    "",
    'Ответь строго JSON без markdown: {"accurate":"...","advice":"..."}',
  ].join("\n");
}

export async function getAiSummary(
  city: City,
  weather: CityWeather,
  daylight: DaylightInfo,
): Promise<WeatherSummary> {
  const hourKey = new Date().toISOString().slice(0, 13); // кеш ломается раз в час
  const prompt = buildPrompt(city, weather, daylight);

  try {
    return await unstable_cache(
      () => callGoogleAI(prompt),
      [`ai-summary-${city.slug}`, hourKey],
      { revalidate: 3600 },
    )();
  } catch (err) {
    console.error(`[ai-summary] ${city.slug}:`, err);
    return buildSummary(city, weather, daylight);
  }
}
