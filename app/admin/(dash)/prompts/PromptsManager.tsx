"use client";

import { useState } from "react";
import styles from "../../admin.module.css";

interface CityOpt {
  slug: string;
  name: string;
}

type Status = { kind: "ok" | "err"; text: string } | null;

interface Props {
  cities: CityOpt[];
  initialGlobal: string;
  initialPerCity: Record<string, string>;
}

async function savePrompt(scope: string, text: string): Promise<void> {
  const res = await fetch("/api/admin/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope, text }),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
}

export function PromptsManager({ cities, initialGlobal, initialPerCity }: Props) {
  const [global, setGlobal] = useState(initialGlobal);
  const [perCity, setPerCity] = useState<Record<string, string>>(initialPerCity);

  const [scope, setScope] = useState("global"); /* "global" | slug */
  const [draft, setDraft] = useState(initialGlobal);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  function selectScope(next: string) {
    setScope(next);
    setStatus(null);
    setDraft(next === "global" ? global : (perCity[next] ?? ""));
  }

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      await savePrompt(scope, draft);
      if (scope === "global") {
        setGlobal(draft);
      } else {
        setPerCity((prev) => {
          const next = { ...prev };
          if (draft.trim()) next[scope] = draft;
          else delete next[scope];
          return next;
        });
      }
      setStatus({ kind: "ok", text: "Сохранено, ИИ-кеш сброшен" });
    } catch (e) {
      setStatus({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const isCity = scope !== "global";
  const hasOverride = isCity && Boolean(perCity[scope]);

  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Промпт</label>
          <select className={styles.select} value={scope} onChange={(e) => selectScope(e.target.value)}>
            <option value="global">Глобальный (все точки)</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
                {perCity[c.slug] ? " ●" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isCity && !hasOverride && (
        <p className={`${styles.sub}`} style={{ marginTop: 12, marginBottom: 6 }}>
          У этой точки нет оверрайда — используется глобальный промпт. Заполните поле, чтобы создать оверрайд.
          Пустое значение удалит оверрайд.
        </p>
      )}

      <div className={styles.field} style={{ marginTop: 12 }}>
        <textarea
          className={styles.textarea}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className={styles.btnRow}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy} onClick={save}>
          {busy ? "Сохранение…" : "Сохранить"}
        </button>
        {isCity && hasOverride && (
          <button
            className={styles.btn}
            disabled={busy}
            onClick={() => {
              setDraft("");
            }}
          >
            Очистить поле (удалит оверрайд при сохранении)
          </button>
        )}
      </div>

      {status && (
        <p className={`${styles.msg} ${status.kind === "ok" ? styles.msgOk : styles.msgErr}`}>{status.text}</p>
      )}
    </div>
  );
}
