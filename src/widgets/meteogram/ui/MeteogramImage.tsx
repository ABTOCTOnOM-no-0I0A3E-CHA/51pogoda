"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface MeteogramImageProps {
  yrId: string;
  alt: string;
  imgStyle?: CSSProperties;
  /* Запасной график до загрузки и при ошибке внешней метеограммы */
  fallback: ReactNode;
}

type Status = "loading" | "ok" | "error";

/*
  Официальная SVG-метеограмма yr.no тянется через наш серверный прокси
  (/api/meteogram/<id>) — тот же origin, поэтому грузится надёжно, без CORS
  и hotlink-ограничений. До успешной загрузки и при ошибке показываем
  собственный график (логика деградации из исходного макета).
*/
export function MeteogramImage({ yrId, alt, imgStyle, fallback }: MeteogramImageProps) {
  const [status, setStatus] = useState<Status>("loading");
  const ref = useRef<HTMLImageElement>(null);

  /* Картинка могла прогрузиться до гидратации — onLoad тогда не сработает */
  useEffect(() => {
    const img = ref.current;
    if (img?.complete) {
      setStatus(img.naturalWidth > 0 ? "ok" : "error");
    }
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={`/api/meteogram/${yrId}`}
        alt={alt}
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("error")}
        style={{ ...imgStyle, display: status === "ok" ? "block" : "none" }}
      />
      {status !== "ok" && fallback}
    </>
  );
}
