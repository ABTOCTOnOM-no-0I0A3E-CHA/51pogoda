import { Skeleton } from "@/shared/ui";

export function AiSummarySkeleton() {
  return (
    <div style={{ border: "1px solid #d4dce5", boxShadow: "0 2px 12px rgba(20,33,43,.05)", borderRadius: 20, padding: 22, background: "#fff" }}>
      <Skeleton width={90} height={20} radius={6} />
      <Skeleton height={14} style={{ marginTop: 14 }} />
      <Skeleton width="92%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
      <Skeleton height={56} radius={13} style={{ marginTop: 16 }} />
    </div>
  );
}
