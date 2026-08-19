# {{TITLE}}

Objective:
TODO: Write the short Regression objective under 240 characters.

Flow mode:
one-shot execution

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Primary template:
{{TEMPLATE_PATH}}

Applied packs:
- none

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
- Load `.agents/skills/regression/references/methodology.md`.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:
- Every selected observed regression has an executable test that fails on the
  violated invariant and passes after the fix.
- Current source and every proof host are ready before behavior claims.
- Every kept case has exact reproduction, one-case Patch evidence, focused
  green proof, required retry-free stability, final ref/dirty-boundary proof,
  and no accepted P2 finding.
- Every case records `repair-now`, evidence-backed `no-change`, or
  evidence-backed `defer`.
- All canonical Work Checklist and Completion Gates rows resolve and
  `check-complete.mjs` passes.

Verification surface:
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- P2 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`

Constraints:
- Executable tests own durable regression behavior.
- GitHub owns issue provenance/status; exact refs and runtime/CI receipts own
  integration claims.
- Regression owns selection, proof width, stability, packet decision, claim
  width, and methodology delta.
- Patch owns one normalized local repair at a time.
- The goal plan is transient coordination, not a second behavior database.
- Baselines are evidence, not law. Proxy proof never upgrades the exact case.
- No parallel writers to shared source, tests, plans, generated output, builds,
  or route hosts.
- Generated output is not a source owner.
- Do not widen local proof into fixed/shipped/completed wording without final
  pushed/integration evidence.

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
- next owner: Regression
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
| Regression methodology loaded | pending | pending |
| Active goal checked or created | pending | pending |
| Current source owner and tested ref recorded | pending | pending |
| Executable test cases discovered | pending | pending |
| Route/proof-host readiness plan recorded | pending | pending |
| Patch delegation boundary recorded | pending | pending |
| Orchestrator writer ownership recorded | pending | pending |
| Output budget strategy recorded | pending | pending |
| Claim width and blocked rules recorded | pending | pending |

Work Checklist:
- [ ] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [ ] First checkpoint captures every explicit requirement before mutable work.
- [ ] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [ ] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [ ] Generated/source drift and host readiness are repaired or block the claim.
- [ ] Every selected case has a stable ID, source reference, owner, setup,
      action, expected outcome, executable test path/command, tested ref, and
      required stability.
- [ ] The smallest falsifying executable probe ran before scaling.
- [ ] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [ ] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [ ] Regression delegated only one normalized case at a time to Patch.
- [ ] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P2 review, and caveat.
- [ ] Focused green proof and exact final fresh-host replay passed.
- [ ] Required retry-free stability runs passed with no retry.
- [ ] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [ ] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [ ] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [ ] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [ ] Every case records one methodology delta.
- [ ] Claim wording matches local, pushed, integration, and release evidence.
- [ ] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [ ] Output budget discipline was followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | pending | Close every selected executable case and methodology row | pending |
| Current-source readiness | pending | Prove source owner and final tested ref/dirty boundary | pending |
| Route/proof-host readiness | pending | Prove the runner/host observes current source | pending |
| Executable regression coverage | pending | Record exact test file, red result, green result, and owning invariant | pending |
| Smallest-probe closure | pending | Record first falsifying probe and any host repair | pending |
| Patch delegation closure | pending | Read back one-case root-cause/red/green/proof evidence | pending |
| Focused verification closure | pending | Run owning test and exact final-case replay | pending |
| Stability closure | pending | Record retry-free warm runs or evidence-backed N/A | pending |
| Packet decision closure | pending | Keep/revert/quarantine/defer/block every selected case honestly | pending |
| No duplicate registry | pending | Prove no sidecar behavior manifest/database was created | pending |
| Generated/source and host repair | pending | Repair drift/host methodology or record blocked claim | pending |
| Orchestrator writer closure | pending | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | pending |
| Workflow slowdown closure | pending | Repair avoidable slow/stale/noisy proof paths or defer with owner | pending |
| Methodology delta closure | pending | Resolve repair-now/no-change/defer for every case | pending |
| Source/generated sync | pending | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pending |
| Agent-native review | pending | Run for changed agent workflows or record N/A | pending |
| Final handoff contract | pending | Record tests, decisions, proof, sync, reviews, risks, and next owner | pending |
| Autoreview | pending | Run P2 autoreview for non-trivial implementation changes or record N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | in_progress | template created | source/host readiness |
| Current source and proof-host readiness | pending | | discover executable cases |
| Executable case discovery and selection | pending | | smallest probe |
| Smallest high-value probe | pending | | reproduce/classify |
| Reproduce, classify, and red test | pending | | patch delegation |
| One-case Patch delegation | pending | | verification |
| Focused verification and stability | pending | | packet decision |
| Keep/revert/quarantine | pending | | methodology delta |
| Methodology repair/no-change/defer | pending | | next case or closure |
| Reviews and final handoff | pending | | goal-plan check |
| Final goal-plan check | pending | | final response |

Selected executable cases:
| Case ID | Source reference | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|---------------------|--------|------------|------------|
| pending | pending | pending | pending | pending | pending |

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
- changed files: pending
- design decisions: pending
- tests and proof: pending
- source/generated sync: pending
- P2 and agent-native findings: pending
- residual risks and next owner: pending

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
