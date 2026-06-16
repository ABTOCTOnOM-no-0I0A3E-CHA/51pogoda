"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  verifyPassword,
  createSessionToken,
  isAdminConfigured,
} from "@/shared/lib/admin-session";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) {
    return { error: "Админка не настроена: задайте ADMIN_PASSWORD в окружении" };
  }

  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    return { error: "Неверный пароль" };
  }

  const token = await createSessionToken();
  if (!token) {
    return { error: "Не настроен секрет сессии" };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
