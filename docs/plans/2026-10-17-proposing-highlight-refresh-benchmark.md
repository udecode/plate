# Proposing-view highlight refresh on next

Status: done: no added core or ledger work found; selection-read cost unsettled by timing
Page: https://claude.ai/artifact/NuhnquDbZeG1NqocNi9AMA
Playbook: perf-issue

## Brief

### What will change?

No code changed. In a proposing view, the highlight refresh does no more core or review-ledger work than in a plain view, at up to 10,000 selected blocks. Two per-letter whole-document reads went to follow-up tasks.

### What could go wrong?

The work counters miss selection reads, and the machine was too busy for timing to rule out a small slowdown. Only plain paragraphs with no suggestions ran, in a simulated page, not a real browser.

## Teach

When you select blocks, the editor draws a highlight over each one. Each time the selection changes, the highlight refreshes. It reads the selected blocks and finds each one on the page.

Before next's rewrite, a proposing view read the selection through its review layer, and a cache stopped that read from repeating for every block. At 10,000 selected blocks, one refresh took about 150 seconds with the cache and over 50 CPU minutes without it. The rewrite deleted that code, cache included.

Now the highlight reads the selection through the same call in both views. The work counters show no core or review-ledger work per refresh in either view. Those counters do not see selection reads, and the machine was too busy for timing to settle it. So this run found nothing to fix, but it cannot rule out a small slowdown.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What to compare against | A plain view on the same commit | Rebuild the old tree with its cache and time it again | old tree | small |
| Timing on this busy machine | The verdict comes from work counts, and timing stays inconclusive | Rerun the timing on an idle machine | idle rerun | small |
| Where to time | A simulated page, like the old number | A real browser at 10,000 blocks | browser run | small |
| A guard against the cost coming back | None; this run only measures | A test that counts a refresh's selection reads and fails when a proposing view adds any | guard test | small |
| Whole-document reads per typed letter | Two follow-up tasks, nothing fixed here | Fix them in this run | fix now | small |
| Documents that already hold suggestions | Not timed; the verdict covers G3's plain paragraphs | Time a cohort whose selected blocks hold suggestions | suggestion cohort | small |

## Benchmark Source

- request: suggested task task_a1621658 "Time next's proposing-view highlight refresh (xhigh)", from the Open work line of docs/plans/2026-10-13-pr-5165-redo.md: "Nobody has timed how long next's new suggestion code takes to refresh the selection highlight in a proposing view at 10,000 selected blocks."
- scope: the block-selection highlight refresh (NodeSelectionHighlight in packages/platejs/src/react/components/NodeSelection.tsx) in a proposing view at 10,000 one-leaf paragraphs with no suggestions, with 100, 1,000 and 10,000 selected blocks; the largest cohort's refresh moves the selection between 10,000 and 9,999 blocks, because the document has 10,000
- invocation: $benchmark proposing-view highlight refresh
- candidate-identity: commit: d0209b439a8f18dffa38cb74f8061bc0230bc8cc, this worktree clean; each refresh JSON lists the 646 package files it loaded from this worktree
- plate-main-identity: commit: ae66aa7a9f363f14b264ed5536136bd62d4aa8ff (origin/main), which has no proposing view or NodeSelectionHighlight, so lane 2 is N/A
- plite-identity: fingerprint: the candidate commit's packages/plitejs source through config/plite-source-aliases.ts
- slate-identity: N/A: Slate has no review layer or proposing view, so no Plite versus Slate row exists for this scope
- named-symptom: before next's rewrite, about 150 s per refresh at 10,000 selected in jsdom with the PR's view-selection cache and over 50 CPU minutes without it; G3 counted 6 selection resolutions per refresh with the cache and 612 and 6,012 at 100 and 1,000 without (docs/plans/2026-10-13-pr-5165-redo.md, G3)
- final-artifacts: artifact: docs/plans/artifacts/2026-10-17-proposing-highlight-refresh/
- inherited-budget: N/A: G3 in 2026-10-13-pr-5165-redo.md judged the view-selection cache, which next deleted with the code it served, so no kept design waits on this run
- inherited-budget-result: N/A: no inherited budget

Boundaries:
- allowed runtime/packages/apps: none changed; packages/plitejs/src and packages/platejs/src read only
- allowed benchmark/tests/fixtures: probes under docs/plans/artifacts/2026-10-17-proposing-highlight-refresh/probe/, since no registered target covers the highlight refresh
- allowed baseline checkouts/hosts: this worktree only; the baseline is the plain view on the same commit, in the same process
- non-goals: changing the highlight, the selection commit or React rendering; fixing the per-letter whole reads, which went to suggested tasks

## Interaction Coverage

