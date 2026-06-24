---
date: 2026-04-18
topic: plite-plite-browser-pull
status: completed
---

# Goal

Pull `packages/plite-browser` from `.tmp/plite-draft` into live
`Plate repo root` with honest Bun-era wiring.

# Facts

- live `Plate repo root` does not have `packages/plite-browser`
- draft `plite-browser` is real and includes:
  - source
  - package-local tests
  - README
  - multi-subpath exports:
    - `.`
    - `./core`
    - `./browser`
    - `./playwright`
    - `./transports`
- live `tsdown` config only builds `src/index.ts`, so subpath exports need
  package-local build config or they will lie
- old draft root wiring includes a lot of dead `pnpm` / rollup / e2e script
  baggage that should not come back blindly

# Relevant Learnings

- workspace packages need live root `index.ts` source entries
- browser proof helpers must normalize zero-width selection and wait for
  selection sync
- browser proof lanes must use fresh built output, not stale dist

# Plan

1. copy the draft `plite-browser` package source, tests, and docs without
   dist/node_modules junk
2. adapt the package to live Bun + tsdown conventions
3. add only the root wiring that is still required:
   - workspace dependency/reference
   - Playwright TS path alias for `plite-browser/playwright`
   - root convenience scripts for the package-local suite
4. verify build, typecheck, lint, and the package-local tests

# Progress

- loaded roadmap, migration plan, and `plite-browser`-related learnings
- confirmed the live repo has current Playwright tests but not the old full
  replacement-proof command surface
- identified the main technical blocker up front:
  multi-entry/subpath packaging under `tsdown`
- copied `packages/plite-browser` source, tests, and docs from
  `.tmp/plite-draft` into live `Plate repo root`
- replaced the old rollup/pnpm package wiring with:
  - package-local multi-entry `tsdown`
  - Bun-era package scripts
  - split TS configs for build vs source/browser-test typecheck
- updated live `docs/plite/**` so the package no longer shows up as
  deferred
- captured the reusable packaging lesson in
  `docs/solutions/developer-experience/2026-04-18-plite-browser-multi-subpath-packages-need-local-tsdown-entry-maps-and-split-test-runtime-typecheck-ownership.md`

# Verification

- `cd /Users/zbeyens/git/plite && bun install`
- `cd /Users/zbeyens/git/plite && bunx turbo build --filter=./packages/plite-browser`
- `cd /Users/zbeyens/git/plite && bunx turbo typecheck --filter=./packages/plite-browser`
- `cd /Users/zbeyens/git/plite && bun run lint:fix`
- `cd /Users/zbeyens/git/plite && bun run test:plite-browser`
- `cd /Users/zbeyens/git/plite && bun run typecheck:root`
- `cd /Users/zbeyens/git/plite && ./node_modules/.bin/tsc --project ./playwright/tsconfig.json --noEmit`
