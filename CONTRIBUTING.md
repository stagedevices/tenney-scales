# Contributing a Tenney scale pack

Pack submissions are **issues-only**. Please do not open a PR manually.

Use the pack submission issue form:
https://github.com/stagedevices/tenney-scales/issues/new?template=pack_submission.yml

## Submit a pack

1) **Open the issue form** and provide the required details.
2) **Wait for the bot comment** — it will include a draft PR link and an **“Add files now”** upload link.
3) **Upload your files** into `packs/<slug>/sources/` on the PR branch using the provided link.
4) **CI validates** the submission.
5) **A maintainer merges** the PR.

Only `packs/<slug>/pack.json` and `packs/<slug>/sources/*` are needed from contributors. The generated `packs/<slug>/tenney/*` outputs and `INDEX.json` are created automatically after merge.

### File rules

* Accepted scale formats: `.scl`, `.ascl`, `.scala`
* Optional mapping format: `.kbm`
* Text-only files, max 200KB per file
* You can upload multiple files at once in a single web UI action

## Maintainer notes

We recommend enabling branch protection for `main`:

* Require PRs
* Require CODEOWNERS review
* Restrict who can push/merge to `main` to `stagedevices`
