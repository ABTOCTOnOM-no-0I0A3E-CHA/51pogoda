import type { City } from "@/entities/city";
import { polarPeriod, type DaylightInfo } from "@/shared/lib/daylight";
import { dayMonthLong } from "@/shared/lib/format";

interface SunCardProps {
  city: City;
  daylight: DaylightInfo;
}

export function SunCard({ city, daylight }: SunCardProps) {
  const { eyebrow, title, subtitle } = describe(city, daylight);
  const showSun = daylight.sunrise != null && daylight.sunset != null;

  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ border: "1px solid #efe6cf", borderRadius: 16, padding: "20px 24px", background: "linear-gradient(90deg,#fffdf8,#fbf3e2)" }}>
        <div style={{ fontSize: 12, color: "#a8730a", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{eyebrow}</div>

        <div className="sun-flex" style={{ display: "flex", alignItems: "center", gap: 36, flexWrap: "wrap", marginTop: 8 }}>
          <div className="sun-text" style={{ minWidth: 220 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{title}</div>
            <div style={{ fontSize: 13, color: "#7a6a45", marginTop: 2 }}>{subtitle}</div>
          </div>

          <svg className="sun-svg" width="220" height="64" viewBox="0 0 220 64" style={{ flex: "none" }} aria-hidden>
            <line x1="6" y1="52" x2="214" y2="52" stroke="#e2d8bf" strokeWidth="2" />
            <path d="M12 46 C56 8, 164 8, 208 46" fill="none" stroke="#f0b94a" strokeWidth="2.5" strokeDasharray="3 5" strokeLinecap="round" />
            <circle cx="110" cy="15" r="10" fill="#f4a72c" />
            <circle cx="110" cy="15" r="15" fill="none" stroke="#f4a72c" strokeWidth="1.5" opacity="0.4" />
          </svg>

          <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
            {showSun && (
              <>
                <div>
                  <div style={{ fontSize: 12, color: "#8a98a6", fontWeight: 600 }}>Восход</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{daylight.sunrise}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#8a98a6", fontWeight: 600 }}>Заход</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{daylight.sunset}</div>
                </div>
              </>
            )}
            <div>
              <div style={{ fontSize: 12, color: "#8a98a6", fontWeight: 600 }}>Макс. высота</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{daylight.maxAltitude}°</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#8a98a6", fontWeight: 600 }}>Долгота дня</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2, whiteSpace: "nowrap" }}>{daylight.dayLengthLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function describe(city: City, daylight: DaylightInfo) {
  const where = city.name === "Мурманск" ? "Мурманске" : city.name;
  const year = new Date().getFullYear();

  if (daylight.polarDay) {
    const period = polarPeriod(city.lat, "day", year);
    return {
      eyebrow: "Солнце · полярный день",
      title: "Солнце не заходит",
      subtitle: period
        ? `Полярный день в ${where}: ${rangeLabel(period)}`
        : `Полярный день в ${where}`,
    };
  }

  if (daylight.polarNight) {
    const period = polarPeriod(city.lat, "night", year);
    return {
      eyebrow: "Солнце · полярная ночь",
      title: "Солнце не восходит",
      subtitle: period
        ? `Полярная ночь в ${where}: ${rangeLabel(period)}`
        : `Полярная ночь в ${where}`,
    };
  }

  return {
    eyebrow: "Солнце",
    title: "Световой день",
    subtitle: "Восход и заход меняются стремительно — Заполярье близко к полярному кругу",
  };
}

function rangeLabel({ start, end }: { start: Date; end: Date }): string {
  return `примерно с ${dayMonthLong(start)} по ${dayMonthLong(end)}`;
}
