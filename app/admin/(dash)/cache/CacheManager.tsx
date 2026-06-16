"use client";

import { useState } from "react";
import styles from "../../admin.module.css";

interface CityOpt {
  slug: string;
  name: string;
}

type Status = { kind: "ok" | "err"; text: string } | null;

async function resetCache(type: "weather" | "ai", slug?: string): Promise<string> {
  const res = await fetch("/api/admin/cache", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, slug }),
  });
  const data = (await res.json()) as { revalidated?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data.revalidated ?? "";
}

function CacheCard({ type, label, cities }: { type: "weather" | "ai"; label: string; cities: CityOpt[] }) {
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function run(scopeSlug?: string) {
    setBusy(true);
    setStatus(null);
    try {
      const tag = await resetCache(type, scopeSlug);
      setStatus({ kind: "ok", text: `Сброшено: ${tag}` });
    } catch (e) {
      setStatus({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{label}</div>
      <div className={styles.btnRow}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy} onClick={() => run()}>
          Сбросить все города
        </button>
      </div>
      <div className={styles.row} style={{ marginTop: 14 }}>
        <div className={styles.field}>
          <label className={styles.label}>Отдельный город</label>
          <select className={styles.select} value={slug} onChange={(e) => setSlug(e.target.value)}>
            <option value="">— выбрать —</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className={styles.btn}
          disabled={busy || !slug}
          onClick={() => run(slug)}
        >
          Сбросить выбранный
        </button>
      </div>
      {status && (
        <p className={`${styles.msg} ${status.kind === "ok" ? styles.msgOk : styles.msgErr}`}>{status.text}</p>
      )}
    </div>
  );
}

export function CacheManager({ cities }: { cities: CityOpt[] }) {
  return (
    <>
      <CacheCard type="weather" label="Погода (MET Norway)" cities={cities} />
      <CacheCard type="ai" label="ИИ-сводки (GigaChat)" cities={cities} />
    </>
  );
}
