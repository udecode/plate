---
'platejs': patch
---

- Fix `useEditor()`, `useOptionalEditor()` and shared UI under `EditorController` staying on the last focused content after the user presses a read-only `EditorContent`. They follow the content the user focused or pressed most recently, as `useRootEditor()` does, so a shared toolbar's Undo turns off after a press on a read-only content
- Fix the same hooks moving to the first mounted content when the content used last unmounts. They follow the content used before it, or the first mounted content of a `primary` editor when no other content was used
- Fix the same hooks staying on a content after a `slots.wrapContent` wrapper removes its editor area, which kept a shared toolbar's Undo off
