---
'plitejs': patch
---

Fix where the caret and the text land after Delete, typing and cut

- Delete in an empty paragraph after another block puts the caret at the start of the next block, also inside a list or a quote, instead of at the end of the block above.
- Typing or Delete over a range that starts at a formatted word inside a paragraph and ends at the start of a later paragraph no longer leaves an empty paragraph above the result.
- In Firefox, typing over a selection that ends at the end of a paragraph no longer joins the next block into the first paragraph.
- Typing over a range that ends inside a chip or an image replaces the range and the void, as Delete then typing does, instead of doing nothing.
- Cut in the main document over a range from a paragraph to the start of a later paragraph copies only what it removes, and leaves the caret where the range started, so pasting it back restores the document.
- Delete or typing over a range that starts or ends at an image, a read-only block or an atom inside a quote removes only what the range covers, and Delete in an empty paragraph inside a quote removes only that paragraph.
