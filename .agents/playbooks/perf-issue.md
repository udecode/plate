---
extends: perf-issue, hillclimb
when: Use it to benchmark, profile or compare Plate, Plite or Slate speed, to find, explain or repair a performance regression or a lying benchmark, or for `benchmark [scope]` and `benchmark only <lane-or-target>`.
---

# Perf issue

Benchmark's run lifecycle. `benchmark` holds the knowledge: the lanes and their order, the harness and targets, cohorts, budgets, the comparison law, correctness guards and the pre-acceptance probe. This playbook orders a measurement or repair run and owns its plan, the cause gate, the durable fix decision, fix-rerun-resume and the close. A pre-acceptance probe runs inside its architecture plan without this playbook, and `benchmark review <scope-or-plan>` reviews a design without measuring. The run keeps lane selection and causal ownership: an Autonomous run, `benchmark review`, the Bug fix playbook or the Autoresearch reference may supply evidence or capacity, never a second supervisor.

- **Before** "Capture a baseline trace via the matching driver skill": run Intake, then open or resume the plan per Plan.
- **In** "Capture a baseline trace via the matching driver skill": the baseline is `benchmark`'s default lanes, all inventoried up front but run one at a time in order, starting from the named symptom or route, or else the smallest normal product fixture, on an existing honest target before any new harness. `verify` drives browser and reporter proof, and Interaction Coverage fills as the lanes run.
- **In** "`how` to ground hypotheses": a red lane is a regression, not a cause. Until the Cause gate passes, run the cheapest next isolating lane or diagnostic, or repair the harness, and patch nothing from correlation. A reporter-visible rerender claim first takes `benchmark`'s repeated-component inventory. A new causal speed claim needs a paired baseline and candidate run. When an absolute shared-host timing limit fails without a matched regression, keep that failure, stop unchanged retries and report the result inconclusive: never green, and never conditional on a quiet workstation.
- **After** "`how` to ground hypotheses": when the Cause gate's first six facts hold, give the cause a stable ID, mark the finished prefix `complete`, the cause lane `red` and later applicable lanes `paused` or `pending`, record the Durable fix decision, then set the checkpoint to `proven` and validate the plan. Open no further lanes. This early stop speeds the next fix and never completes the run.
- **In** "Plan the fix from the trace": the plan is the recorded Durable fix decision. Implement only an `internal-implementation` target here, at its recorded owner, one owner at a time, and never downgrade it to a compatible local patch; set the checkpoint to `fixing`. The other classes go to their decision owner and come back to this lane for the rerun.
- **In** "Parse and compare the artifacts": run Fix, rerun, resume.
- **Replace** "Cite the measurement in the PR": run Close.
- **Before** "Ground the workload and architecture before choosing the metric": run Intake, then open or resume the plan per Plan.
- **In** "Ground the workload and architecture before choosing the metric": the cohorts, the metric and its direction come from `benchmark`, and the budget and noise rule are frozen in the plan before any candidate result is read. The lanes run in `benchmark`'s default order, as for Perf issue. The stop predicate pairs that budget with the attempt floor, and the run still ends only by Close.
- **In** "Build the measurement harness, prove its sensitivity, then freeze it": use an existing honest target from current source, and repair a lying harness through `benchmark`'s Harness Repair before any product change. The regression gate is the lane's correctness guard.
- **Replace** "Open the decision log via the **show-me-your-work** skill": the plan's Packet ledger is the attempt log, one row per packet with its keep, revert, invalidate, quarantine or defer decision and next owner, and Cause History holds each cause. Keep no separate `decision.tsv` or other benchmark ledger. A run that `AGENTS.md`'s Plans and trails rule covers also keeps its decision log beside the plan.
- **In** "Ground each hypothesis in the architecture model from step 1": the rules on "`how` to ground hypotheses" apply here too: a red lane is not a cause, nothing is patched from correlation, a new causal speed claim needs a paired run, a rerender claim takes the repeated-component inventory first, and a shared-host timing failure stays inconclusive. Attempts start only after a cause passes the Cause gate and its Durable fix decision selects the target, with the plan moves made after "`how` to ground hypotheses". Each hypothesis then names a mechanism at that target's owner.
- **In** "Loop, one hypothesis per iteration": each attempt is one packet on the selected target and runs Fix, rerun, resume; a reverted packet still gets its ledger row. Several measured hypotheses on one selected target and correctness guard may use `codex-autoresearch` as packet machinery while this run keeps lane and cause ownership. Commits follow `AGENTS.md`'s Delivery rule.
- **In** "Stop when the predicate is met": the predicate never overrides Close, and an early win on one lane completes nothing.
- The reply names the plan path where Hillclimb's reply asks for the `decision.tsv` path.
- **Replace** "Run **Opening a PR**": when the Panel review rule calls the work big, run its panel on the diff, then end with Close's report and stop. A commit or PR follows only the user's own request, per `AGENTS.md`'s Delivery rule.

