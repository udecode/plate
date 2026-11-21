---
'platejs': major
---

Remove `EditorSelectionView` and the `useSelectionView` hook from `platejs/react`. Outside every editing area of an `EditorRoot`, `useEditor()` already returns the editor of the root that holds the caret, and a plugin's `caret` slot follows the caret into a board note inside its editing area.

**Migration:** Drop the `<EditorSelectionView>` wrapper. Move UI that used it inside an editing area, such as a floating toolbar, from `afterEditable` to the `caret` slot:

```tsx
const FloatingToolbarPlugin = definePlugin('floatingToolbar', {
  slots: { caret: () => <FloatingToolbar /> },
});
```
