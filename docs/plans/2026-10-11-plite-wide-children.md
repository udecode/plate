# Plite text ops cost grows with top-level width

Status: executed, waiting on your commit
Topic: reads
Playbook: perf-issue

Every text op in a Plite change copied the document's top-level children and called `Object.freeze` on the copy. In JavaScriptCore (Bun, Safari) that freeze costs O(length), so at 10,000 blocks typing cost about 2 ms a keystroke and a 40-op transaction about 77 ms. This plan removes that freeze from every edit and keeps the immutability checks the engine relies on.

## Brief

### What will change?

Typing and multi-edit changes in big Plite documents get about 10 times faster at 10,000 blocks in Bun, and Safari shares its engine. A keystroke drops from 1.9 to 0.2 ms. The Close has the proof and its limits.

### What could go wrong?

Each edit still copies the top-level list, so huge documents keep a smaller cost that grows with size. The list is no longer frozen after an edit, so a stray write fails later or goes unnoticed.

## Teach

A Plite document is a tree of plain objects and lists that never change in place. Each edit builds new copies along the path it touches and shares the rest, so old snapshots stay valid. Plite froze what it built, and it asked "is this frozen?" to decide what it could trust without copying.

Typing one letter in block 5,000 of a 10,000-block document built a new top-level list and froze it. In Chrome that freeze is nearly free. In Safari and Bun it walks the whole list, and the frozen list stays slow to copy and read afterwards.

Now Plite keeps its own record of the top-level lists it built and trusts that record instead of a freeze. Blocks and their children stay frozen. A guard refuses the next edit when something outside Plite changed the list's length.

## Main changes

- `packages/plitejs/src/core/clone.ts` owns the registry of document root arrays. `rememberImmutableArray` registers one, and `isImmutable` answers from the registry before it asks `Object.isFrozen`. `ownJsonValue` registers an immutable value as owned JSON without freezing it again. `change/tokens.ts` loses `FROZEN_ARRAYS`, `rememberFrozenArray` and `isFrozenArray`.
- The builders in `packages/plitejs/src/core/change/document-index.ts` return unfrozen arrays. `freezeElementWithChildren` freezes a nested result once, when it becomes an element's `children`, and `DocumentIndex.remember` registers the root. Every update reads the root through `checkedIndexedValue`, which throws when the root's length no longer matches its token index.
- `replaceTreeIndexChild` in `packages/plitejs/src/core/resolved-token-cursor.ts` copies one index row and shifts only the offsets after the replaced child, and shares the offsets when the child keeps its length.
- Every trust check that can see a root asks `isImmutable`: `getSnapshot` and the root snapshots in `public-state.ts`, `rememberValidatedDocumentRoots` in `editor-schema.ts`, the JSON ownership memo in `value-codec.ts` and `createDetachedContentSlice` in `content-slice.ts`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
|---|---|---|---|---|
| Top-level list after an edit | Not frozen, guarded by a length check (look) | Frozen on every edit, slow again in Safari | refreeze | small |
| Release note | Two lines added to the existing speed note | A note of its own | own note | detail |
| Offset shortcut | Kept, since batches run a little faster | Removed, about 20 fewer lines | drop shortcut | detail |

## Open work

- Each op still copies the top-level list and its index row, about 0.1 ms per op at 10,000 blocks and 1 ms at 100,000 in Bun (`artifacts/2026-10-11-plite-wide-children/probe-stress-final-a1.log`). Removing that copy needs a persistent private root with one flat array built per published version, which changes how `editor.read.children()` is produced, so it runs through `best-api` and the Plan playbook. Tracked in `docs/plans/topics/reads.md` Open work. owner: zbeyens. stop: the owner opens that plan or drops it.
- A root-level splice, as in `tx.slice.replace` or a node insert or removal, copies the root array and rebuilds the whole root index with `createTreeIndexChildren` on every op. The change-width session's profile puts it at about 256 us more per op at 10,000 blocks than at 100, under the profiler (`docs/plans/artifacts/2026-10-11-plite-change-width-benchmark/cpu/`). A splice counterpart of `replaceTreeIndexChild` would shift the offsets instead of rebuilding them. Tracked in `docs/plans/topics/reads.md` Open work. owner: zbeyens. stop: a structural-op width probe lands that helper, or the owner drops it.
- A wide element's `children` array, such as a table with thousands of rows, is still frozen on every edit inside it. Tracked in `docs/plans/topics/reads.md` Open work. owner: zbeyens. stop: a probe of edits inside a wide element shows the cost material, or the owner drops it.
- Authored `finishContent` snapshots the document root with `snapshotEditorJsonValue`, which copies and freezes it once per content insert, the same as at base. Tracked in `docs/plans/topics/reads.md` Open work. owner: zbeyens. stop: a content-insert width probe lands a fix, or the owner drops it.
- `rememberValidatedDocumentRoots` walks every node on each `tx.changes.apply` and `tx.slice.replace`, and `DocumentChange.apply` looks up every top-level node; the change-width session took both on 2026-10-11. Tracked in `docs/plans/topics/reads.md` Open work. owner: zbeyens. stop: that session's plan lands them, or the owner drops them.
- `2e865a0bc4:docs/research/decisions/model-document-boundary.md:98-100` says a document-bound view reuses cached validation only for "frozen documents Plite produced"; after this change those roots are registered, not frozen. Tracked in `docs/plans/topics/reads.md` Open work. owner: zbeyens. stop: the next edit of that decision record rewords it, or the owner drops it.

