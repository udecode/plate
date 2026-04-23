---
date: 2026-04-07
topic: slate-v2-architecture-contract
---

# Slate v2 Architecture Contract

> Reference doc. Not a live queue owner. For current queue and roadmap truth,
> see [../master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This is the canonical technical north star for `slate-v2`.

It losslessly consolidates the four adjacent design docs that were previously
competing for the same role:

- `engine.md`
- `core-foundation-spec.md`
- `dom-runtime-boundary-spec.md`
- `react-runtime-spec.md`

Use this file when you want the full technical contract in one place.

For the live replacement verdict, family truth, and blocker list, use:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)

## How To Read This

- Truth classes:
  - `Current invariant`
  - `Near-term required`
  - `Future direction`
- `Part I` is the greenfield architecture rationale.
- `Part II` is the core `slate` contract.
- `Part III` is the `slate-dom` boundary contract.
- `Part IV` is the `slate-react` runtime contract.

The old standalone docs are retired.
Use the part anchors below instead.

# Part I. Engine North Star

Truth class:

- `Future direction`

## Problem Frame

The current Slate rewrite is the best retrofit for the existing ecosystem:

- `editor.apply(op)` stays the one plugin seam
- `Editor.withBatch(editor, fn)` is the explicit batch boundary
- `Transforms.applyBatch(editor, ops)` is public sugar over the same engine

That path is correct for Slate today. It preserves plugin expectations and keeps the public API boring.

It is still a retrofit. The engine underneath is carrying real complexity:

- batch drafts
- observation barriers on `editor.children`
- dirty-path planners
- family-specific fast paths
- compatibility with plugins that wrap `editor.apply`

If Slate were starting from zero, this is not the engine I would choose.

## Goal

Sketch the best greenfield Slate engine, not a migration plan for the current rewrite.

## Status

Reference-only north-star doc.

Use this for architecture rationale and greenfield direction, not for the live
replacement verdict or the current execution queue.

For current truth, start with:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)

The target is a native transaction engine where batching is the default execution model instead of a compatibility layer welded onto per-op mutation.

Just as important: this should not be a fake-neutral core designed around every framework at once.

That means:

- keep Slate's simple document model as the top principle
- keep operations and collaboration viability first-class
- make transactions and immutable commits the native engine model
- make `slate-react` the reference runtime, not an adapter afterthought
- optimize the runtime for React without turning the core into a React-shaped ontology

The target is not "React in the core." The target is a better core that stops fighting React.

## Methodology

This brainstorm is intentionally not "framework-neutral architecture."

It is shaped by two constraints:

- the historical retrofit reality recorded in [slate-batch-engine.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/slate-batch-engine.md)
- official React `19.2+` runtime features and constraints:
  - https://react.dev/versions
  - https://react.dev/blog/2025/10/01/react-19-2
  - https://react.dev/reference/react/Activity
  - https://react.dev/reference/react/useEffectEvent

That is why the proposal keeps pushing on:

- immutable snapshots
- selector subscriptions
- stable node identity
- derive-don't-sync
- minimal subscription scope
- urgent editor commits with deferred derived UI
- React `19.2+` as the target runtime, not React 18 compromise mode

Those are not here because "React won, deal with it."

They are here because they improve the engine on its own merits and also happen to make a React runtime dramatically cleaner.

One more correction after broader package comparison work:

- keep the package split
- keep adapters explicit
- do not confuse "headless" with "single-package"

One more current-read correction:

- child-count chunking is not a live direction
- selector-first rendering plus semantic islands is the live large-document
  posture

Edix is a useful reference for headless DOM binding and explicit clipboard boundaries, but not a reason to collapse `slate`, `slate-dom`, `slate-react`, and `slate-history` back into one bucket.

## Principles Stack

This is the principle order that makes the most sense for a Slate v2:

1. data-model-first
2. operation- and collaboration-friendly
3. transaction-first engine semantics
4. React-optimized runtime
5. optional adapters later

That is the key correction from the first draft.

The first draft drifted too close to "React-first core." That is the wrong framing. The better framing is:

- the core stays data-model-first
- the engine becomes transaction-first
- `slate-react` becomes brutally well-optimized on top

## Core Model

Slate v2 would have four layers.

### 1. Intent Layer

Public calls express intent. They do not mutate the committed tree directly.

Examples:

- `Transforms.insertNodes(...)`
- `Transforms.setNodes(...)`
- `Transforms.moveNodes(...)`
- `editor.apply(op)`

Those all append normalized intent into the active transaction.

### 2. Transaction Layer

A transaction object owns all mutable working state for one edit session:

- draft tree
- operation list
- selection state
- marks state
- refs
- dirty paths
- normalize debt
- history metadata

That transaction is the actual runtime unit. Not the individual operation.

### 3. Middleware Pipeline

Plugins do not monkey-patch `editor.apply`. They hook named phases.

The engine should expose explicit middleware phases like:

- `rewriteOperation`
- `validateOperation`
- `beforeTransformRefs`
- `transformRefs`
- `mutateDraft`
- `deriveDirtyPaths`
- `normalizeDraft`
- `beforeCommit`
- `afterCommit`

That is cleaner than “save old apply, wrap it, hope you understood the timing.”

### 4. Commit Layer

At commit, the engine publishes one new immutable snapshot:

- `editor.children`
- `editor.selection`
- `editor.marks`
- transaction-scoped refs/history state

No previously published node object is ever mutated in place. Ever.

## React-Optimized Runtime Model

This is the part I would push harder than the first sketch.

Slate v2 should be built so `slate-react` fits React's model cleanly:

- immutable snapshots
- external-store subscriptions
- urgent vs deferred work split cleanly
- stable identity for selector-based rendering

That does not mean the core becomes React-defined.

