---
date: 2026-05-23
topic: slate-v2-core-operation-performance
status: pending-ralph-execution
skill: slate-ralplan
score: 0.87
next_pass: ralph-core-operation-performance-execution
---

# Slate v2 Core Operation Performance Ralplan

## Verdict

Start the next lane in `packages/slate`, not `slate-react`.

The large-document React/virtualization lane is clean enough for its current
claims. The fresh red owner is core operation cost: simple text inserts and
selection changes still pay too much transaction, snapshot, root index, dirty
metadata, and observation overhead at document scale.

Do not hide this behind virtualization. Virtualization can reduce mounted DOM.
It cannot make `tx.text.insert` cheap enough if the core write path is doing
document-sized work.

## Intent

Create the execution lane that makes common Slate core operations scale with
the edited path and operation family, not with total document size.

Primary target:

- `tx.text.insert(...)`
- `tx.text.delete(...)`
- `tx.selection.set(...)`
- `tx.operations.replay(...)` for batch-style issue `#6038`
- commit dirtiness and listener publication after those writes

## Current Evidence

Read surfaces:

- `docs/plans/2026-05-23-slate-v2-large-document-performance-virtualization-ralplan.md`
- `docs/solutions/performance-issues/2026-04-11-slate-v2-huge-document-typing-needs-selector-fanout-cuts-before-islands.md`
- `docs/solutions/performance-issues/2026-05-01-slate-v2-text-snapshots-should-be-path-stable-for-large-document-typing.md`
- `docs/solutions/developer-experience/2026-04-19-slate-public-single-op-writes-should-use-editor-apply-and-keep-onchange-behind-subscribers.md`
- `benchmarks/slate-v2/donor/core/compare/huge-document.mjs`
- `benchmarks/slate-v2/donor/core/current/transaction-execution.mjs`
- `benchmarks/slate-v2/donor/slate/6038-transaction-execution.mjs`
- `packages/slate/src/core/public-state.ts`
- `packages/slate/src/core/apply.ts`
- `packages/slate/src/editor/insert-text.ts`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-issues/test-candidate-map/6038-6007.md`

Fresh command:

```bash
cd Plate repo root
CORE_HUGE_BENCH_LEGACY_REPO=/Users/zbeyens/git/slate CORE_HUGE_BENCH_ITERATIONS=1 CORE_HUGE_BENCH_BLOCKS=1000 CORE_HUGE_BENCH_TYPE_OPS=5 bun run bench:core:huge-document:compare:local
```

Fresh result:

| Lane | v2 current | legacy | delta |
| --- | ---: | ---: | ---: |
| start block type, 5 ops | `21.68ms` | `0.42ms` | `+21.26ms` |
| middle block type, 5 ops | `23.34ms` | `0.18ms` | `+23.16ms` |
| replace full document with text | `10.52ms` | `10.02ms` | `+0.50ms` |
| insert fragment full document | `8.55ms` | `7.46ms` | `+1.09ms` |
| select all | `7.18ms` | `0.01ms` | `+7.17ms` |

The larger previous lane run with `20` type ops showed the same shape:
`86.95ms` / `83.78ms` v2 typing against `0.72ms` / `0.68ms` legacy, while
full-document replacement and fragment insertion were close to legacy.

That means the problem is not "all core operations are slow." The problem is
the common small-write path.

## Likely Hot Owners

These are hypotheses for Ralph to verify with profiling before editing.

- `runEditorTransaction(...)` in
  `packages/slate/src/core/public-state.ts` builds transaction
  root indexes for every root at transaction start.
- The same transaction snapshot keeps cloned root state for rollback even when
  the operation is a path-stable text insert.
- Publish builds change metadata through `buildSnapshotChange(...)` or
  `getOperationDirtiness(...)` for every committed transaction.
- `buildSnapshotChange(...)` still uses JSON string comparison for marks and
  selection.
- `getSelectionImpactRuntimeIds(...)` can return broad `null` for wide
  selections and has a documented full-index scan for expanded non-broad
  selections.
- `apply(...)` has a non-transaction text fast path, but benchmark text writes
  use `editor.update((tx) => tx.text.insert(...))`, so the fast path may not
  cover the primary v2 API.
- `Editor.replace(...)` is near legacy, which suggests the full snapshot replace
  API is not the current bottleneck.

## Issue Accounting

| Issue | Current claim | This plan |
| --- | --- | --- |
| `#6038` repeated tree updates need batch-aware apply engine | `Improves` | Preserve. This lane may strengthen the proof if it adds accepted threshold rows, but do not promote to `Fixes` from planning. |
| `#2051` leaf rerender breadth | `Improves` / guardrail | Preserve as React/runtime guardrail. Core dirty metadata must not widen React subscribers. |
| `#5945` large plaintext paste | `Improves` | Preserve. This lane must not regress one-logical-operation paste. |
| `#4056` large copy/paste | `Improves` | Preserve. This lane may help core commit overhead, but exact browser repro closure stays out of scope. |
| `#5992` huge cut cost | `Improves` | Preserve. 50,000-block red threshold remains its own follow-up unless core dirtiness is proven to be the owner. |

