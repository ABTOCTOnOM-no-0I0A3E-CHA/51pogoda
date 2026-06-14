import Link from "next/link";
import type { City } from "@/entities/city";
import type { CityWeather } from "@/entities/weather";
import { WeatherIcon } from "@/entities/weather";
import { MeteogramImage, MeteoFallbackChart } from "@/widgets/meteogram";
import { PolarBadge } from "@/shared/ui";
import type { DaylightInfo } from "@/shared/lib/daylight";
import { signedTemp } from "@/shared/lib/format";

interface HomeHeroProps {
  city: City;
  weather: CityWeather;
  daylight: DaylightInfo;
}

export function HomeHero({ city, weather, daylight }: HomeHeroProps) {
  const { current, hours } = weather;
  const polar = daylight.polarDay ? "Полярный день" : daylight.polarNight ? "Полярная ночь" : null;

  return (
    <div
      style={{
        borderRadius: 24,
        overflow: "hidden",
        background: "linear-gradient(165deg,#c4e0f6 0%,#e2f0fb 50%,#f1f8fd 100%)",
        border: "1px solid #d3e4f2",
        boxShadow: "0 18px 50px rgba(20,33,43,.08)",
      }}
    >
      <div className="hero-padding" style={{ padding: "30px 34px 8px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, color: "#5a6b7b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>Главный город</div>
            <div className="hero-title" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", marginTop: 2 }}>{city.name}</div>
            <div style={{ fontSize: 13, color: "#5a6b7b", fontWeight: 500, marginTop: 1 }}>Мурманская область · сейчас {weather.updatedAt}</div>
          </div>
          {polar && <PolarBadge label={polar} />}
        </div>

        <div className="hero-temp-row" style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 10 }}>
          <div style={{ flex: "none" }}>
            <WeatherIcon condition={current.condition} size={96} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <span className="temp-big" style={{ fontSize: 92, fontWeight: 800, lineHeight: 0.84, letterSpacing: "-.04em" }}>{signedTemp(current.temp).replace("°", "")}</span>
            <span style={{ fontSize: 30, fontWeight: 600, marginTop: 10, color: "#41525f" }}>°C</span>
          </div>
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{current.conditionLabel}</div>
            <div style={{ fontSize: 15, color: "#5a6b7b", marginTop: 3 }}>
              Ощущается {signedTemp(current.feels)} · ветер {current.wind} м/с {current.windDir}
            </div>
          </div>
        </div>
      </div>

      <div className="hero-meteo-padding" style={{ padding: "6px 34px 26px" }}>
        <div style={{ padding: "4px 2px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#22303b" }}>Метеограмма на 2 суток</span>
            <span style={{ fontSize: 12, color: "#5a6b7b" }}>yr.no / MET&nbsp;Norway</span>
          </div>

          <div className="home-meteo">
            <MeteogramImage
              yrId={city.yrId}
              alt={`Метеограмма ${city.name} — yr.no`}
              imgStyle={{ width: "100%", height: "auto", borderRadius: 10 }}
              fallback={<MeteoFallbackChart hours={hours} variant="home" />}
            />
          </div>
        </div>

        <Link
          href={`/${city.slug}`}
          className="btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            marginTop: 16,
            background: "#0b5cad",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            padding: 15,
            borderRadius: 13,
            transition: "background .15s",
          }}
        >
          Подробный прогноз по {city.name === "Мурманск" ? "Мурманску" : city.name}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
