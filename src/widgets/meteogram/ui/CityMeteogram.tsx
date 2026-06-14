import type { City } from "@/entities/city";
import type { HourPoint } from "@/entities/weather";
import { MeteogramImage } from "./MeteogramImage";
import { MeteoFallbackChart } from "./MeteoFallbackChart";

interface CityMeteogramProps {
  city: City;
  hours: HourPoint[];
}

export function CityMeteogram({ city, hours }: CityMeteogramProps) {
  return (
    <div style={{ marginTop: 22 }}>
      <div className="meteo-header" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-.01em", whiteSpace: "nowrap" }}>Метеограмма на 2 суток</h2>
        <a
          href={`https://www.yr.no/en/content/${city.yrId}/meteogram.svg`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13, color: "#0b5cad", fontWeight: 600, whiteSpace: "nowrap" }}
        >
          официальный график yr.no / MET&nbsp;Norway →
        </a>
      </div>

      <div
        className="scrollx"
        style={{
          border: "1px solid #d4dce5",
          boxShadow: "0 2px 12px rgba(20,33,43,.05)",
          borderRadius: 16,
          padding: "14px 16px",
          background: "#fff",
          overflowX: "auto",
        }}
      >
        <MeteogramImage
          yrId={city.yrId}
          alt={`Метеограмма ${city.name} — yr.no`}
          imgStyle={{ width: "100%", minWidth: 720, height: "auto" }}
          fallback={<MeteoFallbackChart hours={hours} variant="city" />}
        />
      </div>

      <div style={{ fontSize: 12, color: "#a3aeb9", marginTop: 8 }}>
        Метеограмма подгружается напрямую с yr.no по ID локации {city.name} ({city.yrId}). Если внешний график недоступен, показан наш почасовой.
      </div>
    </div>
  );
}