- first-interaction: pass: the first refresh after the initial selection, from 10,000 to 9,999 selected blocks in a proposing view, took 8,091 ms, one sample with no warmup on a loaded host (next-propose-10000-a1.log)
- settled-interaction: pass: 7 interleaved rounds after 2 warmups per view at 1,000 selected and at 10,000 alternating with 9,999 selected, with highlight count, selected paths, mode and block count checked after each cohort (interleave-10000-a1.log)
- route-scope: N/A: no route; the probes mount EditorRoot, EditorContent and NodeSelectionHighlight in happy-dom, the same component path a page mounts
- reporter-profile: N/A: no reporter; the task came from an open measurement in a plan

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | d0209b439a, clean worktree | same commit, same process | artifact: the loaded list in matrix-propose-100-1000-10000.json names this worktree's files |
| lockfile / package manager | pnpm-lock.yaml at d0209b439a with the checkout's installed modules linked, bun 1.3.12 | same | artifact: the bun banner in each log |
| build mode / host / port | package source through config/plite-source-aliases.ts, React development build, happy-dom, no server | same | artifact: probe/interleave.tsx mounts all three views in one process |
| browser / machine / viewport / DPR | happy-dom, macOS arm64, 18 cores, load 61 to 92 during the timed rounds | same | artifact: cores and loads in probe/interleave-10000-a1.json |
| route / fixture / document / plugins | 10,000 one-leaf paragraphs, SuggestionPlugin, authored intent propose | the same document with no plugin and no authored view; Editing intent as a third arm | artifact: probe/refresh.test.tsx and probe/interleave.tsx |
| setup / action / DOM strategy | view.update.selection.setNodes moves the block selection by one block with NodeSelectionHighlight mounted | same | artifact: the select helper in both probes |
| warmups / samples / interleave order | 2 warmups, 7 rounds, arm order rotated each round | same | artifact: probe/interleave.tsx |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Benchmark Source request and named-symptom |
| `benchmark` source and methodology read | yes | read in full on 2026-10-17 before the first probe |
| Existing plan reused | yes | no Benchmark plan for this scope existed; the request is an Open work line of docs/plans/2026-10-13-pr-5165-redo.md |
| Candidate and baseline identities recorded | yes | Benchmark Source and Comparison Signature |
| Target/runner discovery completed from current source | yes | benchmarks/targets/slate-v2.json has no node-selection or highlight target, so probes in the run directory measure it, as G3's did |
| Host/build/fixture freshness proved | yes | probes import package source from this worktree; each refresh JSON lists the files it loaded |
| Correctness oracle identified | yes | each probe asserts highlight count, selected paths, mode, block count and a typed letter's text |
| All default lanes inventoried | yes | Benchmark Lane Table |
| `only` narrowing explicitly authorized or N/A | yes | N/A: not narrowed |
| Browser/native proof strategy selected | yes | N/A: the claim is the work a proposing view adds, which the counters read the same in any DOM; Defaults names the browser run |
## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | worktree clean at d0209b439a; next has since moved 2 commits, touching only packages/plitejs/src/react/external-text.ts, and the checkout's uncommitted NodeSelection.tsx edit touches only the drag gesture | closed |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - main has no proposing view or NodeSelectionHighlight, so no matched workload exists | git grep at origin/main ae66aa7a9f finds neither name | closed |
| 3 | plate-vs-plite-decomposition | yes | complete | self time under the refresh by owner: authored view frames 2.6% proposing and 1.9% plain, Plite core 36.1% and 37.5%, NodeSelection 1.7% and 1.6% (selfshare-a1.log, selfshare-none-a1.log); the split is inferred, because selfshare.mjs assigns each sample to the running frame's file | closed |
| 4 | owner-microbench-and-trace | yes | complete | zero core and ledger work per refresh in the plain, Editing and proposing views at all three sizes, while a typed letter in the same views counts work (matrix-propose-100-1000-10000-a1.log); the counters miss selection reads, since two planted reads per refresh also counted none (interleave-plant-a1.log) | closed |
| 5 | product-mount-matrix | no | N/A: inapplicable - the operation is a refresh in a view already mounted; authored mount cost has its own targets, plite-authored-mounted and plate-authored-construction | benchmarks/targets/slate-v2.json | closed |
| 6 | trusted-editing-matrix | no | N/A: inapplicable - the task times a programmatic selection commit, as its old jsdom number did, and the counters read the same in any DOM | Defaults names the browser run | closed |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - Slate has no review layer or proposing view | no matched workload | closed |
| 8 | example-breadth | no | N/A: inapplicable - the task asks for G3's operation, which G3 measured on 10,000 plain paragraphs, so this run times that fixture to stay comparable; other block types and documents holding suggestions are unmeasured, and the verdict covers this fixture only | Defaults names the suggestion cohort | closed |
| 9 | large-and-stress | yes | complete | 10,000 paragraphs with 100, 1,000 and 10,000 selected is the task's own cohort, the largest moving between 10,000 and 9,999 selected; counts in the three matrix logs, CPU in interleave-10000-a1.log | closed |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause proven
- lane: N/A: no cause proven
- comparable-baseline: N/A: no cause proven
- material-delta: N/A: no cause proven
- isolated-owner: N/A: no cause proven
- causal-intervention: N/A: no cause proven
- correctness-guard-result: N/A: no cause proven; the probes' asserts passed in every run
- fix-class: N/A: no cause proven
- long-term-target: N/A: no cause proven
- decision-owner: N/A: no cause proven
- layer-plan: N/A: no cause proven
- compatibility-verdict: N/A: no cause proven
- fix-owner: N/A: no cause proven
- benchmark-command: N/A: no cause proven
- benchmark-rerun: N/A: no cause proven
- benchmark-rerun-result: N/A: no cause proven
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: N/A: no cause proven
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| none | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: no cause proven | N/A: the proposing view adds no core or ledger work per refresh, and timing is inconclusive | N/A: no pre-fix state | N/A: no cause benchmark | N/A: no cause result | N/A: no cause correctness command | N/A: no post-fix state | matrix and interleave logs; the per-letter whole reads went to suggested tasks |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| refresh-work | owner-microbench-and-trace | the proposing view adds review or core work per refresh now that the cache is gone | 0 core and 0 ledger work per refresh in every view at every size | highlights, paths, mode and blocks asserted | invalidate: no added core or ledger work; the counters miss selection reads | closed |
| refresh-cpu | large-and-stress | the proposing view costs more CPU per refresh | 568 ms proposing, 565 ms plain at 10,000 alternating with 9,999 selected | asserted per cohort | defer: inconclusive on a loaded host, with the 10% line set after these medians were read | closed |
| letter-whole-reads | owner-microbench-and-trace | the typing control's whole-document reads per letter grow with the document | one top-level array build per letter in every view from node-change listeners; a mounted proposing view adds the correction frame's whole-root baseline read | typed text asserted | defer: outside this task's operation | suggested tasks in Open work |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| refresh CPU, 10,000 and 9,999 selected | 7 interleaved rounds per view | 565/N/A/N/A/N/A/634 | 568/N/A/N/A/N/A/937 | +3 ms, +0.5% | inconclusive: loaded host and a 10% line set after these medians were read; two planted reads gave +17.7% in a later run, where the unplanted Editing arm differed from plain by +9.1% | interleave-10000-a1.json, interleave-plant-a1.json |
| refresh CPU, 1,000 selected | 7 interleaved rounds per view | 87/N/A/N/A/N/A/107 | 90/N/A/N/A/N/A/106 | +3 ms | ranges 80-107 and 83-106 overlap | interleave-10000-a1.json |
| refresh wall, 10,000 and 9,999 selected | 7 interleaved rounds per view | 859/N/A/N/A/N/A/1815 | 1121/N/A/N/A/N/A/1321 | +262 ms | ranges overlap; wall time follows host load 61 to 66 | interleave-10000-a1.json |
| core and ledger work per refresh | 5 samples per view and size | 0/0/0/0/0 | 0/0/0/0/0 | none | deterministic counters, equal in every sample | matrix-none-100-1000-10000-a1.log, matrix-propose-100-1000-10000-a1.log |
| first refresh, 10,000 to 9,999 selected | 1 sample | N/A/N/A/N/A/N/A/N/A | 8091/N/A/N/A/N/A/8091 | N/A | one sample with no warmup on a loaded host | next-propose-10000-a1.log |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | no added core or ledger work at 100, 1,000 and 10,000 selected; timing inconclusive |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-17-proposing-highlight-refresh-benchmark.md` at cause/resume checkpoints | validator passes |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Benchmark Lane Table |
| Exact post-fix benchmark reruns | no | N/A: no fix was made | N/A: no kept fix |
| Correctness/native behavior reruns | no | N/A: no fix was made; the probes' own asserts passed | N/A: no kept fix |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | the worktree stayed clean at d0209b439a through every run; both views ran in one process |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | the typing control shows the counters count commit work; the planted reads show they miss selection reads, which only timing saw |
| Durable fix decision | no | N/A: no cause proven | N/A: Cause History holds one none row |
| Package/type/build proof | no | N/A: no package change | N/A: no package change |
| Browser surface proof | no | N/A: the counters read the same in any DOM; Defaults names the browser run | N/A: no browser claim |
| Changeset/release artifact | no | N/A: no published package changed | N/A: no package change |
| Benchmark plan complete validation | yes | Run validator with `--complete` | validator --complete passes |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-17-proposing-highlight-refresh-benchmark.md` | plan-open passes |

