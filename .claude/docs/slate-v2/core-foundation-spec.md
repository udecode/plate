---
date: 2026-04-02
topic: slate-v2-core-foundation-spec
---

# Slate v2 Core Foundation Spec

## Purpose

This is the first real implementation-spec artifact for Slate v2.

It only covers Phase 0 and Phase 1 from [roadmap-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/roadmap-from-issues.md):

- lock the contract and harnesses
- build the `slate-v2` core foundation

This is not the full v2 plan.

This is the minimal foundation that has to exist before `slate-dom-v2` and `slate-react-v2` can be anything other than cleanup crews again.

It is also no longer allowed to freehand those runtime packages later.

This spec is constrained by:

- [dom-runtime-boundary-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/dom-runtime-boundary-spec.md)
- [react-runtime-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/react-runtime-spec.md)

## Inputs

- [engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/engine.md)
- [dom-runtime-boundary-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/dom-runtime-boundary-spec.md)
- [react-runtime-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/react-runtime-spec.md)
- [requirements-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/requirements-from-issues.md)
- [roadmap-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/roadmap-from-issues.md)
- [test-candidate-map.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/test-candidate-map.md)
- [benchmark-candidate-map.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/benchmark-candidate-map.md)
- current Slate package layout in `../slate/packages/*`

## Locked Constraints

These are not up for bikeshedding in Phase 1.

1. The serialized document model stays simple and JSON-shaped.
2. Operations stay first-class externally.
3. Transactions are the internal execution model.
4. Core publishes immutable committed snapshots.
5. Stable runtime identity exists outside serialized JSON.
6. No DOM or React concerns leak into `slate-v2`.
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

- the `slate-dom-v2` runtime-boundary contract
- the `slate-react-v2` runtime contract
- the first benchmark lanes
- the first red-test lanes
- the package shape for `slate-v2`
- the first core primitives and invariants

### Phase 1

Build:

- `packages/slate-v2`
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
packages/slate-v2/
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
- one explicit experimental transaction seam

Recommended experimental seam:

```ts
Editor.withTransaction(editor, fn)
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

That means `slate-v2` must own equivalents of:

- `getSnapshot(editor)`
- `subscribe(editor, listener)`
- one explicit replacement seam for external value or snapshot replacement

Strong take:

- `slate-react-v2` must not invent its own store by watching mutable editor state from the outside
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
type RuntimeId = string
```

Keep it boring. A fancy branded type can come later.

### `EditorSnapshot`

The immutable committed editor state.

Recommended shape:

```ts
type EditorSnapshot = {
  version: number
  children: Descendant[]
  selection: Range | null
  marks: EditorMarks | null
  index: SnapshotIndex
}
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
  id: number
  baseVersion: number
  operations: Operation[]
  draft: DraftRoot
  children: Descendant[]
  selection: Range | null
  marks: EditorMarks | null
  normalizeDebt: NormalizeDebt
  refs: TransactionRefs
  isImplicit: boolean
}
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
   - package: `slate-v2`

### Frozen for later phases, but chosen now

2. `#5945` large plaintext paste
   - package: later shared between `slate-v2` and `slate-dom-v2`
3. `#5131` selection-driven rerender breadth
   - package: `slate-react-v2`
4. `#3656` many-leaf rerender breadth inside one block
   - package: `slate-react-v2`
5. `#3430` one paragraph with many inlines
   - package: `slate-react-v2`

Why freeze later lanes now:

- so Phase 1 does not cheat by optimizing only what is easiest to measure
- so later packages inherit fixed harnesses instead of moving goalposts

## Phase 1 Implementation Order

1. create `packages/slate-v2` with mirrored top-level export shape
2. define `EditorSnapshot`, `SnapshotIndex`, `Transaction`, `RuntimeId`
3. implement implicit transaction wrapper around `editor.apply(op)`
4. implement explicit `Editor.withTransaction(editor, fn)` seam
5. implement the core snapshot-store contract
6. implement the explicit external replacement seam
7. move normalization debt and ref updates inside the transaction
8. publish immutable committed snapshots
7. add the first four core red-test lanes
8. add the `#6038` benchmark lane against the new package

## Exit Criteria

Phase 0 + 1 are done when:

- `slate-v2` exists as its own package
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

- `packages/slate-v2`

Do not scaffold `slate-dom-v2` or `slate-react-v2` yet.

If the core foundation is wrong, the rest will just be expensive lipstick.
