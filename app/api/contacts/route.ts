import { NextResponse } from "next/server";
import { saveContactMessage } from "@/shared/lib/contacts-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const website = typeof body.website === "string" ? body.website : "";
  if (website) return NextResponse.json({ ok: true });

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const name =
    typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Сообщение должно быть не короче 10 символов" },
      { status: 400 },
    );
  }

  try {
    saveContactMessage({ name, email, message });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/contacts]", (e as Error).message);
    return NextResponse.json(
      { error: "Не удалось сохранить сообщение" },
      { status: 500 },
    );
  }
}
