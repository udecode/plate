---
'plitejs': patch
---

Add `history({ newBatchDelay })` with a 500 ms default so one core history owner groups compatible edits across input sources. Explicit `merge()` and `newBatch()` decisions remain authoritative.
