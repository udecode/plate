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
- Fill the selected-case, reporter-oracle, failed-fix, and architecture tables,
  then run `validate-regression-plan.mjs` before implementation.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:

- Every selected observed regression has an executable test that fails on the
  violated invariant and passes after the fix.
- Every selected case records `unit-red: <test>` or
  `e2e-required: <lower-layer limitation>`. Unit/package RED stops new E2E test
  creation; Browser may remain final verification without permanent E2E coverage.
- Every case has positive and forbidden-state assertions for model, DOM/native,
  pointer feedback, focus, popup, geometry/paint, runtime errors, and follow-up
  input, with an N/A reason for observations that do not apply.
- Current source and every proof host are ready before behavior claims.
- Every kept case has exact reproduction, one-case Patch evidence, focused
  green proof, required retry-free stability, final ref/dirty-boundary proof,
  and no accepted P1 finding.
- Every kept case and the run are marked `completed` when those local gates
  pass. Commit and push are not local completion gates.
- Every case records `repair-now`, evidence-backed `no-change`, or
  evidence-backed `defer`.
- Every failed claimed fix invalidates its prior proof and automatically repairs
  Regression with an executable workflow test before the next product attempt.
- A second failed fix or architecture trigger has an accepted Best API and
  Plite/Plate layer plan before implementation resumes.
- Final proof has a generated receipt and affected-corpus replay after the last
  shared-owner edit.
- All canonical Work Checklist and Completion Gates rows resolve and
  both semantic validation and `check-complete.mjs` pass.

Verification surface:

- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs {{PLAN_PATH}} --complete`
- P1 autoreview for non-trivial implementation packets
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
- Mark fully proved local work `completed` and record its local ref/dirty
  fingerprints plus uncommitted/unpushed state when true. Do not widen that
  status into integrated, shipped, released, or public issue completion without
  the owning evidence and authority.
- A failed fix means a claimed candidate/kept/completed repair that fails exact
  replay/final verification or receives a reporter contradiction. Expected TDD
  red is not a failed fix.
- A failed fix always enters automatic Regression `repair-now`; prose-only
  repair, `no-change`, and `defer` cannot resume the product attempt.

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
| Cumulative reporter evidence resolved | pending | Original report, acceptance criteria, recordings, and every later reporter delta are inventoried without dropping still-applicable claims. |
| Reporter oracle matrix resolved | pending | pending |
| Regression semantic validator ready | pending | pending |
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
      action, expected outcome, expected-outcome authority, executable test
      path/command, tested ref, and required stability. A negative report does
      not authorize an invented positive behavior.
- [ ] Every selected case records its `Red-test escalation`. Try the exact
      owner-level unit/package test first. `unit-red:` forbids a new E2E test;
      `e2e-required:` names why no exact unit/package RED is possible. Browser
      verification alone does not become permanent E2E coverage.
- [ ] Every selected case inventories its base acceptance, recordings, and all
      later reporter confirmations/contradictions as cumulative deltas. Every
      still-applicable claim stays required; superseded claims cite the source
      and reason that removed them.
- [ ] Every required evidence row maps to a phase-specific executable oracle.
      A final-state assertion never substitutes for a transient during-action
      caret, overlay, popup, selection, pointer affordance, or paint assertion.
- [ ] Every selected case has one or more phase-specific reporter-oracle rows
      for model, DOM/native, pointer feedback, focus, popup, geometry/paint,
      runtime errors, and follow-up input.
- [ ] Every pointer, mouse, cursor, hover, or resize/drag-handle case has an
      applicable `pointer-feedback` row for the named interaction phase. Cursor
      and hover/active/tooltip/drag affordances are proved independently from
      model state, DOM selection, preview state, and eventual action.
- [ ] Every applicable `pointer-feedback` positive assertion records
      `reporter-noun: <plain noun>` and
      `affordance-inventory: <accessible labels, selectors, or owners>` after
      source and exact-route discovery. Any excluded matching affordance cites
      explicit reporter or accepted-product authority.
- [ ] Every completed applicable `pointer-feedback` row records
      `interaction-trace: pass`, the actual pointer `target:`, delivered
      `event:`, and `buttons:` state from the same interaction path.
- [ ] Every flash, flicker, or one-frame pointer-feedback claim uses a target-
      capture or equivalent pre-handler oracle and records
      `pre-handler-state: pass`; eventual post-handler style is insufficient.
- [ ] Every applicable popup/toolbar oracle after an action or release has an
      applicable `follow-up-input@follow-up` oracle proving the next owning-
      surface interaction still works.
- [ ] Every applicable popup close oracle at `after-action` or `after-release`
      accounts for `dom-native` and `focus` at the same phase; later follow-up
      input never substitutes for close-time selection/caret preservation.
- [ ] Every required caret, insertion-point, caret-accessible line, editable
      blank line/row, or text-cursor claim maps to applicable same-phase
      `dom-native` and `focus` rows plus `follow-up-input@follow-up`. Native
      browser proof replays the real interaction and asserts caret paint
      independently from wrapper height, DOM markers, and block highlighting.
- [ ] Every required positive layout reference maps to same-phase
      `geometry-paint`. The oracle records `reference-geometry:`, its browser
      proof executes `layout-bounds`, and completion records
      `layout-bounds: pass`; negative-only paint or absence proof is insufficient.
- [ ] Every applicable oracle row has a positive assertion, a distinct forbidden
      state, an executable layer/anchor, and an exact result; every inapplicable
      row has N/A reasons.
- [ ] The smallest falsifying executable probe ran before scaling.
- [ ] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [ ] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [ ] Regression delegated only one normalized case at a time to Patch.
- [ ] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [ ] Focused green proof passed. Final Browser verification runs when repo or
      claim policy requires it; E2E replay is required only for
      `e2e-required:` or already-existing affected-corpus E2E coverage.
- [ ] Final proof ran through `capture-proof-receipt.mjs`; its ref, input digest,
      host, timestamps, retry count, and receipt ID validate.
- [ ] Required retry-free stability runs passed with no retry.
- [ ] Responsive geometry proof waits through animation-frame, resize-observer,
      or renderer-commit settling with a bounded invariant poll; it records
      pre-convergence and converged geometry instead of treating one immediate
      post-resize bounding-box read as final.
- [ ] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification.
- [ ] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
- [ ] Every blocking pixel classifier passes known-correct single-layer,
      known-absent, and known-invalid duplicate-layer controls through the same
      capture path; width or outer geometry alone cannot certify layer count.
      A failed control invalidates prior results and freezes product edits until
      the proof helper is repaired.
- [ ] Every completed applicable `geometry-paint` row names actual pixel capture
      and classification in its proof layer and records `positive-control: pass`
      plus `negative-control: pass` and `duplicate-control: pass`; computed style,
      DOM state, selection text, callback traces, and unclassified screenshots
      are diagnostics only.
- [ ] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
- [ ] Every shared CSS selector, marker, class map, or style expansion has a
      pre-edit consumer inventory. The affected corpus includes explicit
      transparent, borderless, shadowless, and ringless overrides, each with a
      forbidden duplicate/inherited-paint geometry oracle.
- [ ] Every already-executable affected case has a `pass:` or `red:` pre-edit
      baseline recorded before its shared owner changes.
- [ ] Every requested or started package, browser, root, or CI gate that failed
      is recorded and passes an exact final rerun on the final bytes.
- [ ] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [ ] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [ ] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [ ] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [ ] Every case records one methodology delta.
- [ ] Every failed claimed fix revoked prior completion, automatically repaired
      Regression with executable workflow proof, and restarted at attempt N+1.
- [ ] Every second failed fix or architecture trigger passed Best API and the
      owning Plite/Plate plan before another Patch attempt.
- [ ] Claim wording matches local, pushed, integration, and release evidence.
- [ ] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
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
| E2E escalation closure | pending | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | pending |
| Cumulative reporter evidence closure | pending | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pending |
| Reporter oracle closure | pending | Resolve positive and forbidden states for all eight observations and every applicable interaction phase per case | pending |
| Failed-fix interrupt closure | pending | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pending |
| Architecture pressure closure | pending | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pending |
| Proof receipt closure | pending | Validate generated final receipts against unchanged issue-owned inputs | pending |
| Affected-corpus replay closure | pending | Replay all cases affected by the last shared-owner edit | pending |
| Shared-style consumer closure | pending | Inventory every shared selector/class consumer and prove explicit paint neutralizers do not inherit or duplicate the shared surface | pending |
| Started-gate failure closure | pending | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pending |
| Smallest-probe closure | pending | Record first falsifying probe and any host repair | pending |
| Patch delegation closure | pending | Read back one-case root-cause/red/green/proof evidence | pending |
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
| Autoreview | pending | Run P1 autoreview for non-trivial implementation changes or record N/A | pending |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs {{PLAN_PATH}} --complete` | pending |
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
| Reproduce, classify, and red test | pending | | patch delegation |
| One-case Patch delegation | pending | | verification |
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
- failed-fix invalidation and automatic repair: pending
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
