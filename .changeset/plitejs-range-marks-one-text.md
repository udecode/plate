---
'plitejs': patch
---

Fix a mark shortcut such as Cmd+B on part of the text in an element whose schema allows only one text, such as a code block, which threw a schema error. Adding or removing a mark on a range now leaves out a text that the range covers only in part when that text is its element's only allowed child, and still marks the rest of the range. A range that covers the whole text marks it as before. A `setNodes` split treats such a text the same way and never splits that text alone. When the match also takes an ancestor of the text in `all` or `highest` mode, it splits that ancestor instead. In `lowest` mode it splits nothing at that edge.
