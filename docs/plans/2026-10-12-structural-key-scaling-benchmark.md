# Flat structural keys in long documents

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/28zHYK4xGa4PpmieP6wCLa
Playbook: perf-issue

This run serves your request to make plain Plate's Enter, Option+Backspace and line-joining Backspace cost the same at any document length, find the step that walks the whole document, fix it at its owner and prove it with a benchmark that fails on today's code at 20,000 blocks and passes after.

## Brief

### What will change?

Enter, deleting a word and joining two lines no longer get slower in longer documents. At 20,000 blocks they took 64 ms to over a second. Now they take 2 to 15 ms, measured on a busy machine.

### What could go wrong?

Old and new code give the same results on 154,784 lookups and 3,579 key presses. On a busy machine, the join's timing check passes only sometimes. Once per document, a join right after another delete still pauses about 100 ms.

## Teach

To delete a word, or to find the text just before the caret, Plite lists the spots between the caret and the top of the document and uses the first one or two. It built the whole list before handing out the first spot, so every key read every block above the caret.

Finding the previous node had the same problem. It walked down from the top of the document and then flipped the list. Joining two lines also checked every block for empty leftovers and for text to merge.

Now the spots come out one block at a time starting at the caret, the backward walk starts at the caret, and the cleanup after a join checks only the blocks the join touched.

## Main changes

- `positions` in `packages/plitejs/src/editor/positions.ts` walks the text nodes between the range edges lazily, from the edge the caller reads first, and builds each block's positions only when the caller reaches it. `before` and `after` stop after one or two positions, so they read one or two blocks instead of every block between the caret and the document edge.
- `nodes` in `packages/plitejs/src/editor/nodes.ts` walks backward lazily when `reverse` is set, in the exact reverse of the forward order, instead of collecting every match from the document start and reversing the list.
- `previous` in `packages/plitejs/src/editor/previous.ts` matches siblings of `at` by path when no `match` is given, instead of searching the parent's children for each visited node.
- The cleanup after a cross-block delete in `packages/plitejs/src/transforms-text/delete-text-structural-cleanup.ts` visits only the blocks it can remove, and merges neighboring text only inside the top-level blocks the delete touched, which `delete-text.ts` now passes in.
- `packages/plitejs/test/structural-key-work.test.ts` counts the element and text checks each key makes at 100 and 2,000 blocks, and fails when Enter, a word delete or a line join reads more of a longer document.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the speed is proven | A count of the work each key does, which a busy machine can't skew, plus the timing check (look) | Rerun the timing on a quiet machine before trusting the numbers | quiet-rerun | small |
| Browser proof of the keys | Skipped. The proof times the editor without a browser, as a stand-in for real key presses (look) | Time real Enter and Backspace presses in Chromium on a 20,000-block page | browser-proof | small |
| Merging text after a join | Only inside the blocks the join touched. Earlier edits already merged the rest (look) | Check every block after each join, as before, which costs about 10 ms at 20,000 blocks | full-merge-scan | small |
| Line joins in scope | Fixed too, since they were slow for the same reason. You named only Enter and word delete (look) | Leave joins as they were | no-join-fix | small |
| One-time pause when a join follows a delete | Left alone. It happens once per document, in code another plan is already changing (look) | Fix it now, so the undo history reuses the positions it already knows | first-merge-index | small |

## Benchmark Source

