# Contributing a Tenney scale pack

You can upload a pack directly using the GitHub web UI—no local tooling required.

Use the pack submission issue form:
https://github.com/stagedevices/tenney-scales/issues/new?template=pack_submission.yml

## 1) Create your folder

Create a new folder under `packs/` with a slug in lowercase kebab-case, for example:

```
packs/just-intonation-15/
```

Inside that folder, create:

```
pack.json
sources/
```

Only `pack.json` and `sources/*` are needed from contributors. `tenney/` outputs and `INDEX.json` are generated automatically after merge.

## 2) Fill out `pack.json`

`pack.json` must validate against `schemas/pack.schema.json`. Required fields include:

* `slug` (must match the folder name)
* `title`, `description`, `author`
* `license` **must be** `CC0-1.0`
* `createdAt` and `updatedAt` in strict ISO8601 format (e.g. `2026-01-01T00:00:00Z`)
* `defaults.rootHz` (usually 440) and `defaults.primeLimit`
* `inputs.scala` (relative path under `sources/`)
* `inputs.kbm` (optional; also under `sources/`)

## 3) Add your source files

Upload your `.scl`/`.ascl`/`.scala` (and optional `.kbm`) into `sources/`. Keep files under 2 MB.

## 4) (Optional) Run checks locally

If you want to validate locally:

```bash
npm install
npm run validate
npm run normalize
npm run index
swift run --package-path tools/contract TenneyContractValidator
```

## 5) Open a pull request

CI runs schema validation, normalization, index generation, and a Swift contract decoder. It does **not** require generated outputs to be committed in PRs.
