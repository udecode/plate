---
'plitejs': patch
---

- Fix Shift+ArrowUp and Shift+ArrowDown doing nothing right after a click when the caret's line move leaves a content root, such as the line below a synced block. The selection now extends into the neighboring root, as it does after an arrow key.
- Fix Backspace and Delete over a selection that starts right beside a content root and reaches into it. The key now deletes the selected text instead of moving the caret into that root.
- Fix ArrowLeft and ArrowRight over a selection that reaches into a content root. The arrow now collapses the selection to its start or end instead of moving the caret from where the selection began.
