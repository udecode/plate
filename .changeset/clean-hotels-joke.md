---
'@udecode/plate-core': minor
---

- Add `editorRef` prop to Plate/PlateProvider
  - Works with `useRef<PlateEditor | null>` or `useState<PlateEdtior | null>`
  - The editor instance is passed to the ref on mount and whenever the editor
    is reset
  - The ref is set to `null` when the editor unmounts
