# @platejs/footnote

## 54.0.0-beta.2

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Export `FootnotePluginState` as the complete mutable state contract for `BaseFootnotePlugin`.

  Use `BaseFootnotePlugin` / `FootnotePlugin` for footnote references and document-level footnote behavior. Read footnotes through `editor.read.footnote` and mutate them through `editor.update.footnote`, including `editor.update.footnote.insert()`. Footnote insertion accepts feature input first and generic reference placement options second: `insert(input?, nodeOptions?)`. Pass `trigger` in the feature input to remove a matching preceding trigger in the same insertion transaction.

  The plugin requires the matching footnote-input descriptor. Footnote queries, navigation, insertion, definition creation, and duplicate normalization are owned by the plugin instead of exported editor/transaction helper functions. The plugin capability is `footnote`; reference elements persist under the semantic schema type `footnoteReference`.

  Persist one required `ref` on both footnote definitions and references. Rename query and update inputs from `identifier` to `ref`, `identifiers()` to `refs()`, and `nextId()` to `nextRef()`. Markdown codecs continue mapping that field to MDAST `identifier`.

### Patch Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define footnote reference and definition Markdown conversion on the footnote plugins.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Insert footnotes only from a text selection when no explicit location is provided.

## 53.0.0

### Minor Changes

- [#4941](https://github.com/udecode/plate/pull/4941) by [@zbeyens](https://github.com/zbeyens) – Add `FootnoteReferencePlugin`, `FootnoteDefinitionPlugin`, and `FootnoteInputPlugin` for real footnote nodes and inline `[^` combobox insertion in Plate editors.
