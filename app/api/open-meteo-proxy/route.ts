import { NextRequest, NextResponse } from "next/server";
import { ProxyAgent } from "undici";

const UPSTREAM = "https://api.open-meteo.com/v1/forecast";

/* Если сервер в РФ и Open-Meteo (Hetzner) недоступен напрямую */
const PROXY_URL = process.env.OPEN_METEO_PROXY;
const PROXY_AGENT = PROXY_URL ? new ProxyAgent(PROXY_URL) : undefined;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  if (!params.has("latitude") || !params.has("longitude")) {
    return NextResponse.json({ error: "latitude and longitude required" }, { status: 400 });
  }

  const upstreamUrl = `${UPSTREAM}?${params.toString()}`;

  try {
    const opts: RequestInit & { dispatcher?: ProxyAgent } = {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    };
    if (PROXY_AGENT) opts.dispatcher = PROXY_AGENT;

    const res = await fetch(upstreamUrl, opts);

    if (!res.ok) {
      return NextResponse.json({ error: `Open-Meteo ответил ${res.status}` }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch {
    return NextResponse.json({ error: "Open-Meteo unavailable" }, { status: 502 });
  }
}
