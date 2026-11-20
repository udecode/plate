---
'plitejs': patch
---

Give each pasted element a new value for every unique property that a property's `references` names, and point each copied reference at the copied element. A copy keeps such a value, so a paste through the clipboard, a drag copy and a block-selection copy pair the copied elements. A reference whose target the paste drops, such as at a length limit, keeps naming the original.
