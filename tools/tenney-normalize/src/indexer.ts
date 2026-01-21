import { promises as fs } from "node:fs";
import path from "node:path";
import { listPackSlugs, loadPack } from "./pack.js";
import { buildScaleOutputFiles, resolveScaleDirName } from "./scale-outputs.js";
import { parseScala } from "./scala.js";
import type { PackScaleInput, PackInputs } from "./types.js";
import { packsDir, writeJsonFile, normalizeISO8601NoMillis } from "./utils.js";

type IndexScaleEntry = {
  title: string;
  scalaPath: string;
  files: ReturnType<typeof buildScaleOutputFiles>;
};

export type IndexEntry = {
  slug: string;
  title: string;
  description: string;
  author: string;
  authorUrl?: string;
  license: "CC0-1.0";
  tags: string[];
  defaults: { rootHz: number; primeLimit: number };
  scales: IndexScaleEntry[];
};

export async function generateIndex(): Promise<void> {
  const slugs = await listPackSlugs();
  const packs: IndexEntry[] = [];
  let generatedAt = "2026-01-01T00:00:00Z";

  for (const slug of slugs) {
    const pack = await loadPack(slug);
    if (pack.updatedAt) {
      const updated = normalizeISO8601NoMillis(pack.updatedAt);
      if (updated > generatedAt) {
        generatedAt = updated;
      }
    }
    const scaleInputs = resolveScaleInputs(pack.inputs);
    const useScaleSubdir = Boolean(pack.inputs.scales && pack.inputs.scales.length > 0);
    const scales = await Promise.all(
      scaleInputs.map(async (input) => buildScaleEntry(pack.title, slug, input, useScaleSubdir))
    );

    packs.push({
      slug: pack.slug,
      title: pack.title,
      description: pack.description,
      author: pack.author,
      authorUrl: pack.authorUrl,
      license: pack.license,
      tags: pack.tags,
      defaults: pack.defaults,
      scales
    });
  }

  const index = {
    schemaVersion: 2,
    generatedAt,
    packs
  };

  await writeJsonFile(path.join(packsDir, "..", "INDEX.json"), index);
}

function resolveScaleInputs(inputs: PackInputs): PackScaleInput[] {
  if (inputs.scales && inputs.scales.length > 0) {
    return inputs.scales;
  }
  if (inputs.scala) {
    return [{ scala: inputs.scala, kbm: inputs.kbm }];
  }
  throw new Error("Pack inputs must include scala or scales.");
}

async function buildScaleEntry(
  packTitle: string,
  slug: string,
  input: PackScaleInput,
  useScaleSubdir: boolean
): Promise<IndexScaleEntry> {
  const scalaPath = path.join("packs", slug, input.scala);
  const scalaAbsolutePath = path.join(packsDir, slug, input.scala);
  const scalaRaw = await parseScalaFile(scalaAbsolutePath);
  const title = packTitle || scalaRaw.description;
  const scaleDir = useScaleSubdir ? resolveScaleDirName(input.scala) : "";

  return {
    title,
    scalaPath,
    files: buildScaleOutputFiles(path.join("packs", slug, "tenney"), scaleDir)
  };
}

async function parseScalaFile(filePath: string) {
  const scalaRaw = await fs.readFile(filePath, "utf8");
  return parseScala(scalaRaw);
}
