"use client";

import { useState, useEffect } from "react";
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

  if (error || !summary) return null;

  return <AiSummary summary={summary} />;
}
