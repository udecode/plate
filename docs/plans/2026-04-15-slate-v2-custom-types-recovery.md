# Slate v2 Custom Types Recovery

## Goal

Recover `site/examples/ts/custom-types.d.ts` toward the legacy same-path contract,
repair any package typing drift that blocks that recovery, and only then clean up
the example fallout caused by the restored declaration path.

## Phases

- [x] Read legacy/current `custom-types` files and same-path drift rules
- [x] Restore `site/examples/ts/custom-types.d.ts` as the source file path
- [x] Repoint example imports from `./custom-types` to `./custom-types.d`
- [x] Repair `slate-react` `EditableTextBlocks` declaration drift where needed
- [x] Finish the remaining example fallout from the restored declaration contract
- [x] Re-run focused verification and record any honest remaining debt
- [x] Restore the ambient `declare module 'slate'` block and fix the resulting example fallout

## Findings

- The full legacy ambient `declare module 'slate'` block is not currently viable;
  that was true until the current-only example element shapes were added back to
  the same-path declaration file.
- The site reads `packages/slate-react/dist/src/*.d.ts`, so package type fixes are
  invisible to `site/tsconfig.json` until declaration output changes too.
- `Node.isElement` / `Node.isText` were typed too narrowly for the
  `Editor.nodes(...)` callback shape. That was package drift, not example drift.
- The current example corpus depends on additional element families not present in
  legacy `custom-types.d.ts`, including `chip`, `quote`, `ordered-list`,
  `check-list`, dynamic `link:*`, dynamic `format:*`, annotations, and table-cell
  metadata like `cellId`.

## Progress

- Restored `custom-types.d.ts`
- Moved `custom-types.d.ts` back under `site/examples/ts/`
- Updated example imports to the same-path `./custom-types`
- Patched `EditableTextBlocks` declaration output to carry the generic
  `renderElement` surface through the dist types the site consumes
- Restored `check-lists.tsx` to a stable source-close state under the recovered
  declaration path
- Reintroduced the ambient `declare module 'slate'` block
- Fixed the resulting example fallout in helpers and same-path examples
- Patched `slate` `Node.isElement` / `Node.isText` typing in source + dist
- Focused verification passed with `site/tsconfig.json`, package `slate` `tsc`,
  package `slate-react` `tsc`, and file-level Biome
