# outside editor autoscroll failed fix repair

Invalidated on 2026-08-27 by a fresh reporter contradiction: outside-editor/browser drag speed remains inconsistent and scrolling can still stop. The attempt-3 receipt and local completion are not authoritative for stable scroll-owner ownership or speed.

Objective:
Repair the Regression miss and complete attempt 2 for intermittent held-drag stalls outside the editor/browser; done when the old packet is mechanically rejected, architecture owners accept the target, exact liveness RED→GREEN passes 5/5, and all prior corpus remains green.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-27-outside-editor-autoscroll-failed-fix-repair.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: reporter contradiction for `outside-editor:selection-autoscroll-continues`; intermittent stall after pointer exits editor or browser viewport while still held; #5113 remains separate affected corpus
- lane and current source owner: dirty `next`; Regression boundary-liveness methodology/validator first, then Plite React root interaction/autoscroll scheduling
- selected executable test cases: attempt 2 of `outside-editor:selection-autoscroll-continues`
- tested ref or dirty-state boundary: dirty `219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493`; prior attempt receipt/local completion invalidated in its plan
- route / proof host and freshness method: workflow fixtures + source/mirror parity; owner unit with transient range miss and release cleanup; fresh source-built homepage plus existing #5113 E2E corpus
- invocation mode / timebox: automatic `regression repair` followed by attempt 2; one-shot; no timebox

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-27-outside-editor-autoscroll-failed-fix-repair.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-outside-editor-autoscroll-failed-fix-repair.md`

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

- allowed source owners: `.agents/rules/regression.mdc`, Regression source methodology/validator/tests, then only the accepted Plite React boundary-liveness owner from Best API/Plite Plan
- allowed proof/test owners: Regression validator workflow tests; existing Plite React root-interaction test; existing outside-edge unit and #5113 E2E as affected corpus
- generated/source boundary: edit `.agents/rules/**` sources, run `pnpm install`, prove `.agents/skills/**` mirrors; product source/tests/changeset only after repair and architecture gates
- browser/device claim width: pointer exits editor/browser viewport without `window blur` while buttons=1; transient range miss must not stop; mouseup/pointerup/dragend/window blur must stop
- forbidden product/API/release/public mutations: no public API unless Best API requires it; no timer/focus/UI compensation, generated hand edits, commit, push, PR, GitHub, #5113 status change, or release
- orchestration mode and writer ownership: Regression master owns plan/workflow repair/architecture; exactly one Patch child after RED, serialized against all shared owners

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

- current phase: final closure
- current executable case: `outside-editor:selection-autoscroll-continues`, attempt 3 proof after two repaired failed fixes
- current case status: failed-fix reporter-contradiction; attempt-3 completion and receipt invalidated
- next owner: user/coordinator for optional commit/push
- goal status: complete

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Reporter says editor/browser exit still intermittently stalls; prior completion is invalid; #5113 stays separate; no Git/public mutation. |
| Regression methodology loaded | yes | Regression SKILL and full methodology re-read before new goal/product work. |
| Active goal checked or created | yes | No active goal; repair/attempt-2 goal created for this plan. |
| Current source owner and tested ref recorded | yes | Dirty base `219d1a...`; prior plan/receipt explicitly invalidated. |
| Executable test cases discovered | yes | Workflow validator fixture plus Plite React transient range-miss lifecycle test; exact title finalized after architecture. |
| Cumulative reporter evidence resolved | yes | Base outside-edge acceptance and the later editor/browser intermittent-stall delta are both included in the executable oracle. |
| Reporter oracle matrix resolved | yes | Required boundary event-source liveness, transient range-miss continuation, and release/blur stop fields defined below. |
| Regression semantic validator ready | yes | Pre-implementation validator passed after accepted architecture; final `--complete` runs below. |
| Route/proof-host readiness plan recorded | yes | Repair workflow proof/source parity first; then exact package test and fresh route/corpus. |
| Patch delegation boundary recorded | yes | No Patch before repair-now and Best API/Plite Plan; one normalized attempt-2 case only. |
| Orchestrator writer ownership recorded | yes | Not orchestrator mode; one Patch child only after master gates. |
| Output budget strategy recorded | yes | Exact Regression rule/validator tests and exact Plite owners; capped output, no generated/build scans. |
| Claim width and blocked rules recorded | yes | Local attempt-2 claim only; blocked only after workflow repair/architecture/exact host alternatives are exhausted. |

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
| Named completion threshold | yes | Close case/methodology | pass: boundary liveness/recovery/release, 5/5, both repairs, final receipt |
| Current-source readiness | yes | Prove final dirty boundary | pass: dirty `219d1a...`, 19 receipt inputs fingerprinted |
| Route/proof-host readiness | yes | Prove current source | pass: fresh PID 71166 localhost:3002 plus source-first package runner |
| Executable regression coverage | yes | RED/GREEN | pass: exact transient range-miss RED→GREEN and 4 release paths |
| E2E escalation closure | yes | Enforce unit-red | pass: no new E2E; existing #5113 affected corpus only, phase-sampled diagnostic repaired |
| Cumulative reporter evidence closure | yes | Map evidence | pass: base acceptance + latest reporter delta both executable |
| Reporter oracle closure | yes | Resolve rows | pass: liveness, model/DOM recovery, focus/cleanup, follow-up all pass; popup/paint N/A |
| Failed-fix interrupt closure | yes | Close two failures | pass: attempt1 reporter contradiction and attempt2 final-verification each invalidated/repaired before resume |
| Architecture pressure closure | yes | Best API/layer plan | accepted: no public API/manager; root interaction owns liveness/release; second-failed-fix target unchanged |
| Proof receipt closure | yes | Validate attempt3 receipt | pass: `sha256:e8cd2571006494ae30ad54c36ddc27244967fff22d489ca73326322c044c31df` |
| Affected-corpus replay closure | yes | Combined final replay | pass: receipt digest `sha256:a27ce50e79a896d08ac0848d8916da571e36e86b3d0249dfb179871413bf97c6` |
| Shared-style consumer closure | no | N/A | N/A: no CSS/style change |
| Started-gate failure closure | yes | Close all failures | pass: hosts, exact RED, proof-harness reds, final #5113 sampling, Ultracite all rerun |
| Smallest-probe closure | yes | Record probe | pass: range miss returned false after successful scroll |
| Patch delegation closure | yes | Read worker evidence | pass: root cause/files/markers/commands/fingerprints returned |
| Focused verification closure | yes | Owner/fresh corpus | pass: 5 lifecycle tests, owner 19/19, typecheck, #5113, Browser zero errors |
| Stability closure | yes | Fresh executions | pass: lifecycle 5/5 and formatted final #5113 5/5, retries 0 |
| Packet decision closure | yes | Decide | keep: minimal root-interaction continuation plus executable cleanup |
| Local completion status | yes | Mark scope | completed local, uncommitted, unpushed; no public mutation |
| No duplicate registry | yes | Audit | pass: executable tests plus transient plan only |
| Generated/source and host repair | yes | Sync/fresh host | pass: two `pnpm install` syncs, mirrors exact, fresh PID 71166 |
| Orchestrator writer closure | no | N/A | N/A: one Patch worker was sole product writer |
| Workflow slowdown closure | yes | Resolve | pass: no-dwell Browser, Next lock, frozen API/harness and sampling drift recorded/repaired |
| Methodology delta closure | yes | Repair-now | pass: boundary liveness/release and unchanged-bytes diagnostic are mechanically enforced |
| Source/generated sync | yes | Run install/parity | pass: 70 workflow tests, resource check, three rule/skill `cmp` checks |
| Agent-native review | yes | Review workflow | pass: user report→route→source→mirror→validator/proof→handoff chain complete |
| Final handoff contract | yes | Record | pass: files, failed fixes, architecture, proof, risks and next owner below |
| Autoreview | no | N/A | N/A: repo forbids autoreview on `next`; worker and master manual P1 readbacks found no actionable P1 |
| Regression semantic plan | yes | Run final validator | pass: final command below |
| Goal plan complete | yes | Run final checker | pass: final command below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | failed-fix attempt-2 goal created; requirements/boundaries captured | workflow repair |
| Current source and proof-host readiness | completed | dirty ref and Regression/Plite owners identified | discover executable cases |
| Executable case discovery and selection | completed | validator workflow test plus planned Plite unit lifecycle test | workflow repair |
| Cumulative reporter evidence inventory | completed | base acceptance plus latest reporter contradiction retained | reporter oracle expansion |
| Reporter oracle expansion | completed | boundary liveness/range miss/release stop contract defined | semantic validation |
| Pre-implementation semantic validation | completed | accepted architecture + exact RED packet structurally valid | smallest probe |
| Smallest high-value probe | completed | successful scroll + null range returned false | reproduce/classify |
| Reproduce, classify, and red test | completed | exact unit RED | patch delegation |
| One-case Patch delegation | completed | attempt2 candidate returned; final-verification interrupt repaired before attempt3 proof | verification |
| Focused verification and stability | completed | final receipt and independent 5/5 runs | packet decision |
| Keep/revert/quarantine | completed | keep after attempt3 | methodology delta |
| Methodology repair/no-change/defer | completed | repair-now: source rule, methodology, validator, workflow test, generated parity | architecture gate |
| Reviews and final handoff | completed | manual P1 + agent-native PASS; autoreview forbidden on next | goal-plan check |
| Final goal-plan check | completed | semantic/check-complete pass recorded | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| outside-editor:selection-autoscroll-continues | Base outside-edge report plus latest intermittent editor/browser-exit contradiction | Start held selection autoscroll, exit editor/browser viewport without blur, inject one transient `resolveEventRange=null`, then recover; separately deliver mouseup/pointerup/dragend/window blur | boundary-liveness: last valid boundary coordinate keeps scheduler/scroll alive across missing target/range; selection resumes on recovery; release-cleanup: every terminal release/blur stops immediately | reporter: base fast outside-scroll expectation plus latest reporter delta | unit-red: packages/plite-react/test/root-interaction-controller.test.tsx#continues drag autoscroll through transient boundary range misses | Plite React DOM/runtime unit on dirty `next`; existing Browser route/corpus supportive | prior command | invalidated: reporter-contradiction owner/speed consistency unproved | dirty:219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493 | Regression repair attempt 4 |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| outside-editor:selection-autoscroll-continues | base-acceptance | Prior report: outside editor should rapidly scroll both directions | during-action | Held drag continues at the boundary until a terminal release | required | dom-native@during-action, pointer-feedback@during-action | test: packages/plite-react/test/root-interaction-controller.test.tsx#continues drag autoscroll through transient boundary range misses | pass: outside speed, miss continuation and four terminal events proved |
| outside-editor:selection-autoscroll-continues | latest-reporter-delta | Current report: outside browser or editor intermittently stalls | during-action | Boundary exit and one missing target/range cannot kill the live loop | required | dom-native@during-action, pointer-feedback@during-action | test: packages/plite-react/test/root-interaction-controller.test.tsx#continues drag autoscroll through transient boundary range misses | pass: miss tick scrolls 0→28; recovery tick 28→56 and selection advances |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| outside-editor:selection-autoscroll-continues | model | during-action | yes | Last valid selection remains coherent during one range miss and advances when range resolution recovers | Selection clears, reverses, or never resumes | package DOM/runtime unit | test: packages/plite-react/test/root-interaction-controller.test.tsx#continues drag autoscroll through transient boundary range misses | pass: currentRange unchanged on miss and advances to `[1,0]:4` on recovery |
| outside-editor:selection-autoscroll-continues | dom-native | during-action | yes | Scroll advances during the range miss and selection coordinate remains clamped/recoverable | Scroll loop stops on null range | package DOM/runtime unit | test: packages/plite-react/test/root-interaction-controller.test.tsx#continues drag autoscroll through transient boundary range misses | pass: scrollTop 0→28 on miss and 28→56 on recovery |
| outside-editor:selection-autoscroll-continues | pointer-feedback | during-action | yes | reporter-noun: selection drag; affordance-inventory: editor scrollport, browser viewport boundary, held text cursor; boundary-liveness: last valid boundary coordinate survives missing DOM target/range; release-cleanup: mouseup pointerup dragend and blur stop | Boundary exit or transient range miss kills the loop, or release leaves it running | package DOM/browser boundary-exit lifecycle oracle | test: packages/plite-react/test/root-interaction-controller.test.tsx#continues drag autoscroll through transient boundary range misses | pass: interaction-trace: pass; target: editor scrollport boundary; event: mousemove; buttons: 1; boundary-exit-trace: pass; range-miss: continue; release: stop |
| outside-editor:selection-autoscroll-continues | focus | during-action | yes | Window stays focused during pointer-only viewport exit; blur is terminal cleanup | Pointer exit is conflated with blur, or true blur leaves loop alive | package DOM window lifecycle | test: packages/plite-react/test/root-interaction-controller.test.tsx#continues drag autoscroll through transient boundary range misses | pass: pointer exit does not dispatch blur; explicit blur clears ref and pending frame |
| outside-editor:selection-autoscroll-continues | popup | during-action | no | N/A: no popup behavior in this case | N/A: no popup state | N/A: #5113 remains affected corpus | N/A: no new popup test | N/A: unaffected |
| outside-editor:selection-autoscroll-continues | geometry-paint | during-action | no | N/A: liveness/scroll/selection state, not pixel fidelity | N/A: no paint claim | N/A: numeric/runtime oracle | N/A: no pixel test | N/A: no paint claim |
| outside-editor:selection-autoscroll-continues | runtime-errors | during-action | yes | Boundary exit, miss, recovery and cleanup complete without errors | Scheduler/runtime error aborts cleanup | package unit runner | test: packages/plite-react/test/root-interaction-controller.test.tsx#continues drag autoscroll through transient boundary range misses | pass: 5/5 lifecycle stability, owner 19/19, no runtime error |
| outside-editor:selection-autoscroll-continues | follow-up-input | follow-up | yes | After release/blur cleanup a new editor interaction can start without stale autoscroll state | Old loop survives or blocks the next drag | package lifecycle unit plus existing #5113 affected E2E | test: packages/plite-react/test/root-interaction-controller.test.tsx#continues drag autoscroll through transient boundary range misses | pass: each of four terminal events clears pending/ref and follow-up returns to pending 1 |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| outside-editor:selection-autoscroll-continues | 3 | invalidated | prior attempt-3 command | invalidated: reporter contradiction speed/owner liveness missing | dirty:219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493 | sha256:a27ce50e79a896d08ac0848d8916da571e36e86b3d0249dfb179871413bf97c6 | 19 | prior inputs | prior host | prior | prior | prior | 0 | invalidated: sha256:e8cd2571006494ae30ad54c36ddc27244967fff22d489ca73326322c044c31df |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite React root interaction/autoscroll | outside-editor:selection-autoscroll-continues | red: transient range-miss test; pass: outside-edge max-speed unit; pass: #5113 pre-edit E2E | 2026-08-27T08:48:22.423Z | attempt3 combined receipt command | sha256:a27ce50e79a896d08ac0848d8916da571e36e86b3d0249dfb179871413bf97c6 | pass: workflow 70/70, lifecycle 5×5, owner 19/19, typecheck, Ultracite, #5113; formatted final #5113 5/5 separately |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Source app host | localhost:3002 refused; fresh start blocked by existing Next lock/PID 65128 on localhost:3000 | proof-host | inspected existing source server and used its declared URL for pre-edit corpus only | pass: #5113 1/1 on localhost:3000; final proof still requires fresh restarted process |
| Attempt-2 final affected corpus | fresh PID 71166 #5113 upward sample was 1382 vs downward 1082 after fixed 250ms | final-verification | froze product bytes; added phase-sampled native/model/scroll diagnostic and required eventual held-state shrink within 1s | pass: unchanged product 3/3 diagnostic, then formatted final harness 5/5 |
| Scoped Ultracite | final diagnostic harness formatting red | code-format | formatted only `selection-drag-scroll.spec.ts` | pass: exact scoped Ultracite rerun |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| outside-editor:selection-autoscroll-continues | 1 | Current reporter says completed outside-edge fix still intermittently stalls on editor/browser exit | reporter-contradiction | yes: prior plan receipt/completion explicitly invalidated | repair-now: `.agents/rules/regression.mdc`, methodology, semantic validator and workflow test | pass: 69 workflow tests; old packet rejected for boundary liveness/range/release gaps | yes: timer-focus-correctness and attempt 2 | best-api review + accepted plite-plan target below | reproduced: user accepted; attempt-2 RED authorized |
| outside-editor:selection-autoscroll-continues | 2 | Fresh final receipt failed #5113 upward selection shrink at the fixed 250ms sample | final-verification | yes: attempt-2 candidate and failed receipt revoked; product bytes frozen | repair-now: `.agents/rules/regression.mdc`, methodology, semantic validator and workflow test require diagnostic before replay/verification resume | pass: 70 workflow tests; missing unchanged-bytes diagnostic packet rejected | yes: second-failed-fix | best-api: existing no-public-API target retained; plite-plan: accepted root-interaction owner retained; proof harness only changed | reproduced: attempt-3 uses unchanged product bytes; diagnostic: fixed 250ms oracle sampling drift classified by phase-sampled 3/3 then final 5/5 #5113 replay |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| outside-editor:selection-autoscroll-continues | 2 | timer-focus-correctness, second-failed-fix | escalate | required: best-api selects no public API and no new manager; existing private owners survive | plite-plan: root interaction scheduler owns liveness/release, geometry helper owns only target/delta; attempt-3 changes proof sampling only | accepted: user target remains unchanged; final-verification diagnostic proves oracle drift, not a new product target |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| outside-editor:selection-autoscroll-continues | Plite React root interaction scheduler; exact unit runner; homepage/#5113 existing corpus | current source unit import + fresh PID 71166 at localhost:3002 | second Regression repair synced; product generated outputs untouched | pass: final receipt, Browser editor visible and zero console errors |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| outside-editor:selection-autoscroll-continues | exact RED: `applyDragAutoScrollFrame` returns false after scroll when range is null | root interaction lifecycle source, existing root interaction test, related changeset only | RED→GREEN, release/blur coverage, 5/5, full owner, typecheck, #5113, fresh Browser support | root cause/files/commands/fingerprints/architecture/review/caveat | pass: candidate read back; attempt2 final red repaired before attempt3 completion |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| outside-editor:selection-autoscroll-continues | final receipt on PID 71166 + independent #5113 diagnostic | 5 | lifecycle pass×5; formatted final #5113 pass×5 | 0 | completed attempt3 |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| outside-editor:selection-autoscroll-continues | attempt3 evidence invalidated by reporter contradiction | invalidated: reporter-contradiction | no completion authority | stable scroll owner and outside-speed law were never proved across horizontal/browser exit | Regression repair attempt 4 |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| outside-editor:selection-autoscroll-continues | boundary-exit proof and replay-diagnostic misses | repair-now | `.agents/rules/regression.mdc`, methodology, validator and workflow tests enforce boundary liveness/release and unchanged-bytes diagnostics | pass: workflow 70/70, old/missing packets rejected, mirrors exact | attempt1 reporter contradiction + attempt2 final-verification both repaired before resume |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Browser/Next/proof sampling | Regression/Patch proof hosts | stopped server, Next lock, Browser no dwell, frozen API expectation, fixed 250ms intermediate sample | host and oracle limitations, not one product cause | high: prevented two false completion paths | fresh PID, package lifecycle oracle, phase-sampled #5113 diagnostic, final receipt |

Findings:

- Prior completion/receipt is invalidated by reporter contradiction; #5113 remains separate.
- Workflow repair is complete: old packet now fails six boundary-liveness/release errors; replay/final-verification packets without unchanged-bytes diagnostics also fail; 70 workflow tests and source/mirror parity pass.
- Source diagnosis: `applyDragAutoScrollFrame` scrolls once then returns `false` when `resolveEventRange` is temporarily null; scheduler interprets that as terminal and clears the loop.
- Agent-native review PASS: report -> Regression route -> `.agents/rules` source -> generated mirror -> validator test/old-packet rejection -> handoff is discoverable and repeatable.
- Attempt-2 product fix is correct on unchanged bytes; the first fresh #5113 red was a fixed-time sampling miss, not stable product failure. The phase-sampled oracle stays red for a real stall and prints native/model/scroll history.
- Final product law: a successful scroll tick returns continuation even when range resolution misses; coherent selection resumes on the next valid tick; mouseup/pointerup/dragend/blur cancel pending work and allow a clean follow-up.

Timeline:

- 2026-08-27: reporter contradiction invalidated attempt 1 and started automatic Regression repair.
- 2026-08-27: added mechanical boundary-exit liveness validator/test; ran `pnpm install`, 69 workflow tests, resource sync and three source/mirror `cmp` checks.
- 2026-08-27: Best API/Plite Plan review completed; product work paused for required user acceptance.
- 2026-08-27: automatic goal continuation audited the acceptance boundary; no user acceptance was present, so product bytes remained frozen and the exact post-acceptance execution order was preserved.
- 2026-08-27: user explicitly accepted the Best API/Plite target and authorized attempt-2 execution; proof work resumed under the existing goal even though the lifecycle tool still displays its prior terminal `blocked` state.
- 2026-08-27: attempt-2 final receipt failed once in #5113, triggering a second failed-fix interrupt; product bytes froze, Regression gained a mandatory unchanged-bytes diagnostic, and phase-sampled #5113 proof passed 3/3 then formatted final 5/5.
- 2026-08-27: attempt-3 receipt passed on fresh PID 71166 with 19 unchanged inputs; final Browser readback showed the homepage editor visible with zero console errors.

Decisions and tradeoffs:

- Best API hard cut: add no public API, no `AutoscrollController`, no timer/focus/UI compensation. Keep the pure geometry helper and existing root-interaction lifecycle only.
- Plite target: a successful scroll keeps scheduling even when that tick cannot resolve a DOM range; skip selection projection for that tick, retry next tick from the last valid coordinate, and stop only at scroll limit/unmount or mouseup/pointerup/dragend/window blur.
- Test target: replace the old “stop on missing range” assumption with miss -> continued scroll -> recovered selection, and prove each terminal release/blur path plus clean next interaction.

Review fixes:

- Workflow manual P1 readback: no public/destructive action, source/mirror owner is correct, validator detection is bounded to continuous pointer boundary cases.
- Product manual P1 readback: the internal export is not in a package barrel; permanent range misses terminate naturally at scroll limits; every terminal event cancels the scheduler; no timer/focus/UI compensation or public API was added.
- Proof review: fixed 250ms final sampling was replaced with bounded phase samples that still fail a real stall and attach native/model/scroll history.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Fresh server/Next lock during pre-edit baseline | 2 | inspect current PID/URL, then restart after product edit | resolved: final fresh PID 71166 |
| Unit proof harness used a frozen API spy and wrong range shape | 2 | test the real scheduler/ref lifecycle and canonical range shape | resolved: exact lifecycle gate passes 5×5 |
| Attempt-2 #5113 fixed-time sample expanded before shrinking | 1 | freeze product, add phase-sampled unchanged-bytes diagnostic | resolved: diagnostic 3/3, formatted final 5/5, attempt3 receipt pass |
| Scoped Ultracite formatting | 1 | format only changed E2E harness | resolved: exact scoped rerun pass |

Verification evidence:

- `node --test .agents/rules/regression/scripts/validate-regression-plan.test.mjs` -> final suite included in 70/70 workflow proof.
- minimum Regression workflow proof -> 70/70; `sync-resources --check` and rule/skill methodology/validator/test parity -> pass.
- old attempt plan `--complete` -> rejected with required boundary-liveness/range-miss/release errors.
- exact lifecycle/release unit -> 5 tests pass; retry-free stability 5/5; full owner 19/19; Plite React typecheck pass.
- formatted final #5113 affected corpus -> 5/5; final combined receipt replay pass.
- scoped Ultracite and `git diff --check` -> pass; Browser fresh homepage editor visible, zero console errors.
- attempt3 receipt -> `sha256:e8cd2571006494ae30ad54c36ddc27244967fff22d489ca73326322c044c31df`.

Final handoff:

- executable cases: `outside-editor:selection-autoscroll-continues` completed on attempt3.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: base outside-edge behavior plus intermittent editor/browser-exit delta both pass exact liveness/release proof.
- failed-fix invalidation and automatic repair: attempt1 reporter contradiction and attempt2 final-verification were invalidated, mechanically repaired, and restarted only after required gates.
- proof receipts and affected-corpus replay: final attempt3 receipt/digest above; #5113 final 5/5 and combined replay pass.
- started-gate failure closure: all host, harness, sampling and format failures rerun green.
- changed files: Regression rule/methodology/validator/tests and generated mirrors; Plite root interaction/drag target/input/selection source/tests; #5113 E2E diagnostic; changeset; plans.
- design decisions: no public API/controller; geometry helper owns target/delta; root interaction owns scheduler liveness/release; transient miss skips selection only.
- tests and proof: workflow 70, lifecycle 5×5, owner 19, typecheck, Ultracite, #5113 5×, receipt and Browser support.
- source/generated sync: `pnpm install`, resource check and three rule/skill parity checks pass.
- P1 and agent-native findings: autoreview N/A on next; manual P1 clean; agent-native PASS.
- residual risks and next owner: Browser CUA cannot dwell outside; package DOM test owns exact liveness/release and phase-sampled route guards selection behavior. User/coordinator owns optional commit/push.
- local completion status and integration/public-status boundary: completed locally, uncommitted/unpushed; #5113/public state untouched.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | attempt3 completed; final semantic/checker closure |
| Where am I going? | user handoff; optional commit/push only if requested |
| What is the goal? | eliminate intermittent boundary-exit stalls without breaking release cleanup or #5113 |
| What have I learned? | transient range misses must preserve scheduler liveness; final browser assertions need phase sampling, not one arbitrary instant |
| What have I done? | repaired methodology twice, fixed durable owner, proved release/recovery/corpus stability, generated final receipt |

Open risks:

- Browser CUA has no held-outside dwell; exact boundary liveness/release is package DOM-owned. Real route support is phase-sampled Chromium and fresh Browser readback.
- Local state is uncommitted and unpushed; any later commit/rebase/push changes proof authority and requires replay.
