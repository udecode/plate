---
'plitejs': patch
---

Fix pasting or dropping a block into a block of the same type whose element sets `slice: { preserveContext: true }`, such as a code block:

- The caret lands right after the pasted text instead of one character later.
- Moving text between two such blocks lands it instead of refusing the move as lossy, and copying no longer reports a loss.
- With Yjs, a collaborator's concurrent edit to the letter next to the pasted text is no longer lost.

Fix `createAuthoredPlugin` so that when one update pastes and its next step deletes, or types over, a range that starts at the pasted text, the deletion removes the pasted text. Before, pasting `XY` over `b` in `abc` and deleting `X` in the same update left `abc`, or refused the update, instead of giving `aYc`. A letter typed over such a range still lands after the pasted text when the paste starts with a link.
