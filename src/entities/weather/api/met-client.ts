import { MET_USER_AGENT, FORECAST_REVALIDATE } from "@/shared/config/site";
import type { MetForecast } from "./met-types";

const ENDPOINT = "https://api.met.no/weatherapi/locationforecast/2.0/complete";

/*
  Запрос прогноза к api.met.no. По ToS координаты округляются до 4 знаков,
  обязателен идентифицирующий User-Agent. Результат кэшируется на стороне
  Next с ревалидацией, чтобы не долбить чужой бесплатный API на каждый рендер.
*/
export async function fetchMetForecast(lat: number, lon: number): Promise<MetForecast> {
  const url = `${ENDPOINT}?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": MET_USER_AGENT,
      Accept: "application/json",
    },
    next: { revalidate: FORECAST_REVALIDATE },
  });

  if (!response.ok) {
    throw new Error(`MET Norway ответил ${response.status}`);
  }

  return (await response.json()) as MetForecast;
}
