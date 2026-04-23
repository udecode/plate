# Slate v2 Op-family First Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Make the first missing core op-family slice real in `/Users/zbeyens/git/slate-v2/packages/slate`.

## Scope

- Start with the smallest honest op-family/API mismatch already implied by docs.
- Prefer `insert_node` / `remove_node` plus matching `Transforms` wrappers if the core can support them cleanly.

## Phases

- [x] Confirm the exact mismatch and current code seams
- [x] Write focused failing tests
- [x] Implement the smallest honest core/API slice
- [x] Sync package/public docs
- [x] Verify the touched package/docs

## Finding

- The current `slate` docs already implied `insert_node` / `remove_node` and
  `Transforms.insertNodes(...)` / `Transforms.removeNodes(...)`, but the package
  only implemented four operations and four transform helpers.

## Slice

- Add real `insert_node` / `remove_node` operation types and core apply cases.
- Add path-based `Transforms.insertNodes(...)` / `Transforms.removeNodes(...)`.
- Keep the slice narrow:
  - no fake broad NodeOptions parity
  - no selection-heavy transform semantics
  - no broader node families yet

## Verification

- `yarn mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
- `yarn test:mocha`
- `yarn workspace slate-react run test`
- targeted `tsc` diagnostics on changed `packages/slate` files: 0 errors
- `yarn exec eslint` on changed `packages/slate` files
- `yarn prettier --check` on changed `slate-v2` files
- `pnpm exec prettier --check` on changed `plate-2` docs

## Notes

- repo-wide `yarn lint:typescript` still hits stale workspace `*-v2` tsconfig
  references outside this slice
- repo-wide `yarn lint:eslint` still reports thousands of unrelated existing
  issues, so targeted eslint was the honest signal for the changed files

## Follow-on

- the next honest `slate` op-family slice is path-based `set_node` /
  `Transforms.setNodes(...)`
