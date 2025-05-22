---
'@udecode/plate-core': minor
---

- Added new editor DOM state fields under `editor.dom`:
  - `editor.dom.composing` - Whether the editor is composing text
  - `editor.dom.focused` - Whether the editor has focus
  - `editor.dom.readOnly` - Whether the editor is read-only
- Added `useEditorComposing` hook to subscribe to the editor's composing state outside `PlateContent`.
- `createPlateEditor`/`usePlateEditor` now accepts `readOnly` option to
  initialize the editor in read-only mode. For dynamic value, keep using
  `Plate.readOnly` prop.
- Added `editOnly` plugin field with granular control:
  - Can be a boolean or object configuration
  - Object properties (`render`, `handlers`, `inject`, `normalizeInitialValue`) can be individually configured
  - All properties default to edit-only (true) except `normalizeInitialValue` which defaults to always active (false)
  - Example: `editOnly: { render: false, normalizeInitialValue: true }`
