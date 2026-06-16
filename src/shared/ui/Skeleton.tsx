import type { CSSProperties } from "react";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: CSSProperties;
}

/* Мерцающий плейсхолдер на время загрузки данных */
export function Skeleton({ width = "100%", height = 16, radius = 8, style }: SkeletonProps) {
  return <span className="skeleton" style={{ display: "block", width, height, borderRadius: radius, ...style }} aria-hidden />;
}
