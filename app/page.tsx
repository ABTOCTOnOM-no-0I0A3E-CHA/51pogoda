import { HomePage } from "@/views/home";
import { JsonLd } from "@/shared/ui";
import { SITE } from "@/shared/config/site";

/* Серверный кэш главной обновляется раз в полчаса (см. FORECAST_REVALIDATE) */
export const revalidate = 1800;

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "ru-RU",
    publisher: { "@type": "Organization", name: SITE.name },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomePage />
    </>
  );
}
