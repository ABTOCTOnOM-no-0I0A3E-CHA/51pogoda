/* Cookie-based city visit tracking */

export const COOKIE_VISITS = "pv"; // "slug:count,slug:count"
export const COOKIE_RECENT = "pr"; // "slug,slug,slug"

const MIN_VISITS = 5;
const LEAD_FACTOR = 2;
export const MAX_RECENT = 5;
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseVisits(raw: string): Record<string, number> {
  if (!raw) return {};
  return Object.fromEntries(
    raw.split(",").flatMap((part) => {
      const idx = part.indexOf(":");
      if (idx < 1) return [];
      const slug = part.slice(0, idx);
      const count = parseInt(part.slice(idx + 1), 10);
      return slug && !isNaN(count) ? [[slug, count] as [string, number]] : [];
    }),
  );
}

export function serializeVisits(visits: Record<string, number>): string {
  return Object.entries(visits)
    .map(([k, v]) => `${k}:${v}`)
    .join(",");
}

export function parseRecent(raw: string): string[] {
  return raw ? raw.split(",").filter(Boolean) : [];
}

/** Returns preferred city slug or null (use capital) */
export function getPreferredSlug(visitsRaw: string, capitalSlug: string): string | null {
  const entries = Object.entries(parseVisits(visitsRaw)) as [string, number][];
  if (entries.length === 0) return null;

  entries.sort((a, b) => b[1] - a[1]);

  const [[topSlug, topCount], second] = [entries[0]!, entries[1]];
  const secondCount = second?.[1] ?? 0;

  if (topSlug === capitalSlug) return null;
  if (topCount >= MIN_VISITS && topCount >= secondCount * LEAD_FACTOR) return topSlug;
  return null;
}
