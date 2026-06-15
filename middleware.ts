import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_VISITS,
  COOKIE_RECENT,
  MAX_RECENT,
  COOKIE_MAX_AGE,
  parseVisits,
  serializeVisits,
  parseRecent,
} from "@/shared/lib/visit-cookie";

// Match /{city-slug} — only single-segment paths that aren't system routes
const CITY_PATH_RE = /^\/([a-z0-9][a-z0-9-]{0,60})$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = pathname.match(CITY_PATH_RE);
  if (!match) return NextResponse.next();

  const slug = match[1]!;

  const res = NextResponse.next();
  const cookieOpts = { maxAge: COOKIE_MAX_AGE, path: "/" } as const;

  // Increment visit count
  const visits = parseVisits(req.cookies.get(COOKIE_VISITS)?.value ?? "");
  visits[slug] = (visits[slug] ?? 0) + 1;
  res.cookies.set(COOKIE_VISITS, serializeVisits(visits), cookieOpts);

  // Update recent list (most recent first, no duplicates, max 5)
  const recent = parseRecent(req.cookies.get(COOKIE_RECENT)?.value ?? "").filter(
    (s) => s !== slug,
  );
  recent.unshift(slug);
  if (recent.length > MAX_RECENT) recent.length = MAX_RECENT;
  res.cookies.set(COOKIE_RECENT, recent.join(","), cookieOpts);

  return res;
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)"],
};
