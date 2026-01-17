import { promises as fs } from "node:fs";
import path from "node:path";
import Ajv from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { packsDir, readJsonFile, stableIsoString } from "./utils.js";
import type { PackMetadata } from "./types.js";

const schemaPath = path.join(process.cwd(), "schemas", "pack.schema.json");
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
let validateSchema: Ajv.ValidateFunction | null = null;

export async function loadPack(slug: string): Promise<PackMetadata> {
  const packPath = path.join(packsDir, slug, "pack.json");
  const pack = await readJsonFile<PackMetadata>(packPath);
  await validatePackSchema(pack, packPath);
  return pack;
}

export async function listPackSlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(packsDir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export function validateSlugMatchesFolder(pack: PackMetadata, slug: string): void {
  if (pack.slug !== slug) {
    throw new Error(`Pack slug '${pack.slug}' does not match folder '${slug}'.`);
  }
}

export function validatePackDates(pack: PackMetadata): void {
  if (!pack.createdAt || !pack.updatedAt) {
    throw new Error(
      `Pack '${pack.slug}' must include createdAt and updatedAt as ISO8601 strings.`
    );
  }
  const created = Date.parse(pack.createdAt);
  const updated = Date.parse(pack.updatedAt);
  if (!Number.isFinite(created) || !Number.isFinite(updated)) {
    throw new Error(
      `Pack '${pack.slug}' createdAt/updatedAt must be ISO8601 (got ${pack.createdAt}, ${pack.updatedAt}).`
    );
  }
}

async function validatePackSchema(pack: PackMetadata, packPath: string): Promise<void> {
  if (!validateSchema) {
    const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));
    validateSchema = ajv.compile(schema);
  }
  const valid = validateSchema(pack);
  if (!valid) {
    const errors = validateSchema.errors?.map((err) => `${err.instancePath} ${err.message}`).join("; ");
    throw new Error(`Pack schema validation failed for ${packPath}: ${errors}`);
  }
}
