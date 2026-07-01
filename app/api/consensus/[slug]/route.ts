import { NextResponse } from "next/server";
import { getCityConsensus } from "@/entities/weather";
import { getCityMerged } from "@/entities/city/lib/registry";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = getCityMerged(slug);
  if (!city) return NextResponse.json({ error: "not found" }, { status: 404 });

  const consensus = await getCityConsensus(city);
  if (!consensus) return NextResponse.json({ error: "no data" }, { status: 502 });

  return NextResponse.json(consensus);
}
