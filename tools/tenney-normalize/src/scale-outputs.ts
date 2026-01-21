import path from "node:path";

export type ScaleOutputFiles = {
  tenney: string;
  scl: string;
  ascl: string;
  kbm: string;
};

export function resolveScaleDirName(scalaPath: string): string {
  const normalized = scalaPath.replace(/\\/g, "/");
  const withoutExtension = normalized.replace(/\.[^/.]+$/, "");
  const trimmed = withoutExtension.startsWith("sources/") ? withoutExtension.slice("sources/".length) : withoutExtension;
  return trimmed.split("/").join("-");
}

export function buildScaleOutputFiles(tenneyRoot: string, scaleDir: string): ScaleOutputFiles {
  const baseDir = scaleDir ? path.join(tenneyRoot, scaleDir) : tenneyRoot;
  return {
    tenney: path.join(baseDir, "scale-builder.json"),
    scl: path.join(baseDir, "export.scl"),
    ascl: path.join(baseDir, "export.ascl"),
    kbm: path.join(baseDir, "export.kbm")
  };
}
