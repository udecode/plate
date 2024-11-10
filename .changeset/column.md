---
'@udecode/plate-layout': minor
---

- `ColumnPlugin`:
  - unwrap columns when there is only one column
  - remove column group when it has no column children
  - remove column when it has no children
- Add `insertColumnGroup`
- Add `toggleColumnGroup`
- Deprecate `insertEmptyColumn`, use `insertColumnGroup` instead
- Deprecate `toggleColumns`, use `toggleColumnGroup` instead