It means the core exposes runtime semantics that let React work the way it should have been able to all along.

The target runtime should be React `19.2+`.

That changes the bar:

- `useEffectEvent` is available and should be standard
- `<Activity>` is available and should shape hidden and background UI policy
- latest hook lint rules are assumed
- React 18 compatibility constraints should not be allowed to degrade the design

### Versioned Snapshots

Every commit should publish a versioned immutable editor snapshot.

Something like:

```ts
type EditorSnapshot = {
  version: number;
  children: Descendant[];
  selection: Range | null;
  marks: EditorMarks | null;
};
```

`slate-react` should subscribe to snapshots, not to a mutable editor object that happens to change under its feet.

This should follow the external-store shape React actually likes:

- snapshot reads are pure
- repeated reads of the same version return the same value
- subscriptions notify after commit, not during draft mutation
- React components render from committed snapshots, not half-finished editor state

The important consequence is that the store contract belongs in core, not as a wrapper `slate-react` improvises later.

### Selector Subscriptions

`slate-react` should expose slice-based subscriptions as the default rendering model.

The important unit is not "rerender because the editor changed." It is:

- rerender this element because its node changed
- rerender this leaf because its text/marks changed
- rerender this toolbar because selection state changed

That means stable selectors over snapshots, ideally keyed by persistent node identity.

This should be the default mental model for `slate-react`:

- element components subscribe to one node by id
- leaf components subscribe to one text node by id
- selection-aware UI subscribes to selection state
- derived UI subscribes to derived selectors, not the full tree

Broad editor-wide rerenders should be treated as failure, not the baseline.

### Urgent vs Deferred Work

React optimization does not mean "put everything in a transition and pray."

Urgent editor work stays synchronous:

- text input
- composition
- DOM selection correctness
- committed editor snapshot publication

Deferred work can move out of the urgent lane:

- decorations
- search highlights
- expensive derived structure
- analytics
- low-priority visual polish

That split should be explicit in the engine and in `slate-react`.

Important constraint: transitions should not be the mechanism that makes core editor mutation safe. The editor commit path should already be small, synchronous, and correct before any deferred React work starts.

### React 19.2 Runtime Pressure

This matters enough to name directly.

#### `useEffectEvent`

`slate-react` should use `useEffectEvent` for effect-owned event reactions like:

- selection observers
- composition listeners
- focus and scroll coordination
- clipboard/runtime callbacks

But Effect Events are not general stable callback identities. They stay local to effects.

#### `<Activity>`

`<Activity>` should be a first-class tool for hidden and background editor-adjacent UI:

- inactive editors
- side panes
- inspectors
- background-prepared UI

It is not a fix for active editable-surface correctness.

If hidden UI resumes cleanly, that proves the core published a coherent snapshot model. If it resumes from stale mutable guts, the core contract is fake.

#### What Not To Build Around

Do not let these distort the engine:

- `cacheSignal()` is RSC-only and not part of the client editor runtime contract
- future `use(store)` external-store work is still research, not a v2 dependency

### Stable Node Identity

Path-only identity is one of Slate's oldest pain points.

React wants stable identity. Slate v2 should give the runtime stable identity:

- persistent node ids in the committed snapshot or runtime index
- selectors by id
- path as location metadata, not the only identity model

That reduces remount churn, makes memoization less cursed, and gives the renderer a real handle on "what actually changed."

It also avoids one of the oldest React-hostile habits in Slate: treating array position as identity and then acting surprised when reordering hurts.

Important boundary: this does not require polluting the serialized JSON document model with React-facing ids.

The document format can stay simple while the runtime still maintains stable identity.

### DOM Selection Bridge

`slate-react` should have a dedicated selection bridge between the DOM and committed snapshots.

That bridge should be a real subsystem, not timing-sensitive glue spread across event handlers, render, and normalization side effects.

Package seam:

- `slate-dom` owns browser semantics, translation, and selection rules
- `slate-react` owns React lifecycle wiring around that boundary
- `slate` owns the committed state those packages consume

## React Runtime Rules

If Slate v2 is serious about React, these should be treated as hard rules:

- derive, do not sync: React components should derive view data from the committed snapshot instead of mirroring editor state into local state with effects
- `useSyncExternalStore` first: store subscriptions should use the standard external-store primitive instead of effect-plus-`useState` wrappers
- colocate state: local UI state stays near the component that owns it; editor-core state stays in the external store
- stable keys only: React rendering keyed by persistent node ids, never path-derived array indexes for reorderable content
- minimal subscriptions: components subscribe to the smallest selector that gives them the data they need
- event-handler writes: user-driven editor writes happen in event handlers and commands, not in effects watching state changes
- no mutation during render: all editor writes happen in event handlers, commands, or transaction runners, never as a side effect of rendering
- no broad context churn: context can carry stable editor/store access, but high-frequency content data should flow through selector subscriptions
- reset with boundaries, not effects: when local UI state must be discarded, prefer explicit replacement seams or keyed boundaries over effect-driven reset logic

One more hard rule:

- controlled or external value replacement must go through an explicit core seam, not by mutating published editor state and hoping React catches up

## Public API Sketch

The public surface could stay pretty small:

```ts
Editor.withTransaction(editor, (tx) => {
  Transforms.insertNodes(editor, node);
  Transforms.setNodes(editor, { color: "orange" }, { at: [0] });
  Transforms.moveNodes(editor, { at: [3], to: [1] });
});
```

Possible rules:

- `editor.apply(op)` remains as a low-level convenience
- if no transaction is active, Slate creates an implicit one for that call
- `Transforms.*` always target the active transaction
- `Transforms.applyBatch(...)` is optional and may not even need to exist in v2

That means the native model is transactional even when the user writes single-op code.

