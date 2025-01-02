---
'@udecode/plate-core': minor
---

- `useNodePath` is now memoized: it will re-render only when the actual path changes (`Path.equals`). This includes `usePath` and `path` element prop.
- **New hook** `useElementSelector(([node, path]) => selector(node, path), deps, { equalityFn, key })`: re-render only when the selector result changes. **We highly recommend using this hook over useElement(key)** when subscribing to an ancestor element (e.g. table element from a cell element). For example, subscribe to the row size from a cell element without affecting the re-rendering of all row cells:

```tsx
const rowSize = useElementSelector(([node]) => node.size, [], {
  key: TableRowPlugin.key,
});
```

- New plugin attribute: `SlatePlugin.node.isSelectable`. Set it as false to prevent the node from being selected.
- Plugin context `tf` and `api` now have `TEditor` methods.
