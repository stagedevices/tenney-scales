import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import path from "node:path";
import { execFileSync } from "node:child_process";

const packsDir = path.join(process.cwd(), "packs");
if (!fs.existsSync(packsDir)) {
  process.exit(0);
}

const entries = fs.readdirSync(packsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());

for (const entry of entries) {
  const slug = entry.name;
  const packPath = path.join(packsDir, slug, "pack.json");
  if (!fs.existsSync(packPath)) {
    continue;
  }
    const createdAt = gitDateForFile(packJsonPath);
    const relDir = toRepoRel(packDirPath) ?? ".";
    const updatedAt = gitOut(["log", "-1", "--format=%cI", "--", relDir]);

  const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
  pack.createdAt = createdAt;
  pack.updatedAt = updatedAt;
  fs.writeFileSync(packPath, JSON.stringify(pack, null, 2) + "\n", "utf8");
}

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

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