No new fixed issue claims. No claim text change in PR references from this
planning pass.

## Architecture Target

The best target is a measured core operation fast lane, not a second editor
engine.

### Operation Families

Split the commit path by operation family:

- `selection`: selection-only updates should be O(selection path depth).
- `text`: insert/remove text should be O(changed text length + path depth).
- `path-stable batch`: text plus selection over one root should reuse the
  existing runtime index.
- `structural narrow`: set/split/merge/move/insert/remove node should update
  only the affected path window when possible.
- `replace`: full-document replacement is allowed to be O(document).
- `unknown mixed`: fall back to current broad dirtiness when the batch cannot be
  proven narrow.

### Transaction Snapshot Policy

Ralph should aim for this shape:

- Build root indexes lazily, only for the root and operation family that needs
  them.
- Avoid cloning all roots at transaction start for text and selection
  transactions; keep immutable rollback sources and clone only on rollback.
- Preserve earlier snapshots exactly. Do not make listeners observe mutable
  live children.
- Keep multi-root selection/root semantics from the root-location cleanup.
- Preserve `editor.update` as the public write boundary.

### Dirtiness Policy

The commit should carry enough data for React and history without overpaying:

- touched root
- operation family
- exact text path or structural path window
- affected text runtime ids
- affected element runtime ids
- top-level range only when needed
- `null` only for genuinely unknown or whole-document dirtiness

Do not replace precise dirtiness with "all" to win local correctness. That
would just move the latency back to React.

### History And Collab Policy

Operations remain the durable collaboration/history record.

The optimization may change how the current process builds snapshots and dirty
metadata. It must not change:

- serialized operation order
- operation inverse behavior
- history merge/skipping metadata
- `applyOperations(...)` replay behavior
- commit subscriber order
- root-aware selection identity

## Performance Lens

### Cohorts

| Cohort | Blocks | Target |
| --- | ---: | --- |
| normal | `0-500` | Keep behavior unchanged; no extra complexity visible to users. |
| large | `1000-10000` | Text insert and selection set should scale by edited path, not block count. |
| stress | `50000` | Only structural and huge-cut rows may remain expensive; simple text should not grow linearly. |

### Repeated Unit

Repeated unit: top-level block plus its text leaf.

Target budget:

- no all-root index build for a text insert;
- no full root clone for a text insert unless rollback happens;
- no full snapshot read unless a listener actually needs a snapshot;
- no JSON stringify comparison on hot selection-only or text-only commits;
- no React subscriber widening from the narrowed commit metadata.

### Required Measurements

Baseline and closeout:

```bash
cd Plate repo root
CORE_HUGE_BENCH_LEGACY_REPO=/Users/zbeyens/git/slate CORE_HUGE_BENCH_BLOCKS=1000 CORE_HUGE_BENCH_TYPE_OPS=20 bun run bench:core:huge-document:compare:local
CORE_HUGE_BENCH_LEGACY_REPO=/Users/zbeyens/git/slate CORE_HUGE_BENCH_BLOCKS=5000 CORE_HUGE_BENCH_TYPE_OPS=10 bun run bench:core:huge-document:compare:local
bun run bench:core:transaction:local
bun run bench:slate:6038:local
bun run bench:core:normalization:compare:local
bun run bench:core:observation:compare:local
```

Ralph should add or enable one core profiling row that reports time buckets for:

