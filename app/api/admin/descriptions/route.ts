import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/shared/lib/admin-guard";
import {
  getAllDescriptions,
  setDescription,
  deleteDescription,
} from "@/entities/city/lib/city-descriptions";

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/* Описание обновлено — сбрасываем кеш динамической страницы города и её URL. */
function revalidateCityPage(slug: string): void {
  revalidatePath("/[city]", "page");
  revalidatePath(`/${slug}`);
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ descriptions: getAllDescriptions() });
}

/* Upsert описания для slug. */
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: "bad json" }, { status: 400 });

  const slug = String(body.slug ?? "").trim();
  const description = typeof body.description === "string" ? body.description : "";
  const result = setDescription(slug, description);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  revalidateCityPage(slug);
  return NextResponse.json({ ok: true, description: result.description });
}

/* Тот же upsert через PUT — симметрия с /api/admin/cities. */
export async function PUT(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: "bad json" }, { status: 400 });

  const slug = String(body.slug ?? "").trim();
  const description = typeof body.description === "string" ? body.description : "";
  const result = setDescription(slug, description);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  revalidateCityPage(slug);
  return NextResponse.json({ ok: true, description: result.description });
}

/* Удаление описания для slug. */
export async function DELETE(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: "bad json" }, { status: 400 });

  const slug = String(body.slug ?? "").trim();
  const result = deleteDescription(slug);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  revalidateCityPage(slug);
  return NextResponse.json({ ok: true });
}
