---
'plitejs': patch
---

Fix a popover input rendered by an element losing focus on its first key. `Editable` ignores React events that bubble from a portal outside its DOM, including those reaching `on*` handlers passed to `Editable`.
