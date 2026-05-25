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