## Reflect

One opus reviewer applied the tooling, judgment and divergent lenses to this run's transcript (`artifacts/2026-10-11-plite-wide-children/reflect/opus/reply.md`), and the lead synthesized. No lesson is a crash fix or a same-length rewording, so nothing was applied. Every kept lesson waits in Backlog for the owner.

### Accepted

None applied. The project lets the lead apply only a fix to a helper that refuses a case its own rule allows, or a reworded rule with no net words. No finding was either.

### Rejected

- Redoing a running explorer's search is already covered by the Agent tool's rule against searching after delegating. Reason: already-covered.
- Running the full partitions only on final bytes would have hidden the two contract tests that c2 broke, which changed the plan. Reason: decision-changing.
- Running package commands in a subshell instead of with `cd` is already covered by the shell guidance to prefer absolute paths. Reason: already-covered.
- The work-count test pins the mechanism, the reviewer says. It asserts the named defect's own quantity, freeze work that grows with width, and equal counts across widths tolerate any constant freeze. Reason: convergence, a single reviewer against the run's mutation evidence.

### Backlog

- Probes with a load limit should read the load themselves and print timing lines as inconclusive above it, so a report cannot call a high-load packet a pass. Mechanism: a load check in the benchmark harness helper. owner: zbeyens. stop: the owner takes or drops it.
- `validate-benchmark-plan.mjs` errors should name the accepted form, such as `artifact: <path>` or `commit: <sha>`, instead of "requires artifact evidence". Mechanism: the validator's messages. owner: zbeyens. stop: the owner takes or drops it.
- The benchmark template's discovery gate should name `node tooling/scripts/bench-targets.mjs list`. owner: zbeyens. stop: the owner takes or drops it.
- A base failure set needs `turbo run test --filter=<pkg> --continue` and a comparison of failing test names. Mechanism: a failure-set helper in verify's command recipes. owner: zbeyens. stop: the owner takes or drops it.
- Building "base plus this task's hunks" on a tree other sessions edit needed a hand-rolled replay script. Mechanism: a replay mode in `freeze.mjs` or `proof-worktree.mjs`. owner: zbeyens. stop: the owner takes or drops it.
- `cross.mjs` writes a seat's answer only when the seat exits, and the lead polled empty files about a dozen times. Mechanism: a heartbeat line, or guidance in the architect and panel briefs to wait for the completion notice. owner: zbeyens. stop: the owner takes or drops it.
- The trails rule and `decisions-check.mjs` usage say "and the rest" instead of listing the status words in `status.mjs`. Mechanism: print the list in the usage text. owner: zbeyens. stop: the owner takes or drops it.
- This run made six inline text edits, one on product source. This repeats the open item in `docs/plans/topics/correct.md` (refuse inline edits), which waits on the owner's word. owner: zbeyens. stop: the owner says "refuse inline edits", or 2026-11-08.
- A failed packet was paraphrased away by a compaction summary before it reached the log. Mechanism: the probe runner queues a decision row for every packet it runs, pass or fail. owner: zbeyens. stop: the owner takes or drops it.
- Four numbers in hand-typed log rows were wrong. Mechanism: generate number-bearing rows from the logs with a summary script. owner: zbeyens. stop: the owner takes or drops it.
- When a chosen design breaks a condition the lead wrote into its own design brief, the trail should get a deviation row at synthesis time. owner: zbeyens. stop: the owner takes or drops it.
- Rewriting a contract test that a candidate fails is a product call, so its Defaults row should exist before the test edit. owner: zbeyens. stop: the owner takes or drops it.
- A "does not grow with N" budget should hold at the largest cohort, or across two decades of N, so a small linear term cannot hide. owner: zbeyens. stop: the owner takes or drops it.
- A planted slowdown should be the cheapest member of the claimed regression class, such as an O(n) copy, not only the cause just removed. owner: zbeyens. stop: the owner takes or drops it.
- A close on a tree other sessions share should run one partition pass on a freeze of the real tree, not only on base plus the task's hunks. owner: zbeyens. stop: the owner takes or drops it.
- A change to a runtime guarantee of a returned value, such as frozenness, should trigger `best-api`. Mechanism: tune its description. owner: zbeyens. stop: the owner takes or drops it.
- An arena whose deciding measurement arrives after the runners finish should get a rebuttal round or a judge from another family. owner: zbeyens. stop: the owner takes or drops it.
- Fixes written for a trail reviewer add new claims that nobody reviews. This run's first Attention line miscounted the inline edits. Mechanism: recheck every new factual sentence against the transcript before hand-back. owner: zbeyens. stop: the owner takes or drops it.

