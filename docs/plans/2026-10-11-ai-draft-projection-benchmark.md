# AI suggestion draft: one projection per request

Status: executed: waiting on your commit; a fully flat chunk is Plite open work
Page: https://claude.ai/artifact/5y8Dd8LaoHic9FhS5k3Vuu
Playbook: perf-issue

This run serves your request to make the AI suggestion draft's per-chunk cost flat in document size. The AI list landing plan (`2026-10-11-ai-list-landing.md`) measured the cost in step 2.0 and left it under its Open work as "Stop re-projecting the authored doc per AI chunk". Its step 2.3 has landed, so the draft is already an unpublished transaction spec, and this run builds on that shape.

## Brief

### What will change?

AI edits streaming into a long document are much faster. With 1,000 other lists, each chunk after the first takes about 33 ms, down from 212. About 11 ms of it still grows with document size, inside the editor engine.

### What could go wrong?

If some edit between chunks didn't get recorded by the editor, the AI could write over a document that changed under it. Every kind of edit I checked gets recorded, and two new tests cover stopping and continuing.

## Teach

An AI edit streams in chunks. Each chunk turns the answer so far into a suggestion. It undoes the last chunk's suggestion and writes the new one. Undoing only works on the document the last chunk left, so the draft first checks that nothing else changed it.

That check used to rebuild the whole suggested document on every chunk and compare it with what the last chunk should have left. At 10,000 blocks it cost about 220 ms per chunk, nearly all of the chunk.

The editor already remembers its last update. If that is still the update the previous chunk made, nothing else touched the document, so the draft skips the check. Only the first chunk, and a chunk that follows some other update, still pay for it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| An update between chunks that changes no text, like moving the cursor | The next chunk runs the old slow check once, then streaming goes on (safe) | Any update between chunks stops the stream | any-commit-stops | small |
| The first chunk of a request | It still rebuilds the suggested document once, as you asked (safe) | Add a way to read the live suggested document from the engine, so the first chunk skips the rebuild too | no-first-projection | detail |
| What the stays-flat check times | The draft's own work with one edit, with the engine's known per-edit slowdown switched off on both sides (look) | The real setup, where each edit still costs about 2 ms at 10,000 blocks | gate-real-tree | small |
| The 11 ms a later chunk still grows inside the engine | Left for the engine's own speed work; this run measured where it goes (look) | Fix the engine's whole-document check here too, which saves about 5 of the 11 ms | fix-plite-walk | big |

## Main changes

- `AIChatPlugin` keeps the published suggestion as one record: its base document, its change against that base, and the editor commit that published it. The four reset sites clear that one record.
- `createSuggestionDraft` projects the authored document for the first chunk's base. On later chunks it runs the full "document moved" check only when `editor.read.lastCommit()` is no longer the commit the last chunk published. Every view of the editor shares that commit record, so an edit made through any view counts.

## Benchmark Source

- request: "Make the per-chunk draft cost flat in document size: project once per request, and replace the moved check with a check that does not read the whole document, keeping its meaning (an unrelated edit between chunks must still stop the draft from inverting onto a moved document). Prove it with the AI partition (`bun test packages/platejs/src/ai`) and a Benchmark pre-acceptance probe at 0, 100 and 1,000 other lists."
- scope: `createSuggestionDraft` in `packages/platejs/src/ai/react/AIChatPlugin.ts`, per streamed chunk
- invocation: `$benchmark only createSuggestionDraft`
- candidate-identity: commit: `70a30d83f66516ec0e128774b7ece7b1858add70` (the baseline commit plus `artifacts/2026-10-11-ai-draft-projection-benchmark/final.patch`); the first candidate runs used `candidate.patch`, which differs only in the draft's comment
- plate-main-identity: N/A: the request compares the draft before and after this fix on one tree, not against `origin/main`
- plite-identity: commit: `5614af70329df85fea8d77f5ab8ad2de4c244eb8` (a `freeze.mjs` commit of the checkout's `packages` at intake, other sessions' uncommitted work included)
- slate-identity: N/A: Slate has no authored suggestion draft
- named-symptom: `projectAuthoredDocument` runs `admitAuthoredReviewDocument` over the whole document on every streamed chunk, about 160 of 210 ms per chunk at 1,000 other lists
- final-artifacts: artifact: `docs/plans/artifacts/2026-10-11-ai-draft-projection-benchmark/perf/final-real.json` and `perf/final-nofreeze.json`

