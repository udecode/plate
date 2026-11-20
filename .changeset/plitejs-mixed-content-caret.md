---
'plitejs': patch
---

Fix the caret and selection in mixed content and around marked controls:

- Home and End stay on the text before or after a block nested in a text block, instead of moving past the nested block.
- After a command removes a text element's only text, a typed letter lands in that element, not in the block before it.
- A click after a double-click in decorated text, such as a lint underline, puts the caret at the clicked offset.
- A read-only editor keeps its pointer selection painted after a command that re-renders it, such as Add comment.
- A triple-click selects only the clicked line in a code block or any block whose text holds a line break, and only the clicked text beside a nested block.
- A backward selection stays backward after typing over it and undoing, so Shift+ArrowLeft grows it.
- The selection stays painted when Tab moves focus to a marked control in Firefox, and when a click on a marked control in Safari leaves focus nowhere.
