---
date: 2026-04-01
topic: slate-v2-transaction-first-engine
---

# Slate v2 Transaction-First Engine

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

- the active retrofit reality in [slate-batch-engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/slate-batch-engine.md)
- React runtime guidance from [vercel:react-best-practices](/Users/zbeyens/.codex/plugins/cache/openai-curated/vercel/f78e3ad49297672a905eb7afb6aa0cef34edc79e/skills/react-best-practices/SKILL.md)
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

`slate-react-v2` should use `useEffectEvent` for effect-owned event reactions like:

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

- `slate-dom-v2` owns browser semantics, translation, and selection rules
- `slate-react-v2` owns React lifecycle wiring around that boundary
- `slate-v2` owns the committed state those packages consume

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

The active path in [slate-batch-engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/slate-batch-engine.md) is still the right one for Slate now.

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