Verification evidence:
- Every number above names its artifact under docs/plans/artifacts/2026-10-17-proposing-highlight-refresh/. The host's load average stayed between 60 and 300 on 18 cores from other sessions, so the timed views ran interleaved in one process and timing is reported as inconclusive.

## Verification

- Work per refresh: zero core and ledger work in plain, Editing and proposing views at 100, 1,000 and 10,000 selected blocks, five samples each, while a typed letter in the same views counts work. Two planted selection reads also counted zero, so these counters miss selection reads.
- CPU per refresh at 10,000 alternating with 9,999 selected: 565 ms plain, 560 ms Editing and 568 ms proposing over seven interleaved rounds. The host was loaded and the 10% line was set after these medians were read, so timing is inconclusive.
- Not covered: a real browser, an idle machine, other block types and documents that hold suggestions.

## Close

No code changed, and nothing was reversed. The change is this plan, its decision log and its run directory.

On next at d0209b439a, a proposing view adds no core or review-ledger work to the block-selection highlight refresh, on G3's fixture of 10,000 plain paragraphs. Timing could not settle whether it adds a small cost those counters miss.

- **Work.** The core and ledger counters read zero per refresh in the plain, Editing and proposing views. That held at 100, 1,000 and 10,000 selected of 10,000 paragraphs, in 5 samples after 2 warmups. The largest cohort's refresh moves between 10,000 and 9,999 selected blocks. One typed letter in the same views counts work, so the counters run. Two planted selection reads per refresh also counted zero, so the counters miss selection reads.
- **CPU.** At 10,000 alternating with 9,999 selected, the medians are 565 ms plain, 560 ms Editing and 568 ms proposing, over 7 interleaved rounds at load 61 to 66 on 18 cores. In a later run, two planted selection reads gave +17.7% over plain, and the unplanted Editing arm differed from plain by +9.1%. No arm ran the same code twice, so the run has no same-code noise band. The host was loaded and the 10% line was set after these medians were read, so timing settles nothing either way.
- **Limiter.** One profile per view suggests the refresh is bound by per-block work every view shares. The split is inferred, because it assigns each sample to the file of the running frame. It puts about 45% of self time in builtins such as freeze and structuredClone and 36% in Plite core, from the selection commit's checks, copies and freezes. The highlight looks up every selected block twice per refresh, once while rendering and again in a layout effect, in NodeSelection.tsx. View and review-layer files take 2.6% proposing and 1.9% plain.
- **First refresh.** The first refresh after the initial selection, from 10,000 to 9,999 selected, took 8,091 ms, one sample on a loaded host. The old 150 s ran in jsdom on another tree, so this is no speedup claim.
- **Limits.** Everything ran in happy-dom with React's development build and a programmatic selection commit, on one-leaf paragraphs with no suggestions. No real browser, idle machine, other block type or document holding suggestions ran. The 10% timing line was set after the first interleaved medians were read, so no claim rests on timing.

