---
title: Tiptap comments, suggestions, and node-range surfaces
type: source
status: partial
source_refs:
  - ../tiptap/packages/extensions/src/focus/focus.ts
  - ../tiptap/packages/extension-node-range/src/helpers/getNodeRangeDecorations.ts
  - ../tiptap/demos/src/Extensions/CollaborationMapPositions/React/index.tsx
  - ../tiptap-docs/src/content/comments/getting-started/overview.mdx
  - ../tiptap-docs/src/content/content-ai/capabilities/ai-toolkit/api-reference/display-suggestions.mdx
updated: 2026-04-14
related:
  - docs/research/entities/tiptap.md
  - docs/research/concepts/overlay-lane-separation.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# Tiptap comments, suggestions, and node-range surfaces

## Purpose

Compile the Tiptap product-layer evidence that mattered to the overlay lane.

## Strongest evidence

- comments are explicit product features:
  inline, document, sidebar, overlapping, API-managed
- suggestions are separate objects with ranges and replacement options
- overlapping suggestions are explicitly blocked because of ProseMirror
  decoration limitations
- focus and node-range helpers use node/range decoration channels directly

## What this means

### 1. Comments and suggestions are not the same lane

Tiptap’s own product docs draw a hard line:

- comments are discussion/thread surfaces
- suggestions are review/change surfaces

That reinforces the Slate v2 split between:

- annotation/comment ownership
- transient overlay/review rendering

### 2. Product layers still inherit engine limits

The suggestions docs explicitly say overlapping suggestions cannot both render
because of ProseMirror decoration limitations.

That is useful because it proves a product-layer system still needs honest
engine boundaries instead of pretending every overlap case is free.

### 3. Node/range visuals are first-class enough to package

Focus and node-range helpers reinforce that node/range surfaces are real
channels, not weird exceptions to a leaf-only model.

## Take for Slate v2

- do not collapse comments, suggestions, and generic overlays into one API
- keep product-layer annotation systems explicit
- accept that some review/suggestion rendering constraints are engine-level,
  not just UI polish debt