## Intake

1. Correctness-only work with no timing claim goes to the Bug fix playbook. Routine DX and CI verification runs the affected correctness owners and skips this playbook.
2. A public API or runtime boundary that must be chosen before measurement can be fair goes to `best-api`, then the Plan playbook.
3. Plite Autoresearch status, gates, quality gaps or packet mechanics go to `benchmark`'s Autoresearch reference.
4. Read-only explanation of existing artifacts needs no plan; load `benchmark`, answer and stop.
5. Otherwise load `benchmark` and read its methodology in full before the plan, any measurement or any runtime change.

## Plan

A standalone run copies `.agents/rules/benchmark/templates/benchmark.md` to `docs/plans/<date>-<scope>-benchmark.md`, fills its `{{…}}` placeholders and keeps its section headings and table headers, which `validate-benchmark-plan.mjs` parses. Resume a matching active Benchmark plan instead of opening a second one. The plan coordinates the run; benchmark targets and result artifacts are the metric authority, and executable tests are the correctness authority.

The first checkpoint copies every user requirement into checkable rows, resolves candidate and baseline identities, discovers targets and runners from current source, and fills all nine default lanes with their Applies before the first lane runs. A scope narrows fixtures and owners, never the lane inventory. Record `invocation` as `$benchmark <scope>`. Only an explicit user narrowing records `$benchmark only <lane-or-target>`, and only that invocation permits `N/A: only - <reason>`; any other excluded lane needs `N/A: inapplicable - <reason>` because it genuinely cannot apply.

Validate at every cause and resume checkpoint with `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs <plan>`, and with `--complete` before closing. The validator owns the plan schema: each error names the record and field to resolve, and its source states the rule when a message is not enough.

## Cause gate

A cause is proven only when every fact holds and the checkpoint records it:

1. The exact symptom has a material absolute and relative delta outside the observed noise band.
2. Candidate and baseline use comparable fixtures, actions, builds, browser, machine and source identities.
3. A package, layer, plugin family, repeated unit or hot operation is isolated.
4. A causal intervention moves the metric in the predicted direction.
5. The relevant correctness test or native editor behavior still holds, recorded as `pass: <evidence>` before the cause is called proven.
6. The fix owner and the original benchmark and correctness commands are known, and every rerun uses those exact command identities.
7. The Durable fix decision is recorded.

A profiler hotspot, flame chart, slow mean, one noisy p95, code suspicion, correlation, broad diff or current/main diff alone is not conclusive. `benchmark`'s methodology lists the interventions that count.

## Durable fix decision

Resolve it while later lanes stay paused, before any product code changes:

