"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { CITIES, type City } from "@/entities/city";
import { useCitySearch } from "../model/store";

/* Максимум символов запроса — отсекаем мусорный ввод на корню */
const MAX_QUERY = 40;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-zа-яё\s-]/gi, "")
    .slice(0, MAX_QUERY);
}

/*
  На десктопе — инлайн-поле в шапке. На планшете/мобиле (≤1024px) сворачивается
  в кнопку-лупу, по тапу раскрывается всплывающий поиск (CSS-переключение по
  классам, поведение одно). extra — кастомные точки из админки.
*/
export function CitySearch({ extra = [] }: { extra?: City[] }) {
  const router = useRouter();
  const { query, open, setQuery, setOpen, reset } = useCitySearch();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pool = useMemo(() => [...CITIES, ...extra], [extra]);

  const results = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return [];
    return pool.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, pool]);

  /* при раскрытии поповера на мобиле фокусируем поле */
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
    <div
      className="city-search-root"
      style={{ position: "relative", display: "flex", alignItems: "center" }}
      onBlur={() => {
        blurTimer.current = setTimeout(() => setOpen(false), 120);
      }}
      onFocus={() => {
        if (blurTimer.current) clearTimeout(blurTimer.current);
      }}
    >
      <button
        type="button"
        className="search-trigger"
        aria-label="Поиск города"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="#5a6b7b" strokeWidth="2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#5a6b7b" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <form onSubmit={onSubmit} className={`search-form${open ? " is-open" : ""}`}>
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="#8a98a6" strokeWidth="2" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#8a98a6" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            value={query}
            maxLength={MAX_QUERY}
            onChange={(e) => {
              const v = normalize(e.target.value);
              setQuery(v);
              setOpen(v.trim().length > 0);
            }}
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
          <ul className="search-results">
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
    </div>
  );
}
