---
'plitejs': major
---

Keep one-or-many `NodeSelection` model-only while the editable retains focus and the native browser selection stays empty. `useEditorSelection()` returns the active plain `Range | null` without exposing the tagged semantic selection payload. `useElementSelected({ mode: 'object' })` is true only for the element an object selection holds, and `useElementSelected({ mode: 'text' })` only for a text selection that touches the element. Clicking an object node makes an object selection; plain `←` and `→` on a block selection move the caret out of it.
