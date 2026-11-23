---
'plitejs': patch
---

Fix a delete into a code block turning all of its lines into text of the block before it

- Delete at the end of the block before a code block, or any block whose schema holds one text, joins only the first code line to that block. A range delete from that block into the code joins only what is left of the line the range ends in. The code block keeps the lines after it and its language, as a code block with one element per line does. A range delete that covers the whole block before removes that block and keeps the code block whole.
