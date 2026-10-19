---
'plitejs': patch
---

Add `editor.api.react.settleInput()` to commit pending native input, such as a finished composition, into the model before reading it; it returns `false` while a composition is still active.
