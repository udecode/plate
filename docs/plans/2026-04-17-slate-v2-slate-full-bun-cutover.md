---
date: 2026-04-17
topic: slate-v2-slate-full-bun-cutover
status: completed
---

# Goal

Move `/Users/zbeyens/git/slate-v2/packages/slate/test` fully onto Bun and
remove `slate` from the Mocha lane.

# Constraints

- keep `slate-history` on its current Mocha lane
- preserve skipped legacy fixtures as skipped
- preserve the batch-dirty checks for `insertNodes` and `insertFragment`
- keep the root Bun preload handling for legacy TSX fixtures

# Findings

- `packages/slate/test/index.js` is the blocker because fixtures import `jsx`
  from it while it also bootstraps the whole Mocha suite
- the suite shape is already well-defined in the current Mocha entry:
  `interfaces`, `operations`, `normalization`, `transforms`,
  `utils/deep-equal`, plus extra batch-dirty passes for two transform lanes
- the only other direct slate runtime test file is
  `packages/slate/test/utils/string.ts`
- Bun already carries the migrated `above` and `edges` slices, so the preload
  and fixture import path are good enough to cut the whole package over
- a few `CustomTypes` helper files needed `import type` so Bun would stop trying
  to load type-only Slate exports at runtime

# Plan

1. Turn `packages/slate/test/index.js` into a pure helper module
2. Add one Bun suite entry for the whole `slate` fixture corpus
3. Remove the temporary per-bucket Bun specs
4. Switch `packages/slate` and root scripts so `slate` is Bun-only
5. Verify build, typecheck, lint, Bun, and the remaining `slate-history`
   Mocha lane

# Verification

- `pnpm --filter slate test`
- `pnpm turbo build --filter=./packages/slate`
- `pnpm turbo typecheck --filter=./packages/slate`
- `pnpm lint:fix`
- `pnpm test:bun`
- `pnpm test:mocha`
