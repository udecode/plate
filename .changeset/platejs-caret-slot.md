---
'platejs': patch
---

- Add a `caret` plugin slot, rendered after the Editable, for UI that follows the caret. Inside it, `useEditor()` and the `editableRef` prop answer for the view that holds the caret, such as a board note, so a floating toolbar in this slot follows the caret into the note.
- Remove `EditorSelectionView` and the `useSelectionView` hook from `platejs/react`.

**Migration:** Drop the `<EditorSelectionView>` wrapper. Move UI that used it inside an editing area, such as a floating toolbar, from `afterEditable` to the `caret` slot:

```tsx
const FloatingToolbarPlugin = definePlugin('floatingToolbar', {
  slots: { caret: () => <FloatingToolbar /> },
});
```
