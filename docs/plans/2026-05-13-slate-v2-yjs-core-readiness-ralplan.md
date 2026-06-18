# Slate v2 Yjs core-readiness ralplan

> Sync note, 2026-05-18: superseded for package timing by
> `docs/plans/2026-05-18-slate-yjs-package-readiness-ralplan.md`. The core
> substrate cautions remain useful, but current package work must use live
> `setup(...)` / `onCommit(...)` APIs instead of the older
> `register` / `commitListeners` examples.
>
> Sync note, 2026-05-24: do not use this file as the package plan. The latest
> package target remains
> `docs/plans/2026-05-18-slate-yjs-package-readiness-ralplan.md`, refreshed
> against current `../slate-v2`. Core readiness tests and the
> `collab-readiness` benchmark now pass; `packages/slate-yjs` source, the full
> simulation example, package tests, and Playwright selection proof still do
> not exist.
>
> Sync note, 2026-05-28: do not use this file for current `@slate/yjs`
> execution. Live `../slate-v2` now has `packages/slate-yjs` source, tests, an
> example, and Playwright rows. Current work lives in
> `docs/plans/2026-05-28-slate-yjs-current-architecture-operation-matrix.md`.

Date: 2026-05-13
Status: done
Score: 0.94
Owner skill: `.agents/skills/slate-ralplan/SKILL.md`

## Verdict

Do not create `slate-yjs` yet.

Current Slate v2 does not need a core rewrite for Yjs. The architecture is
already pointed the right way: commits, metadata, tags, operation replay,
extension runtime state, commit listeners, operation middleware, local runtime
ids, and bookmark rebasing are the right substrate.

The hard cut is the legacy adapter shape. The future package must not port
`slate-yjs`'s monkey-patched `editor.apply`, monkey-patched `editor.onChange`,
direct `editor.children` mutation, implicit `Transforms.select` restoration, or
Yjs storage leaking into raw Slate values. That shape is exactly the kind of
dirty hack v2 exists to avoid.

Before package work starts, core needs a focused readiness pass:

1. Prove a first-party collaboration adapter can be written entirely through
   `editor.extend(...)`, commit listeners, extension runtime state, and
   `editor.update(...)`.
2. Prove high-frequency remote updates cannot corrupt or strand local
   collapsed selections and bookmarks.
3. Prove canonical remote reconcile, not just incremental operation replay.
4. Prove remote imports skip history, focus, DOM selection export, and scroll.
5. Prove pause/disconnect/reconnect semantics without editor-object mutation.

## Intent and boundary

Intent: make Slate v2's core 100% ready for a clean first-party `slate-yjs`
package before release.

Outcome: an accepted core readiness checklist and execution queue. Package
creation starts only after the queue is green.

In scope:

- raw Slate v2 operation, transaction, commit, history, selection, bookmark,
  extension, and metadata contracts
- adapter architecture pressure from `../slate-yjs`,
  `../lexical/packages/lexical-yjs`, `../y-prosemirror`, and `../yjs`
- issue-ledger accounting for collaboration-related Slate issues
- tests and benchmarks that must exist before starting `slate-yjs`

Non-goals:

- no new `slate-yjs` package in this plan
- no provider, awareness, cursor UI, or collaborative comments product API
- no Plate compatibility API inside raw Slate
- no current `slate-yjs` public API compatibility promise
- no Yjs objects in raw Slate document values
- no live GitHub issue rediscovery unless an exact claim changes

Decision boundaries:

- Raw Slate owns substrate: values, operations, transactions, commits,
  metadata, anchors/bookmarks, history behavior, extension slots.
- A future `slate-yjs` package owns Yjs schema, provider integration, awareness,
  relative position conversion, canonical Y reconcile, and adapter-specific
  mapping.
- Plate owns opinionated collaborative comments, suggestions, cursors,
  permissions, and UI policy.

## Current Slate v2 evidence

Read from `Plate repo root`:

- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/core/public-state.ts`
- `packages/slate/src/core/editor-extension.ts`
- `packages/slate/src/core/extension-registry.ts`
- `packages/slate-history/src/with-history.ts`
- `packages/slate/test/collab-history-runtime-contract.ts`

What is already good:

- `BaseEditor` exposes `read`, `subscribe`, `update`, and `extend`.
- Transaction writes go through `editor.update(...)`.
- `tx.operations.replay(...)` replays known operation types and rejects unknown
  operation shapes.
- Commit listeners receive one frozen commit truth before snapshot subscribers.
- Commit metadata includes `collab`, `history`, `origin`, and `selection`.
- Canonical tags include `collaboration`, `skip-collab`,
  `skip-dom-selection`, `skip-scroll-into-view`, and
  `skip-selection-focus`.
- History already skips remote collaboration imports through metadata:
  `history.mode = "skip"`, `collab.saveToHistory = false`, or
  `collab.origin = "remote"`.
- Current contract tests prove three-peer deterministic replay for text, marks,
  delete, move, `replace_children`, remote history skip, local undo/redo rebase,
  bookmark rebase, and runtime ids staying local.

What is not proven enough:

- high-QPS remote inserts against local collapsed selection, the #5771 class
- exhaustive bookmark/relative-position-like behavior across split, merge,
  move, remove, and range deletes
- loop suppression for a real adapter extension, not just hand-authored replay
- pause/swap/reconnect adapter target semantics
- canonical Y-to-Slate reconcile when incremental Y event translation is not
  safe
- provider/awareness isolation from core history and selection behavior

## Ecosystem synthesis

### `../slate-yjs`

Steal:

- local-origin grouping for exported changes
- relative positions for cursor/selection persistence
- Y UndoManager selection restoration concept
- awareness state as an adapter-owned concern

Reject:

- monkey-patching `editor.apply`
- monkey-patching `editor.onChange`
- assigning `editor.children` during connect
- using normalization/connect side effects as sync semantics
- adapter code depending on legacy mutable editor object shape

Future Slate v2 shape:

- local export from a commit listener, reading `EditorCommit.operations`,
  metadata, tags, dirty runtime ids, and snapshot only when needed
- remote import through `editor.update(tx => tx.operations.replay(...), {
metadata, tag })`
- canonical reconcile through `tx.value.replace(...)` when Y event deltas are
  incomplete or ambiguous

### `../lexical/packages/lexical-yjs`

Steal:

- explicit collaboration tags to suppress loops
- dirty element/leaf style scoping
- remote sync tagged to skip scroll and focus side effects
- adapter-owned mapping layer instead of raw-editor Y knowledge
- property/default/exclusion policy for serialized state

Reject:

- Lexical node-key and node-class-specific coupling as a raw Slate model
  requirement
- package architecture that requires raw Slate to know Yjs classes

Future Slate v2 shape:

- commit dirtiness is the Slate equivalent of dirty node sets
- adapter extension state can own the Y mapping cache
- remote updates must carry `collaboration`, `skip-scroll-into-view`, and
  `skip-selection-focus` tags

### `../y-prosemirror`

Steal:

- canonical render/diff/reconcile fallback, not only incremental event deltas
- relative position bookmark mapping
- plugin ordering/origin discipline
- pause/swap sync target semantics
- remote changes excluded from local undo history
- awareness identity based on awareness doc client id, not an assumed editor id

Reject:

- ProseMirror transaction/plugin machinery as a raw Slate API goal
- full-doc diffing as the default local export path

Future Slate v2 shape:

- adapter can maintain a canonical Y-rendered Slate snapshot and reconcile only
  when incremental import cannot be trusted
- core tests must prove remote canonical replace preserves history and selection
  policy

## Architecture decision

Chosen option: keep raw Slate core unopinionated and add readiness contracts
before package work.

Rejected option: port legacy `slate-yjs` as-is.

Why rejected: it depends on the exact mutable/editor-object hooks v2 is removing.
It would smuggle legacy Slate's plugin model back into v2 and force future code
to debug sync through side effects.

Rejected option: move Yjs schema, awareness, or cursor policy into raw Slate.

Why rejected: that would make raw Slate opinionated and would make Plate and
other adapters pay for Yjs even when they use a different collaboration layer.

Rejected option: add moved-node payloads to `move_node` now.

Why rejected: current proof shows remote `move_node` replay and runtime-id
rebasing work. Adding payloads would bloat the operation shape to satisfy one
transport style before the adapter proves it cannot reconstruct state cleanly.

## Required core readiness queue

### P0. Adapter extension contract

Add a focused core test with a fake collaboration extension.

Acceptance:

- extension registers through `editor.extend(...)`
- extension uses runtime state, commit listener, and no editor monkey-patches
- local commit exports once
- remote import commit does not re-export
- `skip-collab` suppresses export
- cleanup detaches listeners and runtime state

This proves the future `slate-yjs` package can be cleanly mounted and unmounted.

### P0. Remote selection stress proof

Add the #5771-class test before package work.

Acceptance:

- local collapsed selection remains valid while remote inserts hit the same text
  node at high frequency
- local typing after remote inserts lands at the expected transformed point
- remote operations carry collaboration/history/selection metadata
- no selection anchor exception, stale path exception, or invalid point remains
- cover same-block prefix, same-offset, suffix, split, merge, and remove cases

This is the current biggest "now or never" risk.

### P0. Bookmark and relative-position substrate matrix

Add a core matrix inspired by `y-prosemirror` position tests.

Acceptance:

- every valid Slate point in a representative document can survive local
  bookmark capture, remote operation replay, and resolution
- include paragraphs, nested blocks, inline/text boundaries, void-adjacent
  points, split, merge, move, remove, and `replace_children`
- nulling is explicit when the anchor's target is deleted

The future Yjs adapter can own actual `Y.RelativePosition`, but core must prove
the Slate-side anchor substrate is stable.

### P0. Canonical remote reconcile

Add a test that remote sync can replace a canonical snapshot without local
history pollution.

Acceptance:

- `editor.update(tx => tx.value.replace(...), remoteCollabOptions)` produces one
  commit
- commit is tagged `collaboration`
- local undo stack is not polluted
- selection/focus/scroll policy is preserved
- bookmark/runtime-id behavior is deterministic after the replace

This is the escape hatch for Y event paths that cannot be translated safely.

### P1. Pause, disconnect, reconnect

Add a fake adapter test for lifecycle semantics.

Acceptance:

- paused adapter receives no local export
- reconnect can import a canonical remote state
- disconnect cleanup prevents future listener calls
- no direct mutation of `editor.children`, `editor.apply`, or `editor.onChange`

### P1. Remote update side-effect policy

Add React/browser-facing proof only after the core tests are green.

Acceptance:

- remote imports carry tags that skip scroll-into-view and selection focus
- current local selection can be preserved when requested
- remote-only sync cannot steal focus from the active editor/input

This blocks provider/cursor UI work, not raw core package readiness.

### P1. Performance and memory budget

Add one collab-readiness benchmark before package work. Do not scatter
single-purpose benchmark files.

Cohorts:

- 100 blocks, one peer, normal typing
- 1,000 blocks, two peers, remote text bursts
- 10,000 blocks, remote canonical reconcile
- pathological: repeated same-node remote inserts against local selection

Measure:

- commit/export time
- remote import time
- bookmark update time
- operation replay count
- heap growth after connect/disconnect loops

The bar is not "faster than Yjs"; the bar is bounded Slate-side overhead.

## Performance and benchmark pass

Pass status: complete.

New score after this pass: 0.92.

Applicability: applied.

Existing benchmark lanes inspected:

- `benchmarks/slate-v2/donor/README.md`
- `benchmarks/slate-v2/donor/core/current/transaction-execution.mjs`
- `benchmarks/slate-v2/donor/core/current/refs-projection.mjs`
- `benchmarks/slate-v2/donor/core/current/query-ref-observation.mjs`
- `benchmarks/slate-v2/donor/core/current/history-retained-memory.mjs`
- `benchmarks/slate-v2/donor/shared/stats.mjs`

Existing lanes already cover:

- operation replay vs separate updates
- ref/bookmark/projection cost
- write/read/ref drift
- history retained memory
- JSON benchmark artifacts with p75/p95/p99 summaries

Do not duplicate those lanes. The missing proof is collaboration-shaped
composition: fake adapter export, remote import metadata, bookmark load, history
skip, canonical reconcile, pause/reconnect cleanup, and heap tags in one lane.

### Required benchmark script

Add during `ralph` execution, not in this planning pass:

- `benchmarks/slate-v2/donor/core/current/collab-readiness.mjs`
- package script:
  - `bench:core:collab-readiness:local`: `bun ./scripts/benchmarks/core/current/collab-readiness.mjs`
- artifact:
  - `tmp/slate-collab-readiness-benchmark.json`

Use `scripts/benchmarks/shared/stats.mjs` for summaries. Do not add another
stats helper.

### Repeated unit

Primary repeated units:

- one local commit exported by a fake adapter
- one remote import batch replayed through `tx.operations.replay`
- one bookmark or range-ref updated by remote replay
- one canonical remote snapshot reconcile through `tx.value.replace`
- one connect/pause/reconnect/disconnect lifecycle loop

### Cohorts

| Cohort       | Blocks |              Remote ops | Bookmarks | Purpose                                                    |
| ------------ | -----: | ----------------------: | --------: | ---------------------------------------------------------- |
| normal       |    100 |                      50 |        25 | Common small editor with collaboration burst.              |
| large        |  1,000 |                     100 |       100 | Real app document with active anchors.                     |
| stress       | 10,000 |                     250 |       250 | Large document import/replay pressure before package work. |
| pathological |      1 | 1,000 same-node inserts |        50 | #5771-style hot text node pressure.                        |

### Benchmark lanes

The script should produce these lanes for each cohort:

- `localExportCommitMs`: local `editor.update` plus fake adapter commit export.
- `remoteReplayBatchMs`: one remote update with all operations replayed in one
  transaction.
- `remoteReplaySeparateMs`: same operations replayed as separate updates.
- `bookmarkRebaseMs`: remote replay while active bookmarks/range refs exist,
  then resolve them.
- `canonicalReplaceMs`: `tx.value.replace` with remote collaboration metadata.
- `historySkipMs`: same remote import with `withHistory`, asserting undo stack
  stays clean.
- `connectDisconnectHeapDeltaBytes`: repeated fake adapter extend/unextend with
  optional GC, reporting heap delta and listener cleanup.

Required invariant checks inside the benchmark:

- batch and separate remote replay converge to the same snapshot
- remote commits carry `collaboration` tag and `collab.origin = "remote"`
- remote imports do not create undo entries unless explicitly configured
- bookmarks either resolve or null; no stale path assertions
- connect/disconnect leaves no exported commit listener active

### Budget policy

Initial policy: calibration-only, not a release gate until three clean baseline
runs exist.

Artifact must include:

```ts
thresholdPolicy: {
  mode: 'calibration-only',
  releaseGate: false,
  repeatRunsRequiredBeforeEnforcement: 3,
}
```

Red flags that block `slate-yjs` package creation even before enforced numeric
thresholds:

- remote batch replay is consistently slower than separate replay in normal or
  large cohorts
- p95 latency grows faster than roughly linear with operation count for same
  document shape
- canonical replace leaves local undo entries
- bookmark resolution turns surviving anchors into stale paths instead of
  rebased ranges or `null`
- connect/disconnect heap delta grows monotonically across repeated cycles
- fake adapter cleanup still receives commits after unextend

### Existing benchmark commands to run after implementation

Run these from `/Users/zbeyens/git/slate-v2` after the new tests/benchmark land:

```bash
bun run bench:core:transaction:local
bun run bench:core:refs-projection:local
bun run bench:core:query-ref-observation:local
bun run bench:core:history-retained-memory:local
bun run bench:core:collab-readiness:local
```

The first four are regression context. The fifth is the new package-start gate.

### Performance skill matrix

- Vercel rules used: `js-length-check-first`, `js-early-exit`,
  `js-set-map-lookups`, `js-combine-iterations`, `rerender-defer-reads`,
  `client-event-listeners` for future React/package work.
- Extra performance rules used: cohort segmentation, repeated-unit budget,
  effect/subscription budget, memory DOM tagging, interaction INP matrix,
  editor native behavior proof.
- Repeated unit: commit export, remote replay batch, bookmark rebase, canonical
  replace, adapter lifecycle loop.
- Interaction metrics: lab proxy p95/p99 for remote replay and follow-up local
  typing after remote replay; browser INP is a later React/provider proof.
- Memory tags: heap delta, listener count cleanup assertion, history undo/redo
  entry counts, operation count, bookmark count, cohort id.
- Degradation contract: none for raw core. Any degraded cursor/UI behavior
  belongs to future provider or Plate package docs.
- React/runtime primitives: none in raw core. React `Activity`, transitions, and
  deferred values do not solve core replay, selection, or history correctness.
- Trace/CWV proof: out of scope for raw package readiness; browser trace belongs
  to the later remote side-effect/provider UI pass.
- Dashboard/RUM gap: package can later expose provider/client id, document
  cohort, remote op count, and import mode tags; raw core should only provide
  commit metadata and benchmark artifacts.

Plan delta:

- Performance proof belongs to `ralph` execution acceptance before `slate-yjs`
  package creation.
- It does not block writing the P0 tests.
- It does block declaring the core ready for package start.

## Deliberate P0 proof design

Pass status: complete.

New score after this pass: 0.84.

The existing core test suite already proves enough extension and metadata
substrate that the P0 execution should not waste time retesting generic
extension mechanics.

Already covered by current Slate v2 tests:

- `extension-methods-contract.ts`: register output, runtime state, cleanup
  signal, peer dependencies, conflicts, and hard rejection of legacy `methods`
  and public `commands` extension shapes.
- `extension-namespaces-contract.ts`: extension state/tx groups install without
  mutating the editor object and cleanly unextend.
- `transaction-contract.ts`: operation middleware sees transaction apply and
  `tx.operations.replay`, and extension commit listeners stop receiving commits
  after cleanup.
- `commit-metadata-contract.ts`: collaboration tags, origin metadata,
  history/selection metadata, frozen metadata, grouped updates, and full-document
  replace dirtiness.
- `write-boundary-contract.ts`: no direct primitive writers, no public
  `editor.apply`, and imported operations replay only through
  `tx.operations.replay`.
- `collab-history-runtime-contract.ts`: deterministic peer replay, remote
  history skip, undo/redo rebase, bookmark rebase, runtime-id locality, and
  `replace_children` import.

Therefore the execution queue should add four focused tests plus one optional
React/browser follow-up. No public API hardening is required before these tests.
If a test fails because the public surface is insufficient, that failure becomes
the API change proposal.

### Test 1: adapter loop suppression

Target file:

- `packages/slate/test/collab-adapter-extension-contract.ts`

Public APIs only:

- `createEditor`
- `defineEditorExtension`
- `editor.extend`
- `editor.update`
- `tx.operations.replay`
- `Editor.getLastCommit`
- `Editor.getSnapshot`

Fake adapter shape:

- extension-local runtime state stores:
  - `connected: boolean`
  - `paused: boolean`
  - `exports: Operation[][]`
  - `remoteImports: number`
  - `originClientId: string`
- commit listener exports local commits when all are true:
  - connected
  - not paused
  - commit is not tagged `skip-collab`
  - commit metadata is not `collab.origin === "remote"`
  - commit tags do not include `collaboration`
- fake remote import calls:
  - `editor.update(tx => tx.operations.replay(remoteOps), remoteOptions)`

Required assertions:

- local text edit exports exactly once
- remote import changes document but exports zero new local batches
- explicit `skip-collab` local update exports zero batches
- paused local update exports zero batches
- reconnect resumes local export
- unextend prevents later export/listener calls
- no assertion relies on private runtime internals

Why this matters:

- This is the clean v2 replacement for legacy `slate-yjs` patching
  `editor.apply` and `editor.onChange`.

### Test 2: high-QPS remote selection stress

Target file:

- either extend `packages/slate/test/collab-history-runtime-contract.ts`
- or create `packages/slate/test/collab-selection-stress-contract.ts`

Use the separate file if the test grows past a few scenarios.

Scenarios:

1. Same block, remote prefix inserts:
   - local selection starts at end of `one`
   - apply 50 remote `insert_text` operations at offset `0`
   - local type `!`
   - assert `!` lands after the original local caret content, not at stale
     offset `3`
2. Same offset contention:
   - local selection at offset `1`
   - apply multiple remote inserts at offset `1`
   - assert selection affinity is deterministic and local type is stable
3. Remote suffix inserts:
   - remote edits after local selection should not move the local selection
4. Remote split/merge around local selection:
   - split text node before and after the local point
   - merge back
   - assert local typing still lands at the resolved point
5. Remote remove containing local selection:
   - remote removes the selected node
   - assert selection nulls or resolves according to current core policy, but
     never throws or points to a missing path

Required metadata:

```ts
{
  metadata: {
    collab: { origin: 'remote', saveToHistory: false },
    history: { mode: 'skip' },
    selection: { dom: 'preserve', focus: false, scroll: false },
  },
  tag: ['collaboration', 'remote-import'],
}
```

Required assertions:

- no exception
- `Editor.getSnapshot(editor).selection` is valid or `null`
- local follow-up typing succeeds
- history has only local undo entries
- last remote commit carries collaboration metadata

Why this matters:

- This is the exact #5771 risk class. If this test passes, the core selection
  substrate is credible for Yjs. If it fails, fix core before any package work.

### Test 3: bookmark matrix for relative-position substrate

Target file:

- `packages/slate/test/collab-bookmark-position-contract.ts`

Document shape:

- paragraph text
- nested block/list-like elements
- inline-like element if current schema helpers can express it safely
- void-adjacent point if current raw schema has an established test fixture
- multi-block range

Matrix:

- point before text insert
- point after text insert
- point inside removed text node
- range spanning split node
- range spanning merge node
- range inside moved block
- range across `replace_children`

Required assertions:

- bookmark resolves to expected range after remote replay
- deleted targets resolve to `null`, not stale paths
- move preserves runtime-id-backed paths when the target survives
- unref cleanup is called in each row

Why this matters:

- A future Yjs adapter can convert to `Y.RelativePosition`, but Slate must first
  prove the model-side anchor/bookmark behavior is deterministic.

### Test 4: canonical remote reconcile

Target file:

- `packages/slate/test/collab-canonical-reconcile-contract.ts`

Core operation:

```ts
editor.update((tx) => {
  tx.value.replace({
    children: remoteCanonicalChildren,
    selection: currentSelectionOrNull,
    marks: null,
  });
}, remoteOptions);
```

Required assertions:

- one commit is published
- commit class is `replace`
- commit has `collaboration` tag and remote collab metadata
- `withHistory` undo stack is not polluted
- current selection policy is explicit:
  - preserve/null when remote canonical state invalidates it
  - no DOM/focus/scroll side effect implied by metadata
- runtime ids are reseeded deterministically where old nodes survive
- existing bookmarks either rebase or null cleanly

Why this matters:

- `y-prosemirror` does not trust incremental events for every case; it can
  render canonical Y state and reconcile. Slate v2 needs the same escape hatch.

### Test 5: remote side-effect policy

Priority: P1, after the P0 package-level tests.

Target:

- a `slate-react` contract test if the React runtime already consumes
  `skip-scroll-into-view` / `skip-selection-focus`
- otherwise first add a planning note to the browser/React execution queue

Required assertions:

- remote import does not steal focus
- remote import does not force scroll-into-view
- local follow-up typing still works

Why this matters:

- Lexical explicitly tags remote sync to skip scroll. Slate v2 has canonical
  tags and metadata; the browser layer must honor them before provider UX ships.

## API hardening verdict

No immediate public API hard cut is needed before the P0 tests.

Keep:

- `editor.extend(...)`
- `defineEditorExtension(...)`
- extension runtime state
- commit listeners
- operation middleware
- `editor.update(...)`
- `tx.operations.replay(...)`
- `tx.value.replace(...)`
- typed update metadata and tags

Do not add:

- public `editor.apply`
- public `editor.onChange`
- adapter-specific collaboration methods on the editor object
- raw Yjs schema or `Y.Doc` handles in `slate`
- moved-node payloads in `move_node` before adapter proof demands it

Potential API gap to watch:

- Operation middleware currently receives operation and editor, not update
  metadata directly. This is acceptable for the planned adapter because export
  loop control belongs in the commit listener, where metadata and tags are
  available. Do not change middleware unless the P0 adapter test proves it
  cannot express a real use case.

## Adapter API steelman pass

Pass status: complete.

New score after this pass: 0.89.

Steelman verdict: keep the "no new public API before P0 tests" decision, but
make it stricter. The execution must prove the future adapter can be built from
generic extension APIs. If the P0 adapter test needs private state, runtime
monkey-patching, or metadata unavailable from public commits, that failing test
becomes the API-change request.

| Decision                                                            | Strongest fair objection                                                                               | Viable alternatives                                                                                           | Why current decision wins                                                                                                                                                                       | Proof required                                                                                                                                            | Verdict     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Do not add public `editor.apply`                                    | A collaboration adapter needs to intercept every op; commit listeners may be too late.                 | Restore public `editor.apply`; add adapter-specific op interceptors; use operation middleware.                | Public `editor.apply` is exactly the legacy escape hatch v2 cut. Operation middleware already routes `tx.operations.replay`; commit listeners see typed metadata and tags for export control.   | `collab-adapter-extension-contract.ts` proves local export and remote import loop suppression without `editor.apply`.                                     | keep        |
| Do not add public `editor.onChange`                                 | Adapter authors know the old `onChange` flush model; commit listeners may feel unfamiliar.             | Restore `onChange`; add `onCommit`; keep extension commit listeners.                                          | Extension commit listeners are already the `onCommit` shape, with cleanup, ordering, frozen commit data, and optional snapshot. A second public callback surface would split truth.             | Adapter test exports once per local commit and cleanup stops future export.                                                                               | keep        |
| Do not add adapter-specific methods on the editor object            | A first-party `slate-yjs` package may want ergonomic `editor.connectYjs()` / `editor.disconnectYjs()`. | Editor object methods; extension editor group; standalone adapter controller.                                 | Raw Slate should not grow Yjs nouns. If ergonomics are needed, the package can expose a controller or extension editor group without polluting core.                                            | P0 adapter lifecycle test uses extension runtime state and cleanup; future package docs can expose a package-level wrapper.                               | keep        |
| Do not pass update metadata into operation middleware yet           | Per-operation middleware cannot know whether the current op came from remote import.                   | Add metadata to middleware context now; use commit listener for export gating; add tx-scoped metadata getter. | Export gating belongs at commit level because Yjs batches and history decisions are commit-level. Adding metadata to middleware before a failing test would widen hot-path API for speculation. | P0 test proves remote imports do not re-export via commit metadata. If an actual transform middleware needs metadata, add it with a failing adapter test. | keep, watch |
| Do not add raw `Y.Doc` / provider / awareness handles to Slate core | A first-party package could be cleaner if core understands Yjs lifecycle.                              | Core Yjs handles; extension capabilities; package-local controller.                                           | Core must stay collaboration-backend agnostic. `slate-yjs` can own Yjs lifecycle through extension options, runtime state, cleanup signal, and package exports.                                 | Adapter lifecycle test proves connect, pause, reconnect, cleanup without core Yjs nouns.                                                                  | keep        |
| Do not add moved-node payloads to `move_node` now                   | OT/Yjs transports often benefit from the moved node payload; #3741 asks for it directly.               | Add payload; canonical reconcile fallback; adapter reconstructs from Y state.                                 | Current v2 proves remote `move_node` replay and runtime-id rebase. A payload bloats every move op for one transport theory before the adapter proves the need.                                  | P0 canonical reconcile plus bookmark matrix. If adapter cannot reconstruct moves without payload, add a focused operation-shape proposal.                 | keep        |
| Do not make cursor/awareness a raw Slate API                        | Collaboration without cursors feels incomplete.                                                        | Raw cursor store; slate-react package hook; Plate/product cursor UI.                                          | Cursor rendering is UI policy. Raw core should supply stable anchors/bookmarks and side-effect metadata only.                                                                                   | P0 bookmark matrix and P1 remote side-effect proof.                                                                                                       | keep        |

Accepted revision from this pass:

- Test 1 must assert that the fake adapter exposes any ergonomics through an
  adapter-owned controller or extension group, not through new raw editor
  methods.
- Test 4 must assert that canonical remote reconcile can intentionally preserve
  or null model selection through explicit snapshot input; no hidden selection
  magic.
- P0 failure policy is now explicit: add public API only after a failing public
  API test proves the current surface cannot express a real adapter requirement.

Dropped choices:

- Add `collaboration` tx/state groups to raw Slate before package work.
- Add metadata to operation middleware preemptively.
- Add Yjs-specific capabilities to raw Slate.

Unresolved:

- React side-effect policy still needs a later browser-facing pass. Core has
  tags and metadata; this pass does not prove `slate-react` honors them.

## Issue-ledger accounting

No claim should be promoted by the planning pass alone. After Ralph execution
lands and verifies the P0 collaboration-selection proof, `#5771` can move to
`Improves`; no `Fixes` claim is allowed without a real adapter/browser repro.

