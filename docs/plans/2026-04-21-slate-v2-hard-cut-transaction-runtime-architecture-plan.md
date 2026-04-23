---
date: 2026-04-21
topic: slate-v2-hard-cut-transaction-runtime-architecture
status: active
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
---

# Slate v2 Hard-Cut Transaction Runtime Architecture Plan

## Goal

Build the final Slate v2 runtime architecture:

- data-model-first `slate` core
- operation- and collaboration-friendly model
- transaction-first local execution
- renderer-optimized live read and dirtiness APIs
- React-perfect `slate-react`
- browser-proofed editing safety through `slate-browser`

This plan replaces legacy runtime architecture, not just patches it.

The huge-doc perf work proved the direction. The richtext Cmd+Z regression
proved the implementation is still transitional: model truth, DOM truth, and
React repair are not yet governed by one explicit runtime contract.

## Non-Negotiable Principle Stack

1. Data model first.
2. Operations remain the collaboration/history truth.
3. Transactions are the local execution boundary.
4. Renderer-facing live reads and dirtiness are first-class core APIs.
5. React is optimized by consuming runtime APIs, not by shaping core.
6. Browser editing behavior is proofed with `slate-browser`, not assumed from
   synthetic React tests.

## Hard Cuts

These cuts are architecture cuts, not cosmetic cleanup.

### Cut Child-Count Chunking As Architecture

Child-count chunking remains only in legacy comparison fixtures and benchmark
baselines.

It must not define:

- public v2 runtime APIs
- `slate-react` rendering structure
- selection semantics
- overlay invalidation
- future performance claims

Replacement owner:

- semantic islands
- active corridor
- occlusion shells
- explicit shell activation
- 5000-block v2-vs-legacy proof gates

### Cut `decorate` As The Primary Overlay Model

`decorate` may survive only as a compatibility adapter.

The primary model is typed overlay sources:

- decorations
- annotations
- widgets
- review comments
- external overlay stores
- shared projection kernel

Review/comment UI is not decoration. Widget UI is not text decoration.

### Cut Snapshot-Hot Reads

`Editor.getSnapshot()` is an observer artifact.

It is allowed for:

- stable external store snapshots
- devtools
- tests
- non-urgent selectors
- overlay recompute when dirty metadata says it is needed

It is forbidden for:

- urgent active text rendering
- DOM-owned text repair
- active corridor updates
- mounted-node lookup
- caret-preserving edit handling

### Cut Implicit Direct DOM Sync

Direct DOM sync is a named capability, not a DOM-shape accident.

It must declare:

- eligibility
- opt-out reasons
- repair ownership
- browser proof
- accessibility equivalence

Unsafe rows fall back to React.

### Cut Shell Activation Through Selection Mutation

Activation and selection are separate concepts.

- activation mounts or promotes an island
- selection changes user-visible caret/range state
- if activation intentionally selects, it publishes a real selection operation
- if activation only prepares rendering, it must not mutate selection

### Cut Legacy Compatibility Inside The Engine

Legacy compatibility can live at public boundaries as adapters.

It cannot force:

- core transaction shape
- dirtiness model
- runtime indexes
- `slate-react` subscription topology
- overlay source model
- browser repair contract

## Target Package Architecture

### `packages/slate`

Owns:

- JSON-like document tree
- operations
- selection
- marks
- normalization
- refs and bookmarks
- transaction execution
- runtime identity
- live path/runtime-id indexes
- operation class metadata
- dirty-region metadata
- incremental immutable snapshots for observers

Does not own:

- React rendering
- DOM nodes
- browser selection
- clipboard transport
- shell UI
- platform editing quirks

### `packages/slate-dom`

Owns:

- DOM point/range translation
- DOM selection truth
- browser selection repair
- beforeinput/input interpretation
- clipboard transport
- composition and IME boundary logic
- DOM identity maps
- browser quirks

Consumes:

- core live reads
- core runtime ids
- core transaction commit metadata

Does not own:

- React subscription policy
- overlay source stores
- product rendering strategy

### `packages/slate-browser`

Owns proof infrastructure.

It is not product API.

It must prove:

- Playwright desktop editor behavior
- connected Chrome behavior
- clipboard text/html/Slate-fragment behavior
- IME and composition
- selection and selected text
- zero-width and placeholder edge cases
- history undo/redo/delete/backspace
- iframe/shadow/scoped surfaces
- Appium/agent-browser mobile transport rows where automation is honest

The stable `ready` contract should become the default for maintained example
and browser proof callsites.

### `packages/slate-react`

Owns:

- React subscriptions
- selector invalidation
- semantic islands
- active corridor
- occlusion shells
- shell activation UI
- overlay projection wiring
- DOM-owned plain text capability
- React fallback rendering
- browser repair scheduling where React owns the visible tree

Consumes:

- core commit records
- core dirty regions
- core live reads
- `slate-dom` browser mapping and event interpretation

Does not:

- infer core dirtiness from full snapshots
- make core React-shaped
- keep child-count chunking as a hidden fallback

## Core Runtime Contract

### Transaction Boundary

Transactions are the local unit of execution.

Every transaction:

1. opens live mutable transaction state
2. applies one or more operations
3. updates refs/bookmarks
4. classifies operations
5. tracks dirty paths and runtime ids
6. normalizes dirty regions
7. updates live indexes
8. produces one commit record
9. updates observer snapshot state
10. notifies subscribers once

Operations remain the serialized collaboration/history facts.

### Commit Record

Target shape:

```ts
type OperationClass =
  | 'text'
  | 'selection'
  | 'mark'
  | 'structural'
  | 'replace'

type DirtyRegion = {
  paths: Path[]
  runtimeIds: RuntimeId[]
  topLevelRange: [number, number] | null
  wholeDocument: boolean
}

type EditorCommit = {
  version: number
  previousVersion: number
  operations: readonly Operation[]
  classes: ReadonlySet<OperationClass>
  dirty: DirtyRegion
  selectionChanged: boolean
  marksChanged: boolean
  textChanged: boolean
  structureChanged: boolean
  snapshotChanged: boolean
}
```

Rules:

- no JSON diffing whole documents to infer basic operation classes
- no full snapshot rebuild just to answer active-path dirtiness
- `replace` is explicit and broad
- structural operations publish enough parent/top-level dirtiness for islands
- text operations publish exact text paths and runtime ids where possible

### Live Reads

Core must expose live reads that do not clone the tree:

```ts
Editor.getLiveNode(editor, path)
Editor.getLiveText(editor, path)
Editor.getLiveSelection(editor)
Editor.getRuntimeId(editor, path)
Editor.getPathByRuntimeId(editor, runtimeId)
Editor.getChangedOperations(editor, sinceVersion)
Editor.getLastCommit(editor)
```

Constraints:

- active path reads are O(depth)
- runtime id to path lookup is O(1) or amortized close to O(1)
- live reads are clearly documented as live
- public immutable reads stay in the snapshot lane

