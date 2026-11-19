---
'plitejs': patch
---

- Add `setEditorViewing(view, viewing)` and `read.view.isViewing()`. Viewing makes the editor root that shows a view read-only, board notes and other content roots included, while another `EditorRoot` of the same editor keeps its own Mode. Pass `setEditorViewing` a mounted view, such as the one `useEditorContext()` returns. It throws for the editor `createEditor` returns, which shows no editor root. `setEditorReadOnly` still locks only its one view.
- The authored Mode, whether Editing, Suggesting or a preview, now switches for the whole editor root at once. Switching it through a note switches the page and the header beside it too, and switching it through the page switches the note. A switch made while any view of the editor root composes a word waits until that word is done, so the word records under the Mode it began in.
- A content root, such as a board note, turns read-only as soon as the view that renders it locks, and turns writable again when that view unlocks. A note's own `readOnly` makes only the note read-only.
- Inside an editing area, `useRootEditor(root)` and `useCommand(command, { root })` follow the copy of that root the area shows, and the copy used last when it shows several, so they obey that area's lock when two editing areas of one editor root show the same note.
