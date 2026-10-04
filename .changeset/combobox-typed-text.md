---
'platejs': patch
---

Autocomplete opens from the text the editor reports as typed instead of reading commit tags. Its composing preview leaves out non-editable and retained DOM.

- Pasted, dropped, yanked and replacement text no longer opens a popup, even when it holds a trigger
- A trigger at the start of a block reads the character before it in constant time instead of walking the document
