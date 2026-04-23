---
date: 2026-04-02
topic: slate-v2-cohesive-program-plan
---

# Slate v2 Cohesive Program Plan

> Archive only. Historical/reference doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This is the historical connective plan for Slate v2.

It sits above the engine brainstorm, issue-driven requirements, roadmap, and core-foundation spec.

Its old job was:

- lock the real decisions
- name the pivots we still allow
- define the proof gates between phases

Without this file, the work risks drifting into a pile of good-looking local docs with no hard sequencing or stop/go logic.

## Status

Historical program record.

The numbered phase ladder is complete enough to freeze.
Do not treat this file as the active default queue.

Use:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/package-end-state-roadmap.md)

only if package-level work or `Target B` work reopens.

The package-level anti-drift gate now lives in
[package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/package-end-state-roadmap.md).

Historical ownership read:

- this file used to own numbered program phases
- it no longer owns the active queue
- for current queue and roadmap truth, use:
  - [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)

Historical execution note:

- this rule belonged to the old phase-program flow
- current execution should follow:
  - [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
  - [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)

## Inputs

- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [final-synthesis.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/final-synthesis.md)
- [issue-clusters.md](/Users/zbeyens/git/plate-2/docs/slate-issues/issue-clusters.md)
- [package-impact-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-issues/package-impact-matrix.md)
- [requirements-from-issues.md](/Users/zbeyens/git/plate-2/docs/slate-issues/requirements-from-issues.md)
- [roadmap-from-issues.md](/Users/zbeyens/git/plate-2/docs/slate-issues/roadmap-from-issues.md)
- [slate-browser overview](/Users/zbeyens/git/plate-2/docs/slate-browser/overview.md)
- [package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/package-end-state-roadmap.md)

## What Is Locked

These are not open design questions anymore.

1. Slate v2 stays data-model-first.
2. Operations stay first-class externally.
3. Transactions are the internal execution model.
4. Core publishes immutable committed snapshots.
5. Stable runtime identity exists outside serialized JSON.
6. Runtime ownership is explicit in the replacement-candidate repo:
   - `slate` owns engine semantics
   - `slate-dom` owns the DOM bridge
   - `slate-react` owns the React runtime
   - `slate-history` owns transaction-aware history
   - `slate-hyperscript-v2` stays supporting, not central
7. `slate-react` targets React `19.2+` and does not carry React 18 compatibility debt.
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
5. Where some helper seams live between `slate`, `slate-dom`, and `slate-react`.
   The lock is package ownership direction, not every helper path.

## What Must Not Pivot

If any of these wobble, stop and re-decide before writing more code.

1. Do not make the core React-shaped.
2. Do not give up the op-first external model.
3. Do not pull DOM or browser recovery logic into `slate-v2`.
4. Do not start with compatibility shims as the main architecture.
5. Do not let docs, examples, or migration concerns freeze core seams early.
6. Do not pull pagination, semantic services, or lightweight native-input work down into `slate-v2`.
7. Do not invent a standalone clipboard package before the boundary is proved inside `slate-v2` + `slate-dom`.
8. Do not use coverage percentage as the north star for the testing roadmap.
   The lock is meaningful public-behavior tests at the right lane, not bullshit coverage theater.
9. Do not leave obvious testing seams as ad hoc glue when building v2.
   If a missing helper or assertion API would materially improve test honesty or developer UX, add it while the seam is hot.

## Program Shape

This is the only sane sequence.

### Phase 0

Lock the contract and harnesses.

Deliver:

- frozen principles
- frozen package ownership
- frozen `slate-dom` runtime-boundary contract
- frozen `slate-react` runtime contract
- frozen red-test lanes
- frozen benchmark lanes
- frozen testing-framework direction through `slate-browser`

Proof to move on:

- no contradiction between the engine doc, the runtime specs, the requirements doc, the roadmap, and the core-foundation spec

### Phase 1

Build `packages/slate`.

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
- the core demonstrably satisfies the contracts forced on it by `slate-dom` and `slate-react`
- the core can power runtime subscriptions and external replacement without effect mirroring or published-state mutation hacks

### Phase 2

Build `slate-dom`.

Deliver:

- DOM point/path translation over runtime identity
- dedicated selection bridge
- nested-editor and shadow-DOM boundary rules
- browser-facing composition and beforeinput contract

Proof to move on:

- top DOM-path and selection lanes pass through the new bridge
- DOM ownership is explicit instead of leaking across packages

### Phase 3

Build `slate-react`.

Deliver:

- snapshot-driven store
- `useSyncExternalStore`-backed selector subscriptions
- selector subscriptions
- stable editor instance semantics
- controlled/external update sanity
- explicit no-effect-mirroring runtime rules
- default large-document-safe rendering posture:
  - active-slice invalidation
  - semantic islands
  - active editing corridor
  - default occlusion outside the corridor
- explicit measurement split:
  - live DOM geometry for the active corridor
  - optional deterministic planning geometry for inactive islands

Proof to move on:

- rerender-breadth lanes move materially
- the runtime no longer depends on half-mutated editor state
- controlled and derived UI paths do not rely on effect-driven state mirroring or effect-chained commands
- large-doc behavior is good by default before virtualization enters the picture
- any deterministic measurement helper, including `Pretext`, is clearly scoped to inactive planning rather than active editing correctness

### Phase 4

Add `slate-history` and explicit clipboard boundaries.

Deliver:

- transaction-aware undo units
- collaboration-safe grouping rules
- internal fragment ownership and import/export seams

The recommended sub-order inside Phase 4 is:

1. `slate-history` proof first
2. clipboard-boundary proof second

Why:

- history depends directly on committed transaction boundaries
- clipboard depends on a clean `slate-dom` + `slate` boundary
- they belong in the same phase, but they are not equally sharp as first slices

Current status:

- Phase 4 is functionally complete and historical.
- History and clipboard boundaries are proved.
- The adjacent structural follow-on seams that once lived here are also proved.
- Use the live replacement docs for current truth instead of treating this phase
  log as the current verdict.

Proof to move on:

- history grouping is explained by transaction boundaries, not timing luck
- clipboard and foreign-format behavior stop depending on implicit coupling

### Phase 5

Cash out the architecture on the chronic bug families.

Target:

- mobile, IME, and input semantics
- selection, focus, and DOM bridge
- React runtime identity and subscription breadth

Compatibility posture inside Phase 5:

- keep porting targeted legacy tests when they prove a live seam
- prefer narrow compatibility lifts tied to:
  - clipboard
  - projection and annotation anchors
  - range refs
  - DOM selection and zero-width behavior
- do not migrate the whole legacy suite yet while renderer and DOM-shape policy are still moving
- route browser-facing proof work through `slate-browser` lanes:
  - Bun for pure fast tests
  - Vitest browser for contract tests
  - Playwright for example/e2e
  - Playwright + CDP for IME
- keep the TDD bar high:
  one public behavior per test when possible, no implementation-coupled noise

Proof to move on:

- top chronic runtime lanes are green against the new stack
- renderer and input-policy seams are explicit enough that compatibility work is no longer freezing unstable boundary guesses

Current status inside Phase 5:

- Phase 5 is functionally complete and historical.
- The anchor runtime, IME, selection, and renderer seams are proved enough to
  support the current default recommendation.
- Deeper geometry work is selective follow-on only, not the default queue.

### Phase 6

Benchmark-driven hardening.

Compatibility posture inside Phase 6:

- start the broad backward-compat harness only after the structural and chronic runtime seams have stopped moving
- this is the right phase to widen from cherry-picked legacy tests to a real v1-to-v2 compatibility matrix
- by this point, the work should be measuring and stabilizing behavior, not still redefining package boundaries

Current status:

- Phase 6 is functionally complete and historical.
- The frozen compatibility harness and benchmark lanes exist.
- Use [phase6-hardening.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/phase6-hardening.md) only for the detailed benchmark record.

Proof to move on:

- performance claims are backed by frozen lanes with real before/after numbers

### Phase 7

Proof-before-prose public-surface cashout.

Deliver:

- explicit replacement/reset contract for the anchor surface
- documented compatibility envelope
- curated legacy test migration story
- explicit statement of which old behaviors are intentionally preserved, intentionally dropped, or intentionally redefined
- a documented `slate-browser` matrix that explains which lane owns which kind of proof
- inline-family migration stays on app-owned v2-native runtime seams instead of
  restoring legacy plugin override architecture

Legacy recovery ledger for the hard-cut replacement candidate repo:

- the replacement candidate hard-cut the old repo surfaces instead of carrying
  legacy package/example/test coexistence inside `slate-v2`
- comparison-only recovery belongs in `../slate`
- only v2-native rebuilt surfaces should come back into `slate-v2`

Recovery rules:

- do **not** restore any of those surfaces into `slate-v2` during rename or
  React 19 work
- comparison-only recovery belongs in `../slate`
- `/Users/zbeyens/git/slate-v2` is the replacement candidate and must stay
  free of restored legacy package surfaces
- only restore an item into `slate-v2` when it is rewritten as a v2-native
  surface

Ordered recovery:

1. keep legacy recovery in `../slate`
2. rebuild only v2-native proof/example surfaces in `slate-v2`
3. consume comparison data without re-importing legacy package surfaces

Current Phase 7 state:

- Phase 7 is functionally complete and historical.
- It established the compatibility envelope, migration story, and first
  v2-native public-surface cashout.

Proof to move on:

- package seams have stopped moving enough to document honestly

### Phase 8

Package API shaping.

Deliver:

- explicit stable-vs-advanced surface split for `slate-react`
- conservative HTML-formatting expansion only on the current app-owned runtime seam
- stabilized `slate-browser` lane ownership and maintained `ready` contract
- only forced lower-layer adjustments in `slate`, `slate-dom`, `slate-history`

Current status:

- Phase 8 is functionally complete and historical.
- Package API shaping landed, and exact package-level follow-on ownership now
  lives in [package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/package-end-state-roadmap.md).

Proof to move on:

- package APIs are sharper without fake compatibility theater
- browser-visible semantics for the active slice are green in `slate-browser`
- lower-layer packages changed only where the active slice proved a real gap

### Phase 9

Replacement-envelope expansion.

Deliver:

- broader cross-repo compatibility matrix
- explicit preserved / dropped / redefined ledger by legacy family
- broader benchmark coverage beyond the current frozen lanes
- tighter migration guidance by behavior family

Proof to move on:

- replacement claims are backed by a materially wider matrix
- migration guidance is honest by family instead of vague repo-wide optimism

Current status:

- Phase 9 is broad enough and historical for the current checkpoint.
- The replacement-family ledger and scoreboard own the live family/evidence read.
- Further Phase 9 work should be selective only when it materially changes the
  replacement decision.

### Phase 10

Release-readiness gate.

Deliver:

- frozen honest public TS API across packages
- aligned package READMEs and public docs
- explicit decision on:
  - credible replacement candidate
  - or honest full replacement

Current status:

- Phase 10 is functionally complete for the current checkpoint.
- The live gate is:
  - `Target A`: `Go`
  - `Target B`: `No-Go`
- The release-readiness, family-ledger, blocker, and scoreboard docs now own
  the live replacement truth.
- Default next work after Phase 10 is implementation, shipping, or selective
  `Target B` expansion.
- the next narrow selection-helper slice is now real too:
  `Transforms.setSelection(...)`, `Transforms.deselect(...)`, and live
  draft-selection reads inside outer transactions
- the next narrow selection-helper follow-on is now real too:
  `Transforms.collapse(...)`, live draft-selection reads, and edge-based
  collapse semantics
- the next selection-motion starter slice is now real too:
  `Transforms.move(...)`, `distance` / `reverse` / edge-based motion,
  mixed-inline movement inside one supported top-level text block, supported
  top-level block-boundary crossings, and live draft-selection reads
- the next location seam starter slice is now real too:
  `Editor.before(...)`, `Editor.after(...)`, `Path | Point | Range` support,
  mixed-inline location walking inside one supported top-level text block,
  supported top-level block-boundary crossings, and live draft-tree reads
- the next point-update follow-on is now real too:
  `Transforms.setPoint(...)`, live draft-selection reads, and edge-based point
  targeting
- the next `select(...)` follow-on is now real too:
  `Path | Point | Range | null` support plus exact node-range selection from
  paths and collapsed selection creation from points
- the next `delete(...)` starter slice is now real too:
  exact `{ at: Path }` support plus live draft-tree deletion inside outer
  transactions
- the next collapsed `delete(...)` follow-on is now real too:
  `reverse` / `distance`, explicit `Point`, current collapsed selection
  support, mixed-inline sibling-leaf crossings inside one supported top-level
  block, and `Editor.before(...)` / `Editor.after(...)`-backed targeting
- the next cross-block collapsed `delete(...)` follow-on is now real too:
  adjacent supported top-level block-boundary crossings with same-type /
  same-props block merges
- the next explicit-range `delete(...)` follow-on is now real too:
  explicit non-empty `Range`, current non-empty selection when `at` is omitted,
  and adjacent mixed-inline sibling-leaf crossings inside one supported
  top-level block
- the next cross-block explicit-range `delete(...)` follow-on is now real too:
  adjacent supported top-level block-boundary crossings with same-type /
  same-props block merges
- the next wider mixed-inline-range `delete(...)` follow-on is now real too:
  fully covered interior descendants between the start/end edges inside one
  supported top-level block

Proof to close the roadmap by default:

- docs, package surfaces, and scoreboard all tell the same truth
- no package still has unresolved "temporary" queue-shaping ambiguity

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

### Gate D: After the `slate-dom` bridge spike

Question:

- is DOM ownership actually contained, or is browser-state debt still leaking back into core and React?

If it leaks:

- adjust the package seam before `slate-react` grows around the wrong bridge

### Gate E: After the `slate-react` snapshot spike

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

### Gate G: Before chronic bug-family cleanup

Question:

- are all structural package seams actually proven, including clipboard boundaries?

If not:

- do not jump to the chronic runtime clusters yet
- finish the missing structural seam first

Current read:

- this gate is cleared for clipboard, projection, range-ref, and zero-width bridge ownership
- the remaining open lane is release-shaped Phase 5 cashout on the anchor
  surface, not another cross-package structural blur

## Frozen First Tranche

Do not boil the ocean.

Start with:

1. [Part III. DOM Runtime Boundary Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-iii-dom-runtime-boundary-spec)
2. [Part IV. React Runtime Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-iv-react-runtime-spec)
3. back-pressure [Part II. Core Foundation Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-ii-core-foundation-spec) from those contracts
4. `packages/slate`
5. core red-test lanes:
   - `#5977`
   - `#5874`
   - `#5811`
   - `#5972`
6. first benchmark lane:
   - `#6038`

Frozen later, not first:

- `slate-dom`
- `slate-react`
- IME gauntlet lanes
- rerender-breadth gauntlet lanes
- docs/examples/migration

Why:

- the runtime boundary owns most issue pressure, and the core contract is not real until `slate-dom` and `slate-react` have forced it to answer the hard questions

## Evidence Loops

Every phase needs all three of these.

1. Design proof
   - the phase matches the locked principles
2. Correctness proof
   - red-test lanes exist and pass at the right layer
3. Performance proof
   - relevant benchmark lanes exist before optimization claims

No phase gets to advance on vibes alone.

Testing rule:

- meaningful tests only
- public behavior over implementation detail
- no “raise coverage” work unless it closes a real blind spot in one of the
  `slate-browser` lanes
- proactively add missing nice testing APIs while developing `slate-v2` and its runtime packages when they remove repeated boilerplate or make the proof seam more honest

## Anti-Drift Rules

1. Do not start `packages/slate` implementation before the `slate-dom` and `slate-react` package specs are accepted.
2. Do not start IME patchwork before `slate-dom` owns the browser bridge.
3. Do not let support-noise issues distort the architecture lane.
4. Do not treat old examples as a source of truth for new package seams.
5. Do not add “temporary” compatibility layers without writing down the debt explicitly.
6. Do not claim performance wins without the frozen benchmark lanes.

## Current Default Next Work

The first proof packages now exist for core, DOM, React, and history.

The current default next work is:

1. keep the top-level `slate-v2` docs synced to the executed proof stack
2. treat Phase 7 public-surface cashout as historical work that is largely done
3. treat Phase 8 package API shaping as landed historical work
4. keep the exact package queue in
   [package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/package-end-state-roadmap.md)
5. keep compatibility claims inside the proved matrix
6. only add new geometry proof if a later lane fails for a real model reason
7. prefer implementation or shipping unless a new row or package seam
   materially changes the replacement claim

That means:

1. keep the package split
2. stop default geometry seam farming
3. stop pretending Phase 6 is still the live seam
4. publish from the hardened boundary, not from vibes

That is the best plan.

It is opinionated enough to move, and still leaves the right seams open for a real pivot instead of fake certainty.
