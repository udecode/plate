---
title: Non React Coverage Roadmap
type: testing
date: 2026-03-24
status: completed
---

# Non React Coverage Roadmap

## Goal

Freeze the remaining high-ROI non-React coverage work into one stable roadmap so future passes update status instead of inventing a new "next batch" every time.

## Lock Rules

- Phase: non-React coverage only.
- Frozen threshold: raw score `>= 5` from [2026-03-24-coverage-priority-files-testing-review-non-react-refresh.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react-refresh.tsv).
- Future passes should mark items `done`, `removed`, or `deferred`. Do not reshuffle the whole roadmap unless:
  - a file is deleted
  - a file drops below the threshold because the behavior is already directly covered
  - architecture changes make a deferred file worth pulling forward
- Package totals are execution helpers only. The queue is file-first.

## Execution Policy

- Finish **Tier 1** in order.
- Then do **Tier 2** in order if we still want more non-React coverage before the React phase.
- Leave **Deferred** alone until the non-React roadmap is otherwise exhausted or the architecture phase says they matter.

## Tier 1: Execute Now

1. `[done]` `8` [resolvePlugin.ts](/Users/zbeyens/git/plate/packages/core/src/internal/plugin/resolvePlugin.ts)
2. `[done]` `7` [resolvePlugins.ts](/Users/zbeyens/git/plate/packages/core/src/internal/plugin/resolvePlugins.ts)
3. `[done]` `6` [deserializeHtmlNode.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/deserializeHtmlNode.ts)
4. `[done]` `6` [AutoformatPlugin.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/AutoformatPlugin.ts)
5. `[done]` `6` [withNormalizeTable.ts](/Users/zbeyens/git/plate/packages/table/src/lib/withNormalizeTable.ts)
6. `[done]` `6` [withNormalizeList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/withNormalizeList.ts)
7. `[done]` `6` [splitIncompleteMdx.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.ts)
8. `[done]` `6` [deserializeInlineMd.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/deserializer/utils/deserializeInlineMd.ts)
9. `[done]` `6` [pipeNormalizeInitialValue.ts](/Users/zbeyens/git/plate/packages/core/src/internal/plugin/pipeNormalizeInitialValue.ts)
10. `[done]` `5` [withApplyTable.ts](/Users/zbeyens/git/plate/packages/table/src/lib/withApplyTable.ts)
11. `[done]` `5` [withInsertFragmentList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/withInsertFragmentList.ts)
12. `[done]` `5` [getSelectedCellsBorders.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getSelectedCellsBorders.ts)
13. `[done]` `5` [withList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/withList.ts)
14. `[done]` `5` [transformDiffTexts.ts](/Users/zbeyens/git/plate/packages/diff/src/internal/transforms/transformDiffTexts.ts)
15. `[done]` `5` [upsertLink.ts](/Users/zbeyens/git/plate/packages/link/src/lib/transforms/upsertLink.ts)
16. `[done]` `5` [convertNodesSerialize.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/serializer/convertNodesSerialize.ts)
17. `[done]` `5` [customMdxDeserialize.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/deserializer/utils/customMdxDeserialize.ts)
18. `[done]` `5` [setBorderSize.ts](/Users/zbeyens/git/plate/packages/table/src/lib/transforms/setBorderSize.ts)
19. `[done]` `5` [pluginDeserializeHtml.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts)
20. `[done]` `5` [isEditOnlyDisabled.ts](/Users/zbeyens/git/plate/packages/core/src/internal/plugin/isEditOnlyDisabled.ts)
21. `[done]` `5` [insertTodoListItem.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/transforms/insertTodoListItem.ts)
22. `[done]` `5` [moveSelectionFromCell.ts](/Users/zbeyens/git/plate/packages/table/src/lib/transforms/moveSelectionFromCell.ts)
23. `[done]` `5` [transformDiffDescendants.ts](/Users/zbeyens/git/plate/packages/diff/src/internal/transforms/transformDiffDescendants.ts)
24. `[done]` `5` [deleteSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/deleteSuggestion.ts)
25. `[done]` `5` [deleteText.ts](/Users/zbeyens/git/plate/packages/slate/src/internal/transforms/deleteText.ts)
26. `[done]` `5` [insertCodeBlock.ts](/Users/zbeyens/git/plate/packages/code-block/src/lib/transforms/insertCodeBlock.ts)
27. `[done]` `5` [unwrapList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/transforms/unwrapList.ts)
28. `[done]` `5` [markdownToSlateNodesSafely.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.ts)

## Tier 2: Still Worth Doing

