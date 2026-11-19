---
'plitejs': patch
---

Fix Yjs peers that ended with different documents when one typed at the start of a code block while another changed the marks of the block's whole text, such as a suggestion's strike, accept or reject, or a color. The fix covers any element whose schema allows one text. The letter now reads with the element's marks, as a letter in its middle does. A sync room that already holds such a letter loads as one text and writes nothing. A peer on an older version in the same room reads the letters a newer peer types as the rest of the block, and still refuses a block where two peers' edits met at its start, as it does today.