The important runtime detail is that this public API should sit on top of a snapshot engine that can publish one coherent commit to React, not a chain of observable partial mutations.

## Plugin Model

This is the real win.

This is end-state direction, not a Phase 1 requirement.

Plugins should override one middleware surface, not one mutable method.

There is one useful external constraint here: explicit hook points are good, but they should stay package-local and boundary-local.

Good:

- core transaction phases in `slate`
- DOM bridge phases in `slate-dom`
- runtime subscription and lifecycle phases in `slate-react`
- history capture and grouping phases in `slate-history`

Bad:

- one giant plugin surface that spans every package and quietly re-couples them

Instead of this:

```ts
const { apply } = editor;

editor.apply = (op) => {
  if (op.type === "set_node" && op.newProperties?.color === "blue") {
    op = {
      ...op,
      newProperties: {
        ...op.newProperties,
        color: "orange",
      },
    };
  }

  apply(op);
};
```

You would do this:

```ts
editor.rewriteOperation = (op, next) => {
  if (op.type === "set_node" && op.newProperties?.color === "blue") {
    op = {
      ...op,
      newProperties: {
        ...op.newProperties,
        color: "orange",
      },
    };
  }

  return next(op);
};
```

That is vastly easier to reason about:

- one phase
- one responsibility
- no hidden dependence on commit timing
- no accidental coupling to tree mutation

## Snapshot Semantics

The committed editor state should be immutable and boring:

- `editor.children` is the last committed snapshot
- transaction draft state is private
- reading committed state does not mutate anything
- reading draft state happens through explicit transaction access, not by accident

If a plugin needs to inspect current in-transaction state, it should do so through the transaction object:

```ts
Editor.withTransaction(editor, (tx) => {
  Transforms.insertNodes(editor, node);

  const currentChildren = tx.children;
  const currentSelection = tx.selection;
});
```

That is cleaner than accessor tricks on `editor.children`.

For React, this matters even more:

- the committed snapshot should be cached and reusable
- repeated reads of the same version should return the same object graph
- transaction draft state should never leak as a published snapshot
- React components should not need effect-driven mirror state just to stay in sync with the editor

That is the foundation for correct external-store integration.

## Normalization

Normalization should also be transaction-scoped.

Bad model:

- every op mutates tree
- every op derives dirty paths
- every op risks partial normalize work

Better model:

- ops add normalize debt to the transaction
- middleware can add more debt
- normalization drains debt against the draft
- commit is blocked until normalize debt is clean

This lets the engine optimize normalize at the right granularity instead of replaying the same work because the public API shape backed it into a corner.

## History, Selection, and Refs

These should be first-class transaction concerns, not bolt-ons.

### History

Each committed transaction becomes one history entry by default.

If you want merge behavior, say so explicitly:

```ts
Editor.withTransaction(editor, (tx) => {
  tx.history.merge = true;
  // operations...
});
```

### Selection

Selection should live in the transaction as mutable working state, then publish once.

That removes the weirdness where selection ops are half-real, half-history metadata, and half special-case garbage.

It also makes React integration cleaner because selection becomes part of the same published snapshot boundary instead of a side channel with weird timing.

### Refs

Refs should update incrementally against the draft transaction, not by pretending every op is the only op that matters.

## Why This Is Better Than The Retrofit

This greenfield model wins on clarity:

- one native execution model
- batching is not special
- plugin hooks are phase-based instead of monkey-patch-based
- commit timing is explicit
- immutable snapshot semantics are straightforward
- dirty-path and normalize work happen at transaction scope
- perf optimizers live under a stable runtime model

And the React-optimized runtime wins on product fit:

- one transaction commit can map to one React store publication
- element and leaf rendering can subscribe by selector instead of broad tree reads
- urgent typing work can stay synchronous while expensive derived UI moves out of the hot lane
- stable node identity reduces remount churn and key/path weirdness
- `slate-react` stops compensating for engine timing quirks and starts consuming snapshots the way React actually wants
- component logic gets simpler because more UI can derive from snapshots instead of syncing mirrored state through effects

If Slate had started here, the current rewrite would be dramatically simpler.

It would also probably be a much better editor runtime for React than current Slate, not just a cleaner engine.

## Why This Can Unlock Old Slate Limits

A transaction-first engine with a React-optimized runtime could remove some long-standing pain instead of just optimizing around it:

- per-op render churn
- path-only identity weirdness
- brittle `editor.apply` override timing
- selection synchronization races
- normalization and derived UI fighting for the same urgent lane
- mixed-op performance cliffs caused by per-op execution assumptions

This is the real case for a v2. Not novelty. Leverage.

## Why This Is Not The Right Pivot For Slate Today

Because it is basically a new editor engine.

The current Slate ecosystem assumes:

- plugins wrap `editor.apply`
- `apply` has immediate effects
- editor state is directly observable through current surfaces
- history, DOM, and selection semantics already exist in this shape

Pivoting now would mean:

- new plugin model
- new transaction semantics
- new history seam
- new observation model
- a rewritten `slate-react` runtime model
- a migration problem on top of the performance problem

That is not a refactor. That is a major-version rewrite.

So the blunt take is:

- good v2 idea
- bad move for the current rewrite

The active path in [slate-batch-engine.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/slate-batch-engine.md) is still the right one for Slate now.

## Framework Position

Slate v2 should not be React-first in ontology.

It should be:

- data-model-first in the core
- transaction-first in the engine
- React-optimized in the reference runtime

That means:

- the core is not renderer-shaped
- the document model stays simple enough to reason about as plain data
- operations remain first-class enough for collaboration and history work
- `slate-react` is allowed to be the best runtime, not a second-class adapter
- other runtimes may exist later if they fit cleanly
- other runtimes do not get veto power over the engine semantics

Two bad extremes should both be rejected:

- fake neutrality that makes React worse for no real gain
- React-centric core abstractions that make the model harder to reason about outside React

The winning position is narrower and better:

- keep the core boring
- keep the engine explicit
- let `slate-react` be excellent

## Plausible Migration Shape

If Slate ever wanted this for real, do it as an explicit major-version engine transition.

The sane rollout would be:

1. Build the transaction engine behind an experimental package or flag.
2. Prove plugin equivalents for core built-ins first.
3. Publish middleware phases before asking third parties to migrate.
4. Keep the old engine alive during the migration window.
5. Only hard-cut when the extension story is actually credible.

Anything softer becomes a half-v1, half-v2 mutant. That sounds clever right until it ruins both.

## Open Questions

- Should `Operation` remain the core primitive, or should the engine promote higher-level intents first and lower to ops later?
- Should implicit single-op transactions exist at all, or should every edit path become explicitly transactional?
- Should normalization remain op-derived, or can transactions own richer semantic debt directly?
- Should plugin middleware be synchronous only, or is async transaction middleware worth the complexity?
- How much of the DOM/history integration should remain outside core versus becoming transaction plugins?
- Should node ids become mandatory in core snapshots, or only mandatory in the React runtime?
- How much selector API should live in `slate-react` versus core snapshot helpers?
- Which parts of derived editor state should be explicitly transition-friendly, and which should stay strictly urgent?

## Recommendation

Use this as a reference architecture, not the current implementation target.

The current rewrite should keep doing the practical thing:

- preserve `editor.apply(op)` as the public low-level seam
- keep `Editor.withBatch(...)` / `Transforms.applyBatch(...)`
- keep pushing complexity downward into core
- only cut more engine complexity when the benchmark says it earns its keep

Slate v2 should be transaction-first, data-model-first, and React-optimized.

Slate now should finish the retrofit and ship.

## Current Cashout Read

Within the current v2 proof program, Phase 5 cashout is no longer the open
question.

The completed release-shaped anchor surface is:

- `Slate`
- `EditableBlocks`
- `withHistory(createEditor())`
- one canonical existing v2 example, starting with `slate-v2-rich-inline`

That lane now cashes out the proved semantics into:

- explicit engine/runtime contracts
- one honest editor-facing surface
- one real browser lifecycle proof

The next endgame move after that cashout is package shaping on top of the
stabilized surface:

- sharpen package APIs without faking parity
- keep public promises bounded by the proved matrix
- no default retreat into geometry seam hunting

New geometry proof is still allowed.

Use it only when a later lane fails for a real model reason.

# Part II. Core Foundation Spec

Truth class:

- `Near-term required`

## Purpose

This is the first real implementation-spec artifact for Slate v2.

It only covers Phase 0 and Phase 1 from [roadmap-from-issues.md](/Users/zbeyens/git/plate-2/docs/slate-issues/roadmap-from-issues.md):

- lock the contract and harnesses
- build the `slate` core foundation

This is not the full v2 plan.

This is the minimal foundation that has to exist before `slate-dom` and `slate-react` can be anything other than cleanup crews again.

It is also no longer allowed to freehand those runtime packages later.

This spec is constrained by:

- [Part III. DOM Runtime Boundary Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-iii-dom-runtime-boundary-spec)
- [Part IV. React Runtime Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-iv-react-runtime-spec)

## Inputs

- [Part I. Engine North Star](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-i-engine-north-star)
- [Part III. DOM Runtime Boundary Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-iii-dom-runtime-boundary-spec)
- [Part IV. React Runtime Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-iv-react-runtime-spec)
- [requirements-from-issues.md](/Users/zbeyens/git/plate-2/docs/slate-issues/requirements-from-issues.md)
- [roadmap-from-issues.md](/Users/zbeyens/git/plate-2/docs/slate-issues/roadmap-from-issues.md)
- [test-candidate-map.md](/Users/zbeyens/git/plate-2/docs/slate-issues/test-candidate-map.md)
- [benchmark-candidate-map.md](/Users/zbeyens/git/plate-2/docs/slate-issues/benchmark-candidate-map.md)
- current Slate package layout in `../slate-v2/packages/*`

## Locked Constraints

These are not up for bikeshedding in Phase 1.

1. The serialized document model stays simple and JSON-shaped.
2. Operations stay first-class externally.
3. Transactions are the internal execution model.
4. Core publishes immutable committed snapshots.
5. Stable runtime identity exists outside serialized JSON.
6. No DOM or React concerns leak into `slate`.
7. Same-version snapshot reads are pure and stable.
8. `children`, `selection`, `marks`, and ref-aligned lookup state publish atomically.
9. Hidden or background runtime surfaces must never observe half-committed state.
10. Core owns the snapshot-store contract that runtime packages subscribe to.
11. Core owns an explicit replacement seam for external value or snapshot replacement.

## Non-Goals

Phase 1 does **not** try to solve:

- browser selection
- IME quirks
- React hooks
- clipboard DOM behavior
- plugin middleware redesign
- migration compatibility

If we try to solve those here, the core will bloat before it even exists.

That does **not** mean Phase 1 can ignore runtime pressure.

It means the pressure is carried as core invariants instead of DOM or React code.

## Deliverables

### Phase 0

Lock:

- the `slate-dom` runtime-boundary contract
- the `slate-react` runtime contract
- the first benchmark lanes
- the first red-test lanes
- the package shape for `slate`
- the first core primitives and invariants

### Phase 1

Build:

- `packages/slate`
- transaction runner
- committed snapshot model
- stable runtime identity sidecar
- operation lowering and execution path
- normalization debt handling inside a transaction
- refs and selection as transaction-owned state

## Package Shape

The package should mirror current Slate where that helps comprehension, but not cargo-cult the current internals.

Initial shape:

