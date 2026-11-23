---
'plitejs': patch
---

Fix selections across blocks a virtualized editor has not mounted, and arrow keys beside hidden content

- A Shift-click or Shift+ArrowDown range that reaches unmounted blocks stays selected, and the next letter replaces it.
- Undo that restores a range far above the viewport scrolls to it and shows it selected.
- ArrowUp and ArrowDown after a click move into content an app hides, such as a collapsed accordion, instead of skipping past it.
