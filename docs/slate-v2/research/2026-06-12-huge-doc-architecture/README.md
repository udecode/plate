# Slate v2 Huge-Document Architecture Research

Date: 2026-06-12

## Question

After fixing the repeated Shift+ArrowDown hot path, what should Slate v2 steal
from mature huge-document editors before doing more staged/virtualized runtime
work?

## Scope

- Inspect source-level viewport and selection architecture.
- Compare Slate v2's current hybrid DOM strategy with CodeMirror and the
  ProseMirror/Lexical baselines already used by benchmarks.
- Promote only Slate-native proof or contract rows.
- Do not patch runtime from snippets.
- Do not make raw mobile claims.

## Verdict

Do not rearchitect huge-document editing yet. Slate v2 already has the right
high-level shape for rich text: hybrid DOM ownership, explicit missing-range
boundaries, model-owned selection when DOM is absent, and materialization before
editing.

The useful CodeMirror lesson is contract shape, not copyable code:

- keep viewport and visible ranges explicit;
- retain the selection endpoints even when outside the main viewport;
- maintain a measured height map and scroll anchor;
- expose coordinate APIs as precise only when DOM exists and estimated when it
  does not;
- prove scroll stability as its own first-class lane.

Slate v2 had route-local virtualized scroll tests but no named first-party
operation family. This packet promotes that contract as
`huge-document-virtualized-scroll-stability`.

## Promoted Packets

### Contract Packet: virtualized scroll stability

Lead: `huge-doc-architecture:virtualized-scroll-stability-contract`

Owner: `slate-browser`

Patch:

- `.tmp/slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts`
- `.tmp/slate-v2/packages/slate-browser/test/core/scenario.test.ts`

Proof:

```bash
cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts
cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized backward scroll stable|virtualized rows visually coherent|virtualized rows buffered"
cd .tmp/slate-v2 && bun --filter slate-browser typecheck
```

Result:

- `scenario.test.ts`: 21 passed.
- focused huge-document Chromium scroll proof: 3 passed.
- `slate-browser` typecheck passed.

### Metric Packet: scroll anchor materialization metrics

Lead: `huge-doc-architecture:scroll-anchor-metric-honesty`

Owner: `slate-ar-perf`

Patch:

- `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
- `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-full.mjs`
- `.tmp/slate-v2/packages/slate/test/core-benchmark-scripts-contract.ts`

Proof:

```bash
cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts
cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=2 SLATE_BROWSER_TRACE_SKIP_BUILD=1 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs
cd .tmp/slate-v2 && HUGE_DOC_FULL_SMOKE=1 HUGE_DOC_FULL_SKIP_BROWSER_BUILD=1 bun ./scripts/benchmarks/browser/react/huge-document-full.mjs
```

Result:

- Benchmark script contract test: 14 passed.
- Focused virtualized browser-trace smoke passed and emitted
  `react_huge_doc_virtualized_select_materialization_frames_p95=0` and
  `react_huge_doc_virtualized_select_materialization_scroll_delta_p95_px=0`.
- Full-wrapper smoke passed and emitted aggregate plus virtualized
  `react_huge_doc_full_*materialization*` metrics. Smoke latest:
  virtualized type-to-paint p95 `27.9ms`, virtualized select-to-paint p95
  `47.8ms`, virtualized materialization frames p95 `0`, and virtualized
  materialization scroll delta p95 `0px`.

### Contract Packet: exact DOM coordinates vs virtualized boundaries

Lead: `huge-doc-architecture:estimated-coordinate-contract`

Owner: `slate-dom`

Patch:

- `.tmp/slate-v2/packages/slate-dom/test/dom-coverage.ts`

Proof:

```bash
cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/dom-coverage.ts
cd .tmp/slate-v2 && bun --filter ./packages/slate-dom typecheck
```

Result:

- `dom-coverage.ts`: 18 passed.
- `slate-dom` typecheck passed.

Decision:

- Do not add a public estimated-coordinate API in this packet.
- Keep exact DOM APIs exact: `resolveDOMPoint`, `resolveDOMRange`, and
  `resolveRangeRect` return `null` for virtualized unmounted points/ranges.
- Use `DOMCoverage.resolveDOMPointOrBoundary` and
  `DOMCoverage.resolveDOMRangeOrBoundary` for boundary-aware virtualized
  ownership.

### Contract Packet: selected endpoint retention

Lead: `huge-doc-architecture:selection-endpoint-retention`

Owner: `slate-react`

Patch:

- `.tmp/slate-v2/packages/slate-react/test/dom-strategy-page-virtualization.test.tsx`

Proof:

```bash
cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/dom-strategy-page-virtualization.test.tsx
cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck
```

Result:

- `dom-strategy-page-virtualization.test.tsx`: 7 passed.
- `slate-react` typecheck passed.

Decision:

- Retain selected endpoint top-level rows outside the visible virtualized page
  window.
- Do not retain whole endpoint page units unless a later bug proves that
  broader DOM cost is required.
- Keep unrelated off-window siblings unmounted so the endpoint contract does
  not erode the DOM budget.

### Stress Packet: 100k/200k virtualized height scaling

Lead: `huge-doc-architecture:big-document-height-scaling`

Owner: `slate-ar-perf`

Patch:

- `.tmp/slate-v2/site/examples/ts/huge-document.tsx`

Proof:

```bash
cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=100000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=20000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=20000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs
cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs
cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs
```

Result:

- 100k baseline smoke passed: DOM nodes p95 `316`, materialization frames p95
  `0`, scroll delta p95 `0px`, type-to-paint p95 `31.5ms`, click-to-paint p95
  `106.6ms`, heap `179.29MB`, long task max p95 `172ms`.
- 200k cached baseline smoke passed: DOM nodes p95 `316`, materialization
  frames p95 `0`, scroll delta p95 `0px`, type-to-paint p95 `31.9ms`,
  click-to-paint p95 `189.8ms` on the first warm run and `281.6ms` after a
  fresh rebuild, heap `391.01MB`, long task max p95 up to `392ms`.
- Current 200k no-large-cache smoke passed after a fresh rebuild: DOM nodes p95
  `316`, materialization frames p95 `0`, scroll delta p95 `0px`, type-to-paint
  p95 `31.2ms`, click-to-paint p95 `315.1ms`, heap `326.16MB`, long task max
  p95 `354ms`.

Decision:

- Keep the example cache cap for large generated documents: it cuts the 200k
  route heap by about `65MB` without changing DOM/materialization/type metrics.
- Do not claim 200k click latency solved. Route the residual to a follow-up
  click/selection attribution packet.
- Do not rearchitect runtime from this packet. The clear gap is model/value and
  click-selection work at extreme document sizes, not DOM virtualization.

### Perf Packet: 200k click selection attribution

Lead: `huge-doc:200k-click-selection-attribution`

Owner: `slate-react` / `slate-ar-perf`

Patch:

- `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
- `.tmp/slate-v2/packages/slate/test/core-benchmark-scripts-contract.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/root-interaction-controller.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/content-root-navigation.ts`
- `.tmp/slate-v2/packages/slate-react/test/content-root-navigation-contract.test.ts`

