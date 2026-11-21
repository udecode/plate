---
'plitejs': patch
---

Fix ArrowDown and ArrowUp in Firefox into a block that scrolls, such as a code block with `overflow-x: auto`, which put the caret at the end of the block instead of on its nearest line
