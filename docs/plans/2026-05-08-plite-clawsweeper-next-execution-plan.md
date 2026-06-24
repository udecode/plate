---
date: 2026-05-08
topic: plite-clawsweeper-next-execution-plan
status: done
owner: clawsweeper
related_plans:
  - docs/plans/2026-05-08-plite-performance-scalability-slate-issues-ralplan.md
  - docs/plans/2026-05-07-plite-mobile-ime-input-runtime-ralplan.md
  - docs/plans/2026-05-08-plite-dom-selection-focus-bridge-ralplan.md
  - docs/plans/2026-05-08-plite-react-decorations-slate-issues-ralplan.md
---

# Plite ClawSweeper Next Execution Plan

## Current Verdict

Do not create another broad `plite-ralplan` for this batch.

The architecture planning lanes and this full Ralph execution plan are closed:

- Mobile/IME: done, with no exact fixed/improved Mobile/IME claims promoted.
- DOM selection/focus bridge: done.
- React/decorations: done.
- Performance/scalability: ralplan done; benchmark repair, proof slices,
  compare unblocker, and claim accounting are done.

Completed work:

1. Repair benchmark API drift.
2. Run performance proof slices behind the repaired benchmark surface.
3. Run ClawSweeper claim sync after each slice.
4. Keep Mobile/IME leftovers in the right proof buckets instead of pretending
   desktop Chromium rows close raw Android/iOS/Safari reports.

## Source Of Truth

Read first:

- `.tmp/completion-checks/plite-performance-scalability-slate-issues-ralplan.md`
- `docs/plans/2026-05-08-plite-performance-scalability-slate-issues-ralplan.md`
- `docs/plans/2026-05-07-plite-mobile-ime-input-runtime-ralplan.md`
- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/plite/ledgers/fork-issue-dossier.md`
- `docs/plite/references/pr-description.md`
- `docs/plite-issues/gitcrawl-live-open-ledger.md`
- `docs/plite-issues/gitcrawl-clusters.md`
- live files under `Plate repo root`

Current completion state:

- umbrella Ralph execution: `done`
- completed: Item 1 benchmark API drift and Slices 2A through 2H
- current owner: none
- root completion check: expected green for this file-backed execution plan

## Non-Goals

- No one-patch "fix all performance" work.
- No new `Fixes #...` claim from headless benchmark output alone.
- No raw-device Mobile/IME closure from desktop Chromium or desktop WebKit.
- No table/product/plugin policy closure in raw Plite unless the raw primitive
  actually changes.
- No manual live-ledger classification columns.

## Item 1 - Benchmark API Drift

### Goal

Make the existing current benchmark runners use the current Plite write API.
The slice is infrastructure repair, not behavior work.

### Known Drift Owners

Stale patterns found in `Plate repo root`:

- `Editor.withTransaction(...)`
- `editor.insertText(...)`
- `editor.select(...)`
- old normalization assertions that no longer match current normalization
- possible stale helper wrappers inside benchmark-only files

Primary files:

- `benchmarks/plite/donor/core/current/transaction-execution.mjs`
- `benchmarks/plite/donor/core/current/text-selection.mjs`
- `benchmarks/plite/donor/core/current/normalization.mjs`
- `benchmarks/plite/donor/core/current/refs-projection.mjs`
- `benchmarks/plite/donor/core/current/query-ref-observation.mjs`
- `benchmarks/plite/donor/core/current/node-transforms.mjs`

Reference pattern:

- `benchmarks/plite/donor/core/current/editor-store.mjs`

Use current transaction calls:

```ts
editor.update((tx) => {
  tx.selection.set(target);
  tx.text.insert(text, options);
});
```

Use current snapshot/assertion APIs:

```ts
Editor.replace(editor, snapshot);
Editor.getSnapshot(editor);
```

### Execution Slices

#### Slice 1A - Transaction Benchmark API

Owner:

- `benchmarks/plite/donor/core/current/transaction-execution.mjs`

Work:

- Replace `Editor.withTransaction(...)` with current `editor.update(...)` or
  the current batch/apply API.
- Preserve the benchmark's comparison intent: manual multi-op write versus
  `applyOperations(...)`.
- Add shared percentile artifact output if missing.

Driver gates:

```bash
cd /Users/zbeyens/git/plite
bun run bench:core:transaction:local
bun run bench:slate:6038:local
```

Claim rule:

- Keep `#6038` as `Improves` unless accepted op-family thresholds and artifact
  rows exist.

#### Slice 1B - Text/Selection Benchmark API

Owner:

- `benchmarks/plite/donor/core/current/text-selection.mjs`

Work:

- Replace stale `editor.select` and `editor.insertText` helper bodies with
  transaction-owned `tx.selection.set(...)` and `tx.text.insert(...)`.
- Keep selection assertions behavior-facing.
- Emit p75/p95/p99 through shared summary helpers.

Driver gate:

```bash
cd /Users/zbeyens/git/plite
bun run bench:core:text-selection:local
```

