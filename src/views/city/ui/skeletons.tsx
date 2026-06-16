import { Skeleton } from "@/shared/ui";

export function CityHeroSkeleton() {
  return (
    <div style={{ borderRadius: 20, border: "1px solid #d3e4f2", background: "linear-gradient(160deg,#e8f1fb,#f4f9fd)", padding: "26px 28px" }}>
      <Skeleton width={160} height={26} />
      <Skeleton width={240} height={14} style={{ marginTop: 8 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
        <Skeleton width={100} height={100} radius={20} />
        <Skeleton width={110} height={56} />
        <Skeleton width={140} height={44} />
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
