---
title: Coverage Priority Map Post Threshold 5b
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Map Post Threshold 5b

## Inputs

- Coverage source: [lcov.info](.coverage-repo-2026-03-24f/lcov.info)
- Constraints:
  - exclude `/react`
  - no browser or e2e
  - no vanity coverage
  - score only files still worth real unit or editor-contract tests
  - penalize already-swept packages so crumbs do not crowd out better seams

## Coverage Run

- Command: `bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo-2026-03-24f --reporter=dots`
- Result: Fresh coverage: `2826` pass, `0` fail, `565` files, `2.44s`.

## Scoring Rules

- Scope is `packages/**/src/**`.
- Exclude `/react`, hooks, components, DOM-ish seams, tests, barrels, declarations, type-only files, and obvious no-value dust.
- Reward deterministic transforms, queries, merge helpers, parser or serializer helpers, small utilities, and plugin contracts with real uncovered behavior.
- Penalize thin wrappers, static helpers, huge files, and packages that already got broad non-React passes.
- `package_score` is the sum of the top 5 remaining file scores in that package, not every crumb.

## Strong Take

Do not do another wide sweep. The honest next work is a **strict `score >= 6` batch**.

That batch is:

1. `dnd`: [DndPlugin.tsx](packages/dnd/src/DndPlugin.tsx) — score `7`
2. `docx`: [getVShapes.ts](packages/docx/src/lib/docx-cleaner/utils/getVShapes.ts) — score `7`
3. `list`: [BaseListPlugin.tsx](packages/list/src/lib/BaseListPlugin.tsx) — score `6`
4. `code-drawing`: [renderers.ts](packages/code-drawing/src/lib/utils/renderers.ts) — score `6`
5. `markdown`: [listToMdastTree.ts](packages/markdown/src/lib/serializer/listToMdastTree.ts) — score `6`
6. `list`: [getSiblingList.ts](packages/list/src/lib/queries/getSiblingList.ts) — score `6`

## Wider Batch (`score >= 5`)

1. `dnd`: [DndPlugin.tsx](packages/dnd/src/DndPlugin.tsx) — score `7`
2. `docx`: [getVShapes.ts](packages/docx/src/lib/docx-cleaner/utils/getVShapes.ts) — score `7`
3. `list`: [BaseListPlugin.tsx](packages/list/src/lib/BaseListPlugin.tsx) — score `6`
4. `code-drawing`: [renderers.ts](packages/code-drawing/src/lib/utils/renderers.ts) — score `6`
5. `markdown`: [listToMdastTree.ts](packages/markdown/src/lib/serializer/listToMdastTree.ts) — score `6`
6. `list`: [getSiblingList.ts](packages/list/src/lib/queries/getSiblingList.ts) — score `6`
7. `autoformat`: [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts) — score `5`
8. `layout`: [withColumn.ts](packages/layout/src/lib/withColumn.ts) — score `5`
9. `core`: [getPlainText.tsx](packages/core/src/static/internal/getPlainText.tsx) — score `5`
10. `dnd`: [onHoverNode.ts](packages/dnd/src/transforms/onHoverNode.ts) — score `5`
11. `link`: [unwrapLink.ts](packages/link/src/lib/transforms/unwrapLink.ts) — score `5`
12. `slate`: [isTargetInsideNonReadonlyVoid.ts](packages/slate/src/internal/dom-editor/isTargetInsideNonReadonlyVoid.ts) — score `5`
13. `udecode/depset`: [get-package-manager.ts](packages/udecode/depset/src/utils/get-package-manager.ts) — score `5`
14. `core`: [cleanHtmlTextNodes.ts](packages/core/src/lib/plugins/html/utils/cleanHtmlTextNodes.ts) — score `5`
15. `core`: [deserializeHtmlNodeChildren.ts](packages/core/src/lib/plugins/html/utils/deserializeHtmlNodeChildren.ts) — score `5`
16. `suggestion`: [getActiveSuggestionDescriptions.ts](packages/suggestion/src/lib/utils/getActiveSuggestionDescriptions.ts) — score `5`
17. `core`: [createStaticString.ts](packages/core/src/static/utils/createStaticString.ts) — score `5`
18. `list`: [areEqListStyleType.ts](packages/list/src/lib/queries/areEqListStyleType.ts) — score `5`
19. `table`: [getSelectedCells.ts](packages/table/src/lib/queries/getSelectedCells.ts) — score `5`
20. `docx-io`: [vnode.ts](packages/docx-io/src/lib/internal/utils/vnode.ts) — score `5`

