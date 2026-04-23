---
title: Coverage Priority Map Testing Review Non React Post Bun Check
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Map Testing Review Non React Post Bun Check

## Inputs

- Coverage source: [lcov.info](.coverage-repo-2026-03-24p/lcov.info)
- Constraints:
  - temporary exclude `/react`
  - temporarily exclude obvious component shells outside `/react`
  - no browser or e2e coverage work
  - no coverage vanity
  - file-first ranking, not package theater

## Coverage Run

- Command: scoped `bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo-2026-03-24p --reporter=dots` over the temporary non-React file list
- Result: Fresh non-React coverage: `2745` pass, `0` fail, `558` files, `2.77s`.
- Caveat: full-repo `bun test --coverage` is still polluted by React-side suite poison, so this pass uses the stable `/react`-excluded run instead of lying to itself.

## Suite Health

- `pnpm test:profile -- --top 25`: green
- `pnpm test:slowest -- --top 25`: green
- fast suite result: `2983` pass, `0` fail, `606` files, `4.30s`
- average: `0.552ms`
- median: `0.234ms`
- slow-bucket thresholds: `75ms/test`, `150ms/file`
- threshold breaches: none
- top outliers are still mostly React-heavy fast-lane files, so they are suite-health data, not ranking input for this temporary cut
- skipped-test debt scan: none worth fixing
- commented-out spec scan: none worth fixing
- cross-spec import scan: none

## Scoring Rules

- Scope is `packages/**/src/**`.
- Exclude test files, barrels, declaration files, obvious type-only files, generated junk, the temporary `/react` slice, and obvious component shells outside `/react`.
- Penalize wrappers, crumbs, giant sludge, DOM-heavy leftovers, and low-ROI utility dust.
- Reward transforms, queries, merge helpers, parser or serializer seams, plugin resolution, plugin contracts, and non-React static runtime seams.
- Missing-from-lcov runtime files are treated as fully uncovered. Pretending they are covered is clown math.
- `package_score` is the sum of the top 5 remaining file scores in that package.

## Strong Take

Do not do another non-React package sweep.

There is one last real non-React cleanup phase left. It is mostly parser or serializer seams plus a few bounded transform or plugin contract gaps. After the `score >= 5` queue is burned down, stop. The remaining misses are mostly score-4 dust, DOM-heavy leftovers, wrapper clusters, or giant serializer sludge.

## Threshold Counts

- `score >= 6`: `2` files
- `score >= 5`: `21` files
- `score >= 4`: `48` files
- `score >= 3`: `86` files
- `score >= 2`: `134` files
- `score >= 1`: `168` files

## Strict Next Batch

1. `link`: [upsertLink.ts](packages/link/src/lib/transforms/upsertLink.ts) — score `6`
2. `markdown`: [convertNodesSerialize.ts](packages/markdown/src/lib/serializer/convertNodesSerialize.ts) — score `6`

## Wider Final Batch

1. `core`: [DOMPlugin.ts](packages/core/src/lib/plugins/dom/DOMPlugin.ts) — score `5`
2. `autoformat`: [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts) — score `5`
3. `basic-nodes`: [BaseHeadingPlugin.ts](packages/basic-nodes/src/lib/BaseHeadingPlugin.ts) — score `5`
4. `core`: [inferWhiteSpaceRule.ts](packages/core/src/lib/plugins/html/utils/collapse-white-space/inferWhiteSpaceRule.ts) — score `5`
5. `core`: [pipeRenderElementStatic.tsx](packages/core/src/static/pipeRenderElementStatic.tsx) — score `5`
6. `core`: [cleanHtmlFontElements.ts](packages/core/src/lib/plugins/html/utils/cleanHtmlFontElements.ts) — score `5`
7. `core`: [pluginDeserializeHtml.ts](packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts) — score `5`
8. `table`: [getTableCellBorders.ts](packages/table/src/lib/queries/getTableCellBorders.ts) — score `5`
9. `core`: [cleanHtmlTextNodes.ts](packages/core/src/lib/plugins/html/utils/cleanHtmlTextNodes.ts) — score `5`
10. `markdown`: [splitIncompleteMdx.ts](packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.ts) — score `5`
11. `core`: [isLastNonEmptyTextOfInlineFormattingContext.ts](packages/core/src/lib/plugins/html/utils/collapse-white-space/isLastNonEmptyTextOfInlineFormattingContext.ts) — score `5`
12. `core`: [traverseHtmlNode.ts](packages/core/src/lib/plugins/html/utils/traverseHtmlNode.ts) — score `5`
13. `list-classic`: [moveListItemSublistItemsToListItemSublist.ts](packages/list-classic/src/lib/transforms/moveListItemSublistItemsToListItemSublist.ts) — score `5`
14. `markdown`: [mdastToSlate.ts](packages/markdown/src/lib/deserializer/mdastToSlate.ts) — score `5`
15. `markdown`: [markdownToSlateNodesSafely.ts](packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.ts) — score `5`
16. `suggestion`: [addMarkSuggestion.ts](packages/suggestion/src/lib/transforms/addMarkSuggestion.ts) — score `5`
17. `suggestion`: [removeMarkSuggestion.ts](packages/suggestion/src/lib/transforms/removeMarkSuggestion.ts) — score `5`
18. `table`: [deleteRowWhenExpanded.ts](packages/table/src/lib/merge/deleteRowWhenExpanded.ts) — score `5`

