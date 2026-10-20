---
'plitejs': patch
---

Fix a refused key staying on screen when it was typed after the first character of a text, such as in a table cell or a code block while Suggesting. The editor now removes the character the browser typed, so the page matches the document and the caret stays where it was.
