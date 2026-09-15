# Authored document reload performance

Status: Complete

Objective:
Find and repair the cause of the measured 38-second cold reload of a document with 10,000 authored changes, with matched timing and unchanged document behavior.

Completion threshold:
A material improvement on the same saved payload (at least 20% and 1 second at 10,000 changes), outside repeated baseline variability, plus affected correctness, type and lint proof. Stop after three optimization trials without a verified positive impact, retain evidence and reject ineffective edits. Three trials are the total initial budget; do not reset the count by changing owners or goals.

Verification surface:
The existing collaboration worker's saved-value reload (serialization, parse, createEditor, createEditorView and complete accepted/proposed reads), isolated as the primary metric. Reuse the exact production load path, fixture construction and existing authored/Yjs guards. Browser performance is not inferred from headless times.

Constraints:
Preserve accepted/proposed content, attribution, dependencies, review, retained history, malformed-input rejection, serialization and continued editing. No delayed validation or deferred work beyond the complete load metric. No publication or checkout change. Current branch is next; no Autoreview.

Boundaries:
Authored cold-load implementation and its existing benchmark/correctness owners. The 200-item copied discussion UI limit is outside this request.

Blocked condition:
An unavailable reproducible fixture or missing correctness proof prevents a speed claim. The user's three-trial stop is a scope limit, not proof of success.

## Sources and obligations

- User: diagnose, fix and optimize the measured reload; stop after three trials with no positive impact.
- `.agents/rules/task/references/workflow.md`: current checkout, one plan, scoped proof, no publication.
- `.agents/skills/benchmark/references/methodology.md`: matched baseline, causal isolation, exact rerun, preserve failed trials.
- `.agents/skills/verify-plate/references/commands.md`: existing source-first package and focused browser runners.
- Prior evidence: `docs/plans/artifacts/native-authored-changes/execution/collaboration-retention-installed-9.json`; original worker `benchmarks/editor/benchmarks/plite-authored-collaboration-worker.ts`.

## Benchmark Source

