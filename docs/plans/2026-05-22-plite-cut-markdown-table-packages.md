# Plite Markdown/Table Package Hard Cut

## Goal

Remove raw Plite `plite-markdown` and `plite-table` package surfaces. Markdown
syntax policy and table feature policy belong in Plate or app/example code, not
in unopinionated Plite.

## Decisions

- Raw Plite keeps substrate APIs: schema, transforms, selections,
  normalization, clipboard/input hooks, and layout primitives.
- Plate owns Markdown parse/serialize/input-rule packages.
- Plate owns table maps, commands, cell-selection UX, and GFM table behavior.
- Plite examples may keep local fixtures to prove generic substrate behavior.
- `plite-layout` must consume generic app-provided geometry for table-like
  content; it must not depend on a raw Plite table package.

## Progress

- [x] Confirm package surfaces exist.
- [x] Delete `packages/plite-markdown`.
- [x] Delete `packages/plite-table`.
- [x] Remove TypeScript/workspace references.
- [x] Rewrite docs and plan references.
- [x] Run focused verification.

## Verification

- `bun typecheck:packages` in `Plate repo root`: pass.
- `bun typecheck:root` in `Plate repo root`: pass.
- `bun lint:fix` in `Plate repo root`: pass, no fixes applied.
- `bun test:bun` in `Plate repo root`: pass, 1157 pass, 95 skip.
- `pnpm lint:fix` in `plate-2`: pass, no fixes applied.
