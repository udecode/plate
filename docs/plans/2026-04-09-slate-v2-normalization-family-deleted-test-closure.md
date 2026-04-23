---
date: 2026-04-09
topic: slate-v2-normalization-family-deleted-test-closure
---

# Slate V2 Normalization Family Deleted-Test Closure

## Scope

Close the deleted `packages/slate/test/normalization/**` family against the
current default-vs-explicit normalization contract.

## Family Closure Matrix

| Cluster id             | Deleted count | Status         | Current proof owner                                                                                    | Resolution                                                                                                                             |
| ---------------------- | ------------: | -------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `normalization.block`  |           `5` | `mirrored now` | [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts) | empty-block repair, app-owned custom block normalization, and block-only child cleanup are directly proved on the current default seam |
| `normalization.editor` |           `4` | `mirrored now` | [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts) | top-level stray text and inline cleanup are directly proved on the current replace/manual-normalize seam                               |
| `normalization.inline` |           `2` | `mirrored now` | [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts) | inline-container block-wrapper flattening and adjacent text canonicalization are directly proved on the explicit normalize seam        |
| `normalization.text`   |           `7` | `mirrored now` | [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts) | adjacent-text merge and empty-adjacent cleanup are carried by the explicit normalize seam instead of a blanket live invariant          |
| `normalization.void`   |           `2` | `mirrored now` | [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts) | void inline/block empty-child repair is directly proved on the current default seam                                                    |

Totals:

- mirrored now: `20`
- explicit skip: `0`
- reconciled total: `20`

## Why This Family Is Closed

- the current package no longer claims blanket legacy always-on normalization
- the deleted rows map cleanly onto the current split:
  - safe default live invariants
  - heavier explicit `Editor.normalize(...)` cleanup
- no deleted normalization row needs to stay as a fake “open mystery” after
  that split is named and proved
