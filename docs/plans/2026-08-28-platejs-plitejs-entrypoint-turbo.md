# platejs plitejs entrypoint turbo

Objective:
Give `platejs` and `plitejs` entrypoint-aware Turbo checks with exact cache invalidation and development performance at least as good as the former package-wide tasks.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-28-platejs-plitejs-entrypoint-turbo.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: Implement the full Turbo setup for `platejs` and `plitejs` with correct entrypoint-level invalidation and performance at least as good as the pre-change package-level setup.
- scope: Turbo graph, canonical entrypoint DAG, focused runners, CI, consumer dependency ownership, contracts, and timing/cache proof for both packages.
- invocation: `$benchmark platejs plitejs entrypoint Turbo cache`
- candidate-identity: fingerprint: c77b2ee54b18c568f64f90e591dbf5bc31acc079bb820003da9b8561106ee2c1
- plate-main-identity: N/A: inapplicable - the comparison is the captured pre-change package graph on this checkout, not product runtime on `main`.
- plite-identity: fingerprint: c77b2ee54b18c568f64f90e591dbf5bc31acc079bb820003da9b8561106ee2c1
- slate-identity: N/A: inapplicable - no editor substrate comparison is claimed.
- named-symptom: one source change inside either consolidated package invalidated its whole task, discarding the incremental behavior separate packages previously provided.
- final-artifacts: artifact: docs/plans/2026-08-28-platejs-plitejs-entrypoint-turbo.md

First checkpoint:
- Every explicit requirement, threshold, limit, verification owner, and stop condition is recorded below.
- Only source readiness and owner-level Turbo invalidation apply from the default benchmark lanes.
- Candidate and baseline use one checkout, host, fixture, and command family; isolated Turbo caches distinguish cold, warm, and controlled-edit samples.

Timed checkpoint:
- requested duration: N/A: no duration requested.
- semantics: N/A: completion is gate-driven.
- start / deadline: N/A: no deadline requested.
- final loop closure: complete measurements plus correctness, formatting, structural validation, and goal gates.

Completion threshold:
- One entrypoint DAG owns Oxlint directions and generated Turbo tasks.
- Leaf, dependency, root/shared, unrelated, add, delete, and rename mutations select the owner plus exact reverse dependents.
- A no-change repeat is fully cache-served; unrelated entrypoints stay cached.
- Median warm and full-check time is no worse than the old setup by more than the larger of 10%, 250 ms warm, or 1 s full. A leaf edit runs strictly less work than the old package unit.
- Lint, typecheck, tests, build, packed boundaries, public types, CI contracts, and Oxlint contracts stay green.
- Every applicable lane, rerun, correctness gate, and plan validator is complete.

Verification surface:
- Isolated-cache cold/warm Turbo runs, controlled source edits, hit/miss summaries, input counts, and final cache repeats.
- Generated-state checks, exact invalidation contracts, package graphs, browser/Yjs package tests, public types, and isolated packed consumers.
- No UI behavior changed; Playwright discovery only verifies app dependency resolution.
- SHA-256 over final manifests, lockfile, DAG, generator, runners, Turbo configs, workflow, and owning app manifests.

Constraints:
- Correctness and editor behavior outrank timing.
- Do not hide latency through delayed work, altered fixtures, narrower semantics, or outputs outside Turbo.
- Keep builds atomic because `tsdown` owns and cleans one shared `dist`.
- Do not create another entrypoint registry or permanent run ledger.
- Do not commit, push, publish, release, or mutate GitHub without separate authority.

Boundaries:
- Allowed: Turbo/tooling configuration, CI, package tasks/config, app dependency ownership, controlled tests, and this plan.
- Runtime source may change only for an honest task boundary; none changed.
- Excluded: package consolidation, public API design, editor behavior, publication, release, and PR work.

