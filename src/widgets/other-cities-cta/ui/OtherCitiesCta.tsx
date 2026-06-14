import Link from "next/link";

export function OtherCitiesCta() {
  return (
    <div
      style={{
        marginTop: 30,
        padding: "18px 22px",
        background: "#fff",
        border: "1px solid #d4dce5",
        boxShadow: "0 2px 12px rgba(20,33,43,.05)",
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Смотрите погоду в других точках области</div>
        <div style={{ fontSize: 13, color: "#8a98a6", marginTop: 2 }}>Города, сёла, станции, маяки, КПП, аэродромы, турбазы и рыболовные лагеря</div>
      </div>

      <Link
        href="/#vse-tochki"
        className="btn-primary"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#0b5cad",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          padding: "12px 18px",
          borderRadius: 11,
          whiteSpace: "nowrap",
        }}
      >
        Все точки прогноза
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}
