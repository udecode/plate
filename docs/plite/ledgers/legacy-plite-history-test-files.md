---
date: 2026-04-14
topic: legacy-slate-history-test-files
generated: true
---

# Legacy Plite History Test Files Ledger

- Exact 1:1 ledger for legacy `packages/plite-history/test/**` files.
- Total legacy files: `20`
- explicit-skip: `3`
- mapped-mirrored: `17`

```tsv
legacy_file	mapping_status	current_owner	note
packages/plite-history/test/apply-batch-exact-set-node.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/history-editor-flags.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/index.js	explicit-skip	none	fixture harness entrypoint is retired
packages/plite-history/test/isHistory/after-edit.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/isHistory/after-redo.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/isHistory/after-undo.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/isHistory/before-edit.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/jsx.d.ts	explicit-skip	none	fixture harness typing shim is retired
packages/plite-history/test/redo-selection.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/cursor/keep_after_focus_and_remove_text_undo.js	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/delete_backward/block-join-reverse.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/delete_backward/block-nested-reverse.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/delete_backward/block-text.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/delete_backward/custom-prop.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/delete_backward/inline-across.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/insert_break/basic.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/insert_fragment/basic.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts; packages/plite/test/clipboard-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/insert_text/basic.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/insert_text/contiguous.tsx	mapped-mirrored	packages/plite-history/test/history-contract.ts	direct legacy history parity is proved in history-contract
packages/plite-history/test/undo/insert_text/non-contiguous.tsx	explicit-skip	none	timing-based auto-merge heuristics are not the live contract
```