```text
packages/slate/
  src/
    index.ts
    create-editor.ts
    editor/
    interfaces/
    types/
    transforms-node/
    transforms-selection/
    transforms-text/
    core/
      transaction/
      snapshot/
      identity/
      normalize/
      refs/
      apply/
      operations/
```

Strong take:

- mirror the current top-level export shape enough that the package feels like Slate
- do **not** mirror current `core/` sprawl
- do **not** add DOM, React, history, or hyperscript folders here

## Minimal Public Surface

Phase 1 should expose the smallest honest surface:

- `createEditor()`
- `editor.apply(op)`
- `Transforms.*`
- one explicit provisional transaction seam

Recommended provisional seam:

```ts
Editor.withTransaction(editor, fn);
```

Why:

- single-op implicit transactions preserve the op-first contract
- an explicit transaction seam is needed for benchmarks, tests, and multi-op semantics
- Phase 1 does not need to commit to the final public batching API name yet

What not to add in Phase 1:

- middleware phase hooks
- async transaction hooks
- DOM-facing helpers
- React-facing selector helpers

### Required Runtime Surface

Phase 1 does not need to freeze the final public store API, but it does need the runtime contract.

That means `slate` must own equivalents of:

- `getSnapshot(editor)`
- `subscribe(editor, listener)`
- one explicit replacement seam for external value or snapshot replacement

Strong take:

- `slate-react` must not invent its own store by watching mutable editor state from the outside
- controlled mode must not be implemented as “prop changed, run an effect, push value back into core”

## Core Primitives

These are the primitives that need to exist immediately.

### `RuntimeId`

Runtime-only stable identity for nodes.

Requirements:

- unique per logical node
- not serialized into user JSON
- survives reordering
- usable by later DOM and React layers

Recommended shape:

```ts
type RuntimeId = string;
```

Keep it boring. A fancy branded type can come later.

### `EditorSnapshot`

The immutable committed editor state.

Recommended shape:

```ts
type EditorSnapshot = {
  version: number;
  children: Descendant[];
  selection: Range | null;
  marks: EditorMarks | null;
  index: SnapshotIndex;
};
```

Where `SnapshotIndex` is the runtime-only sidecar for identity and lookup, not a serialized data structure.

`EditorSnapshot` is not just “immutable data.”

It is the runtime contract:

- same version, same read result
- no torn reads across `children`, `selection`, or `marks`
- no runtime package observing draft state through public reads

### `SnapshotIndex`

The sidecar index that makes stable identity real.

Minimum responsibilities:

- `id -> path`
- `path -> id`
- path lookup against the committed snapshot

Do **not** make this a kitchen sink. Phase 1 only needs identity and lookup.

### `Transaction`

The only mutable editing unit.

Recommended shape:

```ts
type Transaction = {
  id: number;
  baseVersion: number;
  operations: Operation[];
  draft: DraftRoot;
  children: Descendant[];
  selection: Range | null;
  marks: EditorMarks | null;
  normalizeDebt: NormalizeDebt;
  refs: TransactionRefs;
  isImplicit: boolean;
};
```

Phase 1 does not need rich metadata beyond that.

### `NormalizeDebt`

The thing current Slate mostly spreads everywhere.

Minimum responsibility:

- collect the paths or semantic debt created by draft mutations
- resolve to fixpoint before commit or fail intentionally

Strong take:

- keep this path-based in Phase 1
- do **not** invent a semantic normalization DSL yet

### `TransactionRefs`

Refs move with the transaction, not as an afterthought after every op.

Minimum responsibilities:

- update path/point/range refs incrementally during draft mutation
- publish aligned ref state at commit

### `DraftRoot`

Private mutable working tree owned by the transaction.

This can be implemented with structural sharing internally later. Phase 1 only needs the abstraction boundary:

- draft state is mutable and private
- published snapshot is immutable and public

## Invariants

These are the rules Phase 1 has to enforce.

1. No committed snapshot is mutated in place.
2. No transaction draft leaks as committed state.
3. `editor.children` always means the last committed snapshot.
4. Path is location, not the only identity.
5. Every public edit path runs inside a transaction, even if implicit.
6. Normalization finishes before commit or fails intentionally.
7. Selection, marks, and refs publish at the same commit boundary as `children`.
8. Repeated snapshot reads for the same version return the same values.
9. Runtime packages subscribe after commit, never during draft mutation.

## Execution Model

Phase 1 flow:

1. public call enters through `editor.apply(op)` or `Transforms.*`
2. engine gets or creates active transaction
3. transform lowers to operation(s)
4. transaction mutates draft
5. transaction updates refs and normalize debt
6. transaction normalizes draft
7. transaction commits one immutable snapshot

Important:

- Phase 1 can keep transaction scope synchronous only
- do **not** design async transaction middleware now
- the commit path must publish through the core-owned snapshot store
- external replacement must enter through the explicit replacement seam, not by mutating published state in place

## First Red-Test Lanes

These are the correctness lanes to freeze in Phase 0.

### Core lanes to build first

1. `#5977` custom operations should not break editor detection
   - seam: custom operations in `editor.operations`
2. `#5874` duplicate node insertion by object identity
   - seam: same node object inserted twice should guardrail instead of desyncing
3. `#5811` custom normalize wrap/unwrap loop
   - seam: normalization should not spin until iteration guard death
4. `#5972` empty inline `deleteBackward` semantics
   - seam: structural delete stays coherent inside core transforms

### Reserved next lane once core foundation exists

5. `#5771` high-QPS remote `insert_text` versus local selection
   - keep reserved for the moment selection and runtime layers can actually express it honestly

Strong take:

- do **not** start with `#5771`
- it is valuable, but it crosses runtime and collaboration boundaries too early

## First Benchmark Lanes

