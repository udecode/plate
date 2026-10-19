# DnD Coverage Pass

## Goal

Add a tiny, fast-lane-only non-React pass for the remaining worthwhile `@platejs/dnd` seams:

- `getNewDirection.ts`
- `selectBlocksBySelectionOrId.ts`

## Constraints

- No `/react` hooks or components.
- Do not reopen `onHoverNode`, `onDropNode`, `getBlocksWithId`, or the already-covered transform helpers.
- Keep this to a pure helper matrix plus one thin coordinator spec.

## Slice

1. Add a direct `getNewDirection` matrix for clear, unchanged, and changed directions.
2. Add `selectBlocksBySelectionOrId` coverage for:
   - no selection
   - target block already inside the selection
   - target block outside the selection
3. Stop unless a direct test exposes an actual bug.

## Notes

- The package already had decent transform coverage from the March 6 cleanup pass.
- The remaining value is just the tiny uncovered helper and routing logic.
