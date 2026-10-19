# 4930 Resolve PR feedback

## Goal

Resolve new actionable review feedback on `#4930` and close the corresponding PR thread without regressing the merged-cell border fix.

## Source Of Truth

- GitHub PR: `#4930` `fix(table): resolve merged border neighbors`
- Task type: PR feedback resolution
- Current actionable item count: 1

## Feedback

1. `packages/table/src/lib/queries/getAdjacentTableCell.ts:40`
   Reviewer concern: adjacent-cell lookups now linearly scan the full table on every top/left lookup, which can turn border operations into a quadratic hot path on large selections.

## Phases

1. Fetch feedback and classify actionable items. Status: done
2. Evaluate the performance concern against the current helper/caller graph. Status: done
3. Implement the valid fix and targeted coverage. Status: done
4. Run relevant verification. Status: done
5. Reply, resolve, and re-fetch PR feedback. Status: done

## Findings

- The unresolved thread is real and actionable; the other fetched comments are bot noise.
- `getAdjacentTableCell` currently calls `findCellByIndexes`, which flattens and scans the whole table each time.
- Callers like `getSelectedCellBorderTargets` and `isSelectedCellBorder` do these lookups inside per-cell loops, so the new merged-cell fix did introduce avoidable repeated table scans.

## Verification

- Targeted table tests covering border toggles and adjacent-cell lookup
- Package build/typecheck/lint sequence for `packages/table`
- `pnpm check`
- Re-fetch PR comments after replying/resolving
