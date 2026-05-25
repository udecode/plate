---
title: Slate v2 collaborative annotations use external channels by default
type: decision
status: accepted
updated: 2026-04-30
related:
  - docs/research/systems/slate-v2-overlay-architecture.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
  - docs/research/concepts/durable-anchor-vs-live-handle.md
  - docs/research/concepts/source-scoped-overlay-invalidation.md
---

# Slate v2 collaborative annotations use external channels by default

## Question

Should comments and annotations default to being stored in the Slate document
value, or should Slate v2 treat them as external annotation-channel data that
resolves to document ranges?

## Decision

Slate v2 should default to external annotation channels.

The document value owns document content. Comment threads, resolved state,
mentions, authorship, permissions, and service metadata belong to an app,
collaboration, or service store. `slate-react` mirrors durable annotation
anchors into projection stores so text rendering, sidebars, and widgets can
subscribe to the resolved ranges.

Document-embedded ids are still allowed as an adapter or product choice when an
app intentionally wants anchors serialized with the document. They are not the
raw Slate default.

## Why

Comment-only collaboration is the forcing case.

If a reader can add comments while another user edits the document, that reader
should not need document-write permission just to create a thread. Putting the
comment into the Slate value would mix document edits with discussion edits and
would make undo/history, audit trails, and server permissions lie.

The field evidence points the same way:

- ProseMirror proves mapped overlay data and bookmarks are first-class concepts.
- Lexical proves inline ids and comment metadata can have separate owners.
- Tiptap proves comments become a product/collaboration layer with explicit
  permission policy.
- Slate v2 already has bookmarks, annotation stores, projection stores, and
  source-scoped invalidation.

## Public API Consequence

`SlateAnnotation` should take an `anchor`, not only a local `bookmark`.

`Bookmark` remains the built-in local anchor implementation. Collaboration
adapters can provide compatible anchors backed by Yjs relative positions,
service anchors, or another durable-position substrate.

Annotation `data` is for app-facing metadata. Projection payload should be a
separate small render-facing field so comment body changes do not repaint inline
text when the visual annotation state is unchanged.

## Non-Goals

- no raw Slate product comment service
- no server auth policy in core
- no required current-version Plate or slate-yjs adapter
- no return to one `decorate` callback as the annotation architecture

## Proof Required

- local `Bookmark` works through the generic anchor contract
- external annotation refresh can target ids
- comment body updates wake sidebar subscribers without repainting inline text
- read-only/comment-only flow creates an annotation without changing the Slate
  value
- remote document edits re-resolve collaborative anchors
- large annotation sets stay source-scoped and runtime-bucket local

