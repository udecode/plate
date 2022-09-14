---
"@udecode/plate-core": major
---

- `usePlateStore`:
  - Plate no longer has a global store containing all the editor states (zustand). Each editor store is now defined in a React context tree ([jotai](https://github.com/pmndrs/jotai)). If you need to access all the editor states at once (as you could do before), you'll need to build that layer yourself.
  - Plate store is now accessible only below `PlateProvider` or `Plate` (provider-less mode). It means it's no longer accessible outside of a Plate React tree. If you have such use-case, you'll need to build your own layer to share the state between your components. 
  - You can nest many `PlateProvider` with different scopes (`id` prop). Default scope is `PLATE_SCOPE`
  - Hook usage: 
    - `const value = usePlateSelectors(id).value()`
    - `const setValue = usePlateActions(id).value()`
    - `const [value, setValue] = usePlateStates(id).value()`
  - removed from the store:
    - `editableProps`, use the props instead 
    - `enabled`, use conditional rendering instead
    - `isReady`, no point anymore as it's now directly ready
  - `useEventPlateId` is still used to get the last focused editor id.
- `Plate`
  - if rendered below `PlateProvider`, it will render `PlateSlate > PlateEditable`
  - if rendered without `PlateProvider`, it will render `PlateProvider > PlateSlate > PlateEditable`
  - default `id` is no longer `main`, it's now `PLATE_SCOPE`
- `PlateProvider`
  - Each provider has an optional `scope`, so you can have multiple providers in the same React tree and use the plate hooks with the corresponding `scope`.
  - Plate effects are now run in `PlateProvider`
    - `initialValue, value, editor, normalizeInitialValue, normalizeEditor` are no longer defined in an effect (SSR support)
  - Props:
    - now extends the previous `Plate` props
    - if using `PlateProvider`, set the provider props on it instead of `Plate`. `Plate` would only need `editableProps` and `PlateEditableExtendedProps`
    - if not using it, set the provider props on `Plate`
```tsx
// Before
<PlateProvider>
  <Toolbar>
    <AlignToolbarButtons />
  </Toolbar>

  <Plate<MyValue> editableProps={editableProps} <MyValue> initialValue={alignValue} plugins={plugins} />
</PlateProvider>

// After
<PlateProvider<MyValue> initialValue={alignValue} plugins={plugins}>
  <Toolbar>
    <AlignToolbarButtons />
  </Toolbar>

  <Plate<MyValue> editableProps={editableProps} />
</PlateProvider>

// After (provider-less mode)
<Plate<MyValue> editableProps={editableProps} initialValue={alignValue} plugins={plugins} />
```
- types:
  - store `editor` is no longer nullable
  - store `value` is no longer nullable
  - `id` type is now `PlateId`
- renamed:
  - `SCOPE_PLATE` to `PLATE_SCOPE`
  - `getEventEditorId` to `getEventPlateId`
  - `getPlateActions().resetEditor` to `useResetPlateEditor()`
- removed:
  - `plateIdAtom`
  - `usePlateId` for `usePlateSelectors().id()`
  - `EditablePlugins` for `PlateEditable`
  - `SlateChildren`
  - `PlateEventProvider` for `PlateProvider`
  - `withPlateEventProvider` for `withPlateProvider`
  - `usePlate`
  - `usePlatesStoreEffect`
  - `useEventEditorId` for `useEventPlateId`
  - `platesStore, platesActions, platesSelectors, usePlatesSelectors`
  - `getPlateActions` for `usePlateActions`
  - `getPlateSelectors` for `usePlateSelectors`
  - `getPlateEditorRef` for `usePlateEditorRef`
  - `getPlateStore, usePlateStore`
  - `EditorId` for `PlateId`
