import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITIES } from "@/entities/city";
import { getCityMerged } from "@/entities/city/lib/registry";
import { CityPage } from "@/views/city";
import { JsonLd } from "@/shared/ui";
import { SITE } from "@/shared/config/site";

export const revalidate = 1800;
/* Города пререндерим на сборке, остальные локации — по требованию + ISR */
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ city: string }>;
}

export function generateStaticParams() {
  return CITIES.filter((c) => c.kind === "город").map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityMerged(slug);

  if (!city) return {};

  const title = `Погода в ${city.name === "Мурманск" ? "Мурманске" : city.name}`;
  const description = `Подробный прогноз погоды в ${city.name}, Мурманская область: температура, ветер, осадки, метеограмма на 2 суток и прогноз на 10 дней по данным MET Norway (yr.no).`;
  const canonical = `/${city.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: SITE.locale,
      siteName: SITE.name,
      title: `${title} · ${SITE.name}`,
      description,
      url: `${SITE.url}${canonical}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { city: slug } = await params;
  const city = getCityMerged(slug);

  if (!city) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: city.name,
    address: { "@type": "PostalAddress", addressRegion: "Мурманская область", addressCountry: "RU" },
    geo: { "@type": "GeoCoordinates", latitude: city.lat, longitude: city.lon },
    url: `${SITE.url}/${city.slug}`,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <CityPage city={city} />
    </>
  );
}
