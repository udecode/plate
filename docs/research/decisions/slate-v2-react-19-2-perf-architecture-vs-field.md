---
title: React 19.2 makes Slate v2 a first-class React-native perf architecture, not a universal engine winner
type: decision
status: accepted
updated: 2026-04-15
source_refs:
  - docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md
  - docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md
  - docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md
  - docs/research/sources/editor-architecture/service-channels-and-live-stores.md
  - docs/research/sources/editor-architecture/slate-v2-local-proof-substrate.md
  - docs/analysis/editor-architecture-candidates.md
related:
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/systems/slate-v2-overlay-architecture.md
  - docs/research/decisions/slate-v2-overlay-superiority-vs-legacy-and-field.md
---

# React 19.2 makes Slate v2 a first-class React-native perf architecture, not a universal engine winner

## Question

Can Slate v2 honestly claim the same-or-better perf architecture as the serious
editor candidates on theory alone, and what does React 19.2 change?

## Decision

Accept this narrower read:

- React 19.2 removes the old “React can’t carry a serious editor runtime”
  excuse.
- Slate v2 is now in the same architectural class as the serious field on the
  React-facing overlay/UI side.
- Slate v2 is clearly better than legacy Slate.
- Slate v2 cannot honestly claim blanket perf-architecture superiority over
  ProseMirror, Lexical, and VS Code on theory alone.

## Why React 19.2 matters

React 19.2 gives the current architecture the missing UI/runtime primitives:

- `useSyncExternalStore` for stable external snapshots
- `useTransition` and `useDeferredValue` for non-urgent background work
- `Activity` for preserved hidden panes and lower-priority offscreen UI

That is enough to make:

- annotation stores
- widget stores
- selector-first snapshot reads
- hidden review panes
- large-document sidebars

architecturally serious instead of workaround-heavy.

## Why that still does not prove universal superiority

### ProseMirror

ProseMirror still has the stronger explicit document-view diff:

- child-scoped decoration propagation
- mapped decoration sets
- bookmark semantics
- `ViewDesc` update discipline

Slate v2 now aligns with the good ideas.
It does not yet prove a stronger invalidation engine.

### Lexical

Lexical still has the stronger explicit dirty-node runtime:

- dirty leaf/dirty element tracking
- transform heuristic before React rendering
- separate subscription helpers

React 19.2 helps Slate v2 on the subscription/UI side.
It does not erase Lexical’s editor-core reconcile advantage.

### VS Code

VS Code still has the stronger service/view-model split:

- typed decoration handles
- comment controller surface
- separate widget channels
- detached view model

Slate v2 can be more ergonomic for React-native product integration.
That is not the same as beating VS Code’s editor-core architecture.

## What Slate v2 can honestly claim now

- better than legacy Slate by a wide margin
- first-class React-native perf architecture for overlays and review UI
- same class as the serious field on explicit lane separation, durable anchors,
  and external-store subscription posture

## Best reshape if the goal is “perfect decorations”

If the goal is field-best perf architecture, the next reshape is not another
React trick.

It is:

- source-scoped invalidation
- explicit dirtiness declarations per overlay source/store
- more indexed or child-scoped projection recompute below the React layer

That is the only serious path to a stronger theory claim against ProseMirror,
Lexical, and VS Code.
