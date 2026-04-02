---
date: 2026-04-02
topic: slate-v2-requirements-from-issues
pilot: false
pilot_scope: 682 open issues
repo: ianstormtaylor/slate
---

# Slate v2 Requirements From Issues

## Scope

This file turns all `682` fully triaged open Slate issues into actual v2 requirements.

The `682` count is the frozen `2026-04-02` research snapshot.

Post-snapshot maintainer triage update:

- Dylan executed Batch A
- `54/54` queued issues are now closed
- live repo open-issue count is `628`

It is not a feature wishlist.

It is not a migration plan.

It is the constraint set a Slate v2 proposal should satisfy if it wants to solve the real recurring pain instead of just sounding cleaner on paper.

## Inputs

- issue ledger: [open-issues-ledger.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/open-issues-ledger.md)
- issue clusters: [issue-clusters.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/issue-clusters.md)
- package ownership: [package-impact-matrix.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/package-impact-matrix.md)
- v2 engine direction: [engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/engine.md)

## Corpus Snapshot

The full-corpus rescore says:

- `Mobile, IME, And Input Semantics`: `129` issues, highest priority score
- `Selection, Focus, And DOM Bridge`: `172` issues, biggest raw cluster
- `React Runtime, Identity, And Subscription Model`: `111` issues
- `Performance And Scalability`: only `13` issues, but second-highest priority score because the leverage is real
- decorations, marks, and annotations are a real cross-cutting seam: `19` explicitly-tagged issues plus adjacent selection and perf fallout

The package split says:

- runtime-boundary ownership: `407`
- core-engine ownership: `113`
- maintainer-noise: `162`

That is the hard constraint. The issue corpus still does not say “replace Slate’s JSON model.” It says “stop leaking runtime, DOM, and input-method debt into normal editing.”

It also says `slate-react` has a specific render-time projection gap around decorations, marks, and annotation anchors. That seam was easy to bury inside broader runtime themes, but it keeps recurring and it needs a first-class answer.

## North Star

Slate v2 should be:

- data-model-first
- op-first externally
- transaction-first internally
- React-optimized at runtime
- explicit about DOM ownership

That is the straightest reading of the full corpus.

The corpus does not justify making the core React-shaped.

The corpus absolutely does justify making the runtime stop fighting React, the browser, and input methods.

## Non-Negotiables

1. Keep the serialized document model simple.
2. Keep operations first-class for transforms, history, and collaboration.
3. Stop leaking mutable in-flight editor state into the runtime.
4. Make DOM selection and input ownership explicit instead of incidental.
5. Treat `slate-react` and `slate-dom` as first-class runtime packages, not adapters that mop up core timing debt.

## Requirements

## R1. Preserve the Simple Slate Document Model

**Owner:** `slate-v2`

The core document should still look like a sane JSON document a user could store directly.

What this means:

- no renderer-shaped node model
- no required React-facing props in serialized nodes
- no opaque engine-only wrappers around every public node

What this does not ban:

- runtime-only stable identity
- runtime indexes
- commit metadata outside the serialized document

Why this is required:

- the full corpus still does not show users rejecting the model
- the pain is mostly runtime-boundary pain, not “the JSON shape is wrong”
- collaboration and op-based workflows depend on keeping the model legible

## R2. Keep Operations as the Canonical External Primitive

**Owner:** `slate-v2`

Transactions should change how Slate executes edits, not what the public primitive is.

What this means:

- transforms still lower to operations
- history still reasons over operations
- collaboration and remote editing stay viable on top of operations
- transactions become commit and execution boundaries, not a replacement for the op layer

Why this is required:

- core-model pressure is smaller than runtime pain, but still real: `69` issues
- the engine can get much cleaner without throwing away the op model
- this is the cleanest way to improve execution without discarding Slate’s strongest abstraction

Representative evidence:

- `#5977`
- `#5771`
- `#5533`
- `#4750`

## R3. Make Transactions the Native Execution Model

**Owner:** `slate-v2`

The core should execute edits in transactions and publish immutable committed snapshots.

What this means:

- draft mutation stays private to the active transaction
- normalization debt is owned by the transaction
- refs, marks, selection, and history metadata move with the transaction
- commit publishes one coherent new snapshot

Why this is required:

- batch-engine work already proved this is the right direction internally
- runtime issues keep clustering around partial mutable state, not around “lack of API sugar”
- this is the cleanest way to stop leaking timing debt into `slate-react`

Representative evidence:

- `#6038`
- `#5709`
- `#5131`
- `#5274`

