const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export const MURMANSK_TZ = "Europe/Moscow";

/* Знаковая температура: +14°, 0°, −3° (минус — типографский, не дефис) */
export function signedTemp(value: number): string {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}°`;
  if (rounded < 0) return `−${Math.abs(rounded)}°`;
  return "0°";
}

/* Осадки: 0,3 мм — запятая как десятичный разделитель, пусто при нуле */
export function precipLabel(mm: number): string {
  if (!mm || mm <= 0) return "";
  return `${mm.toFixed(1).replace(".", ",")} мм`;
}

/* «Сб, 14 июня» по часовому поясу Мурманска */
export function headerDate(date: Date): string {
  const parts = zonedParts(date);
  return `${WEEKDAYS[parts.weekday]}, ${parts.day} ${MONTHS_GEN[parts.month]}`;
}

/* «14:00» */
export function hhmm(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: MURMANSK_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function weekdayShort(date: Date): string {
  return WEEKDAYS[zonedParts(date).weekday] ?? "";
}

/* «14 июня» */
export function dayMonthLong(date: Date): string {
  const p = zonedParts(date);
  return `${p.day} ${MONTHS_GEN[p.month]}`;
}

/* «14.06» */
export function dayMonth(date: Date): string {
  const p = zonedParts(date);
  return `${String(p.day).padStart(2, "0")}.${String(p.month + 1).padStart(2, "0")}`;
}

/* Ключ календарного дня в TZ Мурманска для группировки прогноза */
export function dayKey(date: Date): string {
  const p = zonedParts(date);
  return `${p.year}-${p.month}-${p.day}`;
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  weekday: number;
}

function zonedParts(date: Date): ZonedParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: MURMANSK_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });

  const map = new Map(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const weekdayIndex = WEEKDAYS_EN.indexOf(map.get("weekday") ?? "");

  return {
    year: Number(map.get("year")),
    month: Number(map.get("month")) - 1,
    day: Number(map.get("day")),
    weekday: weekdayIndex < 0 ? 0 : weekdayIndex,
  };
}

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
