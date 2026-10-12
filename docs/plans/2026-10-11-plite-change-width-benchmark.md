# Plite change application flat in root width

Status: executed: waiting on your commit; pastes and edits in unpublished changes still grow a little with document size, see Open work
Page: https://claude.ai/artifact/NtyaQX4VparxE1CB6K9BV1
Playbook: perf-issue

This run serves your request "Make Plite change application flat in root width", the open work the AI draft plan (`2026-10-11-ai-draft-projection-benchmark.md`) left under its Open work and its `fix-plite-walk` default. Applying a ready-made change or pasting a slice into a big Plite document cost time that grew with the number of top-level blocks. The per-op freeze of the top-level list belongs to the root-freeze plan (`2026-10-11-plite-wide-children.md`), which covers text ops. The list copy when a paste splices the top level stays open here, paused until that session's uncommitted work in `document-index.ts` lands.

## Brief

### What will change?

Applying a saved change to a big Plite document now costs about what typing does. At 10,000 blocks it takes 0.2 ms instead of 2 ms, and a paste takes 0.5 ms instead of 5 ms. Undo, redo and collaborator edits go through the same code. Undo and redo looked about 5 times faster, but the machine was busy, and nobody timed collaborator edits. Pastes still get a little slower as the document grows. So does every edit in a change that isn't published yet, typing included.

### What could go wrong?

A paste now checks where it can go without copying the document. It gives the old answer on 864 sample pastes and in all of Plite's tests. One case changed on purpose. Where building a filler block used to crash, the paste now tries another spot. No test reaches that case.

## Teach

Plite only trusts a document once it knows nothing in it can change. Each time a change or a paste landed, it proved that again by checking every block, even when only one or two blocks were new.

A paste also asked "can this go here?" by copying the whole list of top-level blocks with the paste dropped in, checking every block in the copy, and locking the copy. In Safari and Bun, locking a list of 10,000 blocks is slow.

Now Plite remembers the blocks it already checked, so a change checks only its new blocks and skips a document it already checked. The paste check reads the list where it is, with no copy. Pastes still get a little slower in bigger documents. They still read each top-level block once, and the engine still copies the list. That copy sits in code another session is changing, so it waits for that work.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The paste check's one read of every top-level block | Keep it, so pastes land exactly as before (look) | Skip it for documents already checked. Reading the code, that might move some pastes next to unknown blocks, but no run showed it | skip-validated-scan | small |
| What the speed check measures | Only what a change or paste costs beyond typing in the same document (look). I picked this after a first quick run showed the whole apply missing the target in unpublished changes, where typing itself also gets slower with size | Time the whole operation, typing included. Apply in unpublished changes then misses the target | whole-op-line | small |
| The copy of the top-level list when a paste splices it | Left open for now. Another session, the root-freeze one, is changing that file and hasn't committed yet. I told it about the cost, and it hasn't said it will take it (look) | Fix it here once that session's work lands | take-root-freeze | small |
| A paste that would need a filler block the editor can't make | The paste skips that spot and tries the next one; no test or sample paste reaches this case (look) | The paste fails with an error, as before | boundary-throws | detail |

## Main changes

- `editor-schema.ts` keeps a module-wide set of nodes already proven deep-frozen, and `isDeepFrozenNode` moves to module scope beside it. `rememberValidatedDocumentRoots` skips a root the schema already validated under the current authority, and otherwise walks only nodes outside that set. A frozen node cannot change, so the set never goes stale.
- The slice fitter's `canInsertContentAtBoundary` asks `acceptsReplacement` whether the parent's content program accepts the spliced children as they are: the prefix slots, the remainder's min and max, the whole max, and every child's kind. It reads the parent and the inserted content in place, with no spliced copy, no refit through `fitDirectContent` and no freeze. The old refit answered the same except when building a default the schema cannot create threw; that case now refuses the boundary instead.
- `allContentAllowed` takes an optional index range and keys its per-kind cache by element type, with `null` for text, instead of building a string per child. The boundary check reads three ranges with it: the parent before the replaced range, the inserted content and the parent after it.
- Two tests under "required document prefix" in `slice-fit-contract.test.ts` pin the two fallback cases no existing test covered: a closed paragraph replacing the title's text keeps the title, and a closed paragraph replacing the blocks after a title stays its own block when the body needs one.