These are the benchmark lanes to freeze in Phase 0.

### Core-first lane

1. `#6038` transaction execution and mixed structural updates
   - seam: repeated tree updates, exact-path ops, mixed structural batches
   - package: `slate`

### Frozen for later phases, but chosen now

2. `#5945` large plaintext paste
   - package: later shared between `slate` and `slate-dom`
3. `#5131` selection-driven rerender breadth
   - package: `slate-react`
4. `#3656` many-leaf rerender breadth inside one block
   - package: `slate-react`
5. `#3430` one paragraph with many inlines
   - package: `slate-react`

Why freeze later lanes now:

- so Phase 1 does not cheat by optimizing only what is easiest to measure
- so later packages inherit fixed harnesses instead of moving goalposts

## Phase 1 Implementation Order

1. create `packages/slate` with mirrored top-level export shape
2. define `EditorSnapshot`, `SnapshotIndex`, `Transaction`, `RuntimeId`
3. implement implicit transaction wrapper around `editor.apply(op)`
4. implement explicit `Editor.withTransaction(editor, fn)` seam
5. implement the core snapshot-store contract
6. implement the explicit external replacement seam
7. move normalization debt and ref updates inside the transaction
8. publish immutable committed snapshots
9. add the first four core red-test lanes
10. add the `#6038` benchmark lane against the new package

## Exit Criteria

Phase 0 + 1 are done when:

- `slate` exists as its own package
- all public edits run inside a transaction
- committed snapshots are immutable and versioned
- stable runtime identity exists in a sidecar index
- the first four core red-test lanes exist
- the `#6038` benchmark lane exists
- the spec still has no DOM or React leakage

## Explicit Deferrals

Do not solve these in this spec:

- plugin middleware phases
- async transactions
- DOM selection bridge
- clipboard DOM ingestion
- selector API
- hook API
- history grouping policy
- migration path from current Slate

Those are real tasks. They are just not Phase 1.

## Open Questions

These are the only Phase-1-adjacent questions still worth answering:

1. Should `RuntimeId` be generated lazily per snapshot build or eagerly at draft mutation time?
2. Should `SnapshotIndex` store only id/path mappings in Phase 1, or also node-object references?
3. Should implicit single-op transactions and explicit `withTransaction` share exactly the same commit pipeline, or is there a tiny fast path worth keeping?

Strong take:

- answer those during implementation
- do **not** block the package on a fake-RFC detour

## Recommendation

Start with one prototype package:

- `packages/slate`

Do not scaffold `slate-dom` or `slate-react` yet.

If the core foundation is wrong, the rest will just be expensive lipstick.

# Part III. DOM Runtime Boundary Spec

Truth class:

- `Near-term required`

## Purpose

This is the package-level contract for `slate-dom`.

It exists to stop DOM ownership from smearing back into `slate` and `slate-react`.

This is the browser-facing runtime boundary:

- DOM point and path translation
- selection ownership
- composition and `beforeinput`
- clipboard DOM boundaries
- nested editor and shadow DOM rules

## Inputs

- [Part I. Engine North Star](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-i-engine-north-star)
- [Part II. Core Foundation Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-ii-core-foundation-spec)
- [requirements-from-issues.md](/Users/zbeyens/git/plate-2/docs/slate-issues/requirements-from-issues.md)
- [roadmap-from-issues.md](/Users/zbeyens/git/plate-2/docs/slate-issues/roadmap-from-issues.md)

## Locked Constraints

1. `slate-dom` owns DOM translation and browser-boundary semantics.
2. `slate-dom` does not own React subscription policy or hook design.
3. `slate-dom` does not own core transform or normalization semantics.
4. `slate-dom` consumes committed snapshots and runtime identity. It does not peek into draft state.
5. Selection repair must be explained by explicit bridge rules, not fallback timing accidents.
6. `slate-dom` exposes browser-boundary primitives that `slate-react` may wire through React lifecycle, without re-owning browser semantics there.

## Non-Goals

This package does **not** try to own:

- React hook ergonomics
- rerender breadth
- history grouping
- general plugin middleware design
- React 18 compatibility shims

## Core Contract Required From `slate`

`slate-dom` forces these guarantees onto the core:

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

`slate-dom` needs a stable relationship between DOM nodes and committed editor identity.

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

Important:

- internal clipboard format ownership should be explicit and editor-scoped
- import/export hooks should be extension-style seams, not regex accidents buried in one DOM helper
- `slate-dom` should expose the browser-boundary part of clipboard handling without making `slate-react` or `slate` guess at fragment format details

### 5. Editor Boundary Rules

`slate-dom` must define explicit ownership for:

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

That means this package should stay an adapter layer:

- mount and unmount editor roots
- bind DOM nodes to runtime identity
- translate browser ranges and transfer formats

Not:

- broad editor UI helpers
- history semantics
- React subscription policy

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

`slate-dom` is real enough to unblock `slate-react` when:

1. DOM translation works against runtime identity, not path-only luck.
2. Selection ownership is explicit in code and tests.
3. Composition and `beforeinput` have one clear boundary owner.
4. Nested editor and shadow DOM semantics are intentional, not accidental.
5. `slate-react` can consume this bridge without re-owning low-level DOM translation.

# Part IV. React Runtime Spec

Truth class:

- mixed:
  - `Near-term required` for snapshot/store/selector/runtime-seam sections
  - `Future direction` for the more speculative runtime posture sections named
    below

## Purpose

This is the package-level contract for `slate-react`.

The target is:

- React `19.2+`
- latest React lint/runtime assumptions
- no React 18 compatibility tax
- runtime semantics that feel native to modern React instead of tolerated by it

Current repo baseline:

- `/Users/zbeyens/git/slate-v2` already runs this package surface on
  React `19.2` and Next `16.2.2`