## Package Order By Real Value

1. `core` — package score `24`, top files `getPlainText.tsx:5; cleanHtmlTextNodes.ts:5; deserializeHtmlNodeChildren.ts:5; createStaticString.ts:5; pluginRenderTextStatic.tsx:4`
2. `dnd` — package score `22`, top files `DndPlugin.tsx:7; onHoverNode.ts:5; onDropNode.ts:4; getHoverDirection.ts:3; getNewDirection.ts:3`
3. `list` — package score `21`, top files `BaseListPlugin.tsx:6; getSiblingList.ts:6; areEqListStyleType.ts:5; withList.ts:4`
4. `slate` — package score `21`, top files `isTargetInsideNonReadonlyVoid.ts:5; hasEditableTarget.ts:4; hasSelectableTarget.ts:4; hasTarget.ts:4; toSlatePoint.ts:4`
5. `table` — package score `21`, top files `getSelectedCells.ts:5; deleteColumn.ts:4; insertTableColumn.ts:4; insertTableRow.ts:4; setBorderSize.ts:4`
6. `markdown` — package score `19`, top files `listToMdastTree.ts:6; deserializeMd.ts:4; fontRules.ts:3; customMdxDeserialize.ts:3; splitIncompleteMdx.ts:3`
7. `docx` — package score `17`, top files `getVShapes.ts:7; docxListToList.ts:4; cleanDocxImageElements.ts:3; cleanDocxListElementsToList.ts:3`
8. `suggestion` — package score `17`, top files `getActiveSuggestionDescriptions.ts:5; deleteSuggestion.ts:4; BaseSuggestionPlugin.ts:3; rejectSuggestion.ts:3; withSuggestion.ts:2`
9. `list-classic` — package score `16`, top files `BaseTodoListPlugin.ts:4; withList.ts:4; withNormalizeList.ts:3; insertTodoListItem.ts:3; withInsertFragmentList.ts:2`
10. `docx-io` — package score `13`, top files `vnode.ts:5; image-dimensions.ts:4; unit-conversion.ts:4`
11. `link` — package score `12`, top files `unwrapLink.ts:5; upsertLink.ts:3; encodeUrlIfNeeded.ts:2; safeDecodeUrl.ts:2`
12. `basic-nodes` — package score `11`, top files `BaseCodePlugin.ts:3; BaseHeadingPlugin.ts:2; BaseBoldPlugin.ts:2; BaseItalicPlugin.ts:2; BaseStrikethroughPlugin.ts:2`

## Caveats

- Raw package totals still overstate packages with many crumbs. Trust the sorted file ranking first.
- Files with score `0` were intentionally excluded because they are React-bound, hook-heavy, DOM-ish, test-only, type-only, barrels, or too trivial to justify more tests.
- This map is biased toward deterministic non-React seams, exactly like you asked. It will underrate UI and provider files on purpose.

## Full Data

- [2026-03-24-coverage-priority-packages-post-threshold-5b.tsv](docs/plans/2026-03-24-coverage-priority-packages-post-threshold-5b.tsv)
- [2026-03-24-coverage-priority-files-post-threshold-5b.tsv](docs/plans/2026-03-24-coverage-priority-files-post-threshold-5b.tsv)