## Benchmark Source

- request: "Do this task here: “Make Plite change application flat in root width”", the task whose brief reads: remove Plite's whole-document costs in change application (the `rememberValidatedDocumentRoots` deep-frozen walk in `editor-schema.ts`, the slice fitter, the per-op top-level array copy in `document-index.ts`; the per-op `Object.freeze` is tracked separately), reuse the AI probe, check other callers (history undo and redo, Yjs), and prove with Plite's own tests and benchmark lanes
- scope: Plite `tx.changes.apply` and `tx.slice.replace` per op, in `packages/plitejs/src/core/editor-schema.ts` and `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts`
- invocation: `$benchmark only plite change application width`
- candidate-identity: commit: `5ec487b592ff9203baa1978eb02982634a0e16f5` (the baseline commit plus `artifacts/2026-10-11-plite-change-width-benchmark/candidate-a4.patch`, frozen from a clean worktree). At 19:38Z the live files hash-matched it. At 20:06Z `editor-schema.ts` still does, and `compiled-slice-fitter.ts` and `slice-fit-contract.test.ts` also hold another session's uncommitted parent-maximum work at other lines, with this run's hunks unchanged. Earlier candidates: `fe859193` (`candidate.patch`) and `df2a8408` (with the two tests)
- plate-main-identity: N/A: the request compares Plite change application before and after this fix on one tree, not against `origin/main`
- plite-identity: commit: `2e5360f32c6642649def80994c65ac772f7d6abd` (a `freeze.mjs` commit of HEAD `5fc246c291` plus the checkout's uncommitted `packages/plitejs` and `packages/platejs` work at the first edit, other sessions' work included)
- slate-identity: N/A: Slate has no schema-validated change application or slice fitter
- named-symptom: at 10,000 top-level paragraphs, one `tx.changes.apply` costs 1.8 ms and one `tx.slice.replace` 4.6 ms in an update, against 0.2 and 0.5 ms at 100 (`artifacts/2026-10-11-plite-change-width-benchmark/perf/quick-base2-a1.log`)
- final-artifacts: artifact: `docs/plans/artifacts/2026-10-11-plite-change-width-benchmark/perf/final2-stats.json`, from `perf/final2-base-r1.json` to `perf/final2-cand-r3.json`

Boundaries:
- allowed runtime/packages/apps: `packages/plitejs/src/core/editor-schema.ts`, `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts`
- allowed benchmark/tests/fixtures: the probe, its instrumentation and controls in this run's directory; plitejs tests only where a contract changes
- allowed baseline checkouts/hosts: detached worktrees from `tooling/scripts/proof-worktree.mjs` at the baseline commit, the candidate as that commit plus `candidate.patch`, on this host
- non-goals: the per-op freeze of the top-level list and the text-op path (root-freeze plan); the list copy on a slice's root splice, paused while that session edits `document-index.ts` (Open work); `DocumentChange.apply`'s freeze memo (not on this path in the profile); Plate plugin costs; browser typing latency

## Interaction Coverage

