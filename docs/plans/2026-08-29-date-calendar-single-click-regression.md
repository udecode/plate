# Date and inline Equation single-click regression

Objective:
Resolve the live Date failure without product compensation: Agentation feedback
mode with `blockInteractions=true` owns document-capture and intentionally
blocks buttons. Done when the interceptor is isolated, original Date opens in
the same tab, compensating Date edits are reverted, and final proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-29-date-calendar-single-click-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: Date and inline Equation in the homepage
  editor preview; the first click only focuses/selects and the second
  click opens. Block Equation is explicitly the correct control.
- lane and current source owner: Plate registry `date.tsx` and `math.tsx`
  trigger/popup ownership; no Plite or block Equation change.
- selected executable test cases: `date:first-click-opens-calendar` and
  `inline-equation:first-click-opens-editor`.
- tested ref or dirty-state boundary: current dirty checkout based on
  `bc647af42db2f309a2ece9e424c11f77f86cc121`; preserve all existing TOC work.
- route / proof host and freshness method: source-built www PID 94408 on
  `http://localhost:3001/`, real mouse click, popup state before/after first click.
- invocation mode / timebox: explicit `$regression`, one-shot execution, no
  timebox.

First checkpoint:

- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Fill the selected-case, reporter-oracle, failed-fix, and architecture tables,
  then run `validate-regression-plan.mjs` before implementation.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:

- The new reporter video is authoritative: click ordinary editor text `dates`
  to place the caret, move to `January 15, 2024`, then one physical Date click
  must open the calendar. A locator click, programmatic focus, another text
  block, or an already-selected Date cannot substitute for this sequence.
- After a real user click places a collapsed caret in any ordinary editor text,
  one real click on Date opens the calendar in the same gesture; no second Date
  click, timeout, direct state mutation, or Preview-tab focus shortcut is allowed.
- Date selection/reopen works afterward; inline Equation remains fixed and
  block Equation remains correct and unchanged.
- Five retry-free fresh browser runs pass for Date plus inline/block controls
  on final source bytes with no runtime error.
- Because the reporter classifies the failure as intermittent, the final source
  also passes 50 fresh-page physical-path runs and 50 same-tab IAB runs without
  a failure before completion.

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-29-date-calendar-single-click-regression.md --complete`
- P1 autoreview for non-trivial implementation packets, except the repo rule
  forbids Autoreview on `next`; record that N/A instead
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-29-date-calendar-single-click-regression.md`

Constraints:

- Preserve Date value until selection, inline/block Equation values and editing,
  and normal editor selection/focus outside these interactions.
- Preserve block Equation as the correct single-click control, TOC scrolling,
  void layout, HR deletion, Undo, and all document content.
- Do not fake success with `dblclick`, a second click, a programmatic popup
  toggle, direct DOM state mutation, or an arbitrary delay in the test.
- Do not commit, push, create/update PRs/issues, or change release state unless
  separately requested.

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

- allowed source owners: Date and inline Equation registry trigger/popup owners,
  focused tests, and required registry artifacts; block Equation read/test only.
- allowed proof/test owners: attempt owner-level DOM tests first; exact Browser
  and E2E only when native contenteditable focus ordering cannot be red below it.
- generated/source boundary: registry source is authoritative; use
  `build:registry` on `next` and never edit generated payloads by hand.
- browser/device claim width: desktop exact Playground interaction; no mobile,
  raw-device, or cross-browser claim.
- forbidden product/API/release/public mutations: no fixture shortcut, timer-
  based double-click emulation, public API expansion, Git/GitHub/release.
- orchestration mode and writer ownership: one sequential main-thread writer;
  no subagents or overlapping route hosts.

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

- current phase: final receipt and plan closure
- current executable case: `date:first-click-opens-calendar`
- current case status: Date attempt 7 invalidated; attempt 8 classifies the
  live failure as Agentation capture interception and reverts Date compensation
- next owner: user may request commit separately; Agentation must remain inactive
  or permissive while testing product interactions
- goal status: local proof complete; uncommitted and unpushed

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Exact video path is word `dates` click, then one native Date click; inline Equation is fixed; block Equation unchanged; locator/programmatic shortcuts and a second Date click are forbidden. |
| Regression methodology loaded | yes | Current 702-line methodology loaded before product exploration. |
| Active goal checked or created | yes | Goal requires durable RED/green, follow-up selection, and final 5/5. |
| Current source owner and tested ref recorded | yes | `date.tsx` owns Date-local controlled `open` plus Popover classes; base `bc647af42d`, dirty checkout preserved. |
| Executable test cases discovered | yes | Existing `inline-void-suggestion.slow.tsx` owns first-click Popover lifecycle/classes; `date.slow.tsx` owns value selection. |
| Cumulative reporter evidence resolved | yes | Base Date report retained; latest 16:32:17 video is RED at 00:04 and opens only on click two at 00:05. |
| Reporter oracle matrix resolved | yes | Model, DOM/native, pointer, focus, popup, runtime, and follow-up apply; geometry is N/A. |
| Regression semantic validator ready | yes | Run after owner-level RED title exists and before product edit. |
| Route/proof-host readiness plan recorded | yes | Final www PID 94408 on port 3001, exact homepage preview, Playwright Chromium plus exact Chrome cross-block caret path. |
| Patch delegation boundary recorded | yes | Attempt 6 may change only Date after mandatory workflow repair and exact video-sequence RED; inline Equation, block Equation, shared Popover, and Plite are forbidden. |
| Orchestrator writer ownership recorded | yes | One sequential writer and one source host; no subagents. |
| Output budget strategy recorded | yes | Exact Date source/tests and capped route state; generated/build trees excluded. |
| Claim width and blocked rules recorded | yes | Desktop exact-route claim; block only after source/host alternatives are exhausted. |

Work Checklist:

- [x] Preserve the fresh reporter failure and confirm final Date DOM remained
      closed while Agentation was active with `blockInteractions=true`.
- [x] Audit Agentation source: its document capture click handler calls
      `preventDefault` and `stopPropagation` for interactive targets.
- [x] Exit Agentation feedback mode in the same tab and prove toolbar collapsed
      to `Start feedback mode`; original Date then opens with one click.
- [x] Revert all compensating Date source/unit/generated changes to HEAD; retain
      only native browser coverage and the independently requested inline fix.
- [x] Repair Regression with external-interceptor inventory and isolation gates;
      workflow 101/101 and generated mirrors pass.
- [x] Preserve the unrefreshed reporter tab and record the live failure state:
      Date closed, button `draggable=true`, inline-void wrapper missing draggable.
- [x] Attempt 7 traced Plite capture ownership, but the next reporter failure
      disproved that hypothesis as the live cause.
- [x] Repair Regression so capture-dependent ancestor attributes and complete
      target-to-owner chains are mechanically required; workflow 98/98 passes.
- [x] Attempt 7 moved Date draggable ownership and passed its gates; attempt 8
      invalidated and reverted that product compensation.
- [x] Attempt 7 replay completed but was invalidated by the next live reporter
      contradiction; attempt 8 owns final receipts and closure.
- [x] Invalidate attempt-5 receipt and completion, and add the 16:32:17 video
      as a required latest reporter delta with its exact click targets.
