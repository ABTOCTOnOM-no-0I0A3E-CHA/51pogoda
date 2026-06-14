import type { HourPoint } from "../model/types";
import { buildChart, type ChartConfig } from "../lib/chart";

interface TempChartProps {
  hours: HourPoint[];
  gradientId: string;
  config: ChartConfig;
  barFill: string;
  height: number;
}

/* SVG-кривая температуры с заливкой и столбиками осадков */
export function TempChart({ hours, gradientId, config, barFill, height }: TempChartProps) {
  const chart = buildChart(hours, config);

  return (
    <svg width="100%" viewBox={chart.viewBox} preserveAspectRatio="none" style={{ display: "block", height }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b5cad" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0b5cad" stopOpacity="0" />
        </linearGradient>
      </defs>

      {chart.bars.map((bar, i) => (
        <rect key={i} x={bar.x} y={bar.y} width={bar.w} height={bar.h} rx={2} fill={barFill} />
      ))}

      <path d={chart.area} fill={`url(#${gradientId})`} />
      <polyline
        points={chart.line}
        fill="none"
        stroke="#0b5cad"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
