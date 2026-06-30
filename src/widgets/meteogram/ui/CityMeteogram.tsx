import type { City } from "@/entities/city";
import { MeteogramImage } from "./MeteogramImage";

export function CityMeteogram({ city }: { city: City }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div
        className="meteo-header"
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "-.01em",
            whiteSpace: "nowrap",
          }}
        >
          Метеограмма на 2 суток
        </h2>
        <a
          href={`https://www.yr.no/en/content/${city.yrId}/meteogram.svg`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            color: "#0b5cad",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          официальный график yr.no / MET&nbsp;Norway →
        </a>
      </div>

      <div
        className="full-bleed-mobile"
        style={{
          border: "1px solid #d4dce5",
          boxShadow: "0 2px 12px rgba(20,33,43,.05)",
          borderRadius: 16,
          padding: "14px 16px",
          background: "#fff",
        }}
      >
        <MeteogramImage
          yrId={city.yrId}
          alt={`Метеограмма ${city.name} — yr.no`}
          imgStyle={{ borderRadius: 8 }}
        />
      </div>

      <div style={{ fontSize: 12, color: "#5a6b7b", marginTop: 8 }}>
        Метеограмма подгружается напрямую по локации {city.name} ({city.yrId}).
        Если внешний график недоступен, показан наш почасовой.
      </div>
    </div>
  );
}
