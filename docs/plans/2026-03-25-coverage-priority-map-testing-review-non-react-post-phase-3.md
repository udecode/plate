---
title: Coverage Priority Map Testing Review Non React Post Phase 3
type: testing
date: 2026-03-25
status: completed
---

# Coverage Priority Map Testing Review Non React Post Phase 3

## Inputs

- Coverage source: [lcov.info](/Users/zbeyens/git/plate/.coverage-repo-2026-03-25b/lcov.info)
- Constraints:
  - temporary exclude `/react`
  - no browser or e2e coverage work
  - no coverage vanity
  - file-first ranking, not package theater

## Coverage Run

- Command: scoped `bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-25b --reporter=dots` over the regenerated non-React file list in `.claude/tmp/non_react_test_files.txt`
- Result: Fresh non-React coverage: `2784` pass, `0` fail, `566` files, `2.32s`.
- Important: the old scoped file list was stale. This pass regenerated it to `615` files before rerunning coverage. The earlier list would have lied about remaining gaps.

## Suite Health

- `pnpm test:profile -- --top 25`: green
- `pnpm test:slowest -- --top 25`: green
- fast suite result: `3022` pass, `0` fail, `614` files, `3.83s`
- average: `0.508ms`
- median: `0.212ms`
- slow-bucket thresholds: `75ms/test`, `150ms/file total`
- threshold breaches: none
- skipped-test debt scan: none worth fixing
- commented-out spec scan: none worth fixing
- cross-spec import scan: none

## Scoring Rules

- Scope is `packages/**/src/**`.
- Exclude test files, barrels, declaration files, obvious type-only files, `/react`, and browser-package work under `packages/playwright`.
- Penalize wrappers, tiny crumbs, DOM-heavy leftovers, schema dust, and giant serializer sludge.
- Reward deterministic transforms, queries, parser or serializer seams, plugin contracts, plugin resolution, and bounded runtime helpers.
- Missing-from-lcov runtime files are treated as uncovered. Pretending they are covered is clown math.
- `package_score` is the sum of the top 5 remaining file scores in that package, not every leftover crumb.

## Strong Take

Non-React coverage is basically spent.

There are no `score >= 6` files left. The entire honest `score >= 5` set is just five files, and four of them are one tiny `basic-nodes` parser-plugin lane. That is not a reason to reopen package theater. It is a reason to finish one last micro-batch if you care, then stop.

## Threshold Counts

- `score >= 5`: `5` files
- `score >= 4`: `25` files
- `score >= 3`: `70` files
- `score >= 2`: `108` files
- `score >= 1`: `210` files

## Strict Next Batch

1. `docx`: [docxListToList.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/docxListToList.ts) — score `5`
2. `basic-nodes`: [BaseCodePlugin.ts](/Users/zbeyens/git/plate/packages/basic-nodes/src/lib/BaseCodePlugin.ts) — score `5`
3. `basic-nodes`: [BaseStrikethroughPlugin.ts](/Users/zbeyens/git/plate/packages/basic-nodes/src/lib/BaseStrikethroughPlugin.ts) — score `5`
4. `basic-nodes`: [BaseItalicPlugin.ts](/Users/zbeyens/git/plate/packages/basic-nodes/src/lib/BaseItalicPlugin.ts) — score `5`
5. `basic-nodes`: [BaseUnderlinePlugin.ts](/Users/zbeyens/git/plate/packages/basic-nodes/src/lib/BaseUnderlinePlugin.ts) — score `5`

## Wider Optional Batch

1. `table`: [getSelectedCellsBorders.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getSelectedCellsBorders.ts) — score `4`
2. `autoformat`: [AutoformatPlugin.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/AutoformatPlugin.ts) — score `4`
3. `core`: [DebugPlugin.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/debug/DebugPlugin.ts) — score `4`
4. `udecode/depset`: [get-package-manager.ts](/Users/zbeyens/git/plate/packages/udecode/depset/src/utils/get-package-manager.ts) — score `4`
5. `table`: [getCellIndices.ts](/Users/zbeyens/git/plate/packages/table/src/lib/utils/getCellIndices.ts) — score `4`
6. `basic-nodes`: [BaseBoldPlugin.ts](/Users/zbeyens/git/plate/packages/basic-nodes/src/lib/BaseBoldPlugin.ts) — score `4`
7. `slate`: [deleteText.ts](/Users/zbeyens/git/plate/packages/slate/src/internal/transforms/deleteText.ts) — score `4`

## Packages By Value

