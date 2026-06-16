import { getAllCities } from "@/entities/city/lib/registry";
import { getPrompts } from "@/entities/weather/lib/prompt-store";
import { PromptsManager } from "./PromptsManager";
import styles from "../../admin.module.css";

export default function AdminPromptsPage() {
  const cities = getAllCities()
    .map((c) => ({ slug: c.slug, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  const prompts = getPrompts();

  return (
    <>
      <h1 className={styles.h1}>Промпты ИИ</h1>
      <p className={styles.sub}>
        Плейсхолдеры: <code>{"{city}"}</code> — название точки, <code>{"{data}"}</code> — блок фактических данных
        (собирается кодом). Оверрайд по городу заменяет глобальный промпт целиком.
      </p>
      <PromptsManager cities={cities} initialGlobal={prompts.global} initialPerCity={prompts.perCity} />
    </>
  );
}
