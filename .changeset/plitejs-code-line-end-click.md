---
'plitejs': patch
---

Fix a click right of a code line putting the caret at another line's end or at the block's start. A click past a line's end now puts the caret at that line's end, and a click on an empty line puts it on that line.
