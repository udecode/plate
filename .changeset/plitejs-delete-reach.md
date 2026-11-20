---
'plitejs': patch
---

Fix Backspace and Delete next to mentions, inline voids and inlines a caret may not stop in

- Word Backspace and word Delete count a mention or another inline void as one word. Beside one, they remove only that atom, with the spaces between it and the caret, instead of the atom and the word before it. They no longer delete past a word that touches an atom. At the start of a block whose previous block ends with an atom, word Backspace joins the blocks first, as it does without an atom.
- Backspace and Delete inside or at the edge of a writable inline with `selectable: false` remove one character, as they do in a link, instead of the text before the inline.
- Word Delete before a space and a mention at the end of a block removes both, as word Backspace after them does, also when the space is inside a link.
- Delete that stops before a read-only inline, deletes a selection that ends before one, or joins a block that starts with one leaves the caret before it, so the next Delete removes it and typing works.
- Backspace and Delete beside a block with `selectable: false` remove it whole even when it holds a mention.
