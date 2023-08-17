---
"@udecode/plate-table": patch
---

Modify insertTableRow and insertTableColumn to support header columns to preserve header columns if they exist + not blindly assume that it's a header row if the first cell in that row is a header cell.
