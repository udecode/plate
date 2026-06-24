---
date: 2026-04-13
topic: slate-history-api
generated: true
---

# Plite History API Audit Matrix

- Exact audit rows generated from the live exact ledgers for `packages/plite-history/src/*.ts` surfaces.
- Statuses are inherited from the current exact ledgers and tightened as recovery lands.

```tsv
legacy_row	status	proof_owner	source_owner	docs_owner	note
packages/plite-history/test/apply-batch-exact-set-node.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/history-editor-flags.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/index.js	explicit-skip	none	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	fixture harness entrypoint is retired
packages/plite-history/test/isHistory/after-edit.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/isHistory/after-redo.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/isHistory/after-undo.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/isHistory/before-edit.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/jsx.d.ts	explicit-skip	none	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	fixture harness typing shim is retired
packages/plite-history/test/redo-selection.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/cursor/keep_after_focus_and_remove_text_undo.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/delete_backward/block-join-reverse.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/delete_backward/block-nested-reverse.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/delete_backward/block-text.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/delete_backward/custom-prop.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/delete_backward/inline-across.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/insert_break/basic.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/insert_fragment/basic.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts; packages/plite/test/clipboard-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/insert_text/basic.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/insert_text/contiguous.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/insert_text/non-contiguous.tsx	explicit-skip	none	packages/plite-history/src/*.ts	docs/libraries/plite-history/*.md	timing-based auto-merge heuristics are not the live contract
```