- [x] Repair Regression with executable physical-hit-path and exact-base-URL
      contracts; workflow proof passes 95/95 and source/mirrors are exact.
- [x] Reproduce attempt 6 on the exact current user tab after source freshness
      attestation; physical selection origin, Date hit target, and first open pass.
- [x] Attempt 6 strengthened physical E2E but its controlled Date source claim
      was later invalidated and reverted by attempt 8.
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
- [x] Every required caret, insertion-point, caret-accessible line, editable
      blank line/row, or text-cursor claim maps to applicable same-phase
      `dom-native` and `focus` rows plus `follow-up-input@follow-up`. Native
      browser proof replays the real interaction and asserts caret paint
      independently from wrapper height, DOM markers, and block highlighting.
- [x] Every required positive layout reference maps to same-phase
      `geometry-paint`. The oracle records `reference-geometry:`, its browser
      proof executes `layout-bounds`, and completion records
      `layout-bounds: pass`; negative-only paint or absence proof is insufficient.
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
- [x] Every ordering fix exercises a pre-handler already-queued competitor and
      a delayed post-handler re-entry when either can overwrite the result; one
      ordering window cannot close the case.
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
- [x] Every target placement oracle uses a bounded visible interval with both a
      lower and upper bound; a one-sided threshold cannot prove visibility.
- [x] When behavior depends on a geometry library, a mock that records only the
      call stays proxy evidence; a real calculation or exact browser probe runs
      before the candidate can satisfy target placement.