Boundaries:
- allowed runtime/packages/apps: `packages/platejs/src/ai/react/AIChatPlugin.ts`
- allowed benchmark/tests/fixtures: `packages/platejs/src/ai/react/AIChatPlugin.suggestions.spec.ts`; the probe and its instrumentation in the run directory
- allowed baseline checkouts/hosts: `proof-worktree.mjs` worktrees at the baseline commit on this host
- non-goals: Plite's per-op root array copy and freeze, tracked as "Remove Plite's per-op root array freeze cost"; the draft's invert-and-reapply of every earlier edit per chunk

## Interaction Coverage

- first-interaction: N/A: the draft runs inside the plugin API a stream calls; there is no browser route or first paint to measure
- settled-interaction: N/A: the probe measures every chunk of the stream after the first, which is the settled state of the same API
- route-scope: N/A: no route; the plugin API is the owner and the probe drives it directly
- reporter-profile: N/A: the finding came from a measured probe, not a reporter

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | `70a30d83` (baseline plus `final.patch`) | `5614af70` | artifact: docs/plans/artifacts/2026-10-11-ai-draft-projection-benchmark/perf/final-real.json and perf/base-real.json, whose `env.sha` names each commit |
| lockfile / package manager | the checkout's linked `node_modules`, pnpm lockfile at `5fc246c291` | same links | artifact: docs/plans/artifacts/2026-10-11-ai-draft-projection-benchmark/perf/final-real-a1.log and perf/base-real-a1.log, both made by `proof-worktree.mjs` with linked `node_modules` |
| build mode / host / port | Bun 1.3.12 source run, no build; Darwin, 18 cores | same | artifact: docs/plans/artifacts/2026-10-11-ai-draft-projection-benchmark/perf/final-real.json and perf/base-real.json `env` blocks |
| browser / machine / viewport / DPR | no browser; headless Bun on this Darwin host, 18 cores | same | artifact: docs/plans/artifacts/2026-10-11-ai-draft-projection-benchmark/perf/final-real-load-before.txt and perf/base-real-load-before.txt |
| route / fixture / document / plugins | three source blocks amid 0, 100 or 1,000 other 10-item lists; Authored, Paragraph, List, AI, Markdown with GFM, AIChat | same | artifact: docs/plans/artifacts/2026-10-11-ai-draft-projection-benchmark/perf/draft-probe.spec.ts |
| setup / action / DOM strategy | `setPreview` of a rewrite in five chunks, 1, 5 or 20 text edits, list and paragraph arms | same | artifact: docs/plans/artifacts/2026-10-11-ai-draft-projection-benchmark/perf/draft-probe.spec.ts |
| warmups / samples / interleave order | one warmup round, five samples per arm, arms rotate per sample | same | artifact: docs/plans/artifacts/2026-10-11-ai-draft-projection-benchmark/perf/run.sh |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Benchmark Source request |
| `benchmark` source and methodology read | yes | skill and `references/methodology.md` loaded at intake |
| Existing plan reused | yes | no active plan names this cost; the landing plan lists it under Open work only |
| Candidate and baseline identities recorded | yes | Benchmark Source |
| Target/runner discovery completed from current source | yes | the step 2.0 probe (`artifacts/2026-10-11-ai-list-landing/perf/suggestion-probe.spec.ts`) is the honest owner; this run extends it with draft timing and admission counts |
| Host/build/fixture freshness proved | yes | each run loads all 664 workspace files from its own worktree (`foreign` is empty in each JSON) |
| Correctness oracle identified | yes | `bun test packages/platejs/src/ai`, plus each probe arm's own output asserts |
| All default lanes inventoried | yes | Benchmark Lane Table |
| `only` narrowing explicitly authorized or N/A | yes | the request names its proof: the AI partition and a pre-acceptance probe at 0, 100 and 1,000 other lists |
| Browser/native proof strategy selected | yes | N/A: no browser surface; see Interaction Coverage |

## Frozen lines

