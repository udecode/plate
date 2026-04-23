---
title: Source-scoped overlay invalidation
type: concept
status: accepted
updated: 2026-04-15
related:
  - docs/research/systems/slate-v2-overlay-architecture.md
  - docs/research/decisions/slate-v2-source-scoped-overlay-invalidation.md
  - docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md
  - docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md
  - docs/research/sources/editor-architecture/service-channels-and-live-stores.md
---

# Source-scoped overlay invalidation

## Definition

Source-scoped overlay invalidation means an overlay store can decide whether a
document change affects a given decoration, annotation, or widget source before
rebuilding all projected slices.

It is the layer between:

- whole-store refresh
- per-runtime-id subscription delivery

## Why it matters

Slate v2 already has local subscription delivery.
That is good, but it is not the whole perf architecture.

If every editor commit still makes every overlay source rebuild and every range
projection walk the whole text tree, the UI may stay local while the projection
engine still pays too much.

## Required ingredients

- operation-derived dirty paths
- touched runtime ids
- source dirtiness declarations
- stable source identities
- previous projection snapshots keyed by source and runtime id
- fallback full refresh for unknown or broad sources

## External pressure

- ProseMirror pressures this through child-scoped decoration propagation.
- Lexical pressures this through dirty leaf / dirty element updates.
- VS Code pressures this through typed decoration/comment/widget channels and
  a view-model layer.
- React 19.2 helps consume the result but does not replace this layer.

## Non-goals

- no public path-based widget anchoring
- no new generic `decorate` callback
- no claim that every external source can be perfectly incremental
- no hidden stale overlays when a source cannot declare dirtiness safely