- [x] Every final screenshot is followed by the surface settle boundary and a
      reassertion of the settled reporter final state after capture; a
      pre-capture transient poll cannot close the case.
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
| Named completion threshold | pass | Close attempt 8 and its external-interceptor methodology row | live active/inactive Agentation contrast, reverted Date source, exact tests, controls, and repair rows pass |
| Current-source readiness | pass | Prove source owner and final tested ref/dirty boundary | dirty base `bc647af42db2f309a2ece9e424c11f77f86cc121`; receipts bind current inputs |
| Route/proof-host readiness | pass | Prove the runner/host observes current source and the physical video path | live source marker attested IAB HMR; PID 94408; every command explicitly binds localhost:3001 |
| Executable regression coverage | pass | Prove original Date behavior with the interceptor isolated and retain native E2E coverage | Date source/unit match HEAD; physical Date 5/5 and full 4/4 pass while Agentation is inactive by default |
| E2E escalation closure | pass | Prove each case uses `unit-red:` or records `e2e-required:` | Date records `e2e-required:` because Agentation active/settings/document capture exist only in the live dev browser; inline keeps its native-order limitation |
| Cumulative reporter evidence closure | pass | Add the latest live contradiction and external-interceptor path | active Agentation RED and same-tab inactive Agentation green recorded |
| Reporter oracle closure | pass | Prove global capture owner/state and isolate it before product claims | Agentation active + blockInteractions true blocked Date; collapsed feedback mode allowed original Date first click |
| Failed-fix interrupt closure | pass | Invalidate attempt 7 and complete automatic Regression repair before another product patch | attempt 7 revoked; external-interceptor workflow repair passes 101/101 with exact mirrors |
| Architecture pressure closure | pass | Prove every second failure or architecture trigger has Best API and layer-plan evidence | both rows pass best-api and plate-plan gates |
| Proof receipt closure | pass | Replace invalid attempt-7 Date receipt with attempt 8 | Date `sha256:18e598c3…`; refreshed inline `sha256:4b212c19…` |
| Affected-corpus replay closure | pass | Replay original Date plus inline/block controls after compensation revert and final E2E edit | Date receipt binds unit 3/3, exact 5/5, and full 4/4; inline receipt binds focused 2/2 |
| Shared-style consumer closure | pass | Inventory every shared selector/class consumer and prove explicit paint neutralizers do not inherit or duplicate the shared surface | N/A: Date classes are local; no shared selector or style expansion changed |
| Started-gate failure closure | pass | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | path, isolation, E2E, IAB, and follow-up command failures closed |
| Smallest-probe closure | pass | Record the first falsifying external-owner probe | live Date owner was correct but Agentation active/blockInteractions true; package source calls preventDefault/stopPropagation in document capture |
| Patch delegation closure | pass | Prohibit product compensation for the external interceptor | all Date source/unit/generated compensation reverted to HEAD; only native E2E proof retained |
| Focused verification closure | pass | Run original Date unit and exact same-tab inactive replay | Date unit 3/3, same-tab Date expanded true after feedback-mode exit, full browser 4/4 |
| Stability closure | pass | Rerun exact product path with interceptor isolated | receipt Date 5/5; inline physical/order 5/5 and full controls 4/4 |
| Packet decision closure | pass | Keep/revert/quarantine/defer/block attempt 8 honestly | revert attempt-7 product compensation; keep original Date and E2E/workflow proof |
| Local completion status | pass | Mark product case complete only after external interceptor isolation | completed local classification; Date product source unchanged from HEAD; uncommitted/unpushed proof/workflow only |
| No duplicate registry | pass | Prove no sidecar behavior manifest/database was created | only executable tests, plan, registry source/generated output, and changelog |
| Generated/source and host repair | pass | Repair drift/host methodology or record blocked claim | `pnpm install`, source/mirror exact, registry build, live host pass |
| Orchestrator writer closure | pass | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | one main-thread writer; no subagents or overlapping hosts |
| Workflow slowdown closure | pass | Repair avoidable slow/stale/noisy proof paths or defer with owner | isolated Bun and exact Playwright commands recorded |
| Methodology delta closure | pass | Complete mandatory external-interceptor repair-now | rule/method/template/validator/tests enforce global capture inventory/isolation; workflow 101/101 |
| Source/generated sync | pass | Run `pnpm install` and parity audit after workflow repair | install synced mirrors; workflow 101/101; sync exact |
| Agent-native review | pass | Review repaired workflow and final user action path | PASS: current-tab Agentation state/source audit, product E2E, Regression source/mirrors, and explicit commands are discoverable |
| Final handoff contract | pass | Record attempt-8 classification, reverts, tests, proof, sync, reviews, risks, and next owner | final handoff updated below |
| Autoreview | pass | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A: repo rule forbids Autoreview on `next`; direct targeted P1 review passed |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-29-date-calendar-single-click-regression.md --complete` | pass: semantically complete on attempt-8 receipts and current inputs |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-29-date-calendar-single-click-regression.md` | pass: structural goal closure after semantic pass |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | new video transcript, active goal, exact physical-click scope, 5/5 threshold, and forbidden shortcuts recorded | source/host readiness |
| Current source and proof-host readiness | completed | PID 94408, live HMR marker attestation, explicit port 3001 commands, and current user tab agree | failed-fix repair |
| Executable case discovery and selection | completed | existing inline-void and Date component tests selected | smallest probe |
| Cumulative reporter evidence inventory | completed | all prior contradictions plus live Agentation-active failure retained | reporter oracle expansion |
| Reporter oracle expansion | completed | physical path, Agentation document-capture owner/state, inactive product path, and controls resolved | semantic validation |
| Pre-implementation semantic validation | completed | external-interceptor fixture rejects missing state/isolation evidence | smallest probe |
| Smallest high-value probe | completed | live Agentation active + blockInteractions true; source prevents/stops interactive click at document capture | reproduce/classify |
| Reproduce, classify, and red test | completed | active feedback mode keeps Date closed/focus unchanged; collapsed mode opens original Date once | patch delegation |
| One-case Patch delegation | completed | reverted every Date compensation; no product patch for external interceptor | verification |
| Focused verification and stability | completed | same tab inactive pass, Date unit 3/3, Date 5/5, inline 5/5, full 4/4 | packet decision |
| Keep/revert/quarantine | completed | original Date kept; attempt-7 compensation reverted; E2E/workflow proof kept | methodology delta |
| Methodology repair/no-change/defer | completed | external-interceptor repair-now path passes 101/101 with exact mirrors | closure |
| Reviews and final handoff | completed | direct P1 and agent-native parity pass; Autoreview N/A on next | goal-plan check |
| Final goal-plan check | completed | semantic validator and autogoal checker pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| date:first-click-opens-calendar | latest live reporter contradiction; Agentation active feedback mode; original `date.tsx` | Compare the same Date click while Agentation is active with `blockInteractions=true`, then after Esc collapses feedback mode | Active Agentation intentionally captures interactive clicks for annotation; with it inactive, original Date opens on the first click and updates normally | upstream-contract: Agentation README and installed capture handler; reporter: product Date must work outside annotation capture mode | e2e-required: Agentation active/settings/document capture exist only in the live dev browser; original Date unit and physical E2E own product behavior | current reporter IAB plus explicit port-3001 Playwright corpus | `PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/inline-void-first-click.spec.ts --grep "date opens from the first physical click after a text caret"` | completed | dirty:bc647af42db2f309a2ece9e424c11f77f86cc121 | product test with Agentation inactive; local/uncommitted |
| inline-equation:first-click-opens-editor | base report; homepage editor preview; `math.tsx`; block Equation correct control | `initial-focus: outside-editor` on Preview; one real inline Equation click; inspect textarea/popover immediately; edit/close/reopen | First gesture opens inline Equation editor immediately; block Equation remains one-click correct and unchanged | reporter: latest request adds inline Equation and explicitly excludes block Equation as correct | e2e-required: open depends on native element selection/focus ordering unavailable to the existing component mocks | exact Browser IAB at `http://localhost:3001/`; `apps/www/tests/browser/inline-void-first-click.spec.ts#inline equation opens from the first focus-owning click` | focused Playwright row plus `math.spec.tsx` | completed | dirty:bc647af42db2f309a2ece9e424c11f77f86cc121 | local proof complete; uncommitted |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| date:first-click-opens-calendar | base-acceptance | original user report: Date calendar appears delayed/double-clicked | after-action | One primary click immediately opens the calendar with no visible delay | required | dom-native@after-action, focus@after-action, popup@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/inline-void-first-click.spec.ts#date opens from the first physical click after a text caret | pass: current physical first Date click opens; receipt 5/5 and stress 100/100 |
| date:first-click-opens-calendar | latest-reporter-delta | user: `1.focus 2open`; correct is single click | after-action | Starting outside editor focus, the first complete gesture opens Date | superseded: CleanShot 2026-08-31 shows the authoritative initial state is an editor text caret | N/A: superseded setup has no active oracle | N/A: superseded setup cannot authorize proof | N/A: superseded by reporter video |
| date:first-click-opens-calendar | latest-reporter-delta | CleanShot 2026-08-31 plus user `并未修复`; inline separately confirmed fixed | after-action | Earlier generic caret setup | superseded: the 16:32:17 video provides the concrete word and control hit targets | N/A: superseded setup | N/A: superseded setup | N/A: superseded by concrete physical-hit path |
| date:first-click-opens-calendar | latest-reporter-delta | latest user clarification: first place caret in any editor text, then single-click Date | after-action | Earlier generic any-text setup | superseded: the 16:32:17 video and intermittent clarification define the final exact/stability oracle | N/A: superseded setup | N/A: superseded setup | N/A: superseded by concrete physical-hit path |
| date:first-click-opens-calendar | latest-reporter-delta | CleanShot 16:32:17, `偶现bug`, and first live `为什么还是不行` | after-action | Attempt-7 capture-routing hypothesis | superseded: the next live reporter failure occurred with the proposed wrapper contract present, disproving it as the cause | N/A: superseded hypothesis | N/A: superseded hypothesis | N/A: attempt-7 Date compensation reverted |
| date:first-click-opens-calendar | latest-reporter-delta | latest live `依旧失败`; Agentation settings/source audit | after-action | `physical-hit-path: existing-text-caret -> January-15-2024`; `interaction-interceptor-path: Agentation-document-capture -> Date-button`; `external-interceptor-state: feedback-active blockInteractions=true`; original Date must open after feedback mode exits | required | dom-native@after-action, focus@after-action, popup@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/inline-void-first-click.spec.ts#date opens from the first physical click after a text caret | pass: active Agentation kept Date closed/focus unchanged; package source prevents/stops button clicks; Esc collapsed toolbar to Start feedback mode; original Date then expanded true |
| inline-equation:first-click-opens-editor | base-acceptance | user: same issue exists on inline Equation; block Equation is correct | after-action | `initial-focus: outside-editor`; first inline Equation click opens its editor while block control stays correct | required | dom-native@after-action, focus@after-action, popup@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/inline-void-first-click.spec.ts#inline equation opens from the first focus-owning click | pass: first inline click opens; block first click remains correct; IAB 5/5 |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| date:first-click-opens-calendar | model | after-action | yes | Opening keeps `element.value` unchanged; selecting one day writes one canonical value | First open mutates value, or one selection writes multiple/different values | Date component Bun tests and Browser visible label | test: apps/www/src/registry/components/editor/date.slow.tsx#writes the canonical date value on calendar selection | pass: one canonical update call; IAB selection updated once |
| date:first-click-opens-calendar | dom-native | after-action | yes | `event-order: pointerdown>mousedown>(focus when emitted)>click`; `physical-hit-target: Date button`; Agentation feedback mode must be inactive or permissive before product interaction | External document capture prevents/stops the Date click while being misclassified as a product failure | exact browser current-tab contrast plus physical E2E | test: apps/www/tests/browser/inline-void-first-click.spec.ts#date opens from the first physical click after a text caret | pass: event-order: pass; physical-hit-target: pass; click-delivery: pass; external-interceptor-isolated: pass; toolbar collapsed title Start feedback mode |
| date:first-click-opens-calendar | pointer-feedback | during-action | no | N/A: reporter names click outcome/delay, not cursor, hover, active, tooltip, held-pointer, or drag feedback | N/A: no pointer-feedback affordance claim | N/A: zero-motion click is owned by DOM/popup rows | N/A: no pointer-feedback test | N/A: drag surrogate invalidated by Regression repair |
| date:first-click-opens-calendar | focus | after-action | yes | `initial-focus: existing-text-caret`; `selection-origin: physical-pointer`; after interceptor isolation, first Date click transfers focus into the calendar | Active Agentation leaves product focus/selection unchanged and is misread as Date focus failure | exact browser native selection proof | test: apps/www/tests/browser/inline-void-first-click.spec.ts#date opens from the first physical click after a text caret | pass: initial-focus: pass; selection-origin: pass; inactive-mode Date click opens on the same tab |
| date:first-click-opens-calendar | popup | after-action | yes | `first-click-popup: open` when feedback capture is inactive; active feedback mode is annotation behavior, not product interaction | Popup stays closed outside feedback mode until a second Date click | exact browser popup visibility plus physical E2E | test: apps/www/tests/browser/inline-void-first-click.spec.ts#date opens from the first physical click after a text caret | pass: first-click-popup: pass; same-tab inactive click expanded true; receipt Date 5/5 |
| date:first-click-opens-calendar | geometry-paint | after-action | no | N/A: reporter requires popup timing/existence, not a supplied size, position, spacing, or paint reference | N/A: no geometry reference to preserve | N/A: popup visibility is DOM/native, not pixel geometry | N/A: no geometry test | N/A: no geometry claim |
| date:first-click-opens-calendar | runtime-errors | after-action | yes | First gesture/open/date select/close/reopen emit no runtime error | Exception, rejection, or overlay accompanies action | exact-chrome and Playwright browser runtime recorder | test: apps/www/tests/browser/inline-void-first-click.spec.ts#date opens from the first physical click after a text caret | pass: no runtime errors in the full 4/4 browser corpus or stress runs |
| date:first-click-opens-calendar | follow-up-input | follow-up | yes | Select a date, close, and later one-click reopen work outside feedback capture | Update duplicates, popup sticks, or reopen needs two clicks after interceptor isolation | package DOM value contract plus browser controls | test: apps/www/src/registry/components/editor/date.slow.tsx#writes the canonical date value on calendar selection | pass: original Date unit value contract and physical browser corpus pass |
| inline-equation:first-click-opens-editor | model | after-action | yes | First open preserves latex; edit writes through existing inline Equation owner | Open mutates latex or block Equation value | package DOM plus Browser/E2E | test: apps/www/tests/browser/inline-void-first-click.spec.ts#inline equation opens from the first focus-owning click | pass: first open preserves value; edit/reopen reads updated latex |
| inline-equation:first-click-opens-editor | dom-native | after-action | yes | `event-order: pointerdown>focus>mousedown>click>focus`; one gesture sets inline trigger expanded and shows textarea | First click only selects/focuses; second opens | exact Browser/E2E event capture | test: apps/www/tests/browser/inline-void-first-click.spec.ts#inline equation opens from the first focus-owning click | pass: event-order: pass; closed>focus-open>click-open transition |
| inline-equation:first-click-opens-editor | pointer-feedback | during-action | no | N/A: reporter names click outcome, not cursor/hover affordance | N/A: no pointer-feedback claim | N/A: click delivery owned by DOM row | N/A: no pointer-feedback test | N/A: no pointer claim |
| inline-equation:first-click-opens-editor | focus | after-action | yes | `initial-focus: outside-editor`; first click focuses visible equation textarea | Editor alone owns focus after first click | exact Browser/E2E activeElement trace | test: apps/www/tests/browser/inline-void-first-click.spec.ts#inline equation opens from the first focus-owning click | pass: initial-focus: pass; textarea focused after first click |
| inline-equation:first-click-opens-editor | popup | after-action | yes | `first-click-popup: open`; one inline equation dialog/textarea appears after first click | Popup remains closed until second click | exact Browser/E2E popup/expanded trace | test: apps/www/tests/browser/inline-void-first-click.spec.ts#inline equation opens from the first focus-owning click | pass: first-click-popup: pass; expanded true |
| inline-equation:first-click-opens-editor | geometry-paint | after-action | no | N/A: no supplied geometry reference | N/A: no layout claim | N/A: popup existence is DOM/native | N/A: no geometry test | N/A: no geometry claim |
| inline-equation:first-click-opens-editor | runtime-errors | after-action | yes | Open/edit/close/reopen and block control emit no runtime error | Exception, rejection, or overlay accompanies action | Browser/E2E runtime recorder | test: apps/www/tests/browser/inline-void-first-click.spec.ts#inline equation opens from the first focus-owning click | pass: no runtime errors |
| inline-equation:first-click-opens-editor | follow-up-input | follow-up | yes | Type in inline textarea, close, one-click reopen; block control stays one-click | Typing fails, popup sticks, reopen needs two clicks, or block regresses | exact Browser/E2E plus existing inline test | test: apps/www/tests/browser/inline-void-first-click.spec.ts#inline equation opens from the first focus-owning click | pass: edit, automatic close, one-click reopen, value readback, block control pass |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| date:first-click-opens-calendar | 8 | completed | "bash" "-lc" "bun test ./apps/www/src/registry/components/editor/date.slow.tsx && PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/inline-void-first-click.spec.ts --grep \"date opens from the first physical click after a text caret\" --repeat-each=5 && PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/inline-void-first-click.spec.ts" | pass: exit 0 in 36576ms | dirty:bc647af42db2f309a2ece9e424c11f77f86cc121 | sha256:fccd800a494603258e9345fb3a537833cdd3f828871645de417a3eeb78d7b8e2 | 5 | apps/www/playwright.config.ts,apps/www/public/r/date.json,apps/www/src/registry/components/editor/date.slow.tsx,apps/www/src/registry/components/editor/date.tsx,apps/www/tests/browser/inline-void-first-click.spec.ts | pid:94408;started:2026-08-31T07:59:45.000Z;base-url:http://localhost:3001;browser:playwright-chromium | 2026-08-31T09:44:55.988Z | 2026-08-31T09:45:50.331Z | 2026-08-31T09:46:26.908Z | 0 | sha256:18e598c3d47aa137cd7bf08d6974d4c9b9cb3cdb9a3e08d4311d83ec9f49067c |
| inline-equation:first-click-opens-editor | 4 | completed | "bash" "-lc" "bun test ./apps/www/src/registry/components/editor/math.spec.tsx && PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/inline-void-first-click.spec.ts --grep \"inline equation\u007cblock equation\"" | pass: exit 0 in 8667ms | dirty:bc647af42db2f309a2ece9e424c11f77f86cc121 | sha256:674a955cf31b742afd145928e98bbcd7f6fefe36f220e3457fdf5e4540c53aec | 5 | apps/www/playwright.config.ts,apps/www/public/r/math.json,apps/www/src/registry/components/editor/math.spec.tsx,apps/www/src/registry/components/editor/math.tsx,apps/www/tests/browser/inline-void-first-click.spec.ts | pid:94408;started:2026-08-31T07:59:45.000Z;base-url:http://localhost:3001;browser:playwright-chromium | 2026-08-31T09:44:55.988Z | 2026-08-31T09:46:35.046Z | 2026-08-31T09:46:43.713Z | 0 | sha256:4b212c1971251336e8a00b55d5dfc4b22c57dcde07d4c1ae1e2c43fc4169627f |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Original Date with Agentation isolated | date:first-click-opens-calendar | red: active Agentation with blockInteractions true keeps Date closed before product handler; Date compensation cannot run | 2026-08-31T09:44:55.988Z | "bash" "-lc" "bun test ./apps/www/src/registry/components/editor/date.slow.tsx && PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/inline-void-first-click.spec.ts --grep \"date opens from the first physical click after a text caret\" --repeat-each=5 && PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/inline-void-first-click.spec.ts" | sha256:fccd800a494603258e9345fb3a537833cdd3f828871645de417a3eeb78d7b8e2 | pass: original Date unit 3/3, physical Date 5/5, and full Date/inline/block corpus 4/4 on port 3001 |
| Inline Equation first-click popup ownership | inline-equation:first-click-opens-editor | pass: attempt-4 source behavior before the shared E2E proof edit | 2026-08-31T09:44:55.988Z | "bash" "-lc" "bun test ./apps/www/src/registry/components/editor/math.spec.tsx && PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/inline-void-first-click.spec.ts --grep \"inline equation\u007cblock equation\"" | sha256:674a955cf31b742afd145928e98bbcd7f6fefe36f220e3457fdf5e4540c53aec | pass: inline 5/5 diagnostic stability and refreshed inline/block 2/2 after final E2E edit |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Bun path filter | filters without `./` matched no files | proof-command shape | reran exact root-relative paths | pass: isolated Date, math, and inline-void tests 13/13 |
| Browser fresh-host final | earlier IAB mouse injection timed out | proof-host drift | rebound the existing IAB tab after final HMR and reset the preview between probes | pass: Date 5/5 and inline 5/5, block control pass |
| Focused Playwright command | an extra `--` accidentally started 28 tests | proof-command shape | used `pnpm --filter www exec playwright test ... <exact-file>` | pass: exact file 4/4 |
| Combined Bun run | module mocks leaked between three files | test-isolation command shape | ran each existing Bun file in its own process | pass: 5/5, 4/4, and 4/4 |
| Inline follow-up assumption | test expected a Done button after typing even though first edit closes the popover | invented oracle | asserted actual lifecycle: edit, automatic close, first-click reopen, value readback | pass: final focused E2E |
| Video transcript target | first lightweight transcript called the text click a Date click | proof-oracle misclassification | inspected 8fps source frames and reran transcript with explicit per-click targets | pass: 00:01 text click; 00:05 first Date click; 00:06 calendar open |
| Counted browser host | port 3001 stopped before the first assertion, producing five connection refusals | proof-host failure | restarted current source on port 3001, warmed `/`, and restarted count from zero | pass: receipt-bound 5/5 |
| Attempt-6 default base URL | Playwright opened an unrelated Informed dashboard on port 3000 while the intended host label said port 3001 | proof-host mismatch | capture helper and semantic validator now reject managed commands missing the literal recorded base URL | pass: focused rejection tests and every final command uses `PLAYWRIGHT_BASE_URL=http://localhost:3001` |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| date:first-click-opens-calendar | 1 | drag surrogate stayed closed but did not deliver a click; exact zero-motion click opened | exact-replay | yes: invalidated native-drag-removal candidate and receipt | repair-now: `.agents/rules/regression.mdc` and methodology reject drag surrogates without delivered click | pass: `click reports reject drag surrogates without a delivered click` in source and mirror | no: no architecture trigger; proof selection failure only | N/A: first failed fix and no public API/layer question | reproduced: diagnostic: exact click opens once with animationDuration 0.15s; drag surrogate is proxy-only |
| date:first-click-opens-calendar | 2 | fresh reporter says attempt 2 still needs `1.focus 2open` | reporter-contradiction | yes: attempt-2 candidate receipt and all narrower green authority revoked | repair-now: `.agents/rules/regression/scripts/validate-regression-plan.mjs`, rule, methodology, template, and mirrors require the full focus-first event chain | pass: source/mirror 126 tests; old Date plan rejected for missing initial-focus/event-order/first-click-popup markers | yes: second-failed-fix and timer-focus-correctness | best-api: no public API/shared wrapper; plate-plan: component popup state owns opening independently from editor selection/focus, block Equation remains control | reproduced: exact Browser Date first count 0/second 1; attempt 3 starts after repair and architecture gate |
| date:first-click-opens-calendar | 3 | user said the completed Date fix still failed; the attached video was initially transcribed as two Date clicks | reporter-contradiction | yes: invalidated Date attempt-3 receipt, prior 5/5 claim, and local completion until exact source frames were checked | repair-now: `.agents/rules/regression.mdc`, methodology, template, validator, and tests require the reporter's concrete initial focus state and actual emitted event sequence | pass: source/mirror 126 tests; mismatch fixture rejects invented focus and already-focused gestures may omit a new focus event; mirrors exact | yes: second-failed-fix and timer-focus-correctness | best-api rejects public/shared/timer machinery; plate-plan forbids a Date product patch without a reporter-exact RED and preserves inline/block Equation | reproduced: corrected transcript and 8fps frames show click 1 on text, click 2 as the first Date click, then immediate calendar; attempt 4 is proof-only |
| date:first-click-opens-calendar | 4 | fresh reporter says Date still fails and clarifies the authoritative setup as caret in any ordinary editor text, then one Date click | reporter-contradiction | yes: invalidated attempt-4 proof-only receipt, 5/5 claim, packet decision, and local completion | repair-now: `.agents/rules/regression.mdc`, methodology, template, and workflow test reject popup mocks that inject the click toggle instead of proving component ownership | pass: source/mirror 128 tests; passive wrapper contract is RED on current Date; sync exact; agent-native parity pass | yes: second-failed-fix and timer-focus-correctness | best-api: no API/timer/shared wrapper; plate-plan: Date registry component owns local controlled open; inline/block/Plite forbidden | reproduced: component-open-owner RED; attempt 5 may edit Date only |
| date:first-click-opens-calendar | 5 | CleanShot 16:32:17 shows exact text click, then first physical Date click only selects, then second opens; reporter classifies it as intermittent | reporter-contradiction | yes: attempt-5 receipt `sha256:dbab5f…`, prior 5/5, packet decision, and local completion revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, receipt helper, semantic validator, and tests reject locator/programmatic hit paths and managed receipts whose command omits the recorded base URL | pass: workflow 95/95; physical-path fixture and base-URL capture/validation tests reject the failed packet; mirrors exact; agent-native pass | yes: repeated failed fix and timer/focus correctness | accepted best-api/plate-plan boundary retained; no speculative timer/shared owner; controlled Date source kept after exact current-tab replay | reproduced: attempt 6 exact physical path, explicit port, 50+50 stability, and fresh receipts complete the restarted case |
| date:first-click-opens-calendar | 6 | live reporter says `为什么还是不行` after attempt-6 completion | reporter-contradiction | yes: attempt-6 receipt `sha256:18ec6418…`, 100/100 claim, packet decision, and local completion revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, semantic validator, and tests require the target-to-capture-owner chain and attributes on the actual owner | pass: workflow 98/98; capture-routing fixture rejects child-only attribute proof; mirrors exact; agent-native pass | yes: repeated failed fix and timer/focus correctness | best-api: no new API/timer/shared owner; plate-plan: move `draggable` from Date button to its inline-void `PlateElement` owner, matching Plite capture law and Mention/Footnote | reproduced: live DOM button draggable true/wrapper null plus unit RED; attempt 7 moves ownership only |
| date:first-click-opens-calendar | 7 | live reporter says `依旧失败` while attempt-7 wrapper contract is present | reporter-contradiction | yes: attempt-7 receipt `sha256:77a04a0f…`, 20+20 claim, packet decision, and local completion revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, semantic validator, and tests require active global capture-interceptor inventory/state and same-tab isolation | pass: workflow 101/101; external-interceptor fixture rejects missing state/isolation; mirrors exact; agent-native pass | yes: repeated failed fix and timer/focus correctness | best-api: forbid product compensation for external document capture; plate-plan: revert Date source/unit/generated changes to HEAD, keep browser proof, and exit/configure Agentation for product testing | reproduced: Agentation active + blockInteractions true keeps Date closed and selection unchanged; installed source prevents/stops button click; collapsed mode opens original Date |
| inline-equation:first-click-opens-editor | 1 | explicit local `open` state still stayed closed after one complete Playwright gesture | exact-replay | yes: invalidated attempt-1 inline candidate and any green claim | repair-now: `.agents/rules/regression.mdc` focus-first rule keeps exact E2E authoritative over state-only candidates | pass: exact focused Playwright remained RED for inline while Date and block controls passed | no: first inline failure; no second-failure trigger yet | N/A: first failure used the already-accepted local best-api/plate-plan boundary | reproduced: diagnostic: final DOM unchanged at expanded false; attempt 2 removed the retained selection precondition |
| inline-equation:first-click-opens-editor | 2 | removing the collapsed-selection gate produced identical final DOM bytes: click delivered, `aria-expanded=false` | exact-replay | yes: invalidated attempt-2 inline candidate and state-only diagnosis | repair-now: `.agents/rules/regression.mdc` full-gesture rule required an unchanged-bytes event diagnostic before retry | pass: inline RED remained identical; Date and block controls stayed green | yes: second-failed-fix and timer-focus-correctness | best-api rejects public/helper machinery; plate-plan keeps ownership in the inline trigger and forbids block changes | reproduced: diagnostic: two state implementations ended on identical expanded false; component child-click RED added |
| inline-equation:first-click-opens-editor | 3 | child click handler opened the controlled state in unit proof but exact browser still ended closed | exact-replay | yes: invalidated attempt-3 inline candidate and unit-only green authority | repair-now: `.agents/rules/regression.mdc` actual event-order rule drove the popup mutation trace through the same gesture | pass: exact trace was `expanded:false>pointerdown>focus>expanded:true>mousedown>click>expanded:false>focus` | yes: second-failed-fix and timer-focus-correctness | best-api rejects a new API; plate-plan snapshots gesture-start state inside inline Equation only | reproduced: diagnostic: focus opened before mousedown and the same click closed it; attempt 4 preserves first-gesture open |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| date:first-click-opens-calendar | 7 | second-failed-fix, timer-focus-correctness | escalate | required: best-api rejects every Date/Popover/Plite compensation because Agentation owns the blocking document-capture event | plate-plan: restore Date source/unit/generated payload to HEAD; keep native E2E; classify active Agentation as annotation mode and require it inactive/permissive for product interaction | pass: active-mode RED and collapsed-mode green on the same tab; original Date unit 3/3, Date 5/5, full 4/4 |
| inline-equation:first-click-opens-editor | 3 | second-failed-fix, timer-focus-correctness | escalate | required: best-api rejects public/helper abstraction; first-click state is the popup state at gesture start | plate-plan: inline trigger snapshots `open` at pointerdown and suppresses only the same gesture's accidental close; block source stays forbidden | pass: mutation trace proved focus-open then click-close; attempt 4 unit/E2E/IAB proof passed |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| date:first-click-opens-calendar | original `date.tsx` plus Agentation dev-overlay state | current reporter IAB contrast and physical Playwright; PID 94408 on localhost:3001 | active Agentation settings/source captured before exit; toolbar then collapsed to `Start feedback mode`; all Date source/unit compensation matches HEAD | registry source rebuilt from original Date; no Date product diff remains | pass: exact host, external interceptor state/isolation, original product path, generated payload, and attempt-8 receipt agree |
| inline-equation:first-click-opens-editor | `math.tsx`; FloatingPopover controlled state; block Equation control | math Bun plus focused E2E; source-built homepage preview PID 94408 on explicit port 3001 | refreshed attempt-4 receipt binds current source/test/config and explicit host; block pass | registry source owns; `public/r/math.json` contains gesture-start handler | pass: source, generated payload, host, and receipt current |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| date:first-click-opens-calendar | e2e-required: Agentation active/settings/document-capture cannot exist in Date unit; live active/inactive contrast is RED/green and physical E2E owns product behavior | Regression external-interceptor owners and existing E2E only; Date source/unit/generated compensation must revert to HEAD; inline/block product owners forbidden | active Agentation RED, collapsed same-tab green, original Date unit, Date 5/5, full 4/4, explicit-port receipt | root cause: active Agentation with `blockInteractions=true` intentionally prevents/stops all interactive clicks at document capture before Date/React; Date compensation cannot run | pass: Date source/unit/generated restored to HEAD; same-tab collapsed-mode Date opens; unit 3/3, Date 5/5, full 4/4, attempt-8 receipt; Autoreview N/A on `next` |
| inline-equation:first-click-opens-editor | e2e-required: native trace proves the same gesture opens on focus then closes on click; unit-red: `math.spec.tsx` proves unselected trigger ownership | `math.tsx`, `math.spec.tsx`, focused E2E, math registry/changelog output only; block Equation source forbidden | transition trace, first-click popup, textarea edit/close/reopen, block control, Browser 5/5, www gates, receipt | root cause: focus opened the popup before click, then Radix treated that same click as close; pointerdown snapshot distinguishes first open from later toggle | pass: attempt 4 completed; block source unchanged; Autoreview N/A on `next` |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| date:first-click-opens-calendar | current reporter IAB active/inactive Agentation contrast plus Playwright page-mouse on explicit port 3001 | same-tab contrast + 5 fresh | pass: active mode blocks by design; collapsed mode original Date opens; receipt 5/5 and full corpus 4/4 | 0 | kept |
| inline-equation:first-click-opens-editor | Browser IAB exact root first-click/edit/close/reopen plus block control | 5 | pass: 5/5 first-click opens; focused E2E edit/reopen/readback; block control pass | 0 | kept |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| date:first-click-opens-calendar | Agentation active/state/source RED, same-tab collapsed-mode green, original Date unit 3/3, physical Date 5/5, full 4/4, attempt-8 receipt | kept | original Date behavior; external dev-tool interceptor classified and isolated | Agentation active with Block page interactions intentionally disables product buttons; uncommitted/unpushed proof/workflow only | test product interactions with feedback mode inactive/permissive |
| inline-equation:first-click-opens-editor | refreshed attempt-4 explicit-port receipt, math unit, focused E2E, block control, generated payload | kept | completed local inline behavior only; block unchanged | uncommitted and unpushed; no release claim | user may request commit separately |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| date:first-click-opens-calendar | attempt-7 still blamed Date while live Agentation document capture intentionally blocked every interactive target | repair-now | `.agents/rules/regression.mdc`, methodology, template, semantic validator, and tests require global interceptor path/state plus `external-interceptor-isolated: pass` | pass: workflow 101/101, source/mirrors exact, agent-native pass, missing-state/isolation fixtures rejected | attempt 8 reverted Date compensation and isolated Agentation |
| inline-equation:first-click-opens-editor | attempts 1-3 needed the same-gesture popup transition trace to distinguish never-opened from focus-open/click-close | repair-now | `.agents/rules/regression.mdc` actual-order rule plus permanent E2E `aria-expanded` trace and component child-click contract | pass: exact trace shows closed, focus-open, click-close; final trace stays open | third candidate invalidated; attempt 4 completed |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Initial Bun filter | proof command | one failed invocation | `.slow.tsx` requires `./` root-relative path filter | high: established RED | repaired; isolated files pass 12/12 |
| Browser final verification | Browser IAB CDP input | earlier repeated input timeouts | stale interaction binding before final HMR | blocking until recovered | recovered on current user tab; Date and inline each 5/5 |
| www typecheck | Turbo dependency build | 60s | source-first graph built 58 dependencies before www | high: full app type safety | pass: 59/59 tasks; no shortcut needed |
| Video-exact five-run proof | first count failed before assertions because port 3001 was stopped | proof host | started current source PID 83195, warmed root route, and restarted from zero | pass: receipt-bound 5/5 |
| Chrome fresh reload loop | extension capped detached-element waits at 3 seconds during dynamic reload | proof-host limitation | retained one exact Chrome cross-block caret proof; used five fresh Playwright pages for counted stability | pass: Chrome exact once plus Playwright 5/5; no product tuning against host failure |
| Attempt-6 Playwright diagnostic | first run silently used default port 3000, which served an unrelated Informed app | proof-host mismatch | added helper/validator law requiring the literal managed base URL; reran every final command with `PLAYWRIGHT_BASE_URL=http://localhost:3001` | pass: wrong-port test rejected; final receipts bind PID 94408 and port 3001 |
| Final full corpus inline row | locator action sometimes ended after focus-open/mousedown without a DOM click even though inline expanded true | proof-oracle overconstraint | Date keeps complete-click assertion; inline asserts its actual pointerdown/mousedown plus expanded outcome | pass: inline 5/5 and full corpus 4/4 on final bytes |

