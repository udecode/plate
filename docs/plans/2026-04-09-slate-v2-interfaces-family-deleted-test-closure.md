---
date: 2026-04-09
topic: slate-v2-interfaces-family-deleted-test-closure
---

# Slate V2 Interfaces Family Deleted-Test Closure

## Scope

Close the deleted `packages/slate/test/interfaces/**` family by separating the
current helper surface that is already mirrored by live proof from the deleted
TypeScript declaration-merging surface that no longer belongs to the current
contract.

## Family Closure Matrix

| Cluster id                                                                                                                                 | Deleted count | Status          | Current proof owner                                                                                                                                                                            | Resolution                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------: | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Editor/positions`                                                                                                                         |          `40` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                   | current point iteration is already proved across offset, character, word, block, reverse, inline-fragmentation, and voids lanes       |
| `Editor/nodes`                                                                                                                             |          `26` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                   | current traversal is already proved across `match`, `mode`, `pass`, and `universal` seams                                             |
| `Editor/unhangRange`                                                                                                                       |          `13` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                   | current hanging-range behavior and void handling are already proved directly                                                          |
| `Editor/after` + `Editor/before`                                                                                                           |          `23` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                   | current point/path/range helper rows are already mirrored directly                                                                    |
| `Editor/above` + `Editor/marks` + `Editor/string` + `Editor/next` + `Editor/previous` + `Editor/isEmpty` and related small Editor clusters |          `85` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                   | the current read/query seam is already materially covered in the live oracle tranche                                                  |
| `Path/*`                                                                                                                                   |         `120` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                   | relationship helpers plus `Path.transform(...)` are already directly proved                                                           |
| `Point/*`                                                                                                                                  |          `50` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                   | compare / equality / direction helpers plus `Point.transform(...)` are already directly proved                                        |
| `Range/*`                                                                                                                                  |          `32` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts), [interfaces-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces-contract.ts) | includes / equality / direction / transform plus runtime guards are already proved                                                    |
| `Node/*`                                                                                                                                   |          `52` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts), [interfaces-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces-contract.ts) | `Node.isNode`, `isNodeList`, `getIf`, `string`, `descendants`, `elements`, and `texts` are already directly proved                    |
| `Text/*`                                                                                                                                   |          `36` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts), [interfaces-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces-contract.ts) | `Text.equals`, `decorations`, `isText`, `isTextList`, and `matches` are already directly proved                                       |
| `Element/*`                                                                                                                                |          `21` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts), [interfaces-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces-contract.ts) | `Element.isElement`, `isElementList`, and helper predicates are already directly proved                                               |
| `Location/*`                                                                                                                               |          `25` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                   | `Location.isPath`, `isPoint`, `isRange`, and `isSpan` are already directly proved                                                     |
| `Operation/*`                                                                                                                              |          `26` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts), [interfaces-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces-contract.ts) | `isOperation`, `isOperationList`, and `inverse(...)` are already directly proved                                                      |
| `Scrubber/__root__`                                                                                                                        |           `1` | `mirrored now`  | [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)                                                                                                   | the current scrubber seam is already directly proved                                                                                  |
| `CustomTypes/__root__`                                                                                                                     |          `10` | `explicit skip` | none                                                                                                                                                                                           | deleted declaration-merging tests targeted a `CustomTypes` seam that does not exist in the current exported types or runtime contract |

Totals:

- mirrored now: `566`
- explicit skip: `10`
- reconciled total: `576`

## Why The Explicit Skip Is Honest

The deleted `CustomTypes` rows depended on a module-augmentation seam that the
current package does not expose:

- there is no `CustomTypes` interface in
  [interfaces.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts)
- the live exported document model is structural and open-ended:
  - `Element` is `{ type: string; children: readonly Descendant[]; [key: string]: unknown }`
  - `Text` is `{ text: string; [key: string]: unknown }`
- the only remaining references to `CustomTypes` were stale docs

That makes `CustomTypes` a real explicit skip, not hidden missing proof.

## Docs Synced

- [12-typescript.md](/Users/zbeyens/git/slate-v2/docs/concepts/12-typescript.md)
- [01-installing-slate.md](/Users/zbeyens/git/slate-v2/docs/walkthroughs/01-installing-slate.md)
