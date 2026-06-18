/*
  Цвет температуры в стиле pogoda51.ru: от фиолетово-синего мороза через
  голубой ноль к зелёно-жёлтому теплу и красной жаре. Линейная интерполяция
  между опорными точками — плавный переход без резких скачков.
*/

type RGB = [number, number, number];

const STOPS: [number, RGB][] = [
  [-30, [124, 58, 173]], /* фиолетовый */
  [-20, [54, 79, 162]], /* тёмно-синий */
  [-10, [44, 122, 198]], /* синий */
  [-2, [70, 170, 226]], /* голубой */
  [0, [120, 190, 210]], /* нейтрально-голубой ноль */
  [6, [78, 178, 96]], /* зелёный */
  [12, [150, 196, 60]], /* жёлто-зелёный */
  [18, [240, 184, 30]], /* жёлтый */
  [24, [243, 140, 36]], /* оранжевый */
  [30, [228, 70, 40]], /* красный */
  [38, [165, 26, 30]], /* тёмно-красный */
];

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/* Hex-цвет, соответствующий температуре в °C */
export function tempColor(temp: number): string {
  const first = STOPS[0]!;
  const last = STOPS[STOPS.length - 1]!;
  if (temp <= first[0]) return rgb(first[1]);
  if (temp >= last[0]) return rgb(last[1]);

  for (let i = 0; i < STOPS.length - 1; i++) {
    const [t0, c0] = STOPS[i]!;
    const [t1, c1] = STOPS[i + 1]!;
    if (temp >= t0 && temp <= t1) {
      const f = (temp - t0) / (t1 - t0);
      return rgb([lerp(c0[0], c1[0], f), lerp(c0[1], c1[1], f), lerp(c0[2], c1[2], f)]);
    }
  }
  return rgb(last[1]);
}

function rgb([r, g, b]: RGB): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
