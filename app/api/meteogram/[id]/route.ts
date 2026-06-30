import { NextResponse } from "next/server";
import { MET_USER_AGENT } from "@/shared/config/site";
import { getCityByYrIdMerged } from "@/entities/city/lib/registry";
import { translateMeteogramSvg } from "@/entities/weather";
import { getCached, setCache } from "@/shared/lib/meteogram-cache";

/* Только формат yr.no «2-<цифры>» — защита от SSRF на произвольные адреса */
const ID_PATTERN = /^2-\d{4,9}$/;

function cachedResponse(svg: string) {
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!ID_PATTERN.test(id)) {
    return new NextResponse("Bad location id", { status: 400 });
  }

  /* файловый кэш — не дёргаем yr.no, если на диске есть свежая копия */
  const cached = await getCached(id);
  if (cached) return cachedResponse(cached);

  try {
    const upstream = await fetch(`https://www.yr.no/en/content/${id}/meteogram.svg`, {
      headers: { "User-Agent": MET_USER_AGENT, Accept: "image/svg+xml" },
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      return new NextResponse("Upstream error", { status: 502 });
    }

    const svg = await upstream.text();

    if (!svg.includes("<svg")) {
      return new NextResponse("Not an SVG", { status: 502 });
    }

    const cityName = getCityByYrIdMerged(id)?.name ?? "";
    const translated = translateMeteogramSvg(svg, cityName);

    /* сохраняем в файловый кэш на 1 час */
    setCache(id, translated);

    return cachedResponse(translated);
  } catch {
    return new NextResponse("Fetch failed", { status: 502 });
  }
}
