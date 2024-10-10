---
'@udecode/plate-selection': minor
---

- Add `useBlockSelectionNodes`, `useBlockSelectionFragment`, `useBlockSelectionFragmentProp`
- `BlockSelectionPlugin`:
  - Make `setSelectedIds` options optional
  - Rename option `getSelectedBlocks` -> `getNodes`
  - Extend api: `duplicate`, `removeNodes`, `select`, `setNodes`, `setTexts`
- Rename `BlockContextMenuPlugin` to `BlockMenuPlugin`
- `BlockMenuPlugin` options:
  - `position`
  - `openId`
- `BlockMenuPlugin` api:
  - `hide`
  - `show`
  - `showContextMenu`
