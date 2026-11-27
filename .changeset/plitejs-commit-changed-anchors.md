---
'plitejs': patch
---

Add `commit.changed.anchors()` and the `ReadonlyAnchor` type so commit listeners can read the live anchors whose stored value a commit changed without polling every anchor, and restore history anchors immediately on undo and redo commits.
