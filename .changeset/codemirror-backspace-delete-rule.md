---
'platejs': patch
---

Backspace at the start of a CodeMirror code block now runs the code block's delete rule, as the plain code block does. It leaves a non-empty block as it is and turns an empty one into a paragraph. Before, it merged the code into the block above or removed the empty block.
