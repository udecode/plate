---
title: Slate v2 should add source-scoped overlay invalidation before claiming field-best decoration perf architecture
type: decision
status: accepted
updated: 2026-04-15
source_refs:
  - docs/research/concepts/source-scoped-overlay-invalidation.md
  - docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md
  - docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md
  - docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md
  - docs/research/sources/editor-architecture/service-channels-and-live-stores.md
  - docs/research/sources/editor-architecture/slate-v2-local-proof-substrate.md
related:
  - docs/research/systems/slate-v2-overlay-architecture.md
  - docs/slate-v2/decoration-roadmap.md
---

# Slate v2 should add source-scoped overlay invalidation before claiming field-best decoration perf architecture

## Question

What concrete architecture extension follows from the deeper comparison against
ProseMirror, Lexical, VS Code, and React 19.2?

## Decision

Add an active “perfect decorations” tranche focused on source-scoped overlay
invalidation.

This tranche should extend, not replace, the accepted Slate v2 overlay model:

- `Decoration`
- `Annotation`
- `Widget`
- `Bookmark`
- projection stores
- annotation stores
- widget stores

## Why this wins

The current system already wins the old Slate fight:

- local subscriptions
- durable anchors
- explicit stores
- React 19.2-compatible hidden/non-urgent UI

But the field comparison exposes one deeper gap:

- ProseMirror knows how to push only relevant decorations into child view
  updates.
- Lexical knows how to dirty only affected leaves/elements before reconcile.
- VS Code separates model, view model, decorations, comments, and widgets as
  explicit channels.

Slate v2’s current projection store is local at the consumer edge, but its
projection recompute path can still start too broad.

## Required shape

1. Publish operation-derived change metadata from core:
   - dirty paths
   - touched runtime ids
   - replace epoch
   - operation class
2. Let overlay sources declare dirtiness:
   - always
   - selection
   - text paths
   - node paths
   - external explicit refresh
   - custom predicate
3. Make the projection store update per source and per runtime-id bucket.
4. Keep full refresh as a safe fallback.
5. Prove the win with rerender and recompute-count lanes before widening public
   claims.

## What this overrules

- “React 19.2 alone makes this field-best.”
- “Local React subscriptions are enough.”
- “More examples are the next architecture move.”
- “A broad full refresh is acceptable as long as subscribers stay local.”

## Current status

Accepted as the next architecture extension for perfect decoration performance.
