# Slate v2 Op-family Fifth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the next honest core-family step in `slate`: exact `split_node` plus a
  narrow `Transforms.splitNodes(...)` helper.

## Finding

- The docs already listed `split_node` and `Transforms.splitNodes(...)`.
- The current core already had descendant splitting helpers, but no public
  split operation or helper.
- The honest first cut is text-node splitting, not broad legacy
  `NodeOptions` parity.

## Slice

- Add real `split_node` support for text paths first, then exact path-based
  element splits.
- Add a narrow `Transforms.splitNodes(...)` helper:
  - `{ at?: Point }` for text-node splits
  - `{ at: Path, position }` for exact path-based element splits
- Keep left-branch runtime ids stable, allocate a fresh right-branch id, and
  rebase selection inward.

## Verification

- `yarn mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
- `yarn test:mocha`
- targeted `tsc` diagnostics on changed `packages/slate` files: 0 errors
- targeted `yarn exec eslint` on changed `packages/slate` files
- `yarn prettier --check` on changed `slate-v2` files
- `pnpm exec prettier --check` on changed `plate-2` docs
