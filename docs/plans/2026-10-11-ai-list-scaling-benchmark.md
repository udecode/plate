# AI insert and paste: what grows with the document

Status: planned: diagnosis done; the shared key index fix waits on your go
Page: https://claude.ai/artifact/UtwgU7GMAEe9oU466Vy2Zo
Playbook: perf-issue

This run serves your request "Diagnose AI insert and paste scaling with other lists". The AI list landing plan's step 1.0 probe (`2026-10-11-ai-list-landing.md`) measured an AI insert below a 10-item list growing from 2.2 to 33 ms, and a 10-item list paste from 3.7 to 16 ms, between 0 and 1,000 other 10-item lists. This run finds which owner's work grows, with counts and timings, and writes the fix plan. It builds nothing.

## Brief

### What will change?

You get the cause and a fix plan. With go, a 10,000-block document's first edit that looks up a block, like an AI insert, saves 30 ms. Paste and insert stay 6 to 13 ms slower until a Plite fix.

### What could go wrong?

The fix lets edits reuse the lookup table that reads already filled. If an edit ever used a table from another version of the document, it would change the wrong block. The tests pass with the change in place.

## Teach

To change a block, Plate finds it by its id. Plite keeps a table of where each block sits, and fills it in only as far as each lookup needs.

Reading and editing keep separate tables today. The AI found its block through the reading table, but the editing table starts empty. So the first edit that finds a block by id walks all 10,000 blocks, which takes about 30 ms. That happens once per editor, because later edits keep the filled table.

Paste and insert have a different cost that comes back on every edit. Each one copies the list of top-level blocks and locks the copy against changes, four times for one paste. The fix plan shares the table. The Plite session that already removes the same locking for typing takes the locking work.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Who fixes the cost paid on every edit | The Plite session that already removes the same locking for typing; I sent it these numbers (look) | Fix it in this plan too | fix-width-here | big |
| Where this report lives | Its own page, since the reads page already shows that Plite plan (safe) | Put it on the reads page | reads-page | detail |

## Main changes

Planned, not built:

- plitejs `core/public-state.ts`: a transaction's base snapshot takes the key index that the read projection already holds for the same committed children array, instead of building its own empty lazy index. Reads and the first transaction then resolve keys from one table, and later commits branch their index from it, as they do today.

## Findings

All numbers are p50 over 7 samples per row on tree `93cdf662`, Bun 1.3.12 (JavaScriptCore), 18 cores, load 5 to 10. Each row builds a fresh Plate editor with the full plugin set (Authored, Paragraph, Heading, List, Table, AI, Markdown with GFM, AIChat) on 0, 100 or 1,000 other 10-item lists plus a 10-item target list, then times one action. The core-time profiler counts phases, and an `Object.freeze` wrapper counts the array elements frozen inside the action. Artifact paths below are under `docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/`.

