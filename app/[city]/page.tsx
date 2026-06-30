import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITIES, type City } from "@/entities/city";
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

const KIND_LABEL: Record<string, string> = {
  "город": "в городе",
  "пгт": "в посёлке",
  "село": "в селе",
  "турбаза": "на турбазе",
  "база отдыха": "на базе отдыха",
  "рыболовный лагерь": "в рыболовном лагере",
  "КПП": "на КПП",
  "маяк": "на маяке",
  "аэропорт": "в аэропорту",
  "порт": "в порту",
  "станция": "на станции",
  "акватория": "в акватории",
};

function metaTitle(city: City): string {
  const base = city.kind === "город"
    ? `Погода в ${city.name}`
    : `Погода ${KIND_LABEL[city.kind] ?? "в"} ${city.name}`;
  return `${base} — норвежский сайт погоды, MET Norway`;
}

function metaDescription(city: City): string {
  const label = KIND_LABEL[city.kind] ?? "в";
  const polar = city.lat > 66.5
    ? "за Полярным кругом. "
    : "в Мурманской области. ";
  return `Прогноз погоды ${label} ${city.name}, ${polar}Температура, ветер, осадки, давление. Данные норвежского сайта MET Norway (yr.no), метеограмма на 2 суток и прогноз на 10 дней.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityMerged(slug);

  if (!city) return {};

  const title = metaTitle(city);
  const description = metaDescription(city);
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

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
      { "@type": "ListItem", position: 2, name: city.name, item: `${SITE.url}/${city.slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbLd} />
      <CityPage city={city} />
    </>
  );
}