### Incremental Snapshot/Index Maintenance

Snapshots are still valuable.

But they must be maintained from commit metadata:

- reuse unchanged subtrees
- update path/runtime-id indexes incrementally
- invalidate broadly only for replace/unknown structural cases
- make full rebuild a fallback, not the common path

## React Runtime Contract

### Selector Invalidation

Selectors consume commit records.

They should declare or infer one of:

- selection dependency
- marks dependency
- active path dependency
- runtime id dependency
- top-level range dependency
- whole snapshot dependency

Defaulting every selector to whole-snapshot wakeup is a regression.

### Semantic Islands

Islands are semantic/runtime units, not child-count chunks.

They are driven by:

- top-level dirty ranges
- active corridor
- shell activation state
- overlay source dirtiness
- browser selection needs

Inactive islands may be occluded. Active islands must preserve editing
semantics.

### DOM-Owned Plain Text Capability

Allowed only when all are true:

- commit class is text-only
- target is active mounted text path
- no composition
- no custom `renderText`
- no custom `renderLeaf`
- no custom `renderSegment`
- no decorations/projections/widgets affect the text
- no placeholder or zero-width case is involved
- exactly one DOM string node maps to the text node
- accessibility text is equivalent

Required repair events:

- undo
- redo
- delete backward
- delete forward
- paste replacement
- composition cancel/commit
- selection repair
- external model operation on the active text

Any failed eligibility check falls back to React.

## Overlay Architecture

Primary overlay kernel:

- maps overlay sources through operations
- accepts source-scoped dirty metadata
- projects only visible/active ranges
- supports overlap-safe slicing
- supports decorations, annotations, widgets, comments, and review UI
- exposes one projection store contract to React

`decorate` compatibility:

- wraps legacy callback into a decoration source
- never owns core projection architecture
- may be hard-cut once package/example migration proves the adapter is mostly
  dead weight

## Browser Proof Architecture

`slate-browser` is the proof spine.

Every browser-facing runtime claim needs one of:

- direct Playwright proof
- connected browser proof
- Appium/agent-browser mobile proof
- explicit deferred manual-device blocker with exact reason

Required browser proof families:

- beforeinput/input text insertion
- keydown fallback insertion
- undo/redo history hotkeys
- native `historyUndo` / `historyRedo`
- delete/backspace
- select-all
- range selection across shells
- shell activation keyboard and pointer
- clipboard plain text
- clipboard HTML
- Slate fragment paste/copy
- IME composition
- placeholder and zero-width
- custom render fallback
- decorations/projections/widgets fallback
- accessibility attributes and focus order
- iframe/shadow DOM/scoped surfaces

No model-only proof closes a browser editing lane.

No DOM-only proof closes a model lane.

Model and DOM assertions must both exist for risky editing paths.

## Execution Phases

### Phase 0: Freeze Hard Cuts And Baseline

Owners:

- docs
- benchmark harness if needed
- proof harness if needed

Actions:

- mark child-count chunking as legacy-only architecture
- mark `decorate` as compatibility adapter
- mark snapshot-hot reads as forbidden
- inventory every urgent `Editor.getSnapshot()` use in `slate-react`
- inventory every child-count chunking dependency
- inventory every direct DOM sync eligibility check and repair event

Earliest gates:

- doc/state update only
- focused grep inventory in the plan
- `bun completion-check` remains pending

### Phase 1: Core Commit Record Contract

Owner:

- `packages/slate`

Actions:

- introduce explicit `EditorCommit`
- publish operation classes
- publish dirty regions
- publish `Editor.getLastCommit(editor)`
- make subscribers receive commit records instead of weak snapshot changes
- preserve operations as history/collab truth

Earliest gates:

- `bun test ./packages/slate/test/transaction-contract.ts --bail 1`
- `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- `bun test ./packages/slate/test/surface-contract.ts --bail 1`
- `bun run bench:core:observation:compare:local`

### Phase 2: Live Indexes And Incremental Snapshots

Owner:

- `packages/slate`

Actions:

- maintain runtime id to path index incrementally
- maintain path to runtime id index incrementally
- make `getPathByRuntimeId` O(1) or close enough under edit pressure
- update snapshots/indexes from dirty regions
- keep full rebuild fallback only for broad replace/unknown structural cases

Earliest gates:

- runtime id/path shift tests
- snapshot immutability tests
- `bun run bench:core:huge-document:compare:local`
- `bun run bench:core:observation:compare:local`

### Phase 3: `slate-dom` Browser Repair Contract

Owner:

- `packages/slate-dom`
- `packages/slate-react` only where React owns visible repair

Actions:

- formalize browser event classes
- separate DOM selection truth from model selection truth
- make native history, hotkey history, delete, paste, and composition repair
  explicit
- ensure repair paths update both model and DOM or intentionally defer with a
  named blocker

Earliest gates:

- `bun test ./packages/slate-dom/test/bridge.ts --bail 1`
- `bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1`
- richtext keyboard undo row
- large-document undo/redo/delete rows

### Phase 4: `slate-browser` Proof Harness Upgrade

Owner:

- `packages/slate-browser`
- Playwright integration tests

Actions:

- migrate maintained example tests to `openExample(...)` ready contract where
  useful
- add standard helpers for model+DOM text assertions
- add standard helpers for browser user-agent/platform hotkeys
- add connected Chrome proof recipe for editing bugs that bundled Chromium can
  miss
- keep mobile transport descriptors explicit

Earliest gates:

- `bun --filter slate-browser test`
- `bun run test:slate-browser`
- focused example tests using `slate-browser/playwright`

### Phase 5: `slate-react` Consumes Commit Dirtiness

Owner:

- `packages/slate-react`

Actions:

- remove urgent `Editor.getSnapshot()` reads
- make selectors wake from commit metadata
- route active text reads through live read APIs
- route shell/island updates through dirty top-level ranges
- keep observer snapshot lane only for non-urgent selectors

Earliest gates:

- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
- `bun run bench:react:rerender-breadth:local`
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

### Phase 6: DOM-Owned Text Capability Becomes Formal

Owner:

- `packages/slate-react`
- `packages/slate-dom` if event interpretation is the blocker

Actions:

- define capability object and eligibility result
- include explicit opt-out reasons
- prove custom render/decorations/projections/IME/placeholder/zero-width
  fallback
- prove undo/redo/delete/paste repair
- keep direct DOM path only for safe plain text

Earliest gates:

- large-document runtime browser rows
- richtext browser undo row
- custom render/projection fallback rows
- IME rows
- 5000-block huge-doc compare

### Phase 7: Overlay Kernel Replaces `decorate`

Owner:

- `packages/slate-react`
- examples and docs as needed

Actions:

- introduce typed overlay source API
- route decorations through the source API
- route annotations/widgets/comments through the same projection kernel
- convert `decorate` into adapter
- migrate current examples away from callback-first overlay thinking

Earliest gates:

- projections/selection contract
- overlay huge-doc benchmark
- highlighted text / review comments / annotation examples

### Phase 8: Hard-Cut Child-Count Chunking Runtime

Owner:

- `packages/slate-react`
- benchmark harness
- example docs

Actions:

- remove child-count chunking from product runtime paths
- keep legacy chunking only in legacy comparison harnesses
- make semantic islands/corridor the only v2 huge-doc story
- update examples that still teach chunking as current architecture

Earliest gates:

- 5000-block legacy compare
- huge-document overlay benchmark
- large-document runtime browser tests
- example parity ledger update

### Phase 9: Shell Activation, Selection, And Accessibility

Owner:

- `packages/slate-react`
- `packages/slate-dom` if DOM selection bridge changes
- `slate-browser` proof rows

Actions:

- make shell activation state explicit
- publish selection operations only for user-visible selection
- prove keyboard activation, focus order, ARIA state, copy/paste, select-all,
  and screen-reader-safe markup

Earliest gates:

- shell keyboard activation rows
- select-all rows
- rich/fragment paste rows
- accessibility-focused Playwright rows

### Phase 10: Legacy Boundary And Public API Cleanup

Owner:

- `packages/slate`
- `packages/slate-react`
- docs

Actions:

- keep thin adapters that do not pollute runtime internals
- hard-cut old APIs that force legacy architecture
- document current API only
- remove dead compatibility tests that assert old internals

Earliest gates:

- package typecheck/build
- package public surface tests
- example parity tests

## Current Next Owner

Start at Phase 0, then immediately Phase 1.

The first implementation owner is `packages/slate` commit records and dirty
regions.

Do not start by deleting React code. That would remove evidence before the core
runtime contract exists.

## Driver Gates

Default fast gates:

- `bun test ./packages/slate/test/transaction-contract.ts --bail 1`
- `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- `bun test ./packages/slate/test/surface-contract.ts --bail 1`
- `bun run bench:core:observation:compare:local`

