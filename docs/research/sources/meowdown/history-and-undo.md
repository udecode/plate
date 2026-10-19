# Meowdown: history and undo

## Pending replacements

- **Pending replacements.** `prosekit/meowdown@5b9962982a1cb3d1732355c753ce76d9a5966af3:packages/core/src/extensions/pending-replacement.test.ts` (lines 18-220) pins a staged replacement that accumulates text without touching the document, remaps its range through other edits, is discarded when its source range is deleted, refuses an empty or out-of-range stage, and is accepted or discarded, Escape included, as one action. Plate's AI chat pins the same shape: `packages/platejs/src/ai/react/AIChatPlugin.suggestions.spec.ts:863` maps a text replacement past an intervening block insertion, the same file's case at line 536 replaces accepted content as one reversible action, and `packages/platejs/src/ai/react/AIChatPlugin.streaming.spec.ts:154` refuses a final draft whose target was deleted. Evidence: `docs/editor-test-harvester/meowdown/report.md:151`; test titles read on 2026-10-08, not rerun.
