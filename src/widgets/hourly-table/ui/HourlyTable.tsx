import type { HourPoint } from "@/entities/weather";
import { WeatherIcon } from "@/entities/weather";
import { precipLabel, signedTemp } from "@/shared/lib/format";
import { tempColor } from "@/shared/lib/temp-color";

export function HourlyTable({ hours }: { hours: HourPoint[] }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>По часам — подробно</h2>
      <div
        className="scrollx"
        style={{
          border: "1px solid #d4dce5",
          boxShadow: "0 2px 12px rgba(20,33,43,.05)",
          borderRadius: 16,
          overflowX: "auto",
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", minWidth: "max-content" }}>
          {hours.map((hr) => (
            <div key={hr.iso} style={{ flex: "none", width: 82, textAlign: "center", padding: "13px 0", borderRight: "1px solid #f0f3f6" }}>
              <div style={{ fontSize: 13, color: "#5a6b7b", fontWeight: 700 }}>{hr.time}</div>
              <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 4px" }}>
                <WeatherIcon condition={hr.condition} size={32} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.01em", color: tempColor(hr.temp) }}>{signedTemp(hr.temp)}</div>
              <div style={{ fontSize: 11, color: "#6d7f8e", marginTop: 4 }}>ощущ. {signedTemp(hr.feels)}</div>
              <div style={{ fontSize: 11, color: "#5a6b7b", marginTop: 5, fontWeight: 600 }}>{hr.wind} м/с</div>
              <div style={{ fontSize: 11, color: "#6d7f8e", marginTop: 3 }}>{hr.pressure} мм</div>
              <div style={{ fontSize: 11, color: "#5b9bd6", marginTop: 3, fontWeight: 600, minHeight: 14 }}>{precipLabel(hr.precip)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
