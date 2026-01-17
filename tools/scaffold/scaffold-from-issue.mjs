import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
if (args.length === 0) {
  throw new Error("Usage: scaffold-from-issue.mjs <issue-body-file> --output <output>");
}

const inputPath = args[0];
const outputFlagIndex = args.indexOf("--output");
const outputPath = outputFlagIndex >= 0 ? args[outputFlagIndex + 1] : null;
const issueFlagIndex = args.indexOf("--issue");
const issueNumber = issueFlagIndex >= 0 ? Number(args[issueFlagIndex + 1]) : null;

if (!outputPath) {
  throw new Error("Missing --output <file> argument.");
}

const body = fs.readFileSync(inputPath, "utf8");
const sections = parseIssueSections(body);

const title = requiredField(sections, "Pack title");
const preferredSlug = requiredField(sections, "Preferred slug");
const author = requiredField(sections, "Author display name");
const authorUrl = optionalField(sections, "Author URL (optional)");
const description = requiredField(sections, "Short description");
const tagsRaw = requiredField(sections, "Tags (comma-separated)");
const rootHzRaw = requiredField(sections, "defaults.rootHz");
const primeLimitRaw = requiredField(sections, "defaults.primeLimit");
const scaleFilesRaw = requiredField(sections, "Scale files list");
const globalKbmRaw = optionalField(sections, "Optional KBM filename");
const licenseRaw = requiredField(sections, "License confirmation");

if (!/\[x\]/i.test(licenseRaw)) {
  throw new Error("License confirmation is required.");
}

const slug = ensureUniqueSlug(sanitizeSlug(preferredSlug));
const tags = tagsRaw
  .split(",")
  .map((tag) => tag.trim())
  .filter(Boolean);

const rootHz = Number.parseFloat(rootHzRaw);
if (!Number.isFinite(rootHz)) {
  throw new Error("defaults.rootHz must be a number.");
}

const primeLimit = Number.parseInt(primeLimitRaw, 10);
if (!Number.isFinite(primeLimit)) {
  throw new Error("defaults.primeLimit must be a number.");
}

const scaleLines = scaleFilesRaw
  .split(/\r?\n/)
  .map((line) => line.replace(/^[-*]\s+/, "").trim())
  .filter(Boolean);

if (scaleLines.length === 0) {
  throw new Error("Scale files list must include at least one entry.");
}

const globalKbm = normalizeOptionalFilename(globalKbmRaw);
const scales = scaleLines.map((line) => parseScaleLine(line, globalKbm));

const packRoot = path.join("packs", slug);
const sourcesDir = path.join(packRoot, "sources");
fs.mkdirSync(sourcesDir, { recursive: true });

const packJson = buildPackJson({
  slug,
  title,
  description,
  author,
  authorUrl,
  tags,
  rootHz,
  primeLimit,
  scales
});

const packPath = path.join(packRoot, "pack.json");
fs.writeFileSync(packPath, JSON.stringify(packJson, null, 2) + "\n", "utf8");

const readmePath = path.join(sourcesDir, "README.md");
fs.writeFileSync(readmePath, buildSourcesReadme(scales), "utf8");

const output = {
  slug,
  title,
  issueNumber
};
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");

