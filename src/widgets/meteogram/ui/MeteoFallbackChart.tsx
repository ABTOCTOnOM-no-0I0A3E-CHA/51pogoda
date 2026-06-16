import { TempChart, WeatherIcon, type HourPoint, type ChartConfig } from "@/entities/weather";
import { precipLabel } from "@/shared/lib/format";

type Variant = "home" | "city";

interface VariantSpec {
  config: ChartConfig;
  gradientId: string;
  barFill: string;
  chartHeight: number;
  iconSize: number;
  timeColor: string;
  timeSize: number;
}

const SPECS: Record<Variant, VariantSpec> = {
  home: {
    config: { width: 1000, height: 130, padT: 18, padB: 22, padL: 30, padR: 30, barMax: 16 },
    gradientId: "tgradHome",
    barFill: "#9ec6ea",
    chartHeight: 120,
    iconSize: 34,
    timeColor: "#5a6b7b",
    timeSize: 11,
  },
  city: {
    config: { width: 1000, height: 150, padT: 24, padB: 30, padL: 36, padR: 36, barMax: 20 },
    gradientId: "tgradCity",
    barFill: "#aacdec",
    chartHeight: 140,
    iconSize: 38,
    timeColor: "#8a98a6",
    timeSize: 12,
  },
};

export function MeteoFallbackChart({ hours, variant }: { hours: HourPoint[]; variant: Variant }) {
  const spec = SPECS[variant];

  /* Нет почасовых данных — не строим график (внешняя метеограмма yr.no грузится сама) */
  if (hours.length === 0) return null;

  return (
    <div className={variant === "city" ? "meteo-fallback-inner" : undefined} style={variant === "city" ? { minWidth: 720 } : undefined}>
      {variant === "city" && (
        <div style={{ fontSize: 12, color: "#8a98a6", marginBottom: 8 }}>Наш почасовой график · 24 часа</div>
      )}

      <div style={{ display: "flex", padding: "0 2px", marginBottom: 2 }}>
        {hours.map((hr) => (
          <div key={hr.iso} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: variant === "city" ? 3 : 2 }}>
            <span style={{ fontSize: spec.timeSize, color: spec.timeColor, fontWeight: 600 }}>{hr.time}</span>
            <WeatherIcon condition={hr.condition} size={spec.iconSize} />
          </div>
        ))}
      </div>

      <TempChart
        hours={hours}
        gradientId={spec.gradientId}
        config={spec.config}
        barFill={spec.barFill}
        height={spec.chartHeight}
      />

      <div style={{ display: "flex", padding: "0 2px", marginTop: variant === "city" ? 4 : 2 }}>
        {hours.map((hr) => (
          <div key={hr.iso} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: variant === "city" ? 14 : 13, fontWeight: 800, letterSpacing: "-.01em" }}>{tempSign(hr.temp)}</div>
            {variant === "city" && (
              <div style={{ fontSize: 11, color: "#5b9bd6", fontWeight: 600, marginTop: 2, minHeight: 14 }}>{precipLabel(hr.precip)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function tempSign(value: number): string {
  return value > 0 ? `+${value}°` : value < 0 ? `−${Math.abs(value)}°` : "0°";
}
