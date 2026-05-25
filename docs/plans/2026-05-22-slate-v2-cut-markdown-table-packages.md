# Slate v2 Markdown/Table Package Hard Cut

## Goal

Remove raw Slate `slate-markdown` and `slate-table` package surfaces. Markdown
syntax policy and table feature policy belong in Plate or app/example code, not
in unopinionated Slate.

## Decisions

- Raw Slate keeps substrate APIs: schema, transforms, selections,
  normalization, clipboard/input hooks, and layout primitives.
- Plate owns Markdown parse/serialize/input-rule packages.
- Plate owns table maps, commands, cell-selection UX, and GFM table behavior.
- Slate examples may keep local fixtures to prove generic substrate behavior.
- `slate-layout` must consume generic app-provided geometry for table-like
  content; it must not depend on a raw Slate table package.

## Progress

- [x] Confirm package surfaces exist.
- [x] Delete `packages/slate-markdown`.
- [x] Delete `packages/slate-table`.
- [x] Remove TypeScript/workspace references.
- [x] Rewrite docs and plan references.
- [x] Run focused verification.

## Verification

- `bun typecheck:packages` in `.tmp/slate-v2`: pass.
- `bun typecheck:root` in `.tmp/slate-v2`: pass.
- `bun lint:fix` in `.tmp/slate-v2`: pass, no fixes applied.
- `bun test:bun` in `.tmp/slate-v2`: pass, 1157 pass, 95 skip.
- `pnpm lint:fix` in `plate-2`: pass, no fixes applied.
