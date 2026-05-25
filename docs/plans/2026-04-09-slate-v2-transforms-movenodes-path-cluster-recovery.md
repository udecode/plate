---
date: 2026-04-09
topic: slate-v2-transforms-movenodes-path-cluster-recovery
---

# Slate V2 Transforms MoveNodes Path Cluster Recovery

## Scope

Recover the still-useful `packages/slate/test/transforms/moveNodes/path/**`
cluster on the current helper seam without pretending the whole deleted family
is already rebuilt.

## Recovered Contract

- `Transforms.moveNodes(...)` keeps the current exact-path no-op behavior when
  `at` and `to` are equal
- later nested-container targets are rebased before they hit raw `move_node`
- `move_node` now rebases selection on the transaction seam instead of leaving
  stale paths behind after helper-driven moves

## Direct Proof

- [transforms-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/transforms-contract.ts)

Current direct rows:

- exact-path no-op move
- moving a top-level block into the next block container while preserving
  selection rebasing into the moved block

## Why This Was Worth Restoring

- the deleted `moveNodes/path/**` rows still map to real helper behavior
- the helper was forwarding user-facing nested `to` paths too literally
- the raw `move_node` operation seam was not rebasing `transaction.selection`
  at all

## Code Change

- [transforms-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node.ts)
  now pre-adjusts later nested targets before applying raw `move_node`
- [core.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core.ts)
  now rebases selection for `move_node`

## Explicit Skip Boundary

Not recovered in this batch:

- richer `moveNodes/path/text*.tsx` rows that rely on broader live adjacent-text
  merge behavior after cross-block text moves

That behavior is outside the currently proved live normalization floor and
should not be smuggled back in as a “free” helper fix.
