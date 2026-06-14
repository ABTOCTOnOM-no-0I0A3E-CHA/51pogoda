import Link from "next/link";
import type { CityWithWeather } from "@/entities/weather";
import { WeatherIcon } from "@/entities/weather";
import { signedTemp } from "@/shared/lib/format";

export function CitiesGrid({ items }: { items: CityWithWeather[] }) {
  /* Сначала города, затем пгт и сёла — как в исходном макете */
  const ordered = [...items].sort((a, b) => rank(a.city.kind) - rank(b.city.kind));

  return (
    <div style={{ marginTop: 38 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", whiteSpace: "nowrap" }}>Города области</h2>
        <a href="#vse-tochki" style={{ fontSize: 13, color: "#0b5cad", fontWeight: 600, whiteSpace: "nowrap" }}>
          Все точки прогноза ↓
        </a>
      </div>

      <div className="cities-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {ordered.map(({ city, weather }) => {
          const big = city.kind === "город";
          const { current } = weather;

          return (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="city-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                minHeight: 88,
                background: "#fff",
                border: "1px solid #d4dce5",
                borderRadius: 16,
                padding: "16px 18px",
                boxShadow: "0 2px 12px rgba(20,33,43,.06)",
                transition: "all .15s",
              }}
            >
              <div style={{ flex: "none" }}>
                <WeatherIcon condition={current.condition} size={big ? 58 : 34} />
              </div>

              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: big ? 19 : 15,
                    fontWeight: big ? 800 : 700,
                    letterSpacing: "-.01em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {city.name}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "#8a98a6",
                    textTransform: "capitalize",
                    marginTop: 3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {city.kind} · {current.conditionLabel}
                </div>
              </div>

              <div style={{ textAlign: "right", flex: "none" }}>
                <div
                  className={big ? "city-card-temp" : undefined}
                  style={{ fontSize: big ? 32 : 24, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1 }}
                >
                  {signedTemp(current.temp)}
                </div>
                <div style={{ fontSize: 12, color: "#8a98a6", marginTop: 5, whiteSpace: "nowrap" }}>
                  {signedTemp(current.tmin)} / {signedTemp(current.tmax)}
                </div>
              </div>

              <div
                style={{
                  flex: "none",
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: "#eef4fb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M9 6l6 6-6 6" stroke="#0b5cad" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function rank(kind: string): number {
  return kind === "город" ? 0 : 1;
}
