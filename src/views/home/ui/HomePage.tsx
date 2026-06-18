import { Suspense } from "react";
import Link from "next/link";
import { getCapital } from "@/entities/city";
import type { City } from "@/entities/city";
import { getAllCities, getRegionCitiesMerged, getCityMerged, getCustomCities } from "@/entities/city/lib/registry";
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
  pinnedSlug?: string | null;
  recentSlugs?: string[];
}

export function HomePage({ preferredSlug, pinnedSlug, recentSlugs = [] }: HomePageProps) {
  const capital = getCapital();
  /* ручной выбор главнее всего; иначе популярный по визитам; иначе столица */
  const autoCity = preferredSlug ? getCityMerged(preferredSlug) : null;
  const pinnedCity = pinnedSlug ? getCityMerged(pinnedSlug) : null;
  const heroCity = pinnedCity ?? autoCity ?? capital;
  const heroPinned = pinnedCity != null;
  const pickerExtra = getCustomCities();

  const recentCities = recentSlugs
    .map((s) => getCityMerged(s))
    .filter((c): c is City => c != null);

  return (
    <div className="content-padding" style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 24px 28px" }}>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroBlock city={heroCity} pinned={heroPinned} pickerExtra={pickerExtra} />
      </Suspense>

      <Suspense fallback={<MeteoSkeleton />}>
        <MeteoBlock city={heroCity} />
      </Suspense>

      <div className="home-summary-row" style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "stretch" }}>
        <div className="full-bleed-mobile" style={{ flex: 1, minWidth: 0 }}>
          <Suspense fallback={<AiSummarySkeleton />}>
            <AiBlock city={heroCity} />
          </Suspense>
        </div>

        <div className="home-rainmap" style={{ flex: "none", width: 380, display: "flex", flexDirection: "column" }}>
          <div className="home-rainmap-box full-bleed-mobile" style={{ width: "100%", borderRadius: 14, overflow: "hidden", border: "1px solid #d4dce5" }}>
            <RainMap />
          </div>
        </div>
      </div>

      {recentCities.length > 0 && (
        <div style={{ marginTop: 32 }}>
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

async function HeroBlock({ city, pinned, pickerExtra }: { city: City; pinned: boolean; pickerExtra: City[] }) {
  const daylight = getDaylight(city.lat, new Date(), city.lon);
  try {
    const weather = await getCityWeather(city);
    return <HomeHero city={city} weather={weather} daylight={daylight} pinned={pinned} pickerExtra={pickerExtra} />;
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
  const daylight = getDaylight(city.lat, new Date(), city.lon);
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
