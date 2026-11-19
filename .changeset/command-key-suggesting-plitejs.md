---
'plitejs': patch
---

- Fix `tx.key()` in a command's transaction extension returning a key that names no node after commit, for a block the command inserts or replaces, when a Suggesting view records the command or another author's change is pending.
- Fix a command's transaction extension that replaces a block and then inserts one before it: the `authored` plugin recorded the two blocks in the wrong order, and a Suggesting view beside another author's pending change threw.
