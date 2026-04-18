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
- Frozen threshold: raw score `>= 5` from [2026-03-24-coverage-priority-files-testing-review-non-react-refresh.tsv](docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react-refresh.tsv).
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

1. `[done]` `8` [resolvePlugin.ts](packages/core/src/internal/plugin/resolvePlugin.ts)
2. `[done]` `7` [resolvePlugins.ts](packages/core/src/internal/plugin/resolvePlugins.ts)
3. `[done]` `6` [deserializeHtmlNode.ts](packages/core/src/lib/plugins/html/utils/deserializeHtmlNode.ts)
4. `[done]` `6` [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts)
5. `[done]` `6` [withNormalizeTable.ts](packages/table/src/lib/withNormalizeTable.ts)
6. `[done]` `6` [withNormalizeList.ts](packages/list-classic/src/lib/withNormalizeList.ts)
7. `[done]` `6` [splitIncompleteMdx.ts](packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.ts)
8. `[done]` `6` [deserializeInlineMd.ts](packages/markdown/src/lib/deserializer/utils/deserializeInlineMd.ts)
9. `[done]` `6` [pipeNormalizeInitialValue.ts](packages/core/src/internal/plugin/pipeNormalizeInitialValue.ts)
10. `[done]` `5` [withApplyTable.ts](packages/table/src/lib/withApplyTable.ts)
11. `[done]` `5` [withInsertFragmentList.ts](packages/list-classic/src/lib/withInsertFragmentList.ts)
12. `[done]` `5` [getSelectedCellsBorders.ts](packages/table/src/lib/queries/getSelectedCellsBorders.ts)
13. `[done]` `5` [withList.ts](packages/list-classic/src/lib/withList.ts)
14. `[done]` `5` [transformDiffTexts.ts](packages/diff/src/internal/transforms/transformDiffTexts.ts)
15. `[done]` `5` [upsertLink.ts](packages/link/src/lib/transforms/upsertLink.ts)
16. `[done]` `5` [convertNodesSerialize.ts](packages/markdown/src/lib/serializer/convertNodesSerialize.ts)
17. `[done]` `5` [customMdxDeserialize.ts](packages/markdown/src/lib/deserializer/utils/customMdxDeserialize.ts)
18. `[done]` `5` [setBorderSize.ts](packages/table/src/lib/transforms/setBorderSize.ts)
19. `[done]` `5` [pluginDeserializeHtml.ts](packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts)
20. `[done]` `5` [isEditOnlyDisabled.ts](packages/core/src/internal/plugin/isEditOnlyDisabled.ts)
21. `[done]` `5` [insertTodoListItem.ts](packages/list-classic/src/lib/transforms/insertTodoListItem.ts)
22. `[done]` `5` [moveSelectionFromCell.ts](packages/table/src/lib/transforms/moveSelectionFromCell.ts)
23. `[done]` `5` [transformDiffDescendants.ts](packages/diff/src/internal/transforms/transformDiffDescendants.ts)
24. `[done]` `5` [deleteSuggestion.ts](packages/suggestion/src/lib/transforms/deleteSuggestion.ts)
25. `[done]` `5` [deleteText.ts](packages/slate/src/internal/transforms/deleteText.ts)
26. `[done]` `5` [insertCodeBlock.ts](packages/code-block/src/lib/transforms/insertCodeBlock.ts)
27. `[done]` `5` [unwrapList.ts](packages/list-classic/src/lib/transforms/unwrapList.ts)
28. `[done]` `5` [markdownToSlateNodesSafely.ts](packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.ts)

## Tier 2: Still Worth Doing

