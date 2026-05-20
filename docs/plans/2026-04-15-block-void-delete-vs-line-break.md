# Block Void Delete vs Line Break

## Goal

Fix suggestion-mode paragraph-start deletion so previous solitary block voids are marked as remove suggestions instead of remove line-break suggestions.

## Findings

- Current cross-block branch in `packages/suggestion/src/lib/transforms/deleteSuggestion.ts` always marks the previous block with `isLineBreak: true`.
- That is correct for paragraph-to-paragraph merges.
- That is wrong when the previous block is itself a block void such as image or toc.
- A focused regression in `packages/suggestion/src/lib/withSuggestion.spec.tsx` reproduced the bug with a `toc` block void followed by a paragraph.
- The minimal durable fix is to branch on `editor.api.isVoid(previousAboveNode[0]) && !editor.api.isInline(previousAboveNode[0])` inside the existing cross-block delete path.

## Plan

1. Add a failing regression in `packages/suggestion/src/lib/withSuggestion.spec.tsx`.
2. Split cross-block delete behavior by previous block shape.
3. Verify `packages/suggestion` build, typecheck, lint, and targeted tests.

## Result

- Added the block-void regression and fixed `deleteSuggestion` so solitary block voids receive normal block remove suggestions.
- Refreshed `docs/solutions/logic-errors/2026-04-08-suggestion-delete-backward-must-mark-inline-voids.md` so it no longer claims every cross-block delete should become a line-break suggestion.
