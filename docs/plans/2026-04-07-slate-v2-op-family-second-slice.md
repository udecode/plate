# Slate v2 Op-family Second Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the next honest `slate` op-family slice: path-based `set_node` and `Transforms.setNodes(...)`.

## Finding

- The current docs already described `set_node` and `Transforms.setNodes(...)`.
- The package still lacked both the operation and the transform wrapper.
- The deeper bug was worse: the draft/snapshot model stripped custom node props entirely, so a fake `setNodes` wrapper would have lied.

## Slice

- Add real `set_node` support in the core transaction engine.
- Add path-based `Transforms.setNodes(editor, props, { at })`.
- Preserve custom element/text props through:
  - replacement
  - draft mutation
  - snapshot publication
  - text splitting/fragment cloning paths touched by the current proof subset
- Keep the slice narrow:
  - no broad legacy `NodeOptions` parity
  - no `unsetNodes(...)`
  - no wider node-family rollout

## Verification

- `yarn mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
- `yarn test:mocha`
- `yarn workspace slate-react run test`
- targeted `tsc` diagnostics on changed `packages/slate` files: 0 errors
- targeted `yarn exec eslint` on changed `packages/slate` files
- `yarn prettier --check` on changed `slate-v2` files
- `pnpm exec prettier --check` on changed `plate-2` docs

## Notes

- repo-wide `yarn lint:typescript` still hits stale workspace `*-v2` tsconfig refs outside this slice
- repo-wide `yarn lint:eslint` still reports unrelated existing issues, so targeted eslint is the honest signal here