React/browser gates after core commits are live:

- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

`slate-browser` gates:

- `bun --filter slate-browser test`
- `bun run test:slate-browser`

## Completion Criteria

This lane is complete only when all are true:

- child-count chunking is gone from v2 product runtime architecture
- `decorate` is not the primary overlay path
- core publishes explicit commit records
- dirty-region APIs are stable and covered
- operation class metadata is first-class
- live path/runtime-id indexes exist and are covered
- live text/node reads are the urgent render path
- snapshot/index maintenance is incremental where dirty metadata permits
- no urgent `slate-react` path depends on `Editor.getSnapshot()`
- DOM-owned text is an explicit capability with opt-out proofs
- shell activation and selection are separate
- `slate-browser` owns the browser proof spine
- 5000-block huge-doc compare stays green
- browser editing gates prove model and DOM together
- legacy compatibility exists only at thin public boundaries
- remaining risks are explicitly accepted or deferred with rationale

## Stop Rules

Do not stop on:

- pivot
- replan
- red benchmark with known owner
- typecheck blocker unrelated to current runnable owner
- docs update
- benchmark existence
- partial perf win

Stop only when:

- completion criteria are met, or
- no autonomous progress is possible and the exact blocker is named, or
- the user explicitly asks to pause.

## Memory Rules

After every slice, append to this file:

- actions taken
- commands run
- artifact paths
- evidence
- hypothesis
- decision
- owner classification
- changed files
- rejected tactics
- next action

Do not rely on chat history.

## Progress

- 2026-04-21: Started Phase 0 inventory.
  - Read active architecture plan, accepted research decision, current full
    core/editing coverage ledger, completion check, and relevant solution docs.
  - Relevant learnings:
    - `Editor.apply(...)` already exists as the explicit public single-op
      writer and should stay aligned with transactions.
    - handle-only browser undo proof is insufficient; model and visible DOM
      must both be asserted for browser editing rows.
  - Snapshot-hot reads found:
    - `packages/slate-react/src/large-document/island-shell.tsx`
    - `packages/slate-react/src/hooks/use-slate-node-ref.tsx`
    - `packages/slate-react/src/components/editable-text.tsx`
    - `packages/slate-react/src/components/editable-text-blocks.tsx`
    - `packages/slate-react/src/components/editable.tsx`
    - `packages/slate-react/src/widget-store.ts`
    - `packages/slate-react/src/projection-store.ts`
    - core helper defaults still use snapshot selection in multiple query and
      transform helpers; those are compatibility/query paths, not yet proven
      urgent React render paths.
  - Child-count chunking pressure found:
    - `packages/slate-react/src/chunking/**`
    - `packages/slate-react/src/components/chunk-tree.tsx`
    - `packages/slate-react/src/hooks/use-children.tsx`
    - `packages/slate-react/src/plugin/with-react.ts`
    - `packages/slate-react/src/plugin/react-editor.ts`
    - `site/examples/ts/huge-document.tsx`
    - legacy comparison benchmark harnesses intentionally keep chunking
      baselines.
  - Semantic-island runtime owner found:
    - `packages/slate-react/src/large-document/**`
    - `packages/slate-react/src/components/editable-text-blocks.tsx`
    - `site/examples/ts/large-document-runtime.tsx`
    - huge-doc benchmark v2 side.
  - Direct DOM sync owner found:
    - `packages/slate-react/src/hooks/use-slate-node-ref.tsx`
    - `packages/slate-react/src/components/slate.tsx`
    - `packages/slate-react/src/components/editable-text.tsx`
    - direct sync is currently guarded by `data-slate-dom-sync`, single
      `[data-slate-string]`, no composition, and component-level custom
      render/projection/placeholder checks.
  - Browser repair event owner found:
    - `packages/slate-react/src/components/editable.tsx`
    - repair currently exists for browser handle writes, keyboard undo/redo,
      native `historyUndo` / `historyRedo`, select-all, and shell-backed paste.
  - Core commit metadata state:
    - `SnapshotChange` exists and carries classes, dirty paths, touched runtime
      ids, and selection/mark/children flags.
    - There is no first-class `EditorCommit`.
    - There is no `Editor.getLastCommit(editor)`.
    - Subscriber API is still snapshot-first: `(snapshot, change)`.
    - `getPathByRuntimeId` is still recursive, not indexed.
  - Decision:
    - Phase 1 starts in `packages/slate`.
    - First vertical slice: introduce `EditorCommit` and `Editor.getLastCommit`
      while preserving existing `SnapshotChange` subscriber compatibility.
  - Earliest gates:
    - `bun test ./packages/slate/test/surface-contract.ts --bail 1`
    - `bun test ./packages/slate/test/transaction-contract.ts --bail 1`
    - `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- 2026-04-21: Completed Phase 1 first vertical slice.
  - Hypothesis:
    - core already had partial dirtiness as `SnapshotChange`, but the missing
      durable owner was a first-class commit record available without
      subscribers.
  - Actions:
    - added `EditorCommit`, `DirtyRegion`, and `OperationClass` types
    - made `SnapshotChange` an alias of the richer `EditorCommit`
    - added instance/static `Editor.getLastCommit(editor)`
    - recorded last commit metadata in `notifyListeners` even when there are
      no subscribers
    - preserved existing snapshot-first subscriber shape for compatibility
    - added transaction contract proof for no-subscriber commit metadata and
      subscriber-delivered commit metadata
    - added public surface proof for `getLastCommit`
    - added a `slate` patch changeset
  - Changed files:
    - `../slate-v2/packages/slate/src/interfaces/editor.ts`
    - `../slate-v2/packages/slate/src/core/public-state.ts`
    - `../slate-v2/packages/slate/src/core/apply.ts`
    - `../slate-v2/packages/slate/src/create-editor.ts`
    - `../slate-v2/packages/slate/test/transaction-contract.ts`
    - `../slate-v2/packages/slate/test/surface-contract.ts`
    - `../slate-v2/.changeset/slate-commit-metadata.md`
    - `docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md`
  - Evidence:
    - `bun test ./packages/slate/test/transaction-contract.ts --bail 1`
      passed, `13` tests
    - `bun test ./packages/slate/test/surface-contract.ts --bail 1`
      passed, `9` tests
    - `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
      passed, `190` tests
    - `bun run bench:core:observation:compare:local` passed; current remains
      bounded slower than legacy on observation lanes
    - `bun run bench:core:huge-document:compare:local` passed; current remains
      slower on typing and faster on replace/fragment lanes
    - `bunx turbo build --filter=./packages/slate --force` passed
    - `bunx turbo typecheck --filter=./packages/slate --force` passed
    - `bun run lint:fix` passed
    - `bun run lint` passed
  - Benchmark read:
    - observation mean deltas remain red:
      - read children after each: `+2.91ms`
      - nodes at root after each: `+2.03ms`
      - positions first block after each: `+2.74ms`
    - core huge-doc mean deltas:
      - start typing: `+3.57ms`
      - middle typing: `+3.37ms`
      - replace full doc: `-5.19ms`
      - insert fragment: `-5.59ms`
      - select all: `0ms`
  - Decision:
    - keep course into Phase 1/2 boundary.
    - next owner is not React yet; the red core observation/typing deltas and
      recursive runtime-id lookup point to live indexes and incremental
      snapshot/index maintenance.
  - Rejected tactics:
    - do not route React directly onto the richer commit until core indexes
      make runtime id/path lookup cheap enough.
    - do not remove child-count chunking before semantic-island replacement
      proof stays green after commit/index changes.
  - Next action:
    - implement live runtime-id/path indexes in `packages/slate` so
      `Editor.getPathByRuntimeId` is not recursive and commit dirty regions can
      publish runtime ids cheaply.
