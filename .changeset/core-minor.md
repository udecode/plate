---
'@udecode/plate-core': minor
---

- `getEditableRenderElement`: now uses plugins `injectChildComponent` to wrap `children` (lowest)
- `getEditableRenderElement`: now uses plugins `injectParentComponent` to wrap `component` (highest)
- new store selectors:
  - `getPlateEditorRef`
  - `getPlateEnabled`
  - `getPlateKeys`
  - `getPlatePlugins`
  - `getPlateSelection`
  - `getPlateValue`
  - `getPlateEventId`

Types:
- `PlatePlugin`, `PlatePluginEditor` new fields:
  - `injectChildComponent`: Inject child component around any node children.
  - `injectParentComponent`: Inject parent component around any node `component`.
  - `overrideProps` supports arrays.
- `SPRenderNodeProps` new fields:
  - `editor: PlateEditor`
  - `plugins: PlatePlugin`
- new types:
  - `PlateEditor<T = {}>`: default editor type used in Plate, assuming we all use history and react editors.
  - `InjectComponent`
```ts
 type InjectComponent = <T = AnyObject>(
  props: PlateRenderElementProps & T
) => RenderFunction<PlateRenderElementProps> | undefined; 
```
