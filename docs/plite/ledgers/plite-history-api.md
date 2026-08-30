---
date: 2026-04-13
topic: slate-history-api
generated: true
---

# Plite History API Audit Matrix

- Exact audit rows generated from the live exact ledgers for `packages/plitejs/src/history/*.ts` surfaces.
- Statuses are inherited from the current exact ledgers and tightened as recovery lands.

```tsv
legacy_row	status	proof_owner	source_owner	docs_owner	note
packages/plitejs/test/history/apply-batch-exact-set-node.js	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/history-editor-flags.js	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/index.js	explicit-skip	none	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	fixture harness entrypoint is retired
packages/plitejs/test/history/isHistory/after-edit.js	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/isHistory/after-redo.js	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/isHistory/after-undo.js	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/isHistory/before-edit.js	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/jsx.d.ts	explicit-skip	none	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	fixture harness typing shim is retired
packages/plitejs/test/history/redo-selection.js	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/undo/cursor/keep_after_focus_and_remove_text_undo.js	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/undo/delete_backward/block-join-reverse.tsx	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/undo/delete_backward/block-nested-reverse.tsx	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/undo/delete_backward/block-text.tsx	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/undo/delete_backward/custom-prop.tsx	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/undo/delete_backward/inline-across.tsx	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/undo/insert_break/basic.tsx	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/undo/insert_fragment/basic.tsx	mapped-mirrored	packages/plitejs/test/history/history-contract.ts; packages/plitejs/test/clipboard-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/undo/insert_text/basic.tsx	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/undo/insert_text/contiguous.tsx	mapped-mirrored	packages/plitejs/test/history/history-contract.ts	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plitejs/test/history/undo/insert_text/non-contiguous.tsx	explicit-skip	none	packages/plitejs/src/history/*.ts	docs/libraries/plite-history/*.md	timing-based auto-merge heuristics are not the live contract
```

## Current Read

- direct kept-row history proof is now live in:
  - `packages/plitejs/test/history/history-contract.ts`
- direct integrity proof is now live in:
  - `packages/plitejs/test/history/integrity-contract.ts`
- that owner now proves:
  - `History.isHistory(...)` lifecycle truth
  - plain insert-text undo
  - contiguous insert-text merge-as-one-undo-unit
  - delete-fragment selection restore after deselect / refocus
  - reverse block / nested-block / same-text delete undo
  - `insertBreak()` undo
- the integrity owner now proves:
  - one outer transaction is one undo unit
  - `withNewBatch(...)` splits once and then merges the rest of the scope
  - `withoutMerging(...)` forces a fresh batch
  - `withoutSaving(...)` suppresses history recording
  - `writeHistory(...)` remains the stack-write seam
  - history capture sees committed ops before `onChange()` reentry can smear
    them
- the live history compare owner is now wired again:
  - `bun run bench:history:compare:local`
- latest compare read:
  - typing undo p95: `0.41ms` vs legacy `0.46ms`
  - typing redo p95: `0.11ms` vs legacy `1.73ms`
  - fragment undo p95: `0.55ms` vs legacy `3.86ms`
  - fragment redo p95: `0.73ms` vs legacy `5.94ms`
  - worst p95 ratio: `0.89`
