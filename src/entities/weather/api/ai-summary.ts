import "server-only";
import type { City } from "@/entities/city";
import type { DaylightInfo } from "@/shared/lib/daylight";
import type { CityWeather, ForecastConsensus } from "../model/types";
import { buildSummary, type WeatherSummary } from "../lib/summary";
import { getPromptTemplate } from "../lib/prompt-store";
import { renderTemplate } from "../lib/prompt-template";
import { buildDataBlock } from "../lib/data-block";
import { callOpenRouter } from "./openrouter-client";
import { cacheKey, getCachedSummary, setCachedSummary } from "../lib/summary-cache";

async function generateWithLLM(
  city: City,
  weather: CityWeather,
  daylight: DaylightInfo,
  consensus: ForecastConsensus | null,
): Promise<WeatherSummary> {
  const prompt = renderTemplate(getPromptTemplate(city.slug), {
    city: city.name,
    data: buildDataBlock(weather, daylight, consensus),
  });

  const llm = await callOpenRouter(prompt);
  return llm ?? buildSummary(city, weather, daylight);
}

/*
  ИИ-сводка с ежедневным файловым кэшем.
  - При наличии OPENROUTER_API_KEY генерирует через OpenRouter (DeepSeek).
  - Результат кэшируется на день: первый запрос каждого дня генерирует,
    остальные берут из кэша.
  - Если OpenRouter недоступен или ключа нет — детерминированный fallback
    buildSummary (без кэширования — всегда дешёвый).
*/
export async function getAiSummary(
  city: City,
  weather: CityWeather,
  daylight: DaylightInfo,
  consensus: ForecastConsensus | null = null,
): Promise<WeatherSummary> {
  const key = cacheKey(city.slug);

  const cached = getCachedSummary(key);
  if (cached) return cached;

  const summary = await generateWithLLM(city, weather, daylight, consensus);
  setCachedSummary(key, summary);
  return summary;
}
