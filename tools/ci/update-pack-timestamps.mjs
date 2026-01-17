import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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
  const createdAt = gitDate(`git log --follow --reverse -1 --format=%cI -- ${packPath}`);
  const updatedAt = gitDate(`git log -1 --format=%cI -- ${path.join(packsDir, slug)}`);
  const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
  pack.createdAt = createdAt;
  pack.updatedAt = updatedAt;
  fs.writeFileSync(packPath, JSON.stringify(pack, null, 2) + "\n", "utf8");
}

function gitDate(command) {
  const raw = execSync(command, { encoding: "utf8" }).trim();
  if (!raw) {
    throw new Error(`Failed to read git date using: ${command}`);
  }
  return new Date(raw).toISOString().replace(/\.\d{3}Z$/, "Z");
}
