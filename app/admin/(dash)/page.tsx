import Link from "next/link";
import { getAllCities, getCustomCities } from "@/entities/city/lib/registry";
import { getPrompts } from "@/entities/weather/lib/prompt-store";
import styles from "../admin.module.css";

export default function AdminDashboard() {
  const total = getAllCities().length;
  const custom = getCustomCities().length;
  const prompts = getPrompts();
  const overrides = Object.keys(prompts.perCity).length;

  return (
    <>
      <h1 className={styles.h1}>Обзор</h1>
      <p className={styles.sub}>Управление кешем, промптами ИИ и точками прогноза.</p>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Состояние</div>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            Всего точек: <strong>{total}</strong>
            <span className={styles.muted}>· из них кастомных: {custom}</span>
          </li>
          <li className={styles.listItem}>
            Промпты ИИ: <strong>глобальный</strong>
            <span className={styles.muted}>· оверрайдов по городам: {overrides}</span>
          </li>
        </ul>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Разделы</div>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <Link className={styles.navLink} href="/admin/cache">
              Кеш
            </Link>
            <span className={styles.muted}>сброс погоды и ИИ-сводок</span>
          </li>
          <li className={styles.listItem}>
            <Link className={styles.navLink} href="/admin/prompts">
              Промпты
            </Link>
            <span className={styles.muted}>системный промпт ИИ</span>
          </li>
          <li className={styles.listItem}>
            <Link className={styles.navLink} href="/admin/cities">
              Точки
            </Link>
            <span className={styles.muted}>добавление новой локации</span>
          </li>
        </ul>
      </div>
    </>
  );
}