- request: "plain Plate editing has a per-key cost that grows linearly with document length for structural keys ... find which step of insertBreak and of word-unit delete walks the whole document ..., fix it at its owner so these keys cost the same at any document length, and prove it with a benchmark that fails on today's code at 20,000 blocks and passes after"
- scope: plain Plate `insertBreak`, word-unit `delete` and a line-joining character `delete`, headless, with the basic-blocks plugin set
- invocation: `$benchmark only structural-key owner microbench`
- candidate-identity: fingerprint: `6fa1169c5e` plus this run's own diff, sha256 `3f3e6319b247d410`, applied alone in a detached worktree (`artifacts/2026-10-12-structural-key-scaling/final-candidate.patch`, `final-keys-diff-a1.log`)
- plate-main-identity: N/A: origin/main (`45aee8fd81`) is the Slate-based Plate line with no `plitejs` package and no `editorCommands`, so the headless key workload has no matching surface there
- plite-identity: commit: `6fa1169c5e723eb3e058697189cdcad85be220f9` plus the checkout's uncommitted `packages/plitejs` and `packages/platejs` work (diff sha256 `991767a2f388735b` at intake); the pre-edit copies of `positions.ts`, `nodes.ts`, `previous.ts` and `delete-text-structural-cleanup.ts` equal HEAD; `delete-text.ts` held another session's uncommitted work, so only this run's hunks were applied to the candidate (`artifacts/2026-10-12-structural-key-scaling/identity-base-a1.txt`)
- slate-identity: N/A: only - explicitly narrowed to the owner fix and its benchmark
- named-symptom: at 20,000 paragraphs, Enter takes 89 ms and a word delete 58 ms against 1.9 and 1.3 ms at 100, while a letter stays near 1 ms (`artifacts/2026-10-12-suggestions-complete/m2/plain-1.jsonl`)
- final-artifacts: artifact: `artifacts/2026-10-12-structural-key-scaling/final-pair-a1.log`, `final-join-pair-a1.log` to `a3`, `final-work-test-a3.log`, `work-test-head-a3.log`, `final-diff-a1.log`, `final-keys-diff-a1.log`, `final-plite-tests-a2.log`, `final-plate-tests-a1.log`, `final-typecheck-a1.log`, `residual-probes-a1.log`

Boundaries:
- allowed runtime/packages/apps: `packages/plitejs/src/editor/positions.ts`, `packages/plitejs/src/editor/nodes.ts`, `packages/plitejs/src/editor/previous.ts`, `packages/plitejs/src/transforms-text/delete-text-structural-cleanup.ts`, and this run's hunks in `packages/plitejs/src/transforms-text/delete-text.ts`; not `root-change.ts` or `snapshot-index.ts`
- allowed benchmark/tests/fixtures: the benchmark and probes in this run's directory; one plitejs work-count test, named in `CODING_STANDARDS.md`'s per-keystroke row
- allowed baseline checkouts/hosts: this checkout before the edit, with pre-edit copies in `artifacts/2026-10-12-structural-key-scaling/pre-edit/`, and detached worktrees from `tooling/scripts/proof-worktree.mjs`
- non-goals: the per-op copy and freeze of the top-level list, which `2026-10-11-ai-list-scaling-benchmark.md` keeps open as the structural-width item; browser key latency; pagination

## Interaction Coverage