## R4. Introduce Stable Runtime Identity Without Polluting Serialized JSON

**Owner:** `slate-v2`

Slate needs stable runtime identity for nodes, selections, and subscriptions.

What this means:

- path is location, not the only identity model
- runtime selectors can subscribe by stable node identity
- reordering and replacement do not force React remount roulette

What this does not mean:

- storing React keys in the persisted document
- abandoning paths

Why this is required:

- many runtime issues are really identity issues wearing different clothes
- nested editors, editor replacement, selection restoration, and rerender scope all get easier with real identity
- this is one of the main bridges between the core engine work and the runtime work

Representative evidence:

- `#5697`
- `#5709`
- `#5117`
- `#4842`

## R5. Split Runtime Ownership Cleanly Between `slate-react-v2` and `slate-dom-v2`

**Owner:** shared

The runtime must stop acting like one blurry package boundary.

What this means:

- `slate-dom-v2` owns DOM point/path translation, clipboard DOM formats, selection bridge mechanics, shadow DOM ownership, nested editor DOM boundary rules
- `slate-react-v2` owns subscriptions, lifecycle, focus timing, placeholder/render timing, editor replacement semantics, React-facing event/lifecycle integration, and render-time decoration or annotation projection
- `slate-v2` owns the stable range and mark semantics those runtime projection layers depend on

Why this is required:

- the issue corpus is full of cross-package runtime failures
- runtime-boundary ownership is `407`, dwarfing core-engine ownership at `113`
- at least `19` explicitly-tagged issues sit on the decorations or marks or annotations seam alone
- forcing those issues back into `slate` would just recreate the same design debt

Representative evidence:

- `#5947`
- `#5938`
- `#5749`
- `#5152`
- `#5004`
- `#5987`
- `#3354`
- `#3383`
- `#2465`
- `#4477`

## R6. Make Selection a Dedicated Runtime Subsystem

**Owner:** `slate-dom-v2` + `slate-react-v2`

Selection should no longer be incidental glue spread across render timing, event handlers, and fallback repairs.

What this means:

- explicit DOM selection bridge
- explicit ownership rules when selection starts outside the editor or crosses nested editors
- explicit focus restoration semantics
- explicit cursor behavior around inline voids, zero-width boundaries, tables, and shadow DOM

Why this is required:

- selection/focus/DOM bridge is the biggest raw cluster at `172`
- `118` of those issues land in runtime-boundary ownership
- many of the ugliest bugs are crash-class or cursor-loss bugs

Representative evidence:

- `#6034`
- `#4789`
- `#4839`
- `#4881`
- `#5826`

## R7. Make Input, Composition, And IME Semantics First-Class

**Owner:** `slate-react-v2` + `slate-dom-v2`

IME and mobile input cannot keep living as “we’ll special-case browsers forever.”

What this means:

- explicit composition lifecycle ownership
- explicit placeholder and empty-state behavior during composition
- explicit Android and iOS selection/input reconciliation rules
- input suppression and beforeinput interception that does not desync DOM and model

Why this is required:

- mobile, IME, and input is the highest-priority theme in the full corpus
- `124` of its `129` issues land in runtime-boundary ownership
- this is not recent churn, it is chronic debt

Representative evidence:

- `#6022`
- `#5989`
- `#5984`
- `#5931`
- `#5175`
- `#4962`

## R8. Make `slate-react-v2` Snapshot-Driven And Selector-First

**Owner:** `slate-react-v2`

`slate-react` should consume committed snapshots through narrow subscriptions.

What this means:

- selector-based subscriptions by default
- broad editor-wide rerenders treated as failure, not baseline
- hook APIs that align with snapshot reads instead of mutable editor poking
- cleaner behavior when editors are recreated, hidden, shown, or externally replaced

Why this is required:

- the React runtime cluster is `111` issues
- `105` of those land in runtime-boundary ownership
- rerender breadth, stale editor references, and lifecycle weirdness keep resurfacing

Representative evidence:

- `#5131`
- `#5709`
- `#5568`
- `#5213`
- `#4961`

## R9. Make History Transaction-Aware, Not Timing-Lucky

**Owner:** `slate-history-v2` + `slate-v2`

Undo and redo should align with transaction boundaries and operation grouping policy, not incidental render timing or browser side effects.

What this means:

- one coherent transaction can become one history unit when appropriate
- grouping rules are explicit
- external-editor interference or composition churn should not corrupt grouping

Why this is required:

- the history cluster is smaller than runtime pain, but high leverage
- if v2 only fixes rendering and not history semantics, it is unfinished