function parseIssueSections(issueBody) {
  const lines = issueBody.split(/\r?\n/);
  const map = new Map();
  let current = null;
  let buffer = [];
  for (const line of lines) {
    const headingMatch = line.match(/^###\s+(.*)$/);
    if (headingMatch) {
      if (current) {
        map.set(current, buffer.join("\n").trim());
      }
      current = headingMatch[1].trim();
      buffer = [];
      continue;
    }
    if (current) {
      buffer.push(line);
    }
  }
  if (current) {
    map.set(current, buffer.join("\n").trim());
  }
  return map;
}

function requiredField(sectionsMap, label) {
  const value = sectionsMap.get(label);
  if (!value || value.trim() === "" || value.trim() === "_No response_") {
    throw new Error(`Missing required field: ${label}`);
  }
  return value.trim();
}

function optionalField(sectionsMap, label) {
  const value = sectionsMap.get(label);
  if (!value || value.trim() === "" || value.trim() === "_No response_") {
    return "";
  }
  return value.trim();
}

function sanitizeSlug(input) {
  const normalized = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const collapsed = normalized.replace(/-{2,}/g, "-");
  let slug = collapsed;
  if (slug.length > 48) {
    slug = slug.slice(0, 48).replace(/-+$/g, "");
  }
  if (slug.length < 3) {
    throw new Error("Preferred slug must be at least 3 characters after sanitizing.");
  }
  return slug;
}

function ensureUniqueSlug(baseSlug) {
  const packsDir = path.join(process.cwd(), "packs");
  const existing = new Set(
    fs.existsSync(packsDir)
      ? fs.readdirSync(packsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
      : []
  );
  if (!existing.has(baseSlug)) {
    return baseSlug;
  }
  for (let counter = 2; counter < 100; counter += 1) {
    const suffix = `-${counter}`;
    const trimmed = baseSlug.slice(0, Math.max(3, 48 - suffix.length)).replace(/-+$/g, "");
    const candidate = `${trimmed}${suffix}`;
    if (!existing.has(candidate)) {
      return candidate;
    }
  }
  throw new Error("Unable to allocate a unique slug.");
}

function normalizeOptionalFilename(filename) {
  if (!filename) {
    return "";
  }
  const trimmed = filename.trim();
  if (!trimmed) {
    return "";
  }
  validateFilename(trimmed);
  const ext = path.extname(trimmed).toLowerCase();
  if (ext !== ".kbm") {
    throw new Error(`KBM filename must end in .kbm (got ${trimmed}).`);
  }
  return trimmed;
}

function parseScaleLine(line, globalKbm) {
  const parts = line.split(/[|,]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    throw new Error(`Invalid scale line: ${line}`);
  }
  if (parts.length > 2) {
    throw new Error(`Scale line should include only one scala file and optional KBM: ${line}`);
  }
  const scalaFile = parts[0];
  validateFilename(scalaFile);
  const scalaExt = path.extname(scalaFile).toLowerCase();
  if (![".scl", ".ascl", ".scala"].includes(scalaExt)) {
    throw new Error(`Scala file must end in .scl, .ascl, or .scala (got ${scalaFile}).`);
  }
  const kbmFile = parts[1] ? parts[1] : globalKbm || "";
  if (kbmFile) {
    validateFilename(kbmFile);
    const kbmExt = path.extname(kbmFile).toLowerCase();
    if (kbmExt !== ".kbm") {
      throw new Error(`KBM file must end in .kbm (got ${kbmFile}).`);
    }
  }
  return { scala: scalaFile, kbm: kbmFile || undefined };
}

function validateFilename(filename) {
  if (filename.includes("/") || filename.includes("\\")) {
    throw new Error(`Filenames must not include path separators: ${filename}`);
  }
}

function buildPackJson({ slug, title, description, author, authorUrl, tags, rootHz, primeLimit, scales }) {
  const inputs = buildInputs(scales);
  const pack = {
    slug,
    title,
    description,
    author,
    license: "CC0-1.0",
    tags,
    defaults: {
      rootHz,
      primeLimit
    },
    inputs,
    createdAt: "1970-01-01T00:00:00Z",
    updatedAt: "1970-01-01T00:00:00Z"
  };
  if (authorUrl) {
    pack.authorUrl = authorUrl;
  }
  return pack;
}

function buildInputs(scales) {
  const scaleInputs = scales.map((entry) => ({
    scala: path.posix.join("sources", entry.scala),
    ...(entry.kbm ? { kbm: path.posix.join("sources", entry.kbm) } : {})
  }));
  if (scaleInputs.length === 1) {
    return {
      scala: scaleInputs[0].scala,
      ...(scaleInputs[0].kbm ? { kbm: scaleInputs[0].kbm } : {}),
      scales: scaleInputs
    };
  }
  return { scales: scaleInputs };
}

function buildSourcesReadme(scales) {
  const lines = [
    "# Sources",
    "",
    "Upload the following files into this folder:",
    ""
  ];

  for (const entry of scales) {
    lines.push(`- ${entry.scala} (required scale file)`);
    if (entry.kbm) {
      lines.push(`- ${entry.kbm} (optional mapping for ${entry.scala})`);
    }
  }

  lines.push(
    "",
    "Notes:",
    "- Accepted scale extensions: .scl, .ascl, .scala",
    "- KBM files are optional (.kbm)",
    "- Max size per file: 200KB",
    "- Text files only (no binaries)",
    "- Upload all files at once if possible (single commit on this PR)",
    ""
  );

  return lines.join("\n");
}
