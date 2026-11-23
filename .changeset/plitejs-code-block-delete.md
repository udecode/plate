---
'plitejs': patch
---

Fix a delete into a code block turning all of its lines into text of the block before it. Delete at the end of the block before joins only the first code line, and the code block keeps its other lines and its language. A range delete that covers the whole block before removes that block and keeps the code block whole.