- first-interaction: N/A: an engine probe drives the transaction API directly; no browser route or first paint
- settled-interaction: N/A: the probe times 40 ops per row after 5 warmup ops on the same editor, which is the settled state of the same API
- route-scope: N/A: no route; the engine API is the owner
- reporter-profile: N/A: the finding came from a measured probe, not a reporter

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | `5ec487b5` (`2e5360f3` plus `candidate-a4.patch`) | `2e5360f3` | artifact: docs/plans/artifacts/2026-10-11-plite-change-width-benchmark/perf/final2-stats.json, whose source JSONs carry `env.sha` |
| lockfile / package manager | the checkout's linked `node_modules`, pnpm lockfile at `5fc246c291` | same links | artifact: docs/plans/artifacts/2026-10-11-plite-change-width-benchmark/perf/final2-cand-r1-a1.log and perf/final2-base-r1-a1.log, both run in `proof-worktree.mjs` worktrees with linked `node_modules` |
| build mode / host / port | Bun 1.3.12 source run, no build; Darwin, 18 cores | same | artifact: docs/plans/artifacts/2026-10-11-plite-change-width-benchmark/perf/final2-cand-r1.json and perf/final2-base-r1.json `env` blocks |
| browser / machine / viewport / DPR | no browser; headless Bun on this Darwin host, 18 cores | same | artifact: docs/plans/artifacts/2026-10-11-plite-change-width-benchmark/perf/final2-cand-r1-load.txt and the other round load files |
| route / fixture / document / plugins | `createEditor({ initialValue })`, N paragraphs of `row-i row-i row-i`, no plugins, N = 100, 1,000, 10,000 | same | artifact: docs/plans/artifacts/2026-10-11-plite-change-width-benchmark/perf/width-probe.spec.ts |
| setup / action / DOM strategy | per op: a text insert (control), a `tx.changes.apply` of a prebuilt insert, a `tx.slice.replace` of the middle block's first character; each as an update and as an unpublished spec | same | artifact: docs/plans/artifacts/2026-10-11-plite-change-width-benchmark/perf/width-probe.spec.ts |
| warmups / samples / interleave order | 5 warmup and 40 timed ops per row; base, candidate, base, candidate, base, candidate | same | artifact: docs/plans/artifacts/2026-10-11-plite-change-width-benchmark/perf/final2.sh |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Benchmark Source request |
| `benchmark` source and methodology read | yes | skill and `references/methodology.md` reread after the compaction, before this plan |
| Existing plan reused | yes | no active plan covers change application; the root-freeze plan scopes the text-op copy and freeze, and its lead confirmed the walk is not in it |
| Candidate and baseline identities recorded | yes | Benchmark Source |
| Target/runner discovery completed from current source | yes | no existing target times `changes.apply` or `slice.replace` across widths; this probe extends the AI probe's method |
| Host/build/fixture freshness proved | yes | each probe run fails unless every workspace file loads from its own worktree (`foreign` empty) |
| Correctness oracle identified | yes | `turbo run test --filter=plitejs --continue` and `--filter=platejs`, base results recorded; each probe row asserts the edited text |
| All default lanes inventoried | yes | Benchmark Lane Table |
| `only` narrowing explicitly authorized or N/A | yes | the request names the owner and its proof: Plite's tests and benchmark lanes for change application |
| Browser/native proof strategy selected | yes | N/A: engine internals with no browser surface; see Interaction Coverage |

## Frozen lines

Frozen in the decision log before the full candidate run. `perf/width-probe.spec.ts` asserts each one itself, after writing every row to its JSON.

1. `walk` requires that one `tx.changes.apply` or `tx.slice.replace` inspects at most 50 more nodes for deep frozenness at 10,000 blocks than at 100, in update and spec mode.
2. `copy` requires that one `tx.slice.replace` copies at most 50 more children into a spliced array at 10,000 blocks than at 100, in update and spec mode.
3. `flat` requires that the p50 of one `tx.changes.apply` or `tx.slice.replace`, minus the p50 of one text insert in the same mode and width, is at 10,000 blocks at most twice its 100-block value plus 0.1 ms.