- first-interaction: N/A: headless model time; no browser reporter is involved
- settled-interaction: N/A: headless model time; no browser reporter is involved
- route-scope: N/A: no route; the benchmark builds editors directly
- reporter-profile: N/A: the reporter's rows come from a headless bun harness, not a browser profile

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | `6fa1169c5e` plus this run's diff `3f3e6319b247d410` | `6fa1169c5e` with no diff (`e3b0c44298fc1c14`) | artifact: `final-keys-diff-a1.log`, `final-pair-a1.log` |
| lockfile / package manager | worktree at `6fa1169c5e`, lockfile unchanged, dependencies linked | same | artifact: `final-pair-a1.log` |
| build mode / host / port | bun 1.3.12 source run, `NODE_ENV=test`, alias preload | same | artifact: `run-pair.sh`, `final-pair-a1.log` |
| browser / machine / viewport / DPR | none; 18-core Apple arm64 host | same | artifact: `final-pair-a1.log` (load per side) |
| route / fixture / document / plugins | n paragraphs `line<i> word0 ... word29`, basic-blocks plugins | same | artifact: `keys.bench.run.ts` |
| setup / action / DOM strategy | caret mid-line in the middle block; join at that block's start | same | artifact: `keys.bench.run.ts` |
| warmups / samples / interleave order | 2 warm keys then 12 timed keys; join 7 fresh editors; sizes 100, 5,000, 20,000; base then candidate | same | artifact: `run-pair.sh`, `final-pair-a1.log` |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Benchmark Source request |
| `benchmark` source and methodology read | yes | loaded `benchmark` and read `methodology.md` in full before the plan |
| Existing plan reused | yes | no open benchmark plan covers structural key scaling |
| Candidate and baseline identities recorded | yes | `artifacts/2026-10-12-structural-key-scaling/identity-base-a1.txt` |
| Target/runner discovery completed from current source | yes | no target in `benchmarks/targets/slate-v2.json` times Plate structural keys by document length; the reporter's harness is the honest owner, copied into `keys.bench.run.ts` |
| Host/build/fixture freshness proved | yes | source run through the alias preload, no build step |
| Correctness oracle identified | yes | the final document and selection hash per cell must match the baseline; `pnpm --filter plitejs test` |
| All default lanes inventoried | yes | Benchmark Lane Table |
| `only` narrowing explicitly authorized or N/A | yes | the request names the proof: a benchmark failing at 20,000 blocks today and passing after |
| Browser/native proof strategy selected | yes | N/A: headless model time, labeled a proxy; Defaults row `browser-proof` |
## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | `identity-base-a1.txt` | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - origin/main has no Plite and no `editorCommands` | `git ls-tree origin/main packages/` | none |
| 3 | plate-vs-plite-decomposition | yes | complete | `decomp-plite-base-a1.log`: a plain Plite editor with no plugins grows the same way (Enter 1.90 to 71.47 ms, word delete 1.54 to 59.00 ms, join 3.55 to 199.22 ms from 100 to 20,000 blocks); Plate's extra join cost runs through Plite's `previous` | none |
| 4 | owner-microbench-and-trace | yes | complete | `bench-base-a1.log`, `prof-enter-a1/`, `prof-word-a1/`, `prof-join-a1/`, `prof-join-cand-a2/`, `pair-a2.log` to `pair-a4.log`, `final-pair-a1.log`, `final-join-pair-a1.log` to `a3`, `work-test-head-a3.log`, `final-work-test-a3.log`, `residual-probes-a1.log` | none |
| 5 | product-mount-matrix | no | N/A: only - explicitly narrowed to the owner fix and its benchmark | request | none |
| 6 | trusted-editing-matrix | no | N/A: only - explicitly narrowed to the owner fix and its benchmark | request; Defaults row `browser-proof` | none |
| 7 | plite-vs-pinned-slate | no | N/A: only - explicitly narrowed to the owner fix and its benchmark | request | none |
| 8 | example-breadth | no | N/A: only - explicitly narrowed to the owner fix and its benchmark | request | none |
| 9 | large-and-stress | yes | complete | `pair-a4.log` and `final-pair-a1.log`: the 5,000 and 20,000 cohorts, base and candidate; `final-join-pair-a1.log` to `a3` at 20,000 | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause proven
- lane: N/A: no cause proven
- comparable-baseline: N/A: no cause proven
- material-delta: N/A: no cause proven
- isolated-owner: N/A: no cause proven
- causal-intervention: N/A: no cause proven
- correctness-guard-result: N/A: no cause open; C1 to C4 closed in Cause History
- fix-class: N/A: no cause proven
- long-term-target: N/A: no cause proven
- decision-owner: N/A: no cause proven
- layer-plan: N/A: no cause proven
- compatibility-verdict: N/A: no cause proven
- fix-owner: N/A: no cause proven
- benchmark-command: N/A: no cause proven
- benchmark-rerun: N/A: no cause proven
- benchmark-rerun-result: N/A: no cause open; C1 to C4 closed in Cause History
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: N/A: no cause open; C1 to C4 closed in Cause History
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| C1-positions-eager | owner-microbench-and-trace | kept | internal-implementation | `positions` walks the text nodes between the range edges lazily from the edge the caller reads first, so `before` and `after` read one or two blocks | benchmark | N/A: internal implementation, no layer adoption | N/A: no public signature or result changes; `diff-a2.log` compares 154,784 old and new results with no difference | `packages/plitejs/src/editor/positions.ts` | the Enter and word-delete profiles spend most key time in `positions` building segments for every block above the caret (`prof-enter-a1/`, `prof-word-a1/`); with the lazy walk Enter and word delete go flat (`pair-a2.log`) | pass: `diff-a2.log`, `mutants-a1.log` | `run-pair.sh <attempt>` | pass: `pair-a4.log` candidate enter 2.70 / 3.61 ms and word delete 1.37 / 2.48 ms at 100 / 20,000 blocks; base 3.85 / 78.38 and 1.62 / 64.40 | `run-keys-diff.sh <attempt>` | pass: `keys-diff-a3.log` 3,579 cases, 0 differences | `pair-a4.log`, `work-test-head-a1.log` |
| C2-nodes-reverse-buffer | owner-microbench-and-trace | kept | internal-implementation | `nodes` with `reverse` walks backward lazily in the exact reverse of the forward order | benchmark | N/A: internal implementation, no layer adoption | N/A: same results in all three modes, `diff-a2.log` | `packages/plitejs/src/editor/nodes.ts` | `previous` walked every node from the document start to the caret and reversed the list (`prof-enter-a1/`, `prof-join-a1/`); the lazy walk removes those frames (`prof-join-cand-a2/`) | pass: `diff-a2.log`, `mutants-a1.log` | `run-pair.sh <attempt>` | pass: `pair-a4.log` as C1 | `run-keys-diff.sh <attempt>` | pass: `keys-diff-a3.log` | `pair-a4.log` |
| C3-previous-includes | owner-microbench-and-trace | kept | internal-implementation | `previous` with no `match` matches siblings of `at` by path | benchmark | N/A: internal implementation, no layer adoption | N/A: same results, `diff-a2.log` | `packages/plitejs/src/editor/previous.ts` | the Plate join profile spends 55% of its time in `Array.prototype.includes` under `previous` (`prof-join-a1/`); with C1 to C3 the join drops from 989.65 to 101.94 ms at 20,000 blocks (`pair-a2.log`) | pass: `diff-a2.log`, `mutants-a1.log` | `run-pair.sh <attempt>` | pass: `pair-a4.log` join 5.69 / 6.73 ms at 100 / 20,000 blocks; base 5.31 / 1180.03 | `run-keys-diff.sh <attempt>` | pass: `keys-diff-a3.log` | `pair-a4.log` |
| C4-delete-cleanup-scan | owner-microbench-and-trace | kept | internal-implementation | the delete's empty-block and text-merge cleanup visits only what the delete touched: the removable blocks of its range and the top-level blocks it spans | benchmark | N/A: internal implementation, no layer adoption | N/A: no public API; `keys-diff-a3.log` shows the same results, and the merge scope relies on committed documents holding no mergeable neighbors | `packages/plitejs/src/transforms-text/delete-text-structural-cleanup.ts`, `packages/plitejs/src/transforms-text/delete-text.ts` | after C1 to C3 the join profile spends its time in `removeEmptyStructuralArtifacts` and `mergeAdjacentTextRuns` collecting every element and text (`prof-join-cand-a2/`); scoping them takes the join from 12.77 ms (`pair-a3.log`) to 6.73 ms at 20,000 blocks (`pair-a4.log`) | pass: `keys-diff-a1.log` | `run-pair.sh <attempt>` | pass: `pair-a4.log` | `run-keys-diff.sh <attempt>` | pass: `keys-diff-a3.log`, `cleanup-mutants-a1.log` | `pair-a4.log`, `keys-diff-a3.log` |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| base-a1 | owner-microbench-and-trace | baseline | enter 6.19 / 28.71 / 123.94 ms, word 2.36 / 28.43 / 109.56 ms, join 12.58 / 241.27 / 1301.80 ms, letter 1.83 / 1.76 / 1.75 ms, backspace 1.57 / 1.51 / 2.12 ms at 100 / 5,000 / 20,000 | hashes recorded | keep as baseline | fix |
| pair-a2 | owner-microbench-and-trace | C1 to C3 | candidate enter 4.02 / 3.70 / 4.26, word 1.49 / 1.05 / 1.30, join 3.22 / 19.23 / 101.94 ms; base enter 2.21 / 18.29 / 65.82, word 1.52 / 12.54 / 52.76, join 4.40 / 110.79 / 989.65 ms | every result hash matches base | keep | profile the join |
| pair-a3 | owner-microbench-and-trace | C4 exact cleanup, merge pass still scans every block | candidate join 3.13 / 5.24 / 12.77 ms | every result hash matches base | keep, then scope the merge pass | scope the merge pass |
| pair-a4 | owner-microbench-and-trace | C4 scoped merge pass | candidate enter 2.70 / 2.32 / 3.61, word 1.37 / 1.90 / 2.48, join 5.69 / 5.97 / 6.73, letter 1.00 / 1.01 / 1.17, backspace 1.26 / 1.38 / 1.14 ms; base enter 3.85 / 20.68 / 78.38, word 1.62 / 13.27 / 64.40, join 5.31 / 128.67 / 1180.03 ms | every result hash matches base | keep | final acceptance on final bytes |
| final-a1 | owner-microbench-and-trace | final bytes, load 35 to 43 | candidate enter 5.65 / 8.86, word 3.05 / 2.44, join 4.65 / 13.34, letter 2.52 / 1.90, backspace 2.23 / 2.25 ms at 100 / 20,000; base enter 7.37 / 331.02, word 2.68 / 90.61, join 8.64 / 1636.02 ms | every result hash matches pair-a4 | join misses its line on the candidate | rerun join and Enter |
| final-join-a1 to a3 | owner-microbench-and-trace | final bytes, load 15 to 29 | candidate enter 6.31, 5.57, 8.07 and join 13.85, 14.91, 10.15 ms at 20,000 against limits 13.12, 17.54, 13.56; base enter 117.37, 108.50, 103.72 and join 1369.37, 1395.29, 1441.25 ms | hashes as before | join passes 2 of 3 | explain the join's time |
| residual | owner-microbench-and-trace | what is left in a candidate join | warm joins 3 to 10 ms at 20,000 blocks; first undo merge 90 to 150 ms once per editor; 888 element and text checks per join at both sizes | joins land, block counts checked | record; accept the timing under `quiet-rerun`; leave the stall under `first-merge-index` | close |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| enter, median of 12 keys, 20,000 blocks | 12 per side per cohort, one packet each; p75 to p99 omitted with 12 samples | p50 78.38, max 82.68 ms | p50 3.61, max 4.45 ms | -74.77 ms / -95% | host load 17 to 22 on 18 cores, so timing is inconclusive; the work count decides | `pair-a4.log` |
| word delete, median of 12 keys, 20,000 blocks | 12 | p50 64.40, max 68.04 ms | p50 2.48, max 3.04 ms | -61.92 ms / -96% | as above | `pair-a4.log` |
| line join, median of 7 fresh editors, 20,000 blocks | 7 | p50 1180.03, max 1463.87 ms | p50 6.73, max 17.64 ms | -1173.30 ms / -99% | as above | `pair-a4.log` |
| enter and join, final bytes, 20,000 blocks | 12 keys; 7 fresh editors; 4 runs | enter 103.72 to 331.02, join 1369.37 to 1636.02 ms | enter 5.57 to 8.86, join 10.15 to 14.91 ms | about -95% and -99% | load 15 to 43; join meets its line in 2 of 4 runs | `final-pair-a1.log`, `final-join-pair-a1.log` to `a3` |
| type checks per press, 2,000 against 100 blocks | 2 presses per size | Enter [228, 33,306] against [228, 1,956]; word 19,179 against 1,129 per press; join [181,579, 181,508] against [9,629, 9,558] | equal at both sizes for all three keys | deterministic | exact | `work-test-head-a3.log`, `final-work-test-a3.log` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | `final-pair-a1.log`, `final-join-pair-a1.log` to `a3`, `final-work-test-a3.log`, `final-keys-diff-a1.log`; the join's timing line accepted under `quiet-rerun` |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-12-structural-key-scaling-benchmark.md` at cause/resume checkpoints | structurally valid at the close |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Benchmark Lane Table: lanes 1, 3, 4 and 9 complete; 2 and 5 to 8 N/A with reasons |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | `final-pair-a1.log` and `final-join-pair-a1.log` to `a3`, base and candidate worktrees in one script |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | `final-plite-tests-a2.log` 3,447 pass; `final-plate-tests-a1.log` with HEAD's one failure; browser proof skipped under `browser-proof` |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | every final log prints head `6fa1169c5e` and diff `3f3e6319b247d410` or `e3b0c44298fc1c14`; the checkout's four product files are byte-identical to the candidate worktree's, and this run's 16 lines in `delete-text.ts` match |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | result hashes match across sides and runs; the planted read failed the line (`plant-a1.log`); the join cell times one join per fresh editor, so `residual-probes-a1.log` covers repeated joins |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | Cause History C1 to C4: internal implementation at each owner, no public API |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | `final-typecheck-a1.log` 13 of 13; `lint-task-a3.log` clean |
| Browser surface proof | N/A: headless model time; Defaults row `browser-proof` | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | N/A: headless model time |
| Changeset/release artifact | yes | Add only for published package behavior/API changes, otherwise N/A | `.changeset/plitejs-structural-key-cost.md`, plitejs patch |
| Benchmark plan complete validation | yes | Run validator with `--complete` | passes at the close |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-12-structural-key-scaling-benchmark.md` | passes at the close |

Verification evidence:
- Old and new reads, by `node .agents/pstack/proof.mjs --name final-diff` and `--name final-mutants` (`artifacts/2026-10-12-structural-key-scaling/final-diff-a1.log`, `final-mutants-a1.log`).
- Old and new keys, by `run-keys-diff.sh final` and `cleanup-mutants.sh` (`final-keys-diff-a1.log`, `final-cleanup-mutants-a1.log`).
- Work count, by `bun test ./test/structural-key-work.test.ts` in both worktrees (`final-work-test-a3.log`, `work-test-head-a3.log`).
- Timing, by `run-pair.sh final` and `KEYS_OPS=backspace-join,enter run-pair.sh final-join-<n>` (`final-pair-a1.log`, `final-join-pair-a1.log` to `a3`).
- What is left in a join, by `residual-probes.sh` (`residual-probes-a1.log`), `join-first-write-cand-a1.log`, marked profiles `prof-join1-marked-a1/` and `prof-join2-marked-a1/` read by `window-profile.py`.
- Suites, plitejs (`final-plite-tests-a1.log`, timeout attributed by `record-law-x10-cand-a1.log`, `record-law-x10-base-a1.log` and `record-law-timeout-control-a1.log`; rerun `final-plite-tests-a2.log`), platejs (`final-plate-tests-a1.log` against `plate-fails-base-a1.log`), typecheck (`final-typecheck-a1.log`), lint (`lint-task-a3.log`).

## Close

Reversals and deviations come first.

- This run also fixed line joins, though the request named only Enter and word delete, because joins slowed down for the same reasons (Defaults `no-join-fix`).
- This run corrected the work test's join case at the close. In its first version the second press landed mid-line after the first join and deleted a character, so only one press joined. Now each press starts at a line start, so both presses join. All three cases fail at HEAD and pass on the fix (decision log, `corrected` row).
- The timing proof narrows. The frozen benchmark fails on today's code in every run. On the final bytes, Enter and word delete pass in every run, and the join passes in 2 of 4 runs at load 15 to 43 on 18 cores. `pair-a4.log`, on the bytes before the writing passes, also passed. The join misses by up to 3 ms at 20,000 blocks. The first-join profile puts that time in the normal join path and in the per-op copy of the top-level list, which this plan left out of scope. This run accepted the timing under `quiet-rerun`, and the deterministic work count decides.

What landed, uncommitted on `next`:

- the lazy `positions` walk, the lazy reverse `nodes` walk, the path-based `previous` default and the scoped delete cleanup, as Main changes lists them;
- `packages/plitejs/test/structural-key-work.test.ts` and its clause in `CODING_STANDARDS.md`'s per-keystroke row;
- `.changeset/plitejs-structural-key-cost.md`.

Proof, taken from each decision-log row's scope:

- The old and new reads compared every yielded value and thrown message of `positions` (5 units, both directions, voids on and off), reverse `nodes` (3 modes, 5 matches, `pass` on and off) and `previous`, over 4 documents with nesting, inlines, atoms, voids, read-only and non-selectable elements. They agree on all 154,784 comparisons on the final bytes, and three planted mutants give 27,697, 10,160 and 165 differences.
- The old and new keys compared the document and selection hash after each of 7 keys at every position, and after range delete and range Enter, over 5 documents. They agree on all 3,579 cases, and three cleanup mutants give 80, 4 and 8 differences.
- The work test counts element and text checks per press, two presses each, at 100 and 2,000 blocks. At HEAD Enter makes [228, 1,956] against [228, 33,306], word delete 1,129 against 19,179, and the join [9,629, 9,558] against [181,579, 181,508]. On the fix each key makes the same count at both sizes.
- At 20,000 blocks on the final bytes, base Enter took 103.72 to 331.02 ms, word delete 90.61 ms and the join 1,369.37 to 1,636.02 ms. The fix took 5.57 to 8.86 ms for Enter, 2.44 ms for word delete and 10.15 to 14.91 ms for the join. A letter and a Backspace stayed at 1.9 to 2.3 ms.
- All 3,447 plitejs tests pass. The first run's one failure was the authored undo recording law at 7,800 ms, which hit bun's 5,000 ms limit on the loaded host. It passes alone on both sides, 4,000 random cases per side pass, and a forced limit prints the same failure line. platejs passes 2,987 tests and fails the one import test that also fails at HEAD. Typecheck passes 13 of 13 tasks, and lint is clean.

Limits:

- The timings are headless model time, with no browser key presses (Defaults `browser-proof`). The host ran at load 15 to 43 on 18 cores, so every timing is rough.
- The work count sees only walks that ask whether a node is an element or a text. The one-time path index build under Open work asks neither, so only the repeated-join probes found it.
- The benchmark's join cell times one join per fresh editor, so it never sees the stall on the first undo merge.
- The planted read of every block failed the frozen line only through the letter row. The Enter row's 6 ms of slack at 20,000 blocks let it through.
- Merging text only inside the touched blocks relies on committed documents holding no mergeable neighbors. A protected inline spacer next to an equal text could break that, and a probe could not build that state (`spacer.probe.run.ts`).

Of 25 todo items, 22 are done and 3 skipped (opening a PR, the panel review and the decision-trail review), with none partial, blocked or open.

## Open work

- The first join that merges into an earlier delete's undo step builds the whole snapshot path index, once per document. It takes 90 to 150 ms at 20,000 blocks, through `createHistoryBatchGroup` and commit `paths` into `pathOf` in `snapshot-index.ts`. Enter's first press costs 20 to 36 ms, and a join after it no longer stalls, so Enter likely builds the same index; that is inferred, not profiled. owner: the owner. stop: M2 of `2026-10-12-keys-proposed-lines.md`, which counts index builds per key and times a cold first key at 20,000 blocks, lands with a budget that covers this, or the owner drops it (Defaults `first-merge-index`). Tracked here.
- The authored undo recording law takes about 3 s alone against bun's 5 s default limit, and it timed out at load 35 to 43. owner: the owner. stop: the law gets its own limit or fewer cases, or the owner drops it. Tracked here.
- `positions.ts` reverses each run twice on the character path, and `collectBlockBoundaryPoints` regroups segments that are not adjacent. Folding both into the walk would let two comments go. owner: the owner. stop: a refactor of `positions.ts` lands, or the owner drops it. Tracked here.
- `delete-text-structural-cleanup.ts` keeps its own `isTextNode` and `valuesEqual`, which copy `textPropertiesEqual` in `core/content-completion.ts`. Commit canonicalization may also make `mergeAdjacentTextRuns` unnecessary, though a mutant that never merges changes 4 of 3,579 cases. owner: the owner. stop: a cleanup of that file lands, or the owner drops it. Tracked here.
