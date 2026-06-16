import "server-only";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_GLOBAL_PROMPT } from "./prompt-template";

/*
  Системные промпты ИИ-сводки: глобальный шаблон для всех точек и опциональные
  оверрайды по slug. Хранятся в data/ai-prompts.json, редактируются из админки.
  Шаблон и его рендер — в prompt-template.ts (чистый модуль). Если файла нет —
  работаем на дефолте из кода, поэтому свежий деплой сразу функционален.
*/

const DATA_DIR = join(process.cwd(), "data");
const PROMPTS_FILE = join(DATA_DIR, "ai-prompts.json");

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
