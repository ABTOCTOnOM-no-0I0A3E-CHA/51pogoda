import { hhmm } from "./format";

export interface DaylightInfo {
  polarDay: boolean;
  polarNight: boolean;
  /* Долгота светового дня в часах (24 при полярном дне, 0 при полярной ночи) */
  dayLengthHours: number;
  dayLengthLabel: string;
  /* Максимальная высота солнца над горизонтом в полдень, градусы */
  maxAltitude: number;
  /* Время восхода/захода (Europe/Moscow). null при полярном дне/ночи или без долготы */
  sunrise: string | null;
  sunset: string | null;
}

const SUN_ANGLE = -0.833; /* стандартная поправка на рефракцию и радиус диска */

/*
  Упрощённый расчёт по модели NOAA: склонение солнца от дня года и
  часовой угол восхода. На широтах Заполярья честно ловит полярный
  день/ночь, когда косинус часового угла выходит за пределы [-1; 1].
  При передаче долготы дополнительно считает время восхода/захода.
*/
export function getDaylight(lat: number, date: Date, lon?: number): DaylightInfo {
  const dayOfYear = getDayOfYear(date);
  const decl = solarDeclination(dayOfYear);

  const latR = toRad(lat);
  const declR = toRad(decl);
  const h0 = toRad(SUN_ANGLE);

  const cosH =
    (Math.sin(h0) - Math.sin(latR) * Math.sin(declR)) /
    (Math.cos(latR) * Math.cos(declR));

  const maxAltitude = Math.round(90 - Math.abs(lat - decl));

  if (cosH <= -1) {
    return { polarDay: true, polarNight: false, dayLengthHours: 24, dayLengthLabel: "24 ч 00 м", maxAltitude, sunrise: null, sunset: null };
  }

  if (cosH >= 1) {
    return { polarDay: false, polarNight: true, dayLengthHours: 0, dayLengthLabel: "0 ч 00 м", maxAltitude: Math.max(0, maxAltitude), sunrise: null, sunset: null };
  }

  const hourAngle = toDeg(Math.acos(cosH));
  const dayLengthHours = (2 * hourAngle) / 15;
  const h = Math.floor(dayLengthHours);
  const min = Math.round((dayLengthHours - h) * 60);

  let sunrise: string | null = null;
  let sunset: string | null = null;
  if (lon != null) {
    /* солнечный полдень в UTC с поправкой уравнения времени и долготы */
    const noonUtcH = 12 - lon / 15 - equationOfTime(dayOfYear) / 60;
    const halfH = hourAngle / 15;
    const base = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    sunrise = hhmm(new Date(base + (noonUtcH - halfH) * 3_600_000));
    sunset = hhmm(new Date(base + (noonUtcH + halfH) * 3_600_000));
  }

  return {
    polarDay: false,
    polarNight: false,
    dayLengthHours,
    dayLengthLabel: `${h} ч ${String(min).padStart(2, "0")} м`,
    maxAltitude,
    sunrise,
    sunset,
  };
}

/*
  Период полярного дня/ночи на данной широте в указанном году: сканируем
  год по дням и находим непрерывный интервал (для ночи он переходит через
  Новый год — обход по кольцу). null, если явления нет (южнее полярного круга).
*/
export function polarPeriod(
  lat: number,
  type: "day" | "night",
  year: number,
): { start: Date; end: Date } | null {
  const N = isLeap(year) ? 366 : 365;
  const flags: boolean[] = [];
  for (let d = 1; d <= N; d++) {
    const info = getDaylight(lat, new Date(Date.UTC(year, 0, d)));
    flags.push(type === "day" ? info.polarDay : info.polarNight);
  }

  if (!flags.includes(true)) return null;
  if (!flags.includes(false)) {
    return { start: dayToDate(year, 1), end: dayToDate(year, N) };
  }

  /* от любого «ложного» дня идём вперёд до начала непрерывного «истинного» прогона */
  const anchor = flags.indexOf(false);
  let i = (anchor + 1) % N;
  while (!flags[i]) i = (i + 1) % N;
  const start = i;
  while (flags[i]) i = (i + 1) % N;
  const end = (i - 1 + N) % N;

  return { start: dayToDate(year, start + 1), end: dayToDate(year, end + 1) };
}

function dayToDate(year: number, dayOfYear: number): Date {
  return new Date(Date.UTC(year, 0, dayOfYear));
}

function isLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/* Уравнение времени, минуты (приближение для солнечного полдня) */
function equationOfTime(dayOfYear: number): number {
  const b = toRad((360 / 365) * (dayOfYear - 81));
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function solarDeclination(dayOfYear: number): number {
  return 23.45 * Math.sin(toRad((360 / 365) * (dayOfYear - 81)));
}

function getDayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  return Math.floor(diff / 86_400_000);
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