Keep:

- `#5771` as related/needs focused collaboration-selection proof.
- `#5533` as related. Operation replay supports collaboration substrates, but
  Slate does not ship a first-party non-Yjs collaboration protocol.
- `#3741` as related. Do not add moved-node payloads without adapter proof.
- `#4477` as improves only through annotation/anchor substrate; product-level
  collaborative comments stay outside raw Slate.
- `#3715` as docs/example pressure for the later package/docs lane.

If P0 tests land and pass, update:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`

Do not touch `docs/slate-issues/gitcrawl-live-open-ledger.md`; it is generated
live input.

## Issue-ledger pre-sync pass

Pass status: complete.

New score after this pass: 0.88.

Ledger decision: preserve current classifications. This plan changes future
proof requirements, not current issue claims. No ledger edits are required until
the P0 tests actually land and pass.

Evidence read:

- `docs/slate-issues/gitcrawl-live-open-ledger.md` still lists current open
  collaboration rows: `#5771`, `#5533`, `#4477`, `#3741`, `#3715`, and `#3482`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` keeps `#5771` and `#5533`
  as `Related`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` keeps `#3741` as `Related`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` keeps `#4477` as
  `Improves`.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md` keeps `#3715` as
  `not-claimed`.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md` keeps `#3482` as
  `cluster-synced`.

