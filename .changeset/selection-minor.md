---
"@platejs/selection": patch
---

- Added `disableSelectAll` option to **BlockSelectionPlugin**. Set to `true` to disable the plugin's custom selectAll (Cmd+A) behavior and use the editor's default behavior instead.

  ```ts
  BlockSelectionPlugin.configure({
    options: { disableSelectAll: true },
  })
  ```
