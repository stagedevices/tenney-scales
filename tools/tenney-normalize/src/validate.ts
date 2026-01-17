import { promises as fs } from "node:fs";
import path from "node:path";
import { listPackSlugs, loadPack, validatePackDates, validateSlugMatchesFolder } from "./pack.js";
import { packsDir } from "./utils.js";

const MAX_SOURCE_BYTES = 2 * 1024 * 1024;

export async function validatePacks(): Promise<void> {
  const slugs = await listPackSlugs();
  const errors: string[] = [];

  for (const slug of slugs) {
    try {
      const pack = await loadPack(slug);
      validateSlugMatchesFolder(pack, slug);
      validatePackDates(pack);
      await validateInputsExist(pack, slug);
      await validateSourcesSize(slug);
    } catch (error) {
      errors.push((error as Error).message);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n${errors.map((err) => `- ${err}`).join("\n")}`);
  }
}

async function validateInputsExist(pack: { inputs: { scala: string; kbm?: string } }, slug: string) {
  const scalaPath = path.join(packsDir, slug, pack.inputs.scala);
  await fs.access(scalaPath);
  if (pack.inputs.kbm) {
    const kbmPath = path.join(packsDir, slug, pack.inputs.kbm);
    await fs.access(kbmPath);
  }
}

async function validateSourcesSize(slug: string): Promise<void> {
  const sourcesPath = path.join(packsDir, slug, "sources");
  const entries = await fs.readdir(sourcesPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    const filePath = path.join(sourcesPath, entry.name);
    const stat = await fs.stat(filePath);
    if (stat.size > MAX_SOURCE_BYTES) {
      throw new Error(`Source file ${filePath} exceeds ${MAX_SOURCE_BYTES} bytes.`);
    }
  }
}
