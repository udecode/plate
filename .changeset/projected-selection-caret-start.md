---
'plitejs': patch
---

Fix typing, pasting or deleting over a selection that crosses a synced copy and starts at the end of a block. The text or the caret landed in another root, such as the synced copy's shared content, where every copy showed it. It now lands where the selection starts.