Exact decisions:

| Issue   | Current ledger state         | This plan decision                                                                                                                                              |
| ------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#5771` | `Related` / `cluster-synced` | Promote to `Improves` only after P0 proof lands. Exact closure still waits for provider/browser proof.                                                          |
| `#5533` | `Related`                    | Keep. v2 operation replay is collaboration substrate, not a first-party OT or non-Yjs collaboration protocol.                                                   |
| `#3741` | `Related`                    | Keep. Do not add `move_node.node` payloads before adapter proof shows current replay/canonical reconcile is insufficient.                                       |
| `#4477` | `Improves`                   | Keep. Annotation/bookmark substrate helps, but collaborative comments remain product/Plate/package policy.                                                      |
| `#3715` | `not-claimed`                | Keep. Docs/examples pressure belongs to the later `slate-yjs` package/docs lane, not raw core readiness.                                                        |
| `#3482` | `cluster-synced`             | Keep. Void children/collaboration pressure is covered by core model/selection architecture; only promote if the P0 bookmark matrix exposes a void-adjacent gap. |

No `Fixes #...` claims are allowed from this plan. The strongest honest
claim after this planning pass is "readiness work queued."

## Maintainer objection ledger

| Objection                                       | Answer                                                                                                                    | Verdict         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------- |
| "Why not just port slate-yjs?"                  | Because it depends on mutable editor hooks v2 deliberately removed. Porting that shape would reintroduce legacy coupling. | reject          |
| "Why no `move_node.node` payload for #3741?"    | Existing v2 proof covers remote move replay and runtime-id rebasing. Payload expansion needs adapter proof first.         | keep current op |
| "Why not put Yjs in raw Slate?"                 | Raw Slate should remain unopinionated. Yjs belongs in a package extension.                                                | reject          |
| "Is this overbuilding before a package exists?" | No. The P0 tests are the minimum proof that the package can be clean instead of a monkey-patch wrapper.                   | keep            |
| "Can cursor UI wait?"                           | Yes. Core readiness needs stable anchors and side-effect policy. Cursor UI belongs to React/Plate/package work.           | defer UI        |

