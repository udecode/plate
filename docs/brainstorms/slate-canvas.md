---
date: 2026-04-09
topic: slate-canvas
status: active
---

# Slate Canvas

## Goal

Define a concrete experimental path for `html-in-canvas` as an optional runtime
adapter for `slate-v2` without pivoting the core architecture.

For this spike, “success” means:

1. we test whether `html-in-canvas` is a real runtime advantage for targeted
   editor surfaces
2. we do **not** destabilize the current `slate-v2` core path
3. we learn whether canvas-backed rendering is worth a future adapter package
4. we set hard kill criteria before the experiment grows teeth

## Problem Frame

Three separate signals are easy to blur together:

- [html-in-canvas](/Users/zbeyens/git/html-in-canvas/README.md) is an
  emerging browser primitive for drawing laid-out HTML into canvas with DOM
  synchronization
- [html-in-canvas-room](/Users/zbeyens/git/html-in-canvas-room/README.md)
  proves the compositing/demo story is real and visually compelling
- [pretext](/Users/zbeyens/git/pretext/README.md) proves deterministic text
  planning can be extremely useful away from the active DOM corridor

Those are all interesting.
They still do **not** imply that `slate-v2` should pivot its core around
canvas-first editing.

The current `slate-v2` architecture already chose the narrower and better
position:

- keep adapters explicit
- stay data-model-first in the core
- stay transaction-first in the engine
- keep React-optimized runtime as the reference runtime
- let other runtimes exist later if they fit cleanly

That is still the right call.

## Planning Decision

Do **not** pivot `slate-v2` core toward canvas-first editing.

Do **not** rebuild selection/caret/composition truth around canvas.

Run a hybrid runtime spike instead:

- keep the existing core and engine untouched
- keep DOM truth for the active editing corridor
- test `html-in-canvas` as an optional rendering adapter for targeted surfaces
- use `Pretext` only as a planning primitive where offscreen/layout estimation
  actually wins

This is the only sane route because:

- `html-in-canvas` still depends on DOM layout, DOM hit testing, and transform
  synchronization
- `html-in-canvas-room` proves a rendering trick, not editor-grade IME/history
  correctness
- `Pretext` is a measurement/layout engine, not a live editing runtime
- the current `slate-v2` rewrite is still finishing contract recovery, not
  shopping for a renderer reset

## Scope

### In scope

- one explicit experimental adapter spike
- canvas-backed rendering for narrow, high-value surfaces
- one offscreen-planning role for `Pretext`
- kill criteria and success metrics

### Out of scope

- changing `slate-v2` core semantics
- replacing DOM selection/caret/composition truth
- broad plugin/runtime migration
- claiming canvas-first as the new default runtime

## Relevant Current Truth

### HTML-in-Canvas proposal

What matters:

- it is still a proposal implemented behind a Chromium flag
- it draws laid-out HTML into canvas
- it returns transforms so DOM location can stay synchronized for hit
  testing/accessibility
- it supports 2D and WebGL/WebGPU variants

Why that matters:

- this is a hybrid DOM→canvas runtime primitive, not a pure “forget the DOM”
  primitive

### HTML-in-Canvas Room

What matters:

- it proves the “live webpage rendered into a 3D surface” story is real
- it uses transform-based event forwarding so interaction still rides native
  events

Why that matters:

- this is a strong proof-of-interest for projected/passive/editor-adjacent
  surfaces
- it is **not** evidence that a full editing corridor is better in canvas

### Pretext

What matters:

- `prepare()` is expensive but one-time
- `layout()` is the cheap arithmetic hot path
- it is built to avoid DOM reflow for multiline measurement/layout planning
- it already supports Canvas/SVG/WebGL-oriented use cases

Why that matters:

- it is valuable for planning, estimation, and offscreen layout
- it is not a renderer or editing model

### Slate v2 architecture constraint

The repo already says:

- do not collapse package boundaries
- good v2 idea, bad move for the current rewrite
- keep the core boring
- keep the engine explicit
- let `slate-react` be excellent
- `Pretext` is not a general rendering engine for `slate-react`
- do not route the active editing corridor through `Pretext`

That should stay the governing constraint.

## Thesis

