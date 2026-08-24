# PR 5036 Vercel build memory benchmark

Objective:
Remove the PR 5036 Vercel build-memory failure, push the complete checkout, and
prove the fix with the exact remote production build while preserving all
correctness gates.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5036-vercel-build-memory.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: Check PR 5036 CI completely and fix every failure.
- scope: Vercel preview build memory and duration for the Plate website
- invocation: `$benchmark PR 5036 Vercel build memory`
- candidate-identity: commit: 2b206974844c62c487337da12733293db10f674b plus the bounded local CI repair
- plate-main-identity: commit: bc7104f7dd009a0c2da78cffaee1108b4c430f46
- plite-identity: N/A: inapplicable - no editor-runtime comparison
- slate-identity: N/A: inapplicable - no Slate substrate comparison
- named-symptom: Vercel OOM-killed `turbo run build` after 31m29s while `www:build` compiled
- final-artifacts: pending

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
- requested duration: pending
- semantics: pending
- start / deadline: pending
- final loop closure: pending

Completion threshold:
- The exact pushed Vercel production website build completes without OOM.
- The causal owner is isolated by a measured intervention, then the exact red
  build command and root CI correctness gate pass after the fix.
- The build remains semantically equivalent: registry generation, docs source,
  package dependencies, and Next output are not skipped.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, P1 autoreview passes when
  code changed, and the Autogoal checker passes.

Verification surface:
- benchmark commands / artifacts: Vercel build log plus local memory/timing
  packets under `/tmp/plate-5036-build-*`
- correctness commands: `pnpm check`, `pnpm check:plite`, and the exact
  production website build
- Browser / Chrome / device proof: Browser smoke of the built site route
- source/ref/fingerprint proof: exact candidate/main commits, lockfile hash,
  command, environment, and changed-owner fingerprints

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
- Commit and push are authorized for this task. Do not merge, publish, release,
  or mutate deployment settings.

Boundaries:
- allowed runtime/packages/apps: build scripts/config and `apps/www` build
  owner; package runtime only if measured as causal
- allowed benchmark/tests/fixtures: existing production website build and
  exact registry/docs inputs
- allowed baseline checkouts/hosts: current checkout, immutable `origin/main`
  source reads, and read-only Vercel history
- non-goals: editor runtime optimization, public API changes, deployment
  settings mutation, or reduced docs/registry output

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- Stop only if the Vercel machine limit cannot be reproduced or approximated
  locally after build-stage timing and memory isolate the owner, and no
  source-level equivalent production build can falsify the proposed repair.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | commit `2b206974844c62c487337da12733293db10f674b`; local repair fingerprint recorded by changed-file diff | commit `bc7104f7dd009a0c2da78cffaee1108b4c430f46` | artifact: Vercel deployment pages and local Git hashes |
| lockfile / package manager | lock `193f957d…`; pnpm 9.15.0 | lock `2b9e1673…`; pnpm 9.15.0 | artifact: local SHA-256 output in this plan |
| build mode / host / port | Vercel preview production build; local macOS arm64 diagnostic | Vercel production build in the same project | artifact: deployment `71Dzn…` versus `4XBo…` |
| browser / machine / viewport / DPR | Vercel managed Linux build container; exact SKU hidden | same Vercel project managed Linux builder; exact SKU hidden | artifact: Vercel build-system reports |
| route / fixture / document / plugins | full Plate website, docs, registry, and workspace dependency graph | full Plate website at main | artifact: unchanged project build command and exact source refs |
| setup / action / DOM strategy | `turbo run build`; local stage isolate uses production `next build` with existing CI-generated registry | `turbo run build` | artifact: Vercel logs plus `/tmp/plate-5036-build-*.log` |
| warmups / samples / interleave order | one cold remote build plus cold local intervention packets | one cold successful remote build | artifact: remote durations and local `/usr/bin/time -l` packets |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | CI completion, all failures, timing, local repair, and no-push boundary recorded |
| Timed checkpoint parsed | no | no requested work duration |
| `benchmark` source and methodology read | yes | skill and complete methodology read |
| Active goal checked or created | yes | existing PR 5036 CI Autogoal remains active |
| Candidate and baseline identities recorded | yes | exact candidate and main commits above |
| Target/runner discovery completed from current source | yes | Vercel `turbo run build`; app stage is `next build` |
| Host/build/fixture freshness proved | yes | exact terminal deployments from Aug 24 and Aug 20 |
| Correctness oracle identified | yes | production Next build plus existing root and Plite checks |
| All default lanes inventoried | yes | lane table below |
| `only` narrowing explicitly authorized or N/A | no | normal scoped invocation; only genuinely inapplicable lanes are N/A |
| Browser/native proof strategy selected | yes | Browser smoke after a successful final production build |
| Output budget strategy recorded | yes | see above |
| Commit/PR/release authority recorded | yes | commit and push authorized until CI is green; no merge/release |