## Benchmark Source

- request: "every text op inside a Plite transaction (update or `state.transaction` spec) on a document whose top-level children are many costs O(document)... Design the update so a single-node change does not cost O(top-level children)... Keep the immutability guarantees the engine relies on. Measure typing (one text op per transaction) and multi-op transactions at 10,000 blocks before and after, with Benchmark's pre-acceptance probe (frozen budget, base run first, a planted slowdown the line must reject). Prove correctness with the plitejs and platejs test partitions."
- scope: Plite change application in `packages/plitejs/src/core/change/document-index.ts` and the trust checks that read document-array frozenness
- invocation: `$benchmark only plite text-op scaling` (the request names the measurement: typing and 40-op transactions at 100, 1,000 and 10,000 blocks)
- candidate-identity: commit: `f9351af1df` (c5): base plus this run's edits to 8 plitejs source files and 3 test files, replayed on the base blobs (`artifacts/2026-10-11-plite-wide-children/candidate-c5.sha`, `c5.diff`)
- plate-main-identity: N/A: only - the request names an engine probe, not a product comparison against main
- plite-identity: base `e965803ef8df768c6808f5c53d8b710d22996288`, HEAD `5fc246c291` plus the 48 uncommitted plitejs and platejs source files other sessions hold, frozen with `.agents/pstack/freeze.mjs`
- slate-identity: N/A: only - no Slate comparison requested
- named-symptom: 40 text ops in an unpublished spec cost 4.9 / 8.8 / 84 ms over 0 / 100 / 1,000 other 10-item lists (`artifacts/2026-10-11-ai-list-landing/perf/spec-ops-micro-a2.log`)
- final-artifacts: artifact: `docs/plans/artifacts/2026-10-11-plite-wide-children/final-summary-a1.log`, `probe-plant-final-a1.log`, `spec-ops-lowload-candidate-p1-a1.log`, `spec-ops-lowload-candidate-p2-a1.log`, `probe-stress-final-a1.log`, `index-update-micro-a1.log`, `correct-final-plitejs-a1.log`, `correct-final-platejs-a1.log`, `types-final-plitejs-a1.log`

Boundaries:
- allowed runtime/packages/apps: `packages/plitejs/src`
- allowed benchmark/tests/fixtures: probes in this run's directory; plitejs tests only where a contract changes
- allowed baseline checkouts/hosts: detached worktrees from `tooling/scripts/proof-worktree.mjs` at the frozen base and candidate commits, on this host
- non-goals: browser typing latency, Plate plugin costs, structural ops other than text, persistent chunked children

## Interaction Coverage