If `html-in-canvas` becomes stable tomorrow, it is **not** proof that the best
future-proof editor is “canvas-first everywhere”.

The best future-proof editor architecture is:

- one boring explicit core
- one transaction-first engine
- one best-in-class DOM/React editing runtime
- optional specialized runtimes for:
  - projected surfaces
  - page surfaces
  - visual-effect-heavy surfaces
  - distant/offscreen rendering
  - export/media/3D views

Canvas is a strong runtime option.
It is not the new ontology.

## Spike Questions

This spike should answer only these:

1. Can `html-in-canvas` improve targeted `slate-v2` surfaces enough to justify
   an adapter package?
2. Which surfaces benefit:
   - read-only
   - page-like
   - offscreen/inactive
   - projected/3D
3. Where does it fail too hard:
   - IME/composition
   - caret fidelity
   - selection synchronization
   - accessibility
   - event forwarding brittleness
4. Does `Pretext` help for:
   - island sizing
   - pagination estimation
   - scroll-anchor stabilization
   - offscreen planning
   without being dragged into the live edit corridor?

## Implementation Units

### Unit 1. Define the runtime boundary explicitly

Files:

- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- `docs/brainstorms/slate-canvas.md`

Work:

- define one explicit runtime-adapter boundary between:
  - committed editor snapshots
  - DOM/browser semantics
  - optional canvas-backed rendering
- keep the core unchanged

Required output:

- canvas runtime is downstream of committed snapshots
- DOM selection/caret/composition truth stays outside the adapter

### Unit 2. Build the smallest believable adapter spike

Candidate location:

- a separate experimental package or playground lane, not the core package
  graph by default

Surfaces to test:

1. read-only `richtext` view
2. editable single-block surface
3. page-like or projected surface

Reason:

- these three surfaces tell you almost everything useful:
  - visual payoff
  - edit-corridor pain
  - layout/planning payoff

### Unit 3. Keep the active editing corridor on DOM truth

Work:

- active selection
- caret
- IME/composition
- accessibility focus semantics

Decision:

- keep these on the DOM/React side unless the spike proves otherwise with
  concrete wins

Blunt rule:

- no canvas-first active editing corridor in the first spike

### Unit 4. Give `Pretext` one honest role

Possible uses:

- estimating inactive island heights
- pre-sizing page surfaces
- preserving scroll anchors while waking distant surfaces
- planning paged or measured layouts

Explicit non-goals:

- caret placement
- live selection geometry authority
- composition/IME handling
- replacing DOM text truth

### Unit 5. Define metrics and kill criteria

Success metrics:

- lower render cost for targeted surfaces
- no accessibility regression on read-only/projection surfaces
- no obvious interaction brittleness on the limited editable spike
- page/projection surfaces feel materially better, not just different

Kill criteria:

- event forwarding stays fragile
- selection/caret drift is common
- IME/composition becomes cursed
- accessibility falls behind the DOM runtime
- the perf win is cosmetic only
- the adapter requires core-engine changes to feel viable

### Unit 6. Decide follow-up paths

If the spike fails:

- keep current `slate-v2` architecture
- maybe keep `Pretext` planning ideas only

If the spike succeeds narrowly:

- plan a dedicated optional runtime adapter package
- keep it off the default editor path

If the spike succeeds broadly:

- still do **not** pivot the core
- instead, define a multi-runtime architecture:
  - DOM/React editing runtime
  - canvas/projection runtime
  - maybe paged/layout runtime

## Recommended Order

1. finish current `slate-v2` contract recovery
2. create a separate experimental adapter lane
3. prove read-only and projected surfaces first
4. test one minimal editable corridor only after the passive surfaces look
   compelling
5. decide whether a real adapter package is justified

## Verification / Evaluation Criteria

This is a planning artifact, so no same-turn code verification is required.

But the future spike must include:

- visual comparison of DOM runtime vs canvas runtime on the same content
- interaction correctness checks for the narrow editable spike
- accessibility checks on the rendered surface
- render-cost measurements on the chosen target surfaces

## Hard Rules

- do not restart `slate-v2` around canvas
- do not route the active editing corridor through `Pretext`
- do not replace DOM truth for selection/caret/composition just because canvas
  looks cooler
- do not let a visually impressive demo bully the core architecture into a bad
  pivot