- transaction snapshot setup;
- root index build;
- rollback source setup;
- operation transform;
- dirty-path update;
- normalization;
- change metadata build;
- listener snapshot materialization;
- listener notification.

Without those buckets, this lane can easily "fix" the wrong thing.

### Threshold Direction

Do not invent a hard release threshold in the first edit. Use this sequence:

1. capture baseline at `1000` and `5000` blocks;
2. profile buckets;
3. land one owner fix;
4. rerun the same artifact;
5. only then set an enforceable threshold in the benchmark when the number is
   stable across repeated runs.

## Execution Plan

### Phase 1 - Baseline And Profile

Owner: `packages/slate`.

- Run the baseline commands above.
- Add focused profiling to the core benchmark if current browser-only
  `core-time:*` profiling is not available in the Node benchmark.
- Identify whether the biggest text-insert cost is transaction setup,
  snapshot/index work, dirty metadata, normalization, or listener publication.

### Phase 2 - Transaction Fast Lane

Owner: `packages/slate/src/core/public-state.ts` and
`packages/slate/src/core/apply.ts`.

- Make `editor.update((tx) => tx.text.insert(...))` eligible for the same
  narrow behavior as the direct non-transaction text fast path.
- Avoid eager all-root index builds for path-stable text/selection
  transactions.
- Keep rollback and snapshot immutability tests first-class.

### Phase 3 - Dirtiness And Selection Cost

Owner: commit metadata.

- Replace JSON stringify checks in hot change construction with cheaper
  identity/path-aware checks where valid.
- Keep collapsed selection impact path-only.
- Treat wide expanded selections as explicit broad dirtiness, not silent all-doc
  scans in normal typing.
- Preserve exact dirty runtime ids for text edits.

### Phase 4 - Batch And History Proof

Owner: `#6038`, `slate-history`, collab contracts.

- Strengthen `bench:slate:6038:local` around repeated exact-path updates and
  mixed batches.
- Add targeted tests for batch replay, history undo/redo, operation inverse,
  root-aware selection restore, and commit subscriber order.
- Preserve current public DX: use `editor.update`, `tx.operations.replay`, and
  `editor.applyOperations(...)`, not legacy `editor.apply` monkeypatching.

### Phase 5 - Closeout

Required before marking the lane done:

```bash
cd Plate repo root
bun test ./packages/slate/test
bun test ./packages/slate-history/test
bun run bench:core:transaction:local
bun run bench:slate:6038:local
CORE_HUGE_BENCH_LEGACY_REPO=/Users/zbeyens/git/slate CORE_HUGE_BENCH_BLOCKS=1000 CORE_HUGE_BENCH_TYPE_OPS=20 bun run bench:core:huge-document:compare:local
CORE_HUGE_BENCH_LEGACY_REPO=/Users/zbeyens/git/slate CORE_HUGE_BENCH_BLOCKS=5000 CORE_HUGE_BENCH_TYPE_OPS=10 bun run bench:core:huge-document:compare:local
bun lint:fix
bun typecheck:root
bun check
```

Run browser proof only if the implementation changes React dirtiness,
selection bridging, DOM materialization, or benchmark issue claims.

## Plan Review Matrix

| Lens | Status | Notes |
| --- | --- | --- |
| slate-ralplan | applied | Planning-only; implementation routed to Ralph. |
| major-task | applied | This is architecture and benchmark work, not a local patch. |
| performance | applied | Cohorts, repeated-unit budget, interaction rows, memory/dirty metadata, and threshold policy are explicit. |
| learnings-researcher | applied | Existing core snapshot, React fanout, and operation API learnings were checked before writing. |
| goal workflow | applied | This file is the durable plan artifact. |
| tdd | deferred to Ralph | Execution must add tests before changing the core fast path. |
| clawsweeper | skipped | No issue claim or PR narrative changes in this planning pass; current ledgers were read and preserved. |
| browser proof | deferred | Only required if Ralph changes browser-visible dirtiness, selection, or DOM behavior. |

## Score

Overall score: `0.87`.

