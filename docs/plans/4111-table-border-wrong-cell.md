# 4111 Table border wrong cell

## Goal

Fix `#4111` so table border toggles target the correct adjacent cell after merges introduce `rowSpan` / `colSpan`.

## Source Of Truth

- GitHub issue: `#4111` `Table: the table cell border is removed from the wrong cell`
- Type: bug fix
- Expected outcome: after merging cells, toggling top or left borders on adjacent cells updates the correct neighbor cell instead of the wrong path-derived sibling
- Browser surface: yes, but code seam is deterministic package tests

## Task Shape

- Tracked issue: GitHub
- Complexity: non-trivial
- Heavyweight: no
- Primary package: `packages/table`
- Likely root-cause layer: helper query / abstraction seam

## Phases

1. Read issue, local learnings, and current helper implementation. Status: done
2. Add failing regression coverage for merged-cell border targeting. Status: done
3. Replace naive adjacent-cell lookup with span-aware lookup. Status: done
4. Run targeted tests + package verification. Status: done
5. Create/update PR and sync issue. Status: pending

## Findings

- `getLeftTableCell` and `getTopTableCell` still use raw path arithmetic.
- Current `setSelectedCellsBorder` integration coverage does not cover merged-cell adjacency.
- Recent table-border regression from `2026-03-29` was a different bug in `withTableCellSelection`; that fix should stay intact.
- Existing merge helper `findCellByIndexes` already provides the right primitive for span-aware lookup.
- `.claude/docs/solutions/patterns/critical-patterns.md` does not exist in this repo.
- The red regression was clean once the fixture targeted the real `c22` cell: top-border toggle wrote to `c13` instead of the spanning `c11`.
- Shared helper `getAdjacentTableCell` is the right seam; both `getTopTableCell` and `getLeftTableCell` now delegate there.

## Verification

- `bun test packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.integration.spec.tsx`
- `bun test packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.integration.spec.tsx packages/table/src/lib/queries/getTopTableCell.spec.tsx`
- `pnpm --filter @platejs/table test packages/table/src/lib/queries/getTopTableCell.spec.tsx packages/table/src/lib/queries/getSelectedCellsBorders.spec.tsx packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.integration.spec.tsx packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.spec.tsx`
- `pnpm install`
- `pnpm turbo build --filter=./packages/table`
- `pnpm turbo typecheck --filter=./packages/table`
- `pnpm lint:fix`

## Risks

- Table selection override can still interfere with path-targeted neighbor writes if the new regression accidentally broadens the selected-cell path set.
- Helper changes affect other query callers, so direct helper behavior should stay stable for non-merged tables.
