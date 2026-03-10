import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type RequestStatus = "paid" | "played" | "cancelled";

export type RequestItem = {
  id: string;
  song: string;
  artist?: string;
  requesterName?: string;
  amount: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "requests.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

async function readAll(): Promise<RequestItem[]> {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RequestItem[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(items: RequestItem[]) {
  await ensureStore();
  await fs.writeFile(dataFile, JSON.stringify(items, null, 2), "utf8");
}

export async function listRequests(): Promise<RequestItem[]> {
  const items = await readAll();
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createRequest(input: {
  song: string;
  artist?: string;
  requesterName?: string;
  amount?: number;
}): Promise<RequestItem> {
  const now = new Date().toISOString();
  const item: RequestItem = {
    id: crypto.randomUUID(),
    song: input.song.trim(),
    artist: input.artist?.trim() || undefined,
    requesterName: input.requesterName?.trim() || undefined,
    amount: typeof input.amount === "number" ? input.amount : 0,
    status: "paid",
    createdAt: now,
    updatedAt: now,
  };

  const items = await readAll();
  items.unshift(item);
  await writeAll(items);
  return item;
}

export async function updateRequest(
  id: string,
  patch: Partial<Pick<RequestItem, "status" | "song" | "artist" | "requesterName" | "amount">>
): Promise<RequestItem | null> {
  const items = await readAll();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  const updated: RequestItem = {
    ...items[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  items[index] = updated;
  await writeAll(items);
  return updated;
}

export async function deleteRequest(id: string): Promise<boolean> {
  const items = await readAll();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) {
    return false;
  }
  await writeAll(next);
  return true;
}
