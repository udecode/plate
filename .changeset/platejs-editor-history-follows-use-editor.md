---
'platejs': patch
---

Make `useEditorHistory()` with no `editor` or `root` pick what it undoes from the editor `useEditor()` returns. While that editor belongs to the `EditorRoot` around the hook, it runs through that editor root, as before, so it stays on while the caret is in a read-only nested editing area. Otherwise, such as under an `EditorProvider` given another editor, it undoes and redoes that editor, and it no longer needs an `EditorRoot` around it.
