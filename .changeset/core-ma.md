---
'@udecode/plate-core': major
---

Breaking changes:

### `PlatePlugin`
- handlers (all fields starting by `on...`) are moved to `handlers` field.
```ts
// Before
onDrop: (editor) => () => editor.isDragging
  
// After
handlers: {
  onDrop: (editor) => () => editor.isDragging
}
```

-> `injectChildComponent`
```ts
// Before
injectChildComponent: getIndentListInjectComponent()

// After
inject: {
  belowComponent: injectIndentListComponent
}
```

-> `WithOverride` 

### Rename

- `getPlatePluginType` to `getPluginType`