Under the noise rule, `flat` counts only when the host's one-minute load average is at most 9, half its 18 cores, at the start and end of the run; otherwise it is inconclusive and the claim narrows to `walk` and `copy`. As known-bad inputs, the baseline must fail `walk` and `copy` with the probe's own assertion text, and the candidate with a planted per-block slowdown must fail `flat`.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | baseline `2e5360f3` and final `5ec487b5` commits; every probe run loads only its own worktree's files (`foreign` empty in each JSON) | none |
| 2 | current-vs-main-product-smoke | no | N/A: only - explicitly narrowed to Plite change application | the request names the owner | none |
| 3 | plate-vs-plite-decomposition | no | N/A: only - explicitly narrowed; the cost is already isolated in Plite by the AI draft profile | `artifacts/2026-10-11-ai-draft-projection-benchmark/cpu/cand-cpu-a1.log` | none |
| 4 | owner-microbench-and-trace | yes | complete | C1 and C2 kept (`perf/final2-cand-r1-a1.log` to `perf/final2-cand-r3-a1.log`); C3 attributed by `cpu/cpuprofile-diff.mjs` over `cpu/w100` and `cpu/w10k` and deferred | none |
| 5 | product-mount-matrix | no | N/A: only - explicitly narrowed; mount does not apply changes | the request names the owner | none |
| 6 | trusted-editing-matrix | no | N/A: only - explicitly narrowed; the probe drives the transaction API, not keyboard input | the request names the owner | none |
| 7 | plite-vs-pinned-slate | no | N/A: only - explicitly narrowed; Slate has no schema-validated change application | the request names the owner | none |
| 8 | example-breadth | no | N/A: only - explicitly narrowed to the engine probe | the request names the owner | none |
| 9 | large-and-stress | yes | complete | the 1,000 and 10,000 block cohorts of the same probe, history undo and redo at 10,000 blocks (`perf/history-a1.txt`) and the AI draft probe at 0, 100 and 1,000 other lists (`ai/`) | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause open
- lane: N/A: no cause open
- comparable-baseline: N/A: no cause open
- material-delta: N/A: no cause open
- isolated-owner: N/A: no cause open
- causal-intervention: N/A: no cause open
- correctness-guard-result: N/A: no cause open
- fix-class: N/A: no cause open
- long-term-target: N/A: no cause open
- decision-owner: N/A: no cause open
- layer-plan: N/A: no cause open
- compatibility-verdict: N/A: no cause open
- fix-owner: N/A: no cause open
- benchmark-command: N/A: no cause open
- benchmark-rerun: N/A: no cause open
- benchmark-rerun-result: N/A: no cause open
- correctness-command: N/A: no cause open
- correctness-rerun: N/A: no cause open
- correctness-rerun-result: N/A: no cause open
- resume-lane: N/A: no cause open

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| C1-validation-walk | owner-microbench-and-trace | kept | internal-implementation | adopting a document as a validated baseline checks only the nodes the change built, and skips a root already validated | benchmark | N/A: Plite internals, no layer moves | N/A: no public API or data change | plitejs `core/editor-schema.ts` `rememberValidatedDocumentRoots` and `isDeepFrozenNode` | nodes the walk inspects per apply and per slice fall from 2 x width to 0 and 2 at every width; update apply p50 at 10,000 blocks falls from 1.98 to 0.21 ms | pass: `build/base2-plitejs-test.log`, `build/base2-platejs-test.log` | `perf/run.sh <name> <worktree> walk,copy,flat` (probe `perf/width-probe.spec.ts` under `perf/instrument.mjs`) | pass: walk holds in every final round and flat holds for apply in update and spec mode (`perf/final2-cand-r1-a1.log` to `perf/final2-cand-r3-a1.log`) | `TURBO_FORCE=true pnpm turbo run test --filter=plitejs --continue` and `--filter=platejs`, through `build/run-tests.sh` | pass: `build/final-a1-plitejs-test.log`, `build/final-a1-platejs-test.log` | `perf/final2-stats.json`; decision log verify rows |
| C2-slice-boundary-copy | owner-microbench-and-trace | kept | internal-implementation | a slice's boundary check answers from the parent and the inserted content in place, with no spliced copy, refit or freeze | benchmark | N/A: Plite internals, no layer moves | N/A: no public API or data change | plitejs `core/slice-fit/compiled-slice-fitter.ts` `canInsertContentAtBoundary` and `acceptsReplacement` | children copied per slice fall from 10,000 to 0 at 10,000 blocks; update slice p50 falls from 4.99 to 0.53 ms; the 864-case corpus output is byte-identical | pass: `build/base2-plitejs-test.log`, `how/boundary-diff-base2-a1.txt` | `perf/run.sh <name> <worktree> walk,copy,flat` | pass: copy holds in every final round; flat misses for slice on C3's residual (`perf/final2-cand-r3-a1.log`) | `TURBO_FORCE=true pnpm turbo run test --filter=plitejs --continue` and `--filter=platejs` | pass: `build/final-a1-plitejs-test.log`, `build/cand-a4-plitejs-bun.log`, `mutate/run-final-a1.txt` | `how/boundary-diff-cand-a4.txt`; `mutate/spec-final.json` |
| C3-root-splice-width | owner-microbench-and-trace | deferred | internal-implementation | a root-level splice costs the nodes it replaces, not the root's width | benchmark | N/A: Plite internals, no layer moves | N/A: no public API or data change | plitejs `core/change/document-index.ts` `spliceIndexedChildren` and `core/resolved-token-cursor.ts` `createTreeIndexChildren`, files the root-freeze session is editing; paused until that work lands | a profile diff of spec slices at 10,000 against 100 blocks puts about 256 of 580 us of growth per op in the root splice, about 140 in the boundary read and about 60 in memo lookups, under the profiler | pass: `build/final-a1-plitejs-test.log` | `perf/run.sh <name> <worktree> walk,copy,flat` | fail: flat misses for slice by 0.26 to 0.41 ms at 10,000 blocks (`perf/final2-cand-r3-a1.log`) | `TURBO_FORCE=true pnpm turbo run test --filter=plitejs --continue` | N/A: no change made here | `cpu/cpuprofile-diff.mjs`; `cpu/cand-spec-w10k-a1.log` |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| P1 | owner-microbench-and-trace | C1: memoize deep-frozen nodes and skip roots already validated | update apply p50 at 10,000 blocks: 0.21 / 1.98 ms | plitejs and platejs suites match the baseline | keep | none |
| P2 | owner-microbench-and-trace | C2: answer the boundary check in place, with a copy-and-refit fallback for created content | update slice p50 at 10,000 blocks: 0.57 / 4.59 ms (one quick pass) | suites match the baseline; corpus identical | keep, reshaped as P4 | none |
| P3 | owner-microbench-and-trace | C2 control: skip the read of existing children | 0.01 to 0.08 ms per update slice and 0.18 to 0.56 ms per spec slice at load 13 | not a candidate; from source, it could change where slices land under derived schemas, not reproduced | defer | Defaults word skip-validated-scan |
| P4 | owner-microbench-and-trace | C2: read three array ranges, return a boolean, drop the fallback | update slice p50 at 10,000 blocks: 0.53 / 4.99 ms over 120 samples | corpus identical; plitejs bun suite 3,423 pass; three mutants caught | keep | none |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| update apply, 10,000 blocks | 120 / 120 | 1.984/2.120/2.704/12.002/16.597 ms | 0.211/0.225/0.373/1.940/7.712 ms | -1.773 ms / -89% | three interleaved rounds, load 7.8 to 8.4 on 18 cores; tails hold GC pauses | `perf/final2-stats.json` |
| spec apply, 10,000 blocks | 120 / 120 | 2.063/2.186/2.513/10.151/13.540 ms | 0.344/0.389/0.568/2.670/10.766 ms | -1.719 ms / -83% | same | same |
| update slice, 10,000 blocks | 120 / 120 | 4.991/5.471/9.498/24.430/24.907 ms | 0.528/0.578/0.750/0.952/1.153 ms | -4.463 ms / -89% | same | same |
| spec slice, 10,000 blocks | 120 / 120 | 5.257/5.791/7.263/26.522/28.031 ms | 0.725/0.811/0.951/2.167/19.847 ms | -4.533 ms / -86% | same | same |
| update apply, 1,000 blocks | 120 / 120 | 0.300/0.314/0.391/0.672/0.744 ms | 0.115/0.123/0.134/0.149/0.159 ms | -0.185 ms / -62% | same | same |
| update slice, 1,000 blocks | 120 / 120 | 0.598/0.645/0.869/3.865/4.217 ms | 0.264/0.297/0.347/0.395/0.428 ms | -0.333 ms / -56% | same | same |
| update apply, 100 blocks | 120 / 120 | 0.170/0.188/0.317/3.394/3.426 ms | 0.136/0.145/0.178/0.390/2.409 ms | -0.034 ms / -20% | same | same |
| update slice, 100 blocks | 120 / 120 | 0.385/0.506/0.709/0.865/1.005 ms | 0.328/0.408/0.582/0.870/1.016 ms | -0.058 ms / -15% | same | same |
| update text insert (control), 10,000 blocks | 120 / 120 | 0.232/0.251/0.289/0.372/0.466 ms | 0.245/0.266/0.913/4.938/5.148 ms | +0.012 ms / +5% | p50 within noise; the control path is unchanged | same |
| history undo, 10,000 blocks | 40 / 40 per round, 2 rounds | 1.705 and 1.752 ms p50 | 0.290 and 0.347 ms p50 | about -1.4 ms / -82% | load 9.8 to 10.4: inconclusive by the noise rule | `perf/history-a1.txt` |
| AI later chunk, one edit, 1,000 other lists, list | 20 / 20 | 20.1/22.4/24.6/-/26.1 ms (draft 8.2) | 8.1/8.5/46.8/-/84.7 ms (draft 2.2) | -12.0 ms / -60% (draft -73%) | round 2 at load 5.4 to 8.5; p99 omitted at 20 samples | `ai/ai-base-r2.json`, `ai/ai-final-r2.json` |
| AI later chunk, one edit, 1,000 other lists, paragraph | 20 / 20 | 19.8/22.5/29.2/-/119.1 ms (draft 8.9) | 7.5/7.9/8.6/-/55.4 ms (draft 2.1) | -12.3 ms / -62% (draft -77%) | same | same |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | walk and copy pass in every final round; flat passes for apply and fails for slice (`perf/final2-cand-r1-a1.log` to `perf/final2-cand-r3-a1.log`); correctness reruns pass (`build/final-a1-plitejs-test.log`) |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-11-plite-change-width-benchmark.md` at cause/resume checkpoints | `build/validate-plan-a2.log` |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Benchmark Lane Table |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | `perf/final2-base-r1-a1.log` to `perf/final2-cand-r3-a1.log` at `5ec487b5` against `2e5360f3` |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | `build/final-a1-plitejs-test.log`, `build/final-a1-platejs-test.log`, `build/cand-a4-plitejs-bun.log`, `mutate/run-final-a1.txt`, `how/boundary-diff-cand-a4.txt` |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | `env.sha` is `5ec487b5` in the candidate JSONs and `2e5360f3` in the base JSONs; the live files hash-matched `5ec487b5` at 19:38Z (`build/lint-task-a1.log` row); at 20:06Z only `editor-schema.ts` still does, and the other two files add another session's work outside this run's hunks (decision log trail rows) |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | the baseline fails walk and copy with the probe's own text in every round; the planted control fails flat on all four rows (`perf/final2-plant-a1.log`); `perf/stats.mjs` pools the raw samples |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | Cause History C1, C2 and C3 |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | `build/cand-a4-typecheck.log`, `build/lint-task-a1.log` |
| Browser surface proof | no | N/A: engine internals with no browser surface | N/A: headless engine probe |
| Changeset/release artifact | yes | Add only for published package behavior/API changes, otherwise N/A | `.changeset/plite-change-width-speed.md` |
| Benchmark plan complete validation | yes | Run validator with `--complete` | `build/validate-plan-complete-a2.log` |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-11-plite-change-width-benchmark.md` | `build/plan-open-a2.log` |

