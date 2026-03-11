---
'@platejs/slate': patch
---

- Fixed `withHistory(createEditor())` legacy method sync so `editor`, `editor.api`, and `editor.tf` all use the history-aware `apply`, `undo`, and `redo` methods.
