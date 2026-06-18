"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, type City } from "@/entities/city";
import { COOKIE_PINNED, COOKIE_MAX_AGE } from "@/shared/lib/visit-cookie";

const MAX_QUERY = 40;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-zа-яё\s-]/gi, "")
    .slice(0, MAX_QUERY);
}

function writePinnedCookie(slug: string): void {
  document.cookie = `${COOKIE_PINNED}=${slug}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

/*
  Ручной выбор города для главной. Пишет slug в cookie `pc`; на сервере он —
  лишь дефолт: если по визитам набирается «популярный» город, тот перебивает
  ручной выбор (логика в getPreferredSlug). extra — кастомные точки из админки.
*/
export function HomeCityPicker({ extra = [] }: { extra?: City[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pool = useMemo(() => [...CITIES, ...extra], [extra]);
  const results = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return [];
    return pool.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, pool]);

  const pick = (slug: string) => {
    writePinnedCookie(slug);
    setOpen(false);
    setQuery("");
    router.refresh();
  };

  return (
    <div
      style={{ position: "relative" }}
      onBlur={() => {
        blurTimer.current = setTimeout(() => setOpen(false), 120);
      }}
      onFocus={() => {
        if (blurTimer.current) clearTimeout(blurTimer.current);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: "rgba(255,255,255,.7)",
          border: "1px solid #c6daf0",
          borderRadius: 999,
          padding: "4px 11px",
          fontSize: 12,
          fontWeight: 700,
          color: "#0b5cad",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z" stroke="#0b5cad" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="2.4" fill="#0b5cad" />
        </svg>
        Сменить город
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 40,
            width: "min(240px, calc(100vw - 32px))",
            background: "#fff",
            border: "1px solid #e1e7ee",
            borderRadius: 12,
            boxShadow: "0 14px 34px rgba(20,33,43,.16)",
            padding: 8,
          }}
        >
          <input
            type="search"
            autoFocus
            value={query}
            maxLength={MAX_QUERY}
            onChange={(e) => setQuery(normalize(e.target.value))}
            placeholder="Найти город…"
            aria-label="Выбрать город для главной"
            style={{
              width: "100%",
              border: "1px solid #e1e7ee",
              borderRadius: 9,
              padding: "8px 11px",
              fontSize: 14,
              color: "#15212b",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          {results.length > 0 && (
            <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0 }}>
              {results.map((c) => (
                <li key={c.slug}>
                  <button
                    type="button"
                    onMouseDown={() => pick(c.slug)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "9px 11px",
                      border: "none",
                      borderRadius: 8,
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 14,
                      color: "#15212b",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontSize: 12, color: "#8a98a6", textTransform: "capitalize" }}>{c.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