Findings:

- The latest live failure retained correct Date DOM/product bytes but Agentation
  was active and its settings showed `Block page interactions` checked.
- Installed Agentation source registers a document capture `click` handler; in
  active mode with that setting it calls `preventDefault` and `stopPropagation`
  for every button/link/input before React receives the gesture.
- Esc collapsed the same toolbar to `Start feedback mode`; with no refresh, the
  original Date then opened on one click. This active/inactive contrast is the
  decisive root-cause proof.
- All Date product compensation from attempts 5-7 was reverted. `date.tsx`, its
  unit file, and generated Date payload match HEAD; the physical E2E remains.
- Earlier Date/Popover/capture-routing root-cause claims are superseded by the
  live external-interceptor proof.
- Date also had a 150ms Popover animation, so the Date-local popup keeps its
  existing zero-animation classes while the component-owned `open` state fixes
  the actual focus-first failure.
- The earlier CleanShot does not show two Date clicks. Its first green click circle
  lands on `Insert dates like`; the next click is the first Date click and the
  calendar opens immediately.
- The lightweight transcript misidentified the text click as a Date click. An
  8fps frame audit and explicit-target transcript corrected the evidence.
- Video-exact text-caret then Date-click proof passes 5/5; a separate direct
  Date click from outside editor focus also passes.
