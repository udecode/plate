# outside editor selection autoscroll regression

Invalidated on 2026-08-27 by reporter contradiction: the pointer can still intermittently stall after leaving the editor or browser. The prior receipt and local completion claim are not authoritative for boundary-exit liveness.

Objective:
Fix held selection drag autoscroll beyond the editor boundary; done when both directions sustain the existing 28px/frame maximum for five frames, release stops the lifecycle, the #5113 corpus stays green, and P1/final receipt gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-27-outside-editor-selection-autoscroll-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: new local regression report: a held text-selection drag moved beyond the editor top/bottom should rapidly keep auto-scrolling instead of stalling; #5113 remains completed and is affected corpus only
- lane and current source owner: current dirty `next`; Plite React `drag-auto-scroll-target.ts` and root interaction controller
- selected executable test cases: `outside-editor:selection-autoscroll-continues`
- tested ref or dirty-state boundary: dirty `219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493`, including the uncommitted completed #5113 fix and tests
- route / proof host and freshness method: owner-level package unit RED first; source-built `apps/www` `/` on a freshly restarted server for final Browser support; #5113 exact E2E replay as affected corpus
- invocation mode / timebox: explicit `$regression`, one-shot, no timebox

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-27-outside-editor-selection-autoscroll-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-outside-editor-selection-autoscroll-regression.md`

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

- allowed source owners: `packages/plite-react/src/editable/drag-auto-scroll-target.ts` and root interaction only if exact evidence requires it
- allowed proof/test owners: existing `packages/plite-react/test/root-interaction-controller.test.tsx`; existing #5113 E2E is affected corpus and must not be expanded when unit RED succeeds; one required Plite React changeset may be added or the current uncommitted related changeset may be broadened truthfully
- generated/source boundary: canonical source/tests and required existing changeset only; no generated/template edits
- browser/device claim width: current macOS desktop Chromium support; durable contract is owner-level signed scroll delta and clamped selection coordinate
- forbidden product/API/release/public mutations: no #5113 change, no GitHub mutation, commit, push, PR, release, public API change, toolbar workaround, or unrelated cleanup
- orchestration mode and writer ownership: Regression master; one Patch child only after RED; no concurrent shared-owner writers

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

- current phase: executable unit RED
- current executable case: `outside-editor:selection-autoscroll-continues`
- current case status: failed-fix reporter-contradiction; prior completion and receipt invalidated
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
| Prompt requirements captured | yes | Separate from completed #5113: held drag beyond editor top/bottom must continuously fast-scroll; both directions required; no public/Git mutation requested. |
| Regression methodology loaded | yes | Full methodology read before goal/test/child work. |
| Active goal checked or created | yes | Prior goal absent; new goal created for this date-based plan. |
| Current source owner and tested ref recorded | yes | Dirty base `219d1a...`; target helper currently rejects points beyond 48px outside. |
| Executable test cases discovered | yes | Existing root-interaction unit suite owns target/delta behavior; #5113 E2E is affected corpus. |
| Cumulative reporter evidence resolved | yes | Direct reporter statement retained; explicit correction keeps #5113 completed and separate. |
| Reporter oracle matrix resolved | yes | Eight observation rows below; primary unit contract is bidirectional 28px/frame continuation beyond the edge. |
| Regression semantic validator ready | yes | Pre-implementation validator passed; final complete validator recorded below. |
| Route/proof-host readiness plan recorded | yes | Package unit first; fresh localhost route only for final supportive Browser readback; existing #5113 E2E replay unchanged. |
| Patch delegation boundary recorded | yes | One case; target helper/root interaction, existing unit test, existing changeset only. |
| Orchestrator writer ownership recorded | yes | Not orchestrator mode; one Patch child becomes sole writer after RED. |
| Output budget strategy recorded | yes | Exact helper/controller/test files only; capped logs; generated/build trees excluded. |
| Claim width and blocked rules recorded | yes | Local completed only; block only if exact owner contract cannot be reproduced after proof-host repair. |

Work Checklist:

- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Generated/source drift and host readiness are repaired or block the claim.
- [x] Every selected case has a stable ID, source reference, owner, setup,
      action, expected outcome, expected-outcome authority, executable test
      path/command, tested ref, and required stability. A negative report does
      not authorize an invented positive behavior.
- [x] Every selected case records its `Red-test escalation`. Try the exact
      owner-level unit/package test first. `unit-red:` forbids a new E2E test;
      `e2e-required:` names why no exact unit/package RED is possible. Browser
      verification alone does not become permanent E2E coverage.
- [x] Every selected case inventories its base acceptance, recordings, and all
      later reporter confirmations/contradictions as cumulative deltas. Every
      still-applicable claim stays required; superseded claims cite the source
      and reason that removed them.
- [x] Every required evidence row maps to a phase-specific executable oracle.
      A final-state assertion never substitutes for a transient during-action
      caret, overlay, popup, selection, pointer affordance, or paint assertion.
- [x] Every selected case has one or more phase-specific reporter-oracle rows
      for model, DOM/native, pointer feedback, focus, popup, geometry/paint,
      runtime errors, and follow-up input.
- [x] Every pointer, mouse, cursor, hover, or resize/drag-handle case has an
      applicable `pointer-feedback` row for the named interaction phase. Cursor
      and hover/active/tooltip/drag affordances are proved independently from
      model state, DOM selection, preview state, and eventual action.
- [x] Every applicable `pointer-feedback` positive assertion records
      `reporter-noun: <plain noun>` and
      `affordance-inventory: <accessible labels, selectors, or owners>` after
      source and exact-route discovery. Any excluded matching affordance cites
      explicit reporter or accepted-product authority.
- [x] Every completed applicable `pointer-feedback` row records
      `interaction-trace: pass`, the actual pointer `target:`, delivered
      `event:`, and `buttons:` state from the same interaction path.
- [x] Every flash, flicker, or one-frame pointer-feedback claim uses a target-
      capture or equivalent pre-handler oracle and records
      `pre-handler-state: pass`; eventual post-handler style is insufficient.
- [x] Every applicable popup/toolbar oracle after an action or release has an
      applicable `follow-up-input@follow-up` oracle proving the next owning-
      surface interaction still works.
- [x] Every applicable popup close oracle at `after-action` or `after-release`
      accounts for `dom-native` and `focus` at the same phase; later follow-up
      input never substitutes for close-time selection/caret preservation.
- [x] Every applicable oracle row has a positive assertion, a distinct forbidden
      state, an executable layer/anchor, and an exact result; every inapplicable
      row has N/A reasons.
- [x] The smallest falsifying executable probe ran before scaling.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [x] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [x] Regression delegated only one normalized case at a time to Patch.
- [x] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [x] Focused green proof passed. Final Browser verification runs when repo or
      claim policy requires it; E2E replay is required only for
      `e2e-required:` or already-existing affected-corpus E2E coverage.
- [x] Final proof ran through `capture-proof-receipt.mjs`; its ref, input digest,
      host, timestamps, retry count, and receipt ID validate.
- [x] Required retry-free stability runs passed with no retry.
- [x] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification.
- [x] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
- [x] Every blocking pixel classifier passes known-correct single-layer,
      known-absent, and known-invalid duplicate-layer controls through the same
      capture path; width or outer geometry alone cannot certify layer count.
      A failed control invalidates prior results and freezes product edits until
      the proof helper is repaired.
- [x] Every completed applicable `geometry-paint` row names actual pixel capture
      and classification in its proof layer and records `positive-control: pass`
      plus `negative-control: pass` and `duplicate-control: pass`; computed style,
      DOM state, selection text, callback traces, and unclassified screenshots
      are diagnostics only.
- [x] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
- [x] Every shared CSS selector, marker, class map, or style expansion has a
      pre-edit consumer inventory. The affected corpus includes explicit
      transparent, borderless, shadowless, and ringless overrides, each with a
      forbidden duplicate/inherited-paint geometry oracle.
- [x] Every already-executable affected case has a `pass:` or `red:` pre-edit
      baseline recorded before its shared owner changes.
- [x] Every requested or started package, browser, root, or CI gate that failed
      is recorded and passes an exact final rerun on the final bytes.
- [x] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [x] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [x] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [x] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [x] Every case records one methodology delta.
- [x] Every failed claimed fix revoked prior completion, automatically repaired
      Regression with executable workflow proof, and restarted at attempt N+1.
- [x] Every second failed fix or architecture trigger passed Best API and the
      owning Plite/Plate plan before another Patch attempt.
- [x] Claim wording matches local, pushed, integration, and release evidence.
- [x] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
- [x] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [x] Output budget discipline was followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close case/methodology | pass: ±28px/frame for five frames both directions, 5/5 stability |
| Current-source readiness | yes | Prove final dirty boundary | pass: dirty `219d1a...`, receipt fingerprints 11 inputs |
| Route/proof-host readiness | yes | Prove current source | pass: fresh PID 43007 localhost:3002 plus package source runner |
| Executable regression coverage | yes | RED/GREEN | pass: owner unit null RED, exact bidirectional GREEN |
| E2E escalation closure | yes | Enforce unit-red | pass: no E2E added/expanded; existing #5113 only replayed |
| Cumulative reporter evidence closure | yes | Map evidence | pass: direct report mapped; #5113 correction preserved as scope boundary |
| Reporter oracle closure | yes | Resolve rows | pass: DOM/pointer/runtime rows pass; others evidence-backed N/A |
| Failed-fix interrupt closure | no | N/A | N/A: no claimed fix failed |
| Architecture pressure closure | yes | Record verdict | accepted: existing helper, no API/layer plan trigger |
| Proof receipt closure | yes | Validate receipt | pass: `sha256:c233e85f39a7dc16d3561990c9b4e55359e1200c983cf6ef9aa37fba0d623e9c` |
| Affected-corpus replay closure | yes | Replay shared owner corpus | pass: new unit + full owner file + typecheck + #5113 E2E in one receipt |
| Shared-style consumer closure | no | N/A | N/A: no CSS/style change |
| Started-gate failure closure | yes | Close failures | pass: stale server repaired; Ultracite rerun passed; Browser dwell limitation classified support-only |
| Smallest-probe closure | yes | Record probe | pass: first outside target null |
| Patch delegation closure | yes | Read Patch evidence | pass: root cause/files/proof/architecture returned |
| Focused verification closure | yes | Run owner/corpus proof | pass: 15/15 unit file, typecheck, #5113 1/1 |
| Stability closure | yes | Five fresh runs | pass: 5/5, retries 0 |
| Packet decision closure | yes | Decide | keep: minimal helper-domain fix |
| Local completion status | yes | Mark scope | completed local, uncommitted, unpushed |
| No duplicate registry | yes | Audit | pass: executable tests plus transient plan only |
| Generated/source and host repair | yes | Fresh host | pass: old PID replaced by fresh PID 43007 |
| Orchestrator writer closure | no | N/A | N/A: one Patch child was sole product writer |
| Workflow slowdown closure | yes | Resolve | pass: stopped-server and no-dwell Browser limitations recorded |
| Methodology delta closure | yes | Decide | no-change: method selected exact unit and rejected proxy Browser claim |
| Source/generated sync | no | N/A | N/A: no agent/generated source changed |
| Agent-native review | no | N/A | N/A: no agent workflow changed |
| Final handoff contract | yes | Record | pass: evidence/files/risks/status below |
| Autoreview | no | N/A | N/A: repo rule forbids autoreview on `next`; manual P1 source readback found no actionable P1 |
| Regression semantic plan | yes | Run final validator | pass: final command below |
| Goal plan complete | yes | Run final checker | pass: final command below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | separate non-#5113 goal and explicit requirements recorded | source/host readiness |
| Current source and proof-host readiness | completed | package runner ready; existing source server PID 34702 at localhost:3000; #5113 baseline green | discover executable cases |
| Executable case discovery and selection | completed | owner-level unit test selected | smallest probe |
| Cumulative reporter evidence inventory | completed | direct report plus #5113-separate correction | reporter oracle expansion |
| Reporter oracle expansion | completed | all eight observations below | semantic validation |
| Pre-implementation semantic validation | completed | structurally valid | smallest probe |
| Smallest high-value probe | completed | outside target null | reproduce/classify |
| Reproduce, classify, and red test | completed | exact owner unit RED | patch delegation |
| One-case Patch delegation | completed | sole writer returned candidate | verification |
| Focused verification and stability | completed | combined receipt proof | packet decision |
| Keep/revert/quarantine | completed | keep | methodology delta |
| Methodology repair/no-change/defer | completed | no-change | closure |
| Reviews and final handoff | completed | manual P1 readback; autoreview forbidden on next | goal-plan check |
| Final goal-plan check | completed | semantic/check-complete pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| outside-editor:selection-autoscroll-continues | Direct reporter statement in this task; #5113 explicitly remains fixed/separate | With primary held during text selection, move vertically more than 48px beyond the scrollport bottom, then top; execute five scheduler cycles each direction | The nearest editor scrollport keeps moving at the existing maximum signed delta `+28/-28px` per scheduler tick (140px over five cycles) and clamps the selection coordinate to its visible edge; it does not return null or stall until release | reporter: current user states normal behavior is rapid upward/downward scrolling outside the editor | unit-red: packages/plite-react/test/root-interaction-controller.test.tsx#keeps maximum selection drag autoscroll running beyond both scrollport edges | jsdom DOM scrollport with rect 0..100, outside points y=180/-80, dirty current next | `packages/plite-react/test/root-interaction-controller.test.tsx`; `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/root-interaction-controller.test.tsx -t "keeps maximum selection drag autoscroll running beyond both scrollport edges"` | invalidated: reporter-contradiction | dirty:219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493 | Regression repair |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| outside-editor:selection-autoscroll-continues | base-acceptance | Current user report: “鼠标划出编辑器区域外，正常的行为应该是快速上翻/下翻…似乎卡住了” | during-action | A held selection drag beyond the top/bottom editor edge keeps rapidly scrolling in both directions rather than stalling | required | dom-native@during-action, pointer-feedback@during-action | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps maximum selection drag autoscroll running beyond both scrollport edges | pass: both directions sustain 28px/frame for five frames |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| outside-editor:selection-autoscroll-continues | model | during-action | no | N/A: this case changes scroll-target continuation, not the editor document/selection model; completed #5113 remains the selection-follow corpus | N/A: no new model transition is claimed | N/A: existing #5113 browser corpus owns model selection follow | N/A: no new model test | N/A: affected corpus baseline passes |
| outside-editor:selection-autoscroll-continues | dom-native | during-action | yes | The DOM scrollport advances exactly +28px/frame below and -28px/frame above for five frames; clamped selection clientY remains 99/0 | Target becomes null, scrollTop stalls, sign reverses, or clamped coordinate escapes the visible edge | package DOM unit with real scrollTop/rect | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps maximum selection drag autoscroll running beyond both scrollport edges | pass: +140/-140px totals; clientY 99/0 |
| outside-editor:selection-autoscroll-continues | pointer-feedback | during-action | yes | reporter-noun: selection drag; affordance-inventory: contenteditable text-selection cursor, nearest vertical scrollport, top/bottom edge autoscroll target; vertically aligned outside pointer keeps the maximum signed target | Outside pointer loses its autoscroll target or routes to a farther page scroll owner | package DOM coordinate/target trace plus existing held-button browser trace | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps maximum selection drag autoscroll running beyond both scrollport edges | pass: interaction-trace: pass; target: nearest editor scrollport/outside coordinate; event: mousemove; buttons: 1; compound unit + #5113 held path |
| outside-editor:selection-autoscroll-continues | focus | during-action | no | N/A: report is about scroll continuation; #5113 affected browser corpus preserves editor focus | N/A: no focus transfer is requested | N/A: existing affected browser corpus | N/A: no new focus test | N/A: #5113 baseline pass |
| outside-editor:selection-autoscroll-continues | popup | during-action | no | N/A: no popup/toolbar lifecycle is reported | N/A: no popup state is part of this case | N/A: existing #5113 affected corpus protects toolbar lifecycle | N/A: no new popup test | N/A: #5113 baseline pass |
| outside-editor:selection-autoscroll-continues | geometry-paint | during-action | no | N/A: scrollTop/target behavior is DOM geometry, not a painted-pixel fidelity claim | N/A: no stale/duplicate paint claim | N/A: numeric DOM scroll contract | N/A: no pixel test | N/A: no paint claim |
| outside-editor:selection-autoscroll-continues | runtime-errors | during-action | yes | Both direction loops complete without exceptions | Runtime error interrupts scrolling | package unit runner | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps maximum selection drag autoscroll running beyond both scrollport edges | pass: five runs and full owner file complete without runtime error |
| outside-editor:selection-autoscroll-continues | follow-up-input | after-release | no | N/A: no popup close/follow-up regression is reported; existing #5113 corpus covers release/follow-up usability | N/A: no new after-release behavior is selected | N/A: existing #5113 affected browser corpus | N/A: no new follow-up test | N/A: #5113 baseline pass |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| outside-editor:selection-autoscroll-continues | 1 | invalidated | prior five-run command | invalidated: reporter-contradiction outside editor/browser liveness was unproved | dirty:219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493 | sha256:c2b8b0eba6f173d663ea67dcb674a42ab2d7c975c4fab67e9440298023249ec6 | 11 | prior inputs | prior host | prior | prior | prior | 0 | invalidated: sha256:c233e85f39a7dc16d3561990c9b4e55359e1200c983cf6ef9aa37fba0d623e9c |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite React drag auto-scroll | outside-editor:selection-autoscroll-continues | red: new outside unit null; pass: #5113 1/1 pre-edit | 2026-08-27T07:34:14.828Z | combined receipt command also replays #5113 | sha256:c2b8b0eba6f173d663ea67dcb674a42ab2d7c975c4fab67e9440298023249ec6 | pass: new unit 5/5, full owner 15/15, typecheck, #5113 1/1 |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Proof hosts / format | stopped localhost:3002; Browser drag has no held dwell; scoped Ultracite initially red | host/support/code-format | fresh PID 43007; Browser classified support-only; Patch formatted owner | pass: receipt gates and Browser zero errors |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| none | 0 | N/A: expected TDD RED is not a failed claimed fix | N/A: no failed claimed fix | N/A: no prior claim | N/A: no repair | N/A: no workflow test | N/A: no trigger | N/A: no escalation | N/A: Patch may start |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| outside-editor:selection-autoscroll-continues | 0 | none: first-attempt local helper repair | patch | N/A: no public API change | N/A: existing Plite React owner | accepted: exact owner unit RED |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| outside-editor:selection-autoscroll-continues | Plite React drag target | package unit plus fresh localhost:3002 | receipt fingerprint and PID start; Browser editor visible/no errors | source-first | pass |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| outside-editor:selection-autoscroll-continues | exact unit RED: target null | helper, existing unit, changeset | exact unit, 5 runs, full file, typecheck, #5113 corpus | complete Patch handoff | pass |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| outside-editor:selection-autoscroll-continues | focused unit + fresh package processes | 5 | pass, pass, pass, pass, pass | 0 | completed |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| outside-editor:selection-autoscroll-continues | prior RED/GREEN and receipt invalidated | invalidated: reporter-contradiction | no completion authority | Missing boundary-exit event/range-miss liveness oracle | Regression repair attempt 2 |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| outside-editor:selection-autoscroll-continues | Regression layer/proof selection | no-change | existing methodology retained | pass: unit-red prevented duplicate E2E and final validators | completed |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Browser outside hold | Browser support | immediate release even with 200 repeated path points | API has no dwell control | support only | exact speed remains unit-owned; no product tuning against invalid gesture |

Findings:

- `getDragAutoScrollTarget` rejects coordinates more than 48px outside a scrollport, so y=180/-80 for a 0..100 scrollport returns null instead of the existing maximum delta 28.
- New unit RED fails on the first downward frame. Existing #5113 exact E2E passes on current pre-edit bytes at localhost:3000.

Timeline:

- 2026-08-27: created separate goal after user confirmed #5113 remains fixed.
- 2026-08-27: added owner-level bidirectional five-frame unit oracle; exact RED reproduced; repaired stale-host attempt and recorded green #5113 pre-edit baseline.

Decisions and tradeoffs:

- Keep #5113 completed and use it only as affected corpus. Unit RED ends new permanent E2E creation.
- “Fast” uses the existing maximum 28px/frame law; the fix should extend its domain, not invent a new speed curve.

Review fixes:

- Autoreview is forbidden on `next`; manual P1 readback found no actionable P1. The fix only removes vertical distance cutoffs and preserves horizontal ownership, scrollability and ±28px/frame laws.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| #5113 baseline hit stopped localhost:3002 | 1 | inspect current repo dev owner and use live localhost:3000 | resolved: exact E2E passes on PID 34702 |

Verification evidence:

- Exact RED: first y=180 outside-bottom target was null.
- Exact GREEN: both directions 5 frames at ±28px, totals ±140px, clamped clientY 99/0; 5/5 stability.
- Full owner file 15/15, Plite React typecheck, scoped Ultracite, diff check, #5113 E2E 1/1.
- Fresh Browser route editor visible, selection works, zero console errors; held-dwell limitation is support-only.
- Receipt `sha256:c233e85f39a7dc16d3561990c9b4e55359e1200c983cf6ef9aa37fba0d623e9c`.

Final handoff:

- executable cases: `outside-editor:selection-autoscroll-continues` completed.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: direct report mapped; #5113 remains separate/completed.
- failed-fix invalidation and automatic repair: N/A; expected TDD RED only.
- proof receipts and affected-corpus replay: combined final receipt recorded.
- started-gate failure closure: stale server and formatting repaired; Browser dwell classified support-only.
- changed files: drag target helper, existing root interaction unit, related changeset, this plan.
- design decisions: extend existing max-speed domain beyond vertical edges; keep horizontal owner boundary and all other laws.
- tests and proof: unit 5/5, full file, typecheck, #5113 E2E, Browser support, manual P1 readback.
- source/generated sync: N/A; no agent/generated source changed.
- P1 and agent-native findings: autoreview N/A on next; manual P1 clean; agent-native N/A.
- residual risks and next owner: Browser API cannot dwell while held; exact speed is unit-owned. User/coordinator owns commit/push.
- local completion status and integration/public-status boundary: completed locally, uncommitted/unpushed; no GitHub/public mutation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | exact unit RED ready for Patch |
| Where am I going? | semantic validation, one Patch, unit + #5113 corpus stability, P1, receipt |
| What is the goal? | keep rapid bidirectional selection autoscroll running beyond editor edges without regressing #5113 |
| What have I learned? | current 48px outside cutoff returns null; existing speed law is 28px/frame |
| What have I done? | separate goal/plan, exact unit RED, #5113 pre-edit green baseline |

Open risks:

- Final Browser can support current Chromium only; raw reporter pointer distance/environment was not recorded.
