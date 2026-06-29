import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isAdminAuthed } from "@/shared/lib/admin-guard";
import { addCity, updateCity, deleteCity, getCustomCities } from "@/entities/city/lib/registry";

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/* Точка добавлена/изменена/удалена — обновляем главную, карту сайта и её страницу. */
function revalidateCity(slug: string): void {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/${slug}`);
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ cities: getCustomCities() });
}

/* Добавление новой точки. */
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: "bad json" }, { status: 400 });

  const result = addCity(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  revalidateCity(result.city!.slug);
  return NextResponse.json({ ok: true, city: result.city });
}

/* Редактирование кастомной точки (slug в теле — кого правим). */
export async function PUT(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: "bad json" }, { status: 400 });

  const slug = String(body.slug ?? "").trim();
  const result = updateCity(slug, body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  /* Координаты/имя могли измениться — сбрасываем кеши погоды и ИИ этой точки */
  revalidateTag(`weather:${slug}`, "max");
  revalidateTag(`ai:${slug}`, "max");
  revalidateCity(slug);
  return NextResponse.json({ ok: true, city: result.city });
}

/* Удаление кастомной точки. */
export async function DELETE(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: "bad json" }, { status: 400 });

  const slug = String(body.slug ?? "").trim();
  const result = deleteCity(slug);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  revalidateTag(`weather:${slug}`, "max");
  revalidateTag(`ai:${slug}`, "max");
  revalidateCity(slug);
  return NextResponse.json({ ok: true });
}
