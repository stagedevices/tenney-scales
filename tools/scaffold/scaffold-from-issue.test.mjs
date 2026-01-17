import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const scriptPath = path.resolve("tools/scaffold/scaffold-from-issue.mjs");

function buildIssueBody(overrides = {}) {
  const fields = {
    title: "My Test Pack",
    preferredSlug: "_No response_",
    author: "Test Author",
    authorUrl: "_No response_",
    descriptionLabel: "Short description",
    description: "A short description.",
    tags: "tag-one, tag-two",
    rootHz: "440",
    primeLimit: "11",
    scaleFiles: "test",
    globalKbm: "_No response_",
    license: "- [x] I agree"
  };
  const values = { ...fields, ...overrides };
  return [
    `### Pack title`,
    values.title,
    "",
    "### Preferred slug (optional)",
    values.preferredSlug,
    "",
    "### Author display name",
    values.author,
    "",
    "### Author URL (optional)",
    values.authorUrl,
    "",
    `### ${values.descriptionLabel}`,
    values.description,
    "",
    "### Tags (comma-separated)",
    values.tags,
    "",
    "### defaults.rootHz",
    values.rootHz,
    "",
    "### defaults.primeLimit",
    values.primeLimit,
    "",
    "### Scale files list",
    values.scaleFiles,
    "",
    "### Optional KBM filename",
    values.globalKbm,
    "",
    "### License confirmation",
    values.license,
    ""
  ].join("\n");
}

function runScaffold(issueBody) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "scaffold-"));
  const issuePath = path.join(tempDir, "issue.md");
  const outputPath = path.join(tempDir, "output.json");
  fs.writeFileSync(issuePath, issueBody, "utf8");
  const result = spawnSync(process.execPath, [scriptPath, issuePath, "--output", outputPath], {
    cwd: tempDir,
    encoding: "utf8"
  });
  return { result, tempDir, outputPath };
}

function readPackJson(tempDir, slug) {
  const packPath = path.join(tempDir, "packs", slug, "pack.json");
  return JSON.parse(fs.readFileSync(packPath, "utf8"));
}

test("blank preferred slug falls back to title", () => {
  const { result, outputPath, tempDir } = runScaffold(buildIssueBody());
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  assert.equal(output.slug, "my-test-pack");
  const pack = readPackJson(tempDir, output.slug);
  assert.equal(pack.slug, "my-test-pack");
});

test("scala filename without extension defaults to .scl", () => {
  const { result, outputPath, tempDir } = runScaffold(buildIssueBody({ scaleFiles: "test" }));
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  const pack = readPackJson(tempDir, output.slug);
  assert.equal(pack.inputs.scales[0].scala, "sources/test.scl");
});

test("kbm filename without extension defaults to .kbm", () => {
  const { result, outputPath, tempDir } = runScaffold(buildIssueBody({ scaleFiles: "foo.ascl | bar" }));
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  const pack = readPackJson(tempDir, output.slug);
  assert.equal(pack.inputs.scales[0].kbm, "sources/bar.kbm");
});

test("invalid scala extension throws with helpful message", () => {
  const { result } = runScaffold(buildIssueBody({ scaleFiles: "bad.txt" }));
  assert.notEqual(result.status, 0);
  const output = `${result.stdout}\n${result.stderr}`;
  assert.match(output, /\.scl, \.ascl, or \.scala/);
});

test("supports short description label with 1–3 sentences suffix", () => {
  const { result, outputPath, tempDir } = runScaffold(
    buildIssueBody({ descriptionLabel: "Short description (1–3 sentences)" })
  );
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  const pack = readPackJson(tempDir, output.slug);
  assert.equal(pack.description, "A short description.");
});
