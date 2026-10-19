---
'plitejs': patch
---

- Fix Home and End moving the caret to another line when it is already at the start or end of its line, such as in an empty line. Control+A and Control+E on macOS get the same fix.
- Fix Shift+Home and Shift+End on macOS selecting to the start or end of the document instead of the line.
- Fix Home and End skipping past line breaks inside a block, such as in a code block or after Shift+Enter.
- Fix Home and End moving the caret into a synced block next to the line.
