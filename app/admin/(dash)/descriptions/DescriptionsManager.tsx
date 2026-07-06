"use client";

import { useState } from "react";
import styles from "../../admin.module.css";

interface CityOpt {
  slug: string;
  name: string;
  kind: string;
}

interface DescriptionEntry {
  slug: string;
  description: string;
  updatedAt: string;
}

type Status = { kind: "ok" | "err"; text: string } | null;

interface Props {
  cities: CityOpt[];
  descriptions: Record<string, DescriptionEntry>;
}

export function DescriptionsManager({ cities, descriptions }: Props) {
  const [store, setStore] = useState<Record<string, DescriptionEntry>>(descriptions);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  function startEdit(slug: string) {
    setEditing(slug);
    setStatus(null);
    setDraft(store[slug]?.description ?? "");
  }

  function cancelEdit() {
    setEditing(null);
    setDraft("");
    setStatus(null);
  }

  async function save() {
    if (!editing) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/descriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: editing, description: draft }),
      });
      const data = (await res.json()) as { error?: string; description?: DescriptionEntry };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStore((prev) => ({ ...prev, [editing]: data.description! }));
      setStatus({ kind: "ok", text: `Сохранено: /${editing}` });
      cancelEdit();
    } catch (e) {
      setStatus({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(slug: string) {
    if (!window.confirm(`Удалить описание для /${slug}?`)) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/descriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStore((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
      setStatus({ kind: "ok", text: `Удалено: /${slug}` });
      if (editing === slug) cancelEdit();
    } catch (e) {
      setStatus({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  if (cities.length === 0) {
    return <p className={styles.muted}>Города не найдены.</p>;
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Города ({cities.length})</div>
      <ul className={styles.list}>
        {cities.map((c) => {
          const has = Boolean(store[c.slug]);
          const isOpen = editing === c.slug;
          return (
            <li key={c.slug} className={styles.listItem} style={{ flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                <strong>{c.name}</strong>
                <span className={styles.muted}>
                  /{c.slug} · {c.kind} · {has ? "есть описание" : "нет описания"}
                </span>
              </div>
              <span className={styles.spacer} />
              <button className={styles.btn} disabled={busy} onClick={() => (isOpen ? cancelEdit() : startEdit(c.slug))}>
                {isOpen ? "Скрыть" : "Изм."}
              </button>
              <button className={styles.btn} disabled={busy || !has} onClick={() => remove(c.slug)}>
                Удалить
              </button>

              {isOpen && (
                <div style={{ width: "100%", marginTop: 10 }}>
                  <textarea
                    className={styles.textarea}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="2–5 предложений о городе: расположение, население, особенности."
                    spellCheck={false}
                  />
                  <div className={styles.btnRow}>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy} onClick={save}>
                      {busy ? "Сохранение…" : "Сохранить"}
                    </button>
                    <button className={styles.btn} disabled={busy} onClick={cancelEdit}>
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {status && (
        <p className={`${styles.msg} ${status.kind === "ok" ? styles.msgOk : styles.msgErr}`} style={{ marginTop: 12 }}>
          {status.text}
        </p>
      )}
    </div>
  );
}
