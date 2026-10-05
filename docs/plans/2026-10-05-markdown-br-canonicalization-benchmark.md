# Markdown break canonicalization benchmark

Status: executed, both Plite fixes are in the working tree, uncommitted.
Page: https://claude.ai/artifact/86Fw46kk2TChwFSMPAn9At
Playbook: perf-issue

Objective:
Make parsing a paragraph that holds n `<br/>` breaks grow linearly in n, fixed at the owning Plite step, proven by an interleaved baseline/candidate doubling cohort.

Flow mode:
one-shot execution

Plan:
docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md

Template:
.agents/rules/benchmark/templates/benchmark.md

## Brief

### What did you find?

Two Plite owners were quadratic. `RootChange.applyIndexed` decoded the whole paragraph once per leaf merge, and the fit report's `merge-text` repairs repeated every earlier input. At 800 breaks, parse took 12.1 s.

### What will change?

800 breaks parse in 72 ms instead of 12.1 s, and a 1000-break table cell in 111 ms instead of 20.2 s. Doubling ratios fall from about 4.2 to 2.2. Each merged leaf now reports one `merge-text` warning instead of one per pair.

### What do you need from me?

Nothing blocks. Under Defaults, `pairwise` brings back one warning per merge. Commits stay with you.

### What happens if I say go?

Nothing more runs. The change stays uncommitted until you ask for a commit or PR.

### What could go wrong?

A batched decode could diverge from sequential application. The token-reference test, the full Plite suite and the Markdown suite pass. A batch that fails to decode falls back to the wider ancestor and the existing token path.

## Defaults

| Decision | Pick | Alternative | Word |
|---|---|---|---|
| Shape of the `merge-text` repair for a run of k mergeable leaves | one repair per merged leaf listing all k inputs, so Markdown reports one warning | one repair per pairwise merge listing only that pair's two inputs, also linear, k−1 warnings | `pairwise` |

## Close

**Deviations.** The request expected one owner in the fitter or change builder. There were two, both in Plite. The first fix (`RootChange.applyIndexed` batching) cut 800 breaks from 12.1 s to 395 ms but left doubling ratios at 2.9 to 3.6. A second profile then found the cumulative `merge-text` report in `packages/plitejs/src/core/slice-fit/fit-report.ts`. The request also framed canonicalization as merging "one operation at a time". In fact it emits one change of 2(n−1) replacements, and the applier handled those one at a time.

**What landed.** Two files in `packages/plitejs` changed. `RootChange.applyIndexed` in `src/core/change/root-change.ts` now finds every unapplied replacement inside the localized ancestor and applies them all in one encode, decode and splice. `collectRepresentationRepairs` in `src/core/slice-fit/fit-report.ts` collects a run of mergeable text leaves into one `merge-text` repair that lists every source leaf. The Markdown decoder is untouched and still emits one leaf per segment. Two regression tests were added: `rewrites a shared ancestor once for every replacement inside it` in `packages/plitejs/test/document-change.test.ts`, and `reports one text merge per merged leaf with every source leaf` in `packages/plitejs/test/schema-fit-report.test.ts`. Each failed on the old code for its named defect: four ancestor rewrites where one was expected, and two cumulative repairs where one was expected. No changeset: the `plitejs` release baseline is the 0.0.1 placeholder (3 files, 2571 bytes on npm), so none of this has shipped.

**Proof.** The interleaved receipt ran 5 packets per side in fresh processes, rotating the order of three frozen snapshot worktrees: baseline, the root-change fix alone, and both fixes. p50 went from 170 / 665 / 2761 / 12099 ms to 12.6 / 16.7 / 32.3 / 72.3 ms at 100 / 200 / 400 / 800 breaks. The 1000-break table cell went from 20179 ms to 111 ms. Doubling ratios were 3.91 / 4.15 / 4.38 on the baseline and 1.33 / 1.93 / 2.24 with both fixes, inside the 2.4 budget I froze before reading any candidate result. Plite alone, with no Markdown, stays linear through 12800 leaves (64 / 100 / 237 / 466 / 936 ms, ratios 1.56 to 2.37). Correctness passed on the final bytes: `plitejs` 2997 pass, 0 fail, Markdown 269 pass, and the baseline guard 84 pass before the fix.