- first-interaction: N/A: only - engine probe, no browser interaction measured
- settled-interaction: N/A: only - engine probe, no browser interaction measured
- route-scope: N/A: only - engine probe, no route
- reporter-profile: N/A: only - engine probe, no reporter host

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | `f9351af1df` (c5) | `e965803ef8` (HEAD `5fc246c291` plus the uncommitted source set) | artifact: `artifacts/2026-10-11-plite-wide-children/candidate-c5.sha`; `artifacts/2026-10-11-plite-wide-children/base.sha` |
| lockfile / package manager | same `pnpm-lock.yaml`, linked `node_modules` | same | artifact: both worktrees link this checkout's `node_modules` (`tooling/scripts/proof-worktree.mjs`) |
| build mode / host / port | Bun 1.3.12 from source, no build | same | artifact: `runtime: bun 1.3.12` line in `artifacts/2026-10-11-plite-wide-children/probe-final-candidate-p1-a1.log` and every final log |
| browser / machine / viewport / DPR | macOS arm64, 18 cores, no browser | same | artifact: load average beside each run in `artifacts/2026-10-11-plite-wide-children/probe-final-load.txt` and `probe-final2-load.txt` |
| route / fixture / document / plugins | `createEditor({ initialValue })`, N paragraphs of `row-i ` x4, no plugins | same | artifact: the probe reads the block count back and fails on a mismatch (`artifacts/2026-10-11-plite-wide-children/text-op-scaling.mjs`) |
| setup / action / DOM strategy | typing: one `tx.text.insert('x')` per `editor.update` in block N/2; batch: 20 delete-4 then insert-4 pairs over three blocks in one `editor.update` | same | artifact: output digest per cohort equal across arms (`artifacts/2026-10-11-plite-wide-children/final-summary-a1.log`) |
| warmups / samples / interleave order | a discarded warm-up pass, then 30 typing and 2 batch warmups; 300 typing and 30 batch samples; five packets, base then candidate each | same | artifact: `artifacts/2026-10-11-plite-wide-children/run-arms.sh` |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Benchmark Source request quote |
| `benchmark` source and methodology read | yes | skill loaded, `methodology.md` read in full this session |
| Existing plan reused | yes | none open for this scope; `2026-10-11-ai-list-landing.md` tracks it as open work |
| Candidate and baseline identities recorded | yes | base `e965803ef8`; candidate `f9351af1df` |
| Target/runner discovery completed from current source | yes | `node tooling/scripts/bench-targets.mjs list`: no target times per-op text cost across widths, so the probe is new |
| Host/build/fixture freshness proved | yes | Bun runs source directly; every arm runs in a fresh worktree at a frozen sha |
| Correctness oracle identified | yes | `turbo run test --filter=plitejs --continue` and `--filter=platejs`, base failures recorded |
| All default lanes inventoried | yes | lane table |
| `only` narrowing explicitly authorized or N/A | yes | the request names the measurement |
| Browser/native proof strategy selected | yes | N/A: only, engine probe |

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | base frozen as `e965803ef8`; probe sizing run `artifacts/2026-10-11-plite-wide-children/probe-base-size-a2.log` | owner probe |
| 2 | current-vs-main-product-smoke | no | N/A: only - explicitly narrowed to the engine probe | request quote | none |
| 3 | plate-vs-plite-decomposition | no | N/A: only - the cost is isolated in Plite by the earlier CPU profile | `artifacts/2026-10-11-ai-list-landing/perf/cpu/` | none |
| 4 | owner-microbench-and-trace | yes | complete | cause C1 kept: `artifacts/2026-10-11-plite-wide-children/final-summary-a1.log` | none |
| 5 | product-mount-matrix | no | N/A: only - explicitly narrowed; mount is not the symptom | request quote | none |
| 6 | trusted-editing-matrix | no | N/A: only - explicitly narrowed to engine typing | request quote | none |
| 7 | plite-vs-pinned-slate | no | N/A: only - no Slate comparison requested | request quote | none |
| 8 | example-breadth | no | N/A: only - explicitly narrowed | request quote | none |
| 9 | large-and-stress | yes | complete | `artifacts/2026-10-11-plite-wide-children/probe-stress-base-a1.log`, `probe-stress-final-a1.log`: frozen elements per keystroke stay 35 to 100,000 blocks; typing p50 0.088, 0.087, 0.171, 1.08 ms at 100, 1,000, 10,000, 100,000 blocks | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: cause C1-root-freeze closed, see Cause History
- lane: N/A: cause C1-root-freeze closed, see Cause History
- comparable-baseline: N/A: cause C1-root-freeze closed, see Cause History
- material-delta: N/A: cause C1-root-freeze closed, see Cause History
- isolated-owner: N/A: cause C1-root-freeze closed, see Cause History
- causal-intervention: N/A: cause C1-root-freeze closed, see Cause History
- correctness-guard-result: N/A: cause C1-root-freeze closed, see Cause History
- fix-class: N/A: cause C1-root-freeze closed, see Cause History
- long-term-target: N/A: cause C1-root-freeze closed, see Cause History
- decision-owner: N/A: cause C1-root-freeze closed, see Cause History
- layer-plan: N/A: cause C1-root-freeze closed, see Cause History
- compatibility-verdict: N/A: cause C1-root-freeze closed, see Cause History
- fix-owner: N/A: cause C1-root-freeze closed, see Cause History
- benchmark-command: N/A: cause C1-root-freeze closed, see Cause History
- benchmark-rerun: N/A: cause C1-root-freeze closed, see Cause History
- benchmark-rerun-result: N/A: cause C1-root-freeze closed, see Cause History
- correctness-command: N/A: cause C1-root-freeze closed, see Cause History
- correctness-rerun: N/A: cause C1-root-freeze closed, see Cause History
- correctness-rerun-result: N/A: cause C1-root-freeze closed, see Cause History
- resume-lane: N/A: every applicable lane is complete

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| C1-root-freeze | owner-microbench-and-trace | kept | internal-implementation | Plite owns document root arrays instead of freezing them, with one `isImmutable` predicate for every trust check; a persistent private root is the follow-up for the remaining copy | benchmark | N/A: internal-implementation in `plitejs` core, no adoption step | N/A: internal-implementation; no public call shape changes | the lead, `packages/plitejs/src/core` | removing only the root `Object.freeze` in `replaceIndexedChildren` at base drops elements frozen per keystroke from 10,040 to 40 and typing p50 at 10,000 blocks from 2.18 to 0.23 ms (`artifacts/2026-10-11-plite-wide-children/probe-base-nofreeze-a1.log`) | pass: before any change, base fails 14 plitejs and 1 platejs tests, recorded as the set the candidate must match (`artifacts/2026-10-11-plite-wide-children/correct-base-plitejs-a2.log`, `correct-base-platejs-a1.log`) | `run-arms.sh <base> <candidate> <packets> <label>` (`env PROBE_ROOT=<worktree> PROBE_ARM=<arm> PROBE_BUDGET=budget.json bun text-op-scaling.mjs` per arm) and the original `bun test --timeout 600000 spec-ops-micro.spec.ts` | pass: five interleaved packets per side; c5 passes both work lines in every packet and base fails them; in the two packets under the load limit c5 passes all four lines, with typing p50 at 10,000 blocks 0.18 and 0.18 ms vs 1.90 and 1.90 ms and the 40-op batch 5.25 and 5.30 ms vs 62.6 and 76.6 ms; the planted root freeze fails both work lines; the original spec at 1,000 lists 6.97 and 10.1 ms vs 78.0 and 96.4 ms at low load | `run-correctness.sh <sha> <label>` (`turbo run test --filter=plitejs` and `--filter=platejs` with `--continue` in a proof worktree) | pass: c5 fails exactly the base's 14 plitejs and 1 platejs tests, the two new tests pass, both mutations are caught, plitejs typecheck passes | `artifacts/2026-10-11-plite-wide-children/final-summary-a1.log`, `probe-plant-final-a1.log`, `spec-ops-final-a1.log`, `correct-final-plitejs-a1.log`, `correct-final-platejs-a1.log`, `types-final-plitejs-a1.log`, `mutate/` |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| P0 nofreeze control | owner-microbench-and-trace | C1: the root freeze per text op | typing p50 at 10,000 blocks 0.23 vs 2.18 ms; batch 6.3 vs 91.5 ms; 40 vs 10,040 elements frozen per keystroke | not run, control only | keep as causal evidence | design |
| P1 c1 owned roots | owner-microbench-and-trace | C1 fix | typing 0.2025 ms, batch 5.94 ms at 10,000 blocks; every line passes (`probe-v2c1-candidate-p1-a1.log`) | not run | superseded by c2 | add incremental offsets |
| P2 c2 plus incremental offsets | owner-microbench-and-trace | C1 fix | typing 0.192 vs 1.87 ms, batch 5.57 vs 61.4 ms at 10,000 blocks; every line passes (`probe-v2c2-candidate-p1-a1.log`) | two contract tests assert the old frozen root (`correct-c2-plitejs-a1.log`) | keep, update the contract tests | tests |
| P3 c3 tests | owner-microbench-and-trace | contract tests for C1 | same source as c2 | failure sets equal base (`correct-c3-plitejs-a1.log`, `correct-c3-platejs-a1.log`); both new tests fail on their planted defects (`mutate/`) | keep | writing passes |
| P1a c1 quick packet, probe v1 | owner-microbench-and-trace | C1 fix | batch-time failed, 10.02 against a limit of 9.92 ms at load 3.31; the c1 full v1 packet then passed every line (`probe-c1-quick-a1.log`, `probe-c1-full-a1.log`) | not run | superseded by passing packets; the v2 warm-up repair came after this miss and runs on both arms | probe v2 |
| P4 offsets matched run | owner-microbench-and-trace | is the incremental offset helper worth keeping | batch 5.17, 5.91, 9.00 vs 6.09, 6.08, 9.37 ms without it, gains of 0.92 (load 9.14, above the limit), 0.17 and 0.37 ms; typing not separable (`probe-keepcursor-*`); isolated root-row update 12.0 vs 26.9 us at 10,000 children and 108.5 vs 286.2 us at 100,000 (`index-update-micro-a1.log`) | not run | keep the helper on the isolated measurement | final bytes |
| P5 c5 final | owner-microbench-and-trace | C1 fix after lint and the comment pass | in the two packets under the load limit, typing 0.18 and 0.18 vs 1.90 and 1.90 ms and the batch 5.25 and 5.30 vs 62.6 and 76.6 ms at 10,000 blocks; 35 vs 10,040 elements frozen per keystroke in all five packets (`final-summary-a1.log`) | failure sets equal base; both mutations caught (`correct-final-*`, `mutate/*-a2.log`) | keep | lane 9 |
| P6 c5 stress | large-and-stress | does the fix hold past 10,000 blocks | typing 1.08 vs 31.9 ms, batch 41.5 vs 1,193 ms at 100,000 blocks, one run each (`probe-stress-final-a1.log`, `probe-stress-base-a1.log`) | output digests equal | keep | close |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| owner probe, typing, 10,000 blocks (ms), packets under the load limit | 2 packets x 300 per side | p50 1.90 and 1.90; p75, p95, p99 and max not reported here | p50 0.18 and 0.18 | -1.72 ms, -90% | interleaved at load 7.0 to 7.8, under the frozen limit of 9 | `artifacts/2026-10-11-plite-wide-children/probe-final2-base-p1-a1.log`, `probe-final2-candidate-p1-a1.log`, `probe-final2-base-p2-a1.log`, `probe-final2-candidate-p2-a1.log` |
| owner probe, 40-op batch, 10,000 blocks (ms), packets under the load limit | 2 packets x 30 per side | p50 62.6 and 76.6 | p50 5.25 and 5.30 | -64.3 ms, -92% | same packets | same logs |
| owner probe, all five packets, 10,000 blocks (ms), report-only | 5 packets per side | typing p50 median 2.18 (1.90 to 3.05); batch p50 median 76.6 (62.6 to 92.7) | typing p50 median 0.20 (0.18 to 0.26); batch p50 median 6.43 (5.25 to 9.19) | report-only | three packets ran at load 9.7 to 14, where the frozen rule calls timing inconclusive; work lines pass in all five | `artifacts/2026-10-11-plite-wide-children/final-summary-a1.log` |
| owner probe, typing, 100 blocks (ms) | 5 packets x 300 per side | p50 median 0.108 (0.096 to 0.161) | p50 median 0.095 (0.084 to 0.144) | no regression | ranges overlap | `artifacts/2026-10-11-plite-wide-children/final-summary-a1.log` |
| original spec, 40 ops at 1,000 lists (ms) | two interleaved runs per side, the spec's own sampling | 78.0 and 96.4 (84.2 in the original report) | 6.97 and 10.1 | about -79 ms, -90% | load 4.2 to 7.35, under the limit; an earlier candidate run at load 12.6 gave 6.98 | `artifacts/2026-10-11-plite-wide-children/spec-ops-lowload-base-p1-a1.log`, `spec-ops-lowload-candidate-p1-a1.log`, `spec-ops-lowload-base-p2-a1.log`, `spec-ops-lowload-candidate-p2-a1.log` |
| stress, typing, 100,000 blocks (ms) | one run x 300 per side | p50 31.9 | p50 1.08 | -30.8 ms, -97% | load 14.5 and 11.8, timing report-only; frozen elements per keystroke 100,040 vs 35 | `artifacts/2026-10-11-plite-wide-children/probe-stress-base-a1.log`, `probe-stress-final-a1.log` |
| stress, 40-op batch, 100,000 blocks (ms) | one run x 30 per side | p50 1,193 | p50 41.5 | -1,151 ms, -97% | same runs | `artifacts/2026-10-11-plite-wide-children/probe-stress-base-a1.log`, `probe-stress-final-a1.log` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | both work lines pass on c5 in five packets and all four lines in the two packets under the load limit; base fails every line (`artifacts/2026-10-11-plite-wide-children/final-summary-a1.log`, `probe-final2-candidate-p1-a1.log`) |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-11-plite-wide-children.md` at cause/resume checkpoints | run at the cause, rerun and close checkpoints, last with `--complete` |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | lanes 1, 4 and 9 complete, the rest N/A: only |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | `artifacts/2026-10-11-plite-wide-children/final-summary-a1.log`, `spec-ops-final-a1.log` |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | `artifacts/2026-10-11-plite-wide-children/correct-final-plitejs-a1.log`, `correct-final-platejs-a1.log` |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | the working tree matches c5 in every file this run owns (`git diff f9351af1df` on them is empty) |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | probe v2 warm-up repair; block counts read back; digests equal across arms; planted arm rejected (`artifacts/2026-10-11-plite-wide-children/probe-plant-final-a1.log`) |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | Cause History row C1-root-freeze |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | `artifacts/2026-10-11-plite-wide-children/types-final-plitejs-a1.log` |
| Browser surface proof | no | N/A: only - engine probe | N/A: only - engine probe |
| Changeset/release artifact | yes | Add only for published package behavior/API changes, otherwise N/A | `.changeset/plitejs-per-transaction-cost.md` amended with two bullets |
| Benchmark plan complete validation | yes | Run validator with `--complete` | `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-11-plite-wide-children.md --complete` |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-11-plite-wide-children.md` | `node .agents/pstack/plan-open.mjs docs/plans/2026-10-11-plite-wide-children.md` |

