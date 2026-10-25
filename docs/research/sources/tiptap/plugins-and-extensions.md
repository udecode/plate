# Tiptap: plugins and extensions

## Shortcut handler priority

- **Shortcut handler priority.** Tiptap runs keyboard shortcut handlers by extension priority, higher first, and a handler that returns false lets the next one run. Among extensions of equal priority the later-registered one runs first, because `ExtensionManager` reverses the extension list before its stable priority sort when it builds plugins (`ueberdosis/tiptap@91c51be53c:packages/core/src/ExtensionManager.ts:92-97`). `ueberdosis/tiptap@91c51be53c:tests/cypress/integration/core/pluginOrder.spec.ts:9-67` pins both: a priority-1000 handler runs first, then the third extension's handler before the second's. Paste HTML transforms skip that reversal, so their ties keep registration order. Evidence: `docs/editor-test-harvester/tiptap/report.md:95`. Read at that commit on 2026-10-08; the 2026-05-10 harvest pinned no commit, but its cited lines match this one.

## Transaction hooks

- **Transaction hooks.** `ueberdosis/tiptap@91c51be53c:packages/core/__tests__/dispatchTransaction.spec.ts:8-119` (5 tests) pins Tiptap's extension `dispatchTransaction` hooks: they run in priority order, a hook that never calls `next` blocks the transaction, a user-provided `dispatchTransaction` serves as the base, and `enableExtensionDispatchTransaction: false` bypasses extension hooks. The chain is built from the same reversed priority sort as plugins (`ueberdosis/tiptap@91c51be53c:packages/core/src/ExtensionManager.ts:251-255`), so by that code equal-priority hooks run later-registered first; no test pins that tie. `editorProps.spec.ts` in the same folder (2 tests) pins that `editorProps` can be set at construction or later through `setOptions`. The harvest routes both to Plite host tests and Plate editor host examples (`docs/editor-test-harvester/tiptap/portable-mixed-routing.md:54-55`). Read at that commit on 2026-10-08.

## Editor facade and feature collection

- Tiptap's editor facade combines extension input with commands, chain/can, storage and a mounted view. ExtensionManager gathers commands, keymaps, input rules, paste rules, ProseMirror plugins and node views from extensions. Evidence: docs/plans/2026-05-16-plite-unified-extension-composition-ralplan.md:697, citing ueberdosis/tiptap:packages/core/src/Editor.ts:85,222 and ueberdosis/tiptap:packages/core/src/ExtensionManager.ts:62,89 in the local Tiptap checkout. Limit: the May 2026 read pins no commit; this is an ownership comparison, not evidence of runtime performance.
