---
'@udecode/plate-selection': minor
---

- New plugin `CursorOverlayPlugin`
- `useCursorOverlay` now supports collapsed selection using `minSelectionWidth = 1`
- selectable depends now on `data-block-id` instead of `data-key`
- Fix a bug when deleting selected blocks without id
- Fix `useBlockSelected`: use `id` parameter if defined