Representative evidence:

- `#5533`
- `#5587`
- `#5250`
- `#5364`

## R10. Make Clipboard And Serialization Boundaries Explicit

**Owner:** `slate-dom-v2` + `slate-v2`

Clipboard behavior and external document formats need a cleaner boundary than “whatever the current fragment format happens to be.”

What this means:

- explicit internal fragment format ownership
- cleaner HTML and plain-text import and export seams
- less accidental coupling between Slate internals and foreign editors
- configurable boundaries where the corpus clearly asks for them

Why this is required:

- the clipboard and serialization cluster is only `37` issues, but `27` of those are runtime-boundary pressure
- these issues are not just parser bugs; they are boundary-design bugs

Representative evidence:

- `#5233`
- `#5328`
- `#5630`
- `#4802`
- `#4906`

## R11. Tighten the Public API and Type Surface

**Owner:** `slate-v2`, then `slate-react-v2`, then `slate-hyperscript-v2`

The API should be easier to reason about, not just more powerful.

What this means:

- guards and type helpers that match actual runtime guarantees
- sharper ownership around document replacement, editor creation, and extension seams
- less “expected this to work” ambiguity in hooks and helpers

Why this is required:

- typing and API issues are too persistent to dismiss as docs complaints
- but they do not justify making the core bigger or more magical

Representative evidence:

- `#5287`
- `#5246`
- `#6013`
- `#4759`
- `#5599`

## R12. Keep Docs, Examples, And Support Debt Out of the Architecture Core

**Owner:** docs/examples/repo

This is a real maintenance lane. It is not a v2 engine requirement.

What this means:

- examples must be treated as supported surfaces
- docs/example drift should get its own cleanup roadmap
- support noise, stale issues, and old repo churn should not distort package-level v2 decisions

Why this is required:

- maintainer-noise is `162` issues
- docs and support churn are large enough to poison architecture conversations if they are not explicitly separated

Representative evidence:

- `#6007`
- `#4956`
- `#5212`
- `#4882`

## R13. Keep Performance Work Benchmark-Driven

**Owner:** shared

Performance requirements should stay attached to explicit workloads.

What this means:

- benchmark lanes for large-doc editing, selection lag, paste cost, and subscription churn
- no “v2 will be faster” hand-waving
- no perf claims that are not anchored to reproducible workloads

Why this is required:

- perf issue count is low, but it ranks second on priority score
- the benchmark map already shows the right starting lanes

Representative evidence:

- `#6038`
- `#5992`
- `#5945`
- `#5216`
- `#5131`

## Package-First Requirement Split

### `slate-v2`

Must deliver:

- transaction execution model
- immutable committed snapshots
- op-first external contract
- stable runtime identity
- clearer normalization and selection ownership contracts

Must not drift into:

- browser workaround dumping ground
- React lifecycle glue

### `slate-react-v2`

Must deliver:

- selector subscriptions
- snapshot consumption
- focus and render lifecycle correctness
- controlled and external update sanity
- IME-safe runtime behavior on top of the core contract

Must not drift into:

- private core semantics hidden in hooks
- low-level DOM translation responsibility

### `slate-dom-v2`

Must deliver:

- DOM point/path translation
- selection bridge
- clipboard DOM boundaries
- shadow DOM and nested editor boundary rules
- browser-facing input and hit-testing behavior that is not React-specific

Must not drift into:

- general React subscription policy
- history semantics

### `slate-history-v2`

Must deliver:

- transaction-aware undo units
- explicit grouping semantics
- collaboration-safe history boundaries

### `slate-hyperscript-v2`

Must deliver:

- better fixture and document authoring ergonomics
- better test and helper typing where justified

## Non-Goals

These are not justified by the current corpus:

- making the core React-shaped
- turning Slate into a batteries-included editor product
- solving every browser quirk inside `slate-v2`
- growing the core API just because examples and docs were weak
- letting docs/support noise count as architecture pressure

## Sharp Conclusions

1. The full corpus does not justify replacing Slate’s document model.
2. The full corpus absolutely justifies replacing Slate’s execution model.
3. `slate-react-v2` and `slate-dom-v2` need to stop being cleanup crews for core timing debt.
4. The best v2 shape is data-model-first, op-first externally, transaction-first internally, React-optimized at runtime.
5. If a v2 proposal cannot show how it reduces runtime-boundary pain, it is missing the actual point.

## Next Artifact

The next useful file is:

- [roadmap-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/roadmap-from-issues.md)

That should turn these requirements into a staged build order instead of leaving them as architecture doctrine.
