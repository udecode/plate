---
'plitejs': patch
---

Fix `tx.history.restore` while suggestions are on. A restore no longer throws a change-length error, and an update whose only call is `tx.history.restore` now replaces the history. The restore now checks the history against the document the update commits, so a restore beside a write the history does not match throws. A plugin update method whose only write is an annotation now commits that annotation, and repeated calls combine it.
