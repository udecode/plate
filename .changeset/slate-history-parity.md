---
"@platejs/slate": patch
---

Bring the bundled history plugin up to date with slate-history:

- `withoutSaving`, `withoutMerging`, `withMerging` and `withNewBatch` restore their flags when the callback throws, so one failed transform no longer stops history from recording.
- A nested `withNewBatch` keeps the enclosing batch's split.
- An edit no longer merges into the previous undo step just because another operation, such as a selection change, ran earlier in the same tick.
- Inside `withoutMerging`, a transform's normalization stays in the same undo step as the transform, so undoing it no longer leaves an unnormalized document behind.

`editor.hasRange` and `editor.api.hasRange` now share one implementation built on slate's `hasRange`, and still return `false` for a missing range.