Blocked condition:
Stop only if Turbo 2.6.1 cannot represent entrypoint inputs and a deterministic repo runner cannot preserve exact keys after three source-backed approaches. That condition did not occur.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | SHA-256 `c77b2ee54b18c568f64f90e591dbf5bc31acc079bb820003da9b8561106ee2c1` on HEAD `98184323b5fde44e423d71d8597a6cfeb5c233f8` | Captured pre-change package graph on the same HEAD and working tree | artifact: docs/plans/2026-08-28-platejs-plitejs-entrypoint-turbo.md |
| lockfile / package manager | Lock SHA-256 `549df2e84fc06c4b179c5e3e1246bab60f15662bac73f7984151f14f05a9e046`; pnpm 9.15.0 | Captured dirty-lock prefix `799270c4`; pnpm 9.15.0 | artifact: docs/plans/2026-08-28-platejs-plitejs-entrypoint-turbo.md |
| build mode / host / port | Turbo 2.6.1, Node 22.22.1, Darwin arm64, Apple M5 Max; no host or port | Same local tools, machine, and no host or port | artifact: docs/plans/2026-08-28-platejs-plitejs-entrypoint-turbo.md |
| browser / machine / viewport / DPR | Apple M5 Max; browser, viewport, and DPR unused | Same machine; browser, viewport, and DPR unused | artifact: docs/plans/2026-08-28-platejs-plitejs-entrypoint-turbo.md |
| route / fixture / document / plugins | Both package sources and task graph; no editor route or document | Same sources before entrypoint tasks | artifact: docs/plans/2026-08-28-platejs-plitejs-entrypoint-turbo.md |
| setup / action / DOM strategy | Isolated cache, generated tasks, no-change repeat, controlled leaf edit; no DOM | Isolated cache with package-wide typecheck/build; no DOM | artifact: docs/plans/2026-08-28-platejs-plitejs-entrypoint-turbo.md |
| warmups / samples / interleave order | Cold typecheck 3, warm typecheck 5, cold build 3, warm build 5, combined warm 5; sequential | Cold typecheck 1, warm typecheck 3, build 3; captured first on same machine | artifact: docs/plans/2026-08-28-platejs-plitejs-entrypoint-turbo.md |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Scope, thresholds, boundaries, proof, and stop condition were recorded. |
| Timed checkpoint parsed | no | No duration or deadline was requested. |
| Benchmark methodology read | yes | Benchmark skill and methodology reference were read completely. |
| Active goal created | yes | Goal `01a04564-9e3a-77e3-b2ec-ec98f549c3bc` owns this plan. |
| Candidate and baseline identities recorded | yes | Same HEAD and host; pre-change graph/timings and final SHA-256 are recorded. |
| Target and runner discovery complete | yes | Turbo schema, configs, scripts, DAG, typecheck helper, and dry graph were inspected. |
| Host and fixture freshness proved | yes | Unique local caches and identical package actions isolate cache state. |
| Correctness oracle identified | yes | Exact invalidation, package checks, public types, and packed boundaries own correctness. |
| All default lanes inventoried | yes | The lane table resolves all nine lanes. |
| Browser proof selected | no | The changed surface has no rendered behavior. |
| Commit, PR, and release authority | no | No Git or release mutation was requested. |

