import { NextRequest, NextResponse } from "next/server";
import { getCityMerged } from "@/entities/city/lib/registry";
import { getCityWeather, getCityConsensus, getAiSummary } from "@/entities/weather";
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

    const weather = await getCityWeather(city);
    const daylight = getDaylight(city.lat, new Date(), city.lon);
    const consensus = await getCityConsensus(city);
    const summary = await getAiSummary(city, weather, daylight, consensus);

    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("[api/ai-summary]", err);
    return NextResponse.json(
      { error: "Сводка временно недоступна" },
      { status: 200 },
    );
  }
}
