import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import os from "os";
import path from "path";
import type { SessionResult } from "./types";

// Use /tmp on Vercel (read-only fs except /tmp); use data/sessions locally
const DATA_DIR =
  process.env.VERCEL
    ? path.join(os.tmpdir(), "cos-sessions")
    : path.join(process.cwd(), "data", "sessions");

async function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

function getFilePath(id: string): string {
  const safeId = id.replace(/[^a-zA-Z0-9-_]/g, "_");
  return path.join(DATA_DIR, `${safeId}.json`);
}

const memoryCache = new Map<string, SessionResult>();

export async function saveSession(result: SessionResult): Promise<void> {
  memoryCache.set(result.id, result);
  try {
    await ensureDir();
    await writeFile(
      getFilePath(result.id),
      JSON.stringify(result, null, 0),
      "utf-8"
    );
  } catch (e) {
    console.error("Failed to persist session to file:", e);
  }
}

export async function getSession(id: string): Promise<SessionResult | undefined> {
  const cached = memoryCache.get(id);
  if (cached) return cached;

  try {
    const filePath = getFilePath(id);
    if (!existsSync(filePath)) return undefined;
    const data = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(data) as SessionResult;
    memoryCache.set(id, parsed);
    return parsed;
  } catch {
    return undefined;
  }
}
