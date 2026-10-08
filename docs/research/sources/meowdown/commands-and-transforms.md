# Meowdown: commands and transforms

## Soft break

- **Soft break.** `prosekit/meowdown@5b9962982a1cb3d1732355c753ce76d9a5966af3:packages/core/src/extensions/soft-break.test.ts` (lines 21-335) pins Meowdown's soft break. One press inserts a newline that replaces a non-empty selection, indents a list item's continuation line and carries the blockquote marker. A second press splits the block, and a split list item keeps its kind, marker and depth; undo reverts both presses in one step. In a code block it writes a newline like Enter, and in a table cell or heading, where Markdown cannot hold a break, it does nothing. Plite owns soft-break insertion (`packages/plitejs/src/editor/insert-soft-break.ts`), with browser cases in `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts`; Plate's list and table guards stay with those features. Evidence: `docs/editor-test-harvester/meowdown/report.md:154`.
