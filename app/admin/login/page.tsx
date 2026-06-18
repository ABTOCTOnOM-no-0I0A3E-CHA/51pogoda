"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";
import styles from "../admin.module.css";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <h1 className={styles.h1}>Админка</h1>
        <p className={styles.sub}>Норметео</p>
        <form action={action}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Пароль
            </label>
            <input
              className={styles.input}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
            />
          </div>
          <div className={styles.btnRow}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={pending}>
              {pending ? "Вход…" : "Войти"}
            </button>
          </div>
          {state.error && <p className={`${styles.msg} ${styles.msgErr}`}>{state.error}</p>}
        </form>
      </div>
    </div>
  );
}
