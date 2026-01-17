import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const baseRef = process.env.GITHUB_BASE_REF || "main";

const diff = execSync(`git diff --name-only origin/${baseRef}...HEAD`, { encoding: "utf8" }).trim();
if (!diff) {
  process.exit(0);
}

const changedFiles = diff.split(/\r?\n/).filter(Boolean);
const changedSlugs = new Set();
for (const file of changedFiles) {
  const match = file.match(/^packs\/([^/]+)\//);
  if (match) {
    changedSlugs.add(match[1]);
  }
}

if (changedSlugs.size === 0) {
  process.exit(0);
}

const errors = [];
const maxBytes = 200 * 1024;
const scalaExtensions = new Set([".scl", ".ascl", ".scala"]);

for (const slug of changedSlugs) {
  const sourcesDir = path.join("packs", slug, "sources");
  if (!fs.existsSync(sourcesDir)) {
    errors.push(`Missing sources directory for pack '${slug}'.`);
    continue;
  }
  const entries = fs.readdirSync(sourcesDir, { withFileTypes: true });
  let hasScala = false;
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    const filePath = path.join(sourcesDir, entry.name);
    const stat = fs.statSync(filePath);
    if (stat.size > maxBytes) {
      errors.push(`File ${filePath} exceeds ${maxBytes} bytes.`);
    }
    const buffer = fs.readFileSync(filePath);
    if (buffer.includes(0)) {
      errors.push(`File ${filePath} appears to be binary.`);
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (scalaExtensions.has(ext)) {
      hasScala = true;
    }
  }
  if (!hasScala) {
    errors.push(`Pack '${slug}' must include at least one .scl/.ascl/.scala in sources/.`);
  }
}

if (errors.length > 0) {
  console.error(errors.map((err) => `- ${err}`).join("\n"));
  process.exit(1);
}
