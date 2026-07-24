---
"@platejs/code-drawing": major
---

Insert code drawings through `editor.update.codeDrawing.insert(props, options)`,
append when no block target is available, and register code-drawing properties
with versioned inline validation in compiled schemas. The plugin and command
identity is `codeDrawing`; persisted elements remain `code_drawing`. Use
`KEYS.codeDrawing` instead of `CODE_DRAWING_KEY`.

**Migration:** Replace direct `insertCodeDrawing` calls with the installed plugin command. Pass `at` to target the block after which the drawing is inserted.
