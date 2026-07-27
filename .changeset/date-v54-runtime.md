---
"@platejs/date": major
---

- Move date insertion to `editor.update.date.insert(options)`
- Register date element properties in compiled schemas
- Remove the standalone `insertDate` and unused `isPointNextToNode` helpers

**Migration:** Replace `insertDate(editor, options)` with
`editor.update.date.insert(options)` or
`editor.plugin(BaseDatePlugin).update.insert(options)`. Use Plite point and
node reads directly for custom adjacency checks.
