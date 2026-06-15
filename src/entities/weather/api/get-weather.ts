import type { City } from "@/entities/city";
import type { CityWeather } from "../model/types";
import { fetchMetForecast } from "./met-client";
import { buildCityWeather } from "./build-weather";
import { buildFallbackWeather } from "./fallback";

/* Прогноз для одного города: реальные данные MET, иначе локальный фолбэк */
export async function getCityWeather(city: City): Promise<CityWeather> {
  try {
    const raw = await fetchMetForecast(city.lat, city.lon);
    return buildCityWeather(raw);
  } catch (error) {
    console.error(`[weather] ${city.slug}: фолбэк, ${(error as Error).message}`);
    return buildFallbackWeather(city, new Date());
  }
}

export interface CityWithWeather {
  city: City;
  weather: CityWeather;
}

/*
  Прогноз для списка городов (сетка на главной). Запросы идут батчами,
  а не одним залпом: api.met.no throttит пачки параллельных запросов и
  отвечает 403/429. Ограничение конкурентности убирает это, а серверный
  кэш прогноза делает задержку незаметной на повторных рендерах.
*/
const MET_CONCURRENCY = 4;

export async function getCitiesWeather(cities: readonly City[]): Promise<CityWithWeather[]> {
  const result: CityWithWeather[] = [];

  for (let i = 0; i < cities.length; i += MET_CONCURRENCY) {
    const batch = cities.slice(i, i + MET_CONCURRENCY);
    const settled = await Promise.all(
      batch.map(async (city) => ({ city, weather: await getCityWeather(city) })),
    );
    result.push(...settled);
  }

  return result;
}
