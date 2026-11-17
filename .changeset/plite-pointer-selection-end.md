---
'plitejs': patch
---

- Add the `onPointerSelectionEnd(selection, context)` prop to `Editable`. It runs once per mouse selection that started in the Editable's own text, with the final range, after the browser and the editor finish writing that selection. That includes a press released outside the editor and a click inside selected text.
