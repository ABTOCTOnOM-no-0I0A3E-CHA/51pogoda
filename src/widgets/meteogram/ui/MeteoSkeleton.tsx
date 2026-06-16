import { Skeleton } from "@/shared/ui";

export function MeteoSkeleton() {
  return (
    <div style={{ marginTop: 22 }}>
      <Skeleton width={220} height={20} style={{ marginBottom: 12 }} />
      <div style={{ border: "1px solid #d4dce5", boxShadow: "0 2px 12px rgba(20,33,43,.05)", borderRadius: 16, padding: 14, background: "#fff" }}>
        <Skeleton height={240} radius={10} />
      </div>
    </div>
  );
}
