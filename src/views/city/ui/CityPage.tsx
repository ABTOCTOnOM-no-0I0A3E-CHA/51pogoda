import { Suspense } from "react";
import Link from "next/link";
import type { City } from "@/entities/city";
import { getRegionCities } from "@/entities/city";
import { getCityWeather, buildSummary, type CityWeather } from "@/entities/weather";
import { getDaylight, type DaylightInfo } from "@/shared/lib/daylight";
import { SITE } from "@/shared/config/site";
import { CityHero } from "@/widgets/city-hero";
import { AiSummary, AiSummarySkeleton } from "@/widgets/ai-summary";
import { CityMeteogram } from "@/widgets/meteogram";
import { CurrentParams } from "@/widgets/current-params";
import { SunCard } from "@/widgets/sun-card";
import { HourlyTable } from "@/widgets/hourly-table";
import { DailyForecast } from "@/widgets/daily-forecast";
import { ConsensusClient } from "@/widgets/consensus";
import { OtherCitiesCta } from "@/widgets/other-cities-cta";
import { SiteFooter } from "@/widgets/site-footer";
import { CityHeroSkeleton, CityDetailsSkeleton } from "./skeletons";

export function CityPage({ city }: { city: City }) {
  const weatherPromise = getCityWeather(city);
  const daylight = getDaylight(city.lat, new Date(), city.lon);

  return (
    <div className="content-padding" style={{ maxWidth: 1060, margin: "0 auto", padding: "24px 24px 28px" }}>
      <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6d7f8e", marginBottom: 16 }}>
        <Link href="/" style={{ color: "#0b5cad", fontWeight: 600 }}>Главная</Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 6l6 6-6 6" stroke="#b6c1cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontWeight: 600, color: "#5a6b7b" }}>{city.name}</span>
      </nav>

      <div className="hero-grid full-bleed-mobile" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        <Suspense fallback={<CityHeroSkeleton />}>
          <HeroBlock city={city} weatherPromise={weatherPromise} daylight={daylight} />
        </Suspense>
        <Suspense fallback={<AiSummarySkeleton />}>
          <SummaryBlock city={city} weatherPromise={weatherPromise} daylight={daylight} />
        </Suspense>
      </div>

      <CityMeteogram city={city} />

      <Suspense fallback={<CityDetailsSkeleton />}>
        <WeatherBlocks city={city} weatherPromise={weatherPromise} daylight={daylight} />
      </Suspense>

      <div style={{ marginTop: 24 }}>
        <ConsensusClient slug={city.slug} />
      </div>

      <OtherCitiesCta />
      <CityCrossLinks city={city} />
      <SeoBlock city={city} />
      <SiteFooter marginTop={32} />
    </div>
  );
}

async function HeroBlock({ city, weatherPromise, daylight }: { city: City; weatherPromise: Promise<CityWeather>; daylight: DaylightInfo }) {
  const weather = await weatherPromise;
  return <CityHero city={city} weather={weather} daylight={daylight} />;
}

async function SummaryBlock({ city, weatherPromise, daylight }: { city: City; weatherPromise: Promise<CityWeather>; daylight: DaylightInfo }) {
  const weather = await weatherPromise;
  return <AiSummary summary={buildSummary(city, weather, daylight)} />;
}

async function WeatherBlocks({ city, weatherPromise, daylight }: { city: City; weatherPromise: Promise<CityWeather>; daylight: DaylightInfo }) {
  const weather = await weatherPromise;
  return (
    <>
      <CurrentParams current={weather.current} />
      <SunCard city={city} daylight={daylight} />
      <HourlyTable hours={weather.hours} />
      <DailyForecast days={weather.days} />
    </>
  );
}

/* Список городов области для внутренней перелинковки */
function CityCrossLinks({ city }: { city: City }) {
  const others = getRegionCities().filter((c) => c.slug !== city.slug);
  if (others.length === 0) return null;
  return (
    <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid #dfe5ec" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
        Прогноз погоды в городах Мурманской области:
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", fontSize: 13 }}>
        {others.map((c) => (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            style={{ color: "#0b5cad", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            Погода в {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* Уникальный SEO-текст для каждой точки */
function SeoBlock({ city }: { city: City }) {
  const polar = city.lat > 66.5 ? "за Полярным кругом" : "в Мурманской области";
  const prep = city.kind === "маяк" || city.kind === "КПП" || city.kind === "станция" || city.kind === "турбаза" || city.kind === "база отдыха" ? "на" : "в";
  return (
    <p style={{ margin: "18px 0 0", lineHeight: 1.6, fontSize: 13, color: "#6d7f8e" }}>
      Норвежский сайт погоды {SITE.name}: точный прогноз {prep} {city.name} — {city.kind} {polar}.
      Данные норвежского метеорологического института MET Norway (yr.no): температура воздуха,
      скорость ветра, атмосферное давление, осадки, метеограмма на 2 суток и прогноз на 10 дней.
    </p>
  );
}


