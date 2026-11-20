---
'platejs': patch
---

Fix a hydration mismatch in a control that reads `useEditorFocused()` and hydrates after its editor took focus, such as a toolbar behind `Suspense` beside an `EditorContent` with `autoFocus`
