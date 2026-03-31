---
title: Coverage Priority Map Testing Review Non React
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Map Testing Review Non React

## Inputs

- Coverage source: [lcov.info](/Users/zbeyens/git/plate/.coverage-repo-2026-03-24h/lcov.info)
- Constraint: temporary non-React review
- Scope: `packages/**/src/**` only
- Goal: regression confidence for breaking changes, not vanity coverage

## Coverage Run

- Command: `bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-24h --reporter=dots`
- Result: Fresh coverage: `2869 pass, 0 fail, 575 files, 2.97s`.

## Suite Health

- `pnpm test:profile -- --top 25`
- `pnpm test:slowest -- --top 25`
- Fast lane is clean. Nothing is close to the 75ms/test or 150ms/file thresholds.
- The hottest current files are mostly React or already-known table/list integration-heavy specs. That is not a reason to expand the slow lane.
- No skipped-test debt, commented-out spec debt, or cross-spec imports turned up in the current scans.

## Scoring Rules

- Exclude `/react`, obvious React surfaces outside `/react`, hook files, test files, barrels, declaration files, obvious type-only files, generated junk, and zero-value crumbs.
- Exclude very thin plugin wrappers. They look uncovered and still usually are not worth the time.
- Reward deterministic transforms, queries, merge helpers, parser or serializer seams, plugin resolution, meaningful plugin contracts, overrides, and bounded utilities with real uncovered behavior.
- Penalize DOM-heavy leftovers, giant low-ROI files, and wrapper dust so fake hotspots do not crowd out real contracts.
- `package_score` is the sum of the top 5 remaining file scores in that package, not every leftover crumb.

## Strong Take

Do not do another package sweep.

The strict next batch is the raw `score >= 6` set:

1. `list-classic`: [BaseTodoListPlugin.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/BaseTodoListPlugin.ts) — score `8`
2. `core`: [pluginDeserializeHtml.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts) — score `7`
3. `markdown`: [deserializeMd.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/deserializer/deserializeMd.ts) — score `7`
4. `suggestion`: [deleteSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/deleteSuggestion.ts) — score `7`
5. `table`: [deleteColumn.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/deleteColumn.ts) — score `7`
6. `suggestion`: [rejectSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/rejectSuggestion.ts) — score `7`
7. `table`: [insertTableColumn.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/insertTableColumn.ts) — score `7`
8. `table`: [insertTableRow.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/insertTableRow.ts) — score `7`
9. `suggestion`: [BaseSuggestionPlugin.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/BaseSuggestionPlugin.ts) — score `6`
10. `table`: [BaseTablePlugin.ts](/Users/zbeyens/git/plate/packages/table/src/lib/BaseTablePlugin.ts) — score `6`
11. `list`: [withList.ts](/Users/zbeyens/git/plate/packages/list/src/lib/withList.ts) — score `6`
12. `core`: [withMergeRules.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/override/withMergeRules.ts) — score `6`

The wider but still defensible batch is the raw `score >= 5` set:

1. `list-classic`: [BaseTodoListPlugin.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/BaseTodoListPlugin.ts) — score `8`
2. `core`: [pluginDeserializeHtml.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts) — score `7`
3. `markdown`: [deserializeMd.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/deserializer/deserializeMd.ts) — score `7`
4. `suggestion`: [deleteSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/deleteSuggestion.ts) — score `7`
5. `table`: [deleteColumn.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/deleteColumn.ts) — score `7`
6. `suggestion`: [rejectSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/rejectSuggestion.ts) — score `7`
7. `table`: [insertTableColumn.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/insertTableColumn.ts) — score `7`
8. `table`: [insertTableRow.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/insertTableRow.ts) — score `7`
9. `suggestion`: [BaseSuggestionPlugin.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/BaseSuggestionPlugin.ts) — score `6`
10. `table`: [BaseTablePlugin.ts](/Users/zbeyens/git/plate/packages/table/src/lib/BaseTablePlugin.ts) — score `6`
11. `list`: [withList.ts](/Users/zbeyens/git/plate/packages/list/src/lib/withList.ts) — score `6`
12. `core`: [withMergeRules.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/override/withMergeRules.ts) — score `6`
13. `dnd`: [onDropNode.ts](/Users/zbeyens/git/plate/packages/dnd/src/transforms/onDropNode.ts) — score `6`
14. `core`: [htmlElementToLeaf.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/htmlElementToLeaf.ts) — score `6`
15. `basic-styles`: [BaseTextAlignPlugin.ts](/Users/zbeyens/git/plate/packages/basic-styles/src/lib/BaseTextAlignPlugin.ts) — score `6`
16. `core`: [resolvePlugin.ts](/Users/zbeyens/git/plate/packages/core/src/internal/plugin/resolvePlugin.ts) — score `6`
17. `table`: [withInsertFragmentTable.ts](/Users/zbeyens/git/plate/packages/table/src/lib/withInsertFragmentTable.ts) — score `6`
18. `table`: [withNormalizeTable.ts](/Users/zbeyens/git/plate/packages/table/src/lib/withNormalizeTable.ts) — score `6`

## Threshold Counts

- `score >= 7`: `8` files
- `score >= 6`: `29` files
- `score >= 5`: `83` files
- `score >= 4`: `115` files
- `score >= 3`: `139` files
- `score >= 2`: `146` files
- `score >= 1`: `155` files

## Packages By Value

1. `table` — package score `33`, top files `deleteColumn.ts:7; insertTableColumn.ts:7; insertTableRow.ts:7; BaseTablePlugin.ts:6; withInsertFragmentTable.ts:6`
2. `core` — package score `31`, top files `pluginDeserializeHtml.ts:7; withMergeRules.ts:6; htmlElementToLeaf.ts:6; resolvePlugin.ts:6; cleanHtmlFontElements.ts:6`
3. `list-classic` — package score `30`, top files `BaseTodoListPlugin.ts:8; insertTodoListItem.ts:6; unwrapList.ts:6; withInsertFragmentList.ts:5; withList.ts:5`
4. `suggestion` — package score `30`, top files `deleteSuggestion.ts:7; rejectSuggestion.ts:7; BaseSuggestionPlugin.ts:6; acceptSuggestion.ts:5; removeMarkSuggestion.ts:5`
5. `markdown` — package score `29`, top files `deserializeMd.ts:7; customMdxDeserialize.ts:6; deserializeInlineMd.ts:6; convertNodesSerialize.ts:5; splitIncompleteMdx.ts:5`
6. `code-block` — package score `21`, top files `insertCodeBlock.ts:6; BaseCodeBlockPlugin.ts:5; htmlDeserializerCodeBlock.ts:5; withCodeBlock.ts:3; formatter.ts:2`
7. `basic-nodes` — package score `20`, top files `BaseCodePlugin.ts:4; BaseHeadingPlugin.ts:4; BaseBoldPlugin.ts:4; BaseItalicPlugin.ts:4; BaseStrikethroughPlugin.ts:4`
8. `slate` — package score `19`, top files `deleteText.ts:5; mergeNodes.ts:5; hasEditableTarget.ts:3; hasSelectableTarget.ts:3; hasTarget.ts:3`
9. `docx` — package score `19`, top files `docxListToList.ts:4; cleanDocxListElementsToList.ts:4; getVShapeSpid.ts:4; getRtfImageHex.ts:4; cleanDocxImageElements.ts:3`
10. `list` — package score `16`, top files `withList.ts:6; toggleList.ts:5; getSiblingList.ts:5`
11. `dnd` — package score `14`, top files `onDropNode.ts:6; getHoverDirection.ts:4; getNewDirection.ts:4`
12. `media` — package score `13`, top files `insertImageFromFiles.ts:5; BaseImagePlugin.ts:4; withImageUpload.ts:4`

## Best Files By Value