- Latest clarification broadened the setup to a caret in any ordinary text.
  The passive-wrapper unit exposed the real missing invariant: Date delegated
  opening to Radix and did not own `open` or request it on click.
- Attempt 5 gives Date local controlled `open`; a closed Date click prevents
  the wrapper toggle and opens directly, while an already-open trigger still
  delegates normal close behavior to Radix.
- CleanShot 16:32:17 is a genuine contradiction: 00:02 clicks `dates`, 00:04
  first Date click leaves the calendar closed, and 00:05 second click opens.
- The latest reporter classifies that failure as intermittent. On the final
  current bytes it did not recur in 50 fresh pages or 50 same-tab IAB runs.
- Attempt 6 found two proof failures rather than a new product invariant: the
  durable Date test used `locator.click()`, and a managed receipt could label
  port 3001 while its Playwright command silently defaulted to port 3000.
- The controlled Date source remains the narrow durable product owner. Attempt
  6 strengthens the physical gesture and host-freshness proof instead of adding
  a speculative pointerdown handler or timer.
- The live `为什么还是不行` contradiction exposed the missing product invariant:
  Date rendered `draggable=true` on the child button, while
  `Editable.onMouseDownCapture` reads it from the inline-void ancestor.
- With the wrapper missing that attribute, Plite entered its non-draggable
  inline-void branch and could consume gesture one as selection. Selection
  history made the symptom intermittent.
