---
'@udecode/plate-core': minor
---

- Import the following from `@udecode/plate-core/react` (or `@udecode/plate/react`) instead of `slate-react`: `RenderPlaceholderProps`, `DefaultElement`, `DefaultPlaceholder`, `Editable`, `Slate`, `useComposing`, `useFocused`, `useReadOnly`, `useSelected`, `withReact`.
- `useNodePath` is now memoized: it will re-render only when the actual path changes (`PathApi.equals`). This includes `usePath` and `path` element prop.
- **New hook** `useElementSelector(([node, path]) => selector(node, path), deps, { equalityFn, key })`: re-render only when the selector result changes. **We highly recommend using this hook over useElement(key)** when subscribing to an ancestor element (e.g. table element from a cell element). For example, subscribe to the row size from a cell element without affecting the re-rendering of all row cells:

```tsx
const rowSize = useElementSelector(([node]) => node.size, [], {
  key: TableRowPlugin.key,
});
```

- Added a new plugin attribute: `SlatePlugin.node.isSelectable`. If set to `false`, the node cannot be selected.
- The plugin context `tf` and `api` now include `Editor` methods.
