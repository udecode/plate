---
'plitejs': patch
---

Fix the caret and selection in mixed content and around marked controls

- Home and End stay on the text before or after a block nested in a text block.
- After a command removes a text element's only text, a typed letter lands in that element.
- A click after a double-click in decorated text, such as a lint underline, puts the caret at the clicked offset.
- A read-only editor keeps its selection painted after a command that re-renders it, such as Add comment.
- A triple-click selects only the clicked line in a code block or a block with line breaks, and only the clicked text beside a nested block.
- A backward selection stays backward after typing over it and undoing.
- The selection stays painted when focus moves to a marked control in Firefox or Safari.