## Applied review notes

Intent boundary pass: applied. Package creation, provider UX, and Plate policy are
out of scope.

Steelman pass: applied. The strongest objections are that adapter authors may
need `editor.apply`, per-operation metadata, or Yjs-specific lifecycle nouns.
Rejected for now because the generic extension API should prove itself through
P0 tests first.

High-risk deliberate pass: applied. Collaboration touches data integrity,
selection, history, provider lifecycle, and package boundaries.

Performance-oracle: applied. The plan now requires bounded operation replay,
canonical reconcile, bookmark update, history skip, and connect/disconnect heap
rows before package creation.

Performance skill: applied. Cohorts, repeated-unit budgets, memory tags, and
calibration policy are explicit in the collab-readiness benchmark lane.

Vercel React best practices: applied only for future React/browser side effects.
No React implementation in this pass.

TDD: applied as execution rule. Each P0 row starts with a failing behavior test
through public APIs, then implementation if needed.

Research-wiki: maintain mode is enough. Existing Yjs/collaboration research is
adequate for this first pass; add a dedicated research page only if later passes
find contradiction or missing corpus evidence.

## Pass schedule

Current pass: final readiness scoring pass, complete.

Next pass: none for `slate-ralplan`.

Next owner:

1. `ralph` executes the accepted core readiness queue in `Plate repo root`.
2. `ralph` keeps `slate-yjs` package creation blocked until P0 tests and the
   collab-readiness benchmark are green.

