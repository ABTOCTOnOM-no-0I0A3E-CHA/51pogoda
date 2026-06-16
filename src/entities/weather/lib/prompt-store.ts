import "server-only";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

/*
  Системные промпты ИИ-сводки: глобальный шаблон для всех точек и опциональные
  оверрайды по slug. Хранятся в data/ai-prompts.json, редактируются из админки.
  Шаблон подставляет {city} (название) и {data} (сгенерированный блок данных) —
  сами данные собирает код, модель не должна их выдумывать. Если файла нет —
  работаем на дефолте из кода, поэтому свежий деплой сразу функционален.
*/

const DATA_DIR = join(process.cwd(), "data");
const PROMPTS_FILE = join(DATA_DIR, "ai-prompts.json");

export const DEFAULT_GLOBAL_PROMPT = [
  "Ты — метеоролог на сайте погоды Мурманской области (Заполярье, за полярным кругом). Напиши сводку для {city} на русском языке.",
  "",
  "{data}",
  "",
  "Правила:",
  '1. "accurate": 1–2 предложения о текущей погоде и прогнозе на день. Если ощущаемая температура заметно отличается от фактической — коротко объясни причину (ветер и/или влажность).',
  '2. "advice": один связный совет по одежде под текущую температуру — без противоречий, не предлагай одновременно тёплую и лёгкую одежду. Укажи, нужен ли зонт.',
  "3. СТРОГО ЗАПРЕЩЕНО упоминать солнцезащитный крем, солнечные очки и защиту от ультрафиолета — это Заполярье, солнце стоит низко над горизонтом, УФ не актуален.",
  "4. Полярный день/ночь упоминай только как факт освещённости (светло или темно круглые сутки), без советов про солнце и УФ.",
  "5. Пиши простым человеческим языком, без канцелярита.",
  "",
  'Ответь строго JSON без markdown: {"accurate":"...","advice":"..."}',
].join("\n");

export interface PromptsData {
  global: string;
  perCity: Record<string, string>;
}

/* mtime-инвалидация: render и API-роут — разные инстансы модуля (см. registry.ts). */
let cache: PromptsData | null = null;
let cachedMtime = -1;

function fileMtime(): number {
  try {
    return existsSync(PROMPTS_FILE) ? statSync(PROMPTS_FILE).mtimeMs : 0;
  } catch {
    return 0;
  }
}

function load(): PromptsData {
  const mtime = fileMtime();
  if (cache && mtime === cachedMtime) return cache;
  cachedMtime = mtime;

  let data: PromptsData = { global: DEFAULT_GLOBAL_PROMPT, perCity: {} };
  try {
    if (mtime !== 0) {
      const parsed = JSON.parse(readFileSync(PROMPTS_FILE, "utf-8")) as Partial<PromptsData>;
      data = {
        global: typeof parsed.global === "string" && parsed.global.trim() ? parsed.global : DEFAULT_GLOBAL_PROMPT,
        perCity: parsed.perCity && typeof parsed.perCity === "object" ? parsed.perCity : {},
      };
    }
  } catch {
    /* битый файл — деградируем на дефолт */
  }
  cache = data;
  return cache;
}

function persist(data: PromptsData): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(PROMPTS_FILE, JSON.stringify(data, null, 2), "utf-8");
  cache = data;
  cachedMtime = fileMtime();
}

export function reloadPrompts(): void {
  cache = null;
  cachedMtime = -1;
}

export function getPrompts(): PromptsData {
  return load();
}

/* Шаблон для конкретной точки: оверрайд по slug, иначе глобальный. */
export function getPromptTemplate(slug: string): string {
  const data = load();
  return data.perCity[slug] ?? data.global;
}

export function setGlobalPrompt(text: string): void {
  const data = load();
  persist({ global: text.trim() || DEFAULT_GLOBAL_PROMPT, perCity: data.perCity });
}

/* null/пусто — удалить оверрайд (вернуть точку на глобальный промпт). */
export function setCityPrompt(slug: string, text: string | null): void {
  const data = load();
  const perCity = { ...data.perCity };
  if (text && text.trim()) perCity[slug] = text;
  else delete perCity[slug];
  persist({ global: data.global, perCity });
}
