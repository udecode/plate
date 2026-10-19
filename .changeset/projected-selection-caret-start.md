---
'plitejs': patch
---

Fix typing or pasting over a selection that crosses a synced copy from the end of the paragraph before it. The text landed in the synced copy's shared content, so it showed in every copy, and the paragraph kept its text. It now lands where the selection starts.
