import type { City } from "@/entities/city";
import type { DaylightInfo } from "@/shared/lib/daylight";

interface SunCardProps {
  city: City;
  daylight: DaylightInfo;
}

export function SunCard({ city, daylight }: SunCardProps) {
  const { eyebrow, title, subtitle } = describe(city, daylight);

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

          <div style={{ display: "flex", gap: 30 }}>
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
  if (daylight.polarDay) {
    return {
      eyebrow: "Солнце · полярный день",
      title: "Солнце не заходит",
      subtitle: `Полярный день в ${city.name === "Мурманск" ? "Мурманске" : "Заполярье"}: примерно с 22 мая по 22 июля`,
    };
  }

  if (daylight.polarNight) {
    return {
      eyebrow: "Солнце · полярная ночь",
      title: "Солнце не восходит",
      subtitle: `Полярная ночь в ${city.name === "Мурманск" ? "Мурманске" : "Заполярье"}: примерно с 2 декабря по 11 января`,
    };
  }

  return {
    eyebrow: "Солнце",
    title: "Световой день",
    subtitle: "Восход и заход меняются стремительно — Заполярье близко к полярному кругу",
  };
}