Claim rule:

- No issue promotion from API repair.

#### Slice 1C - Ref And Observation Benchmarks

Owner:

- `benchmarks/plite/donor/core/current/refs-projection.mjs`
- `benchmarks/plite/donor/core/current/query-ref-observation.mjs`

Work:

- Convert stale write helpers to current transaction writes.
- Preserve ref/projection behavior assertions.
- Keep this focused on benchmark health, not ref behavior redesign.

Driver gates:

```bash
cd /Users/zbeyens/git/plite
bun run bench:core:refs-projection:local
bun run bench:core:query-ref-observation:local
```

#### Slice 1D - Normalization Benchmark API

Owner:

- `benchmarks/plite/donor/core/current/normalization.mjs`

Work:

- Convert stale text writes.
- Recheck normalization assertions against current Plite normalization law.
- If an assertion is stale, update the assertion only when current package tests
  already prove that behavior.

Driver gate:

```bash
cd /Users/zbeyens/git/plite
bun run bench:core:normalization:local
```

#### Slice 1E - Node Transforms Benchmark API

Owner:

- `benchmarks/plite/donor/core/current/node-transforms.mjs`

Work:

- Replace stale `editor.select(...)` calls with current selection writes.
- Keep node-transform scenario shape intact.

Driver gate:

```bash
cd /Users/zbeyens/git/plite
bun run bench:core:node-transforms:local
```

### Item 1 Closure

Run:

```bash
cd /Users/zbeyens/git/plite
bun run bench:core:transaction:local
bun run bench:core:text-selection:local
bun run bench:core:refs-projection:local
bun run bench:core:query-ref-observation:local
bun run bench:core:normalization:local
bun run bench:core:node-transforms:local
bun check
```

Then in `plate-2`:

```bash
pnpm lint:fix
bun run completion-check -- --file .tmp/completion-checks/plite-performance-scalability-slate-issues-ralplan.md
```

Completion rule:

- Current benchmark runners are green.
- Percentile artifacts exist where relevant.
- No issue claim is promoted by this item.
- Completion state names the next performance proof owner.

## Item 2 - Performance Proof Slices

These run only after Item 1 is green. Each slice gets its own `ralph` execution
entry and its own ClawSweeper sync decision.

### Slice 2A - Core Transaction Thresholds

Issue pressure:

- `#6038`
- related guards: `#3656`, `#4141`, `#3430`, `#2051`

Work:

- Add op-family tags to transaction benchmark output if absent.
- Capture p75/p95/p99 for manual transaction and batch apply paths.
- Define review thresholds as calibrated gates, not release failure gates.
- Compare repeated runs before hardening any threshold.

Driver gates:

```bash
cd /Users/zbeyens/git/plite
bun run bench:core:transaction:local
bun run bench:slate:6038:local
bun check
```

Claim rule:

- Keep `#6038` as `Improves` until threshold repeatability is accepted.
- Do not claim `Fixes #6038` from one local benchmark run.

### Slice 2B - React Rerender Breadth

Issue pressure:

- `#5131`
- related performance rows: `#5433`, `#5420`, `#5274`, `#4317`, `#3354`

Work:

- Re-run selector/depth/leaf/subscriber benchmark rows.
- Confirm broad hooks remain broad by contract.
- Record selector-locality proof without pretending `usePlite` becomes narrow.

Driver gates:

```bash
cd /Users/zbeyens/git/plite
bun run bench:react:rerender-breadth:local
bun test ./packages/plite-react/test/provider-hooks-contract.tsx ./packages/plite-react/test/projections-and-selection-contract.tsx
bun check
```

Claim rule:

- `#5131` stays `Not claimed` while `usePlite` / `useEditor` remain broad by
  contract.
- Selector APIs can be documented as the intended scalable path.

### Slice 2C - Projection And Decoration Churn

Issue pressure:

- overlay/decorations scalability rows already covered by the React/decorations
  plan
- future-proof performance rows from the matrix

Work:

- Use source-scoped invalidation counters from existing React benchmark output.
- Confirm unrelated decoration source recompute counts stay at `0`.
- Do not change public decoration APIs unless a benchmark exposes a real gap.

Driver gates:

```bash
cd /Users/zbeyens/git/plite
bun run bench:react:huge-document-overlays:local
bun test ./packages/plite-react/test/projections-and-selection-contract.tsx -t source
bun check
```

Claim rule:

- No fixed issue claim unless the original repro is replayed.

### Slice 2D - Rendering Strategy Behavior

Issue pressure:

- large-document rendering strategy
- shell/native behavior rows
- future static/virtual rendering pressure

Work:

- Keep virtualized/staged rendering experimental unless default behavior is
  proven safe.
- Add or update browser rows only for native behavior that users actually hit:
  selection, copy, find, IME, deletion, drag, and caret repair.
- Keep rendering metrics separate from browser correctness.

Driver gates:

```bash
cd /Users/zbeyens/git/plite
bun run bench:react:huge-document-overlays:local
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium
bun check
```

