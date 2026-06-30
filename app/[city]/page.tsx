import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITIES } from "@/entities/city";
import { getCityMerged } from "@/entities/city/lib/registry";
import { CityPage } from "@/views/city";
import { JsonLd } from "@/shared/ui";
import { SITE } from "@/shared/config/site";

/* ISR: один HTML на час для всех пользователей. Данные в фоне обновятся. */
export const revalidate = 3600;
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

  const title = `Погода в ${city.name === "Мурманск" ? "Мурманске" : city.name} — норвежский сайт погоды, MET Norway`;
  const description = `Прогноз погоды в ${city.name}, Мурманская область: температура, ветер, осадки. Данные норвежского сайта MET Norway (yr.no), метеограмма на 2 суток.`;
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
      images: [{ url: `/${city.slug}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE.name}`,
      description,
      images: [`/${city.slug}/opengraph-image`],
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