1. `list-classic` — [BaseTodoListPlugin.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/BaseTodoListPlugin.ts) — score `8`, coverage `37.1%`, uncovered `22`
2. `core` — [pluginDeserializeHtml.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts) — score `7`, coverage `88.8%`, uncovered `18`
3. `markdown` — [deserializeMd.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/deserializer/deserializeMd.ts) — score `7`, coverage `79.2%`, uncovered `15`
4. `suggestion` — [deleteSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/deleteSuggestion.ts) — score `7`, coverage `93.6%`, uncovered `10`
5. `table` — [deleteColumn.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/deleteColumn.ts) — score `7`, coverage `93.4%`, uncovered `9`
6. `suggestion` — [rejectSuggestion.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/transforms/rejectSuggestion.ts) — score `7`, coverage `94.0%`, uncovered `8`
7. `table` — [insertTableColumn.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/insertTableColumn.ts) — score `7`, coverage `94.3%`, uncovered `8`
8. `table` — [insertTableRow.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/insertTableRow.ts) — score `7`, coverage `93.9%`, uncovered `8`
9. `suggestion` — [BaseSuggestionPlugin.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/BaseSuggestionPlugin.ts) — score `6`, coverage `68.5%`, uncovered `28`
10. `table` — [BaseTablePlugin.ts](/Users/zbeyens/git/plate/packages/table/src/lib/BaseTablePlugin.ts) — score `6`, coverage `85.6%`, uncovered `26`
11. `list` — [withList.ts](/Users/zbeyens/git/plate/packages/list/src/lib/withList.ts) — score `6`, coverage `78.3%`, uncovered `25`
12. `core` — [withMergeRules.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/override/withMergeRules.ts) — score `6`, coverage `87.7%`, uncovered `14`
13. `dnd` — [onDropNode.ts](/Users/zbeyens/git/plate/packages/dnd/src/transforms/onDropNode.ts) — score `6`, coverage `87.5%`, uncovered `14`
14. `core` — [htmlElementToLeaf.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/html/utils/htmlElementToLeaf.ts) — score `6`, coverage `69.4%`, uncovered `11`
15. `basic-styles` — [BaseTextAlignPlugin.ts](/Users/zbeyens/git/plate/packages/basic-styles/src/lib/BaseTextAlignPlugin.ts) — score `6`, coverage `72.2%`, uncovered `10`
16. `core` — [resolvePlugin.ts](/Users/zbeyens/git/plate/packages/core/src/internal/plugin/resolvePlugin.ts) — score `6`, coverage `88.1%`, uncovered `8`
17. `table` — [withInsertFragmentTable.ts](/Users/zbeyens/git/plate/packages/table/src/lib/withInsertFragmentTable.ts) — score `6`, coverage `93.2%`, uncovered `8`
18. `table` — [withNormalizeTable.ts](/Users/zbeyens/git/plate/packages/table/src/lib/withNormalizeTable.ts) — score `6`, coverage `92.7%`, uncovered `8`
19. `link` — [upsertLink.ts](/Users/zbeyens/git/plate/packages/link/src/lib/transforms/upsertLink.ts) — score `6`, coverage `93.9%`, uncovered `6`
20. `markdown` — [customMdxDeserialize.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/deserializer/utils/customMdxDeserialize.ts) — score `6`, coverage `91.4%`, uncovered `5`

## Stop Condition

Stop when the remaining misses are mostly wrappers, DOM/provider dust, giant sludge, or tiny crumbs. At that point coverage stops paying rent and the next move is architecture-safety work.

## Caveats

- Package totals are noisier than file ranking. Trust the file order first.
- This map intentionally excludes React surfaces for this pass only. It is a temporary constraint, not a forever rule.
- A few DOM-ish leftovers can still score if they are small and central, but they are not automatic priorities.

## Full Data

- [2026-03-24-coverage-priority-packages-testing-review-non-react.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-packages-testing-review-non-react.tsv)
- [2026-03-24-coverage-priority-files-testing-review-non-react.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react.tsv)
