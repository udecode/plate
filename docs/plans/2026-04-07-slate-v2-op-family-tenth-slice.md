# Slate v2 Op-family Tenth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the next narrow selection helper follow-on in `slate`: broaden
  `Transforms.select(...)` to the next honest `Location` cut.

## Finding

- The docs already described `select(...)` as taking a `Location`.
- The package originally only handled `Range | null`.
- The next honest cut turned into `Path | Point | Range | null`, still short of
  broad path/location parity.

## Slice

- Add `Path | Point | Range | null` support to `Transforms.select(...)`.
- Turn `Path` into the exact current node range.
- Turn `Point` into a collapsed selection.
- Keep the slice narrow:
  - no full legacy `Location` parity

## Verification

- `yarn mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts`
- `yarn test:mocha`
- `yarn workspace slate-react run test`
- targeted `tsc` diagnostics on changed `packages/slate` files: 0 errors
- targeted `yarn exec eslint` on changed `packages/slate` files
- `yarn prettier --check` on changed `slate-v2` files
- `pnpm exec prettier --check` on changed `plate-2` docs
