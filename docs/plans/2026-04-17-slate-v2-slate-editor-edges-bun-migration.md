---
date: 2026-04-17
topic: slate-v2-slate-editor-edges-bun-migration
status: completed
---

# Goal

Move `/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces/Editor/edges`
off the Mocha fixture harness onto the root Bun test graph as the next bounded
slice.

# Constraints

- keep the single root `bunfig.toml`
- do not broaden the slice past `Editor/edges`
- keep the `Editor/above` Bun slice green
- do not leave the Mocha lane double-owning the same fixtures

# Findings

- `Editor/edges` uses the same legacy TSX fixture shape as `Editor/above`
- the fixtures still import a shared hyperscript symbol through
  `packages/slate/test/index.js`
- a direct Bun spec red-pass fails because that import re-enters the Mocha
  harness and the imported fixture editor is still miscompiled without the
  scoped preload bridge
- `Editor/above` and `Editor/edges` can share the same Bun fixture-spec runner
- the shared runner now lives at
  `/Users/zbeyens/git/slate-v2/packages/slate/test/bun/support/run-editor-fixtures.js`
- the scoped Bun preload bridge now covers both `Editor/above/*.tsx` and
  `Editor/edges/*.tsx` through one shared test-directory rule
- the migrated Bun fixtures can use stock `slate-hyperscript` tags like
  `<element>` and avoid any extra local helper file
- the migrated `edges` fixtures are also bare TSX with the stock factory import
  injected by the preload

# Plan

1. Extract a reusable Bun editor-fixture runner for `slate` interface slices
2. Move `Editor/edges` onto a Bun spec using that runner
3. Exclude `Editor/edges` from the legacy Mocha fixture recursion
4. Extend the scoped Bun preload bridge to cover `Editor/edges/*.tsx`
5. Verify build, typecheck, lint, Bun, and Mocha

# Verification

- `bun test ./packages/slate/test/bun/editor-edges.spec.tsx`
- `pnpm turbo build --filter=./packages/slate`
- `pnpm turbo typecheck --filter=./packages/slate`
- `pnpm lint:fix`
- `pnpm test:bun`
- `pnpm test:mocha`
