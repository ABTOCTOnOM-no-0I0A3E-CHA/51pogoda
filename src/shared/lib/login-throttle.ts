import "server-only";

/*
  Анти-брутфорс для логина админки. In-memory, по IP — рассчитано на self-hosted
  single-process (Bun/Node). Намеренно НЕ глобальный счётчик: иначе атакующий
  одним перебором залочил бы реального админа (DoS). Per-IP + задержка на неудаче.
  В multi-instance деплое счётчик у каждого инстанса свой (слабее, но приемлемо).
*/

const MAX_ATTEMPTS = 5; /* неудач в окне до блокировки */
const WINDOW_MS = 15 * 60 * 1000; /* окно подсчёта неудач */
const LOCKOUT_MS = 15 * 60 * 1000; /* длительность блокировки */
const FAIL_DELAY_MS = 400; /* задержка ответа на неверный пароль */
const MAX_ENTRIES = 10_000; /* потолок памяти от спама уникальными IP */

interface Entry {
  count: number;
  firstAt: number;
  lockedUntil: number;
}

const attempts = new Map<string, Entry>();

function prune(now: number): void {
  if (attempts.size < MAX_ENTRIES) return;
  for (const [ip, e] of attempts) {
    if (e.lockedUntil < now && now - e.firstAt > WINDOW_MS) attempts.delete(ip);
  }
}

export interface LockState {
  locked: boolean;
  retryAfterSec: number;
}

export function checkLockout(ip: string): LockState {
  const now = Date.now();
  const e = attempts.get(ip);
  if (e && e.lockedUntil > now) {
    return { locked: true, retryAfterSec: Math.ceil((e.lockedUntil - now) / 1000) };
  }
  return { locked: false, retryAfterSec: 0 };
}

/* Задержка ответа на неудачную попытку — замедляет автоматический перебор. */
export async function failDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
}

export function recordFailure(ip: string): void {
  const now = Date.now();
  prune(now);

  let e = attempts.get(ip);
  /* новое окно, если прошлого нет или оно истекло */
  if (!e || now - e.firstAt > WINDOW_MS) {
    e = { count: 0, firstAt: now, lockedUntil: 0 };
  }
  e.count += 1;
  if (e.count >= MAX_ATTEMPTS) {
    e.lockedUntil = now + LOCKOUT_MS;
    e.count = 0;
    e.firstAt = now;
  }
  attempts.set(ip, e);
}

export function recordSuccess(ip: string): void {
  attempts.delete(ip);
}
