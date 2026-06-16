"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  verifyPassword,
  createSessionToken,
  isAdminConfigured,
} from "@/shared/lib/admin-session";
import { checkLockout, failDelay, recordFailure, recordSuccess } from "@/shared/lib/login-throttle";

export interface LoginState {
  error?: string;
}

/* Клиентский IP: первый из x-forwarded-for (за прокси), иначе fallback. */
async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) {
    return { error: "Админка не настроена: задайте ADMIN_PASSWORD в окружении" };
  }

  const ip = await clientIp();
  const lock = checkLockout(ip);
  if (lock.locked) {
    const mins = Math.ceil(lock.retryAfterSec / 60);
    return { error: `Слишком много попыток. Повторите через ${mins} мин.` };
  }

  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    recordFailure(ip);
    await failDelay();
    return { error: "Неверный пароль" };
  }

  const token = await createSessionToken();
  if (!token) {
    return { error: "Не настроен секрет сессии" };
  }

  recordSuccess(ip);
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