Claim rule:

- No large-document superiority claim unless compared against the same legacy
  cohort with legacy chunking enabled.

### Slice 2E - Clipboard Large Payload

Issue pressure:

- `#5945`
- `#5992`
- `#4056`
- proof-route backlog: `#2733`, `#2669`, `#790`, `#5216`, `#5592`, `#4202`,
  `#4210`, `#3748`, `#5349`, `#4025`

Work:

- Extend existing clipboard benchmark families instead of adding one-off
  benchmark files.
- Add browser stress rows only when they map to an issue-size path.
- Keep core benchmark and browser stress claims separate.

Driver gates:

```bash
cd /Users/zbeyens/git/plite
bun run bench:core:clipboard-large-payload:local
bun run bench:slate:5945:issue
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=chromium
bun check
```

Note:

- `bench:core:clipboard-large-payload:local` is not currently listed in
  `package.json`; if it stays absent, add a package script only if this becomes
  a repeated driver gate. Otherwise run the benchmark file directly.

Claim rule:

- No `Fixes #5945`, `Fixes #5992`, or `Fixes #4056` from headless benchmark
  proof alone.
- Promotion needs browser stress proof or explicit maintainer equivalence.

### Slice 2F - Safari Backward Selection

Issue pressure:

- Safari/WebKit selection latency and backward-selection rows
- do not merge with Mobile/IME Safari rows unless composition is involved

Work:

- Add the narrowest WebKit browser row that proves backward selection behavior.
- Keep it out of raw mobile/device language.

Driver gate:

```bash
cd /Users/zbeyens/git/plite
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright <target-test> --project=webkit --grep "<backward selection row>"
```

Claim rule:

- WebKit desktop proof can support browser selection claims.
- It does not close iOS keyboard/autocorrect/composition issues.

### Slice 2G - History Retained Memory

Issue pressure:

- `#3752`
- retained payload and history memory pressure

Work:

- Add current-only retained-memory benchmark.
- Include retained payload tags, operation count, history entry count, and heap
  evidence when available.
- Keep memory benchmark separate from latency benchmark.

Driver gate:

```bash
cd /Users/zbeyens/git/plite
bun <new-or-existing-history-memory-benchmark>
bun check
```

Claim rule:

- No `Fixes #3752` without retained-memory evidence.

### Slice 2H - Legacy Compare Unblocker

Work:

- Repair compare runners only after current-only benchmarks are healthy.
- The earlier failure was legacy `/Users/zbeyens/git/slate` build related; do
  not mix that failure with current Plite correctness.

Driver gates:

```bash
cd /Users/zbeyens/git/plite
bun run bench:core:normalization:compare:local
bun run bench:core:huge-document:compare:local
```

Claim rule:

- Compare rows inform PR language only after both sides build and run.

## Item 3 - ClawSweeper Sync After Each Slice

Run this loop after every Item 1 or Item 2 slice.

### Sync Decision Matrix

| Slice result                        | Required sync                                                                             |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| No behavior, proof, or claim change | Update active plan/completion state only.                                                 |
| New benchmark artifact only         | Update plan/completion; update matrix only if proof status changes.                       |
| New browser proof                   | Update plan/completion, matrix row, and fork dossier row for related issues.              |
| New `Improves` claim                | Update matrix, fork dossier, PR reference, fixed/improved counts if needed.               |
| New `Fixes` claim                   | Update matrix, fork dossier, PR reference fixed claims/counts, and relevant ledger notes. |
| Explicit non-claim decision         | Record in plan and matrix/dossier only when it prevents future overclaiming.              |

### Files To Check

- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/plite/ledgers/fork-issue-dossier.md`
- `docs/plite/references/pr-description.md`
- `docs/plite-issues/gitcrawl-live-open-ledger.md`
- `docs/plite-issues/gitcrawl-clusters.md`
- active plan under `docs/plans/`
- active completion file under `.tmp/completion-checks/`
- `active goal state`

### Rules

- Do not add `Fixes #...` without exact repro proof.
- Do not add "maybe fixed" prose to the PR description.
- Do not add live-ledger manual classification columns.
- If the live ledger needs a note, add a dated processing note that preserves
  live gitcrawl fields.
- Keep PR prose short: exact fixed claims, exact improved claims, and links to
  the full matrix. Nothing else.
- If a slice only repairs benchmark infrastructure, say "issue claims
  unchanged" in the completion state.

### Sync Gates

For docs-only sync in `plate-2`:

```bash
pnpm lint:fix
bun run completion-check
```

For any slice touching `Plate repo root`:

```bash
cd /Users/zbeyens/git/plite
bun check
```

Then return to `plate-2`:

```bash
pnpm lint:fix
bun run completion-check
```

## Item 4 - Mobile/IME Leftovers

The Mobile/IME macro lane is done for autonomous desktop proof. The remaining
rows are not "more harvesting." They need the right proof owner.

