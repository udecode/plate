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
- Frozen threshold: start from [2026-03-24-coverage-priority-files-testing-review-non-react-post-bun-check.tsv](docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react-post-bun-check.tsv), execute every remaining `score >= 6` file, then the worthwhile `score = 5` ring.
- Keep the queue file-first.
- Do not collapse this back into package sweeps.
- Future passes should mark items `done`, `removed`, or `deferred`. Do not reshuffle the whole thing unless the candidate set materially changes.

## Execution Policy

- Finish **Tier 1** first. That is every remaining `score >= 6` file.
- Then finish **Tier 2**. That is the worthwhile `score = 5` ring below.
- After Tier 2, stop non-React coverage and move on.

## Tier 1: Execute Now

1. `[done]` `6` [upsertLink.ts](packages/link/src/lib/transforms/upsertLink.ts)
2. `[done]` `6` [convertNodesSerialize.ts](packages/markdown/src/lib/serializer/convertNodesSerialize.ts)

## Tier 2: Still Worth Doing

1. `[done]` `5` [DOMPlugin.ts](packages/core/src/lib/plugins/dom/DOMPlugin.ts)
2. `[done]` `5` [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts)
3. `[done]` `5` [BaseHeadingPlugin.ts](packages/basic-nodes/src/lib/BaseHeadingPlugin.ts)
4. `[done]` `5` [inferWhiteSpaceRule.ts](packages/core/src/lib/plugins/html/utils/collapse-white-space/inferWhiteSpaceRule.ts)
5. `[done]` `5` [pipeRenderElementStatic.tsx](packages/core/src/static/pipeRenderElementStatic.tsx)
6. `[done]` `5` [cleanHtmlFontElements.ts](packages/core/src/lib/plugins/html/utils/cleanHtmlFontElements.ts)
7. `[done]` `5` [pluginDeserializeHtml.ts](packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts)
8. `[done]` `5` [getTableCellBorders.ts](packages/table/src/lib/queries/getTableCellBorders.ts)
9. `[done]` `5` [cleanHtmlTextNodes.ts](packages/core/src/lib/plugins/html/utils/cleanHtmlTextNodes.ts)
10. `[done]` `5` [splitIncompleteMdx.ts](packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.ts)
11. `[done]` `5` [isLastNonEmptyTextOfInlineFormattingContext.ts](packages/core/src/lib/plugins/html/utils/collapse-white-space/isLastNonEmptyTextOfInlineFormattingContext.ts)
12. `[done]` `5` [traverseHtmlNode.ts](packages/core/src/lib/plugins/html/utils/traverseHtmlNode.ts)
13. `[done]` `5` [moveListItemSublistItemsToListItemSublist.ts](packages/list-classic/src/lib/transforms/moveListItemSublistItemsToListItemSublist.ts)
14. `[done]` `5` [mdastToSlate.ts](packages/markdown/src/lib/deserializer/mdastToSlate.ts)
15. `[done]` `5` [markdownToSlateNodesSafely.ts](packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.ts)
16. `[done]` `5` [addMarkSuggestion.ts](packages/suggestion/src/lib/transforms/addMarkSuggestion.ts)
17. `[done]` `5` [removeMarkSuggestion.ts](packages/suggestion/src/lib/transforms/removeMarkSuggestion.ts)
18. `[done]` `5` [deleteRowWhenExpanded.ts](packages/table/src/lib/merge/deleteRowWhenExpanded.ts)

## Deferred By Design

- `[deferred]` `5` [isEditOnlyDisabled.ts](packages/core/src/internal/plugin/isEditOnlyDisabled.ts)
  Reason: one-line plugin-resolution crumb. Not worth a dedicated trip.
- `[deferred]` `4` [html-to-docx.ts](packages/docx-io/src/lib/internal/html-to-docx.ts)
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
