import type { HourPoint } from "../model/types";

export interface ChartGeometry {
  viewBox: string;
  line: string;
  area: string;
  bars: { x: number; y: number; w: number; h: number }[];
}

export interface ChartConfig {
  width: number;
  height: number;
  padT: number;
  padB: number;
  padL: number;
  padR: number;
  barMax: number;
}

/* Геометрия температурной кривой и столбиков осадков (перенос buildChart из макета) */
export function buildChart(hours: HourPoint[], config: ChartConfig): ChartGeometry {
  const { width: W, height: H, padT, padB, padL, padR, barMax } = config;

  const temps = hours.map((x) => x.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = max - min || 1;

  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = hours.length;

  const x = (i: number) => padL + innerW * (i / (n - 1));
  const y = (t: number) => padT + innerH * (1 - (t - min) / span);

  const points = hours.map((p, i) => `${x(i).toFixed(1)},${y(p.temp).toFixed(1)}`);
  const line = points.join(" ");
  const area = `M${x(0).toFixed(1)},${(H - padB).toFixed(1)} L${points.join(" L")} L${x(n - 1).toFixed(1)},${(H - padB).toFixed(1)} Z`;

  const maxPrecip = Math.max(0.5, ...hours.map((p) => p.precip || 0));
  const bw = (innerW / n) * 0.46;

  const bars = hours.map((p, i) => {
    const h = ((p.precip || 0) / maxPrecip) * barMax;
    return { x: Number((x(i) - bw / 2).toFixed(1)), w: Number(bw.toFixed(1)), h: Number(h.toFixed(1)), y: Number((H - padB - h).toFixed(1)) };
  });

  return { viewBox: `0 0 ${W} ${H}`, line, area, bars };
}
