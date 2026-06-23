---
date: 2026-04-09
topic: plite-history-helper-recovery
status: completed
---

# Plite History Helper Recovery

## Goal

Recover the remaining cheap `plite-history` helper surface that the current docs
still claim.

## Completed

- restored `HistoryEditor.withNewBatch(...)`
- restored `HistoryEditor.withoutMerging(...)`
- restored the `editor.writeHistory(...)` instance seam in the public interface
- routed commit-time undo/redo stack writes through `editor.writeHistory(...)`
- mapped split-once behavior onto the current commit-subscriber history writer
- widened `history-contract.ts` to prove split-once batching, hard non-merge,
  and the writer seam

## Verification

- `yarn test:custom`
- `yarn lint:typescript`
