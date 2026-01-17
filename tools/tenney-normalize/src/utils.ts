import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export const repoRoot = path.resolve(process.cwd());
export const packsDir = path.join(repoRoot, "packs");

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data, null, 2) + "\n";
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, json, "utf8");
}

export async function writeTextFile(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

export function formatISO8601NoMillis(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function normalizeISO8601NoMillis(input: string): string {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ISO8601 date string: ${input}`);
  }
  return formatISO8601NoMillis(parsed);
}

export function uuidV5(name: string, namespace: string): string {
  const nsBytes = uuidToBytes(namespace);
  const nameBytes = Buffer.from(name, "utf8");
  const hash = createHash("sha1");
  hash.update(Buffer.from(nsBytes));
  hash.update(nameBytes);
  const digest = hash.digest();
  digest[6] = (digest[6] & 0x0f) | 0x50;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  return bytesToUuid(digest.subarray(0, 16));
}

function uuidToBytes(uuid: string): Uint8Array {
  const clean = uuid.replace(/-/g, "");
  if (clean.length !== 32) {
    throw new Error(`Invalid UUID: ${uuid}`);
  }
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i += 1) {
    bytes[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20)}`;
}

export function formatCents(value: number): string {
  return value.toFixed(5);
}

export function log2(value: number): number {
  return Math.log(value) / Math.log(2);
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

export function reduceRatio(n: number, d: number): { n: number; d: number } {
  const divisor = gcd(n, d);
  return { n: n / divisor, d: d / divisor };
}

export function assertNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Expected ${label} to be a number.`);
  }
  return value;
}

export async function ensureDirectory(pathname: string): Promise<void> {
  await fs.mkdir(pathname, { recursive: true });
}
