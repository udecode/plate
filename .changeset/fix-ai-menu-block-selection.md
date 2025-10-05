---
"@platejs/selection": patch
---

Fix AI menu not opening when blocks are selected. The `onKeyDownSelecting` callback now receives the editor instance as its first parameter, allowing proper handling of keyboard shortcuts during block selection.