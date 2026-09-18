# {{TITLE}}

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
TODO: Write the short corpus repair objective under 240 characters.

Flow mode:
one-shot execution

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Regression source:

- target bug / surface / corpus: pending
- lane and current source owner: pending
- selected executable test cases: pending
- tested ref or dirty-state boundary: pending
- route / proof host and freshness method: pending
- invocation mode / timebox: pending

First checkpoint:

- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/patch/references/corpus.md`.
- Fill the selected-case, reporter-oracle, failed-fix, and architecture tables,
  then run `validate-regression-plan.mjs` before implementation.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:

- Every required selected case has permanent executable red/green coverage,
  exact final-byte proof, applicable stability and a completed local decision.
- Apply the canonical [Patch corpus method](../../../.agents/rules/patch/references/corpus.md)
  and applicable [Verify Plate oracles](../../../.agents/rules/verify-plate/references/regression-oracles.md).
  Their tags and domain gates remain required; this template stores evidence.
- Every still-applicable reporter claim has a phase-specific positive and
  forbidden-state oracle; evidence deltas never erase base acceptance.
- Resolve every canonical checklist/gate and pass semantic validation before
  structural completion. Commit and push are not local completion gates.

Verification surface:

- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/patch/scripts/validate-regression-plan.mjs {{PLAN_PATH}} --complete`
- Task-owned review when explicitly requested or closing a PR
- `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`

Constraints:

- Executable tests own durable behavior; the Task plan is transient coordination.
- Patch owns case selection and repair; Verify Plate owns applicable proof.
- No parallel writers to shared source, tests, plans, builds or managed hosts.
- Generated output is not a source owner. A proxy cannot close the exact case.
- Mark fully proved local work `completed` with ref/dirty fingerprints and
  uncommitted/unpushed state when true. Do not widen that
  status into integrated, shipped, released, or public issue completion without
  the owning evidence and authority.
- A failed claimed fix follows Patch’s failed-fix method before product work
  resumes. Expected red reproduction does not count as a failed fix.

Boundaries:

- allowed source owners: pending
- allowed proof/test owners: pending
- generated/source boundary: pending
- browser/device claim width: pending
- forbidden product/API/release/public mutations: pending
- orchestration mode and writer ownership: pending

Output budget strategy:

- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap logs and exclude generated/build trees.

Blocked condition:

- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:

- current phase: requirement extraction
- current executable case: pending
- current case status: pending
- next owner: Patch
- goal status: active

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | pending | pending |
| Patch corpus method loaded | pending | pending |
| Task plan reused; standing Autogoal request or explicit opt-out resolved | pending | pending |
| Current source owner and tested ref recorded | pending | pending |
| Executable test cases discovered | pending | pending |
| Cumulative reporter evidence resolved | pending | Original report, acceptance criteria, recordings, and every later reporter delta are inventoried without dropping still-applicable claims. |
| Reporter oracle matrix resolved | pending | pending |
| Regression semantic validator ready | pending | pending |
| Route/proof-host readiness plan recorded | pending | pending |
| Direct/delegated repair boundary recorded | pending | pending |
| Orchestrator writer ownership recorded | pending | pending |
| Output budget strategy recorded | pending | pending |
| Claim width and blocked rules recorded | pending | pending |

Work Checklist:

- [ ] Capture explicit requirements, scope, completion threshold and proof once.
- [ ] Apply Patch corpus mode and load only relevant Verify Plate domain oracles.
- [ ] Bind current source, exact environment, route/host and runtime inputs.
- [ ] Select atomic executable cases with positive-outcome authority and scope.
- [ ] Inventory cumulative base acceptance and every later reporter delta.
- [ ] Every required evidence row maps to a phase-specific executable oracle.
- [ ] Fill all schema observations with applicable proof or explicit N/A reasons.
- [ ] Run semantic validation before implementation and the smallest falsifying probe.
- [ ] Record affected-owner pre-edit baselines before shared changes.
- [ ] Repair one case and record exact red/green evidence in `Patch delegation`;
      direct execution satisfies this historical schema heading.
