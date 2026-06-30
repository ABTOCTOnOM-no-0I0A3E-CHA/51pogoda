"use client";

import { useState, useEffect } from "react";
import { AiSummarySkeleton } from "./AiSummarySkeleton";
import { AiSummary } from "./AiSummary";
import type { WeatherSummary } from "@/entities/weather";

export function AiSummaryStream({ slug }: { slug: string }) {
  const [summary, setSummary] = useState<WeatherSummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/ai-summary/${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error || !data.accurate) {
          setError(true);
          return;
        }
        setSummary(data as WeatherSummary);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) return null;

  if (!summary) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <AiSummarySkeleton />
        <p
          style={{
            fontSize: 13,
            color: "#8a98a6",
            textAlign: "center",
            margin: 0,
          }}
        >
          Сводка сейчас появится…
        </p>
      </div>
    );
  }

  return <AiSummary summary={summary} />;
}
