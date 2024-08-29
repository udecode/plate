---
'@udecode/plate-list': major
---

- `createListPlugin` -> `ListPlugin`
- NEW `BulletedListPlugin`
- NEW `NumberedListPlugin`
- NEW `ListItemPlugin`
- NEW `ListItemContentPlugin`
- NEW list transforms: `toggle.list`, `toggle.bulletedList`, `toggle.numberedList`
- Remove type utils: `getListItemType`, `getUnorderedListType`, `getOrderedListType`, `getListItemContentType`
- Replace `insertBreakList(editor)` with `withInsertBreakList(ctx)`
- Replace `insertFragmentList(editor)` with `withInsertFragmentList(ctx)`
- Replace `insertBreakTodoList(editor)` with `withInsertBreakTodoList(ctx)`
- Replace `deleteForwardList(editor)` with `withdeleteForwardList(ctx)`
- Replace `deleteBackwardList(editor)` with `withdeleteBackwardList(ctx)`
- Move list options from `ul` and `ol` to `list` plugin
- `toggleList` options are now `{ type: string }`
