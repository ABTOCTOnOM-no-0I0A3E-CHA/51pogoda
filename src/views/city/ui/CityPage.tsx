import { Suspense } from "react";
import Link from "next/link";
import type { City } from "@/entities/city";
import { getCityWeather, getAiSummary } from "@/entities/weather";
import { getDaylight } from "@/shared/lib/daylight";
import { CityHero } from "@/widgets/city-hero";
import { AiSummary, AiSummarySkeleton } from "@/widgets/ai-summary";
import { CityMeteogram, MeteoSkeleton } from "@/widgets/meteogram";
import { CurrentParams } from "@/widgets/current-params";
import { SunCard } from "@/widgets/sun-card";
import { HourlyTable } from "@/widgets/hourly-table";
import { DailyForecast } from "@/widgets/daily-forecast";
import { OtherCitiesCta } from "@/widgets/other-cities-cta";
import { SiteFooter } from "@/widgets/site-footer";
import { CityHeroSkeleton, CityDetailsSkeleton } from "./skeletons";

export function CityPage({ city }: { city: City }) {
  return (
    <div className="content-padding" style={{ maxWidth: 1060, margin: "0 auto", padding: "24px 24px 28px" }}>
      <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#8a98a6", marginBottom: 16 }}>
        <Link href="/" style={{ color: "#0b5cad", fontWeight: 600 }}>Главная</Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 6l6 6-6 6" stroke="#b6c1cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontWeight: 600, color: "#5a6b7b" }}>{city.name}</span>
      </nav>

      <div className="hero-grid full-bleed-mobile" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        <Suspense fallback={<CityHeroSkeleton />}>
          <HeroBlock city={city} />
        </Suspense>
        <Suspense fallback={<AiSummarySkeleton />}>
          <AiBlock city={city} />
        </Suspense>
      </div>

      <Suspense fallback={<MeteoSkeleton />}>
        <MeteoBlock city={city} />
      </Suspense>

      <Suspense fallback={<CityDetailsSkeleton />}>
        <DetailsBlock city={city} />
      </Suspense>

      <OtherCitiesCta />
      <SiteFooter marginTop={32} />
    </div>
  );
}

async function HeroBlock({ city }: { city: City }) {
  const daylight = getDaylight(city.lat, new Date(), city.lon);
  try {
    const weather = await getCityWeather(city);
    return <CityHero city={city} weather={weather} daylight={daylight} />;
  } catch {
    return <HeroUnavailable city={city} />;
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
  let hours: Awaited<ReturnType<typeof getCityWeather>>["hours"] = [];
  try {
    hours = (await getCityWeather(city)).hours;
  } catch {
    /* внешняя метеограмма yr.no всё равно отрисуется */
  }
  return <CityMeteogram city={city} hours={hours} />;
}

async function DetailsBlock({ city }: { city: City }) {
  const daylight = getDaylight(city.lat, new Date(), city.lon);
  let weather;
  try {
    weather = await getCityWeather(city);
  } catch {
    return <SunCard city={city} daylight={daylight} />;
  }
  return (
    <>
      <CurrentParams current={weather.current} />
      <SunCard city={city} daylight={daylight} />
      <HourlyTable hours={weather.hours} />
      <DailyForecast days={weather.days} />
    </>
  );
}

/* Реальные данные недоступны — честное состояние вместо мока */
function HeroUnavailable({ city }: { city: City }) {
  return (
    <div style={{ borderRadius: 20, border: "1px solid #d3e4f2", background: "linear-gradient(160deg,#e8f1fb,#f4f9fd)", padding: "26px 28px" }}>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>{city.name}</div>
      <div style={{ fontSize: 15, color: "#5a6b7b", marginTop: 10 }}>
        Данные прогноза временно недоступны. Обновите страницу через минуту.
      </div>
    </div>
  );
}
