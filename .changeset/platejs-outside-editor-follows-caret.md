---
'platejs': patch
---

Make `useEditor()` outside every editing area of an `EditorRoot`, such as in a fixed toolbar, return the editor of the root that holds the caret. A toolbar command such as `editor.plugin(BoldPlugin).update.toggle()` then changes a board's note while the caret is in it. With nothing selected it returns the editor of the primary root. `useEditorSelector`, `useEditorReadOnly`, `useEditorFocused` and the other hooks that read the editor `useEditor()` returns read the same editor. Inside an `EditorContainer`, these hooks read the `EditorContent` it holds that the user used last.

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
