---
date: 2026-04-13
topic: slate-history-api
generated: true
---

# Slate History API Audit Matrix

- Exact audit rows generated from the live exact ledgers for `packages/slate-history/src/*.ts` surfaces.
- Statuses are inherited from the current exact ledgers and tightened as recovery lands.

```tsv
legacy_row	status	proof_owner	source_owner	docs_owner	note
packages/slate-history/test/apply-batch-exact-set-node.js	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/history-editor-flags.js	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/index.js	explicit-skip	none	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	fixture harness entrypoint is retired
packages/slate-history/test/isHistory/after-edit.js	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/isHistory/after-redo.js	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/isHistory/after-undo.js	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/isHistory/before-edit.js	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/jsx.d.ts	explicit-skip	none	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	fixture harness typing shim is retired
packages/slate-history/test/redo-selection.js	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/undo/cursor/keep_after_focus_and_remove_text_undo.js	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/undo/delete_backward/block-join-reverse.tsx	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/undo/delete_backward/block-nested-reverse.tsx	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/undo/delete_backward/block-text.tsx	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/undo/delete_backward/custom-prop.tsx	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/undo/delete_backward/inline-across.tsx	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/undo/insert_break/basic.tsx	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/undo/insert_fragment/basic.tsx	mapped-mirrored	packages/slate-history/test/history-contract.ts; packages/slate/test/clipboard-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/undo/insert_text/basic.tsx	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/undo/insert_text/contiguous.tsx	mapped-mirrored	packages/slate-history/test/history-contract.ts	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	direct legacy history parity is proved in history-contract
packages/slate-history/test/undo/insert_text/non-contiguous.tsx	explicit-skip	none	packages/slate-history/src/*.ts	docs/libraries/slate-history/*.md	timing-based auto-merge heuristics are not the live contract
```

## Current Read

- direct kept-row history proof is now live in:
  - `../slate-v2/packages/slate-history/test/history-contract.ts`
- direct integrity proof is now live in:
  - `../slate-v2/packages/slate-history/test/integrity-contract.ts`
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
  - typing undo: `+29.35ms`
  - typing redo: `+20.04ms`
  - fragment undo: `+25.29ms`
  - fragment redo: `+31.77ms`
