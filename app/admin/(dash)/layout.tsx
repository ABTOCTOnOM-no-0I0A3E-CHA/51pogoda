import Link from "next/link";
import { logoutAction } from "../actions";
import styles from "../admin.module.css";

export const metadata = { title: "Админка", robots: { index: false, follow: false } };

/* Админка всегда читает рантайм-данные (города, промпты) — не пререндерим */
export const dynamic = "force-dynamic";

/* Все страницы под этой группой защищены proxy (редирект на /admin/login). */
export default function AdminDashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <Link className={styles.navLink} href="/admin">
          Обзор
        </Link>
        <Link className={styles.navLink} href="/admin/analytics">
          Аналитика
        </Link>
        <Link className={styles.navLink} href="/admin/cache">
          Кеш
        </Link>
        <Link className={styles.navLink} href="/admin/prompts">
          Промпты
        </Link>
        <Link className={styles.navLink} href="/admin/cities">
          Точки
        </Link>
        <span className={styles.spacer} />
        <form action={logoutAction}>
          <button className={styles.btn} type="submit">
            Выйти
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
