---
date: 2026-04-02
topic: slate-v2-dom-runtime-boundary-spec
---

# Slate DOM v2 Runtime Boundary Spec

## Purpose

This is the package-level contract for `slate-dom-v2`.

It exists to stop DOM ownership from smearing back into `slate-v2` and `slate-react-v2`.

This is the browser-facing runtime boundary:

- DOM point and path translation
- selection ownership
- composition and `beforeinput`
- clipboard DOM boundaries
- nested editor and shadow DOM rules

## Inputs

- [engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/engine.md)
- [core-foundation-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/core-foundation-spec.md)
- [requirements-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/requirements-from-issues.md)
- [roadmap-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/roadmap-from-issues.md)

## Locked Constraints

1. `slate-dom-v2` owns DOM translation and browser-boundary semantics.
2. `slate-dom-v2` does not own React subscription policy or hook design.
3. `slate-dom-v2` does not own core transform or normalization semantics.
4. `slate-dom-v2` consumes committed snapshots and runtime identity. It does not peek into draft state.
5. Selection repair must be explained by explicit bridge rules, not fallback timing accidents.
6. `slate-dom-v2` exposes browser-boundary primitives that `slate-react-v2` may wire through React lifecycle, without re-owning browser semantics there.

## Non-Goals

This package does **not** try to own:

- React hook ergonomics
- rerender breadth
- history grouping
- general plugin middleware design
- React 18 compatibility shims

## Core Contract Required From `slate-v2`

`slate-dom-v2` forces these guarantees onto the core:

1. Stable runtime identity for every committed node.
2. Committed snapshot lookup that can answer:
   - `id -> path`
   - `path -> id`
   - path lookup against the current committed tree
3. Atomic commit publication for:
   - `children`
   - `selection`
   - `marks`
   - refs-aligned lookup state
4. No DOM bridge read is allowed to observe half-committed state.
5. Selection-affecting edits must publish one coherent post-commit state before runtime subscribers are notified.

## Runtime Subsystems

### 1. DOM Identity And Lookup

`slate-dom-v2` needs a stable relationship between DOM nodes and committed editor identity.

That means:

- DOM elements map to runtime ids, not just current array positions
- path lookup is derived from committed snapshot state
- DOM lookup survives reordering because identity is stable

### 2. Selection Bridge

This package owns the browser selection bridge.

Responsibilities:

- map browser selections into editor ranges
- map editor ranges back into browser selections
- own the timing rules for post-commit selection repair
- define when selection outside the editor is ignored, preserved, or reclaimed

This bridge must explicitly handle:

- inline boundaries
- void boundaries
- zero-width sentinels
- tables
- nested editors
- shadow DOM

### 3. Composition And `beforeinput`

This package owns the browser event boundary for text entry.

Responsibilities:

- composition start/update/end coordination
- `beforeinput` interpretation
- DOM/model reconciliation during composition
- browser-owned quirks at the boundary instead of scattered userland repairs

Important rule:

- active composition is urgent work
- no deferred UI policy is allowed to make composition correctness “eventually consistent”

### 4. Clipboard Boundary

This package owns DOM clipboard formats and import/export seams.

Responsibilities:

- internal fragment ownership
- HTML/plaintext browser boundary
- foreign DOM ingestion hooks

### 5. Editor Boundary Rules

`slate-dom-v2` must define explicit ownership for:

- nested editor containment
- cross-window and iframe behavior
- shadow DOM host boundaries
- drag selection and hit-testing behavior

## Public Surface Direction

Phase 2 does not need a giant API.

It needs a small honest surface:

- DOM point/path translation helpers
- selection bridge primitives
- clipboard DOM helpers
- editor boundary registration and lookup helpers

Do **not** start with:

- React hooks here
- app-facing convenience wrappers for every browser quirk
- compatibility glue for old `slate-react` assumptions

## Acceptance Lanes

This package must be able to absorb these pressure classes honestly:

- `#5947`
- `#5938`
- `#5749`
- `#4789`
- `#4839`
- `#4881`
- `#6034`
- `#5826`

That means at minimum:

1. DOM path lookup lanes
2. selection-loss lanes
3. nested editor lanes
4. shadow DOM lanes
5. zero-width and void-boundary lanes
6. composition/beforeinput lanes

## Exit Criteria

`slate-dom-v2` is real enough to unblock `slate-react-v2` when:

1. DOM translation works against runtime identity, not path-only luck.
2. Selection ownership is explicit in code and tests.
3. Composition and `beforeinput` have one clear boundary owner.
4. Nested editor and shadow DOM semantics are intentional, not accidental.
5. `slate-react-v2` can consume this bridge without re-owning low-level DOM translation.
