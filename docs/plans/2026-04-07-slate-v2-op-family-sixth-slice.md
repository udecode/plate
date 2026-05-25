# Slate v2 Op-family Sixth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the next matching core-family step in `slate`: exact `merge_node` plus a
  narrow `Transforms.mergeNodes(...)` helper.

## Finding

- `split_node` was now real, but the matching `merge_node` half of the pair was
  still missing from the package.
- The honest first helper is path-based text-node merging, not broad legacy
  `mergeNodes` parity.

## Slice

- Add real `merge_node` support for text paths first, then exact path-based
  element merges.
- Add a narrow `Transforms.mergeNodes(editor, { at })`.
- Keep left-branch runtime ids stable and rebase selection inward.

## Verification

- `yarn mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
- `yarn test:mocha`
- targeted `tsc` diagnostics on changed `packages/slate` files: 0 errors
- targeted `yarn exec eslint` on changed `packages/slate` files
- `yarn prettier --check` on changed `slate-v2` files
- `pnpm exec prettier --check` on changed `plate-2` docs