Proof:

```bash
cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts
cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/content-root-navigation-contract.test.ts
cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck
cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs
```

Result:

- Before attribution, 200k virtualized click-to-paint p95 was `306.5ms`, with
  `clickMouseDownMs` p95 `277.8ms`, `clickMouseDownEventMs` p95 `276.6ms`,
  `clickSelectionWaitMs` p95 `0.9ms`, and `clickPaintWaitMs` p95 `15.3ms`.
- Root mousedown profiler attribution showed `root-mousedown.capture` p95
  `271ms`; the hot subphase was
  `root-mousedown.resolve-projected-drag-endpoint` p95 `270ms`.
- After the fix, 200k virtualized click-to-paint p95 is `39.8ms`,
  click-to-selection-ready p95 `28ms`, `clickMouseDownMs` p95 `14.2ms`,
  `clickMouseDownEventMs` p95 `13.1ms`, and
  `root-mousedown.resolve-projected-drag-endpoint` p95 `0ms`.
- DOM/materialization/type metrics stayed stable: DOM nodes p95 `316`,
  selection materialization frames p95 `0`, scroll delta p95 `0px`, and
  type-to-paint p95 `31.6ms`.

Decision:

- Keep the benchmark attribution metrics. They separate Playwright dispatch,
  browser event propagation, Slate root mousedown phases, selection wait, and
  paint wait.
- Keep the runtime shortcut: when the schema has no content-root specs,
  `findContentRootOwners` returns `[]` without scanning the document.
- Keep the start-range reuse in root projected-drag endpoint resolution. Normal
  clicks should not pay repeated event-range work before any drag movement.
- Continue with select-all/delete attribution and huge-doc behavior smoke; this
  packet fixes plain-document click latency but does not prove every editing
  gesture at 200k.

### Correctness Packet: 200k select-all/delete undo restore

Lead: `huge-doc:200k-select-all-delete-attribution`

Owner: `slate` / `slate-react` / `slate-ar-perf`

Patch:

- `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
- `.tmp/slate-v2/packages/slate/test/core-benchmark-scripts-contract.ts`
- `.tmp/slate-v2/packages/slate/src/utils/modify.ts`
- `.tmp/slate-v2/packages/slate/src/interfaces/transforms/general.ts`
- `.tmp/slate-v2/packages/slate/test/operations-contract.ts`

Proof:

```bash
cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts
cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts
cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck
cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck
cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs
```

Result:

- Before the fix, 100k virtualized select-all/delete restored after
  undo-delete in `833.1ms`, but 200k virtualized timed out after about `45s`
  and `undoDeleteRestored=0`.
- Phase diagnostics proved the delete history batch still existed after undoing
  the typed text, so this was not lost history.
- A direct `__slateBrowserHandle.undo()` retry exposed the actual root cause:
  `RangeError: Maximum call stack size exceeded` while replaying the huge
  `replace_children` inverse.
- Core `replace_children` replay now uses array-based child-range replacement
  instead of spreading `op.newChildren` as function arguments.
- After the fix, strict fresh-build 200k virtualized select-all/delete passed:
  select-all-to-paint `220.2ms`, delete-to-paint `655.7ms`,
  type-after-delete-to-paint `2343.9ms`, undo-type-to-paint `138.9ms`,
  undo-delete-to-paint `2339.9ms`, `undoDeleteRestored=1`, DOM p95 `316`, and
  click-to-paint p95 `39.9ms`.

Decision:

- Keep the core stack-safety fix. It is not huge-doc route glue; any
  `replace_children` batch can legally carry a large child range.
- Keep compact select-all/delete phase diagnostics in the browser trace. They
  caught the difference between lost history, keyboard routing failure, and
  operation replay stack overflow without serializing full document payloads.
- Continue with cross-strategy huge-document command smoke before claiming the
  whole huge-doc behavior lane is closed.

### Measurement Packet: 200k select-all/delete latency attribution

Lead: `huge-doc:200k-delete-history-latency-attribution`

Owner: `slate` / `slate-react` / `slate-ar-perf`

Patch:

- `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`

Proof:

```bash
cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts
cd .tmp/slate-v2 && bun --filter slate-react test:vitest -- runtime-before-input-events-contract.test.ts input-router-contract.test.tsx dom-repair-policy-contract.test.ts selection-reconciler-contract.test.tsx selection-runtime-contract.test.ts
cd .tmp/slate-v2 && bun --filter slate-react typecheck
cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs
```

Result:

- The benchmark now records phase event timing, profiler duration totals,
  long-task totals, and type dispatch/model-wait split for the opt-in
  select-all/delete flow.
- Latest fresh-build 200k virtualized proof after reverting the failed runtime
  shortcut: select-all-to-paint `251.7ms`, delete-to-paint `662.5ms`,
  type-after-delete-to-paint `2358.9ms`, undo-type-to-paint `145.3ms`,
  undo-delete-to-paint `2168.1ms`, `undoDeleteRestored=1`, and DOM after
  undo-delete `311`.
- Type-after-delete is mostly native keyboard dispatch and deferred repair
  cadence: keyboard dispatch `2075.4ms`, model wait `267.3ms`, `17`
  `beforeinput` events, beforeinput span `2073.4ms`, max event gap `386.5ms`,
  and only `121.2ms` of recorded profiler time.
- Undo-delete is dominated by full publish work after restoring the huge child
  range: `next-snapshot` `869.1ms`, `notify-listeners` `781.1ms`, and
  `dom-path-sync` `374.1ms`.

Decision:

- Keep the benchmark attribution. It prevents the latency lane from mistaking
  native/event cadence for core insert-text cost.
- Quarantine the same-burst `insertText` no-flush shortcut. It corrupted the
  post-delete text to `after 20 dlteeek0`; behavior lost, so the runtime/test
  edit was reverted.
- Continue with source-level publish-cost research before any runtime
  optimization. The next safe owner is snapshot/listener/projection/DOM path
  sync, not native text repair flush removal.

## Runtime Packet: Scoped View-Selection Projection

Decision: keep.

What changed:

- `slate-view-selection` decorations now live in `EditableTextBlocks`, where
  mounted top-level runtime scope is known, instead of in the root `Slate`
  provider with no scope.
- Scoped view-selection decorations are clipped to mounted top-level runtime ids
  plus the selection endpoint top-level ids. Endpoint inclusion is required:
  the first browser proof caught staged ShiftDown losing the off-window focus
  marker when the source used only the mounted window.
- The focused contract now proves scoped view-selection output excludes
  unrelated off-window buckets while retaining anchor/focus endpoint buckets.

Proof:

- `cd .tmp/slate-v2 && bun --filter slate-react test:vitest -- view-selection-contract.test.ts`
  passed 11 tests.
- `cd .tmp/slate-v2 && bun --filter slate-react typecheck` passed.
- Focused Chromium Playwright passed 7 rows covering virtualized select-all
  delete, staged/virtualized repeated ShiftDown/ShiftUp visual selection,
  virtualized drag/blank-gap selection, multi-root blank header drag, and synced
  projected selection/native-highlight clearing.
- Final fresh-build 200k virtualized select-all/delete trace passed with
  select-all-to-paint `31.4ms` versus prior `251.7ms`; source-listener p95
  `0ms`; view-selection projection during undo-delete `0.1ms`;
  undo-delete-to-paint `1825.6ms`; restored `1`.

Remaining owner:

- 200k undo-delete is no longer blocked on view-selection projection. Remaining
  cost is core snapshot/delta publish and DOM path sync: `next-snapshot`
  `854.0ms`, `apply-replace_children` `380.6ms`, and `dom-path-sync`
  `372.1ms` in the final trace.

## Runtime Packet: Reuse Snapshot Runtime Index For DOM Path Sync

Decision: keep.

What changed:

- Snapshot construction now exposes profiler buckets for
  `snapshot-build-index` and `snapshot-clone-children`.
- Main-root snapshot construction builds the snapshot index and live runtime
  index in one traversal, then seeds the live runtime-index cache. This removes
  the duplicate index build that `syncSlateNodePathBindingsToDOM` paid after a
  huge structural commit.
- A separate experiment skipped DOM path sync for `replace_children`; it was
  reverted because selector dispatch rose to `448.6ms` and wall time did not
  improve.

Proof:

- `cd .tmp/slate-v2 && bun --filter slate typecheck` passed.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests. Keep this as a split command; combining it with other Bun
  tests hit the default 5s timeout.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 14 tests.
- `cd .tmp/slate-v2 && bun --filter slate-react typecheck` passed.
- Focused Chromium Playwright passed the 7-row visual-selection/browser set.
- Final fresh-build 200k virtualized trace passed with undo-delete-to-paint
  `1524.4ms` versus prior kept `1825.6ms`, restored `1`, and source-listener
  p95 `0ms`.

Remaining owner:

- `snapshot-build-index` is still `754.5ms`, `snapshot-clone-children` is
  `181.5ms`, and `apply-replace_children` is `372.6ms`. The next packet needs a
  persistent/delta snapshot index or replace-children replay design; another
  DOM-path tweak is the wrong target.

## Runtime Packet: Snapshot Path-Key Fast Path

Decision: keep.

What changed:

- Snapshot index construction now special-cases zero-, one-, and two-segment
  paths before falling back to `path.join('.')`.
- This preserves the public key format while avoiding `Array.join` in the
  hottest huge flat-document path.

Proof:

- `cd .tmp/slate-v2 && bun --filter slate typecheck` passed.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts`
  passed 220 tests.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 14 tests.
- Strict fresh-build 200k virtualized select-all/delete trace passed with
  select-all-to-paint `31.2ms`, delete-to-paint `613.2ms`,
  type-after-delete-to-paint `2196.5ms`, undo-type-to-paint `138.5ms`,
  undo-delete-to-paint `1478.1ms`, and `undoDeleteRestored=1`.

Remaining owner:

- This is only a hot-loop cleanup. The real architecture owner remains a
  persistent or delta snapshot index, or a `replace_children` replay design
  that avoids rebuilding a full 200k-path index after a history restore.

## Quarantined Packet: Traversal / Path-Append Fast Path

Decision: revert.

What was tried:

- Replaced `forEach` traversal and path spread in the snapshot/live index
  builders with explicit loops and an append-path fast path while preserving
  frozen `Path` arrays.

Proof:

