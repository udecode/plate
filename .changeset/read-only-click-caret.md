---
'plitejs': patch
---

Fix a click or tap in a read-only editor losing its caret when the editor re-rendered before the browser reported the new selection, such as when a component reads `useEditorFocused`. In Firefox the editor stayed focused with no selection, so Shift+Arrow selected nothing.
