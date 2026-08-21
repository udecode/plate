# {{TITLE}}

Objective:
TODO: Write the short Benchmark objective, under 240 characters. Put the full
measurement and iteration contract below.

Flow mode:
one-shot execution

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Primary template:
{{TEMPLATE_PATH}}

## Benchmark Source

- request: pending
- scope: pending
- invocation: pending
- candidate-identity: pending
- plate-main-identity: pending
- plite-identity: pending
- slate-identity: pending
- named-symptom: pending
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
- TODO: Define the exact metric/budget, comparison, breadth, and correctness
  done state.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, P1 autoreview passes when
  code changed, and the Autogoal checker passes.

Verification surface:
- benchmark commands / artifacts: pending
- correctness commands: pending
- Browser / Chrome / device proof: pending
- source/ref/fingerprint proof: pending

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

Boundaries:
- allowed runtime/packages/apps: pending
- allowed benchmark/tests/fixtures: pending
- allowed baseline checkouts/hosts: pending
- non-goals: pending

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- TODO: Name the missing baseline, route, source identity, browser/device,
  correctness oracle, reproducible metric, or unsafe architecture decision that
  stops autonomous work.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | pending | pending | pending |
| lockfile / package manager | pending | pending | pending |
| build mode / host / port | pending | pending | pending |
| browser / machine / viewport / DPR | pending | pending | pending |
| route / fixture / document / plugins | pending | pending | pending |
| setup / action / DOM strategy | pending | pending | pending |
| warmups / samples / interleave order | pending | pending | pending |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | pending | pending |
| Timed checkpoint parsed | pending | pending |
| `benchmark` source and methodology read | yes | pending |
| Active goal checked or created | yes | pending |
| Candidate and baseline identities recorded | pending | pending |
| Target/runner discovery completed from current source | pending | pending |
| Host/build/fixture freshness proved | pending | pending |
| Correctness oracle identified | pending | pending |
| All default lanes inventoried | yes | pending |
| `only` narrowing explicitly authorized or N/A | pending | pending |
| Browser/native proof strategy selected | pending | pending |
| Output budget strategy recorded | yes | see above |
| Commit/PR/release authority recorded | yes | no mutation authorized by default |

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
| 1 | source-and-host-readiness | pending | pending | pending | pending |
| 2 | current-vs-main-product-smoke | pending | pending | pending | pending |
| 3 | plate-vs-plite-decomposition | pending | pending | pending | pending |
| 4 | owner-microbench-and-trace | pending | pending | pending | pending |
| 5 | product-mount-matrix | pending | pending | pending | pending |
| 6 | trusted-editing-matrix | pending | pending | pending | pending |
| 7 | plite-vs-pinned-slate | pending | pending | pending | pending |
| 8 | example-breadth | pending | pending | pending | pending |
| 9 | large-and-stress | pending | pending | pending | pending |

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
| pending | pending | pending | pending | pending | pending | pending |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| pending | pending | pending | pending | pending | pending | pending |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | pending | Run the exact metrics, comparisons, and correctness proof named above | pending |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs {{PLAN_PATH}}` at cause/resume checkpoints | pending |
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
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | in_progress | created plan | fast symptom lane |
| Ordered diagnosis | pending | | cause gate or next lane |
| Fix and exact rerun | pending | | resume breadth |
| Remaining breadth | pending | | final verification |
| Review and closeout | pending | | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Harness/methodology repairs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| None yet | 0 | | |

Verification evidence:
- Pending.

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
- {{CREATED_AT}} Benchmark goal plan created.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Intake and comparison authority |
| Where am I going? | Ordered diagnosis, fix/rerun, remaining breadth, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
