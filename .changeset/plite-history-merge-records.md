---
'plitejs': patch
---

- Let `tx.history.merge()` join an update that changes no document root, such as one that writes only records, to a previous update that also changes none, so one undo takes back both.
