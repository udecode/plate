---
'plitejs': patch
---

Add `acquire(take)` to plugin activation for resources outside the editor, and `editor.destroy()` to end an editor

- Run each `take` after every plugin's `beforePublish` passes; a throwing `take` rolls the publication back
- Run the release `take` returns before the plugin's cleanups, on removal, replacement, rollback, unmount and `editor.destroy()`
- Throw from `update` and `install` after `editor.destroy()`
