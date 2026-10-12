---
'plitejs': patch
---

Fix a click outside the editor right after typing being ignored: `onBlur` now runs and the editor reports itself unfocused, so a menu that closes on blur closes.
