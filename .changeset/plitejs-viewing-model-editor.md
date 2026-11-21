---
'plitejs': patch
---

Let `setEditorViewing()` take the editor `createEditor()` returns instead of throwing. That editor has no Mode apart from its lock, so Viewing locks it and leaving Viewing unlocks it, as `setEditorReadOnly()` does.
