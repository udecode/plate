---
'plitejs': patch
---

Keep a block when a delete covers all of its text and nothing past it, such as Backspace after `Shift+Home` or `Cmd+Shift+Left` across a whole heading. The block stays empty with its type and the caret in it, so the next typed text goes into it. Before, the delete removed the block. When that block is the only one in the document, the delete still leaves one empty paragraph. Triple-click then Backspace still removes a top-level block. `fragment.delete` with an `at` range inside one block now deletes its text and keeps the block when its root holds another block; use `nodes.remove` to remove the block.
