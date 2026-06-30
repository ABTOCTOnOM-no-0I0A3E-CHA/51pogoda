import type { DayPoint } from "@/entities/weather";
import { WeatherIcon } from "@/entities/weather";
import { precipLabel, signedTemp } from "@/shared/lib/format";
import { tempColor } from "@/shared/lib/temp-color";

export function DailyForecast({ days }: { days: DayPoint[] }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>Прогноз на 10 дней</h2>
      <div style={{ border: "1px solid #d4dce5", boxShadow: "0 2px 12px rgba(20,33,43,.05)", borderRadius: 16, overflow: "hidden", background: "#fff" }}>
        {days.map((d, i) => (
          <div
            key={d.iso}
            className="days-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 20px",
              borderBottom: "1px solid #f0f3f6",
              background: i % 2 ? "#fafbfc" : "#fff",
            }}
          >
            <div className="days-dow" style={{ width: 120, flex: "none" }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{d.dow}</div>
              <div style={{ fontSize: 12, color: "#6d7f8e" }}>{d.date}</div>
            </div>

            <div style={{ width: 40, flex: "none", display: "flex", justifyContent: "center" }}>
              <WeatherIcon condition={d.condition} size={40} />
            </div>

            <div
              className="days-cond"
              style={{ flex: 1, minWidth: 0, fontSize: 14, color: "#5a6b7b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {d.conditionLabel}
            </div>

            <div className="days-precip" style={{ width: 86, flex: "none", textAlign: "right", fontSize: 13, color: "#5b9bd6", fontWeight: 600 }}>
              {precipLabel(d.precip) || "—"}
            </div>

            <div className="days-wind" style={{ width: 96, flex: "none", textAlign: "right", fontSize: 13, color: "#5a6b7b" }}>
              {d.wind}
            </div>

            <div className="days-temps" style={{ width: 96, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginLeft: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#6d7f8e", width: 42, textAlign: "right" }}>{signedTemp(d.tmin)}</span>
              <span style={{ fontSize: 15, fontWeight: 800, width: 42, textAlign: "right", color: tempColor(d.tmax) }}>{signedTemp(d.tmax)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
