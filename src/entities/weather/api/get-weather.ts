import { cache } from "react";
import type { City } from "@/entities/city";
import type { CityWeather } from "../model/types";
import { fetchMetForecast } from "./met-client";
import { buildCityWeather } from "./build-weather";

/*
  Прогноз для одного города — ТОЛЬКО реальные данные MET, без моков.
  Если MET недоступен (после ретраев в met-client) — пробрасываем ошибку,
  пусть вызывающий покажет состояние «нет данных», а не выдумку.
  cache() дедупит запрос в пределах одного рендера (несколько Suspense-блоков
  одного города → один запрос к MET).
*/
export const getCityWeather = cache(async (city: City): Promise<CityWeather> => {
  const raw = await fetchMetForecast(city.lat, city.lon);
  return buildCityWeather(raw);
});

export interface CityWithWeather {
  city: City;
  /* null — реальные данные недоступны (показываем состояние «нет данных») */
  weather: CityWeather | null;
}

/*
  Прогноз для списка городов (сетка на главной). Запросы идут батчами:
  api.met.no троттлит пачки параллельных запросов. Падение одного города
  не роняет остальные — он просто получает weather: null.
*/
const MET_CONCURRENCY = 4;

export async function getCitiesWeather(cities: readonly City[]): Promise<CityWithWeather[]> {
  const result: CityWithWeather[] = [];

  for (let i = 0; i < cities.length; i += MET_CONCURRENCY) {
    const batch = cities.slice(i, i + MET_CONCURRENCY);
    const settled = await Promise.all(
      batch.map(async (city): Promise<CityWithWeather> => {
        try {
          return { city, weather: await getCityWeather(city) };
        } catch (error) {
          console.error(`[weather] ${city.slug}: нет данных, ${(error as Error).message}`);
          return { city, weather: null };
        }
      }),
    );
    result.push(...settled);
  }

  return result;
}
