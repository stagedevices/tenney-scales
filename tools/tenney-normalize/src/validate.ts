import { promises as fs } from "node:fs";
import path from "node:path";
import { listPackSlugs, loadPack, validatePackDates, validateSlugMatchesFolder } from "./pack.js";
import { packsDir } from "./utils.js";
import type { PackInputs } from "./types.js";

const MAX_SOURCE_BYTES = 200 * 1024;

export async function validatePacks(): Promise<void> {
  const slugs = await listPackSlugs();
  const errors: string[] = [];

  for (const slug of slugs) {
    try {
      const pack = await loadPack(slug);
      validateSlugMatchesFolder(pack, slug);
      validatePackDates(pack);
      await validateInputsExist(pack.inputs, slug);
      await validateSourcesSize(slug);
    } catch (error) {
      errors.push((error as Error).message);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n${errors.map((err) => `- ${err}`).join("\n")}`);
  }
}

async function validateInputsExist(inputs: PackInputs, slug: string): Promise<void> {
  const errors: string[] = [];
  if (inputs.scala) {
    const scalaPath = path.join(packsDir, slug, inputs.scala);
    try {
      await fs.access(scalaPath);
    } catch (error) {
      errors.push(`Missing scala source: ${scalaPath}. Ensure there are uploaded files in the /sources/ directory, and that they match the enumerated files in the associated github issue.`);
    }
    if (inputs.kbm) {
      const kbmPath = path.join(packsDir, slug, inputs.kbm);
      try {
        await fs.access(kbmPath);
      } catch (error) {
        errors.push(`Missing kbm source: ${kbmPath}. Ensure there are .kbm files in the /sources/ directory, and that they match the enumerated files in the associated github issue.`);
      }
    }
  }

  if (inputs.scales) {
    for (const entry of inputs.scales) {
      const scalaPath = path.join(packsDir, slug, entry.scala);
      try {
        await fs.access(scalaPath);
      } catch (error) {
        errors.push(`Missing scala source: ${scalaPath}. Ensure there are uploaded files in the /sources/ directory, and that they match the enumerated files in the associated github issue.`);
      }
      if (entry.kbm) {
        const kbmPath = path.join(packsDir, slug, entry.kbm);
        try {
          await fs.access(kbmPath);
        } catch (error) {
          errors.push(`Missing kbm source: ${kbmPath}. Ensure there are .kbm files in the /sources/ directory, and that they match the enumerated files in the associated github issue.`);
        }
      }
    }
  }

  if (!inputs.scala && (!inputs.scales || inputs.scales.length === 0)) {
    errors.push(`Pack '${slug}' must include inputs.scala or inputs.scales.`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
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
    const buffer = await fs.readFile(filePath);
    if (buffer.includes(0)) {
      throw new Error(`Source file ${filePath} appears to be binary.`);
    }
  }
}