- `cd .tmp/slate-v2 && bun --filter slate typecheck` passed.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts`
  passed 220 tests.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests before and after revert.
- Strict 200k browser trace regressed undo-delete-to-paint from `1478.1ms` to
  `1507.7ms`. `snapshot-build-index` only improved from `727.3ms` to
  `721.5ms`, which is not enough to justify the churn.

Result:

- Reverted. Do not retry shallow traversal cleanup without a dedicated
  microbenchmark that proves the hot bucket, not just the code shape.

## Runtime Packet: Full-Document Fragment Delete API Parity

Decision: keep.

What changed:

- The core huge-document benchmark now has a subscribed
  `selectAllDeleteTypeUndoMs` history lane and a `CORE_HUGE_BENCH_CURRENT_ONLY`
  mode for quick current-side attribution.
- Full-document `tx.fragment.delete({ direction: 'backward' })` now follows
  the same structural path as selected text replacement and browser delete: one
  root `replace_children` that leaves one empty start block and a collapsed
  `[0,0]` selection.
- Slate and slate-history now have focused contracts proving the operation
  stream and undo batch stay structural for full-document fragment deletion.

Proof:

- `cd .tmp/slate-v2 && bun test ./packages/slate/test/delete-contract.ts`
  passed 30 tests.
- `cd .tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts`
  passed 48 tests.
- `cd .tmp/slate-v2 && bun --filter slate typecheck` passed.
- `cd .tmp/slate-v2 && bun --filter slate-history typecheck` passed.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- Current-only 5k core subscribed history lane improved from
  `6197.01ms` to `28.11ms`.
- Current-only 20k core subscribed history lane completed at `105.02ms`; before
  the patch, both full compare and current-only 20k runs were interrupted after
  the useful attribution window.
- Fresh-build 200k staged and virtualized browser trace still restores after
  select-all/delete/type/undo. Both lanes record delete history as one
  `replace_children`; staged undo-delete is `1802.8ms`, virtualized undo-delete
  is `1501.9ms`.

Remaining owner:

- Browser undo-delete still pays the full 200k restore/publish cost. The next
  architecture owner is persistent/delta snapshot indexing or a replay design
  that can restore huge child ranges without rebuilding every public index on
  every undo.

## Quarantined Packet: Cached Snapshot Index Reuse

Decision: revert.

What was tried:

- Cached the previous full-root `replace_children` snapshot index by the
  operation child-array identity.
- On history undo, if the restored live children matched the operation
  `newChildren` array, the next snapshot reused that cached index instead of
  rebuilding `snapshot-build-index`.
- Added a focused history contract during the experiment to prove the cached
  branch under snapshot subscribers.

Proof:

- Focused slate-history, slate snapshot, slate operations, slate typecheck, and
  slate-history typecheck passed during the experiment.
- 200k virtualized browser trace removed the `snapshot-build-index` bucket, but
  undo-delete regressed to `1769.4ms`; repeat was `1750.2ms`.
- Cost moved into `apply-replace_children` around `722ms` and DOM path sync
  around `648ms`.
- Post-revert fresh 200k virtualized trace returned to `1524.9ms` with
  `undoDeleteRestored=1`.

Result:

- Reverted. Do not retry operation-child-array identity cache as the next
  persistent index story. The next owner is direct `replace_children` apply
  cost, DOM path sync mechanics, or a deliberate public snapshot-index design.

## Quarantined Packet: Full-Range Child Copy Fast Path

Decision: revert.

What was tried:

- Changed `replaceChildRange` to use `newValues.slice()` when replacing the
  entire child array, preserving operation-payload isolation while avoiding the
  generic `slice(0).concat(newValues, slice(end))` path.

Proof:

- Focused operations, snapshot, and slate typecheck gates passed.
- 200k virtualized traces were noise: undo-delete `1493.2ms`, then `1525.2ms`.
  `apply-replace_children` stayed around `371ms`.
- Post-revert focused gates passed; one operations run hit the known 5s edge
  and passed immediately on rerun.

Result:

- Reverted. Generic array-copy cleanup is not a strong enough owner for the
  remaining huge-doc undo cost.

## Runtime Packet: Full-Root Replace Snapshot And Live Index Reuse

Decision: keep.

What changed:

- Full-root `replace_children` snapshot-index reuse is now strict: one
  full-root `replace_children` content operation plus optional `set_selection`.
- The cache is populated only after a valid snapshot change exists, mapping the
  operation's old/new child arrays to the corresponding before/after
  `SnapshotIndex`.
- The cached restore path now seeds both the reused snapshot index and the
  main-root live runtime-index cache. That fixes the earlier reverted version
  where removing `snapshot-build-index` only moved cost into DOM path sync.

Proof:

- `cd .tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts`
  passed 48 tests.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts`
  passed 220 tests.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck` passed.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate-history typecheck`
  passed.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- Fresh-build 200k virtualized select-all/delete trace passed with
  undo-delete `1425.3ms`, restored `1`, and no `snapshot-build-index` or
  `dom-path-sync` bucket in undo-delete.
- Second 200k virtualized trace passed with undo-delete `1411.0ms`.
- 200k staged+virtualized cross-strategy trace passed with staged undo-delete
  `1602.5ms`, virtualized undo-delete `1401.5ms`, and `undoDeleteRestored=1`
  on both lanes.

## Runtime Packet: Full-Root Replace Live Index Preservation

Decision: keep.

What changed:

- Transaction snapshots now remember the live runtime index that was already
  built for the previous main-root snapshot.
- Full-root replace cache entries store live runtime indexes beside snapshot
  indexes, guarded by the same operation child-array identity and live-child
  boundary checks.
- Restoring a cached full-root replace no longer converts the snapshot index
  back into maps. The runtime cache receives the preserved live index directly.

Proof:

- `cd .tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts`
  passed 48 tests.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts`
  passed 220 tests.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck` passed.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate-history typecheck`
  passed.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- Fresh-build 200k virtualized select-all/delete trace passed with
  undo-delete `736.3ms`, restored `1`, and no
  `snapshot-reuse-live-runtime-index` bucket.
- 200k staged+virtualized cross-strategy trace passed with staged undo-delete
  `931.8ms`, virtualized undo-delete `748.4ms`, and `undoDeleteRestored=1`
  on both lanes.

## Runtime Packet: Cached Full-Root Restore Dirty-Path Fast Path

Decision: keep.

What changed:

- Core apply now emits replace-children subphase profiler buckets for path
  refs, point refs, range refs, bookmarks, implicit target, dirty paths,
  transform, and append.
- The profiler showed `apply-replace_children` was almost entirely dirty-path
  expansion on cached full-root history restore, not child-array replacement.
- Cached full-root restore operations dirty only the root path when their
  `newChildren` array is already present in the full-root replace snapshot
  cache. Arbitrary `replace_children` operations still use precise descendant
  dirty paths.

Proof:

- `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck` passed.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests after one known 5s timeout-edge rerun.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts`
  passed 220 tests.
- `cd .tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts`
  passed 48 tests.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate-history typecheck`
  passed.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- Fresh-build 200k virtualized select-all/delete trace passed with
  undo-delete `442.3ms`, restored `1`, and `apply-replace_children` `0.1ms`.
- 200k staged+virtualized cross-strategy trace passed with staged undo-delete
  `633.6ms`, virtualized undo-delete `416.7ms`, and `undoDeleteRestored=1`
  on both lanes.

Remaining owner:

- The remaining 200k undo-delete cost is not snapshot-index construction, DOM
  path sync, snapshot-to-live-index conversion, or apply dirty-path expansion.
  The hot buckets are now child clone around `195ms`, keydown request repair
  around `122ms`, and notify/selector dispatch around `88ms`.
- Next work should inspect clone/repair/notify design or prove the plateau.

## Runtime Packet: Full-Root Replace Snapshot Children Cache

Decision: keep.

What changed:

- Full-root replace cache entries now store immutable
  `EditorSnapshot.children` for the before/after child arrays beside the
  existing snapshot-index and live-runtime-index caches.
- History restore no longer clones the cached 200k child array merely to
  reconstruct the immutable snapshot children.
- The guard remains narrow: one full-root `replace_children` content operation
  plus optional `set_selection`, populated only after a valid snapshot change.

Proof:

- `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck` passed.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts`
  passed 220 tests.
- `cd .tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts`
  passed 48 tests.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate-history typecheck`
  passed.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- Fresh-build 200k virtualized select-all/delete trace passed with
  undo-delete `268.9ms`, restored `1`, and no snapshot child clone bucket.
- 200k staged+virtualized cross-strategy trace passed with staged undo-delete
  `460.7ms`, virtualized undo-delete `254.7ms`, and `undoDeleteRestored=1`
  on both lanes.

Remaining owner:

- Core restore is no longer the main bottleneck. The next owner is
  keydown request repair, notify/selector dispatch, and post-delete typing
  cadence. The latest fresh virtualized profile showed request repair around
  `139.9ms`, notify/selector dispatch around `87ms`, and type-after-delete
  still around `2.1-2.3s`.

## Runtime Packet: Expanded View-Selection History Repair Skip

Decision: keep.

What changed:

- History restore of an expanded Slate view selection no longer asks DOM repair
  to repair a caret. Expanded projected selections are rendered by the
  view-selection projection, not a single native caret.
- The repair path still keeps `force-render` when history requires it, so
  collapsed caret history and render invalidation are not weakened.

Proof:

- `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/keyboard-input-strategy-contract.test.ts`
  passed 37 tests.
- `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/projected-command-contract.test.ts`
  passed 39 tests.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  passed.
- 200k staged+virtualized cross-strategy trace passed with staged undo-delete
  `460.1ms`, virtualized undo-delete `280.5ms`, and `undoDeleteRestored=1`
  on both lanes. Notify-listeners and selector-dispatch p95 were about
  `1.5ms` / `1.3ms`.
- 200k virtualized rerun passed with undo-delete `244ms`,
  `undoDeleteRestored=1`, notify-listeners p95 `1.5ms`, and
  selector-dispatch p95 `1.1ms`.

Remaining owner at this loop:

- The old post-delete burst metric cost `2.2-2.6s` at 200k and was dominated
  by beforeinput/input cadence plus browser long frames, not core insert work.
  Later packets split burst cadence from first-key latency and fixed first-key
  after delete.

## Metric Packet: Type-After-Delete Event Cadence Instrumentation

Decision: keep instrumentation; runtime gap still open.

What changed:

- The huge-document browser trace now records post-delete typing as its own
  phase with keyboard dispatch, model-wait, beforeinput/input count and gap
  summaries, long task/frame totals, profiler duration, event timelines,
  selection-source state, repair preference state, and configurable
  `SLATE_BROWSER_TRACE_AFTER_DELETE_TEXT`.
- The benchmark-script contract guards the new metric names and trace fields.

Proof:

- `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- 200k staged+virtualized trace restored both lanes. Staged type-after-delete
  was `2311.1ms` with wait-for-model `3.8ms`; virtualized type-after-delete
  was `2679.1ms` with wait-for-model `274ms`. Both lanes had 17
  beforeinput events and long-frame totals around the same scale as wall time.
- 200k virtualized rerun restored with type-after-delete `2290.2ms`,
  wait-for-model `298.3ms`, beforeinput span `1977.5ms`, max beforeinput gap
  `395.8ms`, and profiler duration only `105.9ms`.

Decision:

- Keep the instrumentation.
- Do not claim a perf fix from this packet.
- The remaining owner is deferred native text repair / browser event cadence,
  not core history restore, snapshot rebuild, view-selection projection, or
  notify/selector dispatch.

## Quarantine Packet: Repair-Induced Text Input Shortcuts

Decision: quarantine and reverted.

Experiments:

- Releasing virtualized repair-induced text insertion to DOM in
  `dom-repair-queue.ts`.
