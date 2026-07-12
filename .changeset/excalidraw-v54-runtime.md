---
"@platejs/excalidraw": major
---

Move the Excalidraw plugin and insertion helper to the Base editor transaction API and load the Excalidraw component once per mount

**Migration:** Replace direct `insertExcalidraw(editor, props, options)` calls with `editor.update.excalidraw.insert(props, options)`.