**Limits.** Above about 6400 breaks a third-party quadratic shows up. `mdast-util-find-and-replace` calls `siblings.indexOf(node)` for each text node it visits, and the GFM autolink-literal and `remark-emoji` transforms run it. That accounts for 36% of a 12800-break parse, which takes 2.17 s end to end. Timing is headless Bun on one Apple M5 Max. The browser lanes are N/A because typing and mounting never reach the changed code, as the counters in lanes 5 and 6 show. In the dialect benchmark, B4 inline-tag scaling stays red as before; its own attribution places that superlinear shape in the CommonMark tokenizer.

**Open work.**
- The remark find-and-replace quadratic above about 6400 sibling text nodes. owner: Plate Markdown (`packages/platejs/src/markdown`, remark plugin chain). tracked: `docs/plans/2026-10-05-markdown-remark-find-replace-benchmark.md`, which carries the fix on `next` as a pnpm patch.

**Counts.** Of the 5 requirement rows, 5 are done, 0 skipped, 0 blocked and 0 open. All 9 lanes are closed: 6 complete and 3 N/A.

## Benchmark Source

- request: "parsing Markdown whose paragraph holds many `<br/>` breaks is superlinear ... Run this repository's Perf issue playbook ... reproduce with a doubling cohort (100, 200, 400, 800 breaks), find the owning step in the Plite fitter or change builder, fix it at the owner (do not pre-merge leaves in the Markdown decoder as a workaround), and prove linear growth with an interleaved before/after receipt. AGENTS.md owns delivery: leave changes uncommitted."
- scope: `editor.api.markdown.parse` of a paragraph or GFM table cell holding n `<br/>` breaks, through Plite schema fitting, `RootChange.apply` and the representation repair report
- invocation: `$benchmark markdown-br-canonicalization`
- candidate-identity: fingerprint: snapshot worktree `scratchpad/br/wt-cand` = `HEAD` 36c2f43170 plus the checkout's 301 uncommitted files at 2026-10-05, plus `root-change.ts` sha256 33682fc61944 and `fit-report.ts` 30bc398bac9c, which `cmp` matches byte for byte with the checkout
- plate-main-identity: N/A: origin/main is Plate v1 on Slate and has no Plite fitter or `RootChange`; see lane 2
- plite-identity: fingerprint: snapshot worktree `scratchpad/br/wt-base` = `HEAD` 36c2f43170 plus the same 301 uncommitted files; `root-change.ts` sha256 6bd68887ddff, `fit-report.ts` 2680da43531d, `document-index.ts` 10fe17c10cd3, `tokens.ts` bd2da9b01dca, `compiled-slice-fitter.ts` 232dd597a8bf. The middle side `scratchpad/br/wt-c1` is the baseline plus only the final `root-change.ts`
- slate-identity: commit: `../slate` 945a484df2497e4c448b33f417b0de2a49840032, `packages/slate/dist/index.es.js` built 2026-09-10, clean `packages/slate`
- named-symptom: 186 ms at 100 breaks, 669 ms at 200, 2778 ms at 400 for a top-level paragraph; about 39 s for one GFM table cell with 1000 breaks (reported at fe0e9599a6)
- final-artifacts: artifact: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/receipt-doubling.json`

First checkpoint:
- Copy every explicit requirement into checkable rows before measurement or
  code changes.
- Resolve source identities, host/build freshness, fixture/action comparability,
  correctness guards, and every default lane's applicability.
- All applicable lanes are selected by default. Only an explicit `only`
  invocation may mark otherwise relevant lanes
  `N/A: only - <reason>`. Use `N/A: inapplicable - <reason>` only for a lane
  that genuinely cannot apply.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A: no duration requested
- start / deadline: N/A: no duration requested
- final loop closure: N/A: no duration requested

Completion threshold:
- Requirement rows: (1) doubling cohort 100, 200, 400, 800 breaks reproduced on the baseline; (2) the owning step named in the Plite fitter or change builder; (3) the fix lands at that owner, with no leaf pre-merge in the Markdown decoder; (4) the candidate's p50 ratio per doubling is at most 2.4× from 200 to 800 breaks, against the baseline's roughly 4×, in an interleaved run of at least five packets per side; (5) the change stays uncommitted.
- The candidate's parsed document equals the baseline's for every cohort, and the per-parse ancestor rewrite count drops from 2(n−1) to one.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, the P1 autoreview gate is
  resolved per the pstack block's Panel review and Review rules, and `node .agents/pstack/plan-open.mjs` passes.

Verification surface:
- benchmark commands / artifacts: `PACKETS=5 SIDES=base,c1,cand COHORTS=para:100,para:200,para:400,para:800,table:1000 node scratchpad/br/receipt.mjs <out.json>`; artifacts under `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/`
- correctness commands: `bun test --preload ../../config/plite-source-test-setup.ts --path-ignore-patterns 'test/react/**'` in `packages/plitejs`; `bun test src/markdown` in `packages/platejs`
- Browser / Chrome / device proof: N/A: the operation is a headless parse API with no route, DOM or input
- source/ref/fingerprint proof: Benchmark Source above

Constraints:
- Correctness and native editor behavior outrank metric movement.
- Do not hide latency with debounce, delayed work, changed fixtures, degraded
  DOM, or a narrower action.
- Do not create another benchmark target registry or permanent run ledger.
- A conclusive cause pauses later lanes; it does not complete the goal.
- A proven cause selects the best long-term durable target, not the cheapest
  compatible patch. Before stability, hard-cut API or architecture when that
  buys materially better lasting value; preserve only a named hard correctness,
  security, serialized-data, native-behavior, or runtime law.
- After a fix, rerun the exact red lane and correctness guard before breadth.
- Do not commit, push, open a PR, comment, publish, or release unless separately
  authorized.
- The Markdown decoder keeps emitting one leaf per segment; leaves are not pre-merged there.

Boundaries:
- allowed runtime/packages/apps: `packages/plitejs/src/core/change/`, `packages/plitejs/src/core/slice-fit/`
- allowed benchmark/tests/fixtures: `packages/plitejs/test/document-change.test.ts`, `packages/plitejs/test/schema-fit-report.test.ts`; scratch runners under the session scratchpad
- allowed baseline checkouts/hosts: the three detached snapshot worktrees `scratchpad/br/wt-base`, `wt-c1` and `wt-cand`
- non-goals: the Markdown decoder's leaf shape, the remark plugin chain, browser routes, other sessions' uncommitted edits

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- The batched decode cannot match token-reference application, or the candidate stays superlinear with no further isolated owner.

## Interaction Coverage

- first-interaction: N/A: a headless parse API call has no interaction phase; every cohort is one parse after two 20-break warmup parses
- settled-interaction: N/A: no interaction; repeated parses are covered by the 5 fresh-process packets per side
- route-scope: N/A: no route; the measured surface is `editor.api.markdown.parse` through `createTestEditor()`
- reporter-profile: pass: the reported fixture shape reproduced through the same `createTestEditor()` at 175 / 669 / 2916 ms against the reported 186 / 669 / 2778 ms (artifact: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/receipt-doubling.json` repeats it at 170 / 665 / 2761 ms)

