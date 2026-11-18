---
'plitejs': patch
---

Fix pasting or dropping a block into a block of the same type whose element sets `slice: { preserveContext: true }`, such as a code block:

- The caret lands right after the pasted text instead of one character later.
- Moving text between two such blocks lands it instead of refusing the move as lossy, and copying no longer reports a loss.
- With Yjs, a collaborator's concurrent edit to the letter next to the pasted text is no longer lost.
