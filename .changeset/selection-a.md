---
'@udecode/plate-selection': major
---

- `createSelectionPlugin` -> `BlockSelectionPlugin`
- NEW `BlockContextMenuPlugin`, used by `BlockSelectionPlugin` so you don't need to add it manually
- Remove `isNodeBlockSelected`, `isBlockSelected`, `hasBlockSelected`, `useBlockSelected`, use `editor.getOptions(BlockSelectionPlugin)` or `editor.useOptions(BlockSelectionPlugin)` instead
- Remove `addSelectedRow`, use `editor.api.blockSelection.addSelectedRow` instead
- Remove `withSelection`
- Rename `onCloseBlockSelection` to `onChangeBlockSelection`
- Move `blockSelectionStore` to `BlockSelectionPlugin`
- Move `blockContextMenuStore` to `BlockContextMenuPlugin`
- Remove `@viselect/vanilla` package and fork to local, fix scroll bugs.
- Remove `BlockStartArea` and `BlockSelectionArea` components using areaOption instead.