### Bucket 4A - Raw Device / Manual Exact Closure

Issues:

- `#6051`, `#6022`, `#5983`, `#5989`, `#5883`, `#4400`, `#5680`, `#5493`,
  `#5130`, `#5836`, `#5805`, `#5666`, `#5291`, `#5371`, `#5167`, `#4959`,
  `#4861`, `#4602`, `#4354`, `#4372`, `#5183`, `#5391`

Plan:

- Keep as related/non-claim until matching raw environment proof exists.
- Use `bun test:mobile-device-proof:raw` only on a real Android/iOS/Appium
  lane that can produce raw device artifacts.
- Do not let Playwright mobile viewport, Chromium CDP IME, or semantic mobile
  labels satisfy raw-device claims.

Driver gate when device lane exists:

```bash
cd /Users/zbeyens/git/plite
PLITE_BROWSER_RAW_MOBILE_REQUIRED=1 bun test:mobile-device-proof:raw
```

Claim rule:

- Exact closure needs issue-matching device, keyboard/browser, event trace, and
  model/DOM assertion artifacts.

### Bucket 4B - Safari/WebKit Composition Or Autocorrect

Issues:

- `#4030`, `#3943`, `#4640`, `#4543`, `#4085`

Plan:

- Keep desktop WebKit direct-input proof separate from honest composition proof.
- Add WebKit rows only when they actually exercise the Safari/WebKit behavior
  under claim.
- Do not close iOS/Safari autocorrect reports from Chromium composition rows.

Driver gate:

```bash
cd /Users/zbeyens/git/plite
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright <target-test> --project=webkit --grep "<exact Safari/WebKit row>"
```

Claim rule:

- Desktop WebKit proof may support a browser-specific `Related` or `Improves`
  row. Raw iOS closure still needs iOS proof.

### Bucket 4C - Android ReadOnly / OnChange / Manager Integration

Issues:

- `#5078`, `#5034`, `#5026`, `#4994`

Plan:

- Create integration tests only if they can observe operation freshness,
  `onChange` timing, readOnly transitions, and Android/input-manager routing.
- Unit-level model-input rows are not enough for exact closure.
- Keep these out of Mobile/IME fixed/improved PR language until the integration
  path proves the reported lifecycle.

Candidate owners:

- `packages/plite-react/test/model-input-strategy-contract.test.ts`
- `packages/plite-react/test/selection-reconciler-contract.ts`
- a new focused React integration test only if existing package tests cannot
  observe the required lifecycle

Driver gates:

```bash
cd /Users/zbeyens/git/plite
bun --filter plite-react test:vitest -- model-input-strategy-contract.test.ts
bun test ./packages/plite-react/test/selection-reconciler-contract.ts
bun --filter plite-react typecheck
```

Claim rule:

- No exact closure until the test observes the lifecycle named by the issue.

### Bucket 4D - Product / Plugin / Policy Rows

Issues:

- `#5928`, `#4532`, `#4223`, `#3573`, `#4621`, `#3222`, `#3177`

Plan:

- Keep as product/plugin/policy pressure.
- Raw Plite can expose primitives, event policy, and substrate behavior.
- Do not implement product policy in raw Plite just to close an issue.
- Move to Plate/example/plugin owner only when a current Plite product
  surface exists.

Claim rule:

- Default status stays `Related` or `Not claimed`.

## Global Execution Order

1. Item 1A: transaction benchmark API drift.
2. Item 1B: text/selection benchmark API drift.
3. Item 1C: refs/projection and query/ref benchmark API drift.
4. Item 1D: normalization benchmark API drift.
5. Item 1E: node transforms benchmark API drift.
6. Item 3 sync: record that Item 1 changed no issue claims.
7. Item 2A: core transaction thresholds.
8. Item 3 sync: `#6038` decision.
9. Item 2B: React rerender breadth.
10. Item 3 sync: `#5131` and selector-path decision.
11. Item 2C: projection/decorations churn.
12. Item 3 sync: overlay/decorations proof status.
13. Item 2D: rendering strategy behavior.
14. Item 3 sync: large-document/native behavior decisions.
15. Item 2E: clipboard large payload.
16. Item 3 sync: `#5945/#5992/#4056` decision.
17. Item 2F: Safari backward selection.
18. Item 3 sync: WebKit proof status.
19. Item 2G: history retained memory.
20. Item 3 sync: `#3752` decision.
21. Item 2H: legacy compare unblocker, only if current-only proof is already
    healthy.
22. Item 4: keep Mobile/IME leftovers in their proof buckets. Do not run more
    desktop proof unless one of the buckets gains a concrete owner.

## Completion Criteria

This umbrella plan is complete when:

- all current benchmark runners named in Item 1 are green or intentionally
  removed from package scripts with a reason;
- each performance proof slice has an artifact, browser row, retained-memory
  row, or explicit non-claim decision;
- every changed issue claim is reflected in the matrix, fork dossier, and PR
  reference;