Frozen in the decision log before the candidate ran. Both lines are asserted by `perf/draft-probe.spec.ts` itself.

1. `counts` requires that in every row (1, 5 and 20 edits at 0, 100 and 1,000 other lists, plus the row with another pending suggestion) the draft admits the whole authored document at most once on the first chunk and never on chunks 2 to 5, and runs no whole-document diff on chunks 2 to 5.
2. `flat` requires that with one edit the draft's mean time per chunk over chunks 2 to 5, at 100 and 1,000 other lists, stays within 1.2 times its 0-list value plus 2 ms, for the list and paragraph arms. It runs with Plite's per-op root freeze removed in both trees (`NOFREEZE=1`).

Under the noise rule, a timing line counts only when the host's one-minute load average is at most 9, half its 18 cores, before and after the run; otherwise it is inconclusive. As known-bad inputs, the baseline must fail both lines with the probe's own assertion text, and a planted 2 µs per top-level block inside the candidate's draft must fail `flat`.

`counts` passes on every row of the candidate and the final tree. `flat` passes at 100 lists and fails at 1,000 lists, 12.8 ms (list) and 12.6 ms (paragraph) against limits of 3.8 and 3.9 ms. The line stays as frozen; see Close.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | baseline `5614af70` and final `70a30d83` commits; every probe JSON loads only its own worktree's files | none |
| 2 | current-vs-main-product-smoke | no | N/A: only - explicitly narrowed to the draft probe and the AI partition | the request names its proof | none |
| 3 | plate-vs-plite-decomposition | no | N/A: only - explicitly narrowed; the owner is already the Plate draft calling a Plite projection | the request names the owner | none |
| 4 | owner-microbench-and-trace | yes | complete | C1 kept (`perf/final-real-a1.log`, `perf/final-nofreeze-a1.log`); C2 attributed by `cpu/cand-cpu-a1.log` and `perf/cand-memo-a1.log` and deferred | none |
| 5 | product-mount-matrix | no | N/A: only - explicitly narrowed; mount does not run the draft | the request names its proof | none |
| 6 | trusted-editing-matrix | no | N/A: only - explicitly narrowed; a stream is not keyboard input | the request names its proof | none |
| 7 | plite-vs-pinned-slate | no | N/A: only - explicitly narrowed; Slate has no authored draft | the request names its proof | none |
| 8 | example-breadth | no | N/A: only - explicitly narrowed to the draft probe | the request names its proof | none |
| 9 | large-and-stress | yes | complete | the 100 and 1,000 list cohorts and the pre-suggested row of the same probe; the residual growth is recorded as C2 | none |

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
| C1-draft-projection-per-chunk | owner-microbench-and-trace | kept | internal-implementation | the draft reads the proposed document once per request and tells whether it moved from the owner editor's last commit | benchmark | N/A: one plugin's internals, no layer moves | N/A: no public API or data change | platejs `AIChatPlugin` `createSuggestionDraft` | admissions and diffs per chunk move from [1,1,1,1,1] and [0,1,1,1,1] to [1,0,0,0,0] and [0,0,0,0,0]; one-edit later-chunk draft at 1,000 lists falls from 228 to 14 ms p50 | pass: `build/base-ai-partition-a1.log`, 166 tests at the baseline | `perf/run.sh <name> <sha> <tree> <NOFREEZE> counts[,flat]` (probe `perf/draft-probe.spec.ts` under `perf/instrument.mjs`) | pass: the counts line holds on every row (`perf/final-real-a1.log`, `perf/final-nofreeze-a1.log`); the flat line fails at 1,000 lists on C2's residual | `bun test packages/platejs/src/ai` | pass: `build/accept-ai-partition-a1.log`, 168 tests | `perf/stats.mjs`; decision log verify rows |
| C2-plite-transaction-width | owner-microbench-and-trace | deferred | internal-implementation | Plite applies a change and fits a slice in time flat in the root's width: baseline adoption checks only nodes it has not seen, and an op stops copying and freezing the whole top-level array | benchmark | N/A: Plite internals, no layer moves | N/A: no public API or data change | plitejs `core/editor-schema.ts` `rememberValidatedDocumentRoots`, `core/change/document-index.ts` and the slice fitter | the later-chunk profile puts the residual in `tx.changes.apply` (adoptCanonicalBaseline) and `tx.slice.replace`; memoizing the deep-frozen check cuts the one-edit later draft from 13.7 to 8.4 ms (list) and 12.2 to 9.1 ms (paragraph) | pass: `build/base-ai-partition-a1.log` | `perf/run.sh` under `perf/deepfrozen-memo-control.mjs` | fail: `perf/cand-memo-a1.log` still misses flat at 8.4 and 9.1 ms | `bun test packages/platejs/src/ai` | N/A: no Plite change landed | `cpu/cand-cpu-a1.log`; `cpu/cpuprofile-under.mjs`; `perf/cand-memo-a1.log` |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| P1 | owner-microbench-and-trace | C1: the per-chunk projection and whole-document diff in the moved check | later-chunk draft at 1,000 lists, one edit: 14.0 / 227.9 ms p50 (freeze removed) | AI partition 168 pass; two new tests caught their mutants | keep | none |
| P2 | owner-microbench-and-trace | C2 control: memoize Plite's deep-frozen check | later-chunk draft at 1,000 lists, one edit: 8.4 / 13.7 ms (list) | not run; a disposable control | defer | Plite task |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| later chunk, 1 edit, 0 lists, list | 20 / 20 | 3.8/4.5/8.6/-/9.6 ms | 3.8/4.0/8.6/-/9.7 ms | +0.1 ms / +2% | p99 omitted at 20 samples; no measurable difference | `perf/base-real.json`, `perf/final-real.json` |
| later chunk, 1 edit, 100 lists, list | 20 / 20 | 20.3/22.8/34.3/-/35.4 ms | 5.5/6.1/7.1/-/7.6 ms | -14.9 ms / -73% | load 6.6 to 8.6 on 18 cores | same |
| later chunk, 1 edit, 1,000 lists, list | 20 / 20 | 212.0/270.4/314.1/-/316.2 ms | 33.1/38.2/47.7/-/129.0 ms | -178.9 ms / -84% | same | same |
| later chunk, 1 edit, 1,000 lists, paragraph | 20 / 20 | 220.6/268.6/326.1/-/330.8 ms | 27.6/28.2/32.1/-/32.8 ms | -193.0 ms / -87% | same | same |
| later chunk, 5 edits, 1,000 lists, list | 20 / 20 | 259.8/350.4/368.6/-/392.8 ms | 29.6/40.0/44.8/-/48.3 ms | -230.2 ms / -89% | same | same |
| later chunk, 20 edits, 1,000 lists, list | 20 / 20 | 286.0/310.3/376.9/-/416.9 ms | 38.6/103.1/122.9/-/364.7 ms | -247.5 ms / -87% | same | same |
| later chunk, 5 edits, 1,000 lists, another pending suggestion, list | 20 / 20 | 259.7/301.7/450.5/-/726.2 ms | 43.2/48.4/51.3/-/57.4 ms | -216.5 ms / -83% | same | same |
| later-chunk draft only, 1 edit, 1,000 lists, list, freeze removed | 20 / 20 | 227.9/261.1/294.8/-/325.6 ms | 14.0/15.5/20.8/-/21.0 ms | -213.9 ms / -94% | same | `perf/base-nofreeze.json`, `perf/final-nofreeze.json` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | counts passes; flat fails at 1,000 lists and stays failed (`perf/final-nofreeze-a1.log`); the AI partition passes (`build/accept-ai-partition-a1.log`) |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-11-ai-draft-projection-benchmark.md` at cause/resume checkpoints | `build/validate-plan-a2.log` |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Benchmark Lane Table |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | `perf/final-real-a1.log`, `perf/final-nofreeze-a1.log` at `70a30d83` |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | `build/accept-ai-partition-a1.log`, `build/accept-ai-slow-a1.log`, `mutate/skip-moved-check-a1.log`, `mutate/any-commit-moves-a1.log` |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | `env.sha` is `70a30d83` in the final JSONs and `5614af70` in the baseline JSONs; `final.patch` holds only this run's hunks |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | baseline fails both lines with the probe's own text (`perf/base-nofreeze-a1.log`); the planted slowdown fails flat (`perf/cand-plant-a1.log`) |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | Cause History C1 and C2 |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | `build/accept-typecheck-ai-react-a1.log`, `build/typecheck-specs-final-a1.log` against `build/typecheck-specs-base-a1.log`, `build/lint-task-a1.log` |
| Browser surface proof | no | N/A: no browser surface; the draft runs in the plugin API | N/A: headless |
| Changeset/release artifact | yes | Add only for published package behavior/API changes, otherwise N/A | `.changeset/ai-suggestion-stream-speed.md` |
| Benchmark plan complete validation | yes | Run validator with `--complete` | `build/validate-plan-complete-a2.log` |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-11-ai-draft-projection-benchmark.md` | `build/plan-open-a1.log` |

