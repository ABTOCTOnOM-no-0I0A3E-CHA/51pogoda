import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminAuthed } from "@/shared/lib/admin-guard";
import { getPrompts, setGlobalPrompt, setCityPrompt } from "@/entities/weather/lib/prompt-store";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getPrompts());
}

/*
  Редактирование системного промпта. scope: global | <slug>.
  После сохранения сбрасываем ИИ-кеш (точечно или весь), чтобы сводки
  перегенерировались с новым промптом, не дожидаясь revalidate.
*/
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { scope?: string; text?: string };
  try {
    body = (await req.json()) as { scope?: string; text?: string };
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const scope = String(body.scope ?? "").trim();
  if (!scope) {
    return NextResponse.json({ error: "scope: global | <slug>" }, { status: 400 });
  }

  if (scope === "global") {
    setGlobalPrompt(String(body.text ?? ""));
    revalidateTag("ai", "max");
  } else {
    /* пустой text — удалить оверрайд */
    setCityPrompt(scope, body.text ?? null);
    revalidateTag(`ai:${scope}`, "max");
  }

  return NextResponse.json({ ok: true });
}
