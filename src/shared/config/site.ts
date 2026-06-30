export const SITE = {
  name: "Норметео",
  shortName: "Норметео",
  tagline: "Мурманск и область · MET Norway",
  description:
    "Норвежский сайт погоды по данным MET Norway (yr.no): точный прогноз для Мурманска и Мурманской области. Температура, ветер, осадки, метеограмма на 2 суток и на 10 дней.",
  locale: "ru_RU",
  /* Базовый URL берётся из окружения, иначе — продакшен-домен по умолчанию */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://51pogoda.ru").replace(/\/+$/, ""),
  source: "MET Norway (yr.no)",
  copyrightYear: 2026,
} as const;

/* Контакт обязателен в User-Agent по условиям Terms of Service api.met.no */
export const MET_USER_AGENT =
  process.env.MET_USER_AGENT ?? "Normeteo/1.0 (+https://51pogoda.ru; contact@51pogoda.ru)";

/* Как часто пересобирать серверный кэш прогноза, секунды (1 час = 10 юзеров делят один кэш) */
export const FORECAST_REVALIDATE = 3600;
