---
title: Coverage Priority Map Post Check
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Map Post Check

## Inputs

- Coverage source: [lcov.info](/Users/zbeyens/git/plate/.coverage-repo-2026-03-24e/lcov.info)
- Constraints:
  - exclude `/react`
  - no browser or e2e
  - no vanity coverage
  - score only files still worth real unit or editor-contract tests
  - penalize already-swept packages so crumbs do not crowd out better seams

## Coverage Run

- Command: `bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-24e --reporter=dots`
- Result: Fresh coverage: `2789` pass, `0` fail, `554` files, `2.75s`.

## Scoring Rules

- Scope is `packages/**/src/**`.
- Exclude `/react`, hook-heavy files, DOM-heavy files, barrels, type-only files, test helpers, and obvious serializer sludge.
- Reward deterministic transforms, queries, merge helpers, parser or serializer helpers, and small utilities with real uncovered behavior.
- Penalize thin wrappers, giant rule tables, very large files, and packages that already had broad passes.
- `package_score` is the sum of the top 5 remaining file scores in that package, not every crumb.

## Strong Take

Do not do another repo-wide sweep. The honest next work is a **strict `score >= 6` batch**.

That batch is:

1. `list-classic`: [transforms/toggleList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/transforms/toggleList.ts) — score `7`
2. `list-classic`: [transforms/insertListItem.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/transforms/insertListItem.ts) — score `7`
3. `table`: [lib/withDeleteTable.ts](/Users/zbeyens/git/plate/packages/table/src/lib/withDeleteTable.ts) — score `6`
4. `table`: [merge/deleteRow.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/deleteRow.ts) — score `6`
5. `diff`: [lib/withGetFragmentExcludeDiff.ts](/Users/zbeyens/git/plate/packages/diff/src/lib/withGetFragmentExcludeDiff.ts) — score `6`
6. `link`: [transforms/unwrapLink.ts](/Users/zbeyens/git/plate/packages/link/src/lib/transforms/unwrapLink.ts) — score `6`
7. `docx`: [utils/isDocxOl.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/isDocxOl.ts) — score `6`
8. `list`: [transforms/setListNodes.ts](/Users/zbeyens/git/plate/packages/list/src/lib/transforms/setListNodes.ts) — score `6`
9. `list`: [transforms/setListSiblingNodes.ts](/Users/zbeyens/git/plate/packages/list/src/lib/transforms/setListSiblingNodes.ts) — score `6`

## Wider Batch (`score >= 5`)

Use this only if you want one more sweep before rerunning coverage again.

1. `list-classic`: [transforms/toggleList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/transforms/toggleList.ts) — score `7`
2. `list-classic`: [transforms/insertListItem.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/transforms/insertListItem.ts) — score `7`
3. `table`: [lib/withDeleteTable.ts](/Users/zbeyens/git/plate/packages/table/src/lib/withDeleteTable.ts) — score `6`
4. `table`: [merge/deleteRow.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/deleteRow.ts) — score `6`
5. `diff`: [lib/withGetFragmentExcludeDiff.ts](/Users/zbeyens/git/plate/packages/diff/src/lib/withGetFragmentExcludeDiff.ts) — score `6`
6. `link`: [transforms/unwrapLink.ts](/Users/zbeyens/git/plate/packages/link/src/lib/transforms/unwrapLink.ts) — score `6`
7. `docx`: [utils/isDocxOl.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/isDocxOl.ts) — score `6`
8. `list`: [transforms/setListNodes.ts](/Users/zbeyens/git/plate/packages/list/src/lib/transforms/setListNodes.ts) — score `6`
9. `list`: [transforms/setListSiblingNodes.ts](/Users/zbeyens/git/plate/packages/list/src/lib/transforms/setListSiblingNodes.ts) — score `6`
10. `list`: [transforms/indentList.ts](/Users/zbeyens/git/plate/packages/list/src/lib/transforms/indentList.ts) — score `5`
11. `link`: [transforms/upsertLink.ts](/Users/zbeyens/git/plate/packages/link/src/lib/transforms/upsertLink.ts) — score `5`
12. `table`: [transforms/moveSelectionFromCell.ts](/Users/zbeyens/git/plate/packages/table/src/lib/transforms/moveSelectionFromCell.ts) — score `5`
13. `udecode/react-hotkeys`: [internal/isHotkeyPressed.ts](/Users/zbeyens/git/plate/packages/udecode/react-hotkeys/src/internal/isHotkeyPressed.ts) — score `5`
14. `docx`: [utils/cleanDocxTabCount.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/cleanDocxTabCount.ts) — score `5`
15. `docx`: [utils/cleanDocxSpacerun.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/cleanDocxSpacerun.ts) — score `5`
16. `suggestion`: [transforms/setSuggestionNodes.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/setSuggestionNodes.ts) — score `5`
17. `list`: [transforms/toggleListSet.ts](/Users/zbeyens/git/plate/packages/list/src/lib/transforms/toggleListSet.ts) — score `5`
18. `list`: [transforms/toggleListUnset.ts](/Users/zbeyens/git/plate/packages/list/src/lib/transforms/toggleListUnset.ts) — score `5`
19. `core`: [transforms/setAffinitySelection.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.ts) — score `5`
20. `list-classic`: [transforms/unindentListItems.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/transforms/unindentListItems.ts) — score `5`

