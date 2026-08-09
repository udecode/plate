---
"@platejs/footnote": major
---

Export `FootnotePluginState` as the complete mutable state contract for
`BaseFootnotePlugin`.

Use `BaseFootnotePlugin` / `FootnotePlugin` for footnote references and
document-level footnote behavior. Read footnotes through `editor.read.footnote`
and mutate them through `editor.update.footnote`, including
`editor.update.footnote.insert()`.
Footnote insertion accepts feature input first and generic reference placement
options second: `insert(input?, nodeOptions?)`.
Pass `trigger` in the feature input to remove a matching preceding trigger in
the same insertion transaction.

The plugin requires the matching footnote-input descriptor. Footnote queries,
navigation, insertion, definition creation, and duplicate normalization are
owned by the plugin instead of exported editor/transaction helper functions.
The plugin capability is `footnote`; reference elements persist under the
semantic schema type `footnoteReference`.
