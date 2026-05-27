# Slate v2 Op-family Fourth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the next narrow text-op follow-on in `slate`: exact `remove_text` plus
  `Transforms.removeText(...)`.

## Finding

- The current docs already listed `remove_text` in the operation taxonomy.
- The package still lacked the operation and an exact text-removal helper.
- The honest helper is `removeText(...)`, not broad legacy
  `Transforms.delete(...)` parity.

## Slice

- Add real `remove_text` support in the core transaction engine.
- Add exact `Transforms.removeText(editor, text, { at? })`.
- Rebase selection inward on text removal.
- Keep the slice narrow:
  - exact text removal only
  - no broad `delete(...)` semantics
  - no unit/distance/hanging parity

## Verification

- `yarn mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
- `yarn test:mocha`
- `yarn workspace slate-react run test`
- targeted `tsc` diagnostics on changed `packages/slate` files: 0 errors
- targeted `yarn exec eslint` on changed `packages/slate` files
- `yarn prettier --check` on changed `slate-v2` files
- `pnpm exec prettier --check` on changed `plate-2` docs
