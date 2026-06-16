import { getAllCities } from "@/entities/city/lib/registry";
import { CacheManager } from "./CacheManager";
import styles from "../../admin.module.css";

export default function AdminCachePage() {
  const cities = getAllCities()
    .map((c) => ({ slug: c.slug, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));

  return (
    <>
      <h1 className={styles.h1}>Кеш</h1>
      <p className={styles.sub}>Принудительный сброс серверного кеша по тегам.</p>
      <CacheManager cities={cities} />
    </>
  );
}