- request: Optimize the measured 10,000-change cold reload; three unsuccessful optimization trials maximum.
- scope: Saved authored-document load; headless construction plus complete projection reads.
- invocation: $benchmark authored cold reload (selected by Task for the user's performance repair)
- candidate-identity: fingerprint: final.mjs SHA-256 aaf3201110b6c831cc9cd77f6bd1baac513c935e24d24524a12968705f8a3d4c; full source manifest final.mjs.sources.json
- plate-main-identity: N/A: main has no matching native authored persistence contract
- plite-identity: fingerprint: final authored/decisions.ts 1b5c2f858accea2b608841c5d8f1e9a7d0dd21760decc59420e6e557b0dce04b; baseline f7fded2efd63159f43a3b9f6bcb0b038faa75b4c4106d1520bf4433e8336ef8a; every other captured source hash matches
- slate-identity: N/A: Slate has no matching native authored persistence contract
- named-symptom: 38,424 ms saved-document reload in collaboration-retention-installed-9.json
- final-artifacts: artifact: docs/plans/artifacts/authored-reload-performance/

## Interaction Coverage

- first-interaction: pass: full saved-value reload and immediate proposed insertion in every packet; Chromium trusted typing in browser-authored-direct.log
- settled-interaction: pass: 335 authored/Yjs tests and seven focused Chromium typing, review and undo checks; browser-direct-source-before/after.json hashes match
- route-scope: N/A: reported measurement is the headless collaboration worker's saved-value reload
- reporter-profile: N/A: no browser/profile measurement was reported

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | Per-packet source hashes and bundle digest | Immutable baseline source hashes and bundle digest | artifact: per-packet sourceBefore/sourceAfter and bundle fields |
| lockfile / package manager | pnpm lock hash and Bun version | Same | artifact: packet environment and lockfile source hash |
| build mode / host / port | Source bundle, Bun; initial source-preload diagnostics kept separately | Same | artifact: baseline.mjs.sources.json; no server |
| browser / machine / viewport / DPR | Apple M5 Max, Bun 1.3.12 | Same | artifact: packet environment; no DOM or viewport |
| route / fixture / document / plugins | Frozen serialized 100/1,000/10,000 block fixture with one pending insertion per block and 55 later operations | Same payload bytes | artifact: packet fixtureSha256 |
| setup / action / DOM strategy | Parse, construct, view, read both full projections | Same | artifact: packet timings and full content correctness |
| warmups / samples / interleave order | Fresh process per sample; adaptive minimum three decisive samples | Same | artifact: baseline-bundle/candidate-bundle packets in execution order |

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | Frozen 17,124,373-byte fixture; baseline-1.json 47,961 ms; baseline-profile.json 51,062 ms; pre-fix-correctness.log 112 pass | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - main does not implement this authored persistence format | Named symptom uses current native load | none |
| 3 | plate-vs-plite-decomposition | yes | complete | Measured original worker imports raw Plite; Plate facade is exact re-export; no Plate wrapper executes in the reported metric | none |
| 4 | owner-microbench-and-trace | yes | complete | Three matched samples per arm: baseline median 46,410 ms, final 7,311 ms (84.25% reduction). Full oracle and 113-test guard pass | none |
| 5 | product-mount-matrix | no | N/A: inapplicable - this request targets a headless saved-value reload, without a mount metric | Original worker source | none |
| 6 | trusted-editing-matrix | yes | complete | Seven focused Chromium typing/review/undo checks pass on owned fresh development server; complete app and runner content hashes unchanged; no production mount claim | none |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - Slate has no equivalent authored graph load | Native format-specific path | none |
| 8 | example-breadth | yes | complete | full-authored-yjs.log: 335 tests pass across 17 files covering save/reload, review, history, causality, malformed data, retained content, structure and Yjs | none |
| 9 | large-and-stress | yes | complete | Matched 100/1,000/10,000 cohorts; original worker reload 7,810 ms proposed and 13,295 ms accepted; content and idempotence checks pass. Separate accepted receive budget remains red | none for cold reload; separate receive finding below |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: terminal cause recorded in Cause History
- lane: N/A: terminal cause recorded in Cause History
- comparable-baseline: N/A: terminal cause recorded in Cause History
- material-delta: N/A: terminal cause recorded in Cause History
- isolated-owner: N/A: terminal cause recorded in Cause History
- causal-intervention: N/A: terminal cause recorded in Cause History
- fix-class: N/A: terminal cause recorded in Cause History
- long-term-target: N/A: terminal cause recorded in Cause History
- decision-owner: N/A: terminal cause recorded in Cause History
- fix-owner: N/A: terminal cause recorded in Cause History
- benchmark-command: N/A: terminal cause recorded in Cause History
- benchmark-rerun: N/A: terminal cause recorded in Cause History
- correctness-command: N/A: terminal cause recorded in Cause History
- correctness-rerun: N/A: terminal cause recorded in Cause History
- resume-lane: N/A: terminal cause recorded in Cause History
- compatibility-verdict: N/A: terminal cause recorded in Cause History
- layer-plan: N/A: terminal cause recorded in Cause History
- benchmark-rerun-result: N/A: terminal cause recorded in Cause History
- correctness-guard-result: N/A: terminal cause recorded in Cause History
- correctness-rerun-result: N/A: terminal cause recorded in Cause History

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| reload-1 | owner-microbench-and-trace | reverted | internal-implementation | Remove redundant scans of owner-frozen arrays | benchmark | N/A: internal implementation | N/A: no API or format change | core/change/document-index.ts | 47,961 to 42,770 ms; smaller than declared threshold | pass: pre-fix-correctness.log 112 tests | source-preload reload command in Commands | fail: 10.8% reduction is below 20% threshold | four-file correctness guard in Commands | pass: trial-1-correctness.log 112 tests | trial-1.json; original file restored exactly |
| reload-2 | owner-microbench-and-trace | kept | internal-implementation | Publish independent restoration edits through the existing canonical bulk change owner | benchmark | N/A: internal implementation | N/A: no API or format change | authored/decisions.ts | Only decisions.ts differs; median 46,410 to 7,311 ms, nonoverlapping three-sample ranges | pass: pre-fix-correctness.log 112 tests | paired immutable-bundle reload command in Commands | pass: paired final packets, 84.25% median reduction; final-source.json 6,831 ms | four-file correctness guard in Commands | pass: trial2-guards.log 113 tests; authored types and affected lint pass | final.mjs.sources.json; paired packets; trial2-typecheck.log; trial2-lint.log |

## Trials

1. Reverted: remove redundant Object.isFrozen scan in DocumentIndex.remember. Measured 42,770 ms against 47,961 ms baseline (10.8%); content and the exact 112-test guard passed, but the gain is below the predeclared 20% acceptance threshold. Original source is restored; no index change is being retained.
2. Kept: batch eligible independent pending text insertions during projection-only restoration through the existing DocumentChange/ChangeDraft batch path. Preserve sequential replay for dependent, structural, property, inverse and custom-validator cases. This eliminates repeated wide-array publication within each independent group, without changing the persisted format or public API. Final typechecking required public RootChange.toJSON inspection instead of private methods; final packets were rebuilt and rerun afterward. No third optimization trial is needed.

The first baseline replay was quarantined: create-editor.ts and interfaces/editor.ts changed concurrently during its measurement. The harness rejected it; baseline-2.log preserves the source mismatch. The runner can now build a frozen source bundle with a pre/post-build source manifest and assert the bundle digest before/after measurement. No checkout or other task's changes are reverted.

Durable owner decision: immutable public document snapshots must remain immutable, and complete reload must finish validation and projection. Reuse the existing bulk DocumentChange implementation; no additional document cache, public option, deferred projection or persisted snapshot is introduced. The change is internal implementation work. Existing APIs and serialized data are unchanged.

Performance proof scope: repeated unit is a pending insertion and its ancestor arrays; eligible independent groups publish their shared ancestors once. Normal/large/stress cohorts are 100/1,000/10,000 pending insertions plus 55 later operations. Memory is captured using macOS time peak resident memory on paired full runs. Browser DOM/listener/subscription costs do not apply to this headless metric; the focused browser suite guards native editing, without a browser page-load speed claim. Source-built Node is a separate runtime diagnostic (8,238 ms baseline), never pooled with Bun results. No percentile tails are inferred from three reload samples.

Baseline capture and read-only profiling do not count as trials. Each changed implementation or causal intervention that is benchmarked counts once; unsuccessful or incorrect edits are rejected.

Work Checklist:

- [x] Capture scope, stop rule and original measurement.
- [x] Freeze baseline and reproduce the complete load.
- [x] Isolate a cause with a measured intervention; count all trials.
- [x] Keep only a verified improvement with existing correctness proof.
- [x] Complete affected package types, lint and required browser proof.
- [x] Reconcile final source identity, exact original load rerun and plan validators.

## Commands

All commands run from the repository root. `baseline.mjs` is the preserved source bundle captured before trial 2; never rebuild it from candidate source. Each bundle's adjacent `.sources.json` records pre/post-build input hashes and its immutable output digest.

Paired immutable-bundle reload command (substitute arm and packet name; each run is a fresh process):

```sh
reload_bundle=docs/plans/artifacts/authored-reload-performance/final.mjs
/usr/bin/time -l bun "$reload_bundle" \
  --source-manifest="${reload_bundle}.sources.json" \
  --size=10000 \
  --fixture=docs/plans/artifacts/authored-reload-performance/fixture-10000-proposed.json \
  --output=docs/plans/artifacts/authored-reload-performance/reload-packet.json
```

Final source bundle build:

```sh
bun --preload ./config/plite-source-aliases.ts \
  benchmarks/editor/benchmarks/plite-authored-reload-benchmark.ts \
  --mode=build --output=docs/plans/artifacts/authored-reload-performance/final.mjs
```

Source-preload reload command (original isolation and final source-path rerun; packet names differ to preserve receipts):

```sh
bun --preload ./config/plite-source-aliases.ts \
  benchmarks/editor/benchmarks/plite-authored-reload-benchmark.ts \
  --size=10000 \
  --fixture=docs/plans/artifacts/authored-reload-performance/fixture-10000-proposed.json \
  --output=docs/plans/artifacts/authored-reload-performance/final-source.json
```

Four-file correctness guard:

```sh
bun test --preload ./config/plite-source-test-setup.ts \
  packages/plitejs/test/document-change.test.ts \
  packages/plitejs/test/authored-ingress-contract.test.ts \
  packages/plitejs/test/authored-position-checkpoint-contract.test.ts \
  packages/plitejs/test/authored-changes-contract.test.ts
```

Exact original collaboration runner and workload, narrowed to the reported cohort with one pass of both phases; reload includes serialization and its full accepted/proposed assertions:

```sh
bun --expose-gc --preload ./config/plite-source-aliases.ts \
  benchmarks/editor/benchmarks/plite-authored-collaboration-benchmark.ts \
  --cohort=10000 --passes=1 --samples=50 --warmups=5 \
  --output=docs/plans/artifacts/authored-reload-performance/original-collaboration-rerun.json
```

## Results

| Pending changes plus 55 later operations | Baseline Bun | Final Bun | Sampling |
|---|---|---|---|
| 100 | 80 ms | 86 ms | One exploratory sample per arm; 6 ms overhead is below the materiality threshold |
| 1,000 | 1,317 ms | 655 ms | One exploratory sample per arm |
| 10,000 | 46,410 ms median | 7,311 ms median | Three fresh-process samples per arm; final range 6,566–8,830 ms |

The 10,000-change fixture improves by 39,099 ms / 84.25% at the median. Baseline range is 45,936–71,595 ms, separated from every candidate sample. Packet order: baseline, final, baseline, final, baseline, final. Maximum resident process memory is 1,428–1,474 MiB on the two instrumented baseline packets versus 1,370–1,411 MiB on the final packets; this is benchmark-process peak memory, not retained editor heap. Node's three-sample medians are 8,126 ms versus 7,786 ms with overlapping ranges, so no meaningful Node speed claim is made.

The exact original collaboration runner completed both phases with sourcesUnchanged=true, complete content assertions, incoming-operation counts and duplicate-update idempotence. Proposed reload was 7,810 ms; mixed accepted-edit reload was 13,295 ms. Its separate accepted receive p95 was 41.6 ms against the historical 26.4 ms baseline, exceeding that runner's relative receive budget. The narrowed one-pass run also has fullContract=false. Its overall passed=false is preserved; this task does not claim that collaboration's full performance contract is green.

The managed production browser build failed on unrelated /focus-blur initialization: Plate's DOM plugin descriptor was not installed. Two development managed runs had passing assertions but were invalidated by concurrent changes to unrelated Markdown/AI source files; both logs are preserved and neither is counted as completed proof. The existing runner's direct mode then ran the seven relevant authored typing/review/undo cases on the owned fresh development server, with the complete app and browser-runner content digests asserted identical before/after. This is development-mode native editing proof, not a successful full production app build.

Final additional checks:

```sh
bun test --preload ./config/plite-source-test-setup.ts \
  packages/plitejs/test/authored-*-contract.test.ts \
  packages/plitejs/test/yjs/authored-contract.spec.ts
pnpm --filter plitejs typecheck:partition:authored
pnpm exec ultracite check packages/plitejs/src/authored/decisions.ts \
  packages/plitejs/test/authored-ingress-contract.test.ts \
  benchmarks/editor/benchmarks/plite-authored-reload-benchmark.ts
# From apps/plite, against the owned fresh development server:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3194 node scripts/run-plite-browser.mjs direct \
  authored-changes.spec.ts --project=chromium \
  -g 'measures trusted typing|types in one proposal view|undoes and redoes one native'
```

Verification evidence:
Artifacts are under docs/plans/artifacts/authored-reload-performance/. The frozen fixture SHA-256 is ce7fd2af5239095064ece91c7ca2a07c19d94f4370f8684e81efcf35a673de6a. Paired packets and manifests prove the 84.25% median reduction on Apple M5 Max/Bun 1.3.12, with only decisions.ts changed. final-source.json proves the final source path at 6,831 ms; original-collaboration-rerun.json preserves the original full reload and its separate receive-budget failure. trial2-guards.log has 113 passes; full-authored-yjs.log has 335 passes; authored types and affected lint pass. browser-authored-direct.log has seven Chromium passes, with identical browser-direct-source-before/after.json content hashes. Every final measured Plite source hash still matches final.mjs.sources.json. The index change from trial 1 is restored exactly. Benchmark and Autogoal completion validators pass.

Open risks:
The optimized 10,000 independent-insertion case still takes 6.6–8.8 seconds in Bun. Dependent, structural, property, inverse, conflicted and custom-validator cases retain sequential replay; no speedup is claimed for those shapes. Node's timing ranges overlap. The mixed accepted-edit reload remains 13.3 seconds, and the separate accepted receive-performance budget is red without a matched causal attribution to this change. Full production app build remains blocked by the unrelated Plate DOM plugin failure; the successful browser proof is development-only. Peak benchmark-process memory remains about 1.4 GiB, although it did not increase. No API, document format, publication or copied discussion-list change is included.

Next action: None within the cold-reload repair. The accepted receive-performance budget and unrelated full-app build failure remain separately identified findings.
