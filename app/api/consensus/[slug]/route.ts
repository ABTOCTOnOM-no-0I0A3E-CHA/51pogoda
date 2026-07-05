import { NextResponse } from "next/server";
import { getCityConsensus } from "@/entities/weather";
import { getCityMerged } from "@/entities/city/lib/registry";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = getCityMerged(slug);
  if (!city) return NextResponse.json({ error: "not found" }, { status: 404 });

  /* Fast-fail: SOCKS-хендшейк + запрос могут занять до 10с. Если не успел
     за 9с — отдаём 502, виджет скрывается. in-memory кэш прокси ускоряет
     повторные запросы до мгновенного. */
  const result = await Promise.race([
    getCityConsensus(city),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 9_000)),
  ]);

  if (!result) return NextResponse.json({ error: "no data" }, { status: 502 });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200" },
  });
}
