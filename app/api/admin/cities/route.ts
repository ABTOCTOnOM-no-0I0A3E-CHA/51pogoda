import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/shared/lib/admin-guard";
import { addCity, getCustomCities } from "@/entities/city/lib/registry";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ cities: getCustomCities() });
}

/* Добавление новой точки. Валидация и запись — в registry.addCity. */
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const result = addCity(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  /* Новая точка должна появиться на главной и в каталоге сразу */
  revalidatePath("/");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ ok: true, city: result.city });
}
