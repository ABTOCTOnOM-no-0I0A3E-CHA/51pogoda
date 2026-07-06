import "server-only";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "contacts.json");

export interface ContactMessage {
  id: string;
  name?: string;
  email: string;
  message: string;
  createdAt: string;
}

function readAll(): ContactMessage[] {
  try {
    if (existsSync(FILE)) {
      const parsed = JSON.parse(readFileSync(FILE, "utf-8")) as unknown;
      if (Array.isArray(parsed)) return parsed as ContactMessage[];
    }
  } catch {
    /* corrupt file — start fresh */
  }
  return [];
}

function writeAll(list: ContactMessage[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(list, null, 2), "utf-8");
}

export function saveContactMessage(input: Omit<ContactMessage, "id" | "createdAt">): void {
  const list = readAll();
  list.push({
    id: randomUUID(),
    name: input.name,
    email: input.email,
    message: input.message,
    createdAt: new Date().toISOString(),
  });
  writeAll(list);
}

export function getContactMessages(): ContactMessage[] {
  return readAll();
}
