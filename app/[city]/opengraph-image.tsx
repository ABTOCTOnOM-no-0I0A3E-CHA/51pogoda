import { getCityMerged } from "@/entities/city/lib/registry";
import { renderOg, OG_SIZE } from "@/shared/og/render";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Прогноз погоды — Мурманская область";

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = getCityMerged(slug);
  const title = city ? city.name : "Погода Заполярья";

  return renderOg({
    title,
    subtitle: "Мурманская область · прогноз по MET Norway",
    tag: city?.kind,
  });
}