1. A cold AI insert at 1,000 lists costs 37.5 to 40.5 ms, against 3.7 to 4.6 ms at 0 lists, and 26 to 29 ms of it is one `runtime-index-full-build`. `getActionChatBlocks` calls `tx.nodes.get(nodeKey)`, which reaches `getPathByNodeKey`, then `pathOf`, then `materialize` on the transaction's base snapshot index. That index is a separate lazy index from the read projection's, which already resolved the key through `editor.key([target])`. Sharing the projection's index (control `share-projection-index`) drops the row to 10.1 ms with 0 full builds and 21,836 frozen elements instead of 141,939.
2. The build happens once per editor. On one editor at 1,000 lists, the first key-reading update takes 24 to 35 ms with one build. Every later one takes 0.2 to 0.6 ms with none, including after a text commit (`probe/plate-repeat-a1.log`, `probe/plate-repeat-a2.log`). The cold row therefore measures a one-time stall that the first keyed transaction pays, whichever command it is. It is not a per-insert cost.
3. A warm AI insert, with that build paid in setup, costs 9.1 to 9.8 ms at 1,000 lists against 2.3 to 3.0 ms at 0 lists, and freezes 21,757 elements against 1,757. The full config's 0-list row reads 6.3 to 6.7 ms in three of four runs and 2.9 ms in the fourth, a warm-up effect of the first cohort that the 100-list rows do not show. Sharing the index leaves it at 9.5 ms. Dropping the splice freeze (control `no-splice-freeze`) makes it 7.0 ms and 11,736 elements.
4. A paste costs 16.6 to 20.8 ms at 1,000 lists against 4.0 to 6.8 ms at 0 lists, and freezes 53,976 elements against 3,952. Repeat pastes on one editor still cost 15 to 25 ms each (`probe/plate-repeat-a2.log`). Four freezes of the 10,011-entry top-level array cause it. All four run in `spliceIndexedChildren`, called from `removeNode`, from `replaceChildren` and twice from `captureAuthoredChange` in the authored change capture. Dropping that freeze makes the paste 10.0 ms and 13,916 elements. A raw 10-node insert goes from 8.6 to 10.2 ms down to 6.7 ms, and from 21,250 to 11,229 elements.
5. One more top-level-wide freeze per edit remains after that. The authored checkpoint snapshot in `authored.ts` `finish` clones the fresh top-level array, because nothing registered it as an owned value, then freezes the copy. It runs with or without AuthoredPlugin.
6. Dropping AuthoredPlugin or the list plugin changes none of these rows beyond noise. Their frozen-element counts match within 34 elements, and paste at 1,000 lists reads 15.9 to 20.8 ms across the three configs and two runs.
7. Raw Plite pastes cost 1.7 ms at 0 lists and 6.4 ms at 1,000 lists (one-sample sizing run). A raw Plite insert's first structural op on a fresh editor builds `DocumentIndex.fromValue` for the whole document, 64 to 92 ms at 10,011 blocks. Later inserts on that editor cost about 3 ms (`probe/plite-insert-repeat-a1.log`). The probe's raw `insertNodes:plite` row measured that first-op build, so it is quarantined. Plate editors seem to build that index before their first edit, since a Plate paste on a fresh editor shows no such cost (inferred, not traced).

These are model-level timings in Bun, without React rendering or a browser. In JavaScriptCore (Bun, Safari), `Object.freeze` takes time in the array's length, so findings 3 to 5 may cost less in Chrome. The index build in finding 1 walks every node in any engine.

## Fix plan

- [ ] 1. In plitejs `core/public-state.ts`, give the transaction base snapshot the read projection's index for the same children array. The `share-projection-index` control is the prototype. Add a plitejs test that reads a key, then updates through it, and asserts that no full index build runs. Proof: the cold row reruns with 0 full builds, the warm rows stay level, and `bun test packages/platejs/src/ai` and `pnpm --filter plitejs test` pass.
- [ ] 2. Rerun the exact red benchmark command and the correctness command. Record a kept Cause History row, set the checkpoint to green, and resume lane 5.
- [ ] 3. Run lanes 5 to 9 from their baselines: product mount, a browser paste and AI insert, the pinned Slate paste, the AI and paste examples, and the stress cohorts.

## Benchmark Source

