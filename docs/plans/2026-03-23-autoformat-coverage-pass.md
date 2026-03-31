# Autoformat Coverage Pass

## Goal

Add a surgical, fast-lane-only coverage pass for `@platejs/autoformat` focused on the last worthwhile non-rule seams:

- `AutoformatPlugin.ts`
- `autoformatBlock.ts`
- `isPreviousCharacterEmpty.ts`

## Constraints

- No `/react`.
- No rule-table coverage.
- Keep the slice in normal `*.spec.ts[x]`.
- Prefer real editor behavior for plugin contracts and tiny stubs for pure transform helpers.

## Slice

1. Add a direct `AutoformatPlugin` spec for query veto, `insertTrigger`, and undo-on-delete array-match restore.
2. Deepen `autoformatBlock.spec.ts` for `triggerAtBlockStart: false`, `allowSameTypeAbove`, and single-character match safety.
3. Add one tiny `isPreviousCharacterEmpty` edge for empty-string ranges.
4. Stop unless a direct test exposes a real bug.

## Notes

- Existing `withAutoformat` coverage already exercises most end-to-end mark and text flows.
- The remaining value is in the plugin override seam and a few pure `autoformatBlock` branches.