- Mobile/IME exact-closure leftovers are bucketed by proof owner and no desktop
  proof is mislabeled as raw-device closure;
- `Plate repo root bun check` passes after any source/test/docs change there;
- `plate-2 pnpm lint:fix` and `bun run completion-check` pass after plan,
  ledger, or completion-state edits here.

## Stop Rules

- Stop after each bounded Ralph slice if the next slice would touch a different
  owner family.
- Keep going inside one slice only while the failures belong to that slice.
- If the same benchmark runner fails three times, record attempts and pivot to
  the smallest different runner that proves the same helper.
- Mark `blocked` only when the remaining proof requires unavailable raw
  Android/iOS/Safari/device infrastructure or a maintainer decision.
- Otherwise keep status `pending` and name the next runnable owner.

## Ralph Execution Ledger

### Slice 1A - Transaction Benchmark API Drift - 2026-05-08

Status: complete.

Owner:

- `benchmarks/plite/donor/core/current/transaction-execution.mjs`

Work completed:

- Replaced removed `Editor.withTransaction(...)` with current
  `editor.update((tx) => tx.operations.replay(...))`.
- Replaced removed `editor.applyOperations(...)` with the current comparison
  shape: separate per-operation updates versus one batched transaction replay.
- Preserved legacy artifact fields `withTransactionMeanMs` and
  `applyBatchMeanMs` as compatibility aliases while adding explicit
  `separateUpdateMeanMs`, `updateReplayMeanMs`, and percentile lane summaries.
- Switched artifact writing to the shared `writeBenchmarkArtifact(...)` helper.

Evidence:

- From `Plate repo root`, `bun run bench:core:transaction:local` passed.
- From `Plate repo root`, `bun run bench:slate:6038:local` passed.
- Artifact `tmp/bench-slate-6038.json` includes `p75`, `p95`, and
  `p99` for `separateUpdateMs` and `updateReplayMs`.
- From `Plate repo root`, `bun lint:fix` passed.
- From `Plate repo root`, `bun check` passed.

Issue claims:

- No issue claim changed.
- `#6038` remains `Improves`, not `Fixes`.

Reference docs:

- No change. This slice repaired benchmark API drift and artifact shape only.

Next owner:

- Slice 1B: `benchmarks/plite/donor/core/current/text-selection.mjs`.

### Slice 1B - Text/Selection Benchmark API Drift - 2026-05-08

Status: complete.

Owner:

- `benchmarks/plite/donor/core/current/text-selection.mjs`

Work completed:

- Replaced removed `editor.insertText(...)`, `editor.select(...)`,
  `editor.delete(...)`, `editor.setSelection(...)`, `editor.setPoint(...)`,
  `editor.move(...)`, and `editor.collapse(...)` benchmark calls with current
  transaction APIs under `tx.text.*` and `tx.selection.*`.
- Preserved existing benchmark lanes and behavior assertions.

Evidence:

- From `Plate repo root`, `bun run bench:core:text-selection:local` passed.
- Artifact `tmp/slate-text-selection-benchmark.json` includes
  `p75`, `p95`, and `p99` in each lane through the shared summary helper.

Issue claims:

- No issue claim changed.

Reference docs:

- No change. This slice repaired benchmark API drift only.

Next owner:

- Slice 1C:
  `benchmarks/plite/donor/core/current/refs-projection.mjs` and
  `benchmarks/plite/donor/core/current/query-ref-observation.mjs`.

### Slice 1C - Ref And Observation Benchmark API Drift - 2026-05-08

Status: complete.

Owner:

- `benchmarks/plite/donor/core/current/refs-projection.mjs`
- `benchmarks/plite/donor/core/current/query-ref-observation.mjs`

Work completed:

- Replaced removed `editor.insertText(...)` helpers with current
  `tx.text.insert(...)`.
- Replaced removed `editor.moveNodes(...)` benchmark calls with
  `tx.nodes.move(...)`.
- Replaced stale `Editor.nodes(...)` observation read with current
  `editor.read((state) => state.nodes.match(...))`.

Evidence:

- From `Plate repo root`, `bun run bench:core:refs-projection:local` passed.
- From `Plate repo root`, `bun run bench:core:query-ref-observation:local` passed.
- Artifacts `tmp/slate-refs-projection-benchmark.json` and
  `tmp/slate-query-ref-observation-benchmark.json` include
  percentile lane fields through the shared summary helper.

Issue claims:

- No issue claim changed.

Reference docs:

- No change. This slice repaired benchmark API drift only.

Next owner:

- Slice 1D: `benchmarks/plite/donor/core/current/normalization.mjs`.

### Slice 1D - Normalization Benchmark API Drift - 2026-05-08

Status: complete.

Owner:

- `benchmarks/plite/donor/core/current/normalization.mjs`

Work completed:

- Replaced removed `editor.insertText(...)` helper usage with current
  `tx.text.insert(...)`.
- Replaced stale inline schema mutation with current extension-owned element
  specs: `editor.extend({ elements: [{ type: 'inline', inline: true }] })`.
