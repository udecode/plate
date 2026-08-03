---
"@platejs/footnote": major
---

Export `FootnotePluginState` as the complete mutable state contract for
`BaseFootnotePlugin`.

Use `BaseFootnotePlugin` / `FootnotePlugin` for footnote references and
document-level footnote behavior. Read footnotes through `editor.read.footnote`
and mutate them through `editor.update.footnote`, including
`editor.update.footnote.insert()`.

The plugin requires the matching footnote-input descriptor. Footnote queries,
navigation, insertion, definition creation, and duplicate normalization are
owned by the plugin instead of exported editor/transaction helper functions.
Footnote reference elements persist under the canonical `footnote` plugin
identity.
