---
'plitejs': patch
---

- Fix Ctrl+Home and Ctrl+End, with or without Shift, in a content root nested inside another. The caret or selection now reaches the start or end of the document instead of throwing or placing no caret.
- Fix Ctrl+Home and Ctrl+End when the document starts or ends with a content root. The caret now lands in that root's first or last block instead of on its owner block, which shows no text.
- Fix Shift+Arrow keys throwing when a selection leaves a content root nested inside another.
