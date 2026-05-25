---
title: Runtime identity vs tree address
type: concept
status: partial
updated: 2026-04-14
related:
  - docs/research/concepts/durable-anchor-vs-live-handle.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# Runtime identity vs tree address

## Definition

A runtime identity is the stable node identity the runtime tracks across
structural edits.

A tree address is the current structural location of a node in the document
tree.

In Slate terms:

- runtime identity: `RuntimeId`
- tree address: `Path`

## Why the split matters

Tree addresses are excellent for transforms and structural queries.

They are bad public identity contracts for live overlay UI because they move
when structure moves.

## Strongest supporting evidence

- local Slate v2 snapshot indexes expose both `idToPath` and `pathToId`
- local Slate v2 tests prove runtime ids survive important structural edits
- VS Code and ProseMirror both anchor public visual systems by ranges/ids, not
  tree-path APIs

## Practical use

This concept is the reason the Slate v2 plan cut public path-based widget
anchors.
