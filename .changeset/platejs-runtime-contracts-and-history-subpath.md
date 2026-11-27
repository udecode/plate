---
'platejs': minor
---

Accept `clipboardFormatKey` on `platejs/react`'s `createEditor` and `useCreateEditor` via `DOMPlugin` store state and chained plugin `activate` stages, validate `editor.install`, `tx.plugins.reconfigure`, and slotted plugin inputs before any cleanup to reject Plate plugins with a `createEditor({ plugins })` and `store.set({ ... })` error, reject unsupported `schema` keys at runtime on both object and factory schemas, and drop `history`, `HistoryOptions`, `HistoryPlugin`, `HistoryPluginTypes`, and `HistoryPluginTypeProvider` from `platejs/history` in favor of `HistoryPlugin.configure(...)`.
