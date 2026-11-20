---
'plitejs': patch
---

Fix a closed quote pasted at a caret inside a quoted paragraph, which lost the text after the caret. The quote's first paragraph joins the text before the caret. Its last block joins the text after the caret when it has the same type as the block the caret is in, and otherwise that text stays in a block of its own. A paste over a range that ends inside a link joins the same way, with the block that holds the link. A table pasted at a caret inside a table cell now keeps the cell's text after the caret too.
