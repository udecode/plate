---
'@udecode/plate-table': major
---

- `TablePlugin` merging is now enabled by default:
  - Rename `enableMerging` to `disableMerge`
  - Migration:
    - `enableMerging: true` -> remove the option
    - else -> `TablePlugin.configure({ options: { disableMerge: true } })`
- Rename `unmergeTableCells` to `splitTableCell`
- `useTableMergeState` return: rename `canUnmerge` to `canSplit`
