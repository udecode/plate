---
title: Arthrod discussion says the semantic document model belongs above Slate
type: decision
status: proposed
updated: 2026-05-31
source_refs:
  - packages/slate/src/interfaces/editor.ts
  - packages/slate/src/interfaces/element.ts
  - packages/slate/src/interfaces/text.ts
  - content/docs/slate/concepts/13-roots.md
  - content/docs/slate/concepts/14-document-state.md
  - docs/research/entities/portable-text.md
  - ../portabletext/README.md
  - ../portabletext/apps/docs/src/content/docs/introduction.mdx
  - ../portabletext/packages/schema/src/index.ts
  - ../prosemirror/README.md
  - ../react-prosemirror/demo/schema.ts
  - https://pkg.yihui.org/rmarkdown-cookbook/word-redoc
related:
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md
  - docs/research/entities/portable-text.md
  - docs/research/entities/prosemirror.md
---

# Arthrod discussion says the semantic document model belongs above Slate

## Question

Should Plate/Slate have a centralized AST model for document conversion,
validation, and feature negotiation instead of only app-defined Slate nodes?

## Decision

Yes, but not in raw Slate.

Raw Slate should stay the unopinionated editing substrate:

- `Value = Element[]`
- `Element = { type, children, ... }`
- `Text = { text, ... }`
- document persistence as `EditorDocumentValue = { roots, state? }`
- roots, operations, selections, state fields, schema hooks, and transactions

Plate should own the semantic document model on top.

This page is named after Arthrod, the person who raised the discussion. It is
not a proposed package name, namespace, or model name.

That future Plate layer should provide:

- typed semantic nodes for paragraphs, headings, lists, tables, media, callouts,
  embeds, comments, suggestions, annotations, and layout-relevant blocks
- a schema registry that can produce TypeScript types, validators, normalizers,
  docs, and converter maps
- fidelity policies for imports and exports
- diagnostics for unsupported, stripped, preserved, or degraded features
- adapters for DOCX, HTML, Markdown, Portable Text-style JSON, ProseMirror JSON,
  PDF/export surfaces, and Plate runtime nodes

## Why

Slate's strength is that it does not force a product document ontology. That is
also why it is not enough for conversion-heavy product work. A DOCX importer,
Markdown exporter, comments system, or suggestion engine needs a semantic model
that says what the document means, not only how the editor currently stores
editable nodes.

The current Slate v2 model already has the right lower layer:

```ts
type EditorDocumentValue = {
  roots: Record<string, Descendant[]>
  state?: Record<string, unknown>
}
```

That is a persistence envelope for editor state. It should not become the
canonical DOCX/HTML/Markdown interchange AST.

## What to steal

### Portable Text

Steal:

- schema-driven typed blocks
- custom block objects
- inline objects
- annotations as structured data, not HTML strings
- unknown type fallback
- conversion that only emits schema-supported output

Do not steal it wholesale as Slate's value format. Portable Text is a block
content format and CMS-shaped schema, not a raw editing core.

### ProseMirror

Steal:

- explicit schema/content constraints
- conversion discipline around known node and mark specs
- clear boundary between model, state, transactions, and view

Do not move Slate toward a ProseMirror-shaped core. The value of Slate is still
JSON-like app-defined nodes plus operation/runtime layers.

### DOCX package AST idea

Steal:

- diagnostics with severity and machine-readable codes
- strict feature policy for comments, anchors, insertions, deletions, and
  priority styles
- unknown feature policy: preserve when safe or strip with diagnostics
- package-part preservation for DOCX internals
- stable branded identifiers for DOCX-local ids versus durable ids

Keep this in import/export packages, not raw editor state. DOCX package graphs
are format-specific.

### Redoc / markdown comment syntaxes

Steal only as export syntax options.

Redoc-style Word change tracking and Markdown comment markers are useful
roundtrip formats, but they are not a canonical internal AST. They are views of
the semantic model.

## Target split

```text
Slate core
  editing substrate: nodes, roots, paths, selections, operations, transactions

Plate semantic model
  semantic document AST, schema, validators, feature policies, diagnostics

Plate plugins
  ergonomic authoring APIs and renderers over the semantic model

Format adapters
  DOCX, HTML, Markdown, Portable Text, ProseMirror, PDF/export
```

## API direction

The source of truth should be a typed model registry, not hand-written Zod
schemas.

The registry can generate or expose:

- TypeScript types
- Zod or Valibot validators
- normalizers
- feature-capability checks
- converter maps
- docs tables
- test fixtures

Sketch:

```ts
const model = definePlateDocumentModel({
  nodes: {
    paragraph: blockNode({
      children: 'inline*',
      fields: {
        align: optional(enumValue(['left', 'center', 'right'])),
      },
    }),
    commentAnchor: inlineMarker({
      fields: {
        threadId: stringValue(),
      },
    }),
  },
  features: {
    comments: strictFeature(),
    insertions: strictFeature(),
    deletions: strictFeature(),
  },
})
```

The exact API should come later. The important part is the ownership boundary:
Plate owns semantic model law; Slate owns editing substrate law.

## Rejected alternatives

### Put a central semantic AST in Slate core

Reject. It would make Slate opinionated and drag raw Slate into product/document
format policy.

### Use only Zod schemas

Reject as source of truth. Zod is a good generated validator or integration
surface, but it does not by itself define commands, normalization, conversion,
feature negotiation, or docs.

### Use Portable Text as the Plate document model

Reject as canonical state. Portable Text is excellent prior art for structured
portable content, but Plate needs comments, suggestions, tables, rich layout,
DOCX fidelity, and editor-runtime bridges that exceed normal Portable Text.

### Use ProseMirror schema as the Plate document model

Reject. ProseMirror schema is strong, but adopting it as the model would import
ProseMirror's assumptions and weaken Slate/Plate's current direction.

### Keep format adapters independent forever

Reject. This recreates the same bug class in every adapter: comments, tracked
changes, tables, unknown nodes, unsupported styles, and lossy conversions all
need shared policy and diagnostics.

## Later work

- Pick the actual package or namespace name separately; `arthrod` is only the
  discussion attribution.
- Define the minimum semantic node set for Plate core documents.
- Define the model registry API.
- Define feature policies and diagnostic codes.
- Build one vertical slice: DOCX comments/suggestions to semantic model to
  Slate/Plate nodes and back.
- Add validator generation only after the model registry shape is stable.

## Short answer for discussion

We do need that layer, but not in raw Slate. Slate should stay the
unopinionated editing substrate. Plate should own a canonical semantic document
model on top, with validators and converters. Then DOCX, Markdown, HTML, and
other adapters can preserve what they understand, strip or keep unknown parts by
policy, and emit diagnostics instead of pretending conversion is lossless.
