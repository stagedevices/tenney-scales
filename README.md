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
* `INDEX.json` is a machine-readable catalog for pack browsing. Each pack now includes a `scales` array with per-scale file outputs and the source `scalaPath`.

Example `INDEX.json` entry:

```json
{
  "slug": "example-12tet",
  "title": "Example 12-TET",
  "scales": [
    {
      "title": "Example 12-TET",
      "scalaPath": "packs/example-12tet/sources/12tet.scl",
      "files": {
        "tenney": "packs/example-12tet/tenney/scale-builder.json",
        "scl": "packs/example-12tet/tenney/export.scl",
        "ascl": "packs/example-12tet/tenney/export.ascl",
        "kbm": "packs/example-12tet/tenney/export.kbm"
      }
    }
  ]
}
```

See `CONTRIBUTING.md` to add your own pack.
