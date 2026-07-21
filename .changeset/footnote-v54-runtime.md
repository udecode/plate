---
"@platejs/footnote": major
---

Move footnote commands to `editor.update.footnote` and
`editor.update.insert.footnote`, and register footnote element properties in
compiled schemas. Duplicate-definition normalization reads earlier writes from
the active transaction.

**Migration:** Pass the active transaction to exported footnote transform helpers.
