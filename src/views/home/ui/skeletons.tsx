import type { CSSProperties } from "react";
import { Skeleton } from "@/shared/ui";

const card = (extra?: CSSProperties): CSSProperties => ({
  background: "#fff",
  border: "1px solid #d4dce5",
  borderRadius: 16,
  padding: "16px 18px",
  ...extra,
});

export function HeroSkeleton() {
  return (
    <div style={{ borderRadius: 24, border: "1px solid #d3e4f2", overflow: "hidden", background: "linear-gradient(165deg,#e8f1fb,#f4f9fd)", padding: "30px 34px" }}>
      <Skeleton width={120} height={13} />
      <Skeleton width={200} height={34} style={{ marginTop: 10 }} />
      <Skeleton width={260} height={14} style={{ marginTop: 8 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 18 }}>
        <Skeleton width={92} height={92} radius={20} />
        <Skeleton width={120} height={64} />
        <Skeleton width={150} height={44} />
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
