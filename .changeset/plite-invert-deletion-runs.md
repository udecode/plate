---
'plitejs': patch
---

- Speed up deleting many adjacent blocks in one update: building its undo step now takes time linear in the removed content instead of quadratic
