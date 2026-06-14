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

/* Параллельный прогноз для списка городов (сетка на главной) */
export async function getCitiesWeather(cities: readonly City[]): Promise<CityWithWeather[]> {
  return Promise.all(
    cities.map(async (city) => ({ city, weather: await getCityWeather(city) })),
  );
}
