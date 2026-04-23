---
title: Coverage Priority Map Testing Review Full Repo
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Map Testing Review Full Repo

## Inputs

- Coverage source: [lcov.info](.coverage-repo-2026-03-24l/lcov.info)
- Constraints:
  - whole repo phase, including React
  - no browser or e2e theater
  - no package sweeps unless a package is still mostly untouched
  - exclude tests, barrels, declarations, snapshots, generated junk, and obvious type-only files
  - score only files still worth real regression detection during breaking changes

## Coverage Run

- Command: `bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo-2026-03-24l --reporter=dots`
- Result: Fresh coverage: `2956` pass, `0` fail, `592` files, `3.56s`.

## Suite Health

- `pnpm test:profile -- --top 25`: clean. Nothing breached the fast-lane budget.
- `pnpm test:slowest -- --top 25`: clean. Nothing breached the fast-lane budget.
- Stale debt scans found no skipped-test junk, commented-out spec junk, or cross-spec imports worth fixing.
- Audit caveat: the first full coverage run exposed leaked spies in [BaseCodeBlockPlugin.spec.ts](packages/code-block/src/lib/BaseCodeBlockPlugin.spec.ts) and [withApplyTable.spec.ts](packages/table/src/lib/withApplyTable.spec.ts). Those are fixed now, so this map is based on a clean run, not poisoned test order.

## Scoring Rules

- Scope is `packages/**/src/**`.
- File ranking matters more than package totals.
- Reward transforms, queries, parser or serializer seams, merge helpers, stateful hooks, and behavior-heavy utils.
- Reward low runtime coverage and wide uncovered gaps.
- Penalize wrappers, thin plugin entrypoints, provider or store dust, type-only files, snapshots, generated files, and giant low-ROI slabs.
- `package_score` is the sum of the top 5 remaining file scores in that package. It is a rough map, not gospel.

## Strong Take

Non-React is done. The next honest phase is React and state-heavy seams.

Do not do another package sweep. The remaining value is split across `selection`, `ai`, `link`, `toggle`, `table`, `toc`, `emoji`, and a few secondary packages.

The locked next phase is simple:

1. Execute the full-repo roadmap at [2026-03-24-full-repo-coverage-roadmap.md](docs/plans/2026-03-24-full-repo-coverage-roadmap.md).
2. Finish **Tier 1** first. That is every remaining `score >= 9` file.
3. Then finish **Tier 2**. That is every remaining `score = 8` file.
4. Stop and rerun coverage before touching the score-7 ring.

## Threshold Counts

- `score = 10`: `16` files
- `score >= 9`: `40` files
- `score >= 8`: `63` files
- `score >= 7`: `84` files
- `score >= 6`: `131` files
- `score >= 5`: `167` files

## Packages By Value

Raw package order from the fresh scoring:

1. `ai` — package score `50`, top files `applyAISuggestions.ts:10; submitAIChat.ts:10; callCompletionApi.ts:10; applyTableCellSuggestion.ts:10; triggerCopilotSuggestion.ts:10`
2. `selection` — package score `50`, top files `useCursorOverlay.ts:10; useBlockSelectable.ts:10; getSelectionRects.ts:10; getCursorOverlayState.ts:10; getCaretPosition.ts:10`
3. `toc` — package score `46`, top files `useTocSideBar.ts:10; useContentController.ts:9; useContentObserver.ts:9; useTocObserver.ts:9; useTocController.ts:9`
4. `emoji` — package score `45`, top files `EmojiFloatingLibrary.ts:10; useEmojiPickerState.ts:9; EmojiFloatingGridBuilder.ts:9; EmojiFloatingGrid.ts:9; useEmojiPicker.ts:8`
5. `toggle` — package score `42`, top files `getLastEntryEnclosedInToggle.ts:9; isInClosedToggle.ts:9; useToggleToolbarButton.ts:8; useToggleButton.ts:8; findElementIdsHiddenInToggle.ts:8`
6. `link` — package score `40`, top files `triggerFloatingLinkInsert.ts:10; triggerFloatingLinkEdit.ts:9; triggerFloatingLink.ts:9; useFloatingLinkInsert.ts:6; submitFloatingLink.ts:6`
7. `media` — package score `37`, top files `history.ts:9; usePlaceholderPopover.ts:8; usePlaceholderElement.ts:7; getMediaType.ts:7; insertMedia.ts:6`
8. `list` — package score `36`, top files `useListToolbarButton.ts:8; useTodoListElement.ts:8; useTodoListToolbarButton.ts:8; toggleList.ts:6; getSiblingList.ts:6`
9. `list-classic` — package score `34`, top files `useTodoListElement.ts:8; useListToolbarButton.ts:8; moveListItemSublistItemsToListItemSublist.ts:6; getHighestEmptyList.ts:6; moveListItemDown.ts:6`
10. `table` — package score `34`, top files `useTableMergeState.ts:9; useCellIndices.ts:7; getTableCellBorders.ts:6; deleteRow.ts:6; deleteRowWhenExpanded.ts:6`

