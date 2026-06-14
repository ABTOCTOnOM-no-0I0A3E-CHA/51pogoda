"use client";

import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { CITIES } from "@/entities/city";
import { useCitySearch } from "../model/store";

/* Максимум символов запроса — отсекаем мусорный ввод на корню */
const MAX_QUERY = 40;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-zа-яё\s-]/gi, "")
    .slice(0, MAX_QUERY);
}

export function CitySearch() {
  const router = useRouter();
  const { query, open, setQuery, setOpen, reset } = useCitySearch();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return [];
    return CITIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const goTo = (slug: string) => {
    reset();
    router.push(`/${slug}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const first = results[0];
    if (first) goTo(first.slug);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="hdr-search"
      style={{ position: "relative", width: 230 }}
      onBlur={() => {
        blurTimer.current = setTimeout(() => setOpen(false), 120);
      }}
      onFocus={() => {
        if (blurTimer.current) clearTimeout(blurTimer.current);
        if (query.trim()) setOpen(true);
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "#fff",
          border: "1px solid #e1e7ee",
          borderRadius: 11,
          padding: "9px 14px",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="#8a98a6" strokeWidth="2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#8a98a6" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          inputMode="search"
          value={query}
          maxLength={MAX_QUERY}
          onChange={(e) => setQuery(normalize(e.target.value))}
          placeholder="Поиск города…"
          aria-label="Поиск города Мурманской области"
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 14,
            color: "#15212b",
            width: "100%",
            fontFamily: "inherit",
          }}
        />
      </div>

      {open && results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 40,
            margin: 0,
            padding: 6,
            listStyle: "none",
            background: "#fff",
            border: "1px solid #e1e7ee",
            borderRadius: 12,
            boxShadow: "0 14px 34px rgba(20,33,43,.14)",
          }}
        >
          {results.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onMouseDown={() => goTo(c.slug)}
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
    </form>
  );
}
