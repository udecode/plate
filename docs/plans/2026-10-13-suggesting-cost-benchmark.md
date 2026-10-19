# Suggesting typing cost after the cut

Status: done: every applicable lane closed; three causes pivoted to docs/plans/2026-10-13-review-tree-pivot.md, two gaps in the parent plan's Open work
Parent: [Suggestions: cut over now, docs page first](2026-10-12-suggestions-complete.md), its P2.2 Open work row on Suggesting cost

## Brief

### What did you find?

The run found and fixed six costs. The command projection composed its change one run at a time, every key remapped the frame's node index through the whole document, card reads hashed one long string per change, and every edit kept all earlier snapshots in memory, so 10,000 suggestions ran out of memory. Previews also reminted every node key on each commit. In the browser, each Suggesting key rebuilt the command frame's seed over every block with a pending change, which made the 1,000-block typing cohort about 2.5 times slower than before the cut.

### What will change?

Typing a suggestion now paints as fast as before the cut. The normal browser cohort is faster, the 1,000-block cohort's paint p95 is level though its DOM update is 2.6 ms slower, and the scale cohorts are at or below pre-cut. Memory no longer grows with every edit. Three costs need a new design, so they moved to the review-tree pivot plan: card reads rebuild a change index over the whole document, stacked edits on one leaf carry every earlier mark, and previews re-project the whole document on each commit.

### What do you need from me?

Nothing. Each fix stays inside the review-tree and core runtime code and keeps its outputs.

### What happens if I say go?

Nothing more runs here. The pivot plan builds next and reruns each of the three costs against its frozen budget. The run committed nothing.

### What could go wrong?

A cached projection could serve a stale preview. The preview now applies each commit's change to its last document, and the key and work tests, the authored suites and the page spec pass on it.

## Benchmark Source

- request: the owner's "fully complete suggestions", via P2.2's Open work row "Suggesting typing misses the frozen budgets the migrated benchmarks hold" in docs/plans/2026-10-12-suggestions-complete.md
- scope: Suggesting typing, stacked suggestions, preview reads and collaboration receive on the review tree in plitejs authored and its Plate facade
- invocation: $benchmark Suggesting typing cost after the suggestions cutover
- candidate-identity: fingerprint: base commit 6fa1169c5e723eb3e058697189cdcad85be220f9 plus this checkout's uncommitted tree, hashed per file in each target artifact's sourceBefore and sourceAfter
- plate-main-identity: commit: 7801a8097d9ff72fcc03d250990f777a8faab6dd (origin/main)
- plite-identity: fingerprint: the candidate's packages/plitejs source through config/plite-source-aliases.ts, hashed in each artifact
- slate-identity: N/A: Slate has no review marks or suggestions, so no Plite versus Slate row exists for this scope
- named-symptom: plite-authored-scale p95 normal 9.6 ms, fanout 36.9 ms, large 29.6 ms, overlap 4752 ms, stress out of memory; plite-authored-collaboration receive 4 to 9 times its limit (docs/plans/artifacts/2026-10-12-suggestions-complete/p22e/bench-migrate/logs)
- final-artifacts: artifact: docs/plans/artifacts/2026-10-13-suggesting-cost-benchmark/
- inherited-budget: 2026-10-12-keys-proposed-lines.md M2 lines A to D
- inherited-budget-result: fail: today's tree fails line D on four Suggesting select-all-delete cells, and two 20,000-block cells are too slow to count (docs/plans/artifacts/2026-10-13-review-tree-pivot/m2/judge-ctl-count-3-a2.log); causes deferred-change-index, deferred-preview

Boundaries:
- allowed runtime/packages/apps: packages/plitejs/src/authored, packages/plitejs/src/core where the authored frame calls it, packages/platejs suggestion facade, the raw Plite authored-changes example
- allowed benchmark/tests/fixtures: benchmarks/editor/benchmarks/plite-authored-*.ts, their contracts, run-directory probes under docs/plans/artifacts/2026-10-13-suggesting-cost-benchmark/
- allowed baseline checkouts/hosts: /Users/zbeyens/git/plate-2-head and /Users/zbeyens/git/plate-2-typing-head at 6fa1169c5e (pre-cut), the 3297 www dev server for browser lanes
- non-goals: the review-tree semantics, accept and reject rules, and the old suggestions model on main

