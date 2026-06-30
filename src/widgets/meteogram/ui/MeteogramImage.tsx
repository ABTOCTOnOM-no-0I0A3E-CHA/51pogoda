import type { CSSProperties } from "react";

interface MeteogramImageProps {
  yrId: string;
  alt: string;
  imgStyle?: CSSProperties;
}

/* Оригинал yr.no: width="782" height="391" → aspectRatio 2/1.
   Не форсируем иные пропорции — SVG грузится с правильным соотношением сторон. */
export function MeteogramImage({ yrId, alt, imgStyle }: MeteogramImageProps) {
  return (
    <img
      src={`/api/meteogram/${yrId}`}
      alt={alt}
      width={782}
      height={391}
      fetchPriority="high"
      style={{
        width: "100%",
        height: "auto",
        aspectRatio: "2 / 1",
        borderRadius: 8,
        display: "block",
        ...imgStyle,
      }}
    />
  );
}
