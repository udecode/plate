---
'@udecode/plate-core': major
---

- Plugins without `key` will not be registered into the editor.
- Passing `readOnly` prop to `PlateContent` will sync it to the store (`useEditorReadOnly`) and `editor.dom.readOnly`.
- Passing `disabled: true` prop to `PlateContent` will set `readOnly` to `true`.
- New plugin field: `editOnly?: boolean | object`. When a plugin is edit-only, Plate will disable the following props on read-only, and will enable again if it ever becomes editable:
  - `render`
  - `handlers`
  - `normalizeInitialValue`
  - `inject.nodeProps`
- Moved editor state properties under `editor.dom`:
  - `currentKeyboardEvent` → `editor.dom.currentKeyboardEvent`
  - `prevSelection` → `editor.dom.prevSelection`
