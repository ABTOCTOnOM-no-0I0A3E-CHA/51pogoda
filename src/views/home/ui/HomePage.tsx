import { Suspense } from "react";
import Link from "next/link";
import { getCapital } from "@/entities/city";
import type { City } from "@/entities/city";
import { getAllCities, getRegionCitiesMerged, getCityMerged } from "@/entities/city/lib/registry";
import { getCityWeather, getCitiesWeather, getAiSummary } from "@/entities/weather";
import { getDaylight } from "@/shared/lib/daylight";
import { HomeHero } from "@/widgets/home-hero";
import { AiSummary, AiSummarySkeleton } from "@/widgets/ai-summary";
import { CityMeteogram, MeteoSkeleton } from "@/widgets/meteogram";
import { CitiesGrid } from "@/widgets/cities-grid";
import { RainMap } from "@/widgets/rain-map";
import { LocationsCatalog } from "@/widgets/locations-catalog";
import { SiteFooter } from "@/widgets/site-footer";
import { HeroSkeleton, CitiesGridSkeleton } from "./skeletons";

interface HomePageProps {
  preferredSlug?: string | null;
  recentSlugs?: string[];
}

export function HomePage({ preferredSlug, recentSlugs = [] }: HomePageProps) {
  const capital = getCapital();
  const heroCity = (preferredSlug ? getCityMerged(preferredSlug) : null) ?? capital;

  const recentCities = recentSlugs
    .map((s) => getCityMerged(s))
    .filter((c): c is City => c != null);

  return (
    <div className="content-padding" style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 24px 80px" }}>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroBlock city={heroCity} />
      </Suspense>

      <div className="full-bleed-mobile" style={{ marginTop: 16 }}>
        <Suspense fallback={<AiSummarySkeleton />}>
          <AiBlock city={heroCity} />
        </Suspense>
      </div>

      <Suspense fallback={<MeteoSkeleton />}>
        <MeteoBlock city={heroCity} />
      </Suspense>

      <div style={{ marginTop: 28 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12, gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-.02em" }}>Карта осадков</h2>
          <span style={{ fontSize: 13, color: "#8a98a6", fontWeight: 500 }}>Windy</span>
        </div>
        <div className="full-bleed-mobile" style={{ borderRadius: 14, overflow: "hidden" }}>
          <RainMap height={360} />
        </div>
      </div>

      {recentCities.length > 0 && (
        <div style={{ marginTop: 38 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800, letterSpacing: "-.02em" }}>Недавно смотрели</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {recentCities.map((city) => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: "#eef4fb",
                  border: "1px solid #c6daf0",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0b5cad",
                }}
              >
                {city.name}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M9 6l6 6-6 6" stroke="#0b5cad" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Suspense fallback={<CitiesGridSkeleton />}>
        <CitiesBlock recentSlugs={recentSlugs} />
      </Suspense>

      <LocationsCatalog items={getAllCities()} excludeKinds={["город"]} id="vse-tochki" />
      <SiteFooter />
    </div>
  );
}

/* ---- стримящиеся блоки: оболочка отдаётся сразу, данные подтекают ---- */

async function HeroBlock({ city }: { city: City }) {
  const daylight = getDaylight(city.lat, new Date());
  try {
    const weather = await getCityWeather(city);
    return <HomeHero city={city} weather={weather} daylight={daylight} />;
  } catch {
    return <HeroSkeleton />;
  }
}

async function AiBlock({ city }: { city: City }) {
  let weather;
  try {
    weather = await getCityWeather(city);
  } catch {
    return null;
  }
  const daylight = getDaylight(city.lat, new Date());
  const summary = await getAiSummary(city, weather, daylight);
  return <AiSummary summary={summary} />;
}

async function MeteoBlock({ city }: { city: City }) {
  /* Метеограмма yr.no грузится по yrId независимо от MET; hours — лишь для запасного графика */
  let hours: Awaited<ReturnType<typeof getCityWeather>>["hours"] = [];
  try {
    hours = (await getCityWeather(city)).hours;
  } catch {
    /* внешняя метеограмма всё равно отрисуется */
  }
  return <CityMeteogram city={city} hours={hours} />;
}

async function CitiesBlock({ recentSlugs }: { recentSlugs: string[] }) {
  const items = await getCitiesWeather(getRegionCitiesMerged());
  return <CitiesGrid items={items} recentSlugs={recentSlugs} />;
}