Verification evidence:
- plitejs and platejs test tasks at `5ec487b5`: plitejs 21 of 21; platejs 135 of 137, the same `migrateListIdentity` 5 s timeout as at `2e5360f3` (`build/final-a1-plitejs-test.log`, `build/final-a1-platejs-test.log`, `build/base2-platejs-test.log`).
- The full plitejs bun suite without React at `5ec487b5`: 3,423 pass (`build/cand-a4-plitejs-bun.log`).
- 864 slice replaces on prefix, max, min and plain schemas give byte-identical output at `2e5360f3` and `5ec487b5` (`how/boundary-diff-base2-a1.txt`, `how/boundary-diff-cand-a4.txt`).
- Final probe reruns at load 7.8 to 8.4: `perf/final2-base-r1-a1.log` to `perf/final2-cand-r3-a1.log`, pooled in `perf/final2-stats.json`.

## Close

The reversal comes first. The frozen `flat` line fails for `tx.slice.replace`, so "flat in root width" holds for applying a change and not for a slice. Even for apply, the line measures cost above a text insert in the same mode. The whole apply in an unpublished change still grows from 0.09 to 0.34 ms between 100 and 10,000 blocks, because the text insert grows the same way, from 0.12 to 0.36 ms. The line stays as frozen. The claim narrows to what the work counts and apply's cost above typing prove, and both residuals move to Open work.