Use `pass: <proof>` or `N/A: <concrete reason>` for each phase and host.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | `wt-cand` snapshot plus this run's two runtime files | `wt-base` snapshot; `wt-c1` adds only the final `root-change.ts` | artifact: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/snapshot.mjs`; `diff -rq` of each worktree's `packages` against `wt-base` lists only this run's files |
| lockfile / package manager | `pnpm-lock.yaml` sha256 b1ef4ef60309, pnpm 9.15.0, node_modules linked from the checkout | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/snapshot.mjs` links the checkout's `node_modules` directories into every worktree |
| build mode / host / port | source under bun 1.3.12 with the worktree's `config/plite-source-aliases.ts` preload, no build | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/sample.ts` asserts the worktree's own `RootChange.apply` ran (`applies > 0`) and records its rewrite count |
| browser / machine / viewport / DPR | headless bun on Apple M5 Max | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/receipt-doubling.json` records `bun` 1.3.12 |
| route / fixture / document / plugins | `createTestEditor()` from `packages/platejs/src/markdown/lib/__tests__/createTestEditor.tsx`; `item 0<br/>item 1...` as a paragraph or one GFM table cell | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/sample.ts` asserts the merged text equals `item 0\nitem 1...` on every side |
| setup / action / DOM strategy | one `parseTestMarkdown` per cohort after two 20-break warmups, fresh process per side per packet | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/receipt.mjs` |
| warmups / samples / interleave order | 2 warmups, 5 packets, side order rotates base>c1>cand, c1>cand>base, cand>base>c1 | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/receipt-doubling.json` rows carry `packet` and `order` |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Completion threshold rows (1) to (5) quote the request |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `benchmark` source and methodology read | yes | skill and `methodology.md` read in full this session |
| Existing plan reused | yes | no matching Benchmark plan exists under `docs/plans` |
| Candidate and baseline identities recorded | yes | Benchmark Source |
| Target/runner discovery completed from current source | yes | `benchmarks/targets/slate-v2.json` has no markdown break or canonical merge target; `plate-markdown-dialect` covers prose and legacy parse breadth |
| Host/build/fixture freshness proved | yes | both trees run source; the A/A packet on identical trees differed by at most 4% |
| Correctness oracle identified | yes | `applyByTokenReference` in `packages/plitejs/test/document-change.test.ts`, the Plite suite and the Markdown spec suite |
| All default lanes inventoried | yes | Lane table |
| `only` narrowing explicitly authorized or N/A | no | N/A: no `only` narrowing was requested |
| Browser/native proof strategy selected | yes | N/A for a headless parse; see Interaction Coverage |
| Output budget strategy recorded | yes | see above |
| Commit/PR/release authority recorded | yes | no mutation authorized by default |

