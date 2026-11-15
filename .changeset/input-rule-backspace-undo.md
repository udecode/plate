---
'platejs': patch
---

Backspace right after a typed key fires an input rule now takes the rule back and leaves the key as plain text. Typing `1/4` and pressing Backspace gives `1/4` instead of deleting the `¼`, and `## ` then Backspace gives a paragraph that reads `## `. Any other edit or caret move in between makes Backspace delete as usual.