Verification evidence:
- Probe and red command: `artifacts/2026-10-11-plite-wide-children/final-summary-a1.log`, `probe-plant-final-a1.log`, `spec-ops-lowload-candidate-p1-a1.log`, `probe-stress-final-a1.log`, `index-update-micro-a1.log`.
- Correctness and types: `artifacts/2026-10-11-plite-wide-children/correct-final-plitejs-a1.log`, `correct-final-platejs-a1.log`, `types-final-plitejs-a1.log`, `mutate/drop-length-tripwire-a2.log`, `mutate/restore-root-freeze-a2.log`, `workcount-base-a1.log`.

## Close

**Reversal.** The ask said a single-node change must not cost O(top-level children). That requirement stays unmet. This fix removes every per-op freeze and frozenness check that grew with width, counted per op. Each op still copies the root array and its index row, which costs about 0.1 ms per op at 10,000 blocks and 1 ms at 100,000 in Bun. Building a flat array for each published version costs O(n). The design arena measured one Proxy facade that would avoid the copy at 1,120 us per 10,000-child read in JSC. No end-to-end comparison of a persistent root ran, so that measurement does not show a persistent design loses overall. Removing the copy is a runtime-architecture change, listed under Open work for the owner to open or drop.

**Changed contract.** The published top-level array is no longer frozen after an edit. A write that changes its length makes the next edit throw. A same-length write, such as an index assignment, a sort or a reverse, goes unnoticed and leaves snapshots and caches trusting a changed array. Two test assertions changed with that contract. `document-change.test.ts` now asks `isImmutable` instead of `Object.isFrozen` for an edited root. `snapshot-contract.ts` now asserts that a write into a published node throws, where it asserted that a push into the root throws. The owner can restore the old contract with the word refreeze, at the cost this run removed.

