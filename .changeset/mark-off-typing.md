---
'plitejs': patch
---

- Fix text typed after turning a mark off with its shortcut keeping that mark
- Fix removing a mark at a collapsed selection also dropping the caret's other marks, such as italic when bold is turned off in bold italic text
- Fix text typed after a `**bold**` shorthand closes inside italic text losing the italic
