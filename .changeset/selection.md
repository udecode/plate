---
'@udecode/plate-selection': major
---

The following changes were made to improve performance:

- Removed `useHooksBlockSelection` in favor of `BlockSelectionAfterEditable`
- Removed `slate-selected` class from `BlockSelectable`. You can do it on your components using `useBlockSelected()` instead, or by using our new `block-selection.tsx` component.
- Introduced `useBlockSelectableStore` for managing selectable state.
