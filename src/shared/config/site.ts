export const SITE = {
  name: "Норметео",
  shortName: "Норметео",
  tagline: "Мурманск и область · MET Norway",
  description:
    "Точный прогноз погоды для Мурманска и городов Мурманской области по данным MET Norway (yr.no): температура, ветер, осадки, метеограмма на 2 суток и прогноз на 10 дней.",
  locale: "ru_RU",
  /* Базовый URL берётся из окружения, иначе — продакшен-домен по умолчанию */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://51pogoda.ru").replace(/\/+$/, ""),
  source: "MET Norway (yr.no)",
  copyrightYear: 2026,
} as const;

/* Контакт обязателен в User-Agent по условиям Terms of Service api.met.no */
export const MET_USER_AGENT =
  process.env.MET_USER_AGENT ?? "Normeteo/1.0 (+https://51pogoda.ru; contact@51pogoda.ru)";

/* Как часто пересобирать серверный кэш прогноза, секунды */
export const FORECAST_REVALIDATE = 1800;
