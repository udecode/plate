---
'platejs': patch
---

Plate runs no shortcut for a key event that reports `isComposing` or carries keyCode `229`, the code WebKit sends for the Enter that confirms an IME composition. Plugin `onKeyDown` handlers still receive the event.
