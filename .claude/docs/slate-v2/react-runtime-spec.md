---
date: 2026-04-02
topic: slate-v2-react-runtime-spec
---

# Slate React v2 Runtime Spec

## Purpose

This is the package-level contract for `slate-react-v2`.

The target is:

- React `19.2+`
- latest React lint/runtime assumptions
- no React 18 compatibility tax
- runtime semantics that feel native to modern React instead of tolerated by it

## Inputs

- [engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/engine.md)
- [core-foundation-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/core-foundation-spec.md)
- [dom-runtime-boundary-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/dom-runtime-boundary-spec.md)
- [requirements-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/requirements-from-issues.md)
- [roadmap-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/roadmap-from-issues.md)
- React versions: https://react.dev/versions
- React 19.2 release: https://react.dev/blog/2025/10/01/react-19-2
- `<Activity>` docs: https://react.dev/reference/react/Activity
- `useEffectEvent` docs: https://react.dev/reference/react/useEffectEvent
- React Labs external-store direction: https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more

## Locked Constraints

1. `slate-react-v2` targets React `19.2+` only.
2. The runtime is snapshot-driven, not mutable-editor-driven.
3. Selector subscriptions built on `useSyncExternalStore` are the default rendering model.
4. Effects are for external synchronization only, not for derived editor state or command chaining.
5. `useEffectEvent` is the default tool for effect-owned event reactions.
6. `<Activity>` is a first-class tool for hidden and background UI, not a fix for active editable-surface correctness.
7. `startTransition` and `useDeferredValue` are for derived non-urgent UI only.
8. `slate-react-v2` must not depend on reading half-mutated editor state.

## Non-Goals

This package does **not** try to:

- support React 18
- build around unreleased `use(store)` APIs
- use `cacheSignal()` as a client runtime primitive
- own low-level DOM translation
- smuggle browser selection repair back into React components
- normalize effect anti-patterns into the package contract
- re-decide browser semantics that belong in `slate-dom-v2`

## Core Contract Required From `slate-v2`

`slate-react-v2` forces these guarantees onto the core:

1. Snapshot reads are pure.
2. Repeated reads of the same version return the same value.
3. `children`, `selection`, `marks`, and ref-aligned lookup state publish atomically.
4. Subscribers notify after commit, never during draft mutation.
5. Stable runtime identity exists for node-level subscriptions.
6. External value replacement and editor recreation do not require React to reason about stale mutable guts.

## Runtime Model

### 1. Snapshot Store

The editor runtime must expose a real external-store contract.

That means:

- one committed snapshot version at a time
- pure `getSnapshot()` semantics
- post-commit subscription notification
- `useSyncExternalStore` as the baseline subscription primitive
- no effect-driven mirroring of core editor state into local React state
- no “subscribe in an effect, then copy into `useState`” wrappers

Strong take:

- broad `useSlate()` rerenders are failure
- snapshot selectors are the baseline

### 2. Selector Subscriptions

The package should prefer narrow selectors like:

- node by runtime id
- selection slice
- marks slice
- derived booleans for toolbar and floating UI

Selector hooks should behave like real React reads:

- calculate view data during render
- use `useMemo` only for genuinely expensive derivation
- never bounce derived values through `useState` plus `useEffect`

### 3. Event Handling Before Effects

If a write happens because the user clicked, typed, pasted, dragged, or submitted something, it belongs in an event handler or command path.

That means:

- command dispatch stays in event handlers
- toolbar state changes stay in event handlers
- selection-following UI should react to committed state, not trigger edits from an effect watcher

Hard rule:

- do not watch editor state in an effect just to dispatch another editor command
- do not encode transaction sequencing as “state changed, now an effect fires”

### 4. Effect Wiring With `useEffectEvent`

`useEffectEvent` should be the standard pattern for:

- selection observers
- composition listeners
- focus/scroll coordination
- clipboard/runtime callbacks

Hard rule:

- Effect Events stay local to effects
- do not pass them through component trees or public hooks as if they were stable function identities