Actual execution order is a bit stricter than the raw package table:

1. `selection`
2. `ai`
3. `link`
4. `toggle`
5. `table`, `media`, `combobox`
6. `toc`, `emoji`
7. `cursor`, `math`, `list`, `list-classic`, `callout`, `excalidraw`

Reason: raw package totals overrate some hook clusters. The file queue is the real source of truth.

## Best Files By Value

1. `ai` — [applyAISuggestions.ts](packages/ai/src/react/ai-chat/utils/applyAISuggestions.ts) — score `10`, coverage `0.0%`, uncovered `164`
2. `selection` — [useCursorOverlay.ts](packages/selection/src/react/hooks/useCursorOverlay.ts) — score `10`, coverage `7.9%`, uncovered `116`
3. `ai` — [submitAIChat.ts](packages/ai/src/react/ai-chat/utils/submitAIChat.ts) — score `10`, coverage `0.0%`, uncovered `97`
4. `ai` — [callCompletionApi.ts](packages/ai/src/react/copilot/utils/callCompletionApi.ts) — score `10`, coverage `0.0%`, uncovered `90`
5. `selection` — [useBlockSelectable.ts](packages/selection/src/react/hooks/useBlockSelectable.ts) — score `10`, coverage `5.8%`, uncovered `81`
6. `emoji` — [EmojiFloatingLibrary.ts](packages/emoji/src/react/utils/EmojiLibrary/EmojiFloatingLibrary.ts) — score `10`, coverage `0.0%`, uncovered `78`
7. `selection` — [getSelectionRects.ts](packages/selection/src/react/queries/getSelectionRects.ts) — score `10`, coverage `2.7%`, uncovered `71`
8. `ai` — [applyTableCellSuggestion.ts](packages/ai/src/react/ai-chat/utils/applyTableCellSuggestion.ts) — score `10`, coverage `0.0%`, uncovered `41`
9. `ai` — [triggerCopilotSuggestion.ts](packages/ai/src/react/copilot/utils/triggerCopilotSuggestion.ts) — score `10`, coverage `0.0%`, uncovered `36`
10. `link` — [triggerFloatingLinkInsert.ts](packages/link/src/react/utils/triggerFloatingLinkInsert.ts) — score `10`, coverage `0.0%`, uncovered `36`
11. `ai` — [acceptAISuggestions.ts](packages/ai/src/react/ai-chat/utils/acceptAISuggestions.ts) — score `10`, coverage `0.0%`, uncovered `31`
12. `ai` — [rejectAISuggestions.ts](packages/ai/src/react/ai-chat/utils/rejectAISuggestions.ts) — score `10`, coverage `0.0%`, uncovered `31`
13. `ai` — [resetAIChat.ts](packages/ai/src/react/ai-chat/utils/resetAIChat.ts) — score `10`, coverage `0.0%`, uncovered `29`
14. `selection` — [getCursorOverlayState.ts](packages/selection/src/react/queries/getCursorOverlayState.ts) — score `10`, coverage `11.5%`, uncovered `23`
15. `selection` — [getCaretPosition.ts](packages/selection/src/react/queries/getCaretPosition.ts) — score `10`, coverage `11.1%`, uncovered `16`

## Caveats

- Raw package totals inflate `toc` and `emoji`. Those packages have legit hook clusters, but they are not more important than `selection`, `ai`, or `link`.
- `core`, `slate`, and `markdown` still show medium leftovers, but they are below the current phase threshold. Do not get distracted.
- The remaining high-ROI work is mostly stateful React hooks and behavior-heavy utils. That is why the roadmap freezes a file threshold instead of another package march.
- Trust the file TSV more than the package TSV.

## Full Data

- [2026-03-24-coverage-priority-packages-testing-review-full-repo.tsv](docs/plans/2026-03-24-coverage-priority-packages-testing-review-full-repo.tsv)
- [2026-03-24-coverage-priority-files-testing-review-full-repo.tsv](docs/plans/2026-03-24-coverage-priority-files-testing-review-full-repo.tsv)
- [2026-03-24-full-repo-coverage-roadmap.md](docs/plans/2026-03-24-full-repo-coverage-roadmap.md)
