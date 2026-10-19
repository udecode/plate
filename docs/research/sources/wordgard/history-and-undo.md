# Wordgard: history and undo

## Undo grouping

- **Grouping.** `test/test-history.ts` lines 41-303 and 323-428 at b5ad0d0 pin undo and redo grouping, delays, explicit isolation, excluded edits, selection restoration, depth and repeated traversal. Plite's `packages/plitejs/test/history/history-contract.ts` and `integrity-contract.ts` cover root-aware, composition, selection, policy, property and structural cases (report.md:94).

## Mapping saved history

- **Mapping saved history.** `test/test-history.ts` lines 122-268 and 374-543 at b5ad0d0 pin that saved batches and invertible effects map through edits that are not recorded in history, and through remote edits, without resurrecting deleted content. Plite covers skipped edits, remote rebase, state effects and dropped batches in `packages/plitejs/test/history/history-contract.ts`, `packages/plitejs/test/history/document-state-history-contract.ts` and `packages/plitejs/test/collab-history-runtime-contract.ts` (report.md:95; paths checked 2026-10-08).

## Seeded soak

- **Seeded soak.** `test/test-history.ts` lines 304-322 at b5ad0d0 run long seeded mixtures of edits, undo and redo, and check tree, selection and stack invariants. Plite's `packages/plitejs/test/history/history-soak-contract.slow.ts` does the same with replayable traces (report.md:96).

## History persistence

- **Persistence.** `test/test-history.ts` lines 545-581 at b5ad0d0 pin that a history stack round-trips through a validated persistence form without changing later undo and redo. Plite's `packages/plitejs/test/history/history-persistence-contract.spec.ts` covers a versioned format, canonical changes, typed effects, custom and rootless selections, pending marks, registered domain effects, remote rebase, and rejection of stale, unknown or schema-mismatched input (report.md:97).
