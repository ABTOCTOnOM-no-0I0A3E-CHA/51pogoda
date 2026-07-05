import { NextRequest, NextResponse } from "next/server";
import { getCityMerged } from "@/entities/city/lib/registry";
import { getCityWeather, getCityConsensus } from "@/entities/weather";
import { getAiSummary, getCachedAiSummary } from "@/entities/weather/api/ai-summary";
import { getDaylight } from "@/shared/lib/daylight";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const city = getCityMerged(slug);
    if (!city) {
      return NextResponse.json({ error: "Город не найден" }, { status: 404 });
    }

    /* Если сводка за сегодня уже сгенерирована — отдаём мгновенно, без фетча
       погоды/консенсуса. На не-городах (208 точек) клиент фетчит этот роут при
       каждом заходе — early-return убирает 10-секундный скелетон. */
    const cached = getCachedAiSummary(city.slug);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400" },
      });
    }

    const weather = await getCityWeather(city);
    const daylight = getDaylight(city.lat, new Date(), city.lon);
    const consensus = await getCityConsensus(city);
    const summary = await getAiSummary(city, weather, daylight, consensus);

    return NextResponse.json(summary, {
      headers: { "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400" },
    });
  } catch (err) {
    console.error("[api/ai-summary]", err);
    return NextResponse.json({ error: "Сводка временно недоступна" }, { status: 200 });
  }
}