**What landed.** The owned-root design in 8 plitejs source files (Main changes), 2 new tests and 2 changed assertions in 3 test files, and two bullets in the unreleased `.changeset/plitejs-per-transaction-cost.md`. All of it is uncommitted on `next` for the owner to commit. The plan is `docs/plans/2026-10-11-plite-wide-children.md`, scoped to Plite text ops, with candidate `f9351af1df` (c5) measured against base `e965803ef8`. Lanes 1, 4 and 9 are complete. Lanes 2, 3, 5, 6, 7 and 8 are N/A because the request narrowed the run to the engine probe.

**Cause.** C1-root-freeze passed the Cause gate. The AI list run's CPU profile put 928 of 1,038 ms in `Object.freeze`. Removing only the root freeze in `replaceIndexedChildren` at base dropped elements frozen per keystroke from 10,040 to 40, and typing p50 at 10,000 blocks from 2.18 to 0.23 ms. The base's test failure set was recorded before any change. The fix class is internal-implementation. Benchmark owns the decision, and the lead implemented it in `packages/plitejs/src/core` with no public call shape change.

Proof, from each row's scope:

- Five interleaved packets per side ran the frozen budget (work and time per keystroke and per 40-op batch, 10,000 against 100 blocks). c5 passes both work lines in all five and base fails them. Only two packets per side ran under the budget's load limit of 9. In those two, c5 passes all four lines. Typing p50 at 10,000 blocks is 0.18 and 0.18 ms against 1.90 and 1.90 ms, and the batch 5.25 and 5.30 ms against 62.6 and 76.6 ms. The other three packets ran at load 9.7 to 14, so their times are report-only. Output digests match across arms.
- c5 plus the planted root freeze fails all four lines with the probe's own text.
- The original red spec, interleaved at load 4.2 to 7.35, costs 6.97 and 10.1 ms at 1,000 lists on c5 against 78.0 and 96.4 ms at base. The first report measured 84.2 ms.
- At 100,000 blocks, frozen elements per keystroke stay at 35. Typing is 1.08 ms against 31.9 ms, and the batch 41.5 ms against 1,193 ms. These are single runs at load 12 to 14, so the times are report-only.
- plitejs and platejs fail exactly the base's 14 and 1 tests at c5, and the two new tests pass. The work-count test fails on the original code (2,040 against 140 frozen elements) and with the root freeze restored. The tripwire test fails with its check removed. plitejs typecheck passes.
- The offset helper stays on an isolated measurement. Updating one root row takes 12.0 us with it and 26.9 us without it at 10,000 children, and 108.5 against 286.2 us at 100,000.

