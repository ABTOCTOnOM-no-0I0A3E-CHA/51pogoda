import { getCustomCities } from "@/entities/city/lib/registry";
import { CitiesManager } from "./CitiesManager";
import styles from "../../admin.module.css";

export default function AdminCitiesPage() {
  const initialCustom = getCustomCities();
  return (
    <>
      <h1 className={styles.h1}>Точки прогноза</h1>
      <p className={styles.sub}>
        Добавление новой локации. Координаты округляются MET до 4 знаков; yrId — идентификатор точки на yr.no
        (формат <code>2-XXXXXXX</code>) для метеограммы.
      </p>
      <CitiesManager initialCustom={initialCustom} />
    </>
  );
}
