import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["tools/tenney-normalize/src/cli.ts"],
  format: ["esm"],
  target: "node20",
  outDir: "tools/tenney-normalize/dist",
  clean: true,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node"
  }
});