**Limits.** Every run used Bun. Safari uses the same JavaScriptCore engine, so the Safari claim is inferred, not measured. The run measured no browser typing. The work-count test counts `Object.freeze` only, so it cannot bound copies, offset scans or validation walks. Structural ops lose their root freeze too, in `spliceIndexedChildren`, but no probe in this run measured them. Another session's profile shows root-level splices still rebuild the whole root index, listed under Open work. At 100,000 blocks typing takes 1.08 ms against 0.088 ms at 100, which would fail the budget's own 2x law there. The budget only compared 10,000 with 100 blocks, so the remaining copy shows in report-only numbers. All proof ran on base plus this run's hunks (c5). The working tree also holds other sessions' uncommitted edits, among them a rewrite of `rememberValidatedDocumentRoots` built on this change, and this run did not test that combination.

**Packets.** The run kept 7 packets, P1 only as the step to P2. One c1 packet on probe v1 failed the batch-time line by 1% at load 3.31, and the next c1 packet passed every line. The probe's v2 warm-up repair came after that miss. It runs on both arms and leaves the budget unchanged. No packet was reverted, invalidated or quarantined. The stress probe is the frozen probe plus a 100,000-block cohort it reports outside the budget.

**Counts.** Of the 11 asks, 10 are done and 1 is partial, because a single-node change still costs one O(n) pointer copy. None is skipped, blocked or open. Open work lists six items, each with an owner and a stop.