1. `basic-nodes` — package score `24`
2. `slate` — package score `20`
3. `docx` — package score `18`
4. `table` — package score `17`
5. `core` — package score `16`
6. `docx-io` — package score `16`
7. `list-classic` — package score `16`
8. `dnd` — package score `15`
9. `markdown` — package score `12`
10. `resizable` — package score `12`
11. `suggestion` — package score `10`
12. `cursor` — package score `9`

## Best Files By Value

1. `docx` — [docxListToList.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/docxListToList.ts) — score `5`, coverage `78.9%`, uncovered `8`
2. `basic-nodes` — [BaseCodePlugin.ts](/Users/zbeyens/git/plate/packages/basic-nodes/src/lib/BaseCodePlugin.ts) — score `5`, coverage `76.9%`, uncovered `6`
3. `basic-nodes` — [BaseStrikethroughPlugin.ts](/Users/zbeyens/git/plate/packages/basic-nodes/src/lib/BaseStrikethroughPlugin.ts) — score `5`, coverage `83.3%`, uncovered `4`
4. `basic-nodes` — [BaseItalicPlugin.ts](/Users/zbeyens/git/plate/packages/basic-nodes/src/lib/BaseItalicPlugin.ts) — score `5`, coverage `82.6%`, uncovered `4`
5. `basic-nodes` — [BaseUnderlinePlugin.ts](/Users/zbeyens/git/plate/packages/basic-nodes/src/lib/BaseUnderlinePlugin.ts) — score `5`, coverage `82.6%`, uncovered `4`
6. `table` — [getSelectedCellsBorders.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getSelectedCellsBorders.ts) — score `4`, coverage `95.1%`, uncovered `12`
7. `docx-io` — [settings.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/internal/schemas/settings.ts) — score `4`, coverage `0.0%`, uncovered `11`
8. `slate` — [hasDOMNode.ts](/Users/zbeyens/git/plate/packages/slate/src/internal/dom-editor/hasDOMNode.ts) — score `4`, coverage `18.2%`, uncovered `9`
9. `autoformat` — [AutoformatPlugin.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/AutoformatPlugin.ts) — score `4`, coverage `88.9%`, uncovered `8`
10. `slate` — [hasEditableTarget.ts](/Users/zbeyens/git/plate/packages/slate/src/internal/dom-editor/hasEditableTarget.ts) — score `4`, coverage `20.0%`, uncovered `8`
11. `slate` — [hasSelectableTarget.ts](/Users/zbeyens/git/plate/packages/slate/src/internal/dom-editor/hasSelectableTarget.ts) — score `4`, coverage `20.0%`, uncovered `8`
12. `slate` — [hasTarget.ts](/Users/zbeyens/git/plate/packages/slate/src/internal/dom-editor/hasTarget.ts) — score `4`, coverage `20.0%`, uncovered `8`
13. `core` — [DebugPlugin.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/debug/DebugPlugin.ts) — score `4`, coverage `90.6%`, uncovered `5`
14. `udecode/depset` — [get-package-manager.ts](/Users/zbeyens/git/plate/packages/udecode/depset/src/utils/get-package-manager.ts) — score `4`, coverage `81.5%`, uncovered `5`
15. `table` — [getCellIndices.ts](/Users/zbeyens/git/plate/packages/table/src/lib/utils/getCellIndices.ts) — score `4`, coverage `81.8%`, uncovered `4`

## Stop Condition

Stop non-React coverage after the phase-4 roadmap below. The remaining misses after that are mostly DOM-only Slate crumbs, schema or type dust, wrapper/plugin residue, and giant low-ROI serializer sludge.

That is where more non-React coverage turns into percentage cosplay. Switch to React or architecture-safety work instead.

## Caveats

- Package totals are noisier than file totals. Trust the file ranking more.
- `basic-nodes` looks high because a small parser-mark lane is still partially covered, not because the whole package needs a sweep.
- `slate` looks inflated by DOM-editor leftovers. They are real files, but wrong phase for a final non-React cleanup lap.
- `docx-io` still overstates itself because schema dust and `html-to-docx.ts` are uncovered but not high-ROI.

## Full Data

- [2026-03-25-coverage-priority-packages-testing-review-non-react-post-phase-3.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-25-coverage-priority-packages-testing-review-non-react-post-phase-3.tsv)
- [2026-03-25-coverage-priority-files-testing-review-non-react-post-phase-3.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-25-coverage-priority-files-testing-review-non-react-post-phase-3.tsv)
