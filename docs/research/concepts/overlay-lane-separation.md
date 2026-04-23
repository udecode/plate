---
title: Overlay lane separation
type: concept
status: partial
updated: 2026-04-14
related:
  - docs/research/systems/slate-v2-overlay-architecture.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
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
- widgets are UI/geometry driven

## Strongest supporting evidence

- ProseMirror mapped decorations
- Lexical mark ids vs comment stores vs decorator UI
- Tiptap comments vs suggestions
- VS Code decorations vs comment controllers

## Practical use

When a proposed API says “just use decorations for that too”, this concept is
the pressure test.
