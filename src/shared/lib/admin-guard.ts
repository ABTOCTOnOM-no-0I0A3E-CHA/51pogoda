import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "./admin-session";

/*
  Проверка сессии внутри route handlers и server actions. proxy защищает
  страницы /admin, но матчер исключает /api, поэтому API-роуты проверяют
  сессию сами — defense in depth.
*/
export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}
