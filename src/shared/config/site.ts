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
  copyrightYear: new Date().getFullYear(),
} as const;

/* Контакт обязателен в User-Agent по условиям Terms of Service api.met.no */
export const MET_USER_AGENT =
  process.env.MET_USER_AGENT ?? "Normeteo/1.0 (+https://51pogoda.ru; contact@51pogoda.ru)";

/* Как часто пересобирать серверный кэш прогноза, секунды */
export const FORECAST_REVALIDATE = 3600;

/* Отдельный TTL для консенсуса Open-Meteo (6 часов). Данные ансамбля моделей
   обновляются реже, чем основной прогноз MET, и не требуют почасовой свежести —
   это вспомогательный сигнал надёжности. Уменьшает обращения к прокси и SSR-латентность. */
export const CONSENSUS_REVALIDATE = 6 * 3600;

/* Блок РСЯ на страницах точек — между главным блоком и метеограммой.
   Пустая строка отключает рекламу, не трогая разметку страницы. */
export const YANDEX_RTB_CITY_BLOCK: string = "R-A-19535428-1";

/* Флаг dev-среда: запрещает индексацию (X-Robots-Tag, robots.txt Disallow, meta noindex).
   Задаётся ТОЛЬКО в .env dev-сервера (gitignored). На проде флаг не установлен →
   случайный merge dev→main не может сделать прод неиндексируемым. */
export const NOINDEX = process.env.NOINDEX === "true";
