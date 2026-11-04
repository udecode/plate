---
'plitejs': patch
---

Fix typing after a mark shortcut such as Cmd+B in an element whose schema allows only one text, such as a code block, which threw a schema error and lost the typed letter. When the element has no room for a separately marked text, the letter now goes into the text at the caret without the pending marks.
