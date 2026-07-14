---
"@platejs/code-drawing": major
---

Insert code drawings through `editor.update.code_drawing.insert(props, options)` and append when no block target is available.

**Migration:** Replace direct `insertCodeDrawing` calls with the installed plugin command. Pass `at` to target the block after which the drawing is inserted.
