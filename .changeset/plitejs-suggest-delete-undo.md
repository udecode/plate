---
'plitejs': patch
---

Fix undo after a run of Backspace or Delete in Suggesting mode, which took back one struck character per step. The run now undoes in one step, as it does in Editing.