- Allowing `beforeinput` to import DOM selection after repair-induced text input
  in `editing-kernel.ts`.

Result:

- DOM release failed focused repair contracts and corrupted the 200k typed
  string.
- The beforeinput import variant passed focused contracts but produced only an
  outlier virtualized trace; staged+virtualized and virtualized reruns still
  showed wait-for-model around `274-298ms`.
- After revert, focused editing-kernel, keyboard strategy, input-router, DOM
  repair policy, and slate-react typecheck passed.

Rule:

- Do not relax selection authority for post-delete typing perf unless fresh
  staged+virtualized 200k proof shows native/model caret agreement and no text
  reordering.

## Metric Packet: Type-After-Delete Listener Attribution

Decision: keep instrumentation; source owner narrowed to benchmark claim width.

What changed:

- The browser trace now captures compact long-task and long-animation-frame
  attribution buckets.
- `runtime-before-input-events.ts` exposes profiler-only `beforeinput-total`
  and coarse beforeinput phase buckets.
- `input-router.ts` exposes profiler-only `dom-input-total`.

Proof:

- `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/runtime-before-input-events-contract.test.ts`
  passed 5 tests.
- `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/input-router-contract.test.tsx`
  passed 38 tests.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck` passed.
- Fresh 200k virtualized trace restored with type-after-delete `2471.1ms`;
  profiler duration now matched long-frame scale instead of underreporting it.
- 200k staged+virtualized trace restored both lanes. Staged type-after-delete
  was `2300.1ms`, with `dom-input-total` `2127.8ms`; virtualized
  type-after-delete was `2512.5ms`, with `beforeinput-total` `1876.8ms`.
  Core/model insert work stayed about `10-28ms`.

Decision:

- Keep the metric packet.
- Do not patch selection authority or deferred repair batching from this
  evidence alone.
- Next owner is benchmark-lane explanation before another runtime patch.

## Metric Packet: Type-After-Delete Input Mode Attribution

Decision: keep benchmark-honesty instrumentation; no runtime patch.

What changed:

- The browser trace now accepts
  `SLATE_BROWSER_TRACE_AFTER_DELETE_INPUT_MODE=type|insertText`.
- Run artifact paths include both input mode and the typed payload, so
  single-key, burst-key, and `insertText` control runs cannot overwrite each
  other.
- The benchmark-script contract guards the new mode and artifact-key fields.

Proof:

- `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- 200k staged+virtualized physical 17-key burst restored correctly but stayed
  slow: staged `2412.1ms`, virtualized `2695ms`.
- 200k staged+virtualized physical single-key `X` restored correctly and
  landed near the normal first-key class: staged `144.9ms`, virtualized
  `145.5ms`.
- 200k staged+virtualized 17-char `insertText` restored correctly and also
  landed near the single-key class: staged `144.9ms`, virtualized `145.9ms`.

Decision:

- Close type-after-delete as a runtime owner for now. The old default metric is
  a 17 physical-key burst cadence stress after full-document delete, not proof
  that first-key typing after delete is slow.
- Keep the burst lane as stress evidence, but do not optimize it by weakening
  native/model selection authority.
- At this loop, the remaining real editor gap became Delete latency: after
  select-all, Delete cost about `600-645ms` at 200k. Later replay/build-change
  packets fixed that path to about `20-29ms`.

## Metric Packet: Delete Fragment Fast-Path Attribution

Decision: keep measurement and partial runtime wins; split the remaining owner
to replay/build-change.

What changed:

- DOM repair and keydown trace payloads stay compact for huge document commands.
  They record operation counts and first/last operation metadata instead of
  serializing a 200k-child `replace_children` payload.
- Provider hooks now use `getOperationCount` instead of materializing
  `value.operations().length`.
- Delete attribution now names the actual browser path:
  `applyFullBlockDeleteFragment` in `slate-react`, not core
  `tx.fragment.delete`.
- `applyFullBlockDeleteFragment` has profiler buckets for top-level path
  routing, mark scanning, selected-child capture, and replay.
- Whole-document Delete checks the top-level full-selection path before the
  generic full-block path, avoiding 200k sibling path materialization.
- `getConsistentTextMarksInBlocks` returns early when the first non-empty text
  is unmarked, because both all-unmarked and mixed-mark selections produce no
  active marks after deleting the range.

Proof:

- `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/dom-repair-policy-contract.test.ts`
  passed 31 tests.
- `cd .tmp/slate-v2/packages/slate-react && bun test ./test/selection-side-effect-policy-contract.ts`
  passed 4 tests.
- `cd .tmp/slate-v2/packages/slate-react && bun test ./test/editing-kernel-contract.ts`
  passed 39 tests.
- `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/provider-hooks-contract.test.tsx`
  passed 37 tests.
- `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/projected-command-contract.test.ts`
  passed 41 tests after the invalid direct-transaction experiment was reverted.
- `cd .tmp/slate-v2 && bun test ./packages/slate/test/delete-contract.ts`
  passed 31 tests.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck` passed.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck` passed.

Metric result:

- Baseline before compact repair/key traces: Delete-to-paint was about
  staged `687.6ms`, virtualized `696.2ms`; repair and keydown trace recording
  could each cost about `195-220ms`.
- After compact repair/key traces: trace buckets fell to near-zero, but Delete
  still stayed around `620-647ms`, proving diagnostics were not the only owner.
- Direct delete-fragment attribution before the mark shortcut showed
  staged/virtualized Delete `628.6ms` / `620.2ms`, with
  `delete-fragment.consistent-marks` about `84ms`,
  `delete-fragment.full-block-paths` about `15ms`, and
  `delete-fragment.replay-replace` about `293-297ms`.
- After the first-unmarked mark shortcut, Delete moved to
  staged/virtualized `568.4ms` / `544.6ms`;
  `delete-fragment.consistent-marks` dropped to about `0.1ms`.