## Interaction Coverage

- first-interaction: pass: plite-authored-typing times the first measured key after 20 warmups in the Suggest view, with exact model, DOM and selection checks on every key (typing-cand-a4.json to typing-cand-a6.json)
- settled-interaction: pass: 100 measured keys per pass to the paint boundary two frames later, 9 passes per side over 3 alternating runs (typing-final-aggregate.tsv)
- route-scope: pass: /examples/plite/authored-changes with two mounted shared views and the independent editor for typing and mounted lanes, /docs/suggestion for lane 2 timing and the P2.3 page spec
- reporter-profile: N/A: no reporter profile; the symptom came from the migrated benchmarks, not a user session

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | 6fa1169c5e plus uncommitted tree, per-file sha256 in each artifact | 6fa1169c5e clean in plate-2-head and plate-2-typing-head | artifact: sourceBefore and sourceAfter in typing-cand-a6.json and typing-head-a3.json; typing-head-worktree.log reports the base clean |
| lockfile / package manager | pnpm-lock.yaml of this checkout, bun 1.3.12 | same lockfile at 6fa1169c5e installed offline, bun 1.3.12 | artifact: typing-head-worktree.log |
| build mode / host / port | scale and collaboration from source through config/plite-source-aliases.ts; browser lanes from each tree's production static export | same per tree; lane 2 on next dev servers 3297 and 3399 for both sides | artifact: build fingerprints in each typing and mounted artifact; docs-typing-a1.json |
| browser / machine / viewport / DPR | Chromium 149.0.7827.55, macOS arm64, 18 cores, default viewport | same | artifact: browser and environment fields in each artifact |
| route / fixture / document / plugins | the targets' frozen contracts: BaseParagraphPlugin plus authored, cohorts zero, normal, large, stress, fanout, overlap; typing normal 100 and large 1,000 blocks each with a pending deletion | same contracts | artifact: contractSha256 equal per lane on both sides |
| setup / action / DOM strategy | model updates through a propose view for scale; trusted Playwright keys for typing, mounted and lane 2 | same | artifact: harness/interleave.sh, harness/final-browser.sh, harness/docs-typing.mjs |
| warmups / samples / interleave order | contract: 20 warmups, 100 samples, 3 passes; base and candidate alternate per run | same | artifact: final-browser-a1.log, post-a1.log |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Benchmark Source request and named-symptom |
| `benchmark` source and methodology read | yes | read in full 2026-10-13 before this plan |
| Existing plan reused | yes | no Benchmark plan for this scope existed; the parent plan's Open work row points here |
| Candidate and baseline identities recorded | yes | Benchmark Source and Comparison Signature |
| Target/runner discovery completed from current source | yes | benchmarks/targets/slate-v2.json: plite-authored-scale, plite-authored-collaboration, plite-authored-typing, plite-authored-mounted, plate-authored-construction |
| Host/build/fixture freshness proved | yes | each browser run rebuilt its tree's export and recorded its fingerprint; scale runs hash their sources |
| Correctness oracle identified | yes | the targets' own asserts, packages/plitejs authored suites, the laws, apps/www suggestion-page.spec.ts |
| All default lanes inventoried | yes | Benchmark Lane Table |
| `only` narrowing explicitly authorized or N/A | yes | N/A: not narrowed |
| Browser/native proof strategy selected | yes | lane 6 trusted typing through plite-authored-typing and the www page spec |
## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | both trees fingerprinted in every artifact; base worktrees clean at 6fa1169c5e (typing-head-worktree.log) | closed |
| 2 | current-vs-main-product-smoke | yes | complete | /docs/suggestion main demo, 3 alternating rounds of 60 keys on dev servers: p50 16.2 against 15.0 ms and p95 16.5 against 16.3 ms, both bound by the frame; p99 16.8 to 17.2 against 26 to 28 ms (docs-typing-a1.json) | closed |
| 3 | plate-vs-plite-decomposition | yes | complete | zero cohort isolates the authored plugin through the Plate facade, p95 0.84 against 1.31 ms pre-cut (main-post-aggregate.tsv); mem-bisect separates plain, Editing and Suggesting memory on bare Plite; the dev browser profile splits Plite runtime from React render, 330 of 3,056 ms (profiles/page-key/browser-dev-1000-seed.cpuprofile) | closed |
| 4 | owner-microbench-and-trace | yes | complete | six causes profiled and fixed, three deferred with profiles (Cause History) | closed |
| 5 | product-mount-matrix | yes | complete | plite-authored-mounted passes on both sides; input is level or faster except the fully mounted 1,000-block arm, dom p50 15.8 against 10.6 ms, and retained heap there is 222.7 against 71.7 MB, one run each (mounted-cand-a1.json, mounted-head-a1.json) | heap gap in the parent plan's Open work |
| 6 | trusted-editing-matrix | yes | complete | normal dom p50 4.0 against 7.5 ms; large paint p95 23.2 against 22.7 ms; large dom p50 18.1 against 15.5 ms; 9 passes per side (typing-final-aggregate.tsv) | large dom gap belongs to the deferred preview projection |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - Slate has no review marks, so no matched workload exists | Slate source has no suggestion or review-mark model to compare | closed |
| 8 | example-breadth | yes | complete | P2.3 page spec 16 of 16 over the four suggestion demos (page-spec-final-a1.log); apps/plite authored-changes first batch 15 of 16, its Home and End case attributed away from this run (plite-homeend-control-a1.log) | closed |
| 9 | large-and-stress | yes | complete | stress p95 47.6 ms against the 100 ms budget, peak RSS 9.9 GiB against 3.9 pre-cut (stress-post-cand-a1.log, stress-post-cand-time.txt) | the review tree's memory at 10,000 suggestions is tracked in the mark-representation row |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: every cause closed; see Cause History
- lane: N/A: no active cause
- comparable-baseline: N/A: no active cause
- material-delta: N/A: no active cause
- isolated-owner: N/A: no active cause
- causal-intervention: N/A: no active cause
- correctness-guard-result: N/A: no active cause; the final guards are in Cause History and Completion Gates
- fix-class: N/A: no active cause
- long-term-target: N/A: no active cause
- decision-owner: N/A: no active cause
- layer-plan: N/A: no active cause
- compatibility-verdict: N/A: no active cause
- fix-owner: N/A: no active cause
- benchmark-command: N/A: no active cause
- benchmark-rerun: N/A: no active cause
- benchmark-rerun-result: N/A: no active cause; the final interleaved runs are in the Metric table
- correctness-command: N/A: no active cause
- correctness-rerun: N/A: no active cause
- correctness-rerun-result: N/A: no active cause; see plitejs-partitions-a5.log and page-spec-final-a1.log
- resume-lane: N/A: no active cause

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| cause-1 | owner-microbench-and-trace | kept | internal-implementation | lay out one change per projection in a single pass | benchmark | N/A: internal to the command projector | N/A: outputs unchanged | packages/plitejs/src/authored/tree/command-projection.ts changeOf | 33% of each update in pairwise change composition (profiles/large-cand.cpuprofile) | pass: authored suites | harness/interleave.sh main | pass: large p95 7.74 against 8.71 ms pre-cut | turbo run test --filter=plitejs | pass: only the eight tracked Yjs cases fail | main-final-aggregate.tsv |
| cause-2 | owner-microbench-and-trace | kept | internal-implementation | advance the frame index through the carried window change | benchmark | N/A: internal to the command frame | N/A: outputs unchanged | packages/plitejs/src/core/public-state.ts enterFrameDraft | 58% of each update remapped the frame index (profiles/large-cand-splice.cpuprofile) | pass: authored suites | harness/interleave.sh main | pass: fanout p95 7.51 against 25.7 ms before the fix | turbo run test --filter=plitejs | pass: only the eight tracked Yjs cases fail | main-final-aggregate.tsv |
| cause-3 | owner-microbench-and-trace | kept | internal-implementation | hash revisions from memoized parts | benchmark | N/A: revision stays an opaque number | N/A: equality semantics unchanged | packages/plitejs/src/authored/changes.ts revisionOf | 74% of a stacked card read hashed one JSON string (profiles/overlap200-cand.cpuprofile) | pass: authored suites | harness/interleave.sh overlap200 | pass: 200 stacked edits from 4752 ms setup to 18.8 ms p95 | turbo run test --filter=plitejs | pass: only the eight tracked Yjs cases fail | overlap200-final2-aggregate.tsv |
| cause-4 | large-and-stress | kept | internal-implementation | release the previous snapshot and mapped index after first use | benchmark | N/A: core runtime internals | N/A: outputs unchanged | packages/plitejs/src/core/public-state.ts snapshotIndexReader, packages/plitejs/src/core/snapshot-index.ts | heap snapshots showed two closure retention chains (profiles/heap-200*.heapsnapshot) | pass: outputs correct; stress ran out of memory at 17 GB | stress contract | pass: stress p95 47.6 ms, peak RSS 9.9 GiB | turbo run test --filter=plitejs | pass: only the eight tracked Yjs cases fail | stress-post-cand-a1.log |
| cause-5 | trusted-editing-matrix | kept | internal-implementation | carry preview keys across commits by applying the commit's change to the last preview | benchmark | N/A: authored preview internals | N/A: outputs unchanged | packages/plitejs/src/authored/authored.ts carryProjection, projectionOf | the ported annotation test failed on reminted keys; keys by node then threw after any commit (harness/preview-seed-repro.ts) | pass: preview text correct; only the key-reading annotation test failed | harness/preview-key-probe.ts | pass: keys by path and by node stable across typing and a block insert | bun test test/authored-plugin.test.ts | pass: authored-plugin, document-change and authored-refusal 107 of 107 | typing-cand-a4.json |
| cause-6 | trusted-editing-matrix | kept | internal-implementation | hand the recorder the projector's index on the frame seed | benchmark | N/A: core recorder internals | N/A: outputs unchanged | packages/plitejs/src/authored/tree/record.ts, DraftStep.indexedAfter | recordAuthoredSteps took 1.75 of 5.7 s re-applying the seed (profiles/page-key/browser-dev-1000.cpuprofile) | pass: typing exactness held in every pass | plite-authored-typing | pass: large dom p50 about 40 to 18.1 ms; work test 55 tokens per key at both sizes | pnpm --filter plitejs test:partition:authored | pass: 19 of 19, and the typing lane's exactness checks | typing-final-aggregate.tsv |
| deferred-change-index | owner-microbench-and-trace | pivoted | runtime-architecture | one review owner derives the change list from the marks per block | best-api | plite | hard-cut: pre-release review tree, its stored marks and derived reads | docs/plans/2026-10-13-review-tree-pivot.md | indexAuthoredChanges walks every node on the first card read after each commit, about 1.8 ms a key | pass: authored suites | harness/interleave.sh main | fail: fanout p95 4.29 against 3.82 ms, ranges overlap | turbo run test --filter=plitejs | N/A: pivoted, the pivot plan reruns it | main-post-aggregate.tsv; pivot-plan: 2026-10-13-review-tree-pivot.md |
| deferred-marks | owner-microbench-and-trace | pivoted | runtime-architecture | one insert mark per run with a pointer to the insertion it sits in, chosen in the pivot plan | best-api | plite | hard-cut: pre-release review tree, its stored marks and derived reads | docs/plans/2026-10-13-review-tree-pivot.md | leaf i carries i insert marks, 20,300 at 200 edits | pass: authored suites | harness/interleave.sh overlap200 | fail: 200 stacked edits p95 23.2 against 1.5 ms, one run | turbo run test --filter=plitejs | N/A: pivoted, the pivot plan reruns it | overlap200-post-aggregate.tsv; pivot-plan: 2026-10-13-review-tree-pivot.md |
| deferred-preview | trusted-editing-matrix | pivoted | runtime-architecture | one review owner keeps previews per block | best-api | plite | hard-cut: pre-release review tree, its stored marks and derived reads | docs/plans/2026-10-13-review-tree-pivot.md | previewCommit re-projects the whole document, 725 of 1,191 ms under beforeinput in the dev profile | pass: authored suites | plite-authored-typing | fail: large dom p50 18.1 against 15.5 ms; collaboration receive p95 15.4 ms at 1,000 blocks | turbo run test --filter=plitejs | N/A: pivoted, the pivot plan reruns it | typing-final-aggregate.tsv; pivot-plan: 2026-10-13-review-tree-pivot.md |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| typing-exactness | trusted-editing-matrix | the example lost its paint in the cut, so multi-leaf blocks rendered as text-flow hosts the harness could not read | first measured key failed exactness (typing-cand-a2.log) | struck letters showed as plain text | paint review marks in the example | closed |
| home-end | example-breadth | Shift+End over struck content selects into the next paragraph | fails the same way in the control worktree | not this run's | parent plan's Shift+End row | closed |
| mounted-heap | product-mount-matrix | retained heap 222.7 against 71.7 MB at the fully mounted large arm | headless model layer retains 47 MB on this tree, 507 MB without this run's fixes | budget met | Open work | heap snapshot of the mounted page |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| typing normal, dom | 9 passes x 100 keys per side | 7.5/N/A/N/A/N/A/N/A | 4.0/N/A/N/A/N/A/N/A | -3.5 ms, -47% | ranges 6.8-8.0 and 3.9-4.2 do not overlap | typing-final-aggregate.tsv |
| typing normal, paint | 9 passes x 100 keys | N/A/N/A/16.7/20.9/N/A | N/A/N/A/16.3/16.7/N/A | p95 level, p99 -4.2 ms | frame-bound | typing-final-aggregate.tsv |
| typing large, dom | 9 passes x 100 keys | 15.5/N/A/N/A/N/A/N/A | 18.1/N/A/N/A/N/A/N/A | +2.6 ms, +17% | ranges 14.2-16.3 and 16.4-19.2 do not overlap | typing-final-aggregate.tsv |
| typing large, paint | 9 passes x 100 keys | N/A/N/A/22.7/23.7/N/A | N/A/N/A/23.2/28.5/N/A | p95 +0.5 ms, p99 +4.8 ms | ranges overlap: no measurable difference | typing-final-aggregate.tsv |
| scale large | 2 runs | 3.32/N/A/7.42/13.87/N/A | 3.38/N/A/4.46/9.38/N/A | p95 -2.96 ms, -40% | ranges do not overlap | main-post-aggregate.tsv |
| scale fanout | 2 runs | 3.39/N/A/3.82/17.83/N/A | 3.44/N/A/4.29/7.13/N/A | p95 +0.47 ms | ranges overlap | main-post-aggregate.tsv |
| scale normal | 2 runs | 1.52/N/A/2.06/5.88/N/A | 0.93/N/A/1.32/2.40/N/A | p95 -0.74 ms | ranges do not overlap | main-post-aggregate.tsv |
| docs typing, dev | 3 rounds x 60 keys | 15.0/N/A/16.3/26.4/N/A | 16.2/N/A/16.5/16.8/N/A | p50 +1.2 ms inside one frame | frame-bound | docs-typing-a1.json |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | typing and mounted pass every budget on both sides; scale and stress meet their absolute budgets |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-13-suggesting-cost-benchmark.md` at cause/resume checkpoints | validator --complete passes |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Benchmark Lane Table |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | final-browser-a1.log, post-a1.log |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | plitejs-partitions-a5.log, page-spec-final-a1.log, plite-authored-changes-spec-a1.log |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | sourceBefore equals sourceAfter in typing-cand-a6.json and mounted-cand-a1.json |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | the example's paint restored the contract's fixture; harness/typing-aggregate.mjs reads the emitted JSON |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | Cause History |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | plitejs-typecheck-a5.log |
| Browser surface proof | yes | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | typing, mounted and lane 2 in Chromium; the example's paint seen in the browser pane |
| Changeset/release artifact | yes | Add only for published package behavior/API changes, otherwise N/A | .changeset/plite-snapshot-retention.md for cause 4; the other causes live in the unreleased review tree |
| Benchmark plan complete validation | yes | Run validator with `--complete` | passes |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-13-suggesting-cost-benchmark.md` | passes |

Verification evidence:
- Every number above names its artifact under docs/plans/artifacts/2026-10-13-suggesting-cost-benchmark/. The host had a load average of 3.4 to 3.8 from other sessions on 18 cores, so every comparison alternated base and candidate.
