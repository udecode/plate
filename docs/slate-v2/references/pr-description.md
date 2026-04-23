---
date: 2026-04-18
topic: slate-v2-pr-description
status: active
---

# Slate v2 PR Description

## Purpose

Maintainer-facing drift register for the fresh-branch migration.

Use this to explain why the diff is shaped the way it is.

## Current Groups

### 1. Root Tooling Drift

Affected files:

- `../slate-v2/package.json`
- `../slate-v2/bunfig.toml`
- `../slate-v2/bun.lock`
- `../slate-v2/turbo.json`
- `../slate-v2/biome.jsonc`
- `../slate-v2/eslint.config.mjs`
- `../slate-v2/.github/workflows/*.yml`
- `../slate-v2/config/**/*`

Why this drift exists:

- the fresh repo cannot stay on Yarn/Lerna-era root ownership and still claim a
  modern migration path
- package build/type owners had to move onto real package scripts
- Rollup had to die once the package contract became ESM-only
- docs and contributor instructions had to stop describing the wrong command
  graph

Accepted fresh-branch adaptations:

- Bun/Turbo/Biome/flat-ESLint ownership
- Bun lockfile + Bun test discovery ownership
- package-manifest `build` / `typecheck` owners
- tsdown as the shared package build owner
- babel alias glue required by the test/runtime graph
- no forced webpack for the Next app
- local dev on `3100`

Deferred:

- root scripts whose real owner is `slate-browser` or later proof lanes

### 2. Package Manifest Drift

Affected files:

- `../slate-v2/packages/*/package.json`
- `../slate-v2/packages/{slate-history,slate-dom,slate-react}/tsconfig.build.json`

Why this drift exists:

- the root Bun/Turbo graph is fake unless packages expose their own
  `build`/`typecheck` owners
- the package output contract changed from mixed Rollup-era formats to
  ESM-only `dist/index.js` + `dist/index.d.ts`

Accepted fresh-branch adaptations:

- ESM-only export fields
- package-local `build` / `clean` / `test` / `typecheck` scripts
- `workspace:*` local package edges where the modern workspace owns them
- React 19.2.5 / React 19 peer floor in `slate-react`

Deferred:

- any package `src` behavior work that is not justified by the kept
  claim-width audit

### 3. Runtime Compatibility Drift

Affected files:

- `../slate-v2/packages/slate-react/src/**/*`
- `../slate-v2/packages/slate-dom/src/**/*`
- `../slate-v2/site/**/*`

Why this drift exists:

- React 19.2, Next 16, and TypeScript 6 surfaced strict type fallout and old
  config debt
- the site had to stop depending on package rebuilds for local development
- ESM-only package output forced the Jest lane back onto source mapping

Accepted adaptations:

- React 19 ref-prop cleanup where it preserved behavior
- strict `useRef` and DOM type export fixes required by the new toolchain
- explicit example importer map for Next
- TS6 config cleanup and the tiny compiler-fallout source fixes it forced
- source-mapped Jest module resolution for workspace packages
- dev HMR proof against package `src` without package rebuilds

Deferred:

- `slate-browser` root proof command surface beyond the landed package-local suite
- claim-width audit, deleted-family classification, and only then targeted
  package/source recovery for kept rows

### 4. Docs Ownership Reset

Affected paths:

- `docs/slate-v2/**`
- `docs/slate-v2-draft/**`

Why this drift exists:

- the old rewrite docs were the wrong source of truth for the fresh program
- the live docs needed a clean ownership reset
- the old stack still needed to survive for lossless review

Accepted tranche-1 adaptations:

- archive copy under `docs/slate-v2-draft/**`
- live final-state specs under `docs/slate-v2/**`

## Review Rule

- keep drift only when it has a concrete owner
- merged contract rows outrank current implementation shape for core engine
  files
- rewrite is acceptable when kept rows require it
- same-path/source-close pressure stays strongest for docs, examples, and
  public package surfaces
- if it is not engine-forced or real current value, it is `post RC`
