---
'platejs': patch
---

Fix `EditorRoot`'s `readOnly` letting a write through an `EditorContent` in the render that sets it. A write from a removed control's cleanup in that render now throws, also when the render removes, hides or suspends the `EditorContent`. An `EditorContent` with `readOnly={false}` stays writable.