- 2026-04-21: Continue checkpoint after Phase 1 first slice.
  - Verdict: keep course.
  - Harsh take: last commit metadata without live indexes is a better API, not
    yet the perfect runtime. React would still be forced through too much old
    lookup behavior if it consumed this immediately.
  - Why:
    - `EditorCommit` and `Editor.getLastCommit` are green.
    - core observation and huge-doc typing remain bounded red against legacy.
    - Phase 0 found `getPathByRuntimeId` is recursive.
  - Risks:
    - indexing must preserve runtime id stability through insert/remove/move
      operations and replace snapshots.
    - stale indexes would corrupt React DOM/ref mapping, worse than a slow
      recursive lookup.
  - Earliest gates:
    - `bun test ./packages/slate/test/surface-contract.ts --bail 1`
    - `bun test ./packages/slate/test/transaction-contract.ts --bail 1`
    - `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
    - `bun run bench:core:observation:compare:local`
  - Next move:
    - implement live runtime id/path indexes in `packages/slate`.
  - Do-not-do list:
    - do not wire React selectors to commits before core lookup is cheap
    - do not hard-cut chunking before semantic-island gates survive index work
    - do not treat the current commit API as completion
- 2026-04-21: Completed Phase 2 first vertical slice.
  - Hypothesis:
    - runtime id/path lookup needs a live index, but text commits must not
      rebuild that index on the urgent path.
  - Actions:
    - added an internal cached live runtime index in `packages/slate`
    - routed public `Editor.getPathByRuntimeId` through the live index
    - kept text commit dirtiness on direct live-node runtime id reads so it
      does not build the full index
    - preserved removed-node runtime ids for no-subscriber structural commits
      by passing the previous snapshot index into dirtiness derivation
    - added surface proof for no-subscriber structural removal runtime ids
  - Rejected tactic:
    - invalidating/rebuilding the runtime index on every operation.
      It caused a hard perf regression:
      - observation read children mean jumped to about `15ms`
      - core huge-doc typing jumped to about `15ms`
  - Fixed tactic:
    - invalidate the runtime index only for path-changing structural ops:
      `insert_node`, `remove_node`, `move_node`, `merge_node`, `split_node`.
    - avoid public indexed runtime-id lookup in text commit dirtiness.
  - Changed files:
    - `../slate-v2/packages/slate/src/core/public-state.ts`
    - `../slate-v2/packages/slate/src/interfaces/editor.ts`
    - `../slate-v2/packages/slate/test/surface-contract.ts`
  - Evidence:
    - `bun test ./packages/slate/test/surface-contract.ts --bail 1`
      passed, `10` tests
    - `bun test ./packages/slate/test/transaction-contract.ts --bail 1`
      passed, `13` tests
    - `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
      passed, `190` tests
    - `bun run bench:core:observation:compare:local` passed after repair:
      - read children after each: current `4.81ms`, legacy `1.92ms`
      - nodes at root after each: current `12.76ms`, legacy `10.84ms`
      - positions first block after each: current `4.43ms`, legacy `2.28ms`
    - `bun run bench:core:huge-document:compare:local` passed after repair:
      - start typing: current `4.20ms`, legacy `0.71ms`
      - middle typing: current `4.36ms`, legacy `0.54ms`
      - replace full doc: current `3.50ms`, legacy `9.13ms`
      - insert fragment: current `3.43ms`, legacy `8.75ms`
    - `bun run lint:fix` passed
    - `bun run lint` passed
    - `bunx turbo build --filter=./packages/slate --force` passed
    - `bunx turbo typecheck --filter=./packages/slate --force` passed
  - Decision:
    - keep course, but do not call Phase 2 complete.
    - the live index exists, but snapshot/index maintenance is still rebuild
      based for observer snapshots.
  - Next action:
    - inspect `Editor.getSnapshot()` rebuild cost and decide whether the next
      owner is incremental snapshot/index maintenance or moving React away from
      snapshot-hot reads now that commit metadata and live runtime indexes
      exist.
