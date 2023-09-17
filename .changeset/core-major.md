---
'@udecode/plate-core': major
---

- [**Breaking**] Rename `Plate` to `PlateContent`.
- [**Breaking**] Rename `PlateProvider` to `Plate`.
- [**Breaking**] Rendering `PlateContent` is now required in `Plate`. This allows you to choose where to render the editor next to other components like toolbar. Example:

```tsx
// Before
<Plate />
// or
<PlateProvider>
  <Plate />
</PlateProvider>

// After
<Plate>
  <PlateContent />
</Plate>
```

- [**Breaking**] Remove provider props such as `plugins` from `PlateContent`. These props should be passed to `Plate`.
- [**Breaking**] Remove `editableProps` prop from `PlateContent`. Move these as`PlateContent` props.
- [**Breaking**] Remove `children` prop from `PlateContent`. Render instead these components after `PlateContent`.
- [**Breaking**] Remove `firstChildren` prop from `PlateContent`. Render instead these components before `PlateContent`.
- [**Breaking**] Remove `editableRef` prop from `PlateContent`. Use `ref` instead.
- [**Breaking**] Remove `withPlateProvider`.
- [**Breaking**] Rename `usePlate` to `usePlateActions`.
- [**Breaking**] Rename `usePlateEditorRef` to `useEditorRef`.
- [**Breaking**] Rename `usePlateEditorState` to `useEditorState`.
- [**Breaking**] Rename `usePlateReadOnly` to `useEditorReadOnly`. This hook can be used below `Plate` while `useReadOnly` can only be used in node components.
- [**Breaking**] Rename `usePlateSelection` to `useEditorSelection`.
- [**Breaking**] Rename store attributes `keyDecorate`, `keyEditor` and `keySelection` to `versionDecorate`, `versionEditor` and `versionSelection`. These are now numbers incremented on each change.
- [**Breaking**] Rename store attribute `isRendered` to `isMounted`.
- Add `maxLength` prop to `Plate`. Specifies the maximum number of characters allowed in the editor. This is a new core plugin (`createLengthPlugin`).
- Add `useEditorVersion` hook. Version incremented on each editor change.
- Add `useSelectionVersion` hook. Version incremented on each selection change.
- Fix `editor.reset` should now reset the editor without mutating the ref so it does not remount `PlateContent`. Default is using `resetEditor`. If you need to replace the editor ref, use `useReplaceEditor`.
- [Type] Remove generic from `TEditableProps`, `RenderElementFn`
