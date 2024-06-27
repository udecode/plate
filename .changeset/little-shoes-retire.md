---
'@udecode/plate-table': minor
---

- Add `cellFactory` option to `TablePlugin`, called each time a cell is created. Default is `getEmptyCellNode`
- Remove `newCellChildren` option from `TablePlugin`, use `cellFactory` instead