- Attempt 7 moves `draggable` to `PlateElement.attributes`, matching Mention,
  Footnote, and Plite's capture contract; the child button is no longer native
  draggable.
- Inline Equation's first gesture transitioned `closed > focus-open > click-close`.
  Radix treated the same gesture that selected/opened the void as a close toggle.
- Inline Equation now snapshots whether the popup was open at pointerdown. A
  gesture that began closed remains open; a later gesture that began open may close.
- Block Equation remained unchanged and passed as the one-click control.

Timeline:

- Loaded Regression, Autogoal, Patch, Browser, Registry Changelog, and
  Changeset contracts; created the active plan and goal.
- Current source host: exact Date click measured animationDuration 0.15s.
- Invalidated drag-based candidate; repaired Regression with an executable
  delivered-click rule and synced mirrors.
- Date RED expected Date-specific animate-none classes and received only
  `w-auto p-0`; final source adds zero-animation classes.
- Inline attempts 1-3 were invalidated by exact replay until the popup mutation
  trace identified the gesture-start invariant used by attempt 4.
- The latest Date contradiction invalidated attempt 4, repaired Regression's
  passive-wrapper proof law, and produced an owner-level RED before attempt 5.
- The 16:32:17 contradiction invalidated attempt 5. Regression now rejects
  locator/programmatic hit paths and managed receipts whose command omits the
  recorded base URL; workflow proof passes 95/95 with exact mirrors.
