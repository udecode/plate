---
'platejs': patch
---

- Add `BaseFormattingPlugin` and `FormattingPlugin` with `update.clear({ at? })`, which removes text styles inside the selection and block styles (alignment, text indent, line height, indent) from blocks the selection fully covers, in one undo step. At a caret it clears only the styles the next typed text would get. `FormattingPlugin` binds `Mod+\`.
- Add the `formatting` plugin point, so a plugin can name the block properties clear formatting removes and the blocks that keep one. List items and their continuation paragraphs keep their indent.
