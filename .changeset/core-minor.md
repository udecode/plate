---
'@udecode/plate-core': minor
---

- Added new editor DOM state fields under `editor.dom`:
  - `editor.dom.composing` - Whether the editor is composing text
  - `editor.dom.focused` - Whether the editor has focus
  - `editor.dom.readOnly` - Whether the editor is read-only. Passing `readOnly` prop to `PlateContent` will sync it to the store (`useEditorReadOnly`) and `editor.dom.readOnly`.
- Added `useEditorComposing` hook to subscribe to the editor's composing state outside `PlateContent`.
- `createPlateEditor`/`usePlateEditor` now accepts `readOnly` option to
  initialize the editor in read-only mode. For dynamic value, keep using
  `Plate.readOnly` prop.
- New plugin field: `editOnly?: boolean | object`. When a plugin is edit-only, Plate will disable some behaviors on read-only, and will enable again if it ever becomes editable:
  - Can be a boolean or object configuration
  - Object properties (`render`, `handlers`, `inject`, `normalizeInitialValue`) can be individually configured
  - All properties default to edit-only (true) except `normalizeInitialValue` which defaults to always active (false)
  - Example: `editOnly: { render: false, normalizeInitialValue: true }`
- New plugin field: `node.clearOnBoundary?: boolean`. When enabled for mark plugins (`node.isLeaf: true`), automatically clears the mark when typing at its boundary, allowing users to naturally "exit" the mark. Used by suggestion and comment marks.
- New plugin field: `render.as?: keyof HTMLElementTagNameMap`. Specifies the HTML tag name to use when rendering the node component. Only used when no custom `component` is provided for the plugin. Used by `PlateElement` for element nodes (default: 'div') and `PlateLeaf` for leaf nodes (default: 'span'). Example: `render: { as: 'h1' }` to render as an h1 tag.
- Plugin shortcuts can now automatically leverage existing plugin transforms, besides custom handlers.
