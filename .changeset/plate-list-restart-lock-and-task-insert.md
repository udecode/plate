---
'platejs': patch
---

- Refuse `BaseListPlugin.update.restart()` on non-writable (locked) blocks and initialize `checked: false` when inserting or upserting a task list item.
