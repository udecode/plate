# AI Preview `tf.ai` Refactor

## Goal

Replace the low-level AI preview snapshot helper surface with `tf.ai.*` lifecycle transforms, keep the full-document snapshot strategy private, migrate insert-mode preview callers, and preserve the current no-history preview behavior.

## Checklist

- [completed] Gather current AI preview/history patterns and relevant learnings
- [completed] Add or update tests for the new preview lifecycle contract
- [completed] Implement `tf.ai.*` preview transforms in `BaseAIPlugin`
- [completed] Migrate AI chat preview callsites off direct snapshot helpers
- [completed] Run required verification for `packages/ai` and `apps/www`

## Findings

- The current preview storage lives in `packages/ai/src/lib/transforms/aiStreamSnapshot.ts` as a `WeakMap` keyed by editor.
- The current low-level helper surface is used directly by `acceptAIChat`, `undoAI`, `resetAIChat`, the editor AI kit, and the streaming integration test.
- The existing solution doc already established the correct behavior boundary: preview chunks stay out of history; accept commits one fresh batch; AI undo restores the pre-stream value while preview is active.
- `AIPlugin` already owns editor mutation semantics like `insertNodes`, `removeMarks`, `removeNodes`, and `undo`, so preview lifecycle belongs there too.
- The cleanest public surface here is `tf.ai.*`, while library internals and stricter callsites can still reach the same transforms through `editor.getTransforms(BaseAIPlugin).ai` where generic editor typing is narrower.
- Package-scoped verification passed for `@platejs/ai`; filtered `apps/www` typecheck still has unrelated workspace export/type failures after the required root `pnpm build`, so that debt remains outside this refactor.