This `done` state means the plan is ready for execution. It does not mean core
is package-ready yet.

## Final readiness scoring pass

Pass status: complete.

Final score: 0.94.

Decision: planning is complete and execution-ready. Do not create a
`slate-yjs` package yet.

Why this can close:

- Intent, outcome, scope, non-goals, and ownership boundaries are explicit.
- Existing core substrate evidence is grounded in live `Plate repo root` files and
  focused tests.
- External editor evidence is converted into Slate-specific mechanisms instead
  of copy-pasted adapter shapes.
- P0 and P1 execution rows are concrete, file-scoped, and test-first.
- The API hardening verdict has accepted objections and a failure policy:
  add public API only after a public-API test proves the current surface cannot
  express a real adapter requirement.
- Issue-ledger state is conservative: no `Fixes #...` claim is promoted until
  proof lands.
- Performance work has one benchmark lane with cohorts, repeated units,
  invariants, artifact path, and calibration policy.

What remains before package creation:

- Implement the P0 fake adapter extension contract.
- Implement the high-QPS remote selection stress proof.
- Implement the bookmark/relative-position substrate matrix.
- Implement canonical remote reconcile proof.
- Implement or queue the P1 remote side-effect policy proof.
- Add and run the collab-readiness benchmark beside the existing core benchmark
  lanes.

