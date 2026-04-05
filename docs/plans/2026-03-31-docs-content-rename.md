# Docs/content rename

## Goal

Move internal engineering docs from the previous internal docs directory to `docs`, move current site content from `docs` to `content`, and update repo references without breaking public `/docs/...` routes.

## Scope

- rename root directories:
  - previous internal docs directory -> `docs`
  - `docs` -> `content`
- update filesystem references in config, repo docs, plans, and solutions
- preserve site routes under `/docs/...`

## Findings

- `apps/www/contentlayer.config.js` currently reads from root `docs`.
- `languine.json` and `.vscode/settings.json` also point at root `docs`.
- Repo instructions in `AGENTS.md`, `.agents/AGENTS.md`, and template AGENTS files point at `docs`.
- Internal plan/solution markdown contains many absolute links to `docs/...`.
- Public site URLs `/docs/...` are everywhere and must stay unchanged.

## Plan

1. Rename directories.
2. Rewrite repo/config references from the previous internal docs directory -> `docs`.
3. Rewrite content-source references from `docs` -> `content` only where they mean filesystem paths.
4. Verify no stale `docs` refs remain and contentlayer/languine/vscode point at `content`.

## Progress

- 2026-03-31: Context gathered. Rename plan ready.
- 2026-03-31: Renamed root directories, updated repo/config references, found stale registry source paths in `apps/www/public/r*`, and fixed the generator to read from `content`.
