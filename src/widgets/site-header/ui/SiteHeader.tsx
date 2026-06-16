import Link from "next/link";
import { CitySearch } from "@/features/city-search";
import { getCustomCities } from "@/entities/city/lib/registry";
import { headerDate } from "@/shared/lib/format";
import { SITE } from "@/shared/config/site";

export function SiteHeader() {
  const today = headerDate(new Date());
  /* Кастомные точки из админки — чтобы они тоже находились в поиске */
  const extra = getCustomCities();

  return (
    <div style={{ borderBottom: "1px solid #d4dce5", background: "#fff" }}>
      <header
        className="header-inner"
        style={{
          maxWidth: 1060,
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "#0b5cad",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
              <polygon points="12,2 19,12 12,22 5,12" fill="#fff" />
              <circle cx="12" cy="12" r="2.4" fill="#0b5cad" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.01em", whiteSpace: "nowrap" }}>{SITE.name}</div>
            <div style={{ fontSize: 12, color: "#8a98a6", fontWeight: 500, marginTop: 1 }}>{SITE.tagline}</div>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <CitySearch extra={extra} />
          <div className="hdr-date" style={{ fontSize: 14, color: "#5a6b7b", fontWeight: 600, whiteSpace: "nowrap" }}>{today}</div>
        </div>
      </header>
    </div>
  );
}
