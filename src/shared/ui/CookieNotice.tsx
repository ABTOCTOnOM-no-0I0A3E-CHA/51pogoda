"use client";

import { useSyncExternalStore, useCallback } from "react";
import Link from "next/link";

const DISMISS_KEY = "cookie-notice-dismissed";

/* Серверный снимок: cookie-баннер скрыт (нет localStorage). */
const getServerSnapshot = (): boolean => true;

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/* Клиентский снимок: true если баннер закрыт, false если надо показать. */
function getSnapshot(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return true;
  }
}

export function CookieNotice() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const close = useCallback(() => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
    /* Триггерим обновление через synthetic storage event — useSyncExternalStore
       слушает его и перерисует компонент. */
    if (typeof window !== "undefined") {
      window.dispatchEvent(new StorageEvent("storage", { key: DISMISS_KEY }));
    }
  }, []);

  if (dismissed) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: 12,
        bottom: 12,
        maxWidth: 320,
        background: "#fff",
        border: "1px solid #dfe5ec",
        borderRadius: 10,
        padding: "10px 34px 10px 13px",
        fontSize: 11.5,
        lineHeight: 1.5,
        color: "#6d7f8e",
        boxShadow: "0 2px 10px rgba(20,33,43,.06)",
        zIndex: 50,
      }}
    >
      <span>
        Сайт использует cookie для статистики и персонализации. Подробнее — в{" "}
        <Link href="/politika" style={{ color: "#0b5cad", fontWeight: 600 }}>политике конфиденциальности</Link>.
      </span>
      <button
        type="button"
        onClick={close}
        aria-label="Закрыть"
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          width: 22,
          height: 22,
          border: "none",
          background: "transparent",
          color: "#9aa8b5",
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
