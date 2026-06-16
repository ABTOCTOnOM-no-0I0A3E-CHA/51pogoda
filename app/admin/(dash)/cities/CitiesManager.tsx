"use client";

import { useState } from "react";
import styles from "../../admin.module.css";

interface City {
  slug: string;
  name: string;
  kind: string;
  lat: number;
  lon: number;
  yrId: string;
}

type Status = { kind: "ok" | "err"; text: string } | null;

const KINDS = [
  "город", "пгт", "село", "турбаза", "база отдыха", "рыболовный лагерь",
  "КПП", "маяк", "аэропорт", "порт", "станция", "акватория",
];

const EMPTY = { slug: "", name: "", kind: "село", lat: "", lon: "", yrId: "" };

export function CitiesManager({ initialCustom }: { initialCustom: City[] }) {
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState<string | null>(null); /* slug в режиме правки */
  const [custom, setCustom] = useState<City[]>(initialCustom);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function loadCustom() {
    try {
      const res = await fetch("/api/admin/cities");
      if (res.ok) {
        const data = (await res.json()) as { cities: City[] };
        setCustom(data.cities);
      }
    } catch {
      /* список необязателен для добавления */
    }
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(c: City) {
    setEditing(c.slug);
    setStatus(null);
    setForm({ slug: c.slug, name: c.name, kind: c.kind, lat: String(c.lat), lon: String(c.lon), yrId: c.yrId });
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ ...EMPTY });
    setStatus(null);
  }

  async function submit() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/cities", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug.trim(),
          name: form.name.trim(),
          kind: form.kind,
          lat: Number(form.lat),
          lon: Number(form.lon),
          yrId: form.yrId.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string; city?: City };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStatus({
        kind: "ok",
        text: editing ? `Сохранено: ${data.city?.name}` : `Добавлено: ${data.city?.name} (/${data.city?.slug})`,
      });
      setEditing(null);
      setForm({ ...EMPTY });
      void loadCustom();
    } catch (e) {
      setStatus({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(slug: string) {
    if (!window.confirm(`Удалить точку /${slug}?`)) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/cities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStatus({ kind: "ok", text: `Удалено: /${slug}` });
      if (editing === slug) cancelEdit();
      void loadCustom();
    } catch (e) {
      setStatus({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardTitle}>{editing ? `Редактирование /${editing}` : "Новая точка"}</div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>slug</label>
            <input
              className={styles.input}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="my-point"
              disabled={editing !== null}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Название</label>
            <input className={styles.input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Моя точка" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Тип</label>
            <select className={styles.select} value={form.kind} onChange={(e) => set("kind", e.target.value)}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.row} style={{ marginTop: 12 }}>
          <div className={styles.field}>
            <label className={styles.label}>Широта (lat)</label>
            <input className={styles.input} value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="68.97" inputMode="decimal" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Долгота (lon)</label>
            <input className={styles.input} value={form.lon} onChange={(e) => set("lon", e.target.value)} placeholder="33.09" inputMode="decimal" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>yrId</label>
            <input className={styles.input} value={form.yrId} onChange={(e) => set("yrId", e.target.value)} placeholder="2-524305" />
          </div>
        </div>
        <div className={styles.btnRow}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy} onClick={submit}>
            {busy ? "Сохранение…" : editing ? "Сохранить изменения" : "Добавить точку"}
          </button>
          {editing && (
            <button className={styles.btn} disabled={busy} onClick={cancelEdit}>
              Отмена
            </button>
          )}
        </div>
        {status && (
          <p className={`${styles.msg} ${status.kind === "ok" ? styles.msgOk : styles.msgErr}`}>{status.text}</p>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Кастомные точки ({custom.length})</div>
        {custom.length === 0 ? (
          <p className={styles.muted}>Пока нет — добавленные точки появятся здесь.</p>
        ) : (
          <ul className={styles.list}>
            {custom.map((c) => (
              <li key={c.slug} className={styles.listItem}>
                <strong>{c.name}</strong>
                <span className={styles.muted}>
                  /{c.slug} · {c.kind} · {c.lat}, {c.lon} · {c.yrId}
                </span>
                <span className={styles.spacer} />
                <button className={styles.btn} disabled={busy} onClick={() => startEdit(c)}>
                  Изм.
                </button>
                <button className={styles.btn} disabled={busy} onClick={() => remove(c.slug)}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
