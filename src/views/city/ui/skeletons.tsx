import { Skeleton } from "@/shared/ui";

/* Полная копия CityHero по структуре — скелет занимает ровно ту же высоту,
   чтобы CLS = 0 при подгрузке данных. Включая responsive-классы (.hero-hero-pad,
   .hero-now-row, .hero-now-info), меняющие padding/flex-wrap на мобилках. */
export function CityHeroSkeleton() {
  return (
    <div className="hero-hero-pad" style={{
      position: "relative",
      borderRadius: 20,
      overflow: "hidden",
      background: "linear-gradient(160deg,#e8f1fb,#f4f9fd)",
      border: "1px solid #d3e4f2",
      boxShadow: "0 2px 14px rgba(20,33,43,.06)",
      padding: "26px 28px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Skeleton width={260} height={30} />
          <Skeleton width={280} height={16} style={{ marginTop: 2 }} />
        </div>
      </div>

      <div className="hero-now-row" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
        <div style={{ flex: "none" }}>
          <Skeleton width={108} height={108} radius={14} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", flex: "none" }}>
          <Skeleton width={80} height={60} />
        </div>
        <div className="hero-now-info" style={{ paddingTop: 6, flex: 1, minWidth: 0 }}>
          <Skeleton width={140} height={22} />
          <Skeleton width={170} height={16} style={{ marginTop: 3 }} />
          <Skeleton width={200} height={16} style={{ marginTop: 3 }} />
        </div>
      </div>
    </div>
  );
}

export function CityDetailsSkeleton() {
  return (
    <>
      <div style={{ marginTop: 22 }}>
        <Skeleton width={160} height={18} style={{ marginBottom: 12 }} />
        <div className="params-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ border: "1px solid #d4dce5", borderRadius: 13, padding: "13px 15px", background: "#fff" }}>
              <Skeleton width="70%" height={12} />
              <Skeleton width="50%" height={20} style={{ marginTop: 10 }} />
            </div>
          ))}
        </div>
      </div>

      <Skeleton height={110} radius={16} style={{ marginTop: 22 }} />

      <div style={{ marginTop: 24 }}>
        <Skeleton width={180} height={18} style={{ marginBottom: 12 }} />
        <Skeleton height={130} radius={16} />
      </div>

      <div style={{ marginTop: 24 }}>
        <Skeleton width={180} height={18} style={{ marginBottom: 12 }} />
        <Skeleton height={300} radius={16} />
      </div>
    </>
  );
}