Work Checklist:
- [x] Record all requirements, comparisons, thresholds, boundaries, deliverables, proof, and stop conditions.
- [x] Establish comparable candidate and pre-change identities.
- [x] Inventory all default lanes in diagnostic order.
- [x] Prove the root invalidation owner.
- [x] Generate Oxlint and Turbo rules from one DAG.
- [x] Give every public entrypoint cached lint, test, and typecheck tasks.
- [x] Keep builds atomic while restricting production inputs.
- [x] Prove exact reverse invalidation for adds, edits, renames, and deletions.
- [x] Remove root workspace dependency hashing and rehome every consumer dependency.
- [x] Rerun the benchmark and correctness guard.
- [x] Complete package, consumer, artifact, formatting, and plan gates.
- [x] Record decisions, harness repairs, residual risk, and owner.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | Tool versions, host, fingerprints, isolated caches, baseline inputs, and commands are recorded. | Closed with reproducible identities. |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - no editor runtime comparison | This changes build orchestration only. | Closed as inapplicable. |
| 3 | plate-vs-plite-decomposition | no | N/A: inapplicable - both packages are implementation targets | No Plate-versus-Plite runtime claim is made. | Closed as inapplicable. |
| 4 | owner-microbench-and-trace | yes | complete | Hash traces, edits, cold/warm samples, and hit/miss counts prove the cause and rerun. | Closed after correctness breadth. |
| 5 | product-mount-matrix | no | N/A: inapplicable - no mount behavior changed | Build tasks have no mount operation. | Closed as inapplicable. |
| 6 | trusted-editing-matrix | no | N/A: inapplicable - no editing behavior changed | Editor commands and native input are untouched. | Closed as inapplicable. |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - no substrate comparison | Slate is outside this cache graph. | Closed as inapplicable. |
| 8 | example-breadth | no | N/A: inapplicable - no example runtime changed | Playwright discovery verifies package resolution only. | Closed as inapplicable. |
| 9 | large-and-stress | no | N/A: inapplicable - task fanout is the stress surface | Add, edit, rename, delete, root, leaf, and reverse-closure probes cover it. | Closed as inapplicable. |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: cause closed and recorded below
- lane: N/A: cause closed and recorded below
- comparable-baseline: N/A: cause closed and recorded below
- material-delta: N/A: cause closed and recorded below
- isolated-owner: N/A: cause closed and recorded below
- causal-intervention: N/A: cause closed and recorded below
- correctness-guard-result: N/A: cause closed and recorded below
- fix-class: N/A: cause closed and recorded below
- long-term-target: N/A: cause closed and recorded below
- decision-owner: N/A: cause closed and recorded below
- layer-plan: N/A: cause closed and recorded below
- compatibility-verdict: N/A: cause closed and recorded below
- fix-owner: N/A: cause closed and recorded below
- benchmark-command: N/A: cause closed and recorded below
- benchmark-rerun: N/A: cause closed and recorded below
- benchmark-rerun-result: N/A: cause closed and recorded below
- correctness-command: N/A: cause closed and recorded below
- correctness-rerun: N/A: cause closed and recorded below
- correctness-rerun-result: N/A: cause closed and recorded below
- resume-lane: N/A: all applicable lanes are complete

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| root-workspace-global-hash | owner-microbench-and-trace | kept | internal-implementation | One DAG generates Turbo and Oxlint rules while each consumer owns its dependencies | benchmark | N/A: inapplicable - internal tooling does not change public API | N/A: inapplicable - no public compatibility surface changed | entrypoint Turbo generator and package configs | Removing root workspace dependencies emptied Turbo's global internal-workspace hash; edits then invalidated exact reverse dependents | pass: baseline package typecheck and builds completed before intervention | `pnpm exec turbo run typecheck --filter=./packages/plitejs --filter=./packages/platejs --cache-dir=<isolated-cache>` | pass: cold median 7716 ms, warm median 765 ms, and a diff edit executed 7 of 25 tasks | `pnpm check:plite:contracts && pnpm plite:typecheck && pnpm plite:test && pnpm plite:release:boundaries` | pass: all named correctness commands are green | artifact: docs/plans/2026-08-28-platejs-plitejs-entrypoint-turbo.md |

