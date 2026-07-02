import type { CityWeather, ForecastConsensus } from "../model/types";
import type { DaylightInfo } from "@/shared/lib/daylight";

/*
  Собирает блок фактических данных для подстановки в промпт ИИ-сводки.
  Включает консенсус-информацию — разброс моделей и уверенность прогноза.
  Чистый модуль (без server-only) — под тесты.
*/

export function buildDataBlock(
  weather: CityWeather,
  daylight: DaylightInfo,
  consensus: ForecastConsensus | null,
): string {
  const { current, days, hours } = weather;
  const today = days[0];
  const lines: string[] = [];

  lines.push(
    `Сейчас ${current.temp} °C, ощущается как ${current.feels} °C, ${current.conditionLabel}, ветер ${current.wind} м/с, влажность ${current.humidity}%.`,
  );

  if (today) {
    lines.push(
      `Сегодня (${today.date}): ${today.tmin}…${today.tmax} °C, ${today.conditionLabel}, осадки ${today.precip} мм.`,
    );
  }

  const wet6h = hours.slice(0, 6).filter((h) => h.precip >= 0.2).length;
  if (wet6h > 0) lines.push("В ближайшие 6 часов ожидаются осадки.");

  if (daylight.polarDay) lines.push("Полярный день — светло круглые сутки.");
  if (daylight.polarNight) lines.push("Полярная ночь — темно круглые сутки.");

  if (consensus?.days?.[0]) {
    const d = consensus.days[0];
    const confLabel =
      d.confidence === "high"
        ? "высокая"
        : d.confidence === "medium"
          ? "средняя"
          : "низкая";
    lines.push(
      `Надёжность прогноза по ансамблю моделей: ${confLabel} (разброс ${d.spread} °C).`,
    );
  }

  return lines.join("\n");
}