The deviations follow. A 10-op sizing pass of the candidate ran before the `copy` and `flat` lines were frozen. The lead chose `flat`'s form, cost above the text insert, after that pass showed the whole spec apply missing its limit, 0.374 against 0.336 ms. So `flat` is not a budget frozen before the lead read the candidate; the root-freeze plan supplied only its twice-plus-0.1 ms arithmetic. The per-op top-level array copy the task named stays open. The root-freeze session edits `document-index.ts`, its plan covers text ops only, and its work there is uncommitted, so that part is paused until it lands. That session got the profile and has not said it will take the cost. This run kept no todo list until the close, which rebuilt it in `todo.md`. `deslop` ran after the comment review instead of before it; its one edit touched no comment line.

What landed, uncommitted on `next`:

- `editor-schema.ts` remembers nodes already proven deep-frozen and skips a root the schema already validated, so adopting a document after a change no longer walks every node.
- `compiled-slice-fitter.ts` answers the slice boundary check in place through `acceptsReplacement`, with no spliced copy, refit or freeze of the parent.
- `slice-fit-contract.test.ts` gains two tests for the prefix and minimum cases that no existing test covered.
- `.changeset/plite-change-width-speed.md` records the speedup for `plitejs`.

Proof and its limits:

- Over three interleaved rounds per side at `5ec487b5` against `2e5360f3`, the deep-frozen walk inspects 0 nodes per apply and 2 per slice at 100, 1,000 and 10,000 blocks, against 2 x width on the baseline, and the boundary check copies no children, against 10,000 at 10,000 blocks. The baseline fails both lines with the probe's own text in every round.
- Timing ran at load 7.8 to 8.4 with 120 pooled samples per row. At 10,000 blocks, update apply p50 falls from 1.98 to 0.21 ms, spec apply from 2.06 to 0.34 ms, update slice from 4.99 to 0.53 ms and spec slice from 5.26 to 0.73 ms. The text-op control is unchanged. `flat` holds for apply in both modes. Slice still grows 0.26 to 0.41 ms from 100 to 10,000 blocks above the text control. A profile puts about half of that in the root splice in `document-index.ts` and the rest in the boundary read and the memo lookups. A planted per-block slowdown fails `flat` on every row.
- History undo at 10,000 blocks falls from about 1.7 to 0.3 ms and redo from 1.7 to 0.24 ms, at load 9.8 to 10.4, so that timing is inconclusive. Yjs remote edits go through the same `tx.changes.apply` path; that is inferred from source, not timed.
- The reused AI draft probe passes the AI plan's frozen `flat` line on the final tree in both rounds and fails it on the baseline in both. That line failed at the AI plan's close. A later AI chunk with one edit at 1,000 other lists drops from 20 to 8 ms, its draft from 8.2 to 2.2 ms.
- plitejs passes 21 of 21 test tasks and platejs 135 of 137 at both trees, with the same `migrateListIdentity` timeout failing at each. The full plitejs bun suite passes 3,423 tests. 864 slice replaces on prefix, max, min and plain schemas give byte-identical output on both trees: 767 replacements, 59 refusals and 38 errors each. Mutating the prefix check fails the title test with an `EditorSchemaValidationError`, mutating the minimum check fails its document assertion, and skipping the inserted-content check fails 8 tests. The plitejs typecheck and `lint:task` pass.
- The boundary check now refuses a placement where the old refit threw while building a default the schema cannot create. That difference is on purpose, and no test or corpus case reaches it, so the old-answer claim holds for the cases exercised. The Defaults row `boundary-throws` restores the throw.