## Packages By Value

1. `markdown` — package score `25`
2. `core` — package score `25`
3. `table` — package score `22`
4. `basic-nodes` — package score `21`
5. `suggestion` — package score `20`
6. `list-classic` — package score `19`
7. `code-block` — package score `14`
8. `docx-io` — package score `14`
9. `list` — package score `11`
10. `slate` — package score `11`

## Best Files By Value

1. `link` — [upsertLink.ts](packages/link/src/lib/transforms/upsertLink.ts) — score `6`, coverage `93.9%`, uncovered `6`
2. `markdown` — [convertNodesSerialize.ts](packages/markdown/src/lib/serializer/convertNodesSerialize.ts) — score `6`, coverage `95.6%`, uncovered `6`
3. `core` — [DOMPlugin.ts](packages/core/src/lib/plugins/dom/DOMPlugin.ts) — score `5`, coverage `68.8%`, uncovered `20`
4. `autoformat` — [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts) — score `5`, coverage `88.9%`, uncovered `8`
5. `basic-nodes` — [BaseHeadingPlugin.ts](packages/basic-nodes/src/lib/BaseHeadingPlugin.ts) — score `5`, coverage `93.5%`, uncovered `6`
6. `core` — [inferWhiteSpaceRule.ts](packages/core/src/lib/plugins/html/utils/collapse-white-space/inferWhiteSpaceRule.ts) — score `5`, coverage `79.2%`, uncovered `5`
7. `core` — [pipeRenderElementStatic.tsx](packages/core/src/static/pipeRenderElementStatic.tsx) — score `5`, coverage `83.3%`, uncovered `5`
8. `core` — [cleanHtmlFontElements.ts](packages/core/src/lib/plugins/html/utils/cleanHtmlFontElements.ts) — score `5`, coverage `66.7%`, uncovered `4`
9. `core` — [pluginDeserializeHtml.ts](packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts) — score `5`, coverage `97.5%`, uncovered `4`
10. `table` — [getTableCellBorders.ts](packages/table/src/lib/queries/getTableCellBorders.ts) — score `5`, coverage `90.2%`, uncovered `4`

## Stop Condition

Stop non-React coverage after the phase-3 roadmap below. After that, the remaining misses are mostly wrapper dust, tiny crumbs, DOM-heavy leftovers, and giant low-ROI serializer slabs.

That is where more non-React coverage turns into percentage cosplay. Switch to React or architecture-safety work instead.

## Caveats

- Package totals are noisier than file totals. Trust the file ranking more.
- `core` and `markdown` still look inflated because they have several medium-value parser or static crumbs left.
- `docx-io` still looks bigger than it deserves because `html-to-docx.ts` is a giant low-ROI serializer slab.

## Full Data

- [2026-03-24-coverage-priority-packages-testing-review-non-react-post-bun-check.tsv](docs/plans/2026-03-24-coverage-priority-packages-testing-review-non-react-post-bun-check.tsv)
- [2026-03-24-coverage-priority-files-testing-review-non-react-post-bun-check.tsv](docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react-post-bun-check.tsv)
