---
title: Coverage Batch Threshold 5B
type: testing
date: 2026-03-24
status: in_progress
---

# Coverage Batch Threshold 5B

## Goal

Cover the fresh post-check non-React `score >= 5` seams:

- `list-classic`
- `list`
- `table`
- `diff`
- `link`
- `docx`
- `suggestion`
- `core`
- `@udecode/react-hotkeys`

Do real unit or thin editor-contract tests only. No `/react`. No smoke-test cosplay.

## Scope

1. `list-classic`
   - `toggleList.ts`
   - `insertListItem.ts`
   - `unindentListItems.ts`
2. `list`
   - `setListNodes.ts`
   - `setListSiblingNodes.ts`
   - `indentList.ts`
   - `toggleListSet.ts`
   - `toggleListUnset.ts`
3. `table`
   - `withDeleteTable.ts`
   - `merge/deleteRow.ts`
   - `moveSelectionFromCell.ts`
4. `diff`
   - `withGetFragmentExcludeDiff.ts`
5. `link`
   - `unwrapLink.ts`
   - `upsertLink.ts`
6. `docx`
   - `isDocxOl.ts`
   - `cleanDocxTabCount.ts`
   - `cleanDocxSpacerun.ts`
7. `suggestion`
   - `setSuggestionNodes.ts`
8. `core`
   - `setAffinitySelection.ts`
9. `@udecode/react-hotkeys`
   - `isHotkeyPressed.ts`

## Verification

1. Targeted `bun test` on touched specs
2. `bun test` on affected packages
3. `pnpm test:profile -- --top 25 ...`
4. `pnpm test:slowest -- --top 25 ...`
5. `pnpm install`
6. `pnpm turbo build --filter=...`
7. `pnpm turbo typecheck --filter=...`
8. `pnpm lint:fix`

## Notes

- Prefer adjacent specs when a file does not already have one.
- Reuse existing helpers in-package before inventing new fixtures.
- If a direct spec exposes a product bug, fix the smallest honest seam and note it.
