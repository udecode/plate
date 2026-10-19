# Findings

- Current `plite` has no `withDOM(...)` helper to restore into `withReact`; the real same-path recovery target is the Android pending-selection `insertText` compat branch.
- Legacy and current Android input manager code are materially the same, so manager existence alone does not replace the deleted `withReact` branch.
- Chunking is explicitly historical in `docs/plite/references/chunking-review.md`, so `getChunkSize`/`movedNodeKeys` are not live recovery targets here.
