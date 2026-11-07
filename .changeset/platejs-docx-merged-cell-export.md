---
'platejs': patch
---

Fix `exportDocx` writing merged table cells in the wrong columns. A row span now keeps its column on every row it covers, and importing the file merges the same cells.
