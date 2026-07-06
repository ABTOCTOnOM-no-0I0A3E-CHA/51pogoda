import "server-only";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { slugify } from "./slugify";

/*
  Статьи о погоде Заполярья. Хранятся в data/articles.json, редактируются
  из админки. Если файла нет — работаем с пустым списком, поэтому свежий
  деплой сразу функционален.
*/

const DATA_DIR = join(process.cwd(), "data");
const ARTICLES_FILE = join(DATA_DIR, "articles.json");

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

/* mtime-инвалидация: render и API-роут — разные инстансы модуля. */
let cache: Article[] | null = null;
let cachedMtime = -1;

function fileMtime(): number {
  try {
    return existsSync(ARTICLES_FILE) ? statSync(ARTICLES_FILE).mtimeMs : 0;
  } catch (e) {
    console.warn(`[article-store] fileMtime: ${(e as Error).message}`);
    return 0;
  }
}

function isArticle(v: unknown): v is Article {
  if (typeof v !== "object" || v === null) return false;
  const a = v as Record<string, unknown>;
  return (
    typeof a.slug === "string" &&
    typeof a.title === "string" &&
    typeof a.excerpt === "string" &&
    typeof a.body === "string" &&
    typeof a.createdAt === "string" &&
    typeof a.updatedAt === "string" &&
    typeof a.published === "boolean"
  );
}

function load(): Article[] {
  const mtime = fileMtime();
  if (cache && mtime === cachedMtime) return cache;
  cachedMtime = mtime;

  let data: Article[] = [];
  try {
    if (mtime !== 0) {
      const parsed = JSON.parse(readFileSync(ARTICLES_FILE, "utf-8")) as unknown;
      if (Array.isArray(parsed)) data = parsed.filter(isArticle);
    }
  } catch (e) {
    console.warn(`[article-store] load: ${(e as Error).message} — деградация на пустой список`);
  }
  cache = data;
  return cache;
}

function persist(data: Article[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(ARTICLES_FILE, JSON.stringify(data, null, 2), "utf-8");
  cache = data;
  cachedMtime = fileMtime();
}

export function getArticles(): Article[] {
  return load();
}

export function getPublishedArticles(): Article[] {
  return load()
    .filter((a) => a.published)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getArticle(slug: string): Article | null {
  return load().find((a) => a.slug === slug) ?? null;
}

export function addArticle(data: {
  title: string;
  excerpt: string;
  body: string;
  published: boolean;
}): { ok: true; article: Article } | { ok: false; error: string } {
  const title = data.title.trim();
  const excerpt = data.excerpt.trim();
  const body = data.body.trim();
  if (!title) return { ok: false, error: "Заголовок пуст" };
  if (!body) return { ok: false, error: "Текст пуст" };

  const articles = load();
  const slug = slugify(title);
  if (!slug) return { ok: false, error: "Не удалось сгенерировать slug" };
  if (articles.some((a) => a.slug === slug)) return { ok: false, error: `Статья /${slug} уже есть` };

  const now = new Date().toISOString();
  const article: Article = { slug, title, excerpt, body, createdAt: now, updatedAt: now, published: data.published };
  persist([...articles, article]);
  return { ok: true, article };
}

export function updateArticle(
  slug: string,
  data: { title?: string; excerpt?: string; body?: string; published?: boolean },
): { ok: true; article: Article } | { ok: false; error: string } {
  const articles = load();
  const idx = articles.findIndex((a) => a.slug === slug);
  if (idx === -1) return { ok: false, error: `Статья /${slug} не найдена` };

  const cur = articles[idx]!;
  const title = data.title !== undefined ? data.title.trim() : cur.title;
  const excerpt = data.excerpt !== undefined ? data.excerpt.trim() : cur.excerpt;
  const body = data.body !== undefined ? data.body.trim() : cur.body;
  const published = data.published !== undefined ? data.published : cur.published;
  if (!title) return { ok: false, error: "Заголовок пуст" };
  if (!body) return { ok: false, error: "Текст пуст" };

  const updated: Article = { ...cur, title, excerpt, body, published, updatedAt: new Date().toISOString() };
  const next = [...articles];
  next[idx] = updated;
  persist(next);
  return { ok: true, article: updated };
}

export function deleteArticle(slug: string): { ok: true } | { ok: false; error: string } {
  const articles = load();
  if (!articles.some((a) => a.slug === slug)) return { ok: false, error: `Статья /${slug} не найдена` };
  persist(articles.filter((a) => a.slug !== slug));
  return { ok: true };
}
