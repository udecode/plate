# Authored key work bounded by the edited range

Status: partial: decisions, containers and card roots wait on their own tasks
Page: https://claude.ai/artifact/UK2fP1LjUavx9cs39WfLbe
Playbook: perf-issue

## Brief

### What will change?

Typing, peer verdicts, undo, redo and remote Enter beside pending suggestions now cost the same at 2,000 blocks as at 100. Decisions still resolve the whole document, and work beside grouped containers still grows.

### What could go wrong?

A change's revision no longer moves when two of its blocks swap. A decision check that misses a stranded suggestion would drop typed text without blocking. The panel found one such case, now fixed and tested.

## Teach

Each key in a document with suggestions runs three passes. Admission writes the key's marks and counts the nodes each insertion holds. A settle pass releases held deletions and settles verdicts. The review ledger updates each change's summary.

Each pass used to walk more than the key touched. Admission scanned everything between the first and last edited block and copied every insertion count. Settling copied the whole block list. A key inside an insertion spanning every block rebuilt its summary from all of them, and a decision indexed every change in the document.

Now each pass reads only the blocks the key replaced. Insertion counts share one map that rolls back, and a change's revision is a sum of per-block parts, so one block's edit updates it in place.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A change's revision across its top-level blocks | A sum of per-block parts, so swapping two of its blocks keeps it (look) | Keep the ordered hash and rebuild it from every block on each key | ordered revision | small |
| The decision's own resolution | Stays whole; the search for stranded changes reads marks only in replaced blocks but still compares every rebuilt block with its original, until the resolution keeps the blocks it leaves alone (answer) | Bound the resolution in this run | bound resolution | big |
| Container key work beside a pending join (t_7491a86b) | Offered again as its own task, waiting on this one, since it changes how the projection levels a container (look) | Build the container edge cuts in this run | do containers | big |
| Where the correction frame's whole read is counted | A headless Suggesting editor with a do-nothing correction plugin in the test suite, plus a one-off mounted proposing view at 1,000 and 10,000 paragraphs (look) | Keep a mounted view's count in the test suite | mounted count | small |
| Two costs the review panel found | Offered as their own tasks: a card root other than the main one still copies whole when a change or a settle lands in it, so the ask is met for the main root only, and a change's block list shifts or rescans its times when its first or oldest block leaves (look) | Fix them in this run | fix panel extras | small |
| Two per-key costs the delegates found outside these findings | Offered as their own tasks: card roots each key snapshots, and a remote Enter at offset 0 after another Enter that rebuilds the root (safe) | Fix them in this run | fix both | small |

## Benchmark Source

- request: suggested task t_1a6aacfb "[P0] Bound authored admission and ledger work by the edited range", with t_5d6fa02a and t_7491a86b merged into it
- scope: per-key and per-decision work of packages/plitejs/src/authored (admission, settle, ledger book and cards, decideOn), and the core and Yjs whole reads the task names
- invocation: $benchmark only owner-microbench-and-trace
- candidate-identity: fingerprint: this worktree on 79f710039476196b0d4f35a14b62e5d6affcf80b with the task's uncommitted edits
- plate-main-identity: N/A: main has no authored review tree
- plite-identity: fingerprint: the candidate's packages/plitejs source through config/plite-source-test-setup.ts
- slate-identity: N/A: Slate has no review layer
- named-symptom: at 2,000 blocks against 100, an edit to the first and last block read 4,000 against 200 whole nodes and copied 2,000 against 100 insertion counts; a decision scanned 2,050 against 150 entries (baseline-a1.log)
- final-artifacts: artifact: docs/plans/artifacts/2026-10-22-authored-key-locality/
- inherited-budget: N/A: the task sets its own law, equal work at two sizes
- inherited-budget-result: N/A: no inherited budget

Boundaries:
- allowed runtime/packages/apps: packages/plitejs/src/authored, packages/plitejs/src/core/change/document-index.ts, and the delegates' core and Yjs files
- allowed benchmark/tests/fixtures: packages/plitejs/test/authored-tree-work.test.ts and the delegates' tests
- allowed baseline checkouts/hosts: this worktree; the baseline is the same fixtures before the edits
- non-goals: the decision's whole resolution, container edge cuts, timing

## Interaction Coverage