Verification evidence:
- AI partition at `70a30d83`: 168 pass, 0 fail (`build/accept-ai-partition-a1.log`); 166 pass at `5614af70` (`build/base-ai-partition-a1.log`).
- Final probe reruns at `70a30d83`: `perf/final-real-a1.log` (counts pass) and `perf/final-nofreeze-a1.log` (counts pass, flat fails at 1,000 lists).
- AI partition on the live checkout, other sessions' work included: 168 pass (`build/live-ai-partition-a2.log`, run as `bun test ./packages/platejs/src/ai` because the name-filter form hit EMFILE on ignored run directories in `build/live-ai-partition-a1.log`).

## Close

Reversal first. The frozen `flat` line fails at 1,000 other lists, so the request's "flat in document size" is met only for the draft's own work. The line is not restated. The claim narrows to what the counts line and the timing prove, and a fully flat chunk moves to Open work.

`AIChatPlugin.ts` now keeps the published suggestion as one record with the commit that published it. A later chunk runs the projection and the whole-document diff only after another commit, so a stream with no other edits projects the document once per request. `AIChatPlugin.suggestions.spec.ts` gains two tests: an edit through another view stops later chunks, and a selection-only commit lets the stream continue. `.changeset/ai-suggestion-stream-speed.md` records the speedup for `platejs`.

