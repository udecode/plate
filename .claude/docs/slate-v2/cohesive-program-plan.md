---
date: 2026-04-02
topic: slate-v2-cohesive-program-plan
---

# Slate v2 Cohesive Program Plan

## Purpose

This is the connective plan for Slate v2.

It sits above the engine brainstorm, issue-driven requirements, roadmap, and core-foundation spec.

Its job is simple:

- lock the real decisions
- name the pivots we still allow
- define the proof gates between phases

Without this file, the work risks drifting into a pile of good-looking local docs with no hard sequencing or stop/go logic.

## Inputs

- [engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/engine.md)
- [dom-runtime-boundary-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/dom-runtime-boundary-spec.md)
- [react-runtime-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/react-runtime-spec.md)
- [issue-clusters.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/issue-clusters.md)
- [package-impact-matrix.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/package-impact-matrix.md)
- [requirements-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/requirements-from-issues.md)
- [roadmap-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/roadmap-from-issues.md)
- [core-foundation-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/core-foundation-spec.md)

## What Is Locked

These are not open design questions anymore.

1. Slate v2 stays data-model-first.
2. Operations stay first-class externally.
3. Transactions are the internal execution model.
4. Core publishes immutable committed snapshots.
5. Stable runtime identity exists outside serialized JSON.
6. Runtime ownership is explicit:
   - `slate-v2` owns engine semantics
   - `slate-dom-v2` owns the DOM bridge
   - `slate-react-v2` owns the React runtime
   - `slate-history-v2` owns transaction-aware history
   - `slate-hyperscript-v2` stays supporting, not central
7. `slate-react-v2` targets React `19.2+` and does not carry React 18 compatibility debt.
8. The roadmap order is dependency order, not issue-count theater.

## What Can Still Pivot

These are allowed to change while the prototype proves itself.

1. The exact public transaction seam name.
   `Editor.withTransaction(...)` is the right Phase 1 placeholder, not a sacred final API.
2. The exact `SnapshotIndex` contents.
   The lock is stable runtime identity and lookup, not one perfect index structure on day one.
3. The internal lowering pipeline shape.
   The lock is op-first externally plus transaction-first internally, not a frozen set of internal modules.
4. Whether middleware phases are part of early v2 or later v2.
   The lock is “stop using wrapper soup as the engine model,” not “ship the final plugin pipeline immediately.”
5. Where some helper seams live between `slate-v2`, `slate-dom-v2`, and `slate-react-v2`.
   The lock is package ownership direction, not every helper path.

## What Must Not Pivot

If any of these wobble, stop and re-decide before writing more code.

1. Do not make the core React-shaped.
2. Do not give up the op-first external model.
3. Do not pull DOM or browser recovery logic into `slate-v2`.
4. Do not start with compatibility shims as the main architecture.
5. Do not let docs, examples, or migration concerns freeze core seams early.

## Program Shape

This is the only sane sequence.

### Phase 0

Lock the contract and harnesses.

Deliver:

- frozen principles
- frozen package ownership
- frozen `slate-dom-v2` runtime-boundary contract
- frozen `slate-react-v2` runtime contract
- frozen red-test lanes
- frozen benchmark lanes

Proof to move on:

- no contradiction between the engine doc, the runtime specs, the requirements doc, the roadmap, and the core-foundation spec

### Phase 1

Build `packages/slate-v2`.

Deliver:

- transaction runner
- immutable committed snapshots
- core-owned snapshot store contract
- runtime identity sidecar
- explicit external replacement seam
- normalization debt inside the transaction
- refs, marks, and selection at the commit boundary

Proof to move on:

- the first core red-test lanes have a real home
- the first core benchmark lane is runnable
- the execution model is visibly cleaner than current Slate, not just renamed
- the core demonstrably satisfies the contracts forced on it by `slate-dom-v2` and `slate-react-v2`
- the core can power runtime subscriptions and external replacement without effect mirroring or published-state mutation hacks

### Phase 2

Build `slate-dom-v2`.

Deliver:

- DOM point/path translation over runtime identity
- dedicated selection bridge
- nested-editor and shadow-DOM boundary rules
- browser-facing composition and beforeinput contract

Proof to move on:

- top DOM-path and selection lanes pass through the new bridge
- DOM ownership is explicit instead of leaking across packages

### Phase 3

Build `slate-react-v2`.

Deliver:

- snapshot-driven store
- `useSyncExternalStore`-backed selector subscriptions
- selector subscriptions
- stable editor instance semantics
- controlled/external update sanity
- explicit no-effect-mirroring runtime rules

