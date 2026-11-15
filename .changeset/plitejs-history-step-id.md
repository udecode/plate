---
'plitejs': patch
---

Add an `id` to each step `History.toJSON` saves, which `History.fromJSON` and `tx.history.restore` keep. History saved without ids still loads. `History.fromJSON` refuses a saved step whose `id` is empty or not a string, an `id` on a `fallback`, and two steps that share one `id`. The `HistoryBatchJSON.fallback` type no longer allows an `id` or a nested `fallback`.
