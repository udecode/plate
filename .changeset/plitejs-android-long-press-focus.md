---
'plitejs': patch
---

Fix the first long press on Android Chrome after the editor lost focus. It placed a caret instead of selecting the word, so the menu had no Copy. It now selects the word, as it does while the editor has focus.
