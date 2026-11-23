---
'platejs': patch
---

- Make `useEditor()` outside every editing area of an `EditorRoot`, such as in a fixed toolbar, return the editor of the root that holds the caret. A toolbar command such as `editor.plugin(BoldPlugin).update.toggle()` then changes a board's note while the caret is in it. With nothing selected it returns the editor of the primary root. `useEditorSelector`, `useEditorReadOnly`, `useEditorFocused` and the other hooks that read that editor follow it too, and a component whose selected value stays equal no longer renders when the caret moves.
- Make `useEditorHistory()` with no `editor` or `root` undo and redo the editor `useEditor()` returns. It no longer needs an `EditorRoot` around it.
- Make `useModelEditor()` under `EditorController` return the document editor of the `EditorRoot` used last, where it threw.

**Migration:** A lock set through the editor that `useEditor()` returns outside every editing area refuses the commands sent through that editor and no longer locks an `EditorContent`. To lock one `EditorContent`, call `useEditor()` inside its `EditorContainer`:

```tsx
function Lock() {
  const editor = useEditor();

  return <button onClick={() => setEditorReadOnly(editor, true)}>Lock</button>;
}

<EditorRoot editor={editor}>
  <EditorContainer>
    <Lock />
    <EditorContent />
  </EditorContainer>
</EditorRoot>;
```
