/*
  Авторизация админки без БД и регистрации: один пароль (ADMIN_PASSWORD)
  обменивается на подписанную HMAC-сессию в httpOnly-куке. Stateless —
  переживает рестарты, не требует хранилища. Подпись на Web Crypto, поэтому
  модуль работает и в proxy (Node-рантайм), и в route handlers.
*/

export const ADMIN_COOKIE = "__pz_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; /* неделя */

const encoder = new TextEncoder();

/* Секрет подписи: отдельный ключ, иначе деградируем на сам пароль. */
function sessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  return secret && secret.length > 0 ? secret : null;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function base64url(bytes: ArrayBuffer): string {
  const b = Buffer.from(bytes);
  return b.toString("base64url");
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64url(sig);
}

/* Константное по времени сравнение строк равной длины. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* Проверка пароля при логине. */
export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return password.length === expected.length && timingSafeEqual(password, expected);
}

/* Создаёт значение куки: <exp>.<hmac(exp)>. */
export async function createSessionToken(): Promise<string | null> {
  const secret = sessionSecret();
  if (!secret) return null;
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${await hmac(exp, secret)}`;
}

/* Валидна ли сессия: не истекла и подпись совпадает. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = sessionSecret();
  if (!secret) return false;

  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;

  const expected = await hmac(payload, secret);
  return timingSafeEqual(sig, expected);
}

export const SESSION_MAX_AGE = Math.floor(SESSION_TTL_MS / 1000);
