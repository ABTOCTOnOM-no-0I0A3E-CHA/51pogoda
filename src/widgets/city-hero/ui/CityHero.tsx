import type { City } from "@/entities/city";
import type { CityWeather } from "@/entities/weather";
import { WeatherIcon } from "@/entities/weather";
import { PolarBadge } from "@/shared/ui";
import type { DaylightInfo } from "@/shared/lib/daylight";
import { signedTemp } from "@/shared/lib/format";

interface CityHeroProps {
  city: City;
  weather: CityWeather;
  daylight: DaylightInfo;
}

export function CityHero({ city, weather, daylight }: CityHeroProps) {
  const { current, days } = weather;
  const today = days[0];
  const polar = daylight.polarDay ? "Полярный день" : daylight.polarNight ? "Полярная ночь" : null;
  const coords = `${city.lat.toFixed(2)}°N, ${city.lon.toFixed(2)}°E`;

  return (
    <div
      className="hero-hero-pad"
      style={{
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        background: "linear-gradient(160deg,#c4e0f6 0%,#e2f0fb 52%,#f1f8fd 100%)",
        border: "1px solid #d3e4f2",
        boxShadow: "0 2px 14px rgba(20,33,43,.06)",
        padding: "26px 28px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>{city.name}</div>
          <div style={{ fontSize: 13, color: "#5a6b7b", fontWeight: 500, marginTop: 2 }}>
            Мурманская область · {coords} · обновлено {weather.updatedAt}
          </div>
        </div>
        {polar && <PolarBadge label={polar} padding="6px 13px" />}
      </div>

      <div className="hero-now-row" style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
        <div style={{ flex: "none" }}>
          <WeatherIcon condition={current.condition} size={108} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", flex: "none" }}>
          <span className="temp-big" style={{ fontSize: 78, fontWeight: 800, lineHeight: 0.84, letterSpacing: "-.04em" }}>{signedTemp(current.temp).replace("°", "")}</span>
          <span style={{ fontSize: 28, fontWeight: 600, marginTop: 8, color: "#41525f" }}>°C</span>
        </div>
        <div className="hero-now-info" style={{ paddingTop: 6, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 21, fontWeight: 700 }}>{current.conditionLabel}</div>
          <div style={{ fontSize: 15, color: "#5a6b7b", marginTop: 3 }}>Ощущается как {signedTemp(current.feels)}</div>
          {today && (
            <div style={{ fontSize: 15, color: "#5a6b7b" }}>
              Днём до {signedTemp(today.tmax)} · ночью {signedTemp(today.tmin)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
