---
'plitejs': patch
---

- Fix `text.delete` throwing when a range runs from the start of a block into a link in a later block
- Fix the caret landing in the previous block, or inside a later link, after a cross-block delete that empties or removes the block it starts in; it now lands where the delete ended
