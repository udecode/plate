---
date: 2026-04-09
topic: slate-v2-operations-family-deleted-test-closure
---

# Slate V2 Operations Family Deleted-Test Closure

## Scope

Close the deleted `packages/slate/test/operations/**` family with explicit
cluster accounting instead of leaving it as a vague shadow behind
`snapshot-contract.ts`.

## Family Closure Matrix

| Cluster id                           | Deleted count | Status          | Current proof owner                                                                              | Resolution                                                                                                             |
| ------------------------------------ | ------------: | --------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `operations.move_node`               |             2 | `recovered now` | [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts) | direct proof covers no-op, later-slot destination rebasing, and current selection rebasing on the raw `move_node` seam |
| `operations.split_node`              |             4 | `recovered now` | [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts) | direct proof covers text/element behavior plus the `*-empty-properties` rows                                           |
| `operations.remove_node`             |            11 | `recovered now` | [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts) | restored as direct family proof and fixed at the core operation seam; snapshot overlap stays incidental, not the owner |
| `operations.remove_text`             |             9 | `recovered now` | [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts) | restored as direct expanded-selection proof on the raw `remove_text` seam instead of only surviving inside snapshot    |
| `operations.set_node/remove-omit`    |             1 | `recovered now` | [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts) | direct proof covers omit-to-remove semantics on the current raw `set_node` seam                                        |
| `operations.set_node/null-undefined` |             2 | `explicit skip` | none                                                                                             | null/undefined removal sentinels are backwards-compat legacy and not part of the current public claim                  |
| `operations.set_selection`           |             2 | `explicit skip` | none                                                                                             | custom selection props are outside the current `Range` contract and are not part of the live public claim              |

Totals:

- `mirrored now`: `0`
- `recovered now`: `27`
- `explicit skip`: `4`
- reconciled total: `31`

## Why The Restores Were Real

- `remove_node` was not just a deleted-fixture nostalgia row. The engine in
  [core.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core.ts) was not
  rebasing `transaction.selection` at all for `remove_node`.
- the restored direct proof covers:
  - rebasing to next text when deleting the selected leading empty text
  - rebasing to previous text end when deleting the selected trailing empty text
  - rebasing into an adjacent inline when deleting the selected trailing spacer
    text
- `remove_text` now has direct expanded-selection proof instead of only a
  collapsed cursor case buried in the snapshot suite
- `set_node` omitted-property removal and `split_node` empty-properties behavior
  are now direct raw-operation rows instead of indirect behavior

## Explicit Skip Rationale

### `operations.set_selection`

- `custom-props.tsx`
- `remove.tsx`

Skip reason:

- the current selection contract is a plain
  [Range](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts) with
  `anchor` and `focus`
- the live public surface does not claim legacy ad-hoc custom selection props
- restoring these would widen the current contract instead of closing a proved
  gap

### `operations.set_node`

- `remove-null.tsx`
- `remove-undefined.tsx`

Skip reason:

- those rows exist for backwards-compat removal sentinels
- the current contract is the simpler omit-to-remove behavior proved by
  `remove-omit.tsx`
- widening back to null/undefined deletion semantics is not justified by the
  current public claim

## Code Change

- [core.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core.ts) now
  rebases selection for `remove_node` by finding the nearest surviving point in
  the draft tree before removal, then transforming that fallback through the
  operation

## Proof Owner

- [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts)
