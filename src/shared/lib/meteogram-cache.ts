import { promises as fs } from "node:fs";
import path from "node:path";

const CACHE_DIR = path.join(process.cwd(), ".cache", "meteogram");
const CACHE_TTL_MS = 3_600_000;

function cachePath(id: string): string {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(CACHE_DIR, `${safe}.svg`);
}

export async function getCached(id: string): Promise<string | null> {
  try {
    const file = cachePath(id);
    const stat = await fs.stat(file);
    if (Date.now() - stat.mtimeMs < CACHE_TTL_MS) {
      return await fs.readFile(file, "utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCache(id: string, svg: string): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cachePath(id), svg, "utf-8");
  } catch {
    /* cache write failure is non-fatal */
  }
}
