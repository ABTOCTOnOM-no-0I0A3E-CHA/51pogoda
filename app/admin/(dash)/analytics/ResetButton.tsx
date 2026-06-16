"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

export function ResetButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function reset() {
    if (!window.confirm("Сбросить всю статистику просмотров?")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/analytics", { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch {
      /* тихо — не критично */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className={styles.btn} disabled={busy} onClick={reset}>
      {busy ? "Сброс…" : "Сбросить статистику"}
    </button>
  );
}