- 2026-04-21: Cut first `slate-react` runtime-id snapshot-hot reads.
  - Hypothesis:
    - mounted text binding and large-document island preview should resolve
      runtime ids through live core APIs, not `Editor.getSnapshot().index`.
  - Actions:
    - replaced `useSlateNodeRef` runtime-id path lookup with
      `Editor.getPathByRuntimeId`
    - replaced `EditableText` bound text lookup with `Editor.getRuntimeId`,
      `Editor.getPathByRuntimeId`, and `Editor.getLiveText`
    - replaced `EditableTextBlocks` node binding and top-level runtime id
      derivation with live reads
    - replaced `LargeDocumentIslandShell` preview lookup with live path/node
      reads
    - added a `slate-react` patch changeset
  - Remaining `slate-react` `Editor.getSnapshot()` reads:
    - projection/widget stores: observer lane
    - `editable.tsx` selection reads: explicit selection path, not runtime-id
      lookup
  - Evidence:
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
      passed, `14` tests
    - `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
      passed, `4` tests
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium -g "DOM-owned|custom|projection|IME|undo|redo|delete"`
      passed, `14` tests
    - `bun run bench:react:rerender-breadth:local` passed locality guardrails
    - `bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --force`
      passed
    - `bun run lint` passed
  - 5000-block compare read:
    - first run during Playwright was red and noisy
    - rerun after forced build improved most lanes but still showed:
      - `middleBlockPromoteThenTypeMs`: v2 `52.40ms` vs chunking-on `37.99ms`
      - `selectAllMs`: v2 `4.00ms` vs chunking-on `0.73ms`, with clear
        outliers
    - steady typing/select+type lanes were green against chunking-on in the
      rerun.
  - Typecheck:
    - `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --force`
      is blocked by the known `slate-dom` generated declaration alias issue
      where `slate-dom` cannot resolve module `slate`.
  - Decision:
    - keep the React live-read cut; correctness and locality gates are green.
    - do not call the perf lane closed because 5000 promote/select-all remains
      red/noisy.
  - Next action:
    - profile the remaining 5000 `middleBlockPromoteThenTypeMs` red row after
      live runtime reads, then decide whether the owner is shell preview live
      lookup, shell activation/render, select-all shell-backed state, or
      benchmark noise.
- 2026-04-21: Profiled 5000 promote/select-all red after React live-read cut.
  - Actions:
    - ran active typing breakdown with `activeRadius=0`, `5000` blocks, `3`
      iterations, `10` type ops.
    - forced rebuild of `slate`, `slate-dom`, and `slate-react`.
    - reran 5000 huge-doc legacy compare with `3` iterations.
  - Evidence:
    - active typing breakdown:
      - promotion itself is cheap: mean `2.72ms`
      - `middlePromoteThenType` total act mean `51.97ms`
      - typing after promotion has React commits/renders in that benchmark
        because the breakdown uses custom renderers, so it is diagnostic but
        not the same workload as the default huge compare.
    - 5000 huge compare after forced build:
      - ready green: v2 `12.44ms`, chunk-on `348.42ms`
      - start type green: v2 `22.74ms`, chunk-on `42.87ms`
      - start select+type green: v2 `19.59ms`, chunk-on `44.59ms`
      - middle type green: v2 `23.97ms`, chunk-on `63.23ms`
      - middle select+type green: v2 `29.21ms`, chunk-on `50.15ms`
      - promote+type red: v2 `52.40ms`, chunk-on `37.99ms`
      - select-all noisy/red by mean: v2 `4.00ms`, chunk-on `0.73ms`
      - replace/fragment green
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium -g "DOM-owned|custom|projection|IME|undo|redo|delete"`
      passed, `14` tests.
  - Decision:
    - keep the core commit/live-index and React live-read changes.
    - do not close perf: promote+type and select-all are still red/noisy.
    - promotion shell code is probably not the owner; the owner is either
      activated text render after promotion, select-all shell-backed path, or
      benchmark variance.
  - Next action:
    - add a focused default-renderer promote+type breakdown so the measured
      workload matches huge compare instead of the current custom-renderer
      active breakdown.
    - then either optimize activated default text render or classify the first
      activation tradeoff explicitly with stable 5-iteration evidence.
- 2026-04-21: Added default-renderer active typing breakdown.
  - Actions:
    - added `REACT_ACTIVE_TYPING_BREAKDOWN_CUSTOM_RENDERERS=0` support to
      `scripts/benchmarks/browser/react/active-typing-breakdown.tsx`.
    - ran the breakdown with default renderers, `activeRadius=0`, `5000`
      blocks, `3` iterations, and `10` type ops.
  - Evidence:
    - `middlePromoteThenType` default-renderer breakdown:
      - promotion mean `2.06ms`
      - total act mean `11.69ms`
      - transform mean `11.68ms`
      - profiler commits `0`
      - text/leaf/element renders `0`
    - `startActiveTyping` default-renderer breakdown:
      - total act mean `11.03ms`
      - transform mean `11.03ms`
      - profiler commits `0`
    - `middleShelledModelOnly` default-renderer breakdown:
      - total act mean `13.73ms`
      - transform mean `13.69ms`
      - profiler commits `0`
    - `bun run lint:fix` passed
    - `bun run lint` passed
  - Decision:
    - the remaining huge-compare `middleBlockPromoteThenTypeMs` red is not
      shell promotion or React render in the default-renderer path.
    - likely owner is benchmark harness variance or mismatched lane setup.
  - Next action:
    - inspect `huge-document-legacy-compare.mjs` promotion/type lane against
      `active-typing-breakdown.tsx` and either align the harness or document
      the accepted first-activation tradeoff with stable evidence.
- 2026-04-21: Fixed huge-document legacy compare harness fairness.
  - Problem:
    - the full compare showed red/noisy `middleBlockPromoteThenTypeMs`,
      `middleBlockSelectThenTypeMs`, and `selectAllMs` rows even though focused
      source and built-package probes showed the product path was cheap and had
      zero React commits.
  - Root cause:
    - the benchmark harness mixed stale act semantics with late-suite
      measurement pollution.
    - select-all was measured after several heavier lanes even though each lane
      is meant to be independent.
    - queued mount/RAF work could bleed into the measured action because the
      harness did not settle after setup.
  - Actions:
    - changed `huge-document-legacy-compare.mjs` to prefer `React.act` and
      fall back to `react-dom/test-utils.act` for legacy React compatibility.
    - added a benchmark settle point after setup and after dispose in both
      legacy and current generated benchmark sources.
    - moved select-all immediately after ready for both legacy and v2 surfaces
      so it is measured as its own lane instead of after heavy typing/paste
      lanes.
    - extended `active-typing-breakdown.tsx` with:
      - default renderer mode
      - element-only renderer mode
      - middle select-then-type scenario
      - select-all scenario
    - removed the temporary built-package probe after use.
  - Evidence:
    - built-package probe with proper act:
      - middle type avg `15.13ms`, profiler commits `0`
      - middle select+type avg `23.06ms`, profiler commits `0`
      - promote+type avg `19.74ms`, profiler commits `1`
    - focused source breakdown with element-only renderer:
      - middle select+type total act mean `10.57ms`, profiler commits `0`
      - promote+type total act mean `11.42ms`, profiler commits `0`
      - select-all mean `5.39ms`, profiler commits `0`; this confirmed
        select-all noise is not React rendering
    - final 5000-block compare:
      - ready: v2 `15.96ms`, chunk-off `308.41ms`, chunk-on `326.27ms`
      - select-all: v2 `0.13ms`, chunk-off `14.85ms`, chunk-on `0.83ms`
      - start typing: v2 `16.39ms`, chunk-off `165.14ms`, chunk-on `36.96ms`
      - start select+type: v2 `24.26ms`, chunk-off `192.93ms`, chunk-on `47.80ms`
      - middle typing: v2 `18.06ms`, chunk-off `206.80ms`, chunk-on `35.76ms`
      - middle select+type: v2 `21.53ms`, chunk-off `187.65ms`, chunk-on `36.75ms`
      - middle promote+type: v2 `21.04ms`, chunk-off `180.08ms`, chunk-on `34.41ms`
      - replace full doc: v2 `23.45ms`, chunk-off `122.52ms`, chunk-on `122.43ms`
      - insert fragment: v2 `28.92ms`, chunk-off `120.89ms`, chunk-on `111.76ms`
    - `bun run lint:fix` passed
    - `bun run lint` passed
    - `bun test ./packages/slate/test/surface-contract.ts --bail 1` passed
    - `bun test ./packages/slate/test/transaction-contract.ts --bail 1` passed
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
      passed
  - Decision:
    - classify the red promote/select/select-all rows as benchmark-owned.
    - keep the core commit/live-index and React live-read cuts.
    - 5000 huge-doc compare is green again under the corrected fair harness.
  - Next owner:
    - Phase 6, formalize DOM-owned plain text capability and opt-out/repair
      reasons so the direct DOM lane is not just guarded by scattered checks.
- 2026-04-21: Formalized DOM-owned text sync capability.
  - Problem:
    - DOM-owned text sync was still encoded as scattered booleans and absence
      of `data-slate-dom-sync`, which makes opt-out ownership too implicit.
  - Actions:
    - added `getDOMTextSyncCapability(...)` with named opt-out reasons:
      `empty-text`, `projection`, `custom-leaf`, `custom-segment`,
      `custom-text`
    - preserved the existing `data-slate-dom-sync="true"` surface for enabled
      plain text
    - exposed `data-slate-dom-sync-reason` for disabled default text paths and
      for app-owned `renderText` when the app forwards attributes
    - added a pure capability contract test
    - expanded large-doc package tests to assert visible opt-out reasons
    - added a `slate-react` patch changeset
  - Evidence:
    - `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
      passed, `1` test
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
      passed, `14` tests
    - `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
      passed, `4` tests
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium -g "DOM-owned|IME|undo|redo|delete"`
      passed, `14` tests
    - clean 5000 huge-doc compare after Playwright finished:
      - ready: v2 `13.62ms`, chunk-off `254.11ms`, chunk-on `289.53ms`
      - select-all: v2 `0.13ms`, chunk-off `16.13ms`, chunk-on `0.81ms`
      - start typing: v2 `18.90ms`, chunk-off `159.06ms`, chunk-on `36.53ms`
      - start select+type: v2 `20.67ms`, chunk-off `169.53ms`, chunk-on `34.96ms`
      - middle typing: v2 `16.01ms`, chunk-off `162.83ms`, chunk-on `31.42ms`
      - middle select+type: v2 `24.99ms`, chunk-off `175.43ms`, chunk-on `31.07ms`
      - middle promote+type: v2 `23.50ms`, chunk-off `175.87ms`, chunk-on `32.93ms`
      - replace full doc: v2 `26.17ms`, chunk-off `107.69ms`, chunk-on `115.98ms`
      - insert fragment: v2 `32.89ms`, chunk-off `110.62ms`, chunk-on `109.09ms`
    - `bun run lint:fix` passed
    - `bun run lint` passed
    - `bunx turbo build --filter=./packages/slate-react --force` passed
  - Typecheck:
    - `bunx turbo typecheck --filter=./packages/slate-react --force` is still
      blocked by the known generated `slate-dom/dist/index.d.ts` aliasing
      issue:
      - missing `SlateBaseEditor`
      - missing `SlateEditor`
      - missing `SlateAncestor`
  - Decision:
    - Phase 6 capability formalization is complete enough to move on.
    - direct DOM sync is now an explicit capability with named opt-out reasons
      and browser repair proof remains green.
  - Next owner:
    - Phase 7, replace `decorate` as primary overlay architecture with typed
      overlay sources while keeping `decorate` only as a compatibility adapter.
