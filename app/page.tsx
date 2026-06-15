import { cookies } from "next/headers";
import { HomePage } from "@/views/home";
import { JsonLd } from "@/shared/ui";
import { SITE } from "@/shared/config/site";
import { CAPITAL_SLUG } from "@/entities/city";
import { getPreferredSlug, parseRecent, COOKIE_VISITS, COOKIE_RECENT } from "@/shared/lib/visit-cookie";

/* Страница динамическая — personalised по cookie. Погода кешируется в unstable_cache. */
export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  const visitsRaw = cookieStore.get(COOKIE_VISITS)?.value ?? "";
  const recentRaw = cookieStore.get(COOKIE_RECENT)?.value ?? "";

  const preferredSlug = getPreferredSlug(visitsRaw, CAPITAL_SLUG);
  const recentSlugs = parseRecent(recentRaw);

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
      <HomePage preferredSlug={preferredSlug} recentSlugs={recentSlugs} />
    </>
  );
}
