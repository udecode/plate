---
'@udecode/plate': major
---

Breaking changes:

- all plugins options are now defined in the plugin itself
- plugins which now have nested plugins instead of array:
  - `createBasicElementsPlugin`
  - `createCodeBlockPlugin`
  - `createHeadingPlugin`
  - `createListPlugin`
  - `createTablePlugin`
  - `createBasicMarksPlugin`

Removed:
- `createEditorPlugins` for `createPlateEditor` (without components) and `createPlateEditorUI` (with Plate components)
- `createPlateOptions` for `createPlugins`
- all `DEFAULTS_X`: these are defined in the plugins
- all `getXDeserialize`: these are defined in the plugins
- all `WithXOptions` for extended plugins
- all `getXRenderElement`
- some plugin option types are removed for `PlatePlugin`

Renamed:
- `createPlateComponents` to `createPlateUI`
- all `getXY` handlers to `yX` (e.g. `getXOnKeyDown` to `onKeyDownX`)
- all `XPluginOptions` to `XPlugin`
- all `pluginKey` parameter to `key` except in components

Renamed types:
- `DecorateSearchHighlightOptions` to `FindReplacePlugin`

Updated deps:
- `"slate": "0.70.0"`
- `"slate-react": "0.70.1"`

Removed deps (merged to core):
- `plate-common`
- `plate-ast-serializer`
- `plate-html-serializer`
- `plate-serializer`