import path from "node:path";
import { listPackSlugs, loadPack } from "./pack.js";
import { packsDir, writeJsonFile, normalizeISO8601NoMillis } from "./utils.js";

export type IndexEntry = {
  slug: string;
  title: string;
  description: string;
  author: string;
  authorUrl?: string;
  license: "CC0-1.0";
  tags: string[];
  defaults: { rootHz: number; primeLimit: number };
  files: {
    tenney: string;
    scl: string;
    ascl: string;
    kbm: string;
  };
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
    packs.push({
      slug: pack.slug,
      title: pack.title,
      description: pack.description,
      author: pack.author,
      authorUrl: pack.authorUrl,
      license: pack.license,
      tags: pack.tags,
      defaults: pack.defaults,
      files: {
        tenney: path.join("packs", slug, "tenney", "scale-builder.json"),
        scl: path.join("packs", slug, "tenney", "export.scl"),
        ascl: path.join("packs", slug, "tenney", "export.ascl"),
        kbm: path.join("packs", slug, "tenney", "export.kbm")
      }
    });
  }

  const index = {
    schemaVersion: 1,
    generatedAt,
    packs
  };

  await writeJsonFile(path.join(packsDir, "..", "INDEX.json"), index);
}
