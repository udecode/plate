---
title: Overlay lane separation
type: concept
status: accepted
updated: 2026-08-30
related:
  - docs/research/systems/slate-v2-overlay-architecture.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
  - docs/research/sources/editor-architecture/cursor-find-and-widget-geometry.md
---

# Overlay lane separation

## Definition

Overlay lane separation is the rule that transient decorations, durable
annotations, and anchored widget UI are different things and should not be
collapsed into one generic public API.

## Why it exists

Because the ownership and lifetime questions are different:

- decorations are derived/transient
- annotations are durable/id-bearing
- widgets are logical UI targets
- geometry is a mounted projection of subscribed widgets, not widget identity or
  document state

## Strongest supporting evidence

- ProseMirror mapped decorations
- Lexical mark ids vs comment stores vs decorator UI
- Tiptap comments vs suggestions
- VS Code decorations vs comment controllers
- current Plite source dirtiness, stable-id projection, per-runtime
  subscriptions, and DOM phase scheduling
- Tiptap/y-prosemirror and Lexical Yjs, which render remote selection paint and
  caret UI as distinct outputs

## Practical use

When a proposed API says “just use decorations for that too” or “put every
rectangle in one overlay store”, this concept is the pressure test. Start from
the lifetime and owner, then project only the mounted DOM facts a Widget
consumer actually subscribes to.
