# Slate v2 Op-family Ninth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the next narrow selection helper in `slate`: `Transforms.setPoint(...)`.

## Finding

- The current docs already described `setPoint(...)`.
- The important seam was not the API name. It was reading the live draft
  selection and resolving `start` / `end` against the current selection
  direction.

## Slice

- Add `Transforms.setPoint(editor, props, { edge? })`.
- Support `anchor`, `focus`, `start`, and `end`.
- Keep it narrow:
  - no `move(...)`
  - no broader selection-motion family
  - one-point update only

## Verification

- `yarn mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
- `yarn test:mocha`
- `yarn workspace slate-react run test`
- targeted `tsc` diagnostics on changed `packages/slate` files: 0 errors
- targeted `yarn exec eslint` on changed `packages/slate` files
- `yarn prettier --check` on changed `slate-v2` files
- `pnpm exec prettier --check` on changed `plate-2` docs
