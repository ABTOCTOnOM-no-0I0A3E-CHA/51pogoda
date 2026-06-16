import { renderOg, OG_SIZE } from "@/shared/og/render";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Погода Заполярья — Мурманск и Мурманская область";

export default function Image() {
  return renderOg({
    title: "Погода Заполярья",
    subtitle: "Мурманск и область · прогноз по MET Norway",
    tag: "Прогноз погоды",
  });
}