- Final attempt-6 proof ran only on PID 94408 at explicit port 3001: 50/50 fresh
  pages, 50/50 current long-lived IAB interactions, receipt 5/5, and full 4/4.
- The live attempt-6 contradiction invalidated those counts. Current DOM/source
  inspection found the button/wrapper ownership mismatch and produced a unit
  RED before attempt 7.
- Attempt 7 moved draggable ownership, rebuilt registry output, passed the
  current reporter tab, 20/20 same-tab, 20/20 fresh, receipt 5/5, full 4/4,
  typecheck 59/59, and workflow 98/98.
- The next `依旧失败` invalidated attempt 7. The unchanged product DOM plus
  active Agentation/blockInteractions state exposed document-capture blocking.
- Exiting feedback mode made original Date open in the same tab. Date
  compensation was reverted; final unit 3/3, Date 5/5, inline 5/5, full 4/4,
  typecheck 59/59, workflow 101/101, and attempt-8 receipts pass.
- Generated registry/changelog output, focused unit/E2E proof, workflow tests,
  www typecheck, proof receipts, and IAB 5/5 all pass.

Decisions and tradeoffs:

- Do not change Date, Popover, Plate, or Plite for Agentation's intentional
  feedback-mode interception. Product code cannot run before document capture.
- Restore Date source/unit/generated output to HEAD and keep only the native
  browser regression coverage.
