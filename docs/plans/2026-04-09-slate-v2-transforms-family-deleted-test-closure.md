---
date: 2026-04-09
topic: slate-v2-transforms-family-deleted-test-closure
---

# Slate V2 Transforms Family Deleted-Test Closure

## Scope

Close the deleted `packages/slate/test/transforms/**` family against the
current `slate-v2` transform contract.

## Family Closure Matrix

| Cluster group                                                                                         | Deleted count | Status          | Current proof owner                                                                                                                                                                                                                                                                                | Resolution                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------- | ------------: | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `delete/*`                                                                                            |         `100` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                                                                                                                       | current narrow `Transforms.delete(...)` rows are directly proved on exact path, point, non-empty range, mixed-inline, and adjacent block-boundary seams            |
| `move/*`                                                                                              |          `49` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                                                                                                                       | current narrow `Transforms.move(...)` rows are directly proved across anchor/focus/start/end, distance/reverse, mixed-inline, and supported block-boundary seams   |
| `insertFragment/*`                                                                                    |          `41` | `mirrored now`  | [clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts), [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                       | current fragment insert behavior is proved on collapsed/expanded, mixed-inline, quote, wrapper-list, and explicit-target rebasing seams                            |
| `setNodes/*`                                                                                          |          `29` | `recovered now` | [transforms-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/transforms-contract.ts), [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                     | current helper widened from path-only to optional current-selection / explicit `Point` / `Range` / `Span` plus `match` / `mode` / `voids`                          |
| `moveNodes/path`                                                                                      |           `6` | `recovered now` | [transforms-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/transforms-contract.ts), [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts), [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts) | exact-path no-op plus later nested-container target rebasing are directly proved, including consistent selection + range-ref rebasing on the effective move target |
| `moveNodes/selection` + `moveNodes/voids-true`                                                        |           `7` | `mirrored now`  | [transforms-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/transforms-contract.ts), [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts), [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts) | selection-driven and `voids` move breadth stays inside the current `MoveNodesOptions` contract and the exact ledger rows remain mirrored                           |
| `wrapNodes/*`, `unwrapNodes/*`, `liftNodes/*`, `select/*`, `deselect/*`, `setPoint/*`, `unsetNodes/*` |          `64` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                                                                                                                       | the current helper seams are materially mirrored on exact path plus top-level span/current-selection behavior, and the recovered public option bags now match that surface |
| `mergeNodes/*`, `splitNodes/*`, `insertNodes/*`, `insertText/*`, `removeNodes/*`                      |         `112` | `recovered now` | [index.spec.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/index.spec.ts), [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts), [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts)                 | the old narrow-helper explicit-skip read is dead; upstream owner semantics for insert/split/merge/remove breadth are restored and the full transform fixture corpus is green |

Totals:

- mirrored now: `261`
- recovered now: `147`
- explicit skip: `0`
- reconciled total: `408`

## What Was Directly Recovered In This Batch

- `setNodes/inline/**`
- enough of `moveNodes/path/**` to prove:
  - exact-path no-op
  - later nested-container target rebasing
  - consistent selection + range-ref rebasing on the effective move target

See:

- [2026-04-09-slate-v2-transforms-setnodes-cluster-recovery.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-transforms-setnodes-cluster-recovery.md)
- [2026-04-09-slate-v2-transforms-movenodes-path-cluster-recovery.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-transforms-movenodes-path-cluster-recovery.md)

## Current Boundary

The old narrow-helper explicit-skip story for `packages/slate/test/transforms/**`
is no longer live.

Current `slate` package truth is simpler:

- the full transform fixture corpus is green
- helper breadth for `mergeNodes`, `splitNodes`, `insertNodes`, `insertText`,
  and `removeNodes` is recovered inside the kept package claim
- any remaining explicit skips for the overall migration program now live
  outside this `slate` transform-family closure
