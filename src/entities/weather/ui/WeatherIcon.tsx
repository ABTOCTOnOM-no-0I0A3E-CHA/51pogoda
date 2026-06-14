import type { ReactNode } from "react";
import type { WeatherCondition } from "../model/types";

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
}

const SUN = "#f4a72c";
const CL = "#c4cfda";
const CLD = "#a6b3c0";
const RN = "#3f8bd6";
const FL = "#9bb4cc";

/* Перенос SVG-генератора иконок из макета Claude Design без изменений геометрии */
export function WeatherIcon({ condition, size = 48 }: WeatherIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-hidden>
      {draw(condition)}
    </svg>
  );
}

/* Группируем примитивы в <g>, чтобы ключи b/c1/c2 не сталкивались между фигурами */
function group(key: string, children: ReactNode[]): ReactNode {
  return <g key={key}>{children}</g>;
}

function draw(condition: WeatherCondition): ReactNode {
  switch (condition) {
    case "clear":
      return sun(32, 32, 13, true);
    case "partly":
      return [group("sun", sun(23, 23, 9, true)), group("cloud", cloud(36, 39, 1, CL))];
    case "cloudy":
      return cloud(32, 33, 1.05, CL);
    case "overcast":
      return [group("back", cloud(25, 28, 0.82, CLD)), group("front", cloud(36, 36, 1, CL))];
    case "lightrain":
      return [group("cloud", cloud(32, 28, 1, CL)), group("drops", drops(32, 46, 2))];
    case "rain":
      return [group("cloud", cloud(32, 26, 1, CLD)), group("drops", drops(32, 44, 3))];
    case "snow":
      return [group("cloud", cloud(32, 26, 1, CL)), group("flakes", flakes(32, 44))];
    case "fog":
      return [
        group("cloud", cloud(32, 25, 1, CL)),
        <line key="g1" x1={16} y1={44} x2={48} y2={44} stroke={CLD} strokeWidth={3} strokeLinecap="round" />,
        <line key="g2" x1={20} y1={52} x2={44} y2={52} stroke={CLD} strokeWidth={3} strokeLinecap="round" />,
      ];
    default:
      return sun(32, 32, 13, true);
  }
}

function sun(cx: number, cy: number, r: number, rays: boolean): ReactNode[] {
  const nodes: ReactNode[] = [<circle key="s" cx={cx} cy={cy} r={r} fill={SUN} />];

  if (rays) {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      nodes.push(
        <line
          key={`r${i}`}
          x1={cx + Math.cos(a) * (r + 4)}
          y1={cy + Math.sin(a) * (r + 4)}
          x2={cx + Math.cos(a) * (r + 9)}
          y2={cy + Math.sin(a) * (r + 9)}
          stroke={SUN}
          strokeWidth={3.4}
          strokeLinecap="round"
        />,
      );
    }
  }

  return nodes;
}

function cloud(cx: number, cy: number, sc: number, fill: string): ReactNode[] {
  return [
    <rect key="b" x={cx - 19 * sc} y={cy - 1 * sc} width={38 * sc} height={15 * sc} rx={7.5 * sc} fill={fill} />,
    <circle key="c1" cx={cx - 9 * sc} cy={cy - 1 * sc} r={9 * sc} fill={fill} />,
    <circle key="c2" cx={cx + 9 * sc} cy={cy - 3 * sc} r={11 * sc} fill={fill} />,
    <circle key="c3" cx={cx + 1 * sc} cy={cy - 9 * sc} r={10 * sc} fill={fill} />,
  ];
}

function drops(cx: number, cy: number, n: number): ReactNode[] {
  return [-10, 0, 10].slice(0, n).map((dx, i) => (
    <line key={`d${i}`} x1={cx + dx} y1={cy} x2={cx + dx - 3} y2={cy + 9} stroke={RN} strokeWidth={3} strokeLinecap="round" />
  ));
}

function flakes(cx: number, cy: number): ReactNode[] {
  return [-10, 0, 10].map((dx, i) => <circle key={`f${i}`} cx={cx + dx} cy={cy + 5} r={2.6} fill={FL} />);
}