Work Checklist:
- [ ] Every explicit scope, comparison, timing, stop condition, deliverable,
      verification surface, and success criterion is recorded.
- [ ] Short objective, threshold, verification, constraints, boundaries, and
      blocked condition are concrete.
- [ ] Default lanes remain in diagnostic order; every N/A row has a reason.
- [ ] Candidate/baseline signatures prove comparable source, fixture, action,
      build, browser, machine, and sampling.
- [ ] Primary metrics match the visible user operation; proxies stay labeled.
- [ ] Samples expose p50/p75/p95/p99 only when sample count supports them,
      plus max, absolute/relative delta, and noise evidence.
- [ ] Red lanes are not called causal without the conclusive-cause gate.
- [ ] A proven cause pauses later lanes before another expensive benchmark.
- [ ] Every proven cause records its fix class, best long-term target, decision
      owner, layer plan, compatibility verdict, and implementation owner.
- [ ] `public-api` and `runtime-architecture` causes run `best-api`, then
      `plite-plan`, `plate-plan`, or both before implementation. Broad accepted
      execution may use `auto`; target selection may not.
- [ ] One isolated owner is fixed, then the exact benchmark and correctness
      guard rerun before breadth resumes.
- [ ] Failed reruns invalidate or continue the same cause; they do not skip to
      a different green metric.
- [ ] Green reruns resume the first pending applicable lane.
- [ ] Every packet has keep/revert/invalidate/quarantine/defer and next-owner
      evidence.
- [ ] Harness/metric/host defects are repaired before product optimization.
- [ ] Final handoff reports candidate/baseline identities, lane status, first
      conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | main deployment `4XBo…` succeeded in 5m12s; candidate `71Dzn…` OOMed after 31m29s; refs, commands, and hosts captured | current-vs-main-product-smoke |