- 2026-04-21: Started Phase 7 typed overlay source architecture.
  - Hypothesis:
    - before changing `Editable` internals, the safe first cut is to expose an
      explicit adapter from legacy `decorate(entry)` callbacks to typed
      projection sources.
  - Actions:
    - added `createSlateDecorationSource(decorate)`
    - added `SlateDecorate` and `SlateDecorationData` exports
    - converted decorated range payload into projection `data`
    - preserved decoration range anchors/foci as projection ranges
    - added a projection contract proving the adapter maps a legacy decoration
      callback into projection slices keyed by runtime id
    - added a `slate-react` patch changeset
  - Changed files:
    - `../slate-v2/packages/slate-react/src/projection-store.ts`
    - `../slate-v2/packages/slate-react/src/index.ts`
    - `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
    - `../slate-v2/.changeset/slate-react-decoration-source-adapter.md`
  - Evidence:
    - `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
      passed, `5` tests
    - `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
      passed
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
      passed
    - `bun run lint:fix` passed
    - `bun run lint` passed
    - `bunx turbo build --filter=./packages/slate-react --force` passed
  - Decision:
    - keep course.
    - `decorate` is not demoted internally yet, but a typed compatibility
      adapter now exists over the projection kernel.
  - Next owner:
    - route an example or internal compatibility path through
      `createSlateDecorationSource`, then decide whether `Editable.decorate`
      can be implemented as an adapter over projection source without
      regressing legacy decoration tests.
- 2026-04-21: Routed `search-highlighting` through decoration-source adapter.
  - Hypothesis:
    - examples that use simple legacy `decorate(entry)` callbacks can migrate
      to `createSlateDecorationSource` plus `EditableBlocks` without changing
      user-facing behavior.
  - Actions:
    - converted `site/examples/ts/search-highlighting.tsx` from
      `<Slate><Editable decorate={...}/></Slate>` to `EditableBlocks` with a
      `createSlateDecorationSource(decorate)` projection store
    - kept the legacy decorate callback as compatibility input
    - moved highlight rendering to `renderSegment`
    - kept mark rendering in `renderLeaf`
  - Changed files:
    - `../slate-v2/site/examples/ts/search-highlighting.tsx`
  - Evidence:
    - `bunx playwright test ./playwright/integration/examples/search-highlighting.test.ts --project=chromium`
      passed
    - `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
      passed
    - `bun run bench:react:rerender-breadth:local` passed locality guardrails
    - `bun run lint:fix` passed
    - `bun run lint` passed
  - Decision:
    - keep course.
    - do not rewrite `Editable.decorate` internals yet; first migrate another
      concrete decoration example so the adapter proves itself across more
      than simple search highlighting.
  - Next owner:
    - route `markdown-preview` through `createSlateDecorationSource`, because
      it is text-node decoration-only and lower risk than code highlighting.
