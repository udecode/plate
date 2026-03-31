---
title: Coverage Priority Map Post Yjs Merge
type: testing
date: 2026-03-22
status: completed
---

# Coverage Priority Map Post Yjs Merge

## Goal

Run fresh repo coverage, score every `packages/*/src/**` file for non-React unit-test value, and sync the next recommendations against:

- March 6, 2026 cleanup strategy
- March 9, 2026 excellence plan
- March 17, 2026 execution passes
- the now-merged Yjs suite work

## Coverage Run

- Command:
  - `bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-22b --reporter=dots`
- Result:
  - `2557 pass`
  - `0 fail`
  - `444 files`
  - `4.25s`
- Artifact:
  - [lcov.info](/Users/zbeyens/git/plate/.coverage-repo-2026-03-22b/lcov.info)

## Sync From Completed Work

- March 14, 2026:
  - `markdown` already got the worthwhile helper and fallback pass.
- March 15, 2026:
  - `table` already got the merge, sizing, and selection helper pass.
- March 17, 2026:
  - `selection`, `docx-io`, and the focused non-React `core` lane already got follow-up work.
- March 22, 2026:
  - `yjs` just got the fast suite, slow collaboration lane, and follow-up upstream-inspired cases.

Strong take: the raw matrix still slightly over-scores `core` and `table` because they are big and still have uncovered leftovers. I would not reopen them next. The actual recommendation order below is the one to follow.

## Scoring Rules

- Scope is every runtime file under `packages/*/src/**`.
- `/react` files score `0` by design.
- Barrels, declaration files, and type-only files score `0`.
- Declarative rule tables under `autoformat/rules/**` score `0`.
- Recent package passes get penalized so we do not recommend the same work twice.
- Scores favor deterministic transforms, parsers, serializers, queries, provider logic, plugin contracts, and pure helpers with meaningful uncovered behavior.
- UI-skewed packages get pushed down even when they are uncovered.

## My Order

### 1. `list-classic`

Best next package.

- Why:
  - best remaining mix of deterministic query and transform seams
  - high-value editor behavior, not coverage cosplay
  - sits exactly where the older plan already wanted the next serious spend
- Start here:
  - [getTodoListItemEntry.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/queries/getTodoListItemEntry.ts)
  - [getHighestEmptyList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/queries/getHighestEmptyList.ts)
  - [withDeleteFragmentList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/withDeleteFragmentList.ts)
  - [withInsertBreakList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/withInsertBreakList.ts)
  - [moveListSiblingsAfterCursor.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/transforms/moveListSiblingsAfterCursor.ts)

### 2. `suggestion`

- Why:
  - deterministic diff and suggestion-transform behavior
  - strong value without any `/react` detour
  - better next seam quality than reopening `core` leftovers
- Start here:
  - [diffToSuggestions.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/diffToSuggestions.ts)
  - [withSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/withSuggestion.ts)
  - [removeNodesSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/removeNodesSuggestion.ts)
  - [getSuggestionNodeEntries.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/utils/getSuggestionNodeEntries.ts)
  - [findSuggestionNode.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/queries/findSuggestionNode.ts)

### 3. `docx`

- Why:
  - very unit-testable cleaner and import seams
  - big user-facing value without dragging app wiring into package tests
  - cleaner next move than `docx-io`, which already got its pure-helper pass
- Start here:
  - [cleanDocxImageElements.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/cleanDocxImageElements.ts)
  - [getRtfImageHex.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/getRtfImageHex.ts)
  - [getRtfImagesMap.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/getRtfImagesMap.ts)
  - [getRtfImagesByType.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/getRtfImagesByType.ts)
  - [getRtfImageMimeType.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/getRtfImageMimeType.ts)

### 4. `ai`

- Why:
  - the value here is in pure transforms and prompt helpers, not model fakery
  - coverage is still brutally low in the exact deterministic seams that matter
  - worth doing after `suggestion` and `docx`, not before them
- Start here:
  - [withAIBatch.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/transforms/withAIBatch.ts)
  - [getEditorPrompt.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/utils/getEditorPrompt.ts)
  - [insertAINodes.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/transforms/insertAINodes.ts)
  - [replacePlaceholders.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/utils/replacePlaceholders.ts)
  - [undoAI.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/transforms/undoAI.ts)

### 5. `layout`

- Why:
  - still mostly deterministic column operations
  - real regression surface
  - no `/react` requirement
- Start here:
  - [resizeColumn.ts](/Users/zbeyens/git/plate/packages/layout/src/lib/transforms/resizeColumn.ts)
  - [moveMiddleColumn.ts](/Users/zbeyens/git/plate/packages/layout/src/lib/transforms/moveMiddleColumn.ts)
  - [insertColumnGroup.ts](/Users/zbeyens/git/plate/packages/layout/src/lib/transforms/insertColumnGroup.ts)
  - [withColumn.ts](/Users/zbeyens/git/plate/packages/layout/src/lib/withColumn.ts)
  - [insertColumn.ts](/Users/zbeyens/git/plate/packages/layout/src/lib/transforms/insertColumn.ts)

### 6. `list`

