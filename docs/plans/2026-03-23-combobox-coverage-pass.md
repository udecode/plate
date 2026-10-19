# Combobox Coverage Pass

## Goal

Add a surgical, fast-lane-only non-React pass for the remaining worthwhile `@platejs/combobox` seam:

- uncovered branches in `withTriggerCombobox.ts`

## Constraints

- Do not touch `/react`.
- Do not broaden `filterWords` just to chase coverage; it already has the right helper matrix.
- Keep this as one adjacent spec expansion, not a package rewrite.

## Slice

1. Add `withTriggerCombobox` coverage for:
   - regex trigger matching with the default combobox node path
   - Yjs `userId` propagation onto the inserted input node
   - `triggerQuery` veto fallback
   - `options.at` fallback
2. Stop unless direct tests expose a real bug.

## Notes

- Existing `withTriggerCombobox` coverage already covers array and string triggers plus previous-character matching.
- The remaining value is in the untested fallback and default-node branches.
