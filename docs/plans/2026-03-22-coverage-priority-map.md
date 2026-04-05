---
title: Coverage Priority Map
type: testing
date: 2026-03-22
status: completed
---

# Coverage Priority Map

## Goal

Run fresh repo coverage, score every `packages/*/src/**` file for non-React unit-test value, and sync the next recommendations against the work already completed on March 14-17, 2026.

## Coverage Run

- Command:
  - `bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-22a --reporter=dots`
- Result:
  - `2524 pass`
  - `0 fail`
  - `437 files`
  - `3.28s`
- Artifact:
  - [lcov.info](/Users/zbeyens/git/plate/.coverage-repo-2026-03-22a/lcov.info)

## Sync From Completed Work

- March 14, 2026:
  - `markdown` already got a focused helper and fallback pass. It is not the best next spend anymore.
- March 15, 2026:
  - `table` already got the merge, sizing, and selection helper pass. It still has debt, but not enough value to stay at the front of the line.
- March 17, 2026:
  - `selection`, `docx-io`, and a focused non-React `core` lane all got real follow-up work.
- Fresh coverage says the old March 17 priority map is stale in one big way:
  - `media` non-`/react` coverage is basically done now. Do not spend the next cycle there.

## Scoring Rules

- Scope is every runtime file under `packages/*/src/**`.
- `/react` files score `0` by design.
- Barrels, declaration files, and type-only files score `0`.
- Declarative config blobs like autoformat rule tables score `0`.
- Recent package passes get penalized so we do not recommend the same work twice.
- Scores favor deterministic transforms, parsers, serializers, queries, provider logic, and plugin contracts with real uncovered behavior.

## My Order

Scores tie in a few places. The TSV is the raw matrix. The order below is my actual recommendation.

### 1. `yjs`

Best next package.

- Why:
  - zero-covered collaboration-critical contracts
  - no `/react` required
  - provider, registry, and editor-sync seams are exactly the kind of bugs that hurt when they slip
- Start here:
  - [BaseYjsPlugin.ts](/Users/zbeyens/git/plate/packages/yjs/src/lib/BaseYjsPlugin.ts)
  - [withPlateYjs.ts](/Users/zbeyens/git/plate/packages/yjs/src/lib/withPlateYjs.ts)
  - [withTYjs.ts](/Users/zbeyens/git/plate/packages/yjs/src/lib/withTYjs.ts)
  - [withTYHistory.ts](/Users/zbeyens/git/plate/packages/yjs/src/lib/withTYHistory.ts)
  - [slateToDeterministicYjsState.ts](/Users/zbeyens/git/plate/packages/yjs/src/utils/slateToDeterministicYjsState.ts)
  - [registry.ts](/Users/zbeyens/git/plate/packages/yjs/src/lib/providers/registry.ts)
  - [hocuspocus-provider.ts](/Users/zbeyens/git/plate/packages/yjs/src/lib/providers/hocuspocus-provider.ts)

### 2. `list-classic`

Best next move if you want to stay closest to the existing testing plan.

- Why:
  - still in the planned high-ROI ring
  - transform and query seams are badly under-covered
  - real editor behavior, not vanity coverage
- Start here:
  - [getHighestEmptyList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/queries/getHighestEmptyList.ts)
  - [getTodoListItemEntry.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/queries/getTodoListItemEntry.ts)
  - [moveListSiblingsAfterCursor.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/transforms/moveListSiblingsAfterCursor.ts)
  - [withDeleteFragmentList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/withDeleteFragmentList.ts)
  - [withInsertBreakList.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/withInsertBreakList.ts)

### 3. `docx`

- Why:
  - deterministic cleaner and import seams
  - big uncovered helper surface
  - strong value without touching UI
- Start here:
  - [cleanDocxImageElements.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/cleanDocxImageElements.ts)
  - [getRtfImageHex.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/getRtfImageHex.ts)
  - [getRtfImageMimeType.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/getRtfImageMimeType.ts)
  - [getRtfImagesByType.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/getRtfImagesByType.ts)
  - [getRtfImagesMap.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/getRtfImagesMap.ts)

### 4. `suggestion`

- Why:
  - deterministic diff and transform behavior
  - low coverage in real user-facing logic
  - better value than reopening recently-passed packages
- Start here:
  - [diffToSuggestions.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/diffToSuggestions.ts)
  - [findSuggestionNode.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/queries/findSuggestionNode.ts)
  - [removeNodesSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/removeNodesSuggestion.ts)
  - [getSuggestionNodeEntries.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/utils/getSuggestionNodeEntries.ts)
  - [withSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/withSuggestion.ts)

### 5. `ai`

- Why:
  - the good seams here are pure transforms and prompt helpers, not network fakery
  - coverage is still brutally low in those deterministic paths