- first-interaction: pass: each fixture runs one warm key before it counts two
- settled-interaction: pass: two counted keys per size after the warm key
- route-scope: N/A: no route; the fixtures drive the editor API in bun
- reporter-profile: N/A: the task came from a review finding

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | 79f7100394 with the task's edits | 79f7100394 | artifact: baseline-a1.log and fix-*.log |
| lockfile / package manager | pnpm-lock.yaml at 79f7100394, bun 1.3.12 | same | artifact: the bun banner in each log |
| build mode / host / port | package source, no build, no server | same | artifact: the test preload |
| browser / machine / viewport / DPR | none; macOS arm64, 18 cores | same | artifact: inter-a1.log records the host load |
| route / fixture / document / plugins | 100 and 2,000 paragraphs, each with plain text, an insertion and a verdict, Inline schema and the authored plugin | same | artifact: the holding helper in the test |
| setup / action / DOM strategy | editor.update and editor.update.authored.decide | same | artifact: the test |
| warmups / samples / interleave order | 1 warm key, 2 counted keys per size | same | artifact: the countedAtBothSizes helper |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Benchmark Source request |
| `benchmark` source and methodology read | yes | read on 2026-10-22 before the first fixture |
| Existing plan reused | yes | no plan for this scope existed |
| Candidate and baseline identities recorded | yes | Comparison Signature |
| Target/runner discovery completed from current source | yes | the work counters in src/authored/ledger/work.ts and src/core/work.ts are the owner; no timing target covers this |
| Host/build/fixture freshness proved | yes | bun runs package source from this worktree |
| Correctness oracle identified | yes | the whole authored, core and Yjs test partitions |
| All default lanes inventoried | yes | Benchmark Lane Table |
| `only` narrowing explicitly authorized or N/A | yes | the task asks for work counts at two sizes, not timing |
| Browser/native proof strategy selected | yes | N/A: counters read the same in any DOM |
## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | package source through the test preload | closed |
| 2 | current-vs-main-product-smoke | no | N/A: only - explicitly narrowed | main has no authored review tree | closed |
| 3 | plate-vs-plite-decomposition | no | N/A: only - explicitly narrowed | the work is Plite's | closed |
| 4 | owner-microbench-and-trace | yes | complete | equal counters at 100 and 2,000 blocks in every new fixture | closed |
| 5 | product-mount-matrix | no | N/A: only - explicitly narrowed | per-key work, not mount | closed |
| 6 | trusted-editing-matrix | no | N/A: only - explicitly narrowed | counters read the same in any DOM | closed |
| 7 | plite-vs-pinned-slate | no | N/A: only - explicitly narrowed | Slate has no review layer | closed |
| 8 | example-breadth | no | N/A: only - explicitly narrowed | the fixture is the task's own | closed |
| 9 | large-and-stress | no | N/A: only - explicitly narrowed | 2,000 blocks is the task's own size | closed |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: C1 closed, see Cause History
- lane: N/A: C1 closed, see Cause History
- comparable-baseline: N/A: C1 closed, see Cause History
- material-delta: N/A: C1 closed, see Cause History
- isolated-owner: N/A: C1 closed, see Cause History
- causal-intervention: N/A: C1 closed, see Cause History
- correctness-guard-result: N/A: C1 closed, see Cause History
- fix-class: N/A: C1 closed, see Cause History
- long-term-target: N/A: C1 closed, see Cause History
- decision-owner: N/A: C1 closed, see Cause History
- layer-plan: N/A: C1 closed, see Cause History
- compatibility-verdict: N/A: C1 closed, see Cause History
- fix-owner: N/A: C1 closed, see Cause History
- benchmark-command: N/A: C1 closed, see Cause History
- benchmark-rerun: N/A: C1 closed, see Cause History
- benchmark-rerun-result: N/A: C1 closed, see Cause History
- correctness-command: N/A: C1 closed, see Cause History
- correctness-rerun: N/A: C1 closed, see Cause History
- correctness-rerun-result: N/A: C1 closed, see Cause History
- resume-lane: N/A: C1 closed, see Cause History

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| C1 | owner-microbench-and-trace | kept | internal-implementation | per-key work bounded by the edited blocks in every authored pass | benchmark | N/A: internal to Plite's authored package | N/A: no public call shape changed; revision no longer moves when two blocks of one change swap, Defaults row ordered revision | packages/plitejs/src/authored | artifact: baseline-a1.log | pass: the three partitions pass at the base | bun test --preload ../../config/plite-source-test-setup.ts test/authored-tree-work.test.ts -t 'grow with the document' | pass: fix-a6.log | pnpm test:partition:authored, pnpm test:partition:core, pnpm test:partition:yjs | pass: partition logs in the run directory | artifact: fix-a6.log |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| both-ends | owner-microbench-and-trace | admission, insertion counts and settle walk the whole span | equal at 100 and 2,000 against 4,000 / 200 whole reads | partitions pass | keep | closed |
| spanning | owner-microbench-and-trace | a key inside a spanning change rebuilds it from every holder | equal at both sizes against 6,000 / 300 holder reads | partitions pass | keep | closed |
| decision | owner-microbench-and-trace | a decision indexes every change | equal ledger work at 100 and 1,000 outside verdictLookups against 2,050 / 150 entries | partitions pass | keep; resolution stays whole | Open work |
| timing | large-and-stress | the new book slows a key | candidate to base median ratio 0.77 to 1.26 per case over six ABBA runs per side | asserted | no slowdown found; host-bound | closed |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| 15 timed work cases, run total s | 6 runs per side, ABBA order | 4.82/N/A/N/A/N/A/7.15 | 4.93/N/A/N/A/N/A/5.49 | +0.11 s | host load 21 to 30 on 18 cores; per-case median ratios 0.77 to 1.26 | abba/summary.tsv |
| work counters per key | 2 keys per size | unequal at 100 and 2,000 | equal at 100 and 2,000 | N/A | deterministic | baseline-a1.log, fix-a6.log |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | the growth fixtures pass |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-22-authored-key-locality-benchmark.md` at cause/resume checkpoints | validator passes |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Benchmark Lane Table |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | fix-a6.log |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | partition logs |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | the final rerun ran on the landed tree |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | each fixture failed at the base before its fix |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | Cause History C1; no public call shape changed |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | plitejs typecheck and lint:task pass |
| Browser surface proof | no | N/A: counters read the same in any DOM | N/A: no browser claim |
| Changeset/release artifact | yes | Write the plitejs patch changeset | .changeset/authored-key-locality.md |
| Benchmark plan complete validation | yes | Run validator with `--complete` | validator --complete passes |
| Plan complete | yes | No box or gate row in the plan is pending | plan-open passes |

Verification evidence:
- Every number above names its artifact under docs/plans/artifacts/2026-10-22-authored-key-locality/.

## Close

Per-key admission, settle and ledger work now reads only the replaced blocks. Insertion counts live in one shared map that rolls back, and each change's revision is a sum of per-block parts. A decision pairs each resolved block with its original, one comparison per block, and reads suggestion marks only in the blocks it replaced and in every root it drops. The correction frame checks only the top-level nodes it touched, the repair orphan check reads only the roots that changed, and history inverses read the lazy main root. The Yjs remote Enter parse skips the hidden children between crossing slots and sweeps stale ids.

Every growth fixture fails at 79f7100394 and passes on the candidate, and each decision row names its own scope. The decision fixture runs at 100 and 1,000 blocks. It compares review-ledger work only, because the resolution's own reads still grow, and it asserts that pairing the rebuilt blocks grows by one comparison per block. The settle fixture applies a verdict a peer delivers, so a block really settles. The mounted proposing count ran once as a probe at 1,000 and 10,000 paragraphs and is not in the test suite. ABBA timing found no slowdown under load 21 to 30.

Three parts of the ask stay open. The decision's resolution stays whole, and so the stranded-change search still compares every block once (bound resolution, t_5c97d402). Container edge cuts from t_7491a86b are not done (do containers, t_77550ecc). Named card roots still copy whole on apply, so the settle and history bounds hold for the main root only (t_9a2d0ffc). The review panel ran the allowed three rounds with three seats each. Rounds 1 and 2 each found a critical case, fixed and tested. Round 3's critical case, the per-block comparison, is fixed for its many-roots cost and counted, and the rest waits on t_5c97d402.

Of the 9 findings and covered tasks, 5 are done, the decision search is partly done, and 3 parts are open in their own tasks.

## Verification

- Growth fixtures, authored, core and Yjs test partitions, plitejs typecheck and lint on the final tree.
- A one-off mounted proposing probe at two sizes, and ABBA timing of the 5,000-block cases.
- Proof stops at counters and bun timing; no browser run.

## Open work

- Bound the decision's own resolution. Owner: t_5c97d402. Stop: its landing.
- Cut container key work at the container's edge. Owner: t_77550ecc. Stop: its landing.
- Keep named content roots lazy through apply. Owner: t_9a2d0ffc. Stop: its landing.
- Count and bound holder array shifts. Owner: t_8e55e90c. Stop: its landing.
- Card-root snapshot per framed key. Owner: t_c9b5c485. Stop: its landing.
- Remote Enter at a line start rebuilds the Yjs root. Owner: t_a7525f77. Stop: its landing.
- Node-change listeners build the whole top-level array. Owner: t_ffefa63c. Stop: its landing.