- Kept the inline-flattening assertion because current package schema tests
  prove inline behavior through extension specs and the benchmark assertion
  passes under that contract.

Evidence:

- From `Plate repo root`, `bun run bench:core:normalization:local` passed.
- Artifact `tmp/slate-normalization-benchmark.json` includes
  percentile lane fields through the shared summary helper.

Issue claims:

- No issue claim changed.

Reference docs:

- No change. This slice repaired benchmark API drift only.

Next owner:

- Slice 1E: `benchmarks/plite/donor/core/current/node-transforms.mjs`.

### Slice 1E - Node Transforms Benchmark API Drift - 2026-05-08

Status: complete.

Owner:

- `benchmarks/plite/donor/core/current/node-transforms.mjs`

Work completed:

- Replaced removed editor transform calls with current transaction-owned APIs:
  `tx.selection.set(...)`, `tx.fragment.insert(...)`, and `tx.nodes.*`.
- Preserved the node-transform scenario shape and existing benchmark
  assertions.

Evidence:

- From `Plate repo root`, `bun run bench:core:node-transforms:local` passed.
- Artifact `tmp/slate-node-transform-benchmark.json` includes
  percentile lane fields through the shared summary helper.

Issue claims:

- No issue claim changed.

Reference docs:

- No change. This slice repaired benchmark API drift only.

Next owner:

- Item 3 sync for Item 1, then Item 2A core transaction thresholds.

### Item 1 Closure - Benchmark API Drift - 2026-05-08

Status: complete.

Work completed:

- Repaired all current benchmark runners named by Item 1 against current Plite
  v2 transaction/write APIs.
- Confirmed the repaired benchmark family as a group.

Evidence:

- From `Plate repo root`, these passed:
  - `bun run bench:core:transaction:local`
  - `bun run bench:core:text-selection:local`
  - `bun run bench:core:refs-projection:local`
  - `bun run bench:core:query-ref-observation:local`
  - `bun run bench:core:normalization:local`
  - `bun run bench:core:node-transforms:local`
  - `bun check`

Issue claims:

- No issue claim changed.
- `#6038` remains `Improves`, not `Fixes`.

Reference docs:

- No matrix, dossier, or PR-reference update required. Item 1 changed
  benchmark infrastructure only.

Next owner:

- Slice 2A: core transaction thresholds.

### Slice 2A - Core Transaction Thresholds - 2026-05-08

Status: complete.

Owner:

- `benchmarks/plite/donor/core/current/transaction-execution.mjs`

Work completed:

- Extended the existing `#6038` transaction benchmark artifact with
  op-family rows for mixed structural/text batches, text insert/remove,
  node-property, node-insert, node-split, and node-move operations.
- Kept compatibility fields for existing consumers:
  `withTransactionMeanMs`, `applyBatchMeanMs`, `separateUpdateMeanMs`, and
  `updateReplayMeanMs`.
- Added calibration-only threshold metadata instead of inventing a release
  failure gate from one local machine.

Evidence:

- From `Plate repo root`, `bun run bench:core:transaction:local` passed.
- From `Plate repo root`, `bun run bench:slate:6038:local` passed.
- Artifact `tmp/bench-slate-6038.json` has
  `opFamilyLanes.*.separateUpdateMs.p95/p99` and
  `opFamilyLanes.*.updateReplayMs.p95/p99`.

Issue claims:

- No issue claim changed.
- `#6038` stays `Improves`; no `Fixes #6038` claim until thresholds are
  accepted after repeat variance.

Reference docs:

- No matrix, dossier, or PR-reference update required. The existing `#6038`
  `Improves` decision already captures the non-promotion rule.

Next owner:

- Slice 2B: React rerender breadth.

### Slice 2B - React Rerender Breadth - 2026-05-09

Status: complete.

Owner:

- `benchmarks/plite/donor/browser/react/rerender-breadth.tsx`

Work completed:

- Re-ran selector/depth/leaf/subscriber benchmark rows.
- Confirmed the artifact still proves selector-locality rows without claiming
  broad editor hooks become narrow.
- Confirmed broad hook non-claim policy remains correct for `#5131`.

Evidence:

- From `Plate repo root`, `bun run bench:react:rerender-breadth:local` passed.
- From `Plate repo root`,
  `bun test ./packages/plite-react/test/provider-hooks-contract.tsx ./packages/plite-react/test/projections-and-selection-contract.tsx`
  passed.
- Artifact
  `packages/plite-react/tmp/slate-react-rerender-breadth-benchmark.json`
  has percentile rows for sibling leaf breadth, deep ancestor breadth, broad
  selection renders, and source-scoped invalidation.

Issue claims:

- No issue claim changed.
- `#5131` stays `Not claimed` while `usePlite` / `useEditor` remain broad by
  contract.
- Selector APIs remain the intended scalable path.

Reference docs:

- No matrix, dossier, or PR-reference update required. Existing rows already
  record `#5131` as not claimed and point at the rerender breadth benchmark.

