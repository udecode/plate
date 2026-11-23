---
'plitejs': patch
---

Fix Backspace and Delete next to mentions, inline voids and inlines a caret may not stop in

- Word Backspace and word Delete count a mention or another inline void as one word, and remove only that atom with the spaces between it and the caret.
- Backspace and Delete inside or at the edge of a writable inline with `selectable: false` remove one character, as they do in a link.
- Delete that stops before a read-only inline leaves the caret before it, so the next Delete removes it and typing works.
- Backspace and Delete beside a block with `selectable: false` remove it whole even when it holds a mention.
