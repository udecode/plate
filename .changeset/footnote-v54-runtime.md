---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Export `FootnotePluginState` as the complete mutable state contract for `BaseFootnotePlugin`.

Use `BaseFootnotePlugin` / `FootnotePlugin` for footnote references and document-level footnote behavior. Read footnotes through `editor.read.footnote` and mutate them through `editor.update.footnote`, including `editor.update.footnote.insert()`. Footnote insertion accepts feature input first and generic reference placement options second: `insert(input?, nodeOptions?)`.

Footnote queries, navigation, insertion, definition creation, and duplicate normalization are owned by the plugin instead of exported editor/transaction helper functions. The plugin capability is `footnote`; reference elements persist under the semantic schema type `footnoteReference`.

Persist one required `ref` on both footnote definitions and references. Rename query and update inputs from `identifier` to `ref`, `identifiers()` to `refs()`, and `nextId()` to `nextRef()`. Markdown codecs continue mapping that field to MDAST `identifier`.

Remove `duplicateDefinitions`, `hasDuplicateDefinitions` and `duplicateRefs`. Read duplicates through `definitions`:

```ts
footnote.definitions({ ref }).slice(1); // duplicateDefinitions({ ref })
footnote.definitions({ ref }).length > 1; // hasDuplicateDefinitions({ ref })
footnote.refs().filter((ref) => footnote.definitions({ ref }).length > 1); // duplicateRefs()
```
