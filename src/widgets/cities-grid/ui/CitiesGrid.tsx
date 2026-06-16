import Link from "next/link";
import type { CityWithWeather } from "@/entities/weather";
import { WeatherIcon } from "@/entities/weather";
import { signedTemp } from "@/shared/lib/format";

interface CitiesGridProps {
  items: CityWithWeather[];
  recentSlugs?: string[];
}

export function CitiesGrid({ items, recentSlugs = [] }: CitiesGridProps) {
  const recentSet = new Set(recentSlugs);

  // Недавно посещённые — в порядке визитов, затем остальные по рангу
  const recentItems = recentSlugs
    .map((slug) => items.find((i) => i.city.slug === slug))
    .filter((x): x is CityWithWeather => x !== undefined);

  const restItems = [...items]
    .filter((i) => !recentSet.has(i.city.slug))
    .sort((a, b) => rank(a.city.kind) - rank(b.city.kind));

  const ordered = [...recentItems, ...restItems];

  return (
    <div style={{ marginTop: 38 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", whiteSpace: "nowrap" }}>Города области</h2>
        <a href="#vse-tochki" style={{ fontSize: 13, color: "#0b5cad", fontWeight: 600, whiteSpace: "nowrap" }}>
          Все точки прогноза ↓
        </a>
      </div>

      <div className="cities-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }}>
        {ordered.map(({ city, weather }) => {
          const big = city.kind === "город";
          const isRecent = recentSet.has(city.slug);
          const current = weather?.current ?? null;

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
              <div style={{ flex: "none", opacity: current ? 1 : 0.3 }}>
                <WeatherIcon condition={current?.condition ?? "cloudy"} size={big ? 40 : 30} />
              </div>

              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: big ? 17 : 14,
                    fontWeight: 700,
                    letterSpacing: "-.01em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{city.name}</span>
                  {isRecent && (
                    <span style={{
                      flexShrink: 0,
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#0b5cad",
                      background: "#deeefa",
                      borderRadius: 4,
                      padding: "1px 5px",
                      lineHeight: 1.6,
                      letterSpacing: "0.01em",
                    }}>смотрели</span>
                  )}
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
                  {city.kind} · {current ? current.conditionLabel : "нет данных"}
                </div>
              </div>

              <div style={{ textAlign: "right", flex: "none" }}>
                <div
                  className={big ? "city-card-temp" : undefined}
                  style={{ fontSize: big ? 26 : 20, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1, color: current ? undefined : "#b6c1cc" }}
                >
                  {current ? signedTemp(current.temp) : "—"}
                </div>
                <div style={{ fontSize: 12, color: "#8a98a6", marginTop: 5, whiteSpace: "nowrap" }}>
                  {current ? `${signedTemp(current.tmin)} / ${signedTemp(current.tmax)}` : ""}
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
