---
'@udecode/plate-core': minor
---

- new dep + re-exports `"react-hotkeys-hook": "^3.4.6"`
- new core plugin `createSelectionPlugin`
  - stores the previous selection in `editor.prevSelection` (default is `null`)
  - enabled by default, can be disabled using `selection` key
- new `PlatePlugin` props:
  - `renderAboveEditable`: Render a component above `Editable`.
  - `renderAfterEditable`: Render a component after `Editable`.
  - `renderBeforeEditable`: Render a component before `Editable`.
- `Plate`:
  - pipes plugins `renderAboveEditable` and render the result above `Editable`
  - pipes plugins `renderAfterEditable` and render the result after `Editable`, before `children`
  - pipes plugins `renderBeforeEditable` and render the result before `Editable`, after `firstChildren`
- new hooks
  - `useOnClickOutside`