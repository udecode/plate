---
"@platejs/selection": patch
---

- Added `enableSelectAll` option to **BlockSelectionPlugin**. Set to `false` to disable the plugin's custom selectAll (Cmd+A) behavior and use the editor's default behavior instead.

  ```ts
  BlockSelectionPlugin.configure({
    options: { enableSelectAll: false },
  })
  ```
