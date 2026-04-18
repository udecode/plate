---
title: Coverage Priority Map Post Package Sweep
type: testing
date: 2026-03-23
status: completed
---

# Coverage Priority Map Post Package Sweep

## Goal

Run fresh repo coverage, sync against the March 17 docs plus the March 22-23 package sweep, then rank the remaining non-React test work by actual value.

## Coverage Run

- Command:
  - `bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo-2026-03-23a --reporter=dots`
- Result:
  - `2486 pass`
  - `443 files`
  - `2.09s`
- Artifact:
  - [.coverage-repo-2026-03-23a/lcov.info](.coverage-repo-2026-03-23a/lcov.info)

## Scoring Rules

- Scope is `packages/*/src/**`.
- Package score is the sum of the top 8 remaining non-React file scores.
- File score is `0-10`.
- `/react`, test files, barrels, and type-only files score `0`.
- React-ish and browser-only buckets outside literal `/react` are also excluded for this pass:
  - `udecode/react-*`
  - `udecode/cmdk`
  - `playwright`
- High scores go to deterministic transforms, queries, parsers, serializers, geometry helpers, and real plugin contracts.
- Tiny wrappers and already-swept packages get penalties on purpose.
- Recent-pass penalties were applied for March 17, March 22, and March 23 work so leftover uncovered crumbs do not outrank fresh central seams.

## Sync Notes

These lanes are already substantially covered and were intentionally pushed down:

- March 17: `selection`, focused non-React `core`, focused `docx-io`
- March 22-23: `yjs`, `list-classic`, `suggestion`, `docx`, `ai`, `layout`, `list`, `code-block`, `autoformat`, `csv`, `comment`, `dnd`, `combobox`, `link`, `date`, `code-drawing`, `emoji`
- Table still has raw uncovered surface, but it was the recent push and should not be the next package again.

## What I Would Do Next

This order is the final value ranking, not a blind sort on raw package score. I used the score map, then pushed down recent-pass leftovers and weak component-ish lanes.

### 1. `slate`

- Score: `66`
- Best files:
  - [packages/slate/src/internal/transforms/setNodes.ts](packages/slate/src/internal/transforms/setNodes.ts) `9`
  - [packages/slate/src/internal/transforms/insertNodes.ts](packages/slate/src/internal/transforms/insertNodes.ts) `9`
  - [packages/slate/src/utils/assignLegacyTransforms.ts](packages/slate/src/utils/assignLegacyTransforms.ts) `8`
  - [packages/slate/src/internal/transforms/deleteText.ts](packages/slate/src/internal/transforms/deleteText.ts) `8`
  - [packages/slate/src/utils/deleteMerge.ts](packages/slate/src/utils/deleteMerge.ts) `8`

### 2. `diff`

- Score: `63`
- Best files:
  - [packages/diff/src/internal/utils/diff-nodes.ts](packages/diff/src/internal/utils/diff-nodes.ts) `9`
  - [packages/diff/src/internal/utils/with-change-tracking.ts](packages/diff/src/internal/utils/with-change-tracking.ts) `8`
  - [packages/diff/src/internal/transforms/transformDiffTexts.ts](packages/diff/src/internal/transforms/transformDiffTexts.ts) `8`
  - [packages/diff/src/internal/transforms/transformDiffDescendants.ts](packages/diff/src/internal/transforms/transformDiffDescendants.ts) `8`
  - [packages/diff/src/internal/transforms/transformDiffNodes.ts](packages/diff/src/internal/transforms/transformDiffNodes.ts) `8`

### 3. `utils`

- Score: `64`
- Best files:
  - [packages/utils/src/lib/plugins/normalize-types/withNormalizeTypes.ts](packages/utils/src/lib/plugins/normalize-types/withNormalizeTypes.ts) `9`
  - [packages/utils/src/lib/plate-types.ts](packages/utils/src/lib/plate-types.ts) `8`
  - [packages/utils/src/lib/plate-keys.ts](packages/utils/src/lib/plate-keys.ts) `8`
  - [packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts](packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts) `8`
  - [packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts](packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts) `8`

### 4. `core`

- Score: `56`
- Best files:
  - [packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts](packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts) `7`
  - [packages/core/src/lib/utils/normalizeDescendantsToDocumentFragment.ts](packages/core/src/lib/utils/normalizeDescendantsToDocumentFragment.ts) `7`
  - [packages/core/src/lib/plugins/html/utils/deserializeHtmlNode.ts](packages/core/src/lib/plugins/html/utils/deserializeHtmlNode.ts) `7`
  - [packages/core/src/lib/plugins/html/utils/getDataNodeProps.ts](packages/core/src/lib/plugins/html/utils/getDataNodeProps.ts) `7`
  - [packages/core/src/static/utils/getRenderNodeStaticProps.ts](packages/core/src/static/utils/getRenderNodeStaticProps.ts) `7`

### 5. `floating`

- Score: `51`
- Best files:
  - [packages/floating/src/utils/createVirtualRef.ts](packages/floating/src/utils/createVirtualRef.ts) `8`
  - [packages/floating/src/utils/makeClientRect.ts](packages/floating/src/utils/makeClientRect.ts) `7`
  - [packages/floating/src/utils/getBoundingClientRect.ts](packages/floating/src/utils/getBoundingClientRect.ts) `7`
  - [packages/floating/src/libs/floating-ui.ts](packages/floating/src/libs/floating-ui.ts) `6`
  - [packages/floating/src/utils/getRangeBoundingClientRect.ts](packages/floating/src/utils/getRangeBoundingClientRect.ts) `6`

### 6. `markdown`

