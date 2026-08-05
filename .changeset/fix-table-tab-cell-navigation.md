---
"@platejs/table": patch
"@platejs/indent": patch
---

Fix `Tab` and `Shift+Tab` leaving table cells instead of navigating between cells. Registered explicit `tab` and `untab` shortcuts on `BaseTablePlugin` with high priority, added automatic row expansion on `Tab` in the last table cell, and guarded `BaseIndentPlugin` from intercepting `Tab` inside table cells.