1. `[done]` `6` [BaseCalloutPlugin.ts](/Users/zbeyens/git/plate/packages/callout/src/lib/BaseCalloutPlugin.ts)
2. `[done]` `5` [importDocx.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/importDocx.ts)
3. `[done]` `5` [html-to-docx.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/html-to-docx.ts)
4. `[done]` `5` [BaseYjsPlugin.ts](/Users/zbeyens/git/plate/packages/yjs/src/lib/BaseYjsPlugin.ts)
5. `[done]` `5` [BaseCodeBlockPlugin.ts](/Users/zbeyens/git/plate/packages/code-block/src/lib/BaseCodeBlockPlugin.ts)
6. `[done]` `5` [BaseCommentPlugin.ts](/Users/zbeyens/git/plate/packages/comment/src/lib/BaseCommentPlugin.ts)
7. `[done]` `5` [BaseTextAlignPlugin.ts](/Users/zbeyens/git/plate/packages/basic-styles/src/lib/BaseTextAlignPlugin.ts)
8. `[done]` `5` [EmojiFloatingIndexSearch.ts](/Users/zbeyens/git/plate/packages/emoji/src/lib/utils/IndexSearch/EmojiFloatingIndexSearch.ts)
9. `[done]` `5` [callOrReturn.ts](/Users/zbeyens/git/plate/packages/core/src/internal/utils/callOrReturn.ts)
10. `[done]` `5` [deserializeCsv.ts](/Users/zbeyens/git/plate/packages/csv/src/lib/deserializer/utils/deserializeCsv.ts)

## Deferred From The Current Phase

- `[deferred]` `8` [getSelectedDomFragment.tsx](/Users/zbeyens/git/plate/packages/core/src/static/utils/getSelectedDomFragment.tsx)
  Reason: real seam, but DOM-heavy enough that it belongs after the pure plugin and parser contracts.
- `[deferred]` `5` [SlatePlugin.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugin/SlatePlugin.ts)
  Reason: giant architecture slab. Better handled in the architecture-safety phase than by blunt coverage chasing.
- `[deferred]` `5` [BasePlugin.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugin/BasePlugin.ts)
  Reason: same story. Huge base-class surface, bad ROI for the current phase.
- `[deferred]` `5` [plate-types.ts](/Users/zbeyens/git/plate/packages/utils/src/lib/plate-types.ts)
  Reason: type-heavy utility bag. Raw score is inflated by missing lcov, not by likely regression value.
- `[deferred]` `5` [SlateEditor.ts](/Users/zbeyens/git/plate/packages/core/src/lib/editor/SlateEditor.ts)
  Reason: core editor slab. Save it for the architecture pass.
- `[deferred]` `5` [font-table.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/internal/schemas/font-table.ts)
  Reason: schema boilerplate, not a sharp behavioral seam.
- `[deferred]` `5` [node-entry.ts](/Users/zbeyens/git/plate/packages/slate/src/interfaces/node-entry.ts)
  Reason: interface contract file, weak ROI for runtime unit tests.
- `[deferred]` `5` [legacy-editor.ts](/Users/zbeyens/git/plate/packages/slate/src/interfaces/editor/legacy-editor.ts)
  Reason: interface-oriented, not where regressions will hide first.
- `[deferred]` `5` [editor-type.ts](/Users/zbeyens/git/plate/packages/slate/src/interfaces/editor/editor-type.ts)
  Reason: same.
- `[deferred]` `5` [mdast.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/mdast.ts)
  Reason: type or bridge surface, not worth dedicated coverage theater.
- `[deferred]` `5` [content-types.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/internal/schemas/content-types.ts)
  Reason: schema boilerplate.
- `[deferred]` `5` [settings.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/internal/schemas/settings.ts)
  Reason: schema boilerplate.
- `[deferred]` `5` [BaseExcalidrawPlugin.ts](/Users/zbeyens/git/plate/packages/excalidraw/src/lib/BaseExcalidrawPlugin.ts)
  Reason: thin plugin wrapper. Real enough, but weaker than the Tier 2 seams.
- `[deferred]` `5` [ViewPlugin.ts](/Users/zbeyens/git/plate/packages/core/src/static/plugins/ViewPlugin.ts)
  Reason: thin static plugin wrapper.

## Update Rule

- When a file gets direct tests, flip it to `[done]`. Do not remove it.
- When a file is deleted or replaced, flip it to `[removed]` with a one-line note.
- When a file proves to be fake ROI, flip it to `[deferred]` with a reason.
- Do not reshuffle the queue because a fresh pass produced a slightly different vibe.
