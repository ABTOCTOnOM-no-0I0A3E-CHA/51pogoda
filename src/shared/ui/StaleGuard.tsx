"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";

export function StaleGuard({
  fetchedAt,
  maxAge = 3_600_000,
  children,
  fallback,
}: {
  fetchedAt: number;
  maxAge?: number;
  children: ReactNode;
  fallback: ReactNode;
}) {
  const [stale, setStale] = useState(false);

  useLayoutEffect(() => {
    if (Date.now() - fetchedAt > maxAge) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStale(true);
    }
  }, [fetchedAt, maxAge]);

  if (stale) return <>{fallback}</>;
  return <>{children}</>;
}