## Inputs

- [Part I. Engine North Star](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-i-engine-north-star)
- [Part II. Core Foundation Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-ii-core-foundation-spec)
- [Part III. DOM Runtime Boundary Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-iii-dom-runtime-boundary-spec)
- [requirements-from-issues.md](/Users/zbeyens/git/plate-2/docs/slate-issues/requirements-from-issues.md)
- [roadmap-from-issues.md](/Users/zbeyens/git/plate-2/docs/slate-issues/roadmap-from-issues.md)
- React versions: https://react.dev/versions
- React 19.2 release: https://react.dev/blog/2025/10/01/react-19-2
- `<Activity>` docs: https://react.dev/reference/react/Activity
- `useEffectEvent` docs: https://react.dev/reference/react/useEffectEvent
- React Labs external-store direction: https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more

## Locked Constraints

1. `slate-react` targets React `19.2+` only.
2. The runtime is snapshot-driven, not mutable-editor-driven.
3. Selector subscriptions built on `useSyncExternalStore` are the default rendering model.
4. Effects are for external synchronization only, not for derived editor state or command chaining.
5. `useEffectEvent` is the default tool for effect-owned event reactions.
6. `<Activity>` is a first-class tool for hidden and background UI, not a fix for active editable-surface correctness.
7. `startTransition` and `useDeferredValue` are for derived non-urgent UI only.
8. `slate-react` must not depend on reading half-mutated editor state.

## Non-Goals

This package does **not** try to:

- support React 18
- build around unreleased `use(store)` APIs
- use `cacheSignal()` as a client runtime primitive
- own low-level DOM translation
- smuggle browser selection repair back into React components
- normalize effect anti-patterns into the package contract
- re-decide browser semantics that belong in `slate-dom`
- rebuild a thin imperative adapter and call that a renderer architecture

## Core Contract Required From `slate`

`slate-react` forces these guarantees onto the core:

1. Snapshot reads are pure.
2. Repeated reads of the same version return the same value.
3. `children`, `selection`, `marks`, and ref-aligned lookup state publish atomically.
4. Subscribers notify after commit, never during draft mutation.
5. Stable runtime identity exists for node-level subscriptions.
6. External value replacement and editor recreation do not require React to reason about stale mutable guts.

## Runtime Model

### 1. Snapshot Store

Truth class:

- `Near-term required`

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
- a tiny imperative adapter may be fine for demos, but it is not the target runtime model here

### 2. Selector Subscriptions

Truth class:

- `Near-term required`

The package should prefer narrow selectors like:

- node by runtime id
- selection slice
- marks slice
- derived booleans for toolbar and floating UI

Selector hooks should behave like real React reads:

- calculate view data during render
- use `useMemo` only for genuinely expensive derivation
- never bounce derived values through `useState` plus `useEffect`

The real target is not “rerender only the selected node.”

The real target is:

- the selected or edited node
- the minimal affected ancestor chain
- structurally affected neighbors
- intersecting overlay slices

Anything broader than that is runtime debt.

### 2.5 Overlay Kernel

Truth class:

- `Near-term required`

`slate-react` should own exactly one editor-scoped headless overlay kernel.

That kernel is the canonical runtime for:

- decoration source registration
- annotation mirrors and projection indexes
- projection indexing
- refresh versioning
- mounted-slice delivery

Hard rules:

- hooks are bindings over the kernel, not the architecture spine
- mounted React trees are consumers, not the source of truth
- overlay registration must not depend on mount order
- the kernel must survive hidden/offscreen UI without duplicating canonical
  state in components
- the kernel may mirror external annotation stores, but it must not force all
  canonical thread/comment metadata into `slate-react`
- public overlay APIs should not default to render-time array replacement when
  a store/controller surface is the more honest fit
- decoration integration must not be trapped in one
  `derive(snapshot) => decorations` callback shape
- generic widget registration can stay internal until real external use cases
  prove a public surface is worth the cost
- until the kernel actually exists as the public runtime, do not rename the
  current projection primitives into first-class `decoration` exports
- Wave 0 freezes the nouns in architecture and planning docs first; the public
  API should only promote those nouns once the kernel and refresh semantics
  truly exist

The winning split is:

- `slate`
  - logical ranges
  - bookmark/range-ref rebasing
  - projection math
- `slate-react`
  - overlay kernel
  - subscriptions
  - annotation mirrors/indexes
  - widget placement/runtime
- `slate-dom`
  - DOM mapping
  - clipboard
  - selection fidelity

Strong take:

- do not let `useSlateAnnotations(...)`, `useSlateWidgets(...)`, or any future
  hook become the public source of truth
- the kernel owns canonical overlay runtime truth
- canonical annotation metadata may still live outside the kernel
- hooks only read and bind

### 2.6 Overlay Lanes

Truth class:

- `Near-term required`

The runtime should freeze three different overlay lanes:

1. `Decoration`
   - transient
   - overlap-friendly
   - derived from committed snapshot state or explicit external state
2. `Annotation`
   - durable
   - id-bearing
   - backed by bookmark/range-ref semantics
3. `Widget`
   - anchored UI
   - buttons, balloons, labels, popovers, diagnostics UI

Those lanes may share projection plumbing.
They may not share ownership semantics.

Important correction:

- `widget` is the public noun
- “chrome” is descriptive prose only

### 2.7 Widget Placement Is Derived

Truth class:

- `Near-term required`

Logical anchoring is not enough.
Floating UI still needs viewport geometry.

So widget architecture must split:

- `WidgetAnchor`
  - logical
  - editor-meaningful
  - stable across rerender
- `WidgetPlacement`
  - derived
  - DOM-facing
  - viewport-relative
  - ephemeral

Hard rule:

- raw DOM node identity is not a valid public anchor model
- mutable Slate path addresses are not a valid preferred public widget-anchor
  model
