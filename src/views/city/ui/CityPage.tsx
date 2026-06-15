import Link from "next/link";
import type { City } from "@/entities/city";
import { getCityWeather, getAiSummary } from "@/entities/weather";
import { getDaylight } from "@/shared/lib/daylight";
import { CityHero } from "@/widgets/city-hero";
import { AiSummary } from "@/widgets/ai-summary";
import { CityMeteogram } from "@/widgets/meteogram";
import { CurrentParams } from "@/widgets/current-params";
import { SunCard } from "@/widgets/sun-card";
import { HourlyTable } from "@/widgets/hourly-table";
import { DailyForecast } from "@/widgets/daily-forecast";
import { OtherCitiesCta } from "@/widgets/other-cities-cta";
import { SiteFooter } from "@/widgets/site-footer";

export async function CityPage({ city }: { city: City }) {
  const weather = await getCityWeather(city);
  const daylight = getDaylight(city.lat, new Date());
  const summary = await getAiSummary(city, weather, daylight);

  return (
    <div className="content-padding" style={{ maxWidth: 1060, margin: "0 auto", padding: "24px 24px 80px" }}>
      <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#8a98a6", marginBottom: 16 }}>
        <Link href="/" style={{ color: "#0b5cad", fontWeight: 600 }}>Главная</Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 6l6 6-6 6" stroke="#b6c1cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontWeight: 600, color: "#5a6b7b" }}>{city.name}</span>
      </nav>

      <div className="hero-grid full-bleed-mobile" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        <CityHero city={city} weather={weather} daylight={daylight} />
        <AiSummary summary={summary} />
      </div>

      <CityMeteogram city={city} hours={weather.hours} />
      <CurrentParams current={weather.current} />
      <SunCard city={city} daylight={daylight} />
      <HourlyTable hours={weather.hours} />
      <DailyForecast days={weather.days} />
      <OtherCitiesCta />

      <SiteFooter marginTop={32} />
    </div>
  );
}
