---
'plitejs': patch
---

- Fix Home and End moving the caret to another line when it is already at the start or end of its line, such as in an empty line. Control+A and Control+E on macOS get the same fix.