- [ ] Prove final inputs, applicable domain oracles, receipts and affected corpus.
- [ ] Count fresh retry-free executions for required stability; cached reuse is invalid.
- [ ] Close each started gate failure with its exact final rerun.
- [ ] Invalidate and diagnose every failed claimed fix before another attempt.
- [ ] Prove canonical escape prevention or an existing gate rejecting each escape.
- [ ] Resolve required architecture review, methodology deltas and packet decisions.
- [ ] Mark evidence-complete local cases completed; preserve wider claim limits.
- [ ] Finish applicable source regeneration, parity and Task-owned review gates.
- [ ] Reconcile acceptance and record final evidence, risks and next owner.
- [ ] Pass semantic completion, then structural completion.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | pending | Close every selected executable case and methodology row | pending |
| Current-source readiness | pending | Prove source owner and final tested ref/dirty boundary | pending |
| Route/proof-host readiness | pending | Prove the runner/host observes current source | pending |
| Exact reporter route | pending | Bind reporter route through selected environment, proof host, final command, and executable receipt input; reject proxy routes | pending |
| Executable regression coverage | pending | Record exact test file, red result, green result, and owning invariant | pending |
| E2E escalation closure | pending | Select the smallest sufficient proof; record `e2e-required:` for any distinct native boundary, including when combined with `unit-red:` | pending |
| Cumulative reporter evidence closure | pending | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pending |
| Reporter oracle closure | pending | Resolve positive and forbidden states for all nine observations and every applicable interaction phase per case | pending |
| Failed-fix interrupt closure | pending | Prove every claimed-fix failure invalidated prior proof and repaired the escape or demonstrated its existing rejecting gate | pending |
| Architecture pressure closure | pending | Prove every second failure or architecture trigger has a Best API Review verdict and any required design/adoption evidence | pending |
| Proof receipt closure | pending | Validate generated final receipts against unchanged issue-owned inputs | pending |
| Measurement-owner closure | pending | For render-count/rerender/profiler claims, bind every measured event emitter/router/filter/aggregator/render owner through `measurement-owner-inputs:` and one completed receipt | pending |
| Affected-corpus replay closure | pending | Replay all cases affected by the last shared-owner edit | pending |
| Shared-style consumer closure | pending | Inventory every shared selector/class consumer and prove explicit paint neutralizers do not inherit or duplicate the shared surface | pending |
| Started-gate failure closure | pending | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pending |
| Smallest-probe closure | pending | Record first falsifying probe and any host repair | pending |
| Patch delegation closure | pending | Record one-case root-cause/red/green/proof evidence; delegation is optional | pending |
| Focused verification closure | pending | Run owning test and exact final-case replay | pending |
| Stability closure | pending | Record retry-free warm runs or evidence-backed N/A | pending |
| Packet decision closure | pending | Keep/revert/quarantine/defer/block every selected case honestly | pending |
| Local completion status | pending | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pending |
| No duplicate registry | pending | Prove no sidecar behavior manifest/database was created | pending |
| Generated/source and host repair | pending | Repair drift/host methodology or record blocked claim | pending |
| Orchestrator writer closure | pending | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | pending |
| Workflow slowdown closure | pending | Repair avoidable slow/stale/noisy proof paths or defer with owner | pending |
| Methodology delta closure | pending | Resolve repair-now/no-change/defer for every case | pending |
| Source/generated sync | pending | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pending |
| Agent-native review | pending | Run for changed agent workflows or record N/A | pending |
| Final handoff contract | pending | Record tests, decisions, proof, sync, reviews, risks, and next owner | pending |
| Autoreview | pending | Run Task-owned review when explicitly requested or closing a PR or record N/A | pending |
| Regression semantic plan | yes | Run `node .agents/skills/patch/scripts/validate-regression-plan.mjs {{PLAN_PATH}} --complete` | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | in_progress | template created | source/host readiness |
| Current source and proof-host readiness | pending | | discover executable cases |
| Executable case discovery and selection | pending | | smallest probe |
| Cumulative reporter evidence inventory | pending | | reporter oracle expansion |
| Reporter oracle expansion | pending | | semantic validation |
| Pre-implementation semantic validation | pending | | smallest probe |
| Smallest high-value probe | pending | | reproduce/classify |
| Reproduce, classify, and red test | pending | | case repair |
| One-case Patch repair | pending | | verification |
| Focused verification and stability | pending | | packet decision |
| Keep/revert/quarantine | pending | | methodology delta |
| Methodology repair/no-change/defer | pending | | next case or closure |
| Reviews and final handoff | pending | | goal-plan check |
| Final goal-plan check | pending | | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| pending | pending | pending | pending | pending | pending | pending | pending | pending |

Reporter oracle matrix:

| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| pending | model | pending | pending | pending | pending | pending | pending | pending |
| pending | dom-native | pending | pending | pending | pending | pending | pending | pending |
| pending | pointer-feedback | pending | pending | pending | pending | pending | pending | pending |
| pending | focus | pending | pending | pending | pending | pending | pending | pending |
| pending | popup | pending | pending | pending | pending | pending | pending | pending |
| pending | geometry-paint | pending | pending | pending | pending | pending | pending | pending |
| pending | subscription-lifecycle | pending | pending | pending | pending | pending | pending | pending |
| pending | runtime-errors | pending | pending | pending | pending | pending | pending | pending |
| pending | follow-up-input | pending | pending | pending | pending | pending | pending | pending |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| pending | pending | pending | pending | pending | pending | pending |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| pending | pending | pending | pending | pending |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| pending | pending | pending | pending | pending | pending | pending |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| pending | pending | pending | pending | pending | pending |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| pending | pending | pending | pending | pending | pending |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| pending | pending | pending | pending | pending | pending |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| pending | pending | pending | pending | pending | pending |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| pending | pending | pending | pending | pending | pending |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| pending | pending | pending | pending | pending | pending |

Findings:

- pending

Timeline:

- pending

Decisions and tradeoffs:

- pending

Review fixes:

- pending

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | N/A | N/A |

Verification evidence:

- pending

Final handoff:

- executable cases: pending
- cumulative reporter evidence, phase-specific oracles, and forbidden states: pending
- failed-fix invalidation and escape-prevention evidence: pending
- proof receipts and affected-corpus replay: pending
- started-gate failure closure: pending
- changed files: pending
- design decisions: pending
- tests and proof: pending
- source/generated sync: pending
- P1 and agent-native findings: pending
- residual risks and next owner: pending
- local completion status and integration/public-status boundary: pending

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | requirement extraction |
| Where am I going? | source/host readiness, executable cases, patch, verification, closeout |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | pending |
| What have I done? | template created |

Open risks:

- pending
