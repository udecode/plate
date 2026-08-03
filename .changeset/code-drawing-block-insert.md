---
"@platejs/code-drawing": major
---

Insert code drawings through `editor.update.codeDrawing.insert(props, options)`,
append when no block target is available, and register code-drawing properties
with versioned inline validation in compiled schemas. The capability name,
command namespace, and persisted element type are all `codeDrawing`. Use
`PLUGINS.codeDrawing` for the capability name instead of `CODE_DRAWING_KEY`.

**Migration:** Replace direct `insertCodeDrawing` calls with the installed plugin command. Pass `at` to target the block after which the drawing is inserted.