Of 20 asks and gates, listed in `artifacts/2026-10-11-plite-change-width-benchmark/todo.md`, 16 are done, 1 is partial, 1 is open, 2 are skipped and 0 are blocked. The partial one is flat in root width, which holds for apply above typing only. The open one is the top-level array copy, paused until the root-freeze work lands. The skipped ones are a panel, since no review row applies and no signature another file calls changed, and reflect, since this was not an Autonomous run playbook run and the user corrected no workflow.

### Attention

Reviewed by gpt-6.1-sol @xhigh (Codex), a decision-trail review of this log against the session transcript. It raised no critical finding, eight warnings and two nits, and this Close applies all of them.

- The `flat` claim hid the whole apply's growth in unpublished changes. The reversal above now states it.
- The lead picked `flat`'s subtraction form after a sizing run showed a miss. The deviations above now say so.
- The plan called the top-level array copy the root-freeze plan's, but that plan covers text ops only and never took it. It is now open and paused.
- The Brief and the changeset claimed faster undo, redo and collaborator edits. The Brief now labels them, and the changeset names only change application and slice replaces.
- The plan called the `boundary-throws` change safe and rare without a reproduction. It is now a `look` default with no "rare".
- The live-bytes claim was stale. The identity rows now carry both timestamps.
- `skip-validated-scan` stated an argued effect as shown. It now says the effect is inferred from source.
- The 13-item count had no list. The count now cites `todo.md`.
- The log misstated how two mutants failed. The proof bullet now gives each mutant's real failure.
- `perf/run.sh` assigned zsh's read-only `status`, so its closing load line never printed. The runner now uses `code` (`perf/run.a1.sh` keeps the old one); each probe JSON already records its end load.

## Open work

- A Plite slice replace still grows about 0.3 ms from 100 to 10,000 top-level blocks. Most of it is the root splice in `document-index.ts`, where `spliceIndexedChildren` copies the root array and rebuilds its tree index. The rest is the boundary check's one read of the parent's children and the memo lookups. This is the top-level array copy the task named, paused because the root-freeze session's work in `document-index.ts` is uncommitted. That session got the profile and has not said it will take the cost. owner: zbeyens. stop: the root-freeze work in `document-index.ts` lands, then rerun `perf/run.sh` with `walk,copy,flat`, or 2026-12-31.
- Every op in an unpublished change, a text insert included, still grows from about 0.12 to 0.36 ms between 100 and 10,000 top-level blocks, so a whole apply there grows too, from 0.09 to 0.34 ms. This run's lines subtract that cost and did not trace it. owner: zbeyens. stop: the root-freeze plan (`2026-10-11-plite-wide-children.md`) lands, then the same probe rerun shows whether it remains, or 2026-12-31.