The typing control turned up whole-document reads per letter, outside this task's operation. Every view builds the top-level array once per letter when node-change listeners run, which is t_ffefa63c. A mounted proposing view also reads the whole root in its correction frame, now part of t_1a6aacfb.

**Attention.** reviewed by gpt-6.1-sol @xhigh, which raised nine flags. Each one is handled here.

- Critical. Zero counters did not prove no added work, because two planted selection reads also counted zero. The verdict now covers core and ledger work only, and says timing could not settle selection-read cost.
- Teach, Cause History, the packet ledger, the gates and the Close used matching CPU medians to clear the proposing view after timing was ruled inconclusive. They no longer do.
- The largest cohort's refresh moves between 10,000 and 9,999 selected blocks, and the labels now say so.
- The plan-open gate and the Close claimed results before they happened. plan-open now runs before landing, and the Close no longer says the patch landed.
- The shared-limiter split is now labeled inferred.
- Lane 8 said the task names one fixture, which it does not. It now says other fixtures are unmeasured, the verdict covers plain paragraphs only, and a Defaults row names a suggestion cohort.
- The +9.1% is the Editing arm's difference from plain, not same-code noise.
- A trail row now records the sequential matrix comparison dropped for load confounding, and that the lane table was written after the measurements.
- The started ledger row did not list the plan and its decision log among the task's writes. A later started row adds them.

## Open work

- t_ffefa63c Read node-change listener contexts without building the whole top-level array. Tracked in docs/plans/suggested-tasks.decisions.tsv. owner: zbeyens. stop: the task lands or is dismissed.
- t_1a6aacfb Bound authored admission and ledger work by the edited range, which now includes the mounted proposing view's correction-frame read. Tracked in docs/plans/suggested-tasks.decisions.tsv. owner: zbeyens. stop: the task lands or is dismissed.