| Criterion | Score | Reason |
| --- | ---: | --- |
| Architecture clarity | 0.90 | Owner is narrowed to core transaction/write/publish path. |
| DX | 0.88 | Keeps `editor.update` / transaction DX, avoids reviving legacy `apply` wrapping. |
| Performance strategy | 0.90 | Fresh benchmark evidence and profiling buckets are explicit. |
| Regression safety | 0.84 | Good coverage plan, but the exact hot bucket still needs profiling before edits. |
| Issue accounting | 0.88 | Preserves current `Improves` claims and avoids overclaiming `#6038`. |
| Execution readiness | 0.85 | Commands and phases are concrete; implementation details still need Ralph profiling. |

## Completion State

Current pass: `slate-ralplan-core-operation-performance`.

Current pass status: complete.

Lane status: pending.

Next pass: `ralph-core-operation-performance-execution`.

Next action: run Ralph execution against this plan in `Plate repo root`; start
with baseline/profiling, then fix the measured core owner.

## Ralph Execution Closeout - 2026-05-23

Status: complete.

Implementation owner: `packages/slate/src/core/public-state.ts`
plus benchmark scripts.

What landed:

- Transaction snapshots no longer eagerly build all-root runtime indexes for
  path-stable text and selection transactions.
- Transaction root children use shallow root snapshots and reuse previous
  snapshots where listeners need immutable state.
- Runtime index invalidation moved to structural/replace owners instead of
  every `setChildren` call.
- No-listener text/selection transactions use path-stable indexes instead of
  forcing full snapshot/index materialization.
- Core compare benchmark helpers prefer live `Editor.getChildren` /
  `Editor.getSelection` before `Editor.getSnapshot` unless the row is actually
  measuring snapshots.
- Observation compare supports both legacy `Node` and v2 `NodeApi`.
- The `#6038` mixed batch fixture path was corrected after its own move/split
  operations shifted the target node.

Fresh benchmark evidence:

| Command | Result |
| --- | --- |
| `CORE_HUGE_BENCH_LEGACY_REPO=/Users/zbeyens/git/slate CORE_HUGE_BENCH_BLOCKS=1000 CORE_HUGE_BENCH_TYPE_OPS=20 bun run bench:core:huge-document:compare:local` | v2 start `2.36ms`, middle `1.67ms`, replace `1.93ms`, fragment `1.18ms`, select-all `0.62ms` |
| `CORE_HUGE_BENCH_LEGACY_REPO=/Users/zbeyens/git/slate CORE_HUGE_BENCH_BLOCKS=5000 CORE_HUGE_BENCH_TYPE_OPS=10 bun run bench:core:huge-document:compare:local` | v2 start `5.71ms`, middle `4.10ms`, replace `5.58ms`, fragment `8.48ms`, select-all `3.02ms` |
| `bun run bench:core:transaction:local` | passed; mixed batch separate update `0.25ms`, replay `0.10ms` |
| `bun run bench:slate:6038:local` | passed; mixed batch separate update `0.24ms`, replay `0.10ms` |
| `NORMALIZATION_BENCH_LEGACY_REPO=/Users/zbeyens/git/slate bun run bench:core:normalization:compare:local` | passed; read-after-each dropped to `3.59ms`; explicit normalize rows beat legacy |
| `CORE_OBSERVATION_BENCH_LEGACY_REPO=/Users/zbeyens/git/slate bun run bench:core:observation:compare:local` | passed; children read `2.82ms`; root nodes `6.91ms` vs legacy `7.03ms` |

Fresh verification:

```bash
cd Plate repo root
bun test ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/core-benchmark-scripts-contract.ts
bun test ./packages/slate/test/snapshot-contract.ts -t "path-stable"
bun test ./packages/slate/test
bun test ./packages/slate-history/test
bun --filter slate typecheck
bun typecheck:root
bun lint:fix
bun check
```

All commands passed. Browser proof was not required because this slice changed
core transaction/public-state behavior and Node benchmark helpers, not React
DOM materialization or browser selection bridging.

Issue accounting remains unchanged:

- `#6038`: still `Improves`, with stronger local replay evidence.
- `#2051`, `#5945`, `#4056`, `#5992`: existing performance guardrail /
  `Improves` claims preserved; no new `Fixes` claim.

Compounded learning:

- [Slate v2 core operation benchmarks must not hide snapshot costs](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-05-23-slate-v2-core-operation-benchmarks-must-not-hide-snapshot-costs.md)
