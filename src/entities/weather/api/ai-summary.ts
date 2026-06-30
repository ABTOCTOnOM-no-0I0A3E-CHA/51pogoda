import type { City } from "@/entities/city";
import type { DaylightInfo } from "@/shared/lib/daylight";
import type { CityWeather, ForecastConsensus } from "../model/types";
import { buildSummary, type WeatherSummary } from "../lib/summary";

export async function getAiSummary(
  city: City,
  weather: CityWeather,
  daylight: DaylightInfo,
  _consensus: ForecastConsensus | null = null,
): Promise<WeatherSummary> {
  return buildSummary(city, weather, daylight);
}
