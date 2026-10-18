---
"@platejs/slate": patch
---

Bring the bundled history plugin up to date with slate-history 0.144.0:

- Add `editor.tf.setChildren(children)`, which applies an outside document through operations instead of replacing `editor.children`, so the selection, refs and history stay valid. Each call is its own undo step, separate from typing before and after it.
- Undo and redo now account for changes applied with `editor.tf.withoutSaving`. Saved steps are moved past each unsaved operation, so a block inserted above earlier typing, or text inserted before it, no longer makes undo remove the wrong characters. Steps whose content was removed, or that can no longer be applied, are dropped.