- After top-level-first routing, `delete-fragment.full-block-paths` disappeared.
  Latest valid staged/virtualized Delete is `557.5ms` / `595.5ms`.

Quarantined experiment:

- A direct `tx.apply(...)` shortcut inside `editor.update` failed immediately:
  `tx.apply is not a function`, and `slate-react` typecheck correctly rejected
  the API. The edit was reverted and focused contracts/typecheck passed.

Remaining owner:

- `delete-fragment.replay-replace` still costs about `309-325ms`.
- Core `build-change` remains about `165-185ms`.
- The next packet should inspect transaction replay/build-change APIs before
  patching. Do not use untyped direct transaction shortcuts.

## Metric Packet: Operation Replay Clone Attribution

Decision: keep measurement and internal-owned replay marker; continue with
post-optimization behavior proof.

What changed:

- `tx.operations.replay()` now profiles `replace_children` replay cloning as
  `operation-replay-clone:replace_children`.
- The slate delete contract guards the profiler label.
- Core now exposes an internal-only `markInternalOwnedReplayOperation()` marker.
  Marked operations skip replay clone once; unmarked replay still deep-clones.
- `applyFullBlockDeleteFragment` marks only its freshly-created full-delete
  `replace_children` operation.
- The slate delete contract proves arbitrary `replace_children` replay payloads
  are still isolated by default.
- `buildSnapshotChange` now exposes subphase profiler labels.
- Full-root structural `replace_children` reports `nodeImpactRuntimeIds: null`,
  the existing all-node sentinel, instead of enumerating every previous runtime
  id.

Proof:

- `cd .tmp/slate-v2 && bun test ./packages/slate/test/delete-contract.ts`
  passed 31 tests.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck` passed.
- `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/projected-command-contract.test.ts`
  passed 41 tests.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck` passed.
- Fresh-build 200k staged+virtualized trace passed with
  `undoDeleteRestored=1` in both lanes.
- After adding the internal marker, the same focused gates passed again and a
  fresh-build 200k staged+virtualized trace restored both lanes.
- After the node-impact sentinel fast path, `snapshot-contract`,
  `provider-hooks-contract`, and `view-selection-contract` also passed.

Metric result:

- Staged Delete-to-paint: `593.9ms`.
- Virtualized Delete-to-paint: `564.1ms`.
- Staged `delete-fragment.replay-replace`: `338.3ms`.
- Virtualized `delete-fragment.replay-replace`: `311.1ms`.
- Staged `operation-replay-clone:replace_children`: `128.9ms`.
- Virtualized `operation-replay-clone:replace_children`: `119.9ms`.
- Staged `build-change`: `193.4ms`.
- Virtualized `build-change`: `175ms`.
- Staged undo-delete: `588.8ms`.
- Virtualized undo-delete: `421.6ms`.
- After the internal-owned replay marker, staged Delete-to-paint is `359.6ms`
  and virtualized Delete-to-paint is `425.5ms`.
- `operation-replay-clone:replace_children` is gone from the marked delete
  operation.
- Staged `build-change` is `196.3ms`; virtualized `build-change` is `247.9ms`.
- Staged undo-delete is `597.2ms`; virtualized undo-delete is `446.1ms`.
- Build-change subphase attribution showed almost all remaining cost was
  `build-snapshot-change:node-impact`: staged `210.3ms`, virtualized
  `217.9ms`.
- After the node-impact sentinel fast path, staged Delete-to-paint is
  `19.7ms` and virtualized Delete-to-paint is `28.6ms`.
- After that fast path, `build-change` is `0.4ms` staged and `0.5ms`
  virtualized; `delete-fragment.replay-replace` is `1.7ms` staged and `1.9ms`
  virtualized.
- Staged undo-delete is `663.8ms`; virtualized undo-delete is `376.5ms`.

Quarantined experiment:

- Re-exporting core `applyOperation` through slate-react runtime API failed
  projected-command contracts with `editor writes must run inside
  editor.update`. Projected runtime updates are not core write authority.

Remaining owner:

- Keep the marker internal-only. Do not broaden clone skipping to arbitrary
  external operation replay.
- Focused huge-document Chromium proof passed 13 rows after the metadata fast
  path, covering staged/virtualized selection, select-all/delete, typing,
  undo/redo, paste, insert-break, and scroll stability.
- Delete latency is no longer the active blocker; first-key after delete and
  undo-after-type are separate lanes.

## Runtime Packet: Post-Delete First-Key Selection Flush

Decision: keep runtime fast path and trace guard; split undo-after-type to a
follow-up owner.

What changed:

- Browser-event kernel traces now pass compact `operations: []`, matching the
  existing keydown trace discipline instead of falling back to
  `state.value.operations()`.
- DOM input repair traces also pass compact operations.
- `runtime-before-input-events.ts` now exposes
  `shouldFlushSelectionChangeBeforeDOMBeforeInput()`.
- Beforeinput skips `selection.flushSelectionChange()` when model selection is
  already preferred for the incoming input type.

Proof:

- `cd .tmp/slate-v2/packages/slate-react && bun test ./test/editing-kernel-contract.ts`
  passed 40 tests.
- `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/runtime-before-input-events-contract.test.ts`
  passed 7 tests.
