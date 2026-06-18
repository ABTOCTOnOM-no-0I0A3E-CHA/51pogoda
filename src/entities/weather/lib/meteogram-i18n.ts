/*
  Перевод официальной метеограммы yr.no на русский. Работаем с SVG как с
  текстом в серверном прокси: подменяем содержимое ТОЛЬКО внутри <text>-узлов,
  не трогая координаты, классы и стили. Текст у yr.no лежит целыми строками
  (без <tspan> по буквам), поэтому замена надёжна.
*/

const LABELS: Record<string, string> = {
  "Temperature °C": "Температура, °C",
  "Precipitation mm": "Осадки, мм",
  "Max precip. mm": "Макс. осадки, мм",
  "Wind m/s": "Ветер, м/с",
  "Wind gust m/s": "Порывы, м/с",
  /* «Served by» оставляем кредит институтам (NRK / Met institutt — логотипы) */
  "Served by": "Данные:",
};

/* yr.no сокращает дни нестандартно (Thur., Tues.) — ключ по нижнему регистру без точки */
const WEEKDAYS: Record<string, string> = {
  mon: "Пн", tue: "Вт", tues: "Вт", wed: "Ср", thu: "Чт", thur: "Чт", thurs: "Чт",
  fri: "Пт", sat: "Сб", sun: "Вс",
};

/* полные и трёхбуквенные названия месяцев (на узких метеограммах бывают сокращения) */
const MONTHS: Record<string, string> = {
  january: "января", jan: "января", february: "февраля", feb: "февраля",
  march: "марта", mar: "марта", april: "апреля", apr: "апреля",
  may: "мая", june: "июня", jun: "июня", july: "июля", jul: "июля",
  august: "августа", aug: "августа", september: "сентября", sep: "сентября", sept: "сентября",
  october: "октября", oct: "октября", november: "ноября", nov: "ноября",
  december: "декабря", dec: "декабря",
};

const TITLE_PREFIX = "Weather forecast for";
const DATE_RE = /^([A-Za-z]+)\.?\s+(\d{1,2})\s+([A-Za-z]+)\.?$/;

const TEXT_NODE_RE = /(<text\b[^>]*>)([\s\S]*?)(<\/text>)/g;

export function translateMeteogramSvg(svg: string, cityName: string): string {
  const city = escapeXml(cityName.trim());

  return svg.replace(TEXT_NODE_RE, (full, open: string, content: string, close: string) => {
    const ru = translateLabel(normalize(content), city);
    return ru === null ? full : `${open}${ru}${close}`;
  });
}

function translateLabel(key: string, city: string): string | null {
  if (!key) return null;

  if (key in LABELS) return LABELS[key]!;

  if (key.startsWith(TITLE_PREFIX)) {
    return city ? `Прогноз погоды · ${city}` : "Прогноз погоды";
  }

  const date = DATE_RE.exec(key);
  if (date) {
    const weekday = WEEKDAYS[date[1]!.toLowerCase()];
    const month = MONTHS[date[3]!.toLowerCase()];
    if (weekday && month) return `${weekday}, ${Number(date[2])} ${month}`;
  }

  return null;
}

function normalize(content: string): string {
  return content.replace(/\s+/g, " ").trim();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
