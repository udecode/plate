---
"@platejs/code-block": major
---

Expose code-block mutations through `insert`, `toggle`, `tab`, `untab`,
`resetBlock`, and `selectAll` installed commands, and register code-block and
syntax properties in compiled schemas.

Install code lines as a required dependency and syntax highlighting as an
optional bundled default. Disable `CodeSyntaxPlugin` explicitly for
unhighlighted code blocks.

**Migration:** Replace direct transform helper imports with
`editor.update.codeBlock.*` commands. Pass node insertion options directly to
`insert(options)`.
