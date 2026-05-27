---
date: 2026-04-08
topic: slate-v2-public-core-diff-closure
status: completed
---

# Slate v2 Public/Core Diff Closure

## Goal

Close the next big `packages/slate/src` public/core gap with one coherent batch,
not another one-method-at-a-time crawl.

## Current Batch

1. audit legacy `packages/slate/src` editor/static helper files against the
   current public surface
2. recover a coherent static read/query helper family in `Editor.*`
3. prove the family in `snapshot-contract.ts`
4. update file-granular ledger rows so the remaining holes are explicit

## Notes

- the obvious open hole is the static read/query layer, not another transform
  seam
- restore helpers that fit the current data-model-first engine
- do not fake iterator-width or legacy breadth that the current engine still
  cannot prove

## Result

- restored a coherent `Editor.*` static read/query batch for the current
  live-tree seam:
  `edges`, `first`, `start`, `end`, `last`, `parent`, `path`, `point`,
  `range`, `node`, `string`, `fragment`, `hasPath`, `hasBlocks`,
  `hasInlines`, `hasTexts`, `isBlock`, `isEmpty`, `isStart`, `isEnd`, and
  `isEdge`
- widened that same family onto the editor instance surface and added the
  sibling/iterator helpers `next`, `previous`, `levels`, `nodes`, `leaf`, and
  `void`
- restored the current headless ref seam:
  `pathRef`, `pathRefs`, `pointRef`, `pointRefs`, and `rangeRefs`
- restored the next traversal/control helpers:
  `above`, `positions`, `normalize`, `isNormalizing`, and `unhangRange`
- restored the remaining obvious docs-backed query hooks:
  `elementReadOnly`, `isElementReadOnly`, and `isSelectable`
- restored singular `insertNode` on both `Editor.*` and `editor.*` over the
  current `insertNodes` seam
- widened proof depth for the recovered helpers with representative legacy rows
  for `above`, `positions`, and `unhangRange`
- restored the remaining editor-instance compatibility hooks:
  `getChildren`, `setChildren`, `getDirtyPaths`, `setNormalizing`,
  `shouldMergeNodesRemovePrevNode`, and the enumerable `children` accessor
- widened the exported utility surface for:
  `Path.*`, `Point.*`, and `Range.*`
- proved those helpers against both committed snapshots and live transactions in
  `snapshot-contract.ts`
- closed file-granular review for the current `packages/slate/src` tree in
  `release-file-review-ledger.md`
- added a matching public-surface proof row to `true-slate-rc-proof-ledger.md`
- updated the API reference front door so the recovered static surface is
  explicit and the still-missing iterator/query breadth is called out
- closed the already-green proof rows for `range-ref-contract.ts`,
  `clipboard-contract.ts`, and `history-contract.ts` so those lanes are no
  longer marked pending out of laziness

## Verification

- `yarn test:custom`
- `yarn lint:typescript`
