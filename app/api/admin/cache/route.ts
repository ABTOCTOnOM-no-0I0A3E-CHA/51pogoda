import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminAuthed } from "@/shared/lib/admin-guard";

/*
  Принудительный сброс кеша. type: weather | ai; scope: all | <slug>.
  Сброс по тегам, расставленным в met-client (weather) и ai-summary (ai).
*/
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { type?: string; slug?: string };
  try {
    body = (await req.json()) as { type?: string; slug?: string };
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const { type, slug } = body;
  if (type !== "weather" && type !== "ai") {
    return NextResponse.json({ error: "type: weather | ai" }, { status: 400 });
  }

  const tag = slug ? `${type}:${slug}` : type;
  revalidateTag(tag, "max");

  return NextResponse.json({ ok: true, revalidated: tag });
}