- request: "Diagnose AI insert and paste scaling with other lists": find which owner's work grows with document size for AI insert below a 10-item list and a 10-item list paste at 0, 100 and 1,000 other 10-item lists (measured 2.2 to 33 ms and 3.7 to 16 ms); isolate with causal toggles (drop AuthoredPlugin, drop the list plugin, raw Plite insert); report counts and timings; write the fix plan; record load averages and prefer deterministic work counts; never commit or push `next`.
- scope: AI insert below (`AIChatPlugin` `insertBelow`), a closed 10-item list paste (`editor.update.slice.replace`) and a raw 10-node `tx.nodes.insert`, at 0, 100 and 1,000 other 10-item lists
- invocation: `$benchmark AI insert and paste scaling with other lists`
- candidate-identity: commit: `93cdf6628a7f410f82d4c7f0214dd18a9dd36234` (a `freeze.mjs` commit of the checkout's packages, other sessions' work included), checked out at `scratchpad/wt-scale`
- plate-main-identity: N/A: lane 2 is inapplicable; `origin/main` is `45aee8fd81a596fad5efc4e61ab377bb225fb11c`
- plite-identity: commit: `93cdf6628a7f410f82d4c7f0214dd18a9dd36234` (the same tree's `packages/plitejs`)
- slate-identity: commit: `945a484df2497e4c448b33f417b0de2a49840032` (`../slate`, remote `github.com/zbeyens/slate`), for lane 7 when it resumes
- named-symptom: AI insert below a 10-item list 2.2 to 33 ms and a 10-item list paste 3.7 to 16 ms from 0 to 1,000 other 10-item lists (the AI list landing plan's step 1.0 probe)
- final-artifacts: pending

Boundaries:
- allowed runtime/packages/apps: none in this run; the fix plan names `packages/plitejs/src/core/public-state.ts`
- allowed benchmark/tests/fixtures: the probes and controls in `docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/`
- allowed baseline checkouts/hosts: the detached measurement worktree at `93cdf662`, on this host
- non-goals: Plite's top-level array copy and freeze (owned by `2026-10-11-plite-wide-children.md`); React rendering cost; the AI suggestion draft (`2026-10-11-ai-draft-projection-benchmark.md`)

## Interaction Coverage

- first-interaction: pending: lane 6 drives a browser paste and AI insert after the fix
- settled-interaction: pending: lane 6
- route-scope: pending: lane 8 picks the AI and paste examples
- reporter-profile: N/A: the symptom came from a measured probe, not a reporter

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | `93cdf662` with one control patched in by `probe/control.mjs` | `93cdf662` | artifact: docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/base.json and docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/c2-share-index.json, whose `env.sha` names the tree and the control; `git -C wt-scale status` is clean after every run |
| lockfile / package manager | the checkout's linked `node_modules`, pnpm lockfile at `93cdf662` | same | artifact: docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/base-a1.log and docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/c2-share-index-a1.log, both run in the same worktree |
| build mode / host / port | Bun 1.3.12 source run, no build; Darwin, 18 cores | same | artifact: docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/base.json `env` block; `foreign` is empty, so every workspace file loaded from the worktree |
| browser / machine / viewport / DPR | no browser; headless Bun on this host | same | artifact: docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/base-load.txt and docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/c2-share-index-load.txt |
| route / fixture / document / plugins | 0, 100 or 1,000 other 10-item lists plus a 10-item target list and an end paragraph; configs full, noAuthored, noList, bare and raw Plite | same | artifact: docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/decompose.spec.ts |
| setup / action / DOM strategy | AI insert below, paste of a closed 10-item list, raw 10-node insert; fresh editor per sample; warm rows run one key-reading update in setup | same | artifact: docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/decompose.spec.ts (`PROBE_WARM`) |
| warmups / samples / interleave order | 2 warmups, 7 samples per row, configs rotate per sample | same | artifact: docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/decompose.spec.ts |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Benchmark Source request |
| `benchmark` source and methodology read | yes | skill and `references/methodology.md` loaded at intake and after each compaction |
| Existing plan reused | yes | no active plan names this symptom; the landing plan holds it only as a step 1.0 measurement |
| Candidate and baseline identities recorded | yes | Benchmark Source |
| Target/runner discovery completed from current source | yes | the step 1.0 probe was the honest owner; `probe/decompose.spec.ts` extends it with configs, a raw insert, phases and freeze counts |
| Host/build/fixture freshness proved | yes | `foreign` is empty in every JSON; each row asserts the block count before and the landed blocks after |
| Correctness oracle identified | yes | `bun test packages/platejs/src/ai` and `pnpm --filter plitejs test` |
| All default lanes inventoried | yes | Benchmark Lane Table |
| `only` narrowing explicitly authorized or N/A | yes | N/A: no `only` narrowing; lane 2 is inapplicable |
| Browser/native proof strategy selected | yes | lane 6 drives a browser paste and AI insert after the fix |

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | `93cdf662` worktree; `foreign` empty in every JSON; base guards pass (`probe/guard-base-ai-a1.log`, `probe/guard-base-plitejs-a1.log`) | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - `origin/main` `45aee8fd` ships Plate v1 split packages on Slate, with none of the measured owners (the Plite snapshot index, its transaction base or the authored change capture), so the same action cannot run there | `git ls-tree origin/main packages/` has no `plitejs` | none |
| 3 | plate-vs-plite-decomposition | yes | complete | full, noAuthored, noList, bare and raw Plite rows (`probe/sizing-a2.log`, `probe/base-a1.log`, `probe/base2-a1.log`); plugin toggles move nothing | none |
| 4 | owner-microbench-and-trace | yes | red | C1 proven by the shared-index control (`probe/c2-share-index-a1.log`); C2 attributed by `probe/c4-no-splice-freeze-a1.log` and `probe/wide-freeze-base-a1.log` and deferred | fix C1 |
| 5 | product-mount-matrix | yes | paused | the fix changes which index a transaction starts from | resume after C1 |
| 6 | trusted-editing-matrix | yes | paused | a browser paste and AI insert in a 10,000-block document | resume after C1 |
| 7 | plite-vs-pinned-slate | yes | paused | a Slate paste at 10,000 blocks against Plite's | resume after C1 |
| 8 | example-breadth | yes | paused | the AI and paste examples | resume after C1 |
| 9 | large-and-stress | yes | paused | the 1,000-list cohort is the large row; stress cohorts come later | resume after C1 |

## Current Cause Checkpoint

- state: proven
- cause-id: C1-cold-key-index
- lane: owner-microbench-and-trace
- comparable-baseline: commit `93cdf662`, `probe/base.json` and `probe/base2.json`
- material-delta: cold AI insert at 1,000 other lists p50 40.5 and 37.5 ms against 10.1 ms with the control; 141,939 against 21,836 frozen elements; 1 against 0 full key-index builds
- isolated-owner: plitejs `core/public-state.ts`: a transaction's base snapshot builds its own lazy key index, so the first `tx.nodes.get(key)` per editor materializes the whole document even though the read projection already resolved that key
- causal-intervention: control `share-projection-index` in `probe/control.mjs` (the base snapshot takes the projection's index for the same children array) removes the build and 30 ms; the warm rows stay at 9.5 ms against 9.1 and 9.8 ms base, so the control moves only the one-time build
- correctness-guard-result: pass: `probe/guard-share-ai-a1.log` (167 pass) and `probe/guard-share-plitejs-a1.log` (21 of 21 tasks, 0 cached) under the control; the baseline passes the same (`probe/guard-base-ai-a1.log`, `probe/guard-base-plitejs-a1.log`)
- fix-class: internal-implementation
- long-term-target: one key index per committed children array, shared by read projections and every transaction's base snapshot, so a key that reads resolved never makes an edit walk the document
- decision-owner: benchmark
- layer-plan: N/A: one Plite internal owner; no layer moves
- compatibility-verdict: N/A: no public API or data change
- fix-owner: plitejs `core/public-state.ts` `getSnapshot`
- benchmark-command: `env PROBE_ROOT=<worktree> PROBE_SAMPLES=7 PROBE_CONFIGS=full,noAuthored,noList PROBE_SHA=<sha> PROBE_OUT=<json> bun test --timeout 900000 docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/decompose.spec.ts`
- benchmark-rerun: `env PROBE_ROOT=<worktree> PROBE_SAMPLES=7 PROBE_CONFIGS=full,noAuthored,noList PROBE_SHA=<sha> PROBE_OUT=<json> bun test --timeout 900000 docs/plans/artifacts/2026-10-11-ai-list-scaling-benchmark/probe/decompose.spec.ts`
- benchmark-rerun-result: pending
- correctness-command: `bun test packages/platejs/src/ai && TURBO_FORCE=true pnpm --filter plitejs test`
- correctness-rerun: `bun test packages/platejs/src/ai && TURBO_FORCE=true pnpm --filter plitejs test`
- correctness-rerun-result: pending
- resume-lane: product-mount-matrix

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| C2-structural-width | owner-microbench-and-trace | deferred | internal-implementation | a structural edit costs time in its depth and the inserted nodes, not in the top-level width: no copy-and-freeze of the whole top-level array per splice, and no re-clone of it in the authored checkpoint | benchmark | N/A: Plite internals, no layer moves | N/A: no public API or data change | plitejs `core/change/document-index.ts` `spliceIndexedChildren` and `authored/authored.ts` `finish`, through `2026-10-11-plite-wide-children.md` | dropping the splice freeze cuts paste 16.6 to 10.0 ms and 53,976 to 13,916 frozen elements, a raw insert 8.6 to 6.7 ms, and a warm AI insert 9.1 to 7.0 ms; `wide-freeze` stacks name the four splice freezes and the checkpoint clone | pass: `probe/guard-base-ai-a1.log` (167 pass) and `probe/guard-base-plitejs-a1.log` (21 of 21 tasks) | the C1 benchmark command, with `PROBE_ACTIONS=paste,insertNodes` and with `PROBE_WARM=1 PROBE_ACTIONS=aiInsert` | N/A: deferred, no fix measured here | `bun test packages/platejs/src/ai && TURBO_FORCE=true pnpm --filter plitejs test` | N/A: no Plite change landed | `probe/c4-no-splice-freeze-a1.log`, `probe/w3-warm-no-splice-freeze-a1.log`, `probe/wide-freeze-base-a1.log`, `probe/wide-freeze-no-splice-deep-a1.log` |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| P1 sizing | plate-vs-plite-decomposition | which config and action grow | one sample per row, all five configs (`probe/sizing-a2.log`) | row asserts | keep | size the protocol at 7 samples |
| P2 base | owner-microbench-and-trace | baseline rows | cold AI insert 40.5 and 37.5 ms, paste 16.6 and 20.8 ms, raw insert 8.6 and 10.2 ms at 1,000 lists (`probe/base-a1.log`, `probe/base2-a1.log`) | row asserts | keep | none |
| P3 select-by-path | owner-microbench-and-trace | AI insert re-resolves its inserted blocks by key | AI insert unchanged (`probe/c1-select-by-path-a1.log`) | row asserts | revert | the stack probes |
| P4 stack probes | owner-microbench-and-trace | which read triggers the full build | 0 builds outside a transaction, 1 on the first key read inside one (`probe/stack-when-a1.log`, `probe/stack-trace-a1.log`) | none | keep | the shared-index control |
| P5 share-projection-index | owner-microbench-and-trace | C1 | cold AI insert 10.1 / 40.5 ms, 0 / 1 builds (`probe/c2-share-index-a1.log`) | `probe/guard-share-ai-a1.log`, `probe/guard-share-plitejs-a1.log` pass | keep | fix plan step 1 |
| P6 no-root-freeze | owner-microbench-and-trace | the top-level freeze in `replaceIndexedChildren` | no change; the control patched a function paste never reaches (`probe/c3-no-root-freeze-a1.log`) | not run | invalidate | P7 |
| P7 no-splice-freeze | owner-microbench-and-trace | C2 | paste 10.0 / 16.6 ms, raw insert 6.7 / 8.6 ms (`probe/c4-no-splice-freeze-a1.log`); both controls together `probe/c5-share-and-no-splice-freeze-a1.log` | not run | defer | `2026-10-11-plite-wide-children.md` |
| P8 wide-freeze stacks | owner-microbench-and-trace | which callers freeze a top-level-wide array | paste 5 (4 splice, 1 checkpoint clone), insert 2 (`probe/wide-freeze-base-a1.log`) | none | keep | message to the root freeze session |
| P9 repeat on one editor | owner-microbench-and-trace | per edit or once | key build once per editor; paste every time (`probe/plate-repeat-a2.log`) | row asserts | keep | warm rows |
| P10 warm rows | owner-microbench-and-trace | per-insert cost without the build | warm AI insert 9.1 and 9.8 ms base, 9.5 shared index, 7.0 no splice freeze (`probe/w1-warm-base-a1.log` to `probe/w4-warm-base-a1.log`) | row asserts | keep | none |
| P11 raw Plite first op | plate-vs-plite-decomposition | why raw insert is 122 ms | the first op builds the document index, 64 to 92 ms; later 3 ms (`probe/plite-insert-repeat-a1.log`, `probe/plite-insert-cpu-a1.log`) | none | quarantine | the raw `insertNodes:plite` row stays out of the per-insert claim |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| cold AI insert, 1,000 lists, full, shared index | 7 / 7 | 40.5/63.6/66.3/-/66.3 ms | 10.1/11.0/12.8/-/12.8 ms | -30.4 ms / -75% | second base run 37.5 ms p50; load 5.2 to 10.5 | `probe/base.json`, `probe/c2-share-index.json` |
| warm AI insert, 1,000 lists, full, shared index | 7 / 7 | 9.1/11.4/14.1/-/14.1 ms | 9.5/9.6/10.4/-/10.4 ms | +0.4 ms / +4% | second base run 9.8 ms; no measurable difference | `probe/w1-warm-base.json`, `probe/w2-warm-share-projection-index.json` |
| warm AI insert, 1,000 lists, full, no splice freeze | 7 / 7 | 9.1/11.4/14.1/-/14.1 ms | 7.0/7.9/11.1/-/11.1 ms | -2.1 ms / -23% | second base run 9.8 ms; load 5.4 to 7.4 | `probe/w1-warm-base.json`, `probe/w3-warm-no-splice-freeze.json` |
| paste, 1,000 lists, full, no splice freeze | 7 / 7 | 16.6/17.9/27.9/-/27.9 ms | 10.0/11.2/13.9/-/13.9 ms | -6.6 ms / -40% | second base run 20.8 ms; load 4.7 to 6.3 | `probe/base.json`, `probe/c4-no-splice-freeze.json` |
| raw 10-node insert, 1,000 lists, full, no splice freeze | 7 / 7 | 8.6/10.0/10.3/-/10.3 ms | 6.7/7.2/7.5/-/7.5 ms | -1.9 ms / -22% | second base run 10.2 ms | `probe/base.json`, `probe/c4-no-splice-freeze.json` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | pending: the C1 rerun after fix plan step 1 |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-11-ai-list-scaling-benchmark.md` at cause/resume checkpoints | pending |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | pending: lanes 4 to 9 |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | pending |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | pending |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | pending |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | the cold row measures a one-time build (P9) and the raw Plite insert row a first-op build (P11); both are named as such |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | Current Cause Checkpoint (C1) and Cause History (C2) |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | pending: plitejs typecheck and tests after step 1 |
| Browser surface proof | yes | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | pending: lane 6 |
| Changeset/release artifact | yes | Add only for published package behavior/API changes, otherwise N/A | pending: a `plitejs` patch changeset if step 1 lands |
| Benchmark plan complete validation | yes | Run validator with `--complete` | pending |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-11-ai-list-scaling-benchmark.md` | pending |

Verification evidence:
- Baseline correctness at `93cdf662`: `probe/guard-base-ai-a1.log` (167 pass) and `probe/guard-base-plitejs-a1.log` (21 of 21 tasks).
- Under the shared-index control: `probe/guard-share-ai-a1.log` (167 pass) and `probe/guard-share-plitejs-a1.log` (21 of 21 tasks).

## Open work

- Plite's per-edit top-level width cost for structural edits (C2): four splice freezes per paste and the authored checkpoint clone, about 6.6 ms of a 16.6 ms paste at 10,000 blocks in Bun. owner: zbeyens. stop: `2026-10-11-plite-wide-children.md` covers structural splices and the checkpoint clone, or 2026-12-31. Tracked in that plan's session ("root freeze"), which got these numbers on 2026-10-11, and under the reads subject's `## Open work` when that plan folds.
- A raw Plite editor's first structural op builds the document index, 64 to 92 ms at 10,000 blocks. owner: zbeyens. stop: lane 9 of this plan records whether a mounted editor ever pays it, or 2026-12-31. Tracked here.
