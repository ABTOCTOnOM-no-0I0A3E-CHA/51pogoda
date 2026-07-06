"use client";

import { useState } from "react";
import styles from "../../admin.module.css";

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

type Status = { kind: "ok" | "err"; text: string } | null;

const EMPTY = { title: "", excerpt: "", body: "", published: false };

export function ArticlesManager({ initial }: { initial: Article[] }) {
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState<string | null>(null); /* slug в режиме правки */
  const [items, setItems] = useState<Article[]>(initial);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/articles");
      if (res.ok) {
        const data = (await res.json()) as { articles: Article[] };
        setItems(data.articles);
      }
    } catch {
      /* список необязателен для добавления */
    }
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(a: Article) {
    setEditing(a.slug);
    setStatus(null);
    setForm({ title: a.title, excerpt: a.excerpt, body: a.body, published: a.published });
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
      const res = await fetch("/api/admin/articles", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editing
            ? { slug: editing, title: form.title.trim(), excerpt: form.excerpt.trim(), body: form.body.trim(), published: form.published }
            : { title: form.title.trim(), excerpt: form.excerpt.trim(), body: form.body.trim(), published: form.published },
        ),
      });
      const data = (await res.json()) as { error?: string; article?: Article };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStatus({
        kind: "ok",
        text: editing ? `Сохранено: ${data.article?.title}` : `Добавлено: ${data.article?.title} (/articles/${data.article?.slug})`,
      });
      setEditing(null);
      setForm({ ...EMPTY });
      void load();
    } catch (e) {
      setStatus({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(slug: string) {
    if (!window.confirm(`Удалить статью /articles/${slug}?`)) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStatus({ kind: "ok", text: `Удалено: /articles/${slug}` });
      if (editing === slug) cancelEdit();
      void load();
    } catch (e) {
      setStatus({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardTitle}>{editing ? `Редактирование /articles/${editing}` : "Новая статья"}</div>
        <div className={styles.row}>
          <div className={styles.field} style={{ flex: 1, minWidth: 240 }}>
            <label className={styles.label}>Заголовок</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Полярный день в Мурманске"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Опубликована</label>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
              style={{ alignSelf: "flex-start", marginTop: 9, width: 20, height: 20 }}
            />
          </div>
        </div>
        <div className={styles.field} style={{ marginTop: 12 }}>
          <label className={styles.label}>Краткое описание</label>
          <textarea
            className={styles.textarea}
            style={{ minHeight: 80 }}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="1–2 предложения для списка статей"
          />
        </div>
        <div className={styles.field} style={{ marginTop: 12 }}>
          <label className={styles.label}>Текст</label>
          <textarea
            className={styles.textarea}
            style={{ minHeight: 400 }}
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder="Полный текст статьи. Абзацы разделяйте пустой строкой."
          />
        </div>
        <div className={styles.btnRow}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy} onClick={submit}>
            {busy ? "Сохранение…" : editing ? "Сохранить изменения" : "Добавить статью"}
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
        <div className={styles.cardTitle}>Статьи ({items.length})</div>
        {items.length === 0 ? (
          <p className={styles.muted}>Пока нет — добавленные статьи появятся здесь.</p>
        ) : (
          <ul className={styles.list}>
            {items.map((a) => (
              <li key={a.slug} className={styles.listItem}>
                <strong>{a.title}</strong>
                <span className={styles.muted}>
                  /articles/{a.slug} · {a.published ? "опубл." : "черновик"} · {new Date(a.createdAt).toLocaleDateString("ru-RU")}
                </span>
                <span className={styles.spacer} />
                <button className={styles.btn} disabled={busy} onClick={() => startEdit(a)}>
                  Изм.
                </button>
                <button className={styles.btn} disabled={busy} onClick={() => remove(a.slug)}>
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
