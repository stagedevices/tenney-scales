# Tenney Scales

This repository hosts community scale packs for **Tenney**. Each pack includes source tuning files and deterministic, canonical outputs that Tenney can import directly.

## Repository layout

```
INDEX.json
packs/<pack-slug>/
  pack.json
  sources/
  tenney/
  previews/
```

The `packs/<slug>/tenney/scale-builder.json` file is the canonical Tenney import payload. All generated files are checked in and validated in CI.

## Quickstart

```bash
npm install
npm run check
```

`npm run check` validates pack metadata, regenerates outputs, regenerates `INDEX.json`, and fails if anything is out of date.

## How Tenney uses these packs

* Tenney reads `scale-builder.json` to import a scale into the Tenney library.
* `export.scl`, `export.ascl`, and `export.kbm` are convenience exports for other tools.
* `INDEX.json` is a machine-readable catalog for pack browsing.

See `CONTRIBUTING.md` to add your own pack.