## Package Order By Real Value

1. `list-classic` — package score `29`, top files `toggleList.ts:7; insertListItem.ts:7; unindentListItems.ts:5; unwrapList.ts:5; getHighestEmptyList.ts:5`
2. `list` — package score `27`, top files `setListNodes.ts:6; setListSiblingNodes.ts:6; indentList.ts:5; toggleListSet.ts:5; toggleListUnset.ts:5`
3. `table` — package score `26`, top files `withDeleteTable.ts:6; deleteRow.ts:6; moveSelectionFromCell.ts:5; isTableBorderHidden.ts:5; deleteColumn.ts:4`
4. `diff` — package score `14`, top files `withGetFragmentExcludeDiff.ts:6; get-properties.ts:3; unused-char-generator.ts:3; transformDiffDescendants.ts:2`
5. `link` — package score `16`, top files `unwrapLink.ts:6; upsertLink.ts:5; encodeUrlIfNeeded.ts:2; safeDecodeUrl.ts:2; withLink.ts:1`
6. `udecode/depset` — package score `0`, top files `none`
7. `suggestion` — package score `21`, top files `setSuggestionNodes.ts:5; deleteSuggestion.ts:4; removeMarkSuggestion.ts:4; findSuggestionProps.ts:4; insertFragmentSuggestion.ts:4`
8. `udecode/react-hotkeys` — package score `8`, top files `isHotkeyPressed.ts:5; validators.ts:3`
9. `docx` — package score `24`, top files `isDocxOl.ts:6; cleanDocxTabCount.ts:5; cleanDocxSpacerun.ts:5; docxListToList.ts:4; cleanDocxListElementsToList.ts:4`
10. `docx-io` — package score `8`, top files `image-dimensions.ts:3; vnode.ts:3; unit-conversion.ts:2`
11. `code-block` — package score `10`, top files `insertCodeBlock.ts:5; htmlDeserializerCodeBlock.ts:2; BaseCodeBlockPlugin.ts:1; formatter.ts:1; withCodeBlock.ts:1`
12. `floating` — package score `5`, top files `mergeClientRects.ts:5`

## Caveats

- Raw package totals still overstate `core`, `docx`, `list`, and `list-classic` because they each have multiple small leftover seams. Use the sorted batch lists above, not raw package totals alone.
- `docx-io` still has big uncovered serializer guts, but they are deliberately penalized as sludge. The only remaining honest value there is the small deterministic utility lane.
- Tiny one-line crumbs are capped on purpose. If a file only has one uncovered branch left, it does not get to cosplay as the next frontier.

## Full Data

- [2026-03-24-coverage-priority-packages-post-check.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-packages-post-check.tsv)
- [2026-03-24-coverage-priority-files-post-check.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-files-post-check.tsv)
