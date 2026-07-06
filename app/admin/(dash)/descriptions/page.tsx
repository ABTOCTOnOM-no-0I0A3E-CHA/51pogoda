import { getAllCities } from "@/entities/city/lib/registry";
import { getAllDescriptions } from "@/entities/city/lib/city-descriptions";
import { DescriptionsManager } from "./DescriptionsManager";
import styles from "../../admin.module.css";

export default function AdminDescriptionsPage() {
  const cities = getAllCities()
    .map((c) => ({ slug: c.slug, name: c.name, kind: c.kind }))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  const descriptions = getAllDescriptions();

  return (
    <>
      <h1 className={styles.h1}>Описания городов</h1>
      <p className={styles.sub}>
        Авторский текст про точку (2–5 предложений) показывается в SEO-блоке внизу страницы города вместо
        генерического описания. Сохранение сразу инвалидирует кеш страницы.
      </p>
      <DescriptionsManager cities={cities} descriptions={descriptions} />
    </>
  );
}
