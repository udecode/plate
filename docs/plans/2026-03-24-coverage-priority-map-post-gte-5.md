---
title: Coverage Priority Map Post GTE 5
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Map Post GTE 5

## Inputs

- Coverage source: [lcov.info](.coverage-repo-2026-03-24g/lcov.info)
- Constraints:
  - exclude `/react`
  - no browser or e2e
  - no coverage vanity
  - score only files still worth real unit or editor-contract tests
  - sync against the March 17 pass plus the March 22-24 completed sweeps

## Coverage Run

- Command: `bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo-2026-03-24g --reporter=dots`
- Result: Fresh coverage: `2869` pass, `0` fail, `575` files, `3.59s`.

## Scoring Rules

- Scope is `packages/**/src/**`.
- Exclude `/react`, test files, barrels, declaration files, obvious type-only files, and React-hook/component files living outside `/react`.
- Reward deterministic transforms, queries, merge helpers, parser/serializer helpers, plugin contracts, and small utilities with real uncovered behavior.
- Penalize DOM-heavy leftovers, giant sludge files, thin wrapper plugins, and already-swept packages so crumbs do not crowd out better seams.
- `package_score` is the sum of the top 5 remaining file scores in that package, not every leftover crumb.

## Strong Take

Do not do another blind package sweep.

The honest next work is a small core-heavy batch, then a second ring of list/table/suggestion follow-ups.

If you want the strict next batch, use the raw `score >= 6` set:

1. `core`: [pluginDeserializeHtml.ts](packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts) — score `7`
2. `diff`: [transformDiffTexts.ts](packages/diff/src/internal/transforms/transformDiffTexts.ts) — score `7`
3. `core`: [getSelectedDomFragment.tsx](packages/core/src/static/utils/getSelectedDomFragment.tsx) — score `6`
4. `markdown`: [deserializeMd.ts](packages/markdown/src/lib/deserializer/deserializeMd.ts) — score `6`
5. `core`: [resolvePlugin.ts](packages/core/src/internal/plugin/resolvePlugin.ts) — score `6`

My actual recommendation is slightly stricter than the raw score:

- start with the non-DOM part of `core`
- then `markdown`
- then `diff`
- only then touch the DOM-ish core leftover if you still care

## Threshold Counts

- `score >= 7`: `2` files
- `score >= 6`: `5` files
- `score >= 5`: `15` files
- `score >= 4`: `39` files
- `score >= 3`: `62` files
- `score >= 2`: `195` files
- `score >= 1`: `211` files

## Packages By Value

1. `core` — package score `29`, top files `pluginDeserializeHtml.ts:7; getSelectedDomFragment.tsx:6; resolvePlugin.ts:6; resolvePlugins.ts:5; htmlElementToLeaf.ts:5`
2. `table` — package score `21`, top files `withApplyTable.ts:5; getSelectedCellsBorders.ts:4; deleteColumn.ts:4; insertTableColumn.ts:4; insertTableRow.ts:4`
3. `slate` — package score `20`, top files `hasDOMNode.ts:4; hasEditableTarget.ts:4; hasSelectableTarget.ts:4; hasTarget.ts:4; hasRange.ts:4`
4. `list-classic` — package score `18`, top files `BaseTodoListPlugin.ts:5; withList.ts:5; withInsertFragmentList.ts:4; withDeleteForwardList.ts:2; withNormalizeList.ts:2`
5. `suggestion` — package score `18`, top files `deleteSuggestion.ts:5; BaseSuggestionPlugin.ts:4; withSuggestion.ts:4; rejectSuggestion.ts:3; acceptSuggestion.ts:2`
6. `markdown` — package score `15`, top files `deserializeMd.ts:6; fontRules.ts:3; columnRules.ts:2; convertNodesSerialize.ts:2; customMdxDeserialize.ts:2`
7. `diff` — package score `12`, top files `transformDiffTexts.ts:7; get-properties.ts:2; unused-char-generator.ts:2; transformDiffDescendants.ts:1`
8. `docx` — package score `11`, top files `docxListToList.ts:3; cleanDocxListElementsToList.ts:2; getVShapeSpid.ts:2; DocxPlugin.ts:2; getDocxIndent.ts:2`
9. `dnd` — package score `9`, top files `onDropNode.ts:5; getHoverDirection.ts:2; getNewDirection.ts:2`
10. `code-block` — package score `10`, top files `BaseCodeBlockPlugin.ts:4; insertCodeBlock.ts:2; htmlDeserializerCodeBlock.ts:2; formatter.ts:1; withCodeBlock.ts:1`

