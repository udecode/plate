---
'plitejs': patch
---

- Copy one line per block as plain text, so nested blocks add no blank lines and the blocks inside a collapsed section no longer run together
- Copy an empty block as one blank line instead of two
- Copy a line break at the end of a block once instead of twice
- Copy a block void as one block, without a blank line after the text it shows
- Leave text the renderer draws outside the document, such as section labels, button text and nested editors, out of copied plain text
- Remove the editor's internal `data-editor-*` attributes from copied HTML, except the fragment attributes that paste reads
- Keep line breaks in the HTML copied for a selection the page does not fully show, such as one that runs through a collapsed section, and for a selected void