1. Classify the fix as `internal-implementation`, `correctness`, `public-api` or `runtime-architecture`.
2. Record the best long-term target independently of compatibility, migration convenience, compiler difficulty, current machinery or implementation cost. A cheaper patch does not win by being cheaper.
3. `internal-implementation` stays in this run with `decision-owner: benchmark`. `correctness` goes to the Bug fix playbook with `decision-owner: bug-fix`, and the run reruns once it returns. Both record `layer-plan` and `compatibility-verdict` as `N/A: <reason>`.
4. `public-api` and `runtime-architecture` run `best-api` from the ideal target with `decision-owner: best-api`, then the Plan playbook for adoption, and record `layer-plan` as `plite-plan`, `plate-plan` or both. A bounded package owner may implement directly; broad cross-owner execution may run as pstack's Autonomous run, which never selects the target.
5. Before stability, default to `hard-cut: <material lasting value>` when the best target breaks current API or architecture. Preserve compatibility only as `preserve: <hard law> - <reason>`, where the hard law is correctness, security, serialized-data, native-behavior or runtime. Old callers, migration effort, deadlines and compiler limits are not hard laws.
6. Record one concrete implementation owner as `fix-owner`. Best API and the layer plan choose the target and adoption; they never replace that owner, and whoever implements never downgrades the accepted target to a compatible local patch.
7. Code-shape cleanup with no measured owner goes to the Refactoring playbook and returns to the same lane.

The checkpoint and the cause's terminal Cause History row carry the fix class, long-term target, decision owner, layer plan, compatibility verdict and implementation owner unchanged.

## Fix, rerun, resume

1. With the fix in place, set the checkpoint to `rerun` and rerun the exact red benchmark command first, with the same baseline and sampling contract. A nearby target or a replacement command is not the same rerun.
2. Rerun the exact correctness command. A faster broken editor is rejected.
3. Record both outcomes as `pass: <evidence>` or `fail: <evidence>`. Commands without successful results cannot resume breadth.
4. If either is red, keep diagnosing the same lane. When the evidence disproves the cause, move every `paused` lane back to `pending`, set the checkpoint to `invalidated` with `resume-lane` on that lane, keep the lane `pending` or `in_progress`, and append an `invalidated` Cause History row with the failed benchmark result. An invalidated cause never completes its lane.
5. If both pass, append a `kept` Cause History row with the fix decision, causal evidence, pre-fix correctness and both post-fix results, mark the lane `complete`, move every `paused` lane back to `pending`, set the checkpoint to `green` with `resume-lane` on the first unfinished applicable lane across the full inventory, and validate.
6. Resume that lane from the baseline step, then reset the checkpoint to `none` without touching Cause History. Do not rerun every lane after each fix. Go on to Close only when no applicable lane is left.
7. After an architecture hand-off, compare the effective loaded inputs before reopening a completed lane. An unrelated React edit cannot invalidate unchanged headless Yjs implementation proof.

## Close

The run completes only when every applicable lane is `complete` or N/A with a concrete reason, Cause History records every kept, invalidated, reverted, quarantined or deferred cause with its durable fix decision or holds one `none` row, every kept fix has successful exact benchmark and correctness reruns, the checkpoint is back to `none`, the final candidate and baseline identities still match the measured artifacts, the validator passes with `--complete`, `node .agents/pstack/plan-open.mjs <plan>` passes on the plan's Start and Completion Gates, and the review `AGENTS.md`'s Review rule requires passes. Runtime verification is the exact lane command, the correctness guard, the comparable baseline artifact, the post-fix rerun and any browser or native proof the claim needs. Review follows `AGENTS.md`'s Review rule; benchmark packets add none.

The reply reports:

1. The plan path, scope, candidate and baseline identities, and the completed, N/A and pending lanes.
2. Cause History, the first conclusive cause and why it passed the Cause gate.
3. Baseline, latest and best p50/p95/p99, sample count, and absolute and relative delta.
4. Each fix's class, long-term target, decision, layer and implementation owners, breaking verdict, changed files, and exact benchmark and correctness reruns.
5. The resumed lanes and final breadth.
6. Kept, reverted, invalidated, quarantined and deferred packets.
7. Harness and methodology repairs, and the remaining claim limits.

Never call a cause proven from correlation, a fix green from a different lane, or a run complete while an applicable row is pending, and never hide latency with debounce, delayed work, changed fixtures, degraded DOM or a narrower action.
