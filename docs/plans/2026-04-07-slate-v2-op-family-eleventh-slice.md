# Slate v2 Op-family Eleventh Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the first honest `delete` family cut in `slate`: exact `{ at: Path }`
  support only.

## Finding

- The docs already listed `Transforms.delete(...)`.
- The package still had no helper at all.
- The smallest honest cut was exact path deletion over the existing node ops,
  not broad legacy delete semantics.

## Slice

- Add narrow `Transforms.delete(editor, { at: Path })`.
- Reuse the existing `remove_node` seam.
- Keep it narrow:
  - no point/range deletion
  - no unit/distance/reverse/hanging semantics
  - no fake legacy parity

## Verification

- `yarn mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
- `yarn test:mocha`
- `yarn workspace slate-react run test`
- targeted `tsc` diagnostics on changed `packages/slate` files: 0 errors
- targeted `yarn exec eslint` on changed `packages/slate` files
- `yarn prettier --check` on changed `slate-v2` files
- `pnpm exec prettier --check` on changed `plate-2` docs