Ralph handoff:

- Execute the plan in `Plate repo root`.
- Do not touch `plate-2` issue claims until passing proof justifies a ledger
  update.
- Do not create a `slate-yjs` package until all P0 rows and the benchmark gate
  pass.

## Ralph execution ledger

### 2026-05-13 - Start P0 adapter contract

Status: complete.

Current owner: `packages/slate`.

Current pass: `p0-collab-adapter-extension-contract`.

Continuation prompt:
`active goal state`.

Scope:

- Add `packages/slate/test/collab-adapter-extension-contract.ts`.
- Prove a fake collaboration adapter can use public extension/runtime/commit
  APIs without editor monkey-patching.
- Keep issue ledgers unchanged unless passing proof changes a claim.

Next action:

- Completed
  `packages/slate/test/collab-adapter-extension-contract.ts`.

Evidence:

```bash
bun test ./packages/slate/test/collab-adapter-extension-contract.ts
# 1 pass, 0 fail
```

Verdict:

- Current public extension APIs are enough for adapter loop suppression,
  pause/resume, remote import suppression, `skip-collab`, and cleanup listener
  removal.

Next action:

- Implement
  `packages/slate/test/collab-selection-stress-contract.ts`.

### 2026-05-13 - P0 remote selection stress

Status: complete.

Current owner: `packages/slate`.

Changed file:
`packages/slate/test/collab-selection-stress-contract.ts`.

Evidence:

```bash
bun test ./packages/slate/test/collab-selection-stress-contract.ts
# 5 pass, 0 fail
```

Verdict:

- Remote prefix bursts, same-offset contention, suffix inserts, split/merge,
  and selected-node removal keep the model selection valid or rebased.
- The selected-node removal policy is stronger than the plan fallback: current
  core rebases to the previous surviving text end instead of nulling.
- Local follow-up typing succeeds after every remote scenario.
- Remote collaboration metadata skips local history.

Next action:

- Implement
  `packages/slate/test/collab-bookmark-position-contract.ts`.

### 2026-05-13 - P0 bookmark position matrix

Status: complete.

Current owner: `packages/slate`.

Changed file:
`packages/slate/test/collab-bookmark-position-contract.ts`.

Evidence:

```bash
bun test ./packages/slate/test/collab-bookmark-position-contract.ts
# 6 pass, 0 fail
```

Verdict:

- Collapsed bookmarks before/after remote text insert rebase deterministically.
- Deleted bookmark targets resolve to `null`.
- Split, merge, move, and `replace_children` remote replay preserve or rebase
  surviving bookmark ranges.
- Runtime ids remain local and path-resolvable after remote move.
- Every bookmark row calls `unref()`.

Next action:

- Implement
  `packages/slate/test/collab-canonical-reconcile-contract.ts`.

### 2026-05-13 - P0 canonical remote reconcile

Status: complete.

Current owner: `packages/slate`.

Changed file:
`packages/slate/test/collab-canonical-reconcile-contract.ts`.

Evidence:

```bash
bun test ./packages/slate/test/collab-canonical-reconcile-contract.ts
# 2 pass, 0 fail
```

Verdict:

- Remote canonical `tx.value.replace` publishes one `replace` commit with
  collaboration metadata and skips history.
- Explicit model selection can be preserved or cleared by snapshot input.
- Same-position runtime ids and bookmarks survive canonical replace.
- DOM/focus/scroll side-effect policy remains metadata only and belongs to the
  P1 React/browser proof.

Next action:

- Inspect `packages/slate-react` handling for
  `skip-scroll-into-view`, `skip-selection-focus`, and
  `metadata.selection`, then add the smallest proof or queue the exact owner.

### 2026-05-13 - P1 remote side-effect policy

Status: complete.

Current owners:

- `packages/slate-react/src/editable/selection-side-effect-policy.ts`
- `packages/slate-react/src/editable/selection-controller.ts`
- `packages/slate-react/src/editable/selection-reconciler.ts`
- `packages/slate-react/src/editable/mutation-controller.ts`
- `packages/slate-react/src/editable/dom-repair-queue.ts`

Changed tests:

- `packages/slate-react/test/app-owned-customization.tsx`
- `packages/slate-react/test/selection-side-effect-policy-contract.ts`
- `packages/slate-react/test/selection-side-effect-policy-contract.test.ts`

Evidence:

