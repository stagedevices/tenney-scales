import { execSync } from "node:child_process";
import { validatePacks } from "./validate.js";
import { normalizePacks } from "./normalize.js";
import { generateIndex } from "./indexer.js";

async function main() {
  const command = process.argv[2];
  if (!command) {
    printUsage();
    process.exit(1);
  }

  if (command === "validate") {
    await validatePacks();
    return;
  }

  if (command === "normalize") {
    await validatePacks();
    await normalizePacks();
    return;
  }

  if (command === "index") {
    await validatePacks();
    await generateIndex();
    return;
  }

  if (command === "check") {
    await validatePacks();
    await normalizePacks();
    await generateIndex();
    const diff = execSync("git status --porcelain", { encoding: "utf8" }).trim();
    if (diff.length > 0) {
      throw new Error("Normalization produced uncommitted changes. Run npm run normalize and npm run index.");
    }
    return;
  }

  printUsage();
  process.exit(1);
}

function printUsage() {
  console.log("Usage: tenney-normalize <validate|normalize|index|check>");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
