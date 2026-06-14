export interface DaylightInfo {
  polarDay: boolean;
  polarNight: boolean;
  /* Долгота светового дня в часах (24 при полярном дне, 0 при полярной ночи) */
  dayLengthHours: number;
  dayLengthLabel: string;
  /* Максимальная высота солнца над горизонтом в полдень, градусы */
  maxAltitude: number;
}

const SUN_ANGLE = -0.833; /* стандартная поправка на рефракцию и радиус диска */

/*
  Упрощённый расчёт по модели NOAA: склонение солнца от дня года и
  часовой угол восхода. На широтах Заполярья честно ловит полярный
  день/ночь, когда косинус часового угла выходит за пределы [-1; 1].
*/
export function getDaylight(lat: number, date: Date): DaylightInfo {
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
    return { polarDay: true, polarNight: false, dayLengthHours: 24, dayLengthLabel: "24 ч 00 м", maxAltitude };
  }

  if (cosH >= 1) {
    return { polarDay: false, polarNight: true, dayLengthHours: 0, dayLengthLabel: "0 ч 00 м", maxAltitude: Math.max(0, maxAltitude) };
  }

  const hourAngle = toDeg(Math.acos(cosH));
  const dayLengthHours = (2 * hourAngle) / 15;
  const h = Math.floor(dayLengthHours);
  const min = Math.round((dayLengthHours - h) * 60);

  return {
    polarDay: false,
    polarNight: false,
    dayLengthHours,
    dayLengthLabel: `${h} ч ${String(min).padStart(2, "0")} м`,
    maxAltitude,
  };
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
