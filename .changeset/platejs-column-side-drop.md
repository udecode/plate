---
'platejs': patch
---

- Drop a block on another block's inline-end edge, the right edge in left-to-right text, to place both in a new column group, or beside a block in a column to add a column, up to five, when `ColumnPlugin` is installed.
- Keep column proportions when a column is added: a group over 100% scales back instead of shrinking every column by the same amount.
- Fix `setColumns` throwing a correction-cycle error at 6, 7, 11 and 12 columns.
- Keep footnote definitions at the root when a block is dropped beside them or they are dropped beside a block.