Next owner:

- Slice 2C: projection and decoration churn.

### Slice 2C - Projection And Decoration Churn - 2026-05-09

Status: complete.

Owner:

- `benchmarks/plite/donor/browser/react/huge-document-overlays.tsx`
- `packages/plite-react/test/projections-and-selection-contract.tsx`

Work completed:

- Re-ran the huge-document overlays benchmark.
- Confirmed source-scoped projection/decorations churn stays localized:
  unrelated active-edit and shell-promotion lanes kept projection recompute
  count at `0`, while the overlay toggle lane recomputed exactly once.
- Re-ran the source-focused projection contract tests.

Evidence:

- From `Plate repo root`, `bun run bench:react:huge-document-overlays:local`
  passed.
- From `Plate repo root`,
  `bun test ./packages/plite-react/test/projections-and-selection-contract.tsx -t source`
  passed.
- Artifact
  `packages/plite-react/tmp/slate-react-huge-document-overlays-benchmark.json`
  has percentile rows and the expected projection recompute counts:
  `activeEditAfterOverlay.projectionRecomputeCount.mean = 0`,
  `overlayToggle.projectionRecomputeCount.mean = 1`, and
  `shellPromotion.projectionRecomputeCount.mean = 0`.

Issue claims:

- No issue claim changed.
- No fixed issue claim from this local benchmark-only proof.

Reference docs:

- No matrix, dossier, or PR-reference update required. This slice confirmed the
  planned projection/decorations proof without changing issue claims or public
  API shape.

Next owner:

- Slice 2D: rendering strategy behavior.

### Slice 2D - Rendering Strategy Behavior - 2026-05-09

Status: complete.

Owner:

- `benchmarks/plite/donor/browser/react/huge-document-overlays.tsx`
- `apps/www/tests/plite-browser/donor/examples/dom-coverage-boundaries.test.ts`

Work completed:

- Re-ran the huge-document overlays benchmark as the rendering metrics proof.
- Re-ran the DOM coverage boundaries browser row under Chromium for native
  behavior proof across find, placeholders, copy, select-all, drag selection,
  hidden model updates, and IME composition.
- Kept rendering metrics separate from browser correctness.

Evidence:

- From `Plate repo root`, `bun run bench:react:huge-document-overlays:local`
  passed.
- From `Plate repo root`,
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium`
  passed with 7 Chromium rows and 1 mobile-touch row skipped.
- From `Plate repo root`, `bun check` passed.

Issue claims:

- No issue claim changed.
- No large-document superiority claim. This slice did not compare against a
  matched legacy cohort with legacy chunking enabled.
- No raw mobile/device claim. The skipped mobile-touch row is not raw-device
  proof.

Reference docs:

- No matrix, dossier, or PR-reference update required. This slice confirmed the
  planned rendering/browser proof without changing issue claims or public API
  shape.

Next owner:

- Slice 2E: clipboard large payload.

### Slice 2E - Clipboard Large Payload - 2026-05-09

Status: complete.

Owner:

- `benchmarks/plite/donor/core/current/clipboard-large-payload.mjs`
- `apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts`
- `packages/plite-react/src/editable/mutation-controller.ts`

Work completed:

- Re-ran the clipboard large payload core benchmark directly because
  `bench:core:clipboard-large-payload:local` is not listed in `package.json`.
- Re-ran the `#5945` issue benchmark wrapper.
- Re-ran generated editing browser stress under Chromium.
- Fixed the browser stress regression found during proof: full-block delete
  fast path now removes every fully selected sibling block instead of treating
  a multi-block start-to-start selection as a one-block deletion.

Evidence:

- From `Plate repo root`,
  `bun ./scripts/benchmarks/core/current/clipboard-large-payload.mjs` passed.
- From `Plate repo root`, `bun run bench:slate:5945:issue` passed with issue
  thresholds green: `cutTwoBlocksEditMsP50 = 2.02ms`, `cutTwoBlocksMsP50 =
2.17ms`, and `operationCount = 1`.
- From `Plate repo root`,
  `STRESS_FAMILIES=huge-document-cut PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=chromium`
  passed.
- From `Plate repo root`,
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=chromium`
  passed with 24 Chromium rows.
- From `Plate repo root`, `bun check` passed.
- Benchmark artifact:
  `tmp/slate-clipboard-large-payload-benchmark.json`.

Issue claims:

- No `Fixes #5945`, `Fixes #5992`, or `Fixes #4056` claim promoted from this
  slice.
- Browser stress proof covers the huge-document cut behavior used by this
  slice, but the plan still requires explicit maintainer equivalence before
  closing those issue claims.

Reference docs:

- No matrix, dossier, or PR-reference update required. This slice fixed runtime
  behavior and proved the planned benchmark/browser route without changing
  public API shape or issue-claim status.
- Added solution note:
  `docs/solutions/logic-errors/2026-05-09-plite-full-block-delete-fast-path-must-stop-at-selection-boundaries.md`.

