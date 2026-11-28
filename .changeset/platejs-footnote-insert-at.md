---
'platejs': patch
---

- Ignore an unrelated expanded selection when `tx.footnote.insert` receives an explicit `at` target, preserve selected text when targeting an existing footnote `ref`, capture expanded `options.at` ranges for new footnotes, place the caret after the inserted inline reference when `select: true` is passed with `at`, and preserve complete captured `footnoteDefinition` blocks at root while dissolving nested definition blocks passed to `createDefinition`.
- Place definitions added by `tx.footnote.createDefinition` before trailing empty default paragraphs instead of after them.
- Declare `BaseFootnoteDefinitionPlugin` (and `BaseParagraphPlugin`) as `dependencies` of `BaseFootnotePlugin`, and `FootnoteDefinitionPlugin` as a dependency of `FootnotePlugin` (updates the compiled schema fingerprint for reference-only editors while preserving it for editors already installing both plugins).
- Remove unused or colliding footnote type exports (`FootnoteAnchor`, `FootnoteDefinitionElement`, `FootnoteReferenceElement`, `FootnoteElement`, `FootnoteDefinition`, `FootnotePluginState`, `CreateFootnoteDefinitionOptions`) and redundant reads (`read.isResolved`, `read.definitionText`); replace them with `Boolean(read.definition({ ref }))` and joining `definition[0].children` text in UI code.
- Return `boolean` from `update.selectDefinition` and `update.selectReference`, and narrow `read.definition`, `read.definitions`, and `read.references` to exact plugin element entries (`read.definition` includes `| undefined`).
- Ignore struck-out suggestion footnotes in semantic reads (`definition`, `definitions`, `references`, `refs`, `isDuplicateDefinition`, `anchor`) while keeping `nextRef`, duplicate-definition collision checks, and unprojected HTML encoding unfiltered so pending deletions are never stolen or lost on clipboard copy.
