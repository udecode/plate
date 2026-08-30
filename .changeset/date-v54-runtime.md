---
'platejs': major
---

Require React and React DOM 19.2 or newer.

- Move date insertion to `editor.update.date.insert(input?, nodeOptions?)`
- Register date element properties in compiled schemas
- Persist one required `value` string for canonical dates or authored date text
- Remove the standalone `insertDate` and unused `isPointNextToNode` helpers

**Migration:** Replace `insertDate(editor, options)` with `editor.update.date.insert(input?, nodeOptions?)` or `editor.plugin(BaseDatePlugin).update.insert(input?, nodeOptions?)`. Use Plite point and node reads directly for custom adjacency checks.

Replace Date node `date` / `rawDate` properties with `value` and pass `{ value }` to the insert update.