Proof to move on:

- rerender-breadth lanes move materially
- the runtime no longer depends on half-mutated editor state
- controlled and derived UI paths do not rely on effect-driven state mirroring or effect-chained commands

### Phase 4

Add `slate-history-v2` and explicit clipboard boundaries.

Deliver:

- transaction-aware undo units
- collaboration-safe grouping rules
- internal fragment ownership and import/export seams

Proof to move on:

- history grouping is explained by transaction boundaries, not timing luck
- clipboard and foreign-format behavior stop depending on implicit coupling

### Phase 5

Cash out the architecture on the chronic bug families.

Target:

- mobile, IME, and input semantics
- selection, focus, and DOM bridge
- React runtime identity and subscription breadth

Proof to move on:

- top chronic runtime lanes are green against the new stack

### Phase 6

Benchmark-driven hardening.

Proof to move on:

- performance claims are backed by frozen lanes with real before/after numbers

### Phase 7

Public surface, docs, examples, and migration story.

Proof to move on:

- package seams have stopped moving enough to document honestly

## Pivot Gates

These are the points where the program is allowed to change direction on purpose instead of rotting by drift.

### Gate A: After Phase 0

Question:

- do the principle stack, runtime specs, requirements, roadmap, and package split still agree?

If no:

- stop
- fix the contradiction in docs before implementation starts

### Gate B: After the first `slate-v2` spike

Question:

- can the prototype stay op-first externally while becoming transaction-first internally without turning into wrapper sludge again?

If no:

- pivot the execution model before any DOM or React package work

### Gate C: After the first red tests and `#6038` lane

Question:

- does the new core buy cleaner semantics and benchmark leverage, or just new nouns?

If no:

- kill the bad seam early
- do not “push through” on faith

### Gate D: After the `slate-dom-v2` bridge spike

Question:

- is DOM ownership actually contained, or is browser-state debt still leaking back into core and React?

If it leaks:

- adjust the package seam before `slate-react-v2` grows around the wrong bridge

### Gate E: After the `slate-react-v2` snapshot spike

Question:

- do selector subscriptions, stable identity, and committed snapshots actually move rerender breadth and stale-instance pain?

If not:

- revisit identity and snapshot design before widening the React API

### Gate F: Before docs and migration

Question:

- are the package seams stable enough to teach without lying?

If not:

- keep docs thin
- do not turn unstable surfaces into public promises

## Frozen First Tranche

Do not boil the ocean.

Start with:

1. [dom-runtime-boundary-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/dom-runtime-boundary-spec.md)
2. [react-runtime-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/react-runtime-spec.md)
3. back-pressure [core-foundation-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/core-foundation-spec.md) from those contracts
4. `packages/slate-v2`
5. core red-test lanes:
   - `#5977`
   - `#5874`
   - `#5811`
   - `#5972`
6. first benchmark lane:
   - `#6038`

Frozen later, not first:

- `slate-dom-v2`
- `slate-react-v2`
- IME gauntlet lanes
- rerender-breadth gauntlet lanes
- docs/examples/migration

Why:

- the runtime boundary owns most issue pressure, and the core contract is not real until `slate-dom-v2` and `slate-react-v2` have forced it to answer the hard questions

## Evidence Loops

Every phase needs all three of these.

1. Design proof
   - the phase matches the locked principles
2. Correctness proof
   - red-test lanes exist and pass at the right layer
3. Performance proof
   - relevant benchmark lanes exist before optimization claims

No phase gets to advance on vibes alone.

## Anti-Drift Rules

1. Do not start `packages/slate-v2` implementation before the `slate-dom-v2` and `slate-react-v2` package specs are accepted.
2. Do not start IME patchwork before `slate-dom-v2` owns the browser bridge.
3. Do not let support-noise issues distort the architecture lane.
4. Do not treat old examples as a source of truth for new package seams.
5. Do not add “temporary” compatibility layers without writing down the debt explicitly.
6. Do not claim performance wins without the frozen benchmark lanes.

## Immediate Next Step

The runtime specs now exist. The next real move is the first `packages/slate-v2` prototype.

That means:

1. treat `dom-runtime-boundary-spec.md` and `react-runtime-spec.md` as hard constraints
2. create the package skeleton for `slate-v2`
3. wire the first red-test and benchmark harnesses
4. stop again at Gate B before widening the surface

That is the best plan.

It is opinionated enough to move, and still leaves the right seams open for a real pivot instead of fake certainty.
