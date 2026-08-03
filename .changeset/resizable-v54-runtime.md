---
"@platejs/resizable": major
---

Move resize components to the current editor hooks and feature-owned commit
APIs, add keyboard slider behavior, and restrict relative resize lengths to
percentage strings. Resize-handle consumers receive live pointer and keyboard
callbacks from their nearest resizable owner.

**Migration:** Remove the unused `readOnly` resizable option and `isTouchEvent` helper, and use percentage strings for relative lengths. `resizeLengthClamp` returns the widened `number` or percentage-string kind instead of the input literal.