- `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/input-router-contract.test.tsx`
  passed 38 tests.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck` passed.
- `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep 'keeps staged middle-block editing|keeps staged and virtualized Shift\+ArrowUp and Shift\+ArrowDown|keeps staged repeated Shift\+ArrowDown aligned|keeps staged 10k select-all delete|keeps auto partial-dom collapsed typing|keeps virtualized browser select-all delete|replaces a huge select-all range|keeps virtualized 5k typing|keeps virtualized repeated Shift\+ArrowDown and Shift\+ArrowUp|keeps virtualized insert-break bursts|keeps virtualized backward scroll stable|keeps virtualized rows visually coherent|keeps virtualized rows buffered'`
  passed 13 tests.

Metric result:

- Trace compaction alone did not fix first-key latency: staged/virtualized
  physical first-key stayed `295.8ms` / `279.2ms`, and profiler attribution
  pointed to `beforeinput-flush-selection` at about `109-113ms`.
- After the model-preferred selection-flush skip, fresh 200k physical first-key
  after delete is staged `20.0ms` and virtualized `20.4ms`.
- The `insertText` control is staged `20.5ms` and virtualized `20.8ms`.
- Type-after-delete long tasks dropped to `0`; both lanes restore after
  undo-delete.

Remaining owner:

- Treat undo-after-type as a separate post-delete owner. Do not reopen Delete or
  first-key unless a fresh behavior proof regresses them.

## Runtime Packet: Post-Delete Keydown Selection Flush

Decision: keep partial virtualized win; split staged DOM-current undo-type to a
separate owner.

What changed:

- `runtime-selection-engine.ts` now exposes
  `shouldFlushSelectionChangeAfterKeyDownPolicy()`.
- Keydown selection policy skips pending DOM selection flush only when the
  policy is `preserve-model` and model selection is already preferred.

Proof:

- `cd .tmp/slate-v2/packages/slate-react && bun test ./test/selection-runtime-contract.test.ts`
  passed 17 tests.
- `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/keyboard-input-strategy-contract.test.ts`
  passed 37 tests.
- `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck` passed.
- `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep 'keeps staged middle-block editing|keeps staged and virtualized Shift\+ArrowUp and Shift\+ArrowDown|keeps staged repeated Shift\+ArrowDown aligned|keeps staged 10k select-all delete|keeps auto partial-dom collapsed typing|keeps virtualized browser select-all delete|replaces a huge select-all range|keeps virtualized 5k typing|keeps virtualized repeated Shift\+ArrowDown and Shift\+ArrowUp|keeps virtualized insert-break bursts|keeps virtualized backward scroll stable|keeps virtualized rows visually coherent|keeps virtualized rows buffered'`
  passed 13 tests.

Metric result:

- Fresh 200k physical trace restored staged and virtualized.
- Virtualized undo-type after delete improved from `288.2ms` to `12.4ms`.
- Staged undo-type stayed `287.8ms`.
- `insertText` control confirmed the same shape: virtualized undo-type
  `21.2ms`, staged undo-type `280.3ms`.
- Delete stayed bounded: staged `19.9ms`, virtualized `21.6ms`.
- First-key after delete stayed bounded: staged `21.0ms`, virtualized `21.9ms`.

Remaining owner:

- Staged after-type state is `dom-current`, so the model-preferred keydown skip
  does not apply there. The staged owner is whether repaired/model-owned text
  insert should preserve model authority longer, or whether this is acceptable
  full-DOM/staged debt below virtualized behavior/perf.

## Evidence Summary

Current Slate v2:

- Virtualized strategy uses bounded editable scroller options from the example
  (`.tmp/slate-v2/site/examples/ts/huge-document.tsx:47-58`,
  `.tmp/slate-v2/site/examples/ts/huge-document.tsx:177-190`).
- Virtualized root planning owns top-level/page item layout, selected endpoint
  retention, native-scrollbar drag overscan, missing-range boundaries, and
  scroll-to-path behavior
  (`.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:37-62`,
  `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:340-455`,
  `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:620-706`).
- Missing virtual ranges register DOM coverage boundaries with model copy and
  materialized selection policy
  (`.tmp/slate-v2/packages/slate-react/src/dom-strategy/virtualized-range-boundary.tsx:23-63`).
- Existing tests already prove dynamic-height backward scroll, internal
  scrollbar row stacking, and native-scrollbar drag buffering
  (`.tmp/slate-v2/playwright/integration/examples/huge-document.test.ts:2506-2689`).

CodeMirror:

- Drawn viewport and visible ranges are public concepts
  (`../codemirror-view/src/editorview.ts:90-103`).
- If selection endpoints fall outside the main viewport, CodeMirror creates
  extra single-line viewports so DOM selection does not fall into a gap
  (`../codemirror-view/src/viewstate.ts:157-204`).
- Viewport computation is height-map based and scroll-target aware
  (`../codemirror-view/src/viewstate.ts:393-416`).
- Very large document heights are scaled around active viewports
  (`../codemirror-view/src/viewstate.ts:693-736`).
- Measurement loops preserve scroll anchors and adjust scroll offset after
  height changes (`../codemirror-view/src/editorview.ts:413-496`).
- Coordinate lookup documents the precise-versus-estimated boundary when DOM is
  missing (`../codemirror-view/src/editorview.ts:741-765`).

ProseMirror / Lexical:

- Keep as behavioral/perf baselines in the cross-editor benchmark.
- Do not use them as architecture targets for virtualized rich-text selection:
  they are not solving the same partial-DOM problem in the inspected lanes.

Monaco:

- The shallow `microsoft/monaco-editor` clone contains the npm wrapper and
  feature packaging surface, not enough internal viewport architecture to cite.
  Treat it as rejected for this packet unless a later run clones the VS Code
  editor internals directly.

## Next Leads

- `huge-doc:cross-strategy-command-smoke`: now that 200k virtualized
  select-all/delete restores, run staged/virtualized command smoke for the
  remaining huge-doc editing gestures before closing the huge-doc behavior lane.

## Rejected Leads

- Copy CodeMirror's text-editor viewport implementation. Rejected: Slate's
  document model, rich block rendering, DOM coverage, paste, and selection
  projection need Slate-native ownership.
- Move virtualized selection to pure native DOM. Rejected again: missing DOM
  makes native selection incomplete.
- Clone VS Code/Monaco internals in this packet. Rejected for scope: CodeMirror
  already supplied the architecture invariant, and the promoted proof packet is
  concrete.

## Claim Width

This packet promotes one first-party browser contract and records architecture
pressure for future metrics. It does not patch runtime, does not claim
production readiness for virtualized rendering, and does not claim mobile/raw
device behavior.
