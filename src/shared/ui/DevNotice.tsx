"use client";

import { useSyncExternalStore, useCallback } from "react";

const DISMISS_KEY = "dev-notice-dismissed";

/* Серверный снимок: не закрыт (показываем). */
const getServerSnapshot = (): boolean => false;

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/* Клиентский снимок: true если закрыт, false если надо показать. */
function getSnapshot(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

/* Дев-баннер: тонкая полоска поверх хедера, только в development.
   Закрывается в localStorage, не мешает просмотру. */
export function DevNotice() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const close = useCallback(() => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new StorageEvent("storage", { key: DISMISS_KEY }));
    }
  }, []);

  if (dismissed) return null;

  return (
    <div
      role="status"
      style={{
        background: "#fff8e6",
        borderBottom: "1px solid #f0dca0",
        padding: "6px 36px 6px 16px",
        position: "relative",
        fontSize: 12,
        lineHeight: 1.5,
        color: "#7a6100",
        textAlign: "center",
      }}
    >
      Проект на энтузиазме студента из Мурманска на собственные средства: 4 источника данных (основа — MET Norway)
      анализируются и сводятся в единый прогноз. В разработке — собственные метеостанции в городе.
      <button
        type="button"
        onClick={close}
        aria-label="Закрыть"
        style={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          width: 20,
          height: 20,
          border: "none",
          background: "transparent",
          color: "#b0a060",
          fontSize: 16,
          lineHeight: 1,
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ×
      </button>
    </div>
  );
}
