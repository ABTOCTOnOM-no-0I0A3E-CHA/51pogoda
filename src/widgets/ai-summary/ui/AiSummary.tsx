import type { WeatherSummary } from "@/entities/weather";

export function AiSummary({ summary }: { summary: WeatherSummary }) {
  return (
    <div
      className="ai-block"
      style={{
        border: "1px solid #d4dce5",
        boxShadow: "0 2px 12px rgba(20,33,43,.05)",
        borderRadius: 20,
        padding: 22,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 13 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".05em",
            color: "#fff",
            background: "#0b5cad",
            padding: "4px 9px",
            borderRadius: 6,
            whiteSpace: "nowrap",
          }}
        >
          СВОДКА
        </span>
        <span style={{ fontSize: 13, color: "#8a98a6" }}>простым языком</span>
      </div>

      <p style={{ margin: "0 0 14px", fontSize: 15.5, lineHeight: 1.55, fontWeight: 600, color: "#22303b" }}>{summary.accurate}</p>

      <div style={{ display: "flex", gap: 11, alignItems: "flex-start", background: "#f3f6f9", borderRadius: 13, padding: "13px 15px", marginTop: "auto" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flex: "none", marginTop: 1 }} aria-hidden>
          <circle cx="12" cy="9.5" r="5.5" fill="#f4a72c" />
          <rect x="9" y="15" width="6" height="4" rx="1.5" fill="#c9933a" />
        </svg>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#41525f" }}>{summary.advice}</p>
      </div>
    </div>
  );
}