Next owner:

- Slice 2F: Safari backward selection.

### Slice 2F - Safari Backward Selection - 2026-05-09

Status: complete.

Owner:

- `apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts`

Work completed:

- Added a focused browser stress row for desktop WebKit backward selection.
- The row starts from a real DOM caret in the richtext example, presses
  `Shift+ArrowLeft`, and asserts both DOM and model selection direction:
  `anchor` remains at offset `4`, `focus` moves to offset `3`, and selected
  text is `s`.
- Kept the proof scoped to desktop WebKit selection behavior. No mobile, iOS
  keyboard, autocorrect, or IME claim is made.

Evidence:

- From `Plate repo root`,
  `STRESS_FAMILIES=webkit-backward-selection PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=webkit`
  passed.
- From `Plate repo root`, `bun check` passed.

Issue claims:

- No raw mobile/device claim.
- No IME or composition claim.
- Desktop WebKit backward-selection behavior now has a focused regression row.

Reference docs:

- No matrix, dossier, or PR-reference update required. This slice added proof
  coverage without changing issue-claim status or public API shape.

Next owner:

- Slice 2G: history retained memory.

### Slice 2G - History Retained Memory - 2026-05-09

Status: complete.

Owner:

- `benchmarks/plite/donor/core/current/history-retained-memory.mjs`
- `Plate repo root/package.json`
- `benchmarks/plite/donor/README.md`
- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/plite/ledgers/fork-issue-dossier.md`

Work completed:

- Added a current-only retained-memory benchmark for history payload pressure.
- Added stable driver command:
  `bun run bench:core:history-retained-memory:local`.
- The benchmark records history entry count, redo entry count, operation count,
  retained batch operation count, retained operation types, retained payload
  tags, retained JSON byte counts, and `process.memoryUsage().heapUsed` samples
  when available.
- Synced `#3752` from `Related` to `Improves` in the matrix/dossier while
  keeping exact memory-leak closure out of scope.

Evidence:

- From `Plate repo root`, `bun run bench:core:history-retained-memory:local`
  passed.
- Artifact: `tmp/slate-history-retained-memory.json`.
- `fullDocumentReplaceChildren`: one history entry, one retained
  `replace_children` operation, `historyJsonBytes = 1585394`.
- `rangeDeleteReplaceChildren`: one history entry, one retained
  `replace_children` operation, `historyJsonBytes = 775230`.
- Heap samples were captured from `process.memoryUsage().heapUsed`; local GC was
  unavailable, so heap samples remain calibration evidence, not thresholds.
- From `Plate repo root`, `bun check` passed after `bun lint:fix` formatted the new
  benchmark file.

Issue claims:

- `#3752` is now `Improves`, not `Fixes`.
- No exact memory-leak closure. Exact closure still needs an accepted leak
  threshold or detached DOM/node retention proof that matches the original
  report.

Reference docs:

- Updated `docs/plite/ledgers/issue-coverage-matrix.md`.
- Updated `docs/plite/ledgers/fork-issue-dossier.md`.

Next owner:

- Slice 2H: legacy compare unblocker.

### Slice 2H - Legacy Compare Unblocker - 2026-05-09

Action:

- Repaired the normalization and huge-document compare runners so the current
  Plite side uses source imports for full internal `Editor` runtime APIs,
  while legacy Plite keeps package imports.
- Updated compare runner adapters for v2 transaction writes:
  `tx.text.insert`, `tx.selection.set`, and `tx.fragment.insert`.
- Kept legacy `/Users/zbeyens/git/slate` setup/build separate from current
  Plite correctness.

Files changed:

- `benchmarks/plite/donor/core/compare/normalization.mjs`
- `benchmarks/plite/donor/core/compare/huge-document.mjs`

Commands:

- `cd /Users/zbeyens/git/plite && bun run bench:core:normalization:compare:local`
- `cd /Users/zbeyens/git/plite && bun run bench:core:huge-document:compare:local`
- `cd /Users/zbeyens/git/plite && bun lint:fix`
- `cd /Users/zbeyens/git/plite && bun check`

Artifacts:

- `tmp/slate-normalization-compare-benchmark.json`
- `tmp/slate-core-huge-document-benchmark.json`

Compare evidence:

- Normalization compare passed. Current v2 was faster on explicit adjacent-text
  normalization and explicit inline-flatten normalization; legacy was faster on
  insert-text-with-read-after-each.
- Huge-document compare passed. Current v2 was faster on full-document text
  replacement and full-document fragment insertion; legacy was faster on simple
  start/middle typing and select-all.

Issue claims:

- Unchanged. This slice repairs benchmark infrastructure and records compare
  evidence only.
- No new `Fixes` or `Improves` claim.

Reference docs:

- No ledger or PR-reference claim sync needed because issue claims did not
  change.

Next owner:

- None for this umbrella plan. Mobile/IME leftovers remain bucketed by proof
  owner and require raw device/manual proof before exact closure.
