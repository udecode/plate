---
"@platejs/code-drawing": major
---

Insert code drawings through `editor.update.codeDrawing.insert(props, options)`,
append when no block target is available, and register code-drawing properties
in compiled schemas.

**Migration:** Replace direct `insertCodeDrawing` calls with the installed plugin command. Pass `at` to target the block after which the drawing is inserted.
