---
'platejs': patch
---

- Fix closing a one-character mark shorthand, such as `` `code` ``, `*italic*`, `~sub~` or `^sup^`, deleting the character after the caret. At the end of a paragraph, the shorthand pulled the next paragraph into the current one
