---
'plitejs': patch
---

- Fix a held or slow Shift+Arrow past an external text view, or any `selectionPolicy: 'model'` boundary, collapsing the selection to the start of the editor
- Fix typing, Enter, Delete, cut, paste and input-method text over such a selection replacing only its visible part
- Fix Android composition over such a selection changing text outside it
- Fix a plain Home or End on a selection across several lines moving both ends instead of collapsing at the line edge
- Fix a word move without Shift, such as Alt+ArrowLeft on macOS, leaving a selection expanded so the next letter replaced it; the selection now collapses one word from its moving end, as Chrome and Safari do