Effects in this package should exist only when synchronizing with something outside React:

- DOM listeners
- browser selection observers
- composition lifecycle
- scroll and focus coordination
- analytics or instrumentation tied to visibility

If the problem is only “props changed” or “editor snapshot changed”, that is almost certainly not an effect problem.

Important seam:

- when the external system is the browser editing surface, `slate-react-v2` wires lifecycle and listener ownership through `slate-dom-v2`
- `slate-react-v2` does not reinterpret DOM points, selection semantics, or composition rules on its own

### 5. Controlled And External Updates

The runtime must not implement controlled mode by copying props into editor state with an effect.

Bad shape:

- `useEffect(() => editor.setValue(value), [value])`

Good shape:

- parent-owned canonical snapshot or value source
- explicit replacement primitives
- keyed resets when local UI state must be thrown away
- selector reads against the latest committed source of truth

Strong take:

- “sync prop into editor with an effect” is exactly the sort of React-hostile habit v2 is supposed to kill

### 6. Hidden And Background UI With `<Activity>`

`<Activity>` should be a real part of the runtime story for:

- inactive editors
- side panes
- inspectors
- background-prepared UI

It should **not** be used to justify sloppy active-editor semantics.

Important constraint:

- if a hidden boundary resumes, the runtime must see the latest committed snapshot cleanly
- hidden UI must not depend on stale mutable editor state surviving in-place

### 7. Urgent Vs Deferred Work

Urgent work:

- typing
- composition
- DOM selection correctness
- committed snapshot publication

Deferred work:

- decorations
- search highlights
- heavy derived panes
- analytics
- low-priority visual recomputation

That means:

- `startTransition` and `useDeferredValue` belong to derived UI
- they do **not** make core correctness safe
- if a value can be calculated during render, calculate it during render first and only defer the expensive version

## React-19.2-Specific Posture

This package should assume:

- latest `eslint-plugin-react-hooks`
- official “You Might Not Need an Effect” guidance is baseline, not optional style
- `useSyncExternalStore` is the default store-connection primitive
- `useEffectEvent` is available and standard
- `<Activity>` is available and standard
- React Performance Tracks are part of normal profiling

This package should not carry:

- React 18 fallback design
- hook APIs shaped around “maybe `useEffectEvent` isn’t there”
- state mirroring patterns that only exist to survive older React limitations
- effect-driven derived state
- effect-driven editor resets when a `key` boundary or explicit source-of-truth contract would do

## Public Surface Direction

Phase 3 should expose a small but hard-edged runtime surface:

- snapshot provider/store integration
- selector hooks
- focused editor-instance hooks
- controlled/external update primitives
- Activity-friendly editor boundary helpers

Do **not** start with:

- giant hook surface area
- broad context subscriptions
- magic convenience APIs that remount or resubscribe unpredictably
- hooks whose main job is hiding effect anti-patterns

## Acceptance Lanes

This package must be able to absorb these pressure classes honestly:

- `#5709`
- `#5697`
- `#5568`
- `#5488`
- `#5131`
- `#4612`

That means at minimum:

1. stale editor instance lanes
2. rerender-breadth lanes
3. controlled/external update lanes
4. placeholder/focus lifecycle lanes
5. editor recreation lanes
6. no-effect-mirroring lanes for controlled or derived UI

## Exit Criteria

`slate-react-v2` is real enough when:

1. The runtime reads committed snapshots only.
2. The main hook paths are `useSyncExternalStore`-backed and selector-first.
3. Broad editor-wide rerenders are no longer the default rendering model.
4. Derived values are calculated during render instead of mirrored with effects.
5. Editor writes originate from event handlers, commands, or explicit runtime boundaries, not effect watchers.
6. Effect-driven event logic uses `useEffectEvent` instead of dependency-array hacks.
7. Hidden/background UI can use `<Activity>` without state corruption or stale-editor weirdness.
8. The runtime can explain what is urgent and what is deferred without hand-wavy “React will figure it out” nonsense.