Packet ledger:
| Packet | Lane | Cause | Candidate / baseline | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| graph ownership | owner-microbench-and-trace | Root workspace dependencies enter every global hash and package units erase locality. | Global internal-dependency hash is empty; maximum entrypoint inputs are 197 versus 1,653 Plite and 387 Plate. | Exact mutation contracts pass. | keep | Closed. |
| execution | owner-microbench-and-trace | Generated tasks recover locality without partial `dist`. | Warm typecheck 3,352 to 765 ms; cold build 6,387 to 5,246 ms; warm build 794 ms. | All package and artifact checks pass. | keep | Closed. |
| leaf invalidation | owner-microbench-and-trace | A leaf edit executes its owner and reverse dependents only. | 7 of 25 executed, 18 cached; restored source returned 25 cache hits. | Slow contract asserts exact misses and restoration. | keep | Closed. |

Metric table:
| Lane / action | Samples | Baseline p50 / max | Candidate p50 / max | Delta | Confidence | Artifact |
|---|---|---|---|---|---|---|
| cold typecheck | baseline 1; candidate 3 | 17,990 / 17,990 ms | 7,716 / 8,919 ms | -10,274 ms / -57.1% | Baseline is one cold sample; candidate direction is large and repeated. | Captured isolated-cache output in this plan. |
| warm typecheck | baseline 3; candidate 5 | 3,352 / 3,499 ms | 765 / 779 ms | -2,587 ms / -77.2% | Candidate max spread is 16 ms. | Captured isolated-cache output in this plan. |
| controlled Plite diff edit | one per graph | 3,352 / 3,499 ms package unit | 3,769 / 3,769 ms; 7 executed | +417 ms / +12.4%; structurally narrower | Time includes seven cold tasks; hit/miss ownership is primary. | Slow contract and Turbo summary. |
| cold build | 3 each | 6,387 / 6,678 ms | 5,246 / 5,596 ms | -1,141 ms / -17.9% | Same atomic builds and host. | Captured isolated-cache output in this plan. |
| warm build | baseline 3 uncached; candidate 5 | 6,387 / 6,678 ms | 794 / 926 ms | -5,593 ms / -87.6% | Candidate restores correct cached outputs. | Captured isolated-cache output in this plan. |
| combined lint/test/typecheck warm | baseline typecheck-only 3; candidate 5 | 3,352 / 3,499 ms | 917 / 922 ms | -2,435 ms / -72.6% | Conservative: candidate does more work for the same packages. | Final 69-task cache repeats. |

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Named threshold | yes | Warm typecheck improved 77.2%, cold typecheck 57.1%, cold build 17.9%, warm build 87.6%, and leaf work narrowed to 7 of 25 tasks. |
| Applicable lanes closed | yes | Two lanes are complete; seven runtime lanes have concrete inapplicability reasons. |
| Exact benchmark rerun | yes | Cold, warm, combined, leaf-edit, and restored-source runs match the recorded graph. |
| Correctness reruns | yes | Contracts, lint, tests, typechecks, builds, public types, and packed boundaries pass. |
| Final identity | yes | Candidate SHA-256, HEAD, lock SHA-256, tools, platform, and machine are recorded. |
| Metric honesty | yes | Sample counts, medians, maxima, cache state, leaf timing limits, and conservative comparison are explicit. |
| Durable fix | yes | One DAG, local dependency ownership, exact tasks, and atomic builds are retained. |
| Browser proof | no | No UI changed; discovery found 719 tests in 50 files and proves app resolution only. |
| Changeset | no | Build orchestration is internal; runtime, declarations, exports, and user behavior are unchanged from `main`. |
| Agent sync | no | No agent source changed; `pnpm install` completed for lock consistency. |
| Final lint | yes | Scoped Ultracite and Oxfmt checks pass for every touched source and config. |
| Timed checkpoint | no | No duration was requested. |
| P1 autoreview | no | Branch `next` forbids `autoreview` by repository law. |
| Benchmark validation | yes | Standard and complete benchmark validators pass. |
| Goal completion | yes | Autogoal completion checker passes. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | Baseline graph, identities, thresholds, lanes, and samples recorded. | Closed. |
| Ordered diagnosis | complete | Global hash and package units isolated as the owner. | Closed. |
| Fix and exact rerun | complete | DAG, tasks, dependencies, and reruns pass. | Closed. |
| Remaining breadth | complete | Package, browser/Yjs, types, CI, build, and packed checks pass. | Closed. |
| Review and closeout | complete | Formatting, validation, review disposition, and goal closure recorded. | Closed. |