```bash
bun test:vitest --run test/app-owned-customization.test.tsx test/selection-side-effect-policy-contract.test.ts
# 2 files passed, 8 tests passed
```

Verdict:

- Remote collaboration selection metadata now suppresses scroll and focus side
  effects.
- Model selection sync still runs.
- App-owned `scrollSelectionIntoView` is still called for normal local
  selection updates.

Next action:

- Implement
  `benchmarks/slate-v2/donor/core/current/collab-readiness.mjs` and
  `bench:core:collab-readiness:local`.

### 2026-05-13 - Collab-readiness benchmark

Status: implementation complete; default verification still runs in the final
sweep.

Current owners:

- `benchmarks/slate-v2/donor/core/current/collab-readiness.mjs`
- `Plate repo root/package.json`

Evidence:

```bash
SLATE_COLLAB_READINESS_ITERATIONS=1 bun run bench:core:collab-readiness:local
# passed and wrote tmp/slate-collab-readiness-benchmark.json
```

Verdict:

- Benchmark covers normal, large, stress, and pathological cohorts.
- Lanes cover local export, remote replay batch, remote replay separate,
  bookmark rebase, canonical replace, history skip, and connect/disconnect heap
  delta.
- Artifact includes calibration-only threshold policy.
- Batch and separate remote replay converge before timing lanes run.

Next action:

- Sync reference-doc and issue-ledger decisions, then run the default benchmark
  and focused final verification.

### 2026-05-13 - Reference-doc and issue-ledger sync

Status: complete.

Current owners:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`

Verdict:

- `#5771` moved from `Related` / `cluster-synced` to `Improves` /
  `improves-claimed`.
- No `Fixes #5771` claim was added. The new proof covers the Slate-side
  collaboration-selection substrate; exact upstream provider/browser closure
  remains unclaimed.
- PR-description fixed issue count stays `32`.

Next action:

- Run final focused tests, lint/typecheck, default collab benchmark, context
  benchmark lanes, and completion check.

## Verification so far

Source inspected from live local checkouts:

- `../slate-yjs/packages/core/src/plugins/withYjs.ts`
- `../slate-yjs/packages/core/src/applyToYjs/index.ts`
- `../slate-yjs/packages/core/src/applyToSlate/index.ts`
- `../slate-yjs/packages/core/src/utils/position.ts`
- `../slate-yjs/packages/core/src/plugins/withYHistory.ts`
- `../slate-yjs/packages/core/src/plugins/withCursors.ts`
- `../lexical/packages/lexical-yjs/src/Bindings.ts`
- `../lexical/packages/lexical-yjs/src/SyncEditorStates.ts`
- `../lexical/packages/lexical-yjs/src/SyncCursors.ts`
- `../lexical/packages/lexical-yjs/src/SyncV2.ts`
- `../y-prosemirror/src/sync-plugin.js`
- `../y-prosemirror/src/positions.js`
- `../y-prosemirror/src/undo-plugin.js`
- `../y-prosemirror/src/cursor-plugin.js`
- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/core/public-state.ts`
- `packages/slate/src/core/editor-extension.ts`
- `packages/slate/src/core/extension-registry.ts`
- `packages/slate-history/src/with-history.ts`
- `packages/slate/test/collab-history-runtime-contract.ts`

Final verification sweep:

```bash
cd /Users/zbeyens/git/slate-v2 && bun lint:fix
# Checked 1616 files. Fixed 1 file.
```

```bash
cd /Users/zbeyens/git/slate-v2 && bun --filter slate typecheck
# slate typecheck: Exited with code 0
```

```bash
cd /Users/zbeyens/git/slate-v2 && bun --filter slate-react typecheck
# slate-react typecheck: Exited with code 0
```

```bash
cd /Users/zbeyens/git/slate-v2 && bun test \
  ./packages/slate/test/extension-methods-contract.ts \
  ./packages/slate/test/extension-namespaces-contract.ts \
  ./packages/slate/test/transaction-contract.ts \
  ./packages/slate/test/commit-metadata-contract.ts \
  ./packages/slate/test/write-boundary-contract.ts \
  ./packages/slate/test/collab-history-runtime-contract.ts \
  ./packages/slate/test/collab-adapter-extension-contract.ts \
  ./packages/slate/test/collab-selection-stress-contract.ts \
  ./packages/slate/test/collab-bookmark-position-contract.ts \
  ./packages/slate/test/collab-canonical-reconcile-contract.ts
# 71 pass, 0 fail
```

```bash
cd /Users/zbeyens/git/slate-v2/packages/slate-react && bun test:vitest --run \
  test/app-owned-customization.test.tsx \
  test/selection-side-effect-policy-contract.test.ts
# 2 files passed, 8 tests passed
```

```bash
cd /Users/zbeyens/git/slate-v2 && bun run bench:core:collab-readiness:local
# passed; wrote tmp/slate-collab-readiness-benchmark.json
```

```bash
cd /Users/zbeyens/git/slate-v2 && bun run bench:core:transaction:local
# passed; updateReplayMeanMs 0.08, separateUpdateMeanMs 0.22
```

```bash
cd /Users/zbeyens/git/slate-v2 && bun run bench:core:refs-projection:local
# passed
```

```bash
cd /Users/zbeyens/git/slate-v2 && bun run bench:core:query-ref-observation:local
# passed
```

```bash
cd /Users/zbeyens/git/slate-v2 && bun run bench:core:history-retained-memory:local
# passed
```

```bash
cd /Users/zbeyens/git/slate-v2 && bun lint
# Checked 1616 files. ESLint passed.
```

Completion check:

```bash
cd /Users/zbeyens/git/plate-2 && node tooling/scripts/completion-check.mjs
# [completion-check] complete: /Users/zbeyens/git/plate-2/active goal state
```
