import { NextResponse } from "next/server";
import { getAllCities } from "@/entities/city/lib/registry";
import { getCityWeather, getCityConsensus } from "@/entities/weather";
import { getAiSummary } from "@/entities/weather/api/ai-summary";
import { getDaylight } from "@/shared/lib/daylight";

/*
  Предгенерация ИИ-сводок для всех городов. Вызывается по крону в 8:00 UTC+3.
  Без ?key=<CRON_SECRET> — 401. По каждой точке результат кэшируется на день,
  так что даже при обрыве запроса уже обработанные города остаются в кэше.
*/

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cities = getAllCities().filter((c) => c.kind === "город");
  let ok = 0;
  let fail = 0;

  for (const city of cities) {
    try {
      const [weather, consensus] = await Promise.all([
        getCityWeather(city),
        getCityConsensus(city),
      ]);
      const daylight = getDaylight(city.lat, new Date(), city.lon);
      await getAiSummary(city, weather, daylight, consensus);
      ok++;
    } catch (err) {
      console.error(`[cron] ${city.slug}:`, err);
      fail++;
    }
  }

  return NextResponse.json({ ok, fail, total: cities.length });
}
