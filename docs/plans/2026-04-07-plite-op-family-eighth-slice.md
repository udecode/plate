# Plite Op-family Eighth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md).

## Goal

- Land the next narrow selection helper in `slate`: `Transforms.collapse(...)`.

## Finding

- The current docs already described `collapse(...)`.
- The package only had `select(...)`, `setSelection(...)`, and `deselect(...)`.
- The important seam was not the API name. It was reading the live draft
  selection inside outer transactions.

## Slice

- Add `Transforms.collapse(editor, { edge? })`.
- Support `anchor`, `focus`, `start`, and `end`.
- Keep it narrow:
  - no `move(...)`
  - no `setPoint(...)`
  - no broader selection-motion family

## Verification

- `yarn mocha --require ./config/babel/register.cjs ./packages/plite/test/snapshot-contract.ts`
- `yarn test:mocha`
- `yarn workspace slate-react run test`
- targeted `tsc` diagnostics on changed `packages/plite` files: 0 errors
- targeted `yarn exec eslint` on changed `packages/plite` files
- `yarn prettier --check` on changed `plite` files
- `pnpm exec prettier --check` on changed `plate-2` docs
