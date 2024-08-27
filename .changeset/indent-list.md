---
'@udecode/plate-indent-list': major
---

- `createIndentListPlugin` -> `IndentListPlugin`
- Rename `injectIndentListComponent` to `renderIndentListBelowNodes`
- Replace `normalizeIndentList` with `withNormalizeIndentList`
- Replace `deleteBackwardIndentList` with `withDeleteBackwardIndentList`
- Replace `insertBreakIndentList` with `withInsertBreakIndentList`
- Remove types: `LiFC` (use `PlateRenderElementProps`), `MarkerFC` (use `Omit<PlateRenderElementProps, 'children'>`)