- Start here:
  - [insertAINodes.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/transforms/insertAINodes.ts)
  - [removeAIMarks.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/transforms/removeAIMarks.ts)
  - [removeAINodes.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/transforms/removeAINodes.ts)
  - [undoAI.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/transforms/undoAI.ts)
  - [withAIBatch.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/transforms/withAIBatch.ts)
  - [getEditorPrompt.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/utils/getEditorPrompt.ts)
  - [replacePlaceholders.ts](/Users/zbeyens/git/plate/packages/ai/src/lib/utils/replacePlaceholders.ts)

### 6. `list`

- Why:
  - good deterministic query and toggle seams
  - cheaper than the bigger packages above
- Start here:
  - [getSiblingListStyleType.ts](/Users/zbeyens/git/plate/packages/list/src/lib/queries/getSiblingListStyleType.ts)
  - [toggleListByPath.ts](/Users/zbeyens/git/plate/packages/list/src/lib/transforms/toggleListByPath.ts)
  - [someList.ts](/Users/zbeyens/git/plate/packages/list/src/lib/queries/someList.ts)
  - [someTodoList.ts](/Users/zbeyens/git/plate/packages/list/src/lib/queries/someTodoList.ts)
  - [setListNode.ts](/Users/zbeyens/git/plate/packages/list/src/lib/transforms/setListNode.ts)

### 7. `layout`

- Why:
  - transform-heavy
  - still mostly empty on the exact column operations that can regress
- Start here:
  - [insertColumnGroup.ts](/Users/zbeyens/git/plate/packages/layout/src/lib/transforms/insertColumnGroup.ts)
  - [moveMiddleColumn.ts](/Users/zbeyens/git/plate/packages/layout/src/lib/transforms/moveMiddleColumn.ts)
  - [resizeColumn.ts](/Users/zbeyens/git/plate/packages/layout/src/lib/transforms/resizeColumn.ts)
  - [insertColumn.ts](/Users/zbeyens/git/plate/packages/layout/src/lib/transforms/insertColumn.ts)
  - [withColumn.ts](/Users/zbeyens/git/plate/packages/layout/src/lib/withColumn.ts)

### 8. `code-block`

- Why:
  - still has real non-React behavior left
  - smaller and cleaner than reopening `core`
- Start here:
  - [withCodeBlock.ts](/Users/zbeyens/git/plate/packages/code-block/src/lib/withCodeBlock.ts)
  - [formatter.ts](/Users/zbeyens/git/plate/packages/code-block/src/lib/formatter/formatter.ts)
  - [withInsertDataCodeBlock.ts](/Users/zbeyens/git/plate/packages/code-block/src/lib/withInsertDataCodeBlock.ts)
  - [setCodeBlockToDecorations.ts](/Users/zbeyens/git/plate/packages/code-block/src/lib/setCodeBlockToDecorations.ts)

### 9. `autoformat`

This package needs a surgical pass, not a coverage binge.

- Worth testing:
  - [AutoformatPlugin.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/AutoformatPlugin.ts)
  - [autoformatBlock.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/transforms/autoformatBlock.ts)
  - [isPreviousCharacterEmpty.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/utils/isPreviousCharacterEmpty.ts)
- Not worth the time:
  - individual rule-table files under `packages/autoformat/src/lib/rules/**`

### 10. `csv`

One sharp little slice, not a whole campaign.

- Start here:
  - [deserializeCsv.ts](/Users/zbeyens/git/plate/packages/csv/src/lib/deserializer/utils/deserializeCsv.ts)
  - [CsvPlugin.ts](/Users/zbeyens/git/plate/packages/csv/src/lib/CsvPlugin.ts)

## Not Next

- `table`
  - latest focused pass was March 15, 2026
  - still some score-6 leftovers, but nothing that beats the top lanes above
- `markdown`
  - latest focused pass was March 14, 2026
  - current non-React gaps are lower-value leftovers
- `selection`
  - March 17 already covered the high-value internals
- `docx-io`
  - March 17 already covered the obvious pure-helper gaps
- `media`
  - fresh coverage shows the non-`/react` lane is basically saturated
- `link`
  - not zero debt, just not urgent
- `emoji` and `code-drawing`
  - the raw matrix scores them high because they are zero-covered deterministic code
  - I still would not spend the next cycle there before `yjs`, `list-classic`, `docx`, `suggestion`, or `ai`

## Artifacts

The raw package and file matrices were generated as TSV artifacts during this pass and are intentionally treated as disposable analysis output, not committed source of truth.

The file matrix included every runtime file under `packages/*/src`, with:

- `score`
- `line_cov_pct`
- `uncovered_lines`
- `source_lines`
- `status`
  - `candidate`
  - `recently-covered`
  - `low-value-data`
  - `excluded-react`
  - `excluded-type`
  - `excluded-barrel`
