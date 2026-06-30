import type { CSSProperties } from "react";
import { Skeleton } from "@/shared/ui";

const card = (extra?: CSSProperties): CSSProperties => ({
  background: "#fff",
  border: "1px solid #d4dce5",
  borderRadius: 16,
  padding: "16px 18px",
  ...extra,
});

/* Полная копия HomeHero по структуре — скелет занимает ровно ту же высоту,
   чтобы CLS = 0 при подгрузке данных. Включая responsive-классы .hero-padding,
   .hero-title, .hero-polar-badge, .hero-temp-row, .temp-big. */
export function HeroSkeleton() {
  return (
    <div className="full-bleed-mobile" style={{
      borderRadius: 24,
      border: "1px solid #d3e4f2",
      overflow: "hidden",
      background: "linear-gradient(165deg,#e8f1fb,#f4f9fd)",
      boxShadow: "0 18px 50px rgba(20,33,43,.08)",
    }}>
      <div className="hero-padding" style={{ padding: "30px 34px 26px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <Skeleton width={120} height={13} />
            <Skeleton width={240} height={34} style={{ marginTop: 6 }} />
            <Skeleton width={260} height={14} style={{ marginTop: 2 }} />
          </div>
        </div>

        <div className="hero-temp-row" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
          <div style={{ flex: "none" }}>
            <Skeleton width={96} height={96} radius={14} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <Skeleton width={90} height={70} />
          </div>
          <div>
            <Skeleton width={130} height={22} />
            <Skeleton width={200} height={16} style={{ marginTop: 3 }} />
          </div>
        </div>

        <Skeleton width="100%" height={48} radius={13} style={{ marginTop: 20 }} />
      </div>
    </div>
  );
}

export function CitiesGridSkeleton() {
  return (
    <div style={{ marginTop: 38 }}>
      <Skeleton width={200} height={24} style={{ marginBottom: 16 }} />
      <div className="cities-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={card({ minHeight: 88, display: "flex", alignItems: "center", gap: 16 })}>
            <Skeleton width={40} height={40} radius={10} />
            <div style={{ flex: 1 }}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
            </div>
            <Skeleton width={48} height={26} />
          </div>
        ))}
      </div>
    </div>
  );
}