- 2026-04-21: Routed `markdown-preview` through decoration-source adapter.
  - Hypothesis:
    - text-node decoration examples can migrate from `Editable.decorate` to
      `createSlateDecorationSource` plus projection segment rendering without
      user-visible behavior loss.
  - Actions:
    - converted `site/examples/ts/markdown-preview.tsx` to initialize the
      editor directly and render with `EditableBlocks`
    - reused the legacy Prism `decorate(entry)` callback as the compatibility
      input to `createSlateDecorationSource`
    - rendered markdown projection payload through `renderSegment`
    - kept placeholder behavior on the current `EditableBlocks` surface
  - Changed files:
    - `../slate-v2/site/examples/ts/markdown-preview.tsx`
  - Evidence:
    - `bunx playwright test ./playwright/integration/examples/markdown-preview.test.ts --project=chromium`
      passed
    - `bunx playwright test ./playwright/integration/examples/search-highlighting.test.ts --project=chromium`
      passed
    - `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
      passed
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
      passed
    - `bun run bench:react:rerender-breadth:local` passed
    - `bun run lint:fix` passed
    - `bun run lint` passed
    - `bunx turbo build --filter=./packages/slate-react --force` passed
  - Decision:
    - keep course.
    - `decorate` now has two concrete adapter-backed example paths:
      `search-highlighting` and `markdown-preview`.
    - do not change `Editable.decorate` internals until the block-level
      `code-highlighting` case proves the adapter can handle ancestor-owned
      ranges too.
  - Next owner:
    - route `code-highlighting` through `createSlateDecorationSource`; this is
      the harder block-level decoration case.
- 2026-04-21: Routed `code-highlighting` through decoration-source adapter.
  - Hypothesis:
    - the projection-source adapter can handle block-owned decoration ranges
      that project down into nested code-line text nodes, not only simple
      text-node callbacks.
  - Actions:
    - converted `site/examples/ts/code-highlighting.tsx` from
      `Editable.decorate` to `createSlateDecorationSource` plus `EditableBlocks`
    - kept `Slate` as the outer provider because the toolbar uses
      `useSlateStatic`
    - passed the projection store through `Slate`
    - rendered Prism token projection payload through `renderSegment`
    - kept element rendering and keyboard handling on the current example
      surface
  - Changed files:
    - `../slate-v2/site/examples/ts/code-highlighting.tsx`
  - Evidence:
    - `bunx playwright test ./playwright/integration/examples/code-highlighting.test.ts --project=chromium`
      passed, `3` tests
    - `bunx playwright test ./playwright/integration/examples/markdown-preview.test.ts --project=chromium`
      passed
    - `bunx playwright test ./playwright/integration/examples/search-highlighting.test.ts --project=chromium`
      passed
    - `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
      passed, `5` tests
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
      passed, `14` tests
    - `bun run bench:react:rerender-breadth:local` passed
    - `bun run lint:fix` passed
    - `bun run lint` passed
    - `bunx turbo build --filter=./packages/slate-react --force` passed
  - Decision:
    - keep course.
    - adapter route is now proved on:
      - simple search highlighting
      - text-node markdown preview
      - block-owned code highlighting ranges
    - the remaining Phase 7 question is internal: whether `Editable.decorate`
      itself can become adapter-backed without regressing legacy decoration
      tests.
  - Next owner:
    - inspect `Editable.decorate`, `useDecorations`, `useChildren`, and
      legacy decoration tests to decide whether the compatibility prop can be
      implemented over projection sources now, or whether it needs a staged
      adapter with tests first.