- Score: `40`
- Best files:
  - [packages/markdown/src/lib/serializer/convertTextsSerialize.ts](packages/markdown/src/lib/serializer/convertTextsSerialize.ts) `5`
  - [packages/markdown/src/lib/serializer/convertNodesSerialize.ts](packages/markdown/src/lib/serializer/convertNodesSerialize.ts) `5`
  - [packages/markdown/src/lib/MarkdownPlugin.ts](packages/markdown/src/lib/MarkdownPlugin.ts) `5`
  - [packages/markdown/src/lib/deserializer/deserializeMd.ts](packages/markdown/src/lib/deserializer/deserializeMd.ts) `5`
  - [packages/markdown/src/lib/deserializer/convertNodesDeserialize.ts](packages/markdown/src/lib/deserializer/convertNodesDeserialize.ts) `5`

### 7. `indent`

- Score: `32`
- Best files:
  - [packages/indent/src/lib/transforms/setIndent.ts](packages/indent/src/lib/transforms/setIndent.ts) `9`
  - [packages/indent/src/lib/withIndent.ts](packages/indent/src/lib/withIndent.ts) `7`
  - [packages/indent/src/lib/BaseIndentPlugin.ts](packages/indent/src/lib/BaseIndentPlugin.ts) `6`
  - [packages/indent/src/lib/transforms/indent.ts](packages/indent/src/lib/transforms/indent.ts) `5`
  - [packages/indent/src/lib/transforms/outdent.ts](packages/indent/src/lib/transforms/outdent.ts) `5`

### 8. `basic-styles`

- Score: `36`
- Best files:
  - [packages/basic-styles/src/lib/transforms/setAlign.ts](packages/basic-styles/src/lib/transforms/setAlign.ts) `8`
  - [packages/basic-styles/src/lib/transforms/setLineHeight.ts](packages/basic-styles/src/lib/transforms/setLineHeight.ts) `8`
  - [packages/basic-styles/src/lib/utils/toUnitLess.ts](packages/basic-styles/src/lib/utils/toUnitLess.ts) `5`
  - [packages/basic-styles/src/lib/BaseFontColorPlugin.ts](packages/basic-styles/src/lib/BaseFontColorPlugin.ts) `3`
  - [packages/basic-styles/src/lib/BaseLineHeightPlugin.ts](packages/basic-styles/src/lib/BaseLineHeightPlugin.ts) `3`

### 9. `math`

- Score: `22`
- Best files:
  - [packages/math/src/lib/transforms/insertInlineEquation.ts](packages/math/src/lib/transforms/insertInlineEquation.ts) `7`
  - [packages/math/src/lib/transforms/insertEquation.ts](packages/math/src/lib/transforms/insertEquation.ts) `7`
  - [packages/math/src/lib/utils/getEquationHtml.ts](packages/math/src/lib/utils/getEquationHtml.ts) `6`
  - [packages/math/src/lib/BaseEquationPlugin.ts](packages/math/src/lib/BaseEquationPlugin.ts) `1`
  - [packages/math/src/lib/BaseInlineEquationPlugin.ts](packages/math/src/lib/BaseInlineEquationPlugin.ts) `1`

### 10. `toc`

- Score: `19`
- Best files:
  - [packages/toc/src/internal/getHeadingList.ts](packages/toc/src/internal/getHeadingList.ts) `6`
  - [packages/toc/src/lib/transforms/insertToc.ts](packages/toc/src/lib/transforms/insertToc.ts) `6`
  - [packages/toc/src/lib/utils/isHeading.ts](packages/toc/src/lib/utils/isHeading.ts) `5`
  - [packages/toc/src/lib/BaseTocPlugin.ts](packages/toc/src/lib/BaseTocPlugin.ts) `2`

## Second Tier

- `udecode/utils`
  - real helper coverage, but lower framework leverage than the top group
- `udecode/depset`
  - a few honest utility seams, not a major package lane
- `caption`, `tabbable`
  - small deterministic slices if you want tiny wins instead of a core package

## Explicitly Not Next

- `table`
  - raw score is still decent, but reopening table right after the table push would be dumb
- `cursor`
  - mixed with component-ish seams, so weaker value than `floating` if you want geometry/selection coverage
- `resizable`
  - mostly utility dust plus component code
- `test-utils`
  - not product behavior coverage
- recently swept packages with leftover score-1 to score-3 files
  - do not reopen them unless a specific bug points there

## Ranking Snapshot

| Rank | Package          | Score | Status    |
| ---- | ---------------- | ----: | --------- |
| 1    | `slate`          |    66 | candidate |
| 2    | `utils`          |    64 | candidate |
| 3    | `diff`           |    63 | candidate |
| 4    | `core`           |    56 | candidate |
| 5    | `floating`       |    51 | candidate |
| 6    | `udecode/utils`  |    49 | candidate |
| 7    | `table`          |    40 | candidate |
| 8    | `markdown`       |    40 | candidate |
| 9    | `cursor`         |    40 | candidate |
| 10   | `resizable`      |    38 | candidate |
| 11   | `basic-styles`   |    36 | candidate |
| 12   | `indent`         |    32 | candidate |
| 13   | `test-utils`     |    31 | candidate |
| 14   | `basic-nodes`    |    27 | candidate |
| 15   | `udecode/depset` |    25 | candidate |

## Full Data

- [docs/plans/2026-03-23-coverage-priority-packages-post-package-sweep.tsv](docs/plans/2026-03-23-coverage-priority-packages-post-package-sweep.tsv)
- [docs/plans/2026-03-23-coverage-priority-files-post-package-sweep.tsv](docs/plans/2026-03-23-coverage-priority-files-post-package-sweep.tsv)
