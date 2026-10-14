---
'plitejs': patch
---

Fix typing over a selection that spans editor roots throwing "Cannot resolve token range" when the selection starts at a text leaf it deletes whole, such as a bold word.
