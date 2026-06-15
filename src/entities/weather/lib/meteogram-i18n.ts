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

const WEEKDAYS: Record<string, string> = {
  Mon: "Пн", Tue: "Вт", Wed: "Ср", Thu: "Чт", Fri: "Пт", Sat: "Сб", Sun: "Вс",
};

const MONTHS: Record<string, string> = {
  January: "января", February: "февраля", March: "марта", April: "апреля",
  May: "мая", June: "июня", July: "июля", August: "августа",
  September: "сентября", October: "октября", November: "ноября", December: "декабря",
};

const TITLE_PREFIX = "Weather forecast for";
const DATE_RE = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\.?\s+(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\.?$/;

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
    return `${WEEKDAYS[date[1]!]}, ${Number(date[2])} ${MONTHS[date[3]!]}`;
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
