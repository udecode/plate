---
date: 2026-04-09
topic: plite-slate-history-deleted-test-family-closure
---

# Plite Plite History Deleted Test-Family Closure: packages/plite-history/test/\*\*

> Historical batch note. The live closure read is now folded into
> [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/plite/release-file-review-ledger.md).

## Scope closed

- `packages/plite-history/test/**`

## Frozen Deleted Inventory

Captured from:

```bash
git -C /Users/zbeyens/git/plite diff --diff-filter=D --name-only -- packages/plite-history/test
```

Exact deleted test paths: `17`

- `packages/plite-history/test/index.js`
- `packages/plite-history/test/isHistory/after-edit.js`
- `packages/plite-history/test/isHistory/after-redo.js`
- `packages/plite-history/test/isHistory/after-undo.js`
- `packages/plite-history/test/isHistory/before-edit.js`
- `packages/plite-history/test/jsx.d.ts`
- `packages/plite-history/test/undo/cursor/keep_after_focus_and_remove_text_undo.js`
- `packages/plite-history/test/undo/delete_backward/block-join-reverse.tsx`
- `packages/plite-history/test/undo/delete_backward/block-nested-reverse.tsx`
- `packages/plite-history/test/undo/delete_backward/block-text.tsx`
- `packages/plite-history/test/undo/delete_backward/custom-prop.tsx`
- `packages/plite-history/test/undo/delete_backward/inline-across.tsx`
- `packages/plite-history/test/undo/insert_break/basic.tsx`
- `packages/plite-history/test/undo/insert_fragment/basic.tsx`
- `packages/plite-history/test/undo/insert_text/basic.tsx`
- `packages/plite-history/test/undo/insert_text/contiguous.tsx`
- `packages/plite-history/test/undo/insert_text/non-contiguous.tsx`

## Test-Family Closure Matrix

| Deleted file / cluster                                                                           | Deleted count | Status          | Current proof owner / replacement                                                                                                                                                                  | Resolution                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------ | ------------: | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| harness files (`test/index.js`, `test/jsx.d.ts`)                                                 |             2 | `explicit skip` | [history-contract.ts](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts)                                                                                                 | deleted fixture harness files add no current contributor-facing value; the live proof surface is the direct contract suite                                   |
| `test/isHistory/*`                                                                               |             4 | `recovered now` | [history-contract.ts](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts)                                                                                                 | direct proof now keeps `History.isHistory(...)` true before edits and across edit, undo, and redo lifecycle                                                  |
| `test/undo/cursor/keep_after_focus_and_remove_text_undo.js`                                      |             1 | `recovered now` | [history-contract.ts](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts)                                                                                                 | direct proof now restores the saved expanded selection after delete, blur, refocus, and undo                                                                 |
| `test/undo/delete_backward/block-join-reverse.tsx`, `block-nested-reverse.tsx`, `block-text.tsx` |             3 | `recovered now` | [history-contract.ts](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts)                                                                                                 | direct proof now restores reverse block joins, reverse nested block joins, and reverse same-text deletes                                                     |
| `test/undo/delete_backward/custom-prop.tsx`                                                      |             1 | `explicit skip` | [history-contract.ts](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts)                                                                                                 | the old cross-block delete shape is wider than the live delete helper contract; current same-text custom-prop restore is proved directly instead             |
| `test/undo/delete_backward/inline-across.tsx`                                                    |             1 | `explicit skip` | [history-contract.ts](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts)                                                                                                 | the old cross-inline multi-block delete shape is wider than the live delete helper contract; current same-text inline restore is proved directly instead     |
| `test/undo/insert_break/basic.tsx`                                                               |             1 | `recovered now` | [history-contract.ts](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts)                                                                                                 | direct proof now restores `insertBreak()` commits                                                                                                            |
| `test/undo/insert_fragment/basic.tsx`                                                            |             1 | `explicit skip` | [history-contract.ts](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts), [clipboard-contract.ts](/Users/zbeyens/git/plite/packages/plite/test/clipboard-contract.ts) | the deleted deep nested fragment shape is beyond the current simple-block fragment contract; current simple block fragment undo is proved directly instead   |
| `test/undo/insert_text/basic.tsx`                                                                |             1 | `recovered now` | [history-contract.ts](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts)                                                                                                 | direct proof now restores a plain `insertText(...)` commit                                                                                                   |
| `test/undo/insert_text/contiguous.tsx`, `test/undo/insert_text/non-contiguous.tsx`               |             2 | `explicit skip` | [history-contract.ts](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts), [Readme.md](/Users/zbeyens/git/plite/packages/plite-history/Readme.md)                      | legacy timing-based auto-merge heuristics are not the live contract; the current package uses one outer transaction per undo unit and explicit merge helpers |

Totals:

- `recovered now`: `10`
- `explicit skip`: `7`
- reconciled deleted test paths: `17`

## What Was Recovered

- [history-contract.ts](/Users/zbeyens/git/plite/packages/plite-history/test/history-contract.ts)
  now directly proves:
  - `History.isHistory(...)` stays true before edits and across undo/redo
  - a plain `insertText(...)` commit is undoable
  - reverse block joins and reverse nested block joins undo cleanly
  - reverse same-text deletes undo cleanly
  - same-text deletes keep custom props and inline node content on undo
  - delete-fragment selection restore survives deselect and refocus before undo
  - `insertBreak()` commits undo cleanly
  - current simple block fragment insertion undoes cleanly

## Explicit Skip Rationale

### Harness files

- `test/index.js` and `test/jsx.d.ts` were fixture plumbing
- reviving them would rebuild dead harness shape instead of strengthening the
  current contract suite

### Cross-node delete helper width

- the current delete helper contract is narrower than the old
  cross-block/cross-inline fixture shapes
- this batch keeps history proof honest by proving the supported same-text
  delete surface directly and cutting the wider legacy rows explicitly

### Deep nested fragment depth

- current fragment proof is the simple block fragment seam
- reviving the deleted nested fragment fixture would overclaim a wider fragment
  contract than the live package currently proves

### Legacy auto-merge heuristics

- the current package does not promise timing-based contiguous insert merge
- the live contract is:
  - one outer transaction is one undo unit
  - merge boundaries are explicit through `withMerging(...)`,
    `withNewBatch(...)`, and `withoutMerging(...)`

## Package Parent Tree

| Scope                                   | Status   | Notes                                                                                              |
| --------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `packages/plite-history/**`             | `open`   | parent stays open because deleted `src/history.ts` and package-root residue are outside this batch |
| `packages/plite-history/test/**`        | `closed` | closed by this note                                                                                |
| `packages/plite-history/src/history.ts` | `open`   | deleted source rewrite still needs explicit file-level audit against the current package surface   |
| `packages/plite-history/CHANGELOG.md`   | `open`   | package-root changelog residue still needs explicit low-priority disposition                       |

## Sibling buckets still open

- `packages/plite-history/src/history.ts`
- `packages/plite-history/CHANGELOG.md`

## What this batch does NOT close

- `packages/plite-history/**`
- supporting example/browser deletion families
- broader `True Plite RC` blockers outside deleted-history tests

## Fresh verification required for this closure

- `yarn workspace slate-history run test`
- `yarn test:custom`
- `yarn lint:typescript`
