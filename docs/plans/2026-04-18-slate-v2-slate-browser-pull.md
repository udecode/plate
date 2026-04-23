---
date: 2026-04-18
topic: slate-v2-slate-browser-pull
status: completed
---

# Goal

Pull `packages/slate-browser` from `../slate-v2-draft` into live
`../slate-v2` with honest Bun-era wiring.

# Facts

- live `../slate-v2` does not have `packages/slate-browser`
- draft `slate-browser` is real and includes:
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

1. copy the draft `slate-browser` package source, tests, and docs without
   dist/node_modules junk
2. adapt the package to live Bun + tsdown conventions
3. add only the root wiring that is still required:
   - workspace dependency/reference
   - Playwright TS path alias for `slate-browser/playwright`
   - root convenience scripts for the package-local suite
4. verify build, typecheck, lint, and the package-local tests

# Progress

- loaded roadmap, migration plan, and `slate-browser`-related learnings
- confirmed the live repo has current Playwright tests but not the old full
  replacement-proof command surface
- identified the main technical blocker up front:
  multi-entry/subpath packaging under `tsdown`
- copied `packages/slate-browser` source, tests, and docs from
  `../slate-v2-draft` into live `../slate-v2`
- replaced the old rollup/pnpm package wiring with:
  - package-local multi-entry `tsdown`
  - Bun-era package scripts
  - split TS configs for build vs source/browser-test typecheck
- updated live `docs/slate-v2/**` so the package no longer shows up as
  deferred
- captured the reusable packaging lesson in
  `docs/solutions/developer-experience/2026-04-18-slate-browser-multi-subpath-packages-need-local-tsdown-entry-maps-and-split-test-runtime-typecheck-ownership.md`

# Verification

- `cd /Users/zbeyens/git/slate-v2 && bun install`
- `cd /Users/zbeyens/git/slate-v2 && bunx turbo build --filter=./packages/slate-browser`
- `cd /Users/zbeyens/git/slate-v2 && bunx turbo typecheck --filter=./packages/slate-browser`
- `cd /Users/zbeyens/git/slate-v2 && bun run lint:fix`
- `cd /Users/zbeyens/git/slate-v2 && bun run test:slate-browser`
- `cd /Users/zbeyens/git/slate-v2 && bun run typecheck:root`
- `cd /Users/zbeyens/git/slate-v2 && ./node_modules/.bin/tsc --project ./playwright/tsconfig.json --noEmit`
