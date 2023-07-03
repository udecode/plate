---
'@udecode/plate-core': minor
---

- Add `editorRef` prop to Plate/PlateProvider
  - Works with `useRef<PlateEditor | null>` or `useState<PlateEditor | null>`
  - The editor instance is passed to the ref on mount and whenever the editor is reset
  - The ref is set to `null` when the editor unmounts
- Add various new methods to `editor`:
  - `editor.reset()` - Equivalent to `useResetPlateEditor()()`
  - `editor.redecorate()` - Equivalent to `useRedecorate()()`
  - `editor.plate.<key>.set(value)` - Sets the value of `<key>` in the Plate store. The following keys are currently supported:
    - readOnly
    - plugins
    - onChange
    - decorate
    - renderElement
    - renderLeaf
