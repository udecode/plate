# Milkdown Reference Corpus

## Task

- Source: direct user request
- Title: `Build a local Milkdown reference corpus from ../milkdown`
- Type: research and documentation infrastructure
- Goal: build a local Milkdown reference lane we can rely on for later markdown behavior/spec work without repeated ad-hoc repo digging

## Plan

1. Read existing editor-behavior docs and repo learnings for prior constraints.
2. Inspect `../milkdown` for docs, examples, package surfaces, and generated content seams.
3. Define a repo-safe storage model:
   - keep repo artifacts to metadata, pointers, and structured summaries
   - avoid dumping the whole upstream repo into Plate docs
4. Build the initial Milkdown corpus under `docs/editor-behavior/references/milkdown/`.
5. Sanity-check coverage against the local clone’s real docs/content surface.
6. Document how later spec work should consume this corpus.

## Findings

- `docs/editor-behavior/` contains the draft architecture, standards, editing spec, and parity matrix files that this corpus should feed.
- No existing `docs/solutions/` entry covers Milkdown corpus work.
- Typora already has a parallel local corpus lane. Milkdown should mirror the same usage shape where possible, while using the local clone as the raw source of truth.
- Milkdown is a monorepo, not a single docs site seam.
- The behavior-relevant surface is split across:
  - `docs/api/**`
  - `packages/**`
  - `e2e/tests/**`
  - `e2e/src/**`
  - `storybook/stories/**`
- `docs/src/index.ts` builds API docs by pairing each `docs/api/<name>.md` file with package `@milkdown/<name>` when that package exists.
- The generated repo-safe inventory now lives under `docs/editor-behavior/references/milkdown/`:
  - `README.md`
  - `corpus-metadata.json`
  - `package-catalog.tsv`
  - `package-docs-catalog.tsv`
  - `api-catalog.tsv`
  - `e2e-catalog.tsv`
  - `unit-test-catalog.tsv`
  - `examples-catalog.tsv`
  - `root-docs-catalog.tsv`
  - `storybook-catalog.tsv`
- Current snapshot counts:
  - `30` packages
  - `29` API docs pages
  - `48` e2e specs
  - `28` package unit tests
  - `9` example routes
  - `14` Storybook stories
  - `14` markdown fixtures
  - `30` package docs lanes
  - `4` root docs
- Clone snapshot is pinned to commit `6a4db480b00db8dd0322b517117dfa2154f3e2e2`.
- Best seam for markdown behavior/spec work is:
  1. `e2e/tests/input/**`
  2. `e2e/tests/shortcut/**`
  3. `e2e/tests/transform/**`
  4. `packages/**/__test__`, `packages/**/*.test.ts*`, `packages/**/*.spec.ts*`
  5. `packages/plugins/preset-commonmark/**`
  6. `packages/plugins/preset-gfm/**`
  7. `packages/transformer/**`
  8. `docs/api/**`
- Second-pass correction:
  - first pass missed package-local unit tests
  - package docs and root docs are now cataloged separately as support lanes, not primary behavior truth

## Risks

- Dumping broad repo content into Plate docs will create noise and rot.
- Milkdown may spread relevant behavior across docs, examples, source packages, and tests, so a weak inventory will miss the real seams.
- An index with no opinionated “high-value pages/files first” guidance will still force repeated rediscovery later.

## Progress

- 2026-04-02: Reloaded `major-task`, `planning-with-files`, `learnings-researcher`, and `repo-research-analyst`.
- 2026-04-02: Confirmed `../milkdown` exists locally and is the right source of truth for this pass.
- 2026-04-02: Mapped the repo into docs, packages, e2e tests, example routes, and Storybook lanes.
- 2026-04-02: Sampled representative API docs, input tests, transform tests, and package metadata to confirm where behavior truth actually lives.
- 2026-04-02: Generated the initial Milkdown reference inventory under `docs/editor-behavior/references/milkdown/`.
- 2026-04-02: Verified route extraction, package grouping, snapshot metadata, and example-route coverage.
- 2026-04-02: Second pass found and cataloged package-local unit tests plus package/root docs lanes.
- 2026-04-02: Updated the reference README to reflect the corrected priority order: e2e first, package-local tests second, docs later.
