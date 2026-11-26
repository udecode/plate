---
'plitejs': patch
---

Keep a block that a move in Editing carries, such as a paragraph dragged below the next one with the authored plugin, as the same block instead of a deleted copy and a new one. A range anchor inside it, such as a comment thread's text, stays on its text, and other authors' pending suggestions in the block keep their ids. A move in the same command as another edit records as before.
