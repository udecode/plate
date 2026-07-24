---
"@platejs/footnote": major
---

Move footnote commands to `editor.update.footnote` and
`editor.update.insert.footnote`, and register footnote element properties in
compiled schemas. Duplicate-definition normalization reads earlier writes from
the active transaction.

Install the footnote input descriptor as a required plugin dependency.

**Migration:** Pass the active transaction to exported footnote transform helpers.
