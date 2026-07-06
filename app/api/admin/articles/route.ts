import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/shared/lib/admin-guard";
import { getArticles, addArticle, updateArticle, deleteArticle } from "@/entities/article/article-store";

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/* Статья добавлена/изменена/удалена — обновляем список и её страницу. */
function revalidateArticle(slug: string): void {
  revalidatePath("/articles");
  revalidatePath(`/articles/${slug}`);
  revalidatePath("/");
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ articles: getArticles() });
}

/* Добавление новой статьи. */
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: "bad json" }, { status: 400 });

  const result = addArticle({
    title: String(body.title ?? ""),
    excerpt: String(body.excerpt ?? ""),
    body: String(body.body ?? ""),
    published: body.published === true,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  revalidateArticle(result.article!.slug);
  return NextResponse.json({ ok: true, article: result.article });
}

/* Редактирование статьи (slug в теле — кого правим). */
export async function PUT(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: "bad json" }, { status: 400 });

  const slug = String(body.slug ?? "").trim();
  const result = updateArticle(slug, {
    title: body.title !== undefined ? String(body.title) : undefined,
    excerpt: body.excerpt !== undefined ? String(body.excerpt) : undefined,
    body: body.body !== undefined ? String(body.body) : undefined,
    published: body.published !== undefined ? body.published === true : undefined,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  revalidateArticle(result.article!.slug);
  return NextResponse.json({ ok: true, article: result.article });
}

/* Удаление статьи. */
export async function DELETE(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: "bad json" }, { status: 400 });

  const slug = String(body.slug ?? "").trim();
  const result = deleteArticle(slug);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  revalidateArticle(slug);
  return NextResponse.json({ ok: true });
}
