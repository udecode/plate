---
title: Coverage Priority Map Testing Review Non React Refresh
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Map Testing Review Non React Refresh

## Inputs

- Coverage source: [lcov.info](.coverage-repo-2026-03-24i/lcov.info)
- Constraints:
  - temporary exclude `/react` and obvious React surfaces outside `/react`
  - no browser or e2e coverage work
  - no coverage vanity
  - file-first ranking, not package cosplay

## Coverage Run

- Command: `bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo-2026-03-24i --reporter=dots`
- Result: Fresh coverage: `2898` pass, `0` fail, `582` files, `2.47s`.

## Suite Health

- `pnpm test:profile -- --top 25`: clean. No fast-lane threshold breach.
- `pnpm test:slowest -- --top 25`: clean. Same story.
- skipped-test debt scan: none worth fixing
- commented-out spec scan: none worth fixing
- cross-spec import scan: none

## Scoring Rules

- Scope is `packages/**/src/**`.
- Exclude test files, barrels, declaration files, obvious type-only files, test-support helpers, test-infra packages, zero-value crumbs, and the temporary non-React cut.
- Reward deterministic transforms, queries, merge helpers, parser or serializer seams, plugin resolution, plugin contracts, overrides, and bounded runtime utilities.
- Penalize DOM-heavy leftovers, thin wrappers, giant files, and tiny crumb gaps.
- Missing-from-lcov runtime files are treated as fully uncovered, because pretending they have zero uncovered lines is clown math.
- `package_score` is the sum of the top 5 remaining file scores in that package.

## Strong Take

Do not do another package sweep.

Raw score says `core` first, but I would split that into two moves: do the plugin and HTML seam files first, then decide if the DOM-ish static helper is worth it.

Strict batch, sorted by value:

1. `core`: [getSelectedDomFragment.tsx](packages/core/src/static/utils/getSelectedDomFragment.tsx) — score `8`
2. `core`: [resolvePlugin.ts](packages/core/src/internal/plugin/resolvePlugin.ts) — score `8`
3. `core`: [resolvePlugins.ts](packages/core/src/internal/plugin/resolvePlugins.ts) — score `7`
4. `autoformat`: [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts) — score `6`
5. `callout`: [BaseCalloutPlugin.ts](packages/callout/src/lib/BaseCalloutPlugin.ts) — score `6`
6. `table`: [withNormalizeTable.ts](packages/table/src/lib/withNormalizeTable.ts) — score `6`
7. `list-classic`: [withNormalizeList.ts](packages/list-classic/src/lib/withNormalizeList.ts) — score `6`
8. `core`: [deserializeHtmlNode.ts](packages/core/src/lib/plugins/html/utils/deserializeHtmlNode.ts) — score `6`

## Threshold Counts

- `score >= 7`: `3` files
- `score >= 6`: `11` files
- `score >= 5`: `52` files
- `score >= 4`: `87` files
- `score >= 3`: `131` files
- `score >= 2`: `174` files
- `score >= 1`: `196` files

## Packages By Value

1. `core` — package score `35`, top files `getSelectedDomFragment.tsx:8; resolvePlugin.ts:8; resolvePlugins.ts:7; deserializeHtmlNode.ts:6; pipeNormalizeInitialValue.ts:6`
2. `markdown` — package score `27`, top files `splitIncompleteMdx.ts:6; deserializeInlineMd.ts:6; mdast.ts:5; convertNodesSerialize.ts:5; customMdxDeserialize.ts:5`
3. `list-classic` — package score `26`, top files `withNormalizeList.ts:6; withInsertFragmentList.ts:5; withList.ts:5; insertTodoListItem.ts:5; unwrapList.ts:5`
4. `table` — package score `26`, top files `withNormalizeTable.ts:6; withApplyTable.ts:5; getSelectedCellsBorders.ts:5; setBorderSize.ts:5; moveSelectionFromCell.ts:5`
5. `docx-io` — package score `25`, top files `importDocx.ts:5; html-to-docx.ts:5; font-table.ts:5; content-types.ts:5; settings.ts:5`
6. `slate` — package score `24`, top files `node-entry.ts:5; legacy-editor.ts:5; editor-type.ts:5; deleteText.ts:5; mergeNodes.ts:4`
7. `suggestion` — package score `21`, top files `deleteSuggestion.ts:5; withSuggestion.ts:4; removeMarkSuggestion.ts:4; acceptSuggestion.ts:4; insertFragmentSuggestion.ts:4`
8. `code-block` — package score `17`, top files `BaseCodeBlockPlugin.ts:5; insertCodeBlock.ts:5; withCodeBlock.ts:3; htmlDeserializerCodeBlock.ts:3; formatter.ts:1`
9. `basic-nodes` — package score `13`, top files `BaseHeadingPlugin.ts:4; BaseCodePlugin.ts:3; BaseItalicPlugin.ts:2; BaseUnderlinePlugin.ts:2; BaseStrikethroughPlugin.ts:2`
10. `media` — package score `13`, top files `insertImageFromFiles.ts:4; withImageUpload.ts:3; BaseImagePlugin.ts:3; withImageEmbed.ts:3`

