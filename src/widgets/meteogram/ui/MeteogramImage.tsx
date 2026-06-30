import type { CSSProperties } from "react";

interface MeteogramImageProps {
  yrId: string;
  alt: string;
  imgStyle?: CSSProperties;
}

export function MeteogramImage({ yrId, alt, imgStyle }: MeteogramImageProps) {
  return (
    <img
      src={`/api/meteogram/${yrId}`}
      alt={alt}
      width={800}
      height={240}
      fetchPriority="high"
      style={{
        width: "100%",
        height: "auto",
        aspectRatio: "800 / 240",
        borderRadius: 8,
        display: "block",
        ...imgStyle,
      }}
    />
  );
}
