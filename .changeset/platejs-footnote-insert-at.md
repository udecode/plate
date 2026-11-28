---
'platejs': patch
---

- Fix `tx.footnote.insert` so an explicit `at` target ignores an unrelated expanded selection, targeting an existing `ref` preserves selected text, expanded `options.at` ranges seed new definitions, `select: true` places the caret after the inserted reference, and complete captured `footnoteDefinition` blocks stay at root while nested definition blocks passed to `createDefinition` are flattened.
- Place definitions added by `tx.footnote.createDefinition` before trailing empty default paragraphs.
- Declare `BaseFootnoteDefinitionPlugin` and `BaseParagraphPlugin` as dependencies of `BaseFootnotePlugin`, and `FootnoteDefinitionPlugin` as a dependency of `FootnotePlugin` (updates compiled schema fingerprints for reference-only editors while preserving fingerprints when both plugins are already installed).
- Remove unused or colliding footnote type exports (`FootnoteAnchor`, `FootnoteDefinitionElement`, `FootnoteReferenceElement`, `FootnoteElement`, `FootnoteDefinition`, `FootnotePluginState`, `CreateFootnoteDefinitionOptions`) and redundant reads (`read.isResolved`, `read.definitionText`); replace with `Boolean(read.definition({ ref }))` and joining `definition[0].children` text in UI code.
- Return `boolean` from `update.selectDefinition` and `update.selectReference`, and narrow `read.definition`, `read.definitions`, and `read.references` to exact plugin element entries (`read.definition` includes `| undefined`).
- Ignore struck-out suggestion footnotes in semantic reads (`definition`, `definitions`, `references`, `refs`, `isDuplicateDefinition`, `anchor`) while keeping `nextRef`, duplicate-definition collision checks, and unprojected HTML encoding unfiltered so pending deletions are never reused or dropped on copy.
- Reuse unchanged footnote blocks in `EditorStatic` by anchor key instead of `render: { readsDocument: true }` (custom static footnote components reading beyond `read.anchor` can opt back with `.configure({ render: { readsDocument: true } })`), and omit dangling `target` and `href` values for unresolved references and uncited definitions on the main root.
- Remap colliding pasted footnote reference and definition pairs to the next free numeric ref across document, table cell, multi-cell, and table pastes while preserving table grid shape.
- Decode id-less GitHub footnote list items, trim trailing whitespace around copied GitHub backrefs, and keep partial copies from static footnote definitions as plain prose.
