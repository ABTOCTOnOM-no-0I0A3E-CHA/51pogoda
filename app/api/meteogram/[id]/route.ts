import { NextResponse } from "next/server";
import { MET_USER_AGENT } from "@/shared/config/site";
import { getCityByYrId } from "@/entities/city";
import { translateMeteogramSvg } from "@/entities/weather";

export const revalidate = 1800;

/* Только формат yr.no «2-<цифры>» — защита от SSRF на произвольные адреса */
const ID_PATTERN = /^2-\d{4,9}$/;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!ID_PATTERN.test(id)) {
    return new NextResponse("Bad location id", { status: 400 });
  }

  try {
    const upstream = await fetch(`https://www.yr.no/en/content/${id}/meteogram.svg`, {
      headers: { "User-Agent": MET_USER_AGENT, Accept: "image/svg+xml" },
      next: { revalidate: 1800 },
    });

    if (!upstream.ok) {
      return new NextResponse("Upstream error", { status: 502 });
    }

    const svg = await upstream.text();

    if (!svg.includes("<svg")) {
      return new NextResponse("Not an SVG", { status: 502 });
    }

    const cityName = getCityByYrId(id)?.name ?? "";
    const translated = translateMeteogramSvg(svg, cityName);

    return new NextResponse(translated, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new NextResponse("Fetch failed", { status: 502 });
  }
}
