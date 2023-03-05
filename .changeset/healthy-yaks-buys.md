---
"@udecode/plate-table": major
---

- `TablePlugin` option `disableUnsetSingleColSize` has been renamed and inverted into `enableUnsetSingleColSize`. New default is disabled. **Migration**: 
  - if using `disableUnsetSingleColSize: true`, the option can be removed
  - if using `disableUnsetSingleColSize: false`, use `enableUnsetSingleColSize: true`
- `getTableColumnIndex` second parameter type is now: `cellNode: TElement`