Work Checklist:
- [x] Every explicit scope, comparison, timing, stop condition, deliverable, verification surface, and success criterion is recorded. Closed: Benchmark Source and Completion threshold. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md`.
- [x] Short objective, threshold, verification, constraints, boundaries, and blocked condition are concrete. Closed: header sections. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md`.
- [x] Default lanes remain in diagnostic order; every N/A row has a reason. Closed: Lane table. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md`.
- [x] Candidate/baseline signatures prove comparable source, fixture, action, build, browser, machine, and sampling. Closed: Comparison Signature. Proof: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/receipt-doubling.json`.
- [x] Primary metrics match the visible user operation; proxies stay labeled. Closed: the metric is one complete `editor.api.markdown.parse` call; the Plite-only fit is labeled a layer probe. Proof: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/sample.ts`.
- [x] Samples expose p50/p75/p95/p99 only when sample count supports them, plus max, absolute/relative delta, and noise evidence. Closed: Metric table; p95 and p99 omitted at 5 samples per side. Proof: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/receipt-doubling.json`.
- [x] Red lanes are not called causal without the conclusive-cause gate. Closed: each Cause History row names its intervention and work counter. Proof: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/receipt-doubling.json`.
- [x] A proven cause pauses later lanes before another expensive benchmark. Closed: lanes 5 to 9 ran after both fixes passed their reruns. Proof: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/receipt-doubling.json`.
- [x] Every proven cause records its fix class, best long-term target, decision owner, layer plan, compatibility verdict, and implementation owner. Closed: Cause History. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md`.
- [x] `public-api` and `runtime-architecture` causes run `best-api`, then the Plan playbook before implementation. skip: both causes are `internal-implementation`; no call shape or type changes.
- [x] One isolated owner is fixed, then the exact benchmark and correctness guard rerun before breadth resumes. Closed: `root-change.ts` first, then `fit-report.ts`, each followed by its test and a cohort rerun. Proof: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/receipt-doubling.json`.
- [x] Failed reruns invalidate or continue the same cause; they do not skip to a different green metric. Closed: the first fix left lane 4 superlinear, so the lane stayed open until the second owner was profiled and fixed. Proof: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/c1-para1600.cpuprofile`.
- [x] Green reruns resume the first pending applicable lane. Closed: lanes 5 to 9 resumed in order. Proof: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/edit-probe.jsonl`.
- [x] Every packet has keep/revert/invalidate/quarantine/defer and next-owner evidence. Closed: Packet ledger. Proof: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/receipt-doubling.json`.
- [x] Harness/metric/host defects are repaired before product optimization. Closed: snapshot worktrees freeze bytes against other sessions' edits, and the A/A packet bounds noise. Proof: `docs/plans/artifacts/2026-10-05-markdown-br-canonicalization/aa.json`.
- [x] Final handoff reports candidate/baseline identities, lane status, first conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk. Closed: Final handoff contract and Close. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md`.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | snapshot worktrees, fingerprints and the A/A packet `aa.json` | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - origin/main is Plate v1 on Slate with no Plite fitter or `RootChange`, so it cannot run the named owner; this is a scaling defect inside `next`, measured against the current tree | origin/main package layout | none |
| 3 | plate-vs-plite-decomposition | yes | complete | a Plite-only `editor.read.schema.fitDocument` of the same 2n−1 leaves takes 159, 604 and 2641 ms at n = 100, 200, 400 against 175, 669 and 2916 ms through Markdown (`plite-fit.ts`), so Plite owns about 90% | none |
| 4 | owner-microbench-and-trace | yes | complete | `baseline-para300.cpuprofile`, `c1-para1600.cpuprofile`, apply-stats rewrite counts and `receipt-doubling.json` | none |
| 5 | product-mount-matrix | no | N/A: inapplicable - mounting a 500-paragraph canonical value calls no non-empty `RootChange.apply` and reports no repair, so no route mount can reach either changed branch | `edit-probe.jsonl` has no mount entry on either side | none |
| 6 | trusted-editing-matrix | no | N/A: inapplicable - typing never calls `RootChange.apply` because primitive edits pass precomputed indexes, and delete, break, merge and paste each apply one replacement with no batch on either side, so trusted input cannot reach the changed branch | `edit-probe.jsonl`: typing absent; deleteBackward, break, merge and paste at most 1 replacement and 0 batches | none |
| 7 | plite-vs-pinned-slate | yes | complete | under bun, Plite-only fit p50 9.3 / 15.8 / 24.4 / 48.5 ms with both fixes and 172 / 611 / 2678 / 13210 ms before, against Slate normalize at 4.0 / 5.3 / 8.5 / 16.0 ms for 100 to 800 breaks (`lane7-final.jsonl`) | none |
| 8 | example-breadth | yes | complete | `plate-markdown-dialect` baseline/candidate/compare passed adoption; legacy-large does identical apply work (5 applies, 5 replacements, 5 rewrites, 0 fallbacks), has an identical document hash and interleaved medians of 517 ms baseline vs 505 ms candidate (`legacy-probe.jsonl`) | none |
| 9 | large-and-stress | yes | complete | both fixes: 3200 breaks 452 ms, 6400 842 ms, 12800 2172 ms, and a 6400-break table cell 1018 ms (`receipt-large.json`, `receipt-stress.json`); Plite alone stays linear to 12800 (`plite-large.jsonl`) | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause proven
- lane: N/A: no cause proven
- comparable-baseline: N/A: no cause proven
- material-delta: N/A: no cause proven
- isolated-owner: N/A: no cause proven
- causal-intervention: N/A: no cause proven
- correctness-guard-result: N/A: no cause open; results are in Cause History
- fix-class: N/A: no cause proven
- long-term-target: N/A: no cause proven
- decision-owner: N/A: no cause proven
- layer-plan: N/A: no cause proven
- compatibility-verdict: N/A: no cause proven
- fix-owner: N/A: no cause proven
- benchmark-command: N/A: no cause proven
- benchmark-rerun: N/A: no cause proven
- benchmark-rerun-result: N/A: no cause open; results are in Cause History
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: N/A: no cause open; results are in Cause History
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| rootchange-per-replacement-ancestor-decode | owner-microbench-and-trace | kept | internal-implementation | `RootChange.apply` localizes each ancestor once per change: every unapplied replacement inside the localized ancestor joins one encode, decode and splice | benchmark | N/A: an internal implementation fix inside `plitejs` core/change needs no layer plan | N/A: no API or output change; applied values equal token-reference application | `packages/plitejs/src/core/change/root-change.ts` `RootChange.applyIndexed` | a 300-break profile put 88% under `builder.finalize`, `RootChange.apply` and `applyIndexed`; apply stats show one change of 2(n−1) replacements, each re-decoding ancestor `[0]`; batching drops per-parse rewrites from 2(n−1) to 1 and 800 breaks from 12099 to 395 ms p50 | pass: baseline `document-change.test.ts` and `schema-fit-report.test.ts` 84 pass | `PACKETS=5 SIDES=base,c1,cand COHORTS=para:100,para:200,para:400,para:800,table:1000 node scratchpad/br/receipt.mjs` | pass: c1 p50 17.6 / 38 / 111 / 395 ms vs 170 / 665 / 2761 / 12099 ms; rewrites 2 per parse | `bun test --preload ../../config/plite-source-test-setup.ts --path-ignore-patterns 'test/react/**'` in `packages/plitejs` and `bun test src/markdown` in `packages/platejs` | pass: plitejs 2997 pass, 0 fail; Markdown 269 pass, 0 fail | `receipt-doubling.json`, `baseline-para300.cpuprofile` |
| fit-report-cumulative-merge-inputs | owner-microbench-and-trace | kept | internal-implementation | the representation report emits one `merge-text` repair per merged output leaf listing every source leaf, so report size is linear in the run | benchmark | N/A: an internal implementation fix inside `plitejs` slice-fit needs no layer plan | N/A: no call shape or type changes; the unreleased report lists each merged leaf once (plitejs 0.0.1 on npm is a placeholder) | `packages/plitejs/src/core/slice-fit/fit-report.ts` `collectRepresentationRepairs` | after the first fix, a 1600-break profile put 25% in `classifyChildren` and `schemaRepair` and 38% in the Markdown `report` call to `JSON.stringify`, because the i-th pairwise repair repeated all i earlier inputs; one repair per merged leaf cut 800 breaks from 395 to 72.3 ms p50 and doubling ratios from 3.55 to 2.24 | pass: baseline `document-change.test.ts` and `schema-fit-report.test.ts` 84 pass | `PACKETS=5 SIDES=base,c1,cand COHORTS=para:100,para:200,para:400,para:800,table:1000 node scratchpad/br/receipt.mjs` | pass: cand p50 12.6 / 16.7 / 32.3 / 72.3 ms, ratios 1.33 / 1.93 / 2.24; table:1000 111 ms vs 20179 ms | `bun test --preload ../../config/plite-source-test-setup.ts --path-ignore-patterns 'test/react/**'` in `packages/plitejs` and `bun test src/markdown` in `packages/platejs` | pass: plitejs 2997 pass, 0 fail; Markdown 269 pass, 0 fail | `receipt-doubling.json`, `c1-para1600.cpuprofile`, `diag.jsonl` |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| aa | source-and-host-readiness | identical trees must agree | para:100 166.0/165.9 ms, para:200 627.1/651.1 ms, table:100 167.5/173.9 ms p50 (2 packets) | guard rows asserted merged text | keep: noise band about ±4% | lane 3 |
| c1-probe | owner-microbench-and-trace | batch replacements per ancestor | one run: 17.9 / 38.5 / 113 / 393 / 1478 / 5810 ms at 100 to 3200; rewrites 2 | `document-change.test.ts` 80 pass | keep; still superlinear | profile 1600 |
| cand-probe | owner-microbench-and-trace | one `merge-text` repair per merged leaf | one run: 13.3 / 19.7 / 31.6 / 68.6 / 151 / 315 ms at 100 to 3200 | both test files 86 pass | keep | interleaved receipt |
| receipt-doubling | owner-microbench-and-trace | both causes, three sides interleaved | see Metric table | guard rows pass on every side | keep | lanes 5 to 9 |
| lane7-final | plite-vs-pinned-slate | substrate comparison | Plite fit 48.5 ms vs Slate 16.0 ms at 800, both linear | guards pass | keep | lane 8 |
| dialect 1-2 | example-breadth | markdown breadth | adoption pass; legacy large +6% then +11% sequential | identical conversion | invalidate the legacy timing as host noise; prose compares different options per role | interleaved legacy probe |
| legacy-probe | example-breadth | legacy large work parity | identical work counters and document hash; medians 517 vs 505 ms | pass | keep | lane 9 |
| large-stress | large-and-stress | tail scaling | 3200 452 ms, 6400 842 ms, 12800 2172 ms; table 6400 1018 ms | guards pass | keep; remark quadratic named | close |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| parse, 100 breaks | 5 per side | 170.2 / 172.9 / omitted / omitted / 194.8 ms | 12.6 / 12.8 / omitted / omitted / 13.1 ms | −157.6 ms, −93% | A/A band ±4%; root-change-only side 17.6 ms | `receipt-doubling.json` |
| parse, 200 breaks | 5 per side | 664.8 / 686.8 / omitted / omitted / 856.2 ms | 16.7 / 17.5 / omitted / omitted / 18.5 ms | −648.1 ms, −97% | root-change-only side 38.0 ms | `receipt-doubling.json` |
| parse, 400 breaks | 5 per side | 2760.5 / 3600.8 / omitted / omitted / 3684.5 ms | 32.3 / 33.0 / omitted / omitted / 34.0 ms | −2728.2 ms, −98.8% | root-change-only side 111.2 ms | `receipt-doubling.json` |
| parse, 800 breaks | 5 per side | 12098.8 / 13758.0 / omitted / omitted / 14510.6 ms | 72.3 / 73.0 / omitted / omitted / 78.8 ms | −12026.5 ms, −99.4% | root-change-only side 394.5 ms | `receipt-doubling.json` |
| parse, GFM table cell, 1000 breaks | 5 per side | 20178.8 / 20206.0 / omitted / omitted / 23194.1 ms | 111.4 / 114.7 / omitted / omitted / 120.0 ms | −20067.4 ms, −99.4% | root-change-only side 688.0 ms | `receipt-doubling.json` |
| p50 ratio per doubling, 100>200>400>800 | 5 per side | 3.91 / 4.15 / 4.38 | 1.33 / 1.93 / 2.24 | budget ≤ 2.4 met | root-change-only side 2.16 / 2.93 / 3.55 | `receipt-doubling.json` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | `receipt-doubling.json`: ratio 2.24 ≤ 2.4 from 400 to 800 breaks; guards pass |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md` at cause/resume checkpoints | `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md` exit 0 |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Lane table: 6 complete, 3 N/A |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | `receipt-doubling.json` runs the original cohort command against the frozen baseline |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | plitejs 2997 pass, 0 fail; Markdown 269 pass; browser N/A per lanes 5 and 6 |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | `cmp` of the checkout's `root-change.ts` and `fit-report.ts` against `wt-cand` before the receipt; sha256 33682fc61944 and 30bc398bac9c |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | `aa.json` A/A packet; every sample asserts merged text and the worktree's own apply ran |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | Cause History, both `internal-implementation` |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | `pnpm typecheck` in `packages/plitejs` exit 0, 13 tasks |
| Browser surface proof | no | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | N/A: headless parse API with no route |
| Changeset/release artifact | no | Add only for published package behavior/API changes, otherwise N/A | N/A: `plitejs` 0.0.1 on npm is a 3-file placeholder, so no user has this code |
| Agent rule/skill sync | no | Run `pnpm install` and mirror/resource checks when agent sources changed, otherwise N/A | N/A: no agent source changes |
| Benchmark plan complete validation | yes | Run validator with `--complete` | `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md` exit 0 |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm exec ultracite fix` and `check` on the four task files, exit 0 |
| Timed checkpoint | no | Satisfy requested duration and close current packet, otherwise N/A | N/A: no duration requested |
| P1 autoreview | no | Run the panel that the `.agents/pstack.json` reviews list names for this work, or the one the user asked for, and record its result, or N/A with reason | N/A: the reviews list names no row for an internal fix outside a PR, and no panel was requested |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md` | `node .agents/pstack/plan-open.mjs docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md` exit 0 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | plan, snapshot worktrees, A/A packet | none |
| Ordered diagnosis | complete | lanes 1 to 4, two profiles, apply stats | none |
| Fix and exact rerun | complete | two kept causes, `receipt-doubling.json` | none |
| Remaining breadth | complete | lanes 5 to 9 | none |
| Review and closeout | complete | deslop, no-comments, lint, typecheck, suites | none |

Findings:
- The Markdown decoder emits one text leaf per segment and one `"\n"` leaf per `<br>`. Schema canonicalization merges them through a single construction change, applied once in `ChangeDraft.finalize`. The change is one, but `RootChange.applyIndexed` handled its 2(n−1) replacements one at a time.
- Each merge replacement deletes a `close(text) open(text)` token pair. It is neither inside one text node nor at a child boundary on both ends, so it reaches the ancestor branch, which encoded the paragraph, spliced one replacement, decoded and froze the whole paragraph, and spliced it back.
- `collectRepresentationRepairs` reported each pairwise merge with every earlier input, so a run of k leaves produced k−1 repairs holding k(k+1)/2−1 locations. Markdown turns each repair into a warning and stringifies it to deduplicate, which is linear per warning, so the quadratic size came from the report.
- Typing never calls `RootChange.apply`; primitive edits hand the change builder a precomputed index.
- Above about 6400 sibling text nodes, `mdast-util-find-and-replace` (GFM autolink literals, `remark-emoji`) becomes the next quadratic term through `siblings.indexOf(node)`; it sits outside Plite.

Decisions and tradeoffs:
- The applier owns the cost, not the canonicalizer. The construction change stays fine-grained, one replacement per leaf boundary, which keeps per-boundary mapping exact.
- A batch that fails to decode at one ancestor moves to the next wider ancestor with a larger batch, then to the existing root-window and token fallbacks, so the batch never needs its own fallback path.
- The loop pops from an `unapplied` stack whose name carries the "still at source positions" invariant, so the code needs no comment for it, as the comment review asked.
- One `merge-text` repair per merged leaf, reversible with `pairwise` under Defaults.
- No changeset, per the `changeset` skill: the release baseline has none of this code.

Harness/methodology repairs:
- Other sessions held 301 uncommitted files, including live edits in `packages/plitejs`. Baseline and candidate ran from detached snapshot worktrees of the same copy (`snapshot.mjs`), so measured bytes differ only in this run's files.
- The dialect benchmark's prose row compares different parse options per role (`withoutMdx` on the baseline only), so it was not used as an A/A signal; legacy parse uses the same options on both sides.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| `bun --preload <file> run <script>` printed the package script list instead of running | 1 | drop `run` and pass the script path directly | fixed in `run.mjs` and `receipt.mjs` |
| a stray `root-change.ts.check` copy landed in `wt-base` | 1 | removed by literal path before the receipt; the file was never imported | fixed |
| `wt-c1` was snapshotted after other sessions edited 7 files | 1 | copied those 7 files from `wt-base` so only `root-change.ts` differs | fixed; `diff -rq` lists only this run's files |
| sequential dialect runs read legacy large +6% and +11% | 2 | interleaved legacy probe with work counters | invalidated as host noise; identical work and output |

Verification evidence:
- `bun test --preload ../../config/plite-source-test-setup.ts test/document-change.test.ts -t 'rewrites a shared ancestor'` failed before the fix with ancestorPaths `[[0],[0],[0],[0]]` against `[[0]]`.
- `bun test --preload ../../config/plite-source-test-setup.ts test/schema-fit-report.test.ts -t 'one text merge'` failed before the fix with two cumulative `merge-text` repairs against one.
- Baseline guard: `document-change.test.ts` and `schema-fit-report.test.ts` in `wt-base` 84 pass.
- Final bytes: plitejs 2997 pass, 0 fail; `bun test src/markdown` in `packages/platejs` 269 pass, 0 fail; `pnpm typecheck` in `packages/plitejs` exit 0.
- `diag.jsonl`: `a<br/>b<br/>c` parses to the same document on both sides; the baseline reports 4 cumulative `merge-text` warnings, the candidate 1 with all 5 inputs.
- Reach and mutation check, run after the close in a snapshot worktree. The full `plitejs` suite takes the batched path 551 times (520 batches of 2, 19 of 3, the largest 9), with 2999 passing (`suite-batch-events.log`, `count-suite.log`). A mutant that keeps deleted ranges inside a batch (`position = from - ancestor.from`) fails 231 tests across authored views, slice-fitter model laws and fragment APIs (`mutant-suite.log`).

Final handoff contract:
- plan / scope: this plan; `editor.api.markdown.parse` of break-heavy paragraphs and table cells
- candidate / baseline identities: Benchmark Source
- completed / N/A / pending lanes: 6 complete (1, 3, 4, 7, 8, 9), 3 N/A (2, 5, 6), 0 pending
- first conclusive cause: `rootchange-per-replacement-ancestor-decode`
- baseline / latest / best metrics: 800 breaks went from 12098.8 ms to 72.3 ms p50, and the 1000-break table cell from 20178.8 ms to 111.4 ms
- fix owner / changed files: `packages/plitejs/src/core/change/root-change.ts`, `packages/plitejs/src/core/slice-fit/fit-report.ts`, plus two tests
- exact benchmark and correctness reruns: Cause History
- resumed breadth: lanes 5 to 9
- packet decisions: Packet ledger
- harness/methodology repairs: snapshot worktrees, A/A packet, dialect prose caveat
- residual claim limits / next owner: remark find-and-replace quadratic above about 6400 siblings, owner Plate Markdown; headless Bun timing on one machine

Timeline:
- 2026-10-05 Benchmark plan created after the profile and apply-stats diagnosis.
- 2026-10-05 `RootChange.applyIndexed` batching kept; second owner found in the fit report and fixed.
- 2026-10-05 Interleaved three-way receipt, breadth lanes, suites and close.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Closed |
| Where am I going? | Hand-back; commits wait for the owner |
| What is the goal? | Linear-time parsing of paragraphs with many `<br/>` breaks, fixed at the Plite owner |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- The remark find-and-replace quadratic above about 6400 sibling text nodes. owner: Plate Markdown (`packages/platejs/src/markdown`). tracked: `docs/plans/2026-10-05-markdown-remark-find-replace-benchmark.md`.
