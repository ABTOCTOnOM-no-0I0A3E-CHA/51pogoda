import { renderOg, OG_SIZE } from "@/shared/og/render";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Норметео — погода в Мурманске и Мурманской области";

export default function Image() {
  return renderOg({
    title: "Норметео",
    subtitle: "Мурманск и область · прогноз по MET Norway",
    tag: "Прогноз погоды",
  });
}
