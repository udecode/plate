# Slate v2 Op-family Third Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the next narrow `slate` op-family follow-on: path-based
  `Transforms.unsetNodes(...)`.

## Finding

- The new `set_node` seam made path-based property updates real.
- The next honest follow-on was property removal through that same seam, not a
  wider new node-family jump.

## Slice

- Add `Transforms.unsetNodes(editor, props, { at })`.
- Reuse `set_node` with the `properties/newProperties` pair for property
  removal.
- Keep it narrow:
  - path-based only
  - custom prop removal only
  - no broad legacy `NodeOptions` parity

## Verification

- `yarn mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
- `yarn test:mocha`
- targeted `tsc` diagnostics on changed `packages/slate` files: 0 errors
- targeted `yarn exec eslint` on changed `packages/slate` files
- `yarn prettier --check` on changed `slate-v2` files
- `pnpm exec prettier --check` on changed `plate-2` docs
