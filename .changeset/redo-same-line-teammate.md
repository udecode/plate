---
'plitejs': patch
---

- Fix undo and redo when a teammate added a line where the step adds one and either side also made another edit. The step now adds the same line only once and keeps its other edits, and it keeps both lines when they differ. An empty line a Yjs teammate adds can still appear twice.
