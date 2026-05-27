---
date: 2026-04-17
topic: slate-v2-slate-editor-above-bun-migration
status: completed
---

# Goal

Move `/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/above`
off the Mocha fixture harness onto the root Bun test graph as one bounded slice.

# Constraints

- keep the single root `bunfig.toml`
- do not broaden the slice past `Editor/above`
- do not fake skips or leave the Mocha lane double-owning the same fixtures
- keep the remaining `packages/slate/test/index.js` Mocha harness intact

# Findings

- the `above/*.tsx` fixtures import `jsx` from `packages/slate/test/index.js`
- `packages/slate/test/index.js` also bootstraps the whole Mocha fixture suite
- a Bun spec cannot safely import those fixtures until `jsx` is split out
- the `slate` Mocha loader lives in `/Users/zbeyens/git/slate-v2/support/fixtures.js`
  and is shared with `slate-history`
- the clean bounded migration path is:
  - keep the legacy Mocha-only custom JSX export in `test/index.js`
  - use stock `slate-hyperscript` JSX in the migrated Bun fixtures
  - split `withTest`
  - add one Bun spec for `Editor/above`
  - teach the shared fixture loader to ignore one directory
- the scoped Bun preload bridge is still required for `Editor/above/*.tsx`
- the Bun spec must not live under the legacy `test/**/*.ts` Mocha glob
- the migrated `above` fixtures are now bare TSX with no per-file pragma or
  stock `jsx` import

# Plan

1. Split `packages/slate/test/index.js` helpers so Bun can import `above` fixtures
   without re-entering the Mocha harness
2. Add a Bun spec for `packages/slate/test/interfaces/Editor/above`
3. Exclude `Editor/above` from the shared Mocha fixture recursion
4. Wire the new spec into the root `test:bun` graph
5. Verify targeted Bun execution, package build/typecheck, and repo lint/test flow

# Verification

- `bun test ./packages/slate/test/bun/editor-above.spec.tsx`
- `pnpm install`
- `pnpm turbo build --filter=./packages/slate`
- `pnpm turbo typecheck --filter=./packages/slate`
- `pnpm exec tsc --project config/tsconfig.test.json --noEmit`
- `pnpm lint:fix`
- `pnpm test:bun`
- `pnpm test:mocha`
