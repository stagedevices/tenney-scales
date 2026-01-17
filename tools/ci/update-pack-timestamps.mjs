import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const packsDir = path.join(repoRoot, "packs");
if (!fs.existsSync(packsDir)) {
  process.exit(0);
}

const entries = fs.readdirSync(packsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());

for (const entry of entries) {
  const slug = entry.name;
    const packDirPath = path.join(packsDir, slug);
    const packPath = path.join(packDirPath, "pack.json");
  if (!fs.existsSync(packPath)) {
    continue;
  }
    const createdAt = isoZSeconds(gitDateForFile(packPath));
      const relDir = toRepoRel(packDirPath) ?? ".";
  let updatedAt = "";
     try {
         updatedAt = gitOut(["log", "-1", "--format=%cI", "--", relDir]);
      } catch {}
    if (!updatedAt) updatedAt = gitOut(["show", "-s", "--format=%cI", "HEAD"]);
    updatedAt = isoZSeconds(updatedAt);

  const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
  pack.createdAt = createdAt;
  pack.updatedAt = updatedAt;
  fs.writeFileSync(packPath, JSON.stringify(pack, null, 2) + "\n", "utf8");
}

function toRepoRel(p) {
  const rel = path.relative(repoRoot, p);
  if (!rel || rel.startsWith("..")) return null;
  return rel.split(path.sep).join("/"); // POSIX for git
}

function gitOut(args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
}

function gitDateForFile(absPath, fallbackHead = true) {
  const rel = toRepoRel(absPath);
  if (!rel) {
    if (!fallbackHead) throw new Error(`Path is outside repo: ${absPath}`);
    return gitOut(["show", "-s", "--format=%cI", "HEAD"]);
  }
  try {
    const out = gitOut(["log", "--follow", "--reverse", "-1", "--format=%cI", "--", rel]);
    if (out) return out;
  } catch {}
  if (!fallbackHead) throw new Error(`No git history for: ${rel}`);
  return gitOut(["show", "-s", "--format=%cI", "HEAD"]);
}

function isoZSeconds(isoLike) {
  // Accepts "2026-01-16T16:12:34+00:00" or "2026-01-16T16:12:34Z" etc.
  // Produces strict "YYYY-MM-DDTHH:MM:SSZ" (no milliseconds).
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid ISO date from git: ${isoLike}`);
  }
  return d.toISOString().slice(0, 19) + "Z";
}
