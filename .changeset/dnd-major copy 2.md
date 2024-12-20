---
'@udecode/plate-layout': patch
---

- Add `setColumns`: set any number of columns of any size to a column group. Decreasing the number of columns will move the removed columns' content to the last remaining column.
- `toggleColumnGroup`: now uses `setColumns` if we're already in a column group.
- Remove `layout` prop from `column_group` nodes. We're now only relying on `column` `width` prop. You can unset `layout` prop or just leave it as it is since it's not read anymore.
- `ColumnPlugin`: Added width normalization ensuring column widths always sum to 100% by automatically adjusting widths when columns are added or removed. If the sum of widths is not 100%, the difference is distributed evenly across all columns.
