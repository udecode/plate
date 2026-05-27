---
title: ProseMirror mapped overlays and bookmarks
type: source
status: partial
source_refs:
  - ../prosemirror/view/src/decoration.ts
  - ../prosemirror/view/src/viewdesc.ts
  - ../prosemirror/state/src/selection.ts
  - ../prosemirror/history/src/history.ts
updated: 2026-04-15
related:
  - docs/research/entities/prosemirror.md
  - docs/research/concepts/overlay-lane-separation.md
  - docs/research/concepts/durable-anchor-vs-live-handle.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# ProseMirror mapped overlays and bookmarks

## Purpose

Compile the ProseMirror evidence that mattered to the Slate v2
decorations / annotations lane.

## Strongest evidence

- `DecorationSource` and `DecorationSet` are persistent mapped overlay data,
  not just decoration callbacks.
- `forChild(...)` is the real scaling trick: child-scoped propagation instead of
  repeatedly intersecting whole-tree overlay sets.
- `SelectionBookmark` is the clean durable-anchor contract:
  map through changes, resolve later against the current document.
- the `ViewDesc` tree is an explicit incremental view/update substrate rather
  than generic React rerender.

## What this means

### 1. Decorations are data, not just render-time callbacks

The important ProseMirror lesson is not “use decorations”.

It is:

- overlays are explicit data
- they map through document changes
- child nodes see only the overlay slice that matters to them

That is exactly the discipline old Slate `decorate` lacked.

### 2. Durability needs a different noun from live runtime handles

`SelectionBookmark` exists because the runtime needs a lightweight,
document-independent anchor that can survive edits and resolve later.

That supports the Slate v2 decision to prefer `Bookmark` as the durable public
anchor noun and keep live-ref machinery lower in the stack.

### 3. Node-shaped channels are real

ProseMirror’s `Decoration.node(...)` makes the node-local visual lane explicit.

That matters because it reinforces the split between:

- inline text overlays
- node-shaped overlays
- widget UI

Instead of pretending one leaf-level decorate hook can own them all.

### 4. ProseMirror still owns the stronger proven document-view diff

`mapChildren(...)` and the `ViewDesc` tree are still more explicit than the
current Slate v2 projection runtime about:

- which children were touched
- which children can be updated in place
- which subtrees need rebuild

That matters for perf architecture because it means ProseMirror’s strongest
claim is not just “it has decorations”. It has a tighter document-view update
discipline.

## Take for Slate v2

- keep mapped/child-scoped overlay discipline
- keep durable anchors separate from live handles
- do not rebuild the public API around one callback that returns an array every
  render
- do not claim blanket perf-architecture superiority over ProseMirror unless
  Slate v2 grows a comparably explicit invalidation story below the React layer
