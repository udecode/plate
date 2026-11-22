---
'plitejs': patch
---

Fix selections across blocks a virtualized editor has not mounted, and arrow keys beside hidden content

- A Shift-click or Shift+ArrowDown range that reaches blocks the viewport has not mounted stays selected, and the next letter replaces it instead of landing at the start of the editor.
- Undo that restores a range far above the viewport scrolls to its start and shows it selected.
- ArrowUp and ArrowDown after a click move into content an app hides, such as a collapsed accordion, the same way they do after a keyboard move, instead of skipping past it.