- if a toolbar, cursor label, or popover needs geometry, derive placement from
  a logical anchor through the bridge/runtime, do not smuggle DOM references
  into canonical overlay state
- do not rush a public `WidgetPlacement` API into `slate-react` just because
  the runtime needs internal placement data

### 2.8 Refresh Causality

Truth class:

- `Near-term required`

The old `decorate` contract died because refresh timing was ambiguous.

The new runtime should require:

- source ids
- explicit refresh requests
- monotonic source generations
- coalescing for repeated refreshes with the same source id/generation
- explicit scope:
  - `all`
  - `paths`
  - `runtimeIds`
  - `selection`
- explicit mode:
  - `sync`
  - `deferred`

Composition rule:

- non-composition-safe refreshes may be deferred or refused during active
  composition
- the editing corridor must fail closed toward stale overlay data before it
  breaks selection or IME truth

### 3. Event Handling Before Effects

Truth class:

- `Near-term required`

If a write happens because the user clicked, typed, pasted, dragged, or submitted something, it belongs in an event handler or command path.

That means:

- command dispatch stays in event handlers
- toolbar state changes stay in event handlers
- selection-following UI should react to committed state, not trigger edits from an effect watcher

Hard rule:

- do not watch editor state in an effect just to dispatch another editor command
- do not encode transaction sequencing as “state changed, now an effect fires”

### 4. Effect Wiring With `useEffectEvent`

Truth class:

- `Near-term required`

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

- when the external system is the browser editing surface, `slate-react` wires lifecycle and listener ownership through `slate-dom`
- `slate-react` does not reinterpret DOM points, selection semantics, or composition rules on its own

### 5. Controlled And External Updates

Truth class:

- `Near-term required`

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

Truth class:

- `Future direction`

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

Truth class:

- `Near-term required`

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

### 8. Default Large-Document Posture

Truth class:

- `Future direction`

Large-document behavior is not a special mode.

It is the default design target.

That means `slate-react` should assume:

- big trees are normal
- the runtime must stay local by default
- the browser should paint as little as possible outside the active editing slice

The default posture should be:

1. active-slice invalidation
   - edited leaf
   - directly affected element
   - minimal ancestor chain
   - intersecting overlays
2. semantic render islands
   - block
   - section
   - table
   - void/embed
   - other real document boundaries when they matter
3. active editing corridor
   - current selection
   - active composition
   - nearby siblings and ancestors needed for correctness
4. default occlusion outside that corridor
   - `content-visibility: auto`
   - `contain-intrinsic-size`
   - deferred non-urgent overlay work

### 9. Measurement And Planning Layer

Truth class:

- `Future direction`

The runtime should distinguish between:

1. active editing geometry
2. inactive island planning

For active editing geometry:

- trust the real DOM
- trust browser selection and caret geometry
- keep composition and menu anchoring tied to the live editing surface

For inactive island planning:

- it is acceptable to use approximate or precomputed geometry
- deterministic text measurement is useful when it avoids forced reflow

This is where `Pretext` is relevant.

`Pretext` is not a general rendering engine for `slate-react`.

It is a candidate planning primitive for:

- estimating inactive island heights
- stabilizing offscreen island sizes
- preserving scroll anchors while distant islands wake up
- future paged or measured higher-layer experiences

Strong rule:

- do not route the active editing corridor through `Pretext`
- do not replace DOM truth for selection/caret/composition with a measurement engine
- use `Pretext` only where deterministic offscreen planning wins more than live DOM measurement

Strong take:

- historical child-count chunking was a useful optimization for legacy
  `slate-react`
- chunking should not be the foundational v2 story
- the foundational story is local subscriptions plus semantic islands

Virtualization is a later escalation layer.

It is not the baseline runtime contract.

## React-19.2-Specific Posture

Truth class:

- `Near-term required`

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

Truth class:

- `Near-term required`

Phase 3 should expose a small but hard-edged runtime surface:

- snapshot provider/store integration
- selector hooks
- focused editor-instance hooks
- controlled/external update primitives
- Activity-friendly editor boundary helpers
- large-document-safe rendering defaults
- hooks or helpers for geometry/planning layers only if they preserve the DOM-vs-planning split cleanly

Do **not** start with:

- giant hook surface area
- broad context subscriptions
- magic convenience APIs that remount or resubscribe unpredictably
- hooks whose main job is hiding effect anti-patterns
- chunk-count knobs as the main correctness/perf lever

This package should feel like a real React runtime, not a thin imperative wrapper around DOM binding.

That means:

- React owns subscription and render invalidation policy
- `slate-dom` owns browser translation
- `slate` owns committed state

If those boundaries blur, the package is drifting.

## Acceptance Lanes

Truth class:

- `Near-term required`

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

Truth class:

- `Near-term required`

`slate-react` is real enough when:

1. The runtime reads committed snapshots only.
2. The main hook paths are `useSyncExternalStore`-backed and selector-first.
3. Broad editor-wide rerenders are no longer the default rendering model.
4. Derived values are calculated during render instead of mirrored with effects.
5. Editor writes originate from event handlers, commands, or explicit runtime boundaries, not effect watchers.
6. Effect-driven event logic uses `useEffectEvent` instead of dependency-array hacks.
7. Hidden/background UI can use `<Activity>` without state corruption or stale-editor weirdness.
8. The runtime can explain what is urgent and what is deferred without hand-wavy “React will figure it out” nonsense.
9. A local edit in a deep tree no longer causes broad ancestor-chain rerender breadth by default.
10. Large documents are handled by default through active-slice invalidation and default occlusion, without needing chunking as the first answer.
11. Offscreen planning can use deterministic measurement where useful, but the active editing corridor still runs on live DOM truth.
