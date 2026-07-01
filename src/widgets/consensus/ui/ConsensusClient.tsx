"use client";

import { useEffect, useState } from "react";
import type { ForecastConsensus } from "@/entities/weather";
import { SourceConsensus } from "./Consensus";

export function ConsensusClient({ slug }: { slug: string }) {
  const [consensus, setConsensus] = useState<ForecastConsensus | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/consensus/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: ForecastConsensus) => {
        if (!cancelled) setConsensus(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (error) return null;
  if (!consensus) {
    return (
      <div style={{ marginTop: 24 }}>
        <div style={{ height: 20, width: 200, background: "#eef2f6", borderRadius: 8, marginBottom: 4 }} />
        <div style={{ height: 14, width: 280, background: "#eef2f6", borderRadius: 8, marginBottom: 12 }} />
        <div style={{ height: 120, background: "#eef2f6", borderRadius: 16 }} />
      </div>
    );
  }
  return <SourceConsensus consensus={consensus} />;
}