## Best Files By Value

1. `core` — [pluginDeserializeHtml.ts](packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts) — score `7`, coverage `88.8%`, uncovered `18`
2. `diff` — [transformDiffTexts.ts](packages/diff/src/internal/transforms/transformDiffTexts.ts) — score `7`, coverage `96.2%`, uncovered `8`
3. `core` — [getSelectedDomFragment.tsx](packages/core/src/static/utils/getSelectedDomFragment.tsx) — score `6`, coverage `13.9%`, uncovered `31`
4. `markdown` — [deserializeMd.ts](packages/markdown/src/lib/deserializer/deserializeMd.ts) — score `6`, coverage `79.2%`, uncovered `15`
5. `core` — [resolvePlugin.ts](packages/core/src/internal/plugin/resolvePlugin.ts) — score `6`, coverage `88.1%`, uncovered `8`
6. `autoformat` — [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts) — score `5`, coverage `37.0%`, uncovered `46`
7. `list-classic` — [BaseTodoListPlugin.ts](packages/list-classic/src/lib/BaseTodoListPlugin.ts) — score `5`, coverage `37.1%`, uncovered `22`
8. `table` — [withApplyTable.ts](packages/table/src/lib/withApplyTable.ts) — score `5`, coverage `83.8%`, uncovered `16`
9. `code-drawing` — [renderers.ts](packages/code-drawing/src/lib/utils/renderers.ts) — score `5`, coverage `85.4%`, uncovered `15`
10. `core` — [resolvePlugins.ts](packages/core/src/internal/plugin/resolvePlugins.ts) — score `5`, coverage `95.8%`, uncovered `15`
11. `dnd` — [onDropNode.ts](packages/dnd/src/transforms/onDropNode.ts) — score `5`, coverage `87.5%`, uncovered `14`
12. `core` — [htmlElementToLeaf.ts](packages/core/src/lib/plugins/html/utils/htmlElementToLeaf.ts) — score `5`, coverage `69.4%`, uncovered `11`
13. `list-classic` — [withList.ts](packages/list-classic/src/lib/withList.ts) — score `5`, coverage `84.7%`, uncovered `11`
14. `suggestion` — [deleteSuggestion.ts](packages/suggestion/src/lib/transforms/deleteSuggestion.ts) — score `5`, coverage `93.6%`, uncovered `10`
15. `core` — [cleanHtmlFontElements.ts](packages/core/src/lib/plugins/html/utils/cleanHtmlFontElements.ts) — score `5`, coverage `66.7%`, uncovered `4`

## Caveats

- Raw package totals still inflate `core` because it has a pile of medium leftovers. Trust the file ranking more than the package ranking.
- A few non-React but still DOM-ish files remain in `core` and `slate`. They are valid candidates, but lower priority than the parser/plugin/value seams above.
- Thin wrappers and giant serializer sludge were intentionally capped or filtered so they do not cosplay as the next frontier.

## Full Data

- [2026-03-24-coverage-priority-packages-post-gte-5.tsv](docs/plans/2026-03-24-coverage-priority-packages-post-gte-5.tsv)
- [2026-03-24-coverage-priority-files-post-gte-5.tsv](docs/plans/2026-03-24-coverage-priority-files-post-gte-5.tsv)
