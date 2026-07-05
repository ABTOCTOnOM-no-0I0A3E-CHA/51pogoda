import type { Metadata } from "next";
import { cookies } from "next/headers";
import { HomePage } from "@/views/home";
import { JsonLd } from "@/shared/ui";
import { SITE } from "@/shared/config/site";
import { CAPITAL_SLUG, getCapital } from "@/entities/city";
import { getCityMerged } from "@/entities/city/lib/registry";
import { getPreferredSlug, parseRecent, COOKIE_VISITS, COOKIE_RECENT, COOKIE_PINNED } from "@/shared/lib/visit-cookie";

/* Страница динамическая — personalised по cookie. Погода кешируется в unstable_cache. */
export const dynamic = "force-dynamic";

/*
  Canonical главной — условный, по тому же городу, что в hero. Бот без cookie
  всегда видит столицу (Мурманск) → canonical указывает на /murmansk, избегая
  каннибализации запроса «погода Мурманск» между / и /murmansk. Если пользователь
  закрепил/часто смотрит другой город — canonical ведёт на его страницу.
*/
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const visitsRaw = cookieStore.get(COOKIE_VISITS)?.value ?? "";
  const pinnedSlug = cookieStore.get(COOKIE_PINNED)?.value ?? null;

  const preferredSlug = getPreferredSlug(visitsRaw, CAPITAL_SLUG);
  const pinnedCity = pinnedSlug ? getCityMerged(pinnedSlug) : null;
  const autoCity = preferredSlug ? getCityMerged(preferredSlug) : null;
  const heroSlug = (pinnedCity ?? autoCity ?? getCapital()).slug;

  return {
    alternates: { canonical: `/${heroSlug}` },
  };
}

export default async function Page() {
  const cookieStore = await cookies();
  const visitsRaw = cookieStore.get(COOKIE_VISITS)?.value ?? "";
  const recentRaw = cookieStore.get(COOKIE_RECENT)?.value ?? "";

  const preferredSlug = getPreferredSlug(visitsRaw, CAPITAL_SLUG);
  const pinnedSlug = cookieStore.get(COOKIE_PINNED)?.value ?? null;
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
      <HomePage preferredSlug={preferredSlug} pinnedSlug={pinnedSlug} recentSlugs={recentSlugs} />
    </>
  );
}
