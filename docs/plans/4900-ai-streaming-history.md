# Issue 4900: AI streaming history bloat

## Source of truth

- Source type: GitHub issue
- Source id: #4900
- Title: Streaming with withAIBatch accumulates operations and may slow undo
- URL: https://github.com/udecode/plate/issues/4900
- Task type: bug / performance

## Expected outcome

- Long AI streaming sessions should not build a giant undo batch that makes `tf.ai.undo()` or accept flows slower as chunk count grows.
- Keep current AI insert/chat behavior intact from a user point of view.

## Constraints and repo rules

- Non-trivial task: use repo-local planning file, not root planning files.
- Check institutional learnings before implementation.
- Use a sane test seam before the fix if possible.
- If `.ts` changes, verify with install -> build -> typecheck sequence for touched package(s), then `pnpm lint:fix`.

## Findings

- No relevant prior solution found in `docs/solutions/`.
- `withAIBatch` only merges batches and tags the last undo batch. It does not compact operations.
- Streaming insert mode is wrapped with `withAIBatch(..., { split: isFirst })` in the AI kit integration.
- `undoAI` currently relies on the last undo batch being tagged as AI and calls native `editor.undo()`.
- Accept/hide logic already distinguishes AI preview state from accepted content using AI marks and anchor cleanup.

## Working hypothesis

- The real bug is treating streamed preview updates as normal history.
- Better fix: keep preview streaming out of history, then finalize or discard preview explicitly.
- If preview is unsaved, accept likely needs to remove preview without saving, then insert the final accepted content as one normal batch.

## Next steps

1. Confirm accept/reject/reset paths needed for unsaved preview.
2. Add a failing test that proves streaming no longer bloats undo history.
3. Implement the smallest package-level fix.
4. Verify targeted tests, then package build -> typecheck -> lint.
