---
title: Source-scoped overlay invalidation
type: concept
status: accepted
updated: 2026-08-30
related:
  - docs/research/systems/slate-v2-overlay-architecture.md
  - docs/research/decisions/slate-v2-source-scoped-overlay-invalidation.md
  - docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md
  - docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md
  - docs/research/sources/editor-architecture/service-channels-and-live-stores.md
  - docs/research/sources/editor-architecture/cursor-find-and-widget-geometry.md
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

## Current Plite state

Plite now implements source dirtiness, runtime scope, stable projection ids,
per-runtime and per-source subscriptions, and wake/recompute metrics. The April
warning is no longer a missing-foundation claim.

The remaining collaboration case is sharper. Yjs awareness already reports
changed client ids, but the Plate controller currently collapses them into one
revision and the cursor Decoration hook forces a full refresh. Correct
source-scoped invalidation routes those ids into the existing private
controller-owned `YjsAwarenessAdapter`, decodes each changed client once, and
fans the cached cursor into data, Decoration, and Widget outputs. A changed
selection permits at most one cursor-resolution pass with at most two endpoint
conversions; metadata-only updates reuse endpoints. Ordinary editor commits map
root-aware Plite Anchors with zero Yjs endpoint conversions, while explicit
fallback re-resolves only affected root buckets.

Private per-client/order/cache subscriptions and affected-root indexes are
implementation details. They do not make a public changed-id source API part of
the architecture.

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
- no duplicate source resolution merely because one fact has Decoration,
  Widget, and data consumers
