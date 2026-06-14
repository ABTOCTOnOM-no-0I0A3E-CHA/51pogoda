import Link from "next/link";

export default function NotFound() {
  return (
    <div className="content-padding" style={{ maxWidth: 1060, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-.04em", color: "#0b5cad" }}>404</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>Город не найден</h1>
      <p style={{ fontSize: 15, color: "#5a6b7b", marginTop: 8 }}>
        Похоже, такой страницы нет. Вернитесь на главную и выберите город Мурманской области.
      </p>
      <Link
        href="/"
        className="btn-primary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginTop: 24,
          background: "#0b5cad",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          padding: "13px 22px",
          borderRadius: 12,
        }}
      >
        На главную
      </Link>
    </div>
  );
}
