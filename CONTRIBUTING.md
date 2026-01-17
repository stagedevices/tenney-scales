# Contributing a Tenney scale pack

You can upload a pack directly using the GitHub web UI—no local tooling required.

## 1) Create your folder

Create a new folder under `packs/` with a slug in lowercase kebab-case, for example:

```
packs/just-intonation-15/
```

Inside that folder, create:

```
pack.json
sources/
tenney/
previews/
```

`tenney/` and `previews/` can be empty on first upload.

## 2) Fill out `pack.json`

`pack.json` must validate against `schemas/pack.schema.json`. Required fields include:

* `slug` (must match the folder name)
* `title`, `description`, `author`
* `license` **must be** `CC0-1.0`
* `createdAt` and `updatedAt` in ISO8601 format (e.g. `2026-01-01T00:00:00Z`)
* `defaults.rootHz` (usually 440) and `defaults.primeLimit`
* `inputs.scala` (relative path under `sources/`)
* `inputs.kbm` (optional; also under `sources/`)

## 3) Add your source files

Upload your `.scl` (and optional `.kbm`) into `sources/`. Keep files under 2 MB.

## 4) (Optional) Run checks locally

If you want to validate locally:

```bash
npm install
npm run check
```

## 5) Open a pull request

CI runs the same validation, normalization, index generation, and a Swift contract decoder.
If CI fails, it will tell you which pack needs attention.
