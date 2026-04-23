# Slate v2 Op-family Seventh Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the next narrow selection-transform follow-on in `slate`:
  `Transforms.setSelection(...)` and `Transforms.deselect(...)`.

## Finding

- The current docs already described both helpers.
- The package only had raw `select(...)`.
- The subtle bug was helper semantics inside outer transactions: reading
  `editor.selection` would have used stale committed state instead of the live
  draft selection.

## Slice

- Add `Transforms.setSelection(editor, props)`.
- Add `Transforms.deselect(editor)`.
- Keep the slice narrow:
  - no `collapse`, `move`, or `setPoint` yet
  - no broad legacy selection-transform parity
  - live draft selection is the important seam

## Verification

- `yarn mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
- `yarn test:mocha`
- targeted `tsc` diagnostics on changed `packages/slate` files: 0 errors
- targeted `yarn exec eslint` on changed `packages/slate` files
- `yarn prettier --check` on changed `slate-v2` files
- `pnpm exec prettier --check` on changed `plate-2` docs
