---
'@udecode/plate-core': minor
---

- `Plate` store: add `containerRef`. This is used by some plugins like `CursorOverlay`.
- Add `useEditorContainerRef` selector hook. You can pass the returned ref to your editor scroll container.
- `usePlateEditor` options: `value` can now be a callback function to get the value from the editor
- `editor.key` is now using `nanoid()`
- `editor.uid`: new property added by `Plate` to uniquely identify the editor. The difference with `editor.key` is that `uid` supports SSR hydration. This can be passed to the editor container as `id` prop.
- `render.aboveNodes` and `render.belowNodes` now support `useElement`
- `PlatePlugin.inject` new properties:
  - `excludePlugins?: string[]`
  - `excludeBelowPlugins?: string[]`
  - `maxLevel?: number`
  - `isLeaf?: boolean`
  - `isBlock?: boolean`
  - `isElement?: boolean`
- Add `getInjectMatch(editor, plugin)` to get a plugin inject match function.
