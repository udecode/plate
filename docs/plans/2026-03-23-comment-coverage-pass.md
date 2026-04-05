# Comment Coverage Pass

## Goal

Add a narrow, high-value non-React pass for `@platejs/comment` around the only worthwhile seams:

- `BaseCommentPlugin.ts`
- `getCommentKeys.ts`
- `getCommentCount.ts`

## Constraints

- Fast-lane only.
- No `/react`.
- Cover `withComment` through the plugin override, not a fake standalone unit test.
- Stop after the helper seam and the real plugin API/transform seam.

## Slice

1. Add tiny helper specs for comment key extraction and comment counting.
2. Add one `BaseCommentPlugin` contract spec for:
   - document-wide `node` / `nodes` search with `at: []`
   - `nodeId` behavior for normal and draft leaves
   - `setDraft`
   - `unsetMark` for overlapping and single comments
   - normalize cleanup of stray `comment: true`
3. Allow one runtime fix only if the direct tests expose an actual bug.

## Notes

- There were no existing package specs.
- `node()` and `nodes()` default to the current selection, so document-wide tests need `at: []`.
