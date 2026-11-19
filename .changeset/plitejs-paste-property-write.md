---
'plitejs': patch
---

Fix a property write in the same update as a paste, a document replace or a content completion, such as a plugin completing a pasted field's id, which landed on another node or was lost when the authored plugin recorded the update
