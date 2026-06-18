---
"slate-history": major
---

Replace `withHistory` and `HistoryEditor` with the Slate v2 `history()` extension.

**Migration:** Install `history()` in `createEditor({ extensions })`, read undo/redo stacks through `state.history`, write history commands through `tx.history`, use `editor.api.history` for batching controls, and import from the package root export.
