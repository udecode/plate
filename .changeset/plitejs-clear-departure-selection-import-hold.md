---
'plitejs': patch
---

- Clear a root's pending DOM selection import hold when selection leaves that root or the root blurs, so returning focus within the selectionchange throttle window still exports the root's saved caret to the DOM