Findings:
- Turbo caches workspace tasks, not arbitrary subpaths. Entrypoint reuse needs real generated task names.
- Turbo 2.6.1 includes root workspace dependencies in every task's global hash. Root `platejs`/`plitejs` links made task-specific inputs cosmetic.
- Final entrypoint inputs max at 197 files versus 1,653 Plite and 387 Plate package-wide inputs.
- Atomic builds are correct; partial `dist` jobs would race the shared clean/output owner.

Decisions and tradeoffs:
- Generate package scripts, Turbo tasks, and composite TypeScript projects from the Oxlint DAG.
- Derive Plate-to-Plite edges from actual imports.
- Keep cross-entrypoint contract/test aggregates explicit.
- Remove root workspace dependencies and declare each at its app, tool, or temporary consumer.

Harness/methodology repairs:
- Cached parsed imports, cutting generated-state checks from about 6.3 s to 1.6 s.
- Tolerated expected transient `ENOENT` during controlled rename/delete probes.
- Split Bun context: Plite uses its JSX preload; Plate keeps the root source-first config.
- Linked packages inside unique temporary benchmark consumers.
- Mapped browser/Yjs built declarations for the packed type consumer.

Error attempts:
| Error | Count | Different move | Resolution |
|---|---|---|---|
| Plite JSX tests lacked their preload. | 1 | Use Plite package context and preload. | Resolved. |
| Plate static tests failed in Plite context. | 1 | Keep Plate on the root Bun config. | Resolved. |
| Generated check raced deletion probes. | 1 | Cache imports and tolerate probe `ENOENT`. | Resolved. |
| Public types missed browser/Yjs declarations. | 1 | Map built public declarations. | Resolved. |
| Consumers relied on root links. | 1 | Declare app dependencies and link temporary consumers. | Resolved. |

Verification evidence:
- `pnpm entrypoint:turbo:check` reports current generated state for both packages.
- Oxlint DAG contracts pass 9 of 9.
- `pnpm check:plite:contracts` passes 183 Node contracts, 74 Bun contracts, 44 benchmark targets, builds, and public types.
- `pnpm plite:typecheck` passes 25 of 25 Turbo tasks plus browser/Yjs typechecks.
- `pnpm plite:test` passes 42 of 42 Turbo tasks plus 108 browser and 224 Yjs tests.
- `pnpm plite:release:boundaries` verifies isolated Plite/Plate roots, React adapters, Layout isolation, and Yjs adapters.
- `pnpm --filter plite typecheck`, scoped Ultracite, Oxfmt, and `pnpm install` pass.

Open risks:
Tasks added outside the generator can bypass the DAG unless the generated-state contract is kept. Remote transport was not exercised because remote caching is disabled; local and remote Turbo use the same hashes and outputs.

Final handoff contract:
- Scope, identities, metrics, cause, implementation owner, exact reruns, breadth, decisions, and claim limits are complete in this artifact.
- Two applicable lanes are complete; seven runtime lanes are inapplicable with evidence.
- The first cause was root internal workspace hashing plus package-wide task units.
- No remote-cache service or editor UI behavior claim is made.
- Future public entrypoints must update the DAG and regenerate checked state.

Timeline:
- 2026-08-28: captured baseline, implemented the graph, repaired harness ownership, measured cold/warm/edit paths, and completed correctness breadth.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Complete. |
| Where am I going? | Final goal closure and handoff. |
| What is the goal? | Exact entrypoint-aware Turbo invalidation without a performance regression. |
| What have I learned? | Task granularity and root workspace hashing were the owners; one DAG can generate exact cached tasks without splitting packages. |