1. `[done]` `6` [BaseCalloutPlugin.ts](packages/callout/src/lib/BaseCalloutPlugin.ts)
2. `[done]` `5` [importDocx.ts](packages/docx-io/src/lib/importDocx.ts)
3. `[done]` `5` [html-to-docx.ts](packages/docx-io/src/lib/html-to-docx.ts)
4. `[done]` `5` [BaseYjsPlugin.ts](packages/yjs/src/lib/BaseYjsPlugin.ts)
5. `[done]` `5` [BaseCodeBlockPlugin.ts](packages/code-block/src/lib/BaseCodeBlockPlugin.ts)
6. `[done]` `5` [BaseCommentPlugin.ts](packages/comment/src/lib/BaseCommentPlugin.ts)
7. `[done]` `5` [BaseTextAlignPlugin.ts](packages/basic-styles/src/lib/BaseTextAlignPlugin.ts)
8. `[done]` `5` [EmojiFloatingIndexSearch.ts](packages/emoji/src/lib/utils/IndexSearch/EmojiFloatingIndexSearch.ts)
9. `[done]` `5` [callOrReturn.ts](packages/core/src/internal/utils/callOrReturn.ts)
10. `[done]` `5` [deserializeCsv.ts](packages/csv/src/lib/deserializer/utils/deserializeCsv.ts)

## Deferred From The Current Phase

- `[deferred]` `8` [getSelectedDomFragment.tsx](packages/core/src/static/utils/getSelectedDomFragment.tsx)
  Reason: real seam, but DOM-heavy enough that it belongs after the pure plugin and parser contracts.
- `[deferred]` `5` [SlatePlugin.ts](packages/core/src/lib/plugin/SlatePlugin.ts)
  Reason: giant architecture slab. Better handled in the architecture-safety phase than by blunt coverage chasing.
- `[deferred]` `5` [BasePlugin.ts](packages/core/src/lib/plugin/BasePlugin.ts)
  Reason: same story. Huge base-class surface, bad ROI for the current phase.
- `[deferred]` `5` [plate-types.ts](packages/utils/src/lib/plate-types.ts)
  Reason: type-heavy utility bag. Raw score is inflated by missing lcov, not by likely regression value.
- `[deferred]` `5` [SlateEditor.ts](packages/core/src/lib/editor/SlateEditor.ts)
  Reason: core editor slab. Save it for the architecture pass.
- `[deferred]` `5` [font-table.ts](packages/docx-io/src/lib/internal/schemas/font-table.ts)
  Reason: schema boilerplate, not a sharp behavioral seam.
- `[deferred]` `5` [node-entry.ts](packages/slate/src/interfaces/node-entry.ts)
  Reason: interface contract file, weak ROI for runtime unit tests.
- `[deferred]` `5` [legacy-editor.ts](packages/slate/src/interfaces/editor/legacy-editor.ts)
  Reason: interface-oriented, not where regressions will hide first.
- `[deferred]` `5` [editor-type.ts](packages/slate/src/interfaces/editor/editor-type.ts)
  Reason: same.
- `[deferred]` `5` [mdast.ts](packages/markdown/src/lib/mdast.ts)
  Reason: type or bridge surface, not worth dedicated coverage theater.
- `[deferred]` `5` [content-types.ts](packages/docx-io/src/lib/internal/schemas/content-types.ts)
  Reason: schema boilerplate.
- `[deferred]` `5` [settings.ts](packages/docx-io/src/lib/internal/schemas/settings.ts)
  Reason: schema boilerplate.
- `[deferred]` `5` [BaseExcalidrawPlugin.ts](packages/excalidraw/src/lib/BaseExcalidrawPlugin.ts)
  Reason: thin plugin wrapper. Real enough, but weaker than the Tier 2 seams.
- `[deferred]` `5` [ViewPlugin.ts](packages/core/src/static/plugins/ViewPlugin.ts)
  Reason: thin static plugin wrapper.

## Update Rule

- When a file gets direct tests, flip it to `[done]`. Do not remove it.
- When a file is deleted or replaced, flip it to `[removed]` with a one-line note.
- When a file proves to be fake ROI, flip it to `[deferred]` with a reason.
- Do not reshuffle the queue because a fresh pass produced a slightly different vibe.