| 2 | current-vs-main-product-smoke | yes | complete | main completed in 5m12s; candidate OOMed at 31m29s, at least +26m17s and over 6x | owner-microbench-and-trace |
| 3 | plate-vs-plite-decomposition | no | N/A: inapplicable - build-time site failure, not editor runtime | Vercel failed before a route existed | closed |
| 4 | owner-microbench-and-trace | yes | in_progress | scoped registry resolution removed whole-project tracing and reduced the same stale-registry probe from 16.35GB to 15.29GB RSS; full local build remains blocked by 158 stale generated imports | push and run the exact CI-generated Vercel build |
| 5 | product-mount-matrix | no | N/A: inapplicable - no mounted product exists when the build OOMs | build completion is the named operation | closed |
| 6 | trusted-editing-matrix | no | N/A: inapplicable - no editing latency symptom | exact IME correctness already closes separately | closed |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - no substrate comparison | failure is website build memory | closed |
| 8 | example-breadth | no | N/A: inapplicable - full website build already includes example breadth | preserve full build inputs | closed |
| 9 | large-and-stress | no | N/A: inapplicable - Vercel OOM is the production-scale stress case | exact production build closes scale | closed |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause proven
- lane: N/A: no cause proven
- comparable-baseline: N/A: no cause proven
- material-delta: N/A: no cause proven
- isolated-owner: N/A: no cause proven
- causal-intervention: N/A: no cause proven
- correctness-guard-result: pending
- fix-class: N/A: no cause proven
- long-term-target: N/A: no cause proven
- decision-owner: N/A: no cause proven
- layer-plan: N/A: no cause proven
- compatibility-verdict: N/A: no cause proven
- fix-owner: N/A: no cause proven
- benchmark-command: N/A: no cause proven
- benchmark-rerun: N/A: no cause proven
- benchmark-rerun-result: pending
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: pending
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| VERCEL-BUILD-001 | current-vs-main-product-smoke | candidate website build materially regressed | main 5m12s ready; candidate 31m29s OOM | remote source generation passed before candidate compile | keep red symptom | isolate build owner |
| VERCEL-BUILD-002 | owner-microbench-and-trace | dynamic registry reads trace the expanded whole project | 33.8s to expected stale-registry error; 16.35GB max RSS | invalid for product correctness because local registry output is stale | keep owner probe only | narrow trace and exact rerun |
| VERCEL-BUILD-003 | owner-microbench-and-trace | exact registry-root resolution removes broad dynamic tracing | baseline 33.80s / 16.35GB RSS; candidate 35.12s / 15.29GB RSS | `rehype-utils` tests, www typecheck, registry changelog check, and root check passed | keep scoped fix; remote proof required | push exact checkout and monitor Vercel |
| VERCEL-BUILD-004 | owner-microbench-and-trace | alternate build knobs might own the memory spike | removing production Turbopack root reached 20.39GB; `cpus: 2` moved about 0.4%; disabling Rust React Compiler reached 16.29GB | all three experiments reverted; `next.config.ts` has no diff | revert experiments | retain source-scoped registry read only |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| Vercel full website build | 1 cold each | 5m12s | 31m29s then OOM | at least +26m17s / over 6x | authoritative same-project build reports | Vercel `4XBo…` and `71Dzn…` |
| local Next owner probe | 1 cold each | 33.80s / 16.35GB RSS | 35.12s / 15.29GB RSS | -1.06GB / -6.5% RSS; +1.32s | identical stale-registry failure boundary; tracing warning removed only after scoped fix | `/tmp/plate-5036-build-candidate.log` and scoped rerun log |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | pending | Run the exact metrics, comparisons, and correctness proof named above | pending |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/5036-vercel-build-memory.md` at cause/resume checkpoints | pending |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | pending |
| Exact post-fix benchmark reruns | pending | Rerun every kept fix against its original lane/baseline | pending |
| Correctness/native behavior reruns | pending | Run named tests and Browser/Chrome/device proof required by the claim | pending |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | pending |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | pending |
| Durable fix decision | pending | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | pending |
| Package/type/build proof | pending | Run affected package checks/typecheck/build only where owned | pending |
| Browser surface proof | pending | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | pending |
| Changeset/release artifact | pending | Add only for published package behavior/API changes, otherwise N/A | pending |
| Agent rule/skill sync | pending | Run `pnpm install` and mirror/resource checks when agent sources changed, otherwise N/A | pending |
| Benchmark plan complete validation | yes | Run validator with `--complete` | pending |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | pending |
| Timed checkpoint | pending | Satisfy requested duration and close current packet, otherwise N/A | pending |
| P1 autoreview | pending | Run dirty local P1 review for non-trivial code/skill changes and close accepted findings, otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5036-vercel-build-memory.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | in_progress | created plan | fast symptom lane |
| Ordered diagnosis | pending | | cause gate or next lane |
| Fix and exact rerun | pending | | resume breadth |
| Remaining breadth | pending | | final verification |
| Review and closeout | pending | | final response |

Findings:
- Vercel reported one OOM and SIGKILL after 31m29s in `www:build`; its GitHub
  status context remained stale at pending.
- The Vercel config and root/app build scripts are unchanged from
  `origin/main`; the candidate content and dependency graph are materially
  larger.
- The tracked tree grew from 57.7MB on main to 193.9MB on the candidate.
- Turbopack reports that `getFileContent` dynamically traces the whole project;
  the first cold local probe reached 16.35GB RSS before the expected stale
  generated-registry errors.
- Resolving the file under the exact `apps/www/src/registry` root and applying
  `turbopackIgnore` removed the whole-project tracing warning and reduced peak
  RSS by about 1.06GB (6.5%) at the same expected stale-registry boundary.
- `outputFileTracingIncludes` already preserves `./src/registry/**/*`, so the
  scoped dynamic-read fix does not drop deployment files.
- A complete local production build cannot be authoritative because checked-in
  generated registry code has 158 missing imports and repository policy
  forbids running `build:registry` locally. CI/Vercel generates that input.

Decisions and tradeoffs:
- Keep only the scoped registry read. Revert production-root removal, CPU
  throttling, and React Compiler experiments because they were neutral or
  materially worse.
- Use the pushed Vercel build as the exact closure lane; local stale-registry
  probes establish owner movement but cannot prove full completion.

Harness/methodology repairs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| None yet | 0 | | |

Verification evidence:
- `bun test apps/www/src/lib/rehype-utils.spec.ts`: 2 passed.
- `pnpm --filter www typecheck`: passed.
- registry changelog generator `--check`: passed.
- `pnpm check`: final local rerun passed with 60 builds, 60 typechecks, 3,300
  fast tests, and 1,549 slow tests with 60 skips.
- Exact remote Vercel rerun: pending push.

Final handoff contract:
- goal plan / scope: pending
- candidate / baseline identities: pending
- completed / N/A / pending lanes: pending
- first conclusive cause: pending
- baseline / latest / best metrics: pending
- fix owner / changed files: pending
- exact benchmark and correctness reruns: pending
- resumed breadth: pending
- packet decisions: pending
- harness/methodology repairs: pending
- residual claim limits / next owner: pending

Timeline:
- 2026-08-24T08:24:45.203Z Benchmark goal plan created.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Owner fix complete; exact remote rerun pending |
| Where am I going? | Final local gate, push, Vercel rerun, closeout |
| What is the goal? | Complete the full production website build without OOM and without dropping output |
| What have I learned? | Broad dynamic registry tracing costs about 1.06GB locally; exact remote closure is still required |
| What have I done? | Scoped the registry read, rejected three worse experiments, and passed focused correctness proof |

Open risks:
- The 6.5% local reduction may still be insufficient for the Vercel limit; the
  exact pushed deployment is the blocking proof.
