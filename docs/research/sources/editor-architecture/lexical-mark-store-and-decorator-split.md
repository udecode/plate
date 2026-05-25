---
title: Lexical mark/store/decorator split
type: source
status: partial
source_refs:
  - ../lexical/packages/lexical-mark/src/MarkNode.ts
  - ../lexical/packages/lexical/src/LexicalUpdates.ts
  - ../lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts
  - ../lexical/packages/lexical-playground/src/commenting/index.ts
  - ../lexical/packages/lexical-playground/src/plugins/CommentPlugin/index.tsx
  - ../lexical/packages/lexical-react/src/useLexicalSubscription.tsx
updated: 2026-04-15
related:
  - docs/research/entities/lexical.md
  - docs/research/concepts/overlay-lane-separation.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# Lexical mark/store/decorator split

## Purpose

Compile the Lexical evidence that mattered to the Slate v2 overlay design.

## Strongest evidence

- `MarkNode` stores ids in the editor tree for inline marked ranges.
- `CommentStore` keeps comment/thread metadata in a separate store with change
  listeners.
- `DecoratorNode` is a separate node-sized React decoration lane.
- `useLexicalSubscription` is an explicit subscription helper for render-facing
  state.
- `LexicalUpdates.ts` runs an explicit dirty leaf / dirty element transform and
  reconcile pipeline.

## What this means

### 1. Inline ids and comment metadata do not need the same owner

Lexical’s playground comment model does not pretend the editor tree should own
the whole comment system.

It splits:

- inline mark ids in the document model
- comment/thread metadata in `CommentStore`

That directly supports the Slate v2 cut:

- anchors can live in editor/runtime space
- canonical annotation metadata can stay in app/collab/service stores

### 2. Node-sized UI is a different lane

`DecoratorNode` exists because React portal-like UI is not the same thing as
inline overlay data.

That is exactly why `Widget` should stay a separate lane in Slate v2.

### 3. Subscription posture matters

Lexical exposes subscription helpers for render-facing values instead of making
everything flow through generic context churn.

That supports:

- store/controller APIs
- stable subscriptions
- fewer rerender-width explosions

### 4. Lexical still has the stronger explicit core invalidation engine

The dirty leaf / dirty element transform heuristic is not a React nicety.
It is core engine architecture.

That makes Lexical stronger than current Slate v2 on one key axis:

- it knows which parts of the editor tree are dirty before React gets involved

React 19.2 narrows the UI/runtime gap for Slate v2.
It does not erase Lexical’s core reconcile advantage by itself.

## Take for Slate v2

- keep annotation metadata outside the editor runtime when that is the honest
  owner
- keep node-sized React UI separate from text overlays
- prefer store/subscription surfaces over array-replacement APIs
- do not pretend React 19.2 alone beats Lexical’s dirty-node runtime
