import { MET_USER_AGENT, FORECAST_REVALIDATE } from "@/shared/config/site";
import type { MetForecast } from "./met-types";

const ENDPOINT = "https://api.met.no/weatherapi/locationforecast/2.0/complete";

/*
  Запрос прогноза к api.met.no. По ToS координаты округляются до 4 знаков,
  обязателен идентифицирующий User-Agent. Результат кэшируется на стороне
  Next с ревалидацией, чтобы не долбить чужой бесплатный API на каждый рендер.
*/
const MAX_ATTEMPTS = 3;
/* Статусы, при которых есть смысл повторить: троттлинг и временные сбои */
const RETRYABLE = new Set([403, 429, 500, 502, 503, 504]);

export async function fetchMetForecast(
  lat: number,
  lon: number,
  slug?: string,
): Promise<MetForecast> {
  const url = `${ENDPOINT}?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;
  /* Теги для адресной инвалидации из админки: "weather" — все, "weather:slug" — точка */
  const tags = slug ? ["weather", `weather:${slug}`] : ["weather"];
  let lastErr: Error = new Error("no attempts");

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 600 * attempt));

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          "User-Agent": MET_USER_AGENT,
          Accept: "application/json",
        },
        next: { revalidate: FORECAST_REVALIDATE, tags },
      });
    } catch (e) {
      lastErr = e as Error;
      continue;
    }

    if (response.ok) {
      const data = (await response.json()) as MetForecast;

      /* Проверка свежести: если последняя точка в ряду старше 1 часа — страница не должна рендериться с устаревшими данными */
      if (data.properties?.meta?.updated_at) {
        const updated = new Date(data.properties.meta.updated_at).getTime();
        const ageHrs = (Date.now() - updated) / 3_600_000;
        if (ageHrs > 1) {
          throw new Error(`[met-client] ${slug ?? "?"} данные устарели на ${ageHrs.toFixed(1)}ч (обновлено ${data.properties.meta.updated_at}) — страница не будет перегенерирована`);
        }
      }

      return data;
    }

    lastErr = new Error(`MET Norway ответил ${response.status}`);
    if (!RETRYABLE.has(response.status)) break;
  }

  throw lastErr;
}