- Product interaction testing requires Agentation feedback mode inactive or
  `Block page interactions` disabled. Annotation capture behavior remains owned
  by Agentation.
- Preserve Date's native trigger and value semantics; own `open` inside Date and
  keep the Date-local zero-animation classes. Do not change shared Popover or
  add a timer.
- Keep Date open ownership local to its copied registry component; do not move
  it into shared Popover, Plite, a hook, a provider, or a timer.
- Preserve controlled `open`; fix the earlier event boundary by moving
  `draggable` to the inline-void owner that Plite actually reads. Do not add a
  timer or shared Popover/Plite compensation.
- Preserve inline-void dragging instead of deleting it. Moving the attribute to
  the canonical owner fixes capture routing and matches Mention/Footnote.
- Keep inline ownership local. No public helper, shared Popover change, Plite
  change, or block Equation change is justified.
- Use pointerdown only to capture gesture-start state; the click remains the
  opening action and keyboard activation remains owned by Radix.
- No package changeset: this is registry-only user-visible behavior; registry
  changelog entry owns release communication.

Review fixes:

- P1 interaction-proxy finding fixed: drag surrogate cannot stand in for click.
- Agent-native parity pass: video evidence has a transcript/frame route,
  Regression source owns focus-state law, generated mirrors are exact, and the
  semantic validator rejects mismatched focus setups.
- Passive-wrapper false green fixed: Date's component test no longer lets the
  Popover mock inject the click toggle.
- Physical-path false green fixed: Date E2E creates both gestures from live
  coordinates with `page.mouse` and asserts hit target plus click delivery.
- Host-label false green fixed: receipt capture and semantic validation reject
  a command that does not contain the managed host's literal base URL.
- Capture-owner false green fixed: Date unit/E2E and Regression now validate
  the full Date button → inline-void wrapper → Editable chain and attributes on
  the actual owner.
- External-interceptor miss fixed: Regression now blocks product patches until
  active dev overlays/global capture listeners are inventoried and isolated.
- Agent-native review PASS: the live toolbar state, installed source handler,
  Esc deactivation, product E2E, workflow validator, and source/mirror sync are
  all repeatable without hidden human context.
- Final targeted review found no remaining P1. Autoreview is N/A because repo
  policy forbids it on `next`; agent-native workflow source/mirror parity passes.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bun filters omitted `./` for `.slow.tsx` | 1 | use explicit root-relative path filters | fixed; isolated files pass 13/13 |
| Drag surrogate did not deliver click | 1 | invalidate candidate and repair Regression | fixed workflow; attempt 2 uses exact click |
| Browser localhost URL policy rejection | 2 | rebind same IAB only | recovered; final page and one warm click pass |
| Browser CDP input timeout | 5 | reuse the current IAB tab after final HMR and reset preview state | recovered; Date and inline each pass 5/5 |
| Inline state-only candidates | 3 | record `aria-expanded` transitions through one real gesture | fixed: focus-open/click-close ordering identified |
| Combined Bun mocks | 1 | isolate files into separate Bun processes | fixed: 5/5, 4/4, 4/4 |
| Lightweight video transcript | 1 | inspect original frames and rerun with explicit click targets | fixed: text click, then first Date click, then calendar |
| Counted Date runs on stopped server | 1 | start current source host, warm route, restart count from zero | fixed: receipt-bound 5/5 |
| In-app Browser contenteditable caret | 1 | use exact Chrome native selection and keep Browser limitation out of product tuning | fixed: Chrome Callout caret observed; first Date click opens |
| Chrome repeated reload | 1 | keep exact Chrome as one native control and use fresh Playwright pages for five-run stability | fixed: detached-element host failure excluded; Playwright 5/5 |
| Playwright default port | 1 | inspect failed screenshot instead of waiting on the Date locator | diagnosed unrelated Informed app on port 3000; final commands and receipt machinery bind port 3001 |
| IAB stale screen coordinates after HMR/scroll | 1 | recompute live bounds and verify `elementFromPoint` before each gesture | fixed: all counted same-tab runs use fresh text and Date points |

Verification evidence:

- Isolated Bun: `math.spec.tsx` 5/5, `date.slow.tsx` 3/3,
  `inline-void-suggestion.slow.tsx` 4/4.
- Focused Playwright file -> Date existing-caret, Date outside-focus, inline
  Equation, and block control 4/4.
- `pnpm turbo typecheck --filter=./apps/www` -> 59/59 tasks.
- `pnpm --filter www build:registry` and changelog `--check` -> pass.
- Final Date unit is original 3/3; earlier attempt-7 5/5 compensation proof is invalidated and reverted.
- Latest Regression repair -> 101/101 source/mirror tests; sync exact; agent-native pass.
- Live interceptor contrast -> Agentation active + blockInteractions true kept
  Date closed; Esc collapsed toolbar to `Start feedback mode`; original Date
  then opened on one click in the same tab.
- Date attempt-8 receipt `sha256:18e598c3d47aa137cd7bf08d6974d4c9b9cb3cdb9a3e08d4311d83ec9f49067c`;
  original Date unit 3/3, physical path 5/5, and full browser corpus 4/4 on port 3001.
- Inline refreshed receipt `sha256:4b212c1971251336e8a00b55d5dfc4b22c57dcde07d4c1ae1e2c43fc4169627f`;
  inline diagnostic stability 5/5 and inline/block receipt 2/2.
- Corrected video transcript -> 00:01 text click, 00:05 first Date click,
  00:06 calendar visible.
- Latest video transcript -> 00:02 `dates` caret, 00:04 first Date click stays
  closed, 00:05 second click opens; retained as the historical RED authority.

Final handoff:

- executable cases: Date attempt 8 and inline Equation attempt 4 are completed.
- cumulative evidence/oracles: all required rows pass; block Equation remains
  the unchanged positive control.
- failed fixes: attempt-7 receipt/completion revoked; Regression external-
  interceptor source, validator, tests, and mirrors pass 101/101.
- proof receipts and affected-corpus replay: Date attempt-8 and refreshed inline
  receipts match current source/test/config digests and explicit PID/port.
- changed follow-up owners: Date/inline physical E2E, Regression workflow
  source/tests/mirrors, and plan; Date source/unit/generated compensation is
  reverted to HEAD; inline/block product source remains unchanged in attempt 8.
- tests/proof: original Date unit 3/3, browser corpus 4/4, Date receipt 5/5,
  inline stability 5/5, same-tab Agentation active/inactive contrast,
  www typecheck 59/59, workflow 101/101.
- reviews: direct P1 and agent-native parity pass; Autoreview N/A on `next`.
- local completion/integration boundary: `completed`, uncommitted, unpushed,
  not integrated or released.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | local implementation and proof complete |
| Where am I going? | wait for a separate commit request |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | Agentation active feedback mode with blockInteractions=true owns document capture and intentionally prevents/stops all button clicks before React; Date was never the live owner |
| What have I done? | exited feedback mode in the same tab, proved original Date opens, reverted Date compensation to HEAD, retained native E2E, and repaired external-interceptor proof |

Open risks:

- Agentation feedback mode intentionally blocks product interaction while
  `Block page interactions` is enabled. Exit it with Esc or disable that setting
  before product testing. Date product source is unchanged from HEAD. Remaining
  E2E/workflow changes are local, uncommitted, and unpushed.
