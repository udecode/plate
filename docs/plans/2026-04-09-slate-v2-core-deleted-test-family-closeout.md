---
date: 2026-04-09
topic: slate-v2-core-deleted-test-family-closeout
---

# Slate V2 Core Deleted Test-Family Closeout

> Historical batch note. The live closure read is now folded into
> [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md).

## Scope

Close the deleted `packages/slate/test/**` family bucket from the approved
Slate Core Deleted Test-Family Closure batch.

## Aggregate Closure Matrix

| Family                                    | Deleted count | Current disposition                                                                                          | Artifact                                                                                                                                                                   |
| ----------------------------------------- | ------------: | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interfaces/**`                           |         `576` | helper-heavy surface is mirrored by current proof; `CustomTypes` is explicit skip                            | [2026-04-09-slate-v2-interfaces-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-interfaces-family-deleted-test-closure.md)       |
| `transforms/**`                           |         `408` | current narrow transform contract is mirrored or directly recovered; broader legacy breadth is explicit skip | [2026-04-09-slate-v2-transforms-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-transforms-family-deleted-test-closure.md)       |
| `operations/**`                           |          `31` | raw operation seam is directly recovered and explicit skips are named                                        | [2026-04-09-slate-v2-operations-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-operations-family-deleted-test-closure.md)       |
| `normalization/**`                        |          `20` | current default-vs-explicit normalization split mirrors the deleted rows                                     | [2026-04-09-slate-v2-normalization-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-normalization-family-deleted-test-closure.md) |
| `utils/**` + root `index.js` + `jsx.d.ts` |          `13` | surviving string-unit value is mirrored; deleted helper/harness residue is explicit skip                     | [2026-04-09-slate-v2-utils-and-root-test-entrypoint-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-utils-and-root-test-entrypoint-closure.md)       |

Totals:

- `576 + 408 + 31 + 20 + 13 = 1048`
- reconciled total: `1048`

## Closeout Read

- the deleted `packages/slate/test/**` bucket is no longer an unclassified
  release mystery
- current-value seams are either:
  - mirrored by the live proof stack
  - directly recovered on the current engine
  - explicitly skipped with named rationale

## Important Boundary

This closes the core deleted test-family batch only.

It does **not** close the broader
`major file/test deletion review` bucket in
[release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md),
because deleted families still remain outside `packages/slate/test/**`:

- `packages/slate-react/test/**`
- `packages/slate-history/test/**`
- example/browser/supporting-package deleted families

## Verification

Final gate rerun passed for the core deleted test-family batch:

- `yarn test:mocha`
- `yarn workspace slate-react run test`
- `yarn workspace slate-dom test`
- `yarn test:custom`
- `yarn lint:typescript`

Supporting focused reruns also passed during closure work:

- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate/test/operations-contract.ts ./packages/slate/test/transforms-contract.ts`
- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate/test/range-ref-contract.ts ./packages/slate/test/operations-contract.ts ./packages/slate/test/transforms-contract.ts --grep 'rebases range refs inside the moved top-level block when moveNodes targets a later slot|rebases selection with the effective move_node target when moving to a later sibling slot|moveNodes can move a top-level block inside the next block container'`
- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts --grep 'supports merge_node on an element path and preserves moved descendant ids|supports path-based mergeNodes helper calls on element nodes|mirrors the legacy wrapNodes/path/block.tsx oracle row'`
