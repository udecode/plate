---
title: Non React Coverage Roadmap Phase 3
type: testing
date: 2026-03-24
status: completed
---

# Non React Coverage Roadmap Phase 3

## Goal

Freeze the last worthwhile non-React queue after the bun-check fixes so future passes stop inventing new batches and just burn down what is left.

## Lock Rules

- Phase: temporary non-React cut only.
- Frozen threshold: start from [2026-03-24-coverage-priority-files-testing-review-non-react-post-bun-check.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react-post-bun-check.tsv), execute every remaining `score >= 6` file, then the worthwhile `score = 5` ring.
- Keep the queue file-first.
- Do not collapse this back into package sweeps.
- Future passes should mark items `done`, `removed`, or `deferred`. Do not reshuffle the whole thing unless the candidate set materially changes.

## Execution Policy

- Finish **Tier 1** first. That is every remaining `score >= 6` file.
- Then finish **Tier 2**. That is the worthwhile `score = 5` ring below.
- After Tier 2, stop non-React coverage and move on.

## Tier 1: Execute Now

1. `[done]` `6` [upsertLink.ts](/Users/zbeyens/git/plate/packages/link/src/lib/transforms/upsertLink.ts)
2. `[done]` `6` [convertNodesSerialize.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/serializer/convertNodesSerialize.ts)

## Tier 2: Still Worth Doing

1. `[done]` `5` [DOMPlugin.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/dom/DOMPlugin.ts)
2. `[done]` `5` [AutoformatPlugin.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/AutoformatPlugin.ts)
3. `[done]` `5` [BaseHeadingPlugin.ts](/Users/zbeyens/git/plate/packages/basic-nodes/src/lib/BaseHeadingPlugin.ts)
4. `[done]` `5` [inferWhiteSpaceRule.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/collapse-white-space/inferWhiteSpaceRule.ts)
5. `[done]` `5` [pipeRenderElementStatic.tsx](/Users/zbeyens/git/plate/packages/core/src/static/pipeRenderElementStatic.tsx)
6. `[done]` `5` [cleanHtmlFontElements.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/cleanHtmlFontElements.ts)
7. `[done]` `5` [pluginDeserializeHtml.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts)
8. `[done]` `5` [getTableCellBorders.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getTableCellBorders.ts)
9. `[done]` `5` [cleanHtmlTextNodes.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/cleanHtmlTextNodes.ts)
10. `[done]` `5` [splitIncompleteMdx.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.ts)
11. `[done]` `5` [isLastNonEmptyTextOfInlineFormattingContext.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/collapse-white-space/isLastNonEmptyTextOfInlineFormattingContext.ts)
12. `[done]` `5` [traverseHtmlNode.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/traverseHtmlNode.ts)
13. `[done]` `5` [moveListItemSublistItemsToListItemSublist.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/transforms/moveListItemSublistItemsToListItemSublist.ts)
14. `[done]` `5` [mdastToSlate.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/deserializer/mdastToSlate.ts)
15. `[done]` `5` [markdownToSlateNodesSafely.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.ts)
16. `[done]` `5` [addMarkSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/addMarkSuggestion.ts)
17. `[done]` `5` [removeMarkSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/removeMarkSuggestion.ts)
18. `[done]` `5` [deleteRowWhenExpanded.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/deleteRowWhenExpanded.ts)

## Deferred By Design

- `[deferred]` `5` [isEditOnlyDisabled.ts](/Users/zbeyens/git/plate/packages/core/src/internal/plugin/isEditOnlyDisabled.ts)
  Reason: one-line plugin-resolution crumb. Not worth a dedicated trip.
- `[deferred]` `4` [html-to-docx.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/internal/html-to-docx.ts)
  Reason: giant serializer sludge. Bad ROI for the last non-React pass.
- `[deferred]` score-4 wrapper clusters in `basic-nodes`, `diff`, `table`, and `list`
  Reason: already partly covered, but the remaining gaps are mostly wrapper dust or narrow transform crumbs.
- `[deferred]` remaining DOM-heavy `core` and `slate` leftovers below the threshold
  Reason: real code, but not the best last spend before the React or architecture-safety phase.

## Update Rule

- When a file gets direct tests, flip it to `[done]`.
- When a file proves fake ROI, flip it to `[deferred]` with a reason.
- When a file disappears, flip it to `[removed]`.
- Do not reshuffle the queue because a fresh pass had a new vibe.
