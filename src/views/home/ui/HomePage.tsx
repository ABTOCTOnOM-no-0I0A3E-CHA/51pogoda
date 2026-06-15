import Link from "next/link";
import { CITIES, getCapital, getRegionCities, getCity } from "@/entities/city";
import type { City } from "@/entities/city";
import { getCityWeather, getCitiesWeather, getAiSummary } from "@/entities/weather";
import { getDaylight } from "@/shared/lib/daylight";
import { HomeHero } from "@/widgets/home-hero";
import { AiSummary } from "@/widgets/ai-summary";
import { CityMeteogram } from "@/widgets/meteogram";
import { CitiesGrid } from "@/widgets/cities-grid";
import { RainMap } from "@/widgets/rain-map";
import { LocationsCatalog } from "@/widgets/locations-catalog";
import { SiteFooter } from "@/widgets/site-footer";

interface HomePageProps {
  preferredSlug?: string | null;
  recentSlugs?: string[];
}

export async function HomePage({ preferredSlug, recentSlugs = [] }: HomePageProps) {
  const capital = getCapital();
  const heroCity = (preferredSlug ? getCity(preferredSlug) : null) ?? capital;

  const [heroWeather, regionItems] = await Promise.all([
    getCityWeather(heroCity),
    getCitiesWeather(getRegionCities()),
  ]);

  const daylight = getDaylight(heroCity.lat, new Date());
  const summary = await getAiSummary(heroCity, heroWeather, daylight);

  return (
    <div className="content-padding" style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 24px 80px" }}>
      <HomeHero city={heroCity} weather={heroWeather} daylight={daylight} />
      <div className="full-bleed-mobile" style={{ marginTop: 16 }}>
        <AiSummary summary={summary} />
      </div>
      <CityMeteogram city={heroCity} hours={heroWeather.hours} />
      <div style={{ marginTop: 28 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12, gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-.02em" }}>Карта осадков</h2>
          <span style={{ fontSize: 13, color: "#8a98a6", fontWeight: 500 }}>Windy</span>
        </div>
        <div className="full-bleed-mobile" style={{ borderRadius: 14, overflow: "hidden" }}>
          <RainMap height={360} />
        </div>
      </div>
      {(() => {
        const recentCities = recentSlugs
          .map((s) => getCity(s))
          .filter((c): c is City => c != null);
        if (!recentCities.length) return null;
        return (
          <div style={{ marginTop: 38 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800, letterSpacing: "-.02em" }}>
              Недавно смотрели
            </h2>
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
        );
      })()}
      <CitiesGrid items={regionItems} recentSlugs={recentSlugs} />
      <LocationsCatalog items={CITIES} excludeKinds={["город"]} id="vse-tochki" />
      <SiteFooter />
    </div>
  );
}
