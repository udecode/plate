---
'plitejs': patch
---

Fix a redo whose owner answers late: it keeps its place in undo when a skipped edit removed the step below it, it leaves undo when the undo limit would have dropped it, and a redo whose every effect a skipped edit removed no longer leaves an undo step that does nothing
