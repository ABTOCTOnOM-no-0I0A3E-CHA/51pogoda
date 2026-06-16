import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/shared/lib/admin-guard";
import { getAnalytics, resetAnalytics } from "@/shared/lib/analytics-store";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getAnalytics());
}

/* Полный сброс статистики просмотров. */
export async function DELETE() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  resetAnalytics();
  return NextResponse.json({ ok: true });
}