## Best Files By Value

1. `core` — [getSelectedDomFragment.tsx](packages/core/src/static/utils/getSelectedDomFragment.tsx) — score `8`, coverage `13.9%`, uncovered `31`
2. `core` — [resolvePlugin.ts](packages/core/src/internal/plugin/resolvePlugin.ts) — score `8`, coverage `88.1%`, uncovered `8`
3. `core` — [resolvePlugins.ts](packages/core/src/internal/plugin/resolvePlugins.ts) — score `7`, coverage `95.8%`, uncovered `15`
4. `autoformat` — [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts) — score `6`, coverage `37.0%`, uncovered `46`
5. `callout` — [BaseCalloutPlugin.ts](packages/callout/src/lib/BaseCalloutPlugin.ts) — score `6`, coverage `0.0%`, uncovered `20`
6. `table` — [withNormalizeTable.ts](packages/table/src/lib/withNormalizeTable.ts) — score `6`, coverage `92.7%`, uncovered `8`
7. `list-classic` — [withNormalizeList.ts](packages/list-classic/src/lib/withNormalizeList.ts) — score `6`, coverage `92.5%`, uncovered `7`
8. `core` — [deserializeHtmlNode.ts](packages/core/src/lib/plugins/html/utils/deserializeHtmlNode.ts) — score `6`, coverage `94.4%`, uncovered `4`
9. `markdown` — [splitIncompleteMdx.ts](packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.ts) — score `6`, coverage `95.7%`, uncovered `3`
10. `markdown` — [deserializeInlineMd.ts](packages/markdown/src/lib/deserializer/utils/deserializeInlineMd.ts) — score `6`, coverage `93.3%`, uncovered `2`
11. `core` — [pipeNormalizeInitialValue.ts](packages/core/src/internal/plugin/pipeNormalizeInitialValue.ts) — score `6`, coverage `93.8%`, uncovered `1`
12. `core` — [SlatePlugin.ts](packages/core/src/lib/plugin/SlatePlugin.ts) — score `5`, coverage `0.0%`, uncovered `641`
13. `core` — [BasePlugin.ts](packages/core/src/lib/plugin/BasePlugin.ts) — score `5`, coverage `0.0%`, uncovered `541`
14. `utils` — [plate-types.ts](packages/utils/src/lib/plate-types.ts) — score `5`, coverage `0.0%`, uncovered `251`
15. `core` — [SlateEditor.ts](packages/core/src/lib/editor/SlateEditor.ts) — score `5`, coverage `0.0%`, uncovered `197`

## Stop Condition

Stop when the remaining misses are mostly wrappers, DOM-only seams, giant sludge, or crumbs that would only move the percentage and not your regression confidence.

## Caveats

- Package totals are noisier than file totals. Trust the file ranking more.
- The temporary non-React cut hides React-heavy hotspots on purpose. That is a sequencing choice, not proof they are solved.
- Some DOM-ish non-React files still rank. That is fine, but they come after parser, plugin, and structural seams if you want the smarter order.

## Full Data

- [2026-03-24-coverage-priority-packages-testing-review-non-react-refresh.tsv](docs/plans/2026-03-24-coverage-priority-packages-testing-review-non-react-refresh.tsv)
- [2026-03-24-coverage-priority-files-testing-review-non-react-refresh.tsv](docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react-refresh.tsv)