Proof and its limits:

- The counts line holds on every row at both trees: the draft admits the whole document once, on chunk 1, and runs no whole-document diff after it. The rows cover list and paragraph arms, 1, 5 and 20 edits at 0, 100 and 1,000 other lists, and a document that already holds another suggestion.
- On the real tree, a later chunk's p50 at 1,000 other lists drops from 212 to 33 ms with one edit, 260 to 30 ms with five and 286 to 39 ms with twenty; at 100 lists it drops from 20 to 5.5 ms; the empty-document cohort is unchanged. Five paired samples per arm, load 6.6 to 8.6 on 18 cores, Bun source runs.
- A later chunk still grows about 11 ms from 0 to 1,000 lists with one edit, even with Plite's per-op freeze removed. A profile puts it in Plite's `changes.apply`, which walks every node to adopt its result as a validated baseline, and in the slice fitter. Memoizing that walk removes about 5 ms of it.
- Both new tests fail when their mechanism is removed: skipping the commit check throws "Cannot apply change length 15 to document length 23" on the moved document, and treating any commit as moved stops the stream at "new".
- The AI partition passes at the final tree (168 tests), as do the 30 slow AI tests, the `ai-react` partition typecheck and `lint:task`. The spec typecheck holds the baseline's 271 errors, shifted by the inserted tests.
- A browser stream against a real model is not proven; the probe drives the plugin API that the stream calls.

Of 9 asks and gates, 8 are done and 1 is partial (the flat line); 0 are skipped, blocked or open.

## Open work

- A later AI chunk still grows with the document's top-level width inside Plite. `changes.apply` walks every node to adopt its result as a validated baseline (about 5 ms at 10,000 blocks; a per-node memo removes it), and the slice fitter and each op's top-level array copy and freeze add the rest. owner: zbeyens. stop: a Plite plan that makes a change application and a text op flat in document size, or 2026-12-31. Tracked with the session task "Remove Plite's per-op root array freeze cost", which this measurement widens. Partly done by `2026-10-11-plite-change-width-benchmark.md`: the walk and the slice boundary copy are gone, and this plan's `flat` line now passes on that run's final tree; the root splice remains with the root-freeze plan.
