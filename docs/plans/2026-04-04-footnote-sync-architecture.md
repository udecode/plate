# Footnote Sync Architecture

## Goal
Define the most performant architecture for synchronizing footnote references,
definitions, and hover preview content in Plate.

## Reference Scan

### ProseMirror
- Official example: [Editing footnotes](https://prosemirror.net/examples/footnote/)
- Their model is not markdown-style reference plus separate definition block.
- Instead, footnote is an inline atom with its own inner sub-editor.
- The important architectural lesson is not the UI shape. It is this:
  - keep one canonical content source
  - do not duplicate that content into every visible marker
  - propagate changes between outer and inner editors by transaction mapping, not
    by string mirroring

### Tiptap
- Tiptap local repo scan did not surface an official footnote extension.
- Official docs search also did not turn up a built-in footnote feature page.
- Practical reading: Tiptap does not give us a stronger ready-made footnote sync
  design than ProseMirror itself.

### Milkdown
- Milkdown ships `footnote_reference` and `footnote_definition` schema support in
  `preset-gfm`.
- It does not appear to ship a richer sync / preview / navigation layer on top.
- Practical reading: Milkdown confirms the basic node split, but not the
  performance architecture above it.

## Decision

Plate should use a normalized footnote registry model.

### Canonical Data
- Definition content is the single source of truth.
- References must never store mirrored preview text, markdown prefix text, or
  copied definition content.
- Hover preview is derived from the definition node at render time.

### Indexing
- Add one footnote registry per editor instance.
- Registry shape:
  - `definitionByIdentifier: Map<string, PathRef>`
  - `referencesByIdentifier: Map<string, PathRef[]>`
  - optional later: `referenceByInternalId: Map<string, PathRef>`
- The registry should be invalidated on structural or identifier-changing
  operations that touch footnote nodes.
- On next read, rebuild once and reuse.

### Why This Wins
- O(1) lookup from reference to definition after index build.
- No N references each rescanning the whole document.
- No denormalized copies to keep in sync.
- No eager recomputation for every keystroke when footnotes are untouched.
- Keeps hover preview, backlink navigation, and insert flows on one ownership
  seam.

## Recommended API Shape

- `editor.api.footnote.definition({ identifier })`
- `editor.api.footnote.references({ identifier })`
- `editor.api.footnote.definitionText({ identifier })`
- later:
  - `editor.api.footnote.registry()`
  - `editor.api.footnote.hasDefinition({ identifier })`
  - `editor.api.footnote.isResolved({ identifier })`

Implementation note:
- `definitionText` should read through the registry, not rescan the whole
  document.

## Normalization Rules

- At most one definition per identifier.
- References may share an identifier.
- Missing definitions are allowed transiently during editing, but should be easy
  to detect and expose through API.
- Definition body stays pure content. Markdown prefixes are serializer-owned.

## Navigation Rules

- Reference `mod-click`:
  - look up definition through registry
  - select the start of the definition body
  - scroll into view
- Backlink `click`:
  - look up references through registry
  - default to first reference in document order for now
  - select the reference atom itself
  - scroll into view

## Hover Preview Rules

- Reference hover should render from canonical definition content.
- Hover UI stays in app/plugin render layer.
- Data lookup stays in package API layer.
- If definition is missing, show no preview or an unresolved state, but do not
  invent content.

## Explicit Non-Recommendations

- Do not copy definition text onto references.
- Do not store hover-preview text in plugin options or React state as a second
  source of truth.
- Do not recompute `definitionText` by full-document scan in every reference
  component render.
- Do not move to ProseMirror's inline-subeditor footnote model. It does not fit
  Plate's current markdown contract.

## Best Next Implementation

1. Add the registry/index layer in `@platejs/footnote`.
2. Make `definition`, `references`, and `definitionText` resolve through it.
3. Add unresolved / duplicate-definition helpers.
4. Keep current insert and navigation helpers on top of the registry.
5. Only after that, harden hover preview and backlink UX.