- Why:
  - still has clean query and toggle seams left
  - smaller and cheaper than the packages above
  - good follow-up once `list-classic` is moving
- Start here:
  - [getSiblingListStyleType.ts](/Users/zbeyens/git/plate/packages/list/src/lib/queries/getSiblingListStyleType.ts)
  - [toggleListByPath.ts](/Users/zbeyens/git/plate/packages/list/src/lib/transforms/toggleListByPath.ts)
  - [someList.ts](/Users/zbeyens/git/plate/packages/list/src/lib/queries/someList.ts)
  - [someTodoList.ts](/Users/zbeyens/git/plate/packages/list/src/lib/queries/someTodoList.ts)
  - [setListNode.ts](/Users/zbeyens/git/plate/packages/list/src/lib/transforms/setListNode.ts)

### 7. `code-block`

- Why:
  - remaining non-React logic is still real
  - cleaner than reopening `core` or `table`
- Start here:
  - [withCodeBlock.ts](/Users/zbeyens/git/plate/packages/code-block/src/lib/withCodeBlock.ts)
  - [formatter.ts](/Users/zbeyens/git/plate/packages/code-block/src/lib/formatter/formatter.ts)
  - [withInsertDataCodeBlock.ts](/Users/zbeyens/git/plate/packages/code-block/src/lib/withInsertDataCodeBlock.ts)
  - [setCodeBlockToDecorations.ts](/Users/zbeyens/git/plate/packages/code-block/src/lib/setCodeBlockToDecorations.ts)

### 8. `autoformat`

Surgical only.

- Worth testing:
  - [AutoformatPlugin.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/AutoformatPlugin.ts)
  - [autoformatBlock.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/transforms/autoformatBlock.ts)
  - [autoformatMark.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/transforms/autoformatMark.ts)
  - [autoformatText.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/transforms/autoformatText.ts)
- Not worth the time:
  - rule-table files under `packages/autoformat/src/lib/rules/**`

### 9. `csv`

Tiny but sharp.

- Start here:
  - [deserializeCsv.ts](/Users/zbeyens/git/plate/packages/csv/src/lib/deserializer/utils/deserializeCsv.ts)
  - [CsvPlugin.ts](/Users/zbeyens/git/plate/packages/csv/src/lib/CsvPlugin.ts)

### 10. `comment`

Good file-level value, but not a bigger campaign than the packages above.

- Start here:
  - [BaseCommentPlugin.ts](/Users/zbeyens/git/plate/packages/comment/src/lib/BaseCommentPlugin.ts)
  - [withComments.ts](/Users/zbeyens/git/plate/packages/comment/src/lib/withComments.ts)
  - [getCommentKeys.ts](/Users/zbeyens/git/plate/packages/comment/src/lib/utils/getCommentKeys.ts)
  - [getCommentCount.ts](/Users/zbeyens/git/plate/packages/comment/src/lib/utils/getCommentCount.ts)

## Not Next

- `yjs`
  - just landed a serious fast plus slow pass
  - current matrix score is `0`
- `media`
  - current non-`/react` matrix score is `0`
  - the old March 17 recommendation is stale here
- `markdown`
  - down to one score-1 leftover on [defaultRules.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/rules/defaultRules.ts)
  - not worth the next cycle
- `selection`
  - only one real leftover file still registers
  - March 17 already consumed the good internal seams
- `docx-io`
  - pure-helper pass already happened on March 17
  - remaining debt is lower-value export/app crossover
- `table`
  - still has leftovers, especially [withSetFragmentDataTable.ts](/Users/zbeyens/git/plate/packages/table/src/lib/withSetFragmentDataTable.ts)
  - still not worth reopening right now
- `core`
  - still has low-coverage leftovers
  - most of them are not as clean or as urgent as the packages above

## Ranking Snapshot

This is my actual recommendation order, not just the raw heuristic sort.

| Rank | Package | Score | Take |
| --- | --- | ---: | --- |
| 1 | `list-classic` | 49 | Best next deterministic editor-behavior lane |
| 2 | `suggestion` | 46 | Rich transform/diff value without `/react` |
| 3 | `docx` | 45 | Very unit-testable cleaner/import seams |
| 4 | `ai` | 47 | Good pure transform/helper lane, avoid network theater |
| 5 | `layout` | 44 | Strong column transform seams |
| 6 | `list` | 41 | Cheap query/toggle follow-up |
| 7 | `code-block` | 36 | Real non-React behavior still left |
| 8 | `autoformat` | 25 | Surgical pass only |
| 9 | `csv` | 19 | Two-file slice, clean ROI |
| 10 | `comment` | 26 | Good file-level value, smaller overall win |

## Artifacts

- [lcov.info](/Users/zbeyens/git/plate/.coverage-repo-2026-03-22b/lcov.info)
- [2026-03-22-coverage-priority-packages-post-yjs.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-22-coverage-priority-packages-post-yjs.tsv)
- [2026-03-22-coverage-priority-files-post-yjs.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-22-coverage-priority-files-post-yjs.tsv)

The TSVs are the exhaustive matrix for every package and file under `packages/*/src/**`. The markdown is the actual call on what to do next.
