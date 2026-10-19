# AI Deterministic Coverage Pass

## Goal

Add a narrow, high-value non-React coverage pass for `@platejs/ai` focused on the deterministic lib seam:

- `withAIBatch.ts`
- `getEditorPrompt.ts`
- `insertAINodes.ts`
- `replacePlaceholders.ts`
- `undoAI.ts`
- `removeAINodes.ts`
- `removeAIMarks.ts`

## Constraints

- Fast-lane only.
- No `/react`.
- No model mocks, network tests, or streaming coverage.
- Prefer tiny transform and helper contracts over wrapper coverage.

## Slice

1. Add pure stub-based specs for `withAIBatch` and `undoAI`.
2. Add helper specs for prompt resolution and placeholder replacement.
3. Add real-editor specs for insert/remove AI node transforms.
4. Allow one small runtime fix if direct tests expose an actual bug.

## Notes

- Existing non-React `ai` coverage is almost empty outside `getMarkdown.spec.tsx`.
- `replacePlaceholders.ts` currently uses `String.prototype.replace`, so repeated-placeholder coverage is likely to expose a real one-occurrence bug.
- Execution confirmed that repeated placeholders were in fact broken; the helper only replaced the first occurrence of `{prompt}` and the same bug pattern applied to other placeholder tokens.