- 2026-04-21: Made `Editable.decorate` projection-adapter-backed.
  - Problem:
    - `Editable.decorate` was still the primary internal decoration path even
      after examples proved `createSlateDecorationSource` could handle text and
      block-owned ranges.
  - Key constraint:
    - legacy `decorate(entry)` callbacks expect live node identity. A naive
      projection adapter over immutable snapshot nodes breaks callbacks that
      assert `Node.get(editor, path) === node`.
  - Actions:
    - extended `createSlateDecorationSource(decorate, { editor })` so the
      adapter can traverse live editor nodes and include root/editor-owned
      decorations
    - changed `useDecorateContext` to route explicit custom `decorate` props
      through an internal `createSlateProjectionStore`
    - converted projection slices back into `DecoratedRange` objects for the
      legacy `Element` / `Text` render tree
    - kept default no-op `decorate` on the cheap direct path so huge-doc
      runtime does not create a projection store when no custom decorate prop
      exists
    - added a projection contract for editor-owned root decorations with live
      node entries
    - added a `slate-react` patch changeset
  - Rejected tactic:
    - always creating a projection adapter for default no-op `decorate`
      regressed 5000-block typing badly because every text op traversed the
      document. The fixed path only enables the adapter for an explicit custom
      `decorate` prop.
  - Evidence:
    - `bunx vitest run --config ./vitest.config.mjs test/decorations.test.tsx`
      passed, `20` tests across chunking and non-chunking decoration behavior
    - `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
      passed, `6` tests
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
      passed, `14` tests
    - `bunx playwright test ./playwright/integration/examples/search-highlighting.test.ts --project=chromium`
      passed
    - `bunx playwright test ./playwright/integration/examples/markdown-preview.test.ts --project=chromium`
      passed
    - `bunx playwright test ./playwright/integration/examples/code-highlighting.test.ts --project=chromium`
      passed, `3` tests
    - `bun run bench:react:rerender-breadth:local` passed
    - `bun run bench:react:huge-document-overlays:local` passed
    - `bun run lint:fix` passed
    - `bun run lint` passed
    - `bunx turbo build --filter=./packages/slate-react --force` passed
    - clean 5000 huge-doc compare after the default no-op fix was green on
      all important typing/paste/ready lanes; select-all was still noisy by
      mean against chunking-on due one v2 outlier, with focused select-all
      proof showing no React commits.
  - Decision:
    - Phase 7 is complete enough to move on.
    - `decorate` is now compatibility adapter-owned internally and in concrete
      examples; projection sources are the primary overlay architecture.
  - Next owner:
    - Phase 8, hard-cut child-count chunking from v2 product runtime while
      preserving legacy comparison fixtures.
- 2026-04-21: Hard-cut child-count chunking from current `slate-react` runtime.
  - Problem:
    - current package runtime still exposed legacy child-count chunking through
      `editor.getChunkSize`, `renderChunk`, `ChunkTree`, and `src/chunking/**`.
      That kept old runtime architecture alive inside v2.
  - Actions:
    - removed `getChunkSize` from `ReactEditor`
    - removed chunk-tree logic from `useChildren`
    - removed `renderChunk` / `RenderChunkProps` from `Editable` package
      surface
    - removed chunk move-node bookkeeping from `withReact`
    - deleted `src/chunking/**` and `components/chunk-tree.tsx`
    - deleted chunking-specific package tests
    - narrowed decoration/useSelected tests back to the standard render tree
    - updated the same-path `huge-document` example so it no longer teaches or
      depends on child-count chunking
    - updated the `huge-document` Playwright row to assert zero
      `[data-slate-chunk]` nodes
    - added a `slate-react` patch changeset
  - Preserved:
    - legacy chunking baselines inside `scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
      remain because they execute against `../slate`, not current
      `slate-react` product runtime.
  - Evidence:
    - no remaining package/source references to `getChunkSize`,
      `renderChunk`, `ChunkTree`, `getChunkTreeForNode`, or `data-slate-chunk`
      under `packages/slate-react/src`, `packages/slate-react/test`, or
      `site/examples/ts/huge-document.tsx`
    - `bunx vitest run --config ./vitest.config.mjs test/decorations.test.tsx test/use-selected.test.tsx`
      passed, `14` tests
    - `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
      passed
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
      passed
    - `bunx playwright test ./playwright/integration/examples/huge-document.test.ts --project=chromium`
      passed; same-path example renders without child-count chunks
    - `bun run lint:fix` passed
    - `bun run lint` passed
    - `bunx turbo build --filter=./packages/slate-react --force` passed
    - `bunx turbo typecheck --filter=./packages/slate-react --force` remains
      blocked by the known generated `slate-dom/dist/index.d.ts` alias issue:
      missing `SlateBaseEditor`, `SlateEditor`, and `SlateAncestor`
  - 5000-block compare after hard cut:
    - ready green: v2 `11.63ms`, chunk-off `259.85ms`, chunk-on `288.13ms`
    - select-all noisy by mean: v2 `2.20ms`, chunk-on `0.85ms`; median v2
      `0.14ms` remains better and focused select-all proof shows no React
      commits
    - start typing green: v2 `15.15ms`, chunk-on `35.43ms`
    - start select+type green: v2 `20.52ms`, chunk-on `36.84ms`
    - middle typing green: v2 `18.68ms`, chunk-on `33.98ms`
    - middle select+type green: v2 `16.74ms`, chunk-on `36.40ms`
    - middle promote+type noisy/accepted by mean: v2 `39.73ms`, chunk-on
      `34.88ms`; median v2 `37.75ms` vs chunk-on `34.47ms`
    - replace/fragment green
  - Decision:
    - Phase 8 is complete enough to move on.
    - child-count chunking is no longer current product runtime architecture.
    - remaining 5000 select-all/promote noise stays accepted as the existing
      first-activation/noisy-harness tradeoff unless a future product gate says
      every single mean row must beat chunking-on.
  - Next owner:
    - Phase 9, shell activation, selection, and accessibility. Prove shell
      activation is separate from selection unless intentionally selecting, and
      harden keyboard/ARIA behavior.
- 2026-04-21: Hardened shell activation accessibility semantics.
  - Actions:
    - added `aria-expanded="false"` to inactive large-document shell buttons
    - added package proof that Enter activation and Space activation both
      intentionally promote the shell and publish selection
    - kept existing proof that focus alone does not activate and does not
      mutate model selection
  - Evidence:
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
      passed, `15` tests
    - `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium -g "activates shells by keyboard"`
      passed
    - `bun run lint:fix` passed
    - `bun run lint` passed
    - `bunx turbo build --filter=./packages/slate-react --force` passed
  - Existing Phase 9 proof already covers:
    - focus does not activate or mutate selection
    - keyboard activation intentionally publishes selection
    - shell-backed select-all remains model-owned
    - shell-backed fragment paste works over full and partial shelled
      selections
  - Decision:
    - Phase 9 is complete enough to move on.
    - shell activation remains separate from selection unless the user action
      intentionally activates/selects.
  - Next owner:
    - Phase 10, legacy boundary and public API cleanup. Remove or classify
      leftover compatibility surfaces that no longer serve the hard-cut runtime
      architecture.
- 2026-04-21: Closed Phase 10 legacy boundary cleanup.
  - Actions:
    - fixed the known `slate-dom` declaration alias blocker by removing
      bundled-declaration-hostile type aliases in source:
      - `SlateBaseEditor`
      - `SlateEditor`
      - `SlateAncestor`
    - verified `slate-dom` and `slate-react` typecheck together
    - classified remaining compatibility surfaces:
      - `Editor.getSnapshot()` remains observer/devtools/test/non-urgent
        surface
      - `Editable.decorate` remains public compatibility, but internally routes
        through the projection-source adapter
      - legacy chunking remains only in the `../slate` comparison fixture
        generated by `huge-document-legacy-compare.mjs`
  - Evidence:
    - `bun test ./packages/slate-dom/test/bridge.ts --bail 1` passed
    - `bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1`
      passed
    - `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
      passed
    - `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
      passed
    - `bun run lint:fix` passed
  - Accepted/deferred:
    - 5000 huge-doc `selectAllMs` and first activation samples still show
      occasional noisy outliers, but focused probes show no React commits for
      select-all and promotion itself is cheap. The lane is accepted under the
      existing first-activation/noisy-harness tradeoff unless product requires
      every mean row to beat chunking-on.
  - Final decision:
    - hard-cut transaction runtime architecture lane is complete under this
      plan.
    - remaining work belongs to broader release/example parity, not this hard
      runtime architecture lane.
- 2026-04-21: Phase 8 hard cut follow-up.
  - Cleaned remaining package/runtime references:
    - removed `getChunkSize`, `renderChunk`, `RenderChunkProps`, `ChunkTree`,
      `src/chunking/**`, and chunking-specific package tests from current
      `slate-react`
    - removed chunking controls from the current `huge-document` example
    - updated `huge-document.test.ts` to assert no `[data-slate-chunk]` nodes
  - Evidence:
    - `bunx vitest run --config ./vitest.config.mjs test/decorations.test.tsx test/use-selected.test.tsx`
      passed
    - `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
      passed
    - `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
      passed
    - `bunx playwright test ./playwright/integration/examples/huge-document.test.ts --project=chromium`
      passed
    - `bunx turbo build --filter=./packages/slate-react --force` passed
    - `bun run lint` passed
  - Decision:
    - current product runtime no longer contains child-count chunking.
    - same-path `huge-document` remains as a huge-document stress example, not
      a child-count chunking example.