### Attention

reviewed by gpt-6.1-sol @xhigh (Codex)

- The critical finding says an edited root is writable and a same-length write goes unnoticed. It is dismissed as the tradeoff of the option the owner named, registering the copy as trusted-immutable without freezing, because JavaScriptCore has no constant-time write barrier for a plain array. The Brief, Defaults and Changed contract say so, and refreeze restores the old contract.
- The two changed assertions are a changed contract, not updated expectations. Changed contract now says so.
- The size requirement was narrowed before the build. It now stays unmet, and the persistent root is open work.
- The Proxy measurement does not show that persistent designs lose overall. Reversal now says so.
- Freeze counts cannot bound total work. The claim now names per-op freezes and frozenness checks only.
- Three of the five final packets ran above the load limit. The timing claims now use the two packets under it, and the red spec reran at low load.
- The offset helper's gains were misstated. The log corrects them, and an isolated measurement now backs the helper.
- One failed c1 packet was missing from the trail. Packets now records it.
- The release note claimed Safari without a Safari run. It now says measured in Bun.
- Two nits are corrected in the log. The planted arm's limit is 151, not 51, and the inline-edit slip row cited the wrong transcript lines. The run made six inline text edits, five on run-directory or scratch files and one, through `sed -i`, on `packages/plitejs/src/core/change/tokens.ts`, whose result the comment review and every final check then covered.
- The side finding is that the opus architect runner wrote a plan file under `~/.claude/plans/` despite a read-only brief. That is expected, because `cross.mjs` runs Claude seats in plan mode. The file sits outside the repository, and nothing read it.
