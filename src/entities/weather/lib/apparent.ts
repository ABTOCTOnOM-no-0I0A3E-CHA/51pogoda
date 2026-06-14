/*
  Ощущаемая температура по австралийской модели Apparent Temperature:
  учитывает давление водяного пара (влажность) и охлаждение ветром.
  Для Заполярья даёт честную «минусовую» поправку при сыром ветре.
*/
export function apparentTemperature(tempC: number, windMs: number, humidity: number): number {
  const e = (humidity / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  const at = tempC + 0.33 * e - 0.7 * windMs - 4.0;
  return Math.round(at);
}

/* Грубая оценка видимости (км) — MET её не отдаёт напрямую */
export function estimateVisibility(condition: string, fogFraction: number): number {
  if (fogFraction > 40 || condition === "fog") return 1;
  if (condition === "rain") return 8;
  if (condition === "snow") return 4;
  if (condition === "lightrain") return 12;
  return 20;
}

export function visibilityLabel(km: number): string {
  if (km >= 20) return "отличная";
  if (km >= 10) return "хорошая";
  if (km >= 4) return "умеренная";
  return "плохая";
}

export function uvLabel(uv: number): string {
  if (uv <= 2) return "низкий";
  if (uv <= 5) return "умеренный";
  if (uv <= 7) return "высокий";
  if (uv <= 10) return "очень высокий";
  return "экстремальный";
}

export function humidityLabel(humidity: number): string {
  if (humidity >= 80) return "высокая";
  if (humidity >= 55) return "умеренная";
  return "низкая";
}
