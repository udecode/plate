---
'plitejs': patch
---

Fix pasting blocks at a caret inside a link. A quote pasted in the middle of a link in a quoted paragraph split the quote in three. Now its paragraphs land in that quote, around the two halves of the link. Blocks pasted at a link's inside start or end joined into one line or left an empty half of the link. Now they land just outside the link, as a paste right before or after the link does.
