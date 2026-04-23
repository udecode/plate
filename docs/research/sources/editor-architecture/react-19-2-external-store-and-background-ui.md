---
title: React 19.2 external-store and background-ui primitives
type: source
status: partial
source_refs:
  - https://react.dev/reference/react/useSyncExternalStore
  - https://react.dev/reference/react/useTransition
  - https://react.dev/reference/react/useDeferredValue
  - https://react.dev/reference/react/Activity
  - ../slate-v2/packages/slate-react/src/hooks/use-slate-selector.tsx
  - ../slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx
  - ../slate-v2/packages/slate-react/src/hooks/use-slate-widgets.tsx
  - ../slate-v2/docs/walkthroughs/09-performance.md
updated: 2026-04-15
related:
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/systems/slate-v2-overlay-architecture.md
  - docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md
---

# React 19.2 external-store and background-ui primitives

## Purpose

Compile the React 19.2 primitives that matter to the Slate v2 perf-architecture
question.

## Strongest evidence

- `useSyncExternalStore` is the React-native primitive for stable external-store
  subscription.
- `useTransition` marks non-blocking background work and lets urgent input
  interrupt it.
- `useDeferredValue` lets non-urgent derived UI lag behind the urgent value.
- `Activity` preserves state and DOM for hidden UI while letting hidden work run
  at lower priority.

## What this means

### 1. React 19.2 is a serious overlay/UI scheduler

For editor-adjacent UI, React now has the right primitives for:

- external store snapshots
- non-urgent background recompute
- stateful hidden panes
- stale-while-fresh derived UI

That is enough to make a React-native editor runtime architecture credible.

### 2. React 19.2 does not replace a core editor invalidation engine

React can schedule and subscribe.
It does not invent child-scoped document mapping, dirty-node reconciliation, or
view-model separation for us.

If the editor core still recomputes too broadly, React 19.2 only makes the
surrounding UI smarter, not the engine magically better.

### 3. The current Slate v2 usage is directionally right

Local Slate v2 already uses the React 19.2-friendly posture:

- `useSlateSelector(...)`
- `useSlateAnnotations(...)`
- `useSlateWidgets(...)`
- `useSlateProjections(...)`
- `Activity` for hidden panes in the large-document overlay example

That means the repo is not missing the React side of the architecture.
It is missing only the deeper invalidation proof if it wants to beat the best
non-React or custom-runtime engines.

## Take for Slate v2

- keep `useSyncExternalStore` as the subscription backbone
- keep visible editing work urgent
- keep hidden panes, sidebars, and review chrome on the non-urgent path
- do not confuse “React has the right primitives” with “the editor core is
  already field-best”
