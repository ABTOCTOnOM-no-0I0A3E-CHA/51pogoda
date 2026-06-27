import { cache } from "react";
import type { City } from "@/entities/city";
import type { ForecastConsensus } from "../model/types";
import { buildConsensus } from "../lib/consensus";
import { CONSENSUS_MODELS, fetchOpenMeteo } from "./open-meteo-client";

/*
  Свод прогноза по нескольким моделям для одного города. Доп. сигнал поверх
  основного прогноза MET — поэтому при любой ошибке возвращаем null (страница
  работает и без него). cache() дедупит запрос в пределах одного рендера.
*/
export const getCityConsensus = cache(async (city: City): Promise<ForecastConsensus | null> => {
  try {
    const raw = await fetchOpenMeteo(city.lat, city.lon, city.slug);
    return buildConsensus(raw.daily, CONSENSUS_MODELS);
  } catch (error) {
    console.error(`[consensus] ${city.slug}: ${(error as Error).message}`);
    return null;
  }
});
