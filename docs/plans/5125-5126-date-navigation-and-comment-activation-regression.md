# 5125 5126 Date navigation and comment activation regression

Objective:
Reproduce and locally repair #5125 Date arrow navigation and #5126 first-click comment activation, with exact executable regressions, browser verification, five stable native runs, and final receipts.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5125-5126-date-navigation-and-comment-activation-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: issues 5125 and 5126
- lane and current source owner: Plate BaseDatePlugin; Plite collapsed deletion; registry CommentLeaf and commentPlugin
- selected executable test cases: date-arrow-crossing; comment-first-click
- tested ref or dirty-state boundary: clean next 05d25a581b44c7aaa0f545f7cf36ec4a5b8e8533 at intake
- route / proof host and freshness method: fresh www process on localhost:3000, /blocks/date-demo; source imports via package workspace exports
- invocation mode / timebox: one-shot; no timebox

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
- Every `unit-red:` case records `runtime-modes:` in `Exact environment` and
  matches every route mode that changes mutation representation or schema
  properties; a disabled preview, suggestion, history, or other material mode
  keeps the lower-layer result proxy-only.
- Every `unit-red:` case records `fixture-scope: complete <input>` or
  `fixture-scope: minimal <invariant>` in `Exact environment`. Minimal input is
  reproduction-only and cannot support kept, fixed, completed, or full-flow
  status; deterministic generated actions replay their complete fixture.
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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5125-5126-date-navigation-and-comment-activation-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5125-5126-date-navigation-and-comment-activation-regression.md`

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

- allowed source owners: Plate Date schema and comment activation owners after exact diagnosis
- allowed proof/test owners: existing Date package specs and comment component tests; existing browser proof
- generated/source boundary: registry source is authoritative; build registry when touched on next
- browser/device claim width: desktop browser, current default DateKit and existing highlighted comment
- forbidden product/API/release/public mutations: unrelated features, shipping, issue updates, secrets
- orchestration mode and writer ownership: root coordinates; serialized one-case Patch; read-only comment intake can run independently

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

- current phase: honest stop after local Date repair and comment investigation
- current executable case: comment-first-click
- current case status: needs-repro; current next first-click behavior is green
- next owner: Regression when reporter-specific reproduction becomes available
- goal status: partial; Date locally completed, comment needs-repro

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | pass: original Work Checklist captured both issues and next scope before edits |
| Regression methodology loaded | yes | pass: full methodology read before case/test delegation |
| Active goal checked or created | no | N/A: developer requires explicit goal request; plan used without create_goal |
| Current source owner and tested ref recorded | yes | pass: next 05d25a581b44c7aaa0f545f7cf36ec4a5b8e8533 and owning files identified |
| Executable test cases discovered | yes | pass: Date existing specs; comment existing corpus plus exact mounted proof |
| Cumulative reporter evidence resolved | yes | pass: live issue bodies, acceptance, existing video transcript, and next reply retained |
| Reporter oracle matrix resolved | yes | pass: applicability and anchors captured; comment results remain support-only |
| Regression semantic validator ready | yes | pass: preimplementation semantic validation passed before Date patch |
| Route/proof-host readiness plan recorded | yes | pass: fresh www source host; standalone demos preferred |
| Patch delegation boundary recorded | yes | pass: one Date implementation owner; comment proof-only worker |
| Orchestrator writer ownership recorded | yes | pass: no overlapping product writers; root owns host and plan |
| Output budget strategy recorded | yes | pass: bounded exact logs and targeted tests |
| Claim width and blocked rules recorded | yes | pass: local only; absent #5126 red blocks full completion |

Work Checklist:

- [x] Selected only #5125 and #5126; preserve each issue body, acceptance criteria, and later comments.
- [x] #5125: ArrowRight and ArrowLeft each cross Date once; preserve value/text; clicking Date still opens picker.
- [x] #5126: one click on existing highlighted comment text opens correct popover; dismissal/reopen and initially unfocused editor included.
- [x] No timebox; one-shot execution until both cases satisfy local proof or a named blocker.
- [x] Use unit/package RED first, delegate one Patch at a time, record affected baseline before owner edits.
- [x] No public mutation, commits, push, PR, or release under this invocation; prior push request was for the completed AI fix.
- [x] User AGENTS prohibits autoreview on next; manual source review closes review scope here.
- [x] Deliver concise cases/fix/tests/browser/stability/receipt/plan/limits handoff.
- [x] Developer goal tool restriction: no new durable goal requested; use this plan without create_goal.

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
- [ ] Every selected case records its `Red-test escalation`. Try the exact
      owner-level unit/package test first. `unit-red:` forbids a new E2E test;
      `e2e-required:` names why no exact unit/package RED is possible. Browser
      verification alone does not become permanent E2E coverage.
- [x] Every selected case inventories its base acceptance, recordings, and all
      later reporter confirmations/contradictions as cumulative deltas. Every
      still-applicable claim stays required; superseded claims cite the source
      and reason that removed them.
- [ ] Every required evidence row maps to a phase-specific executable oracle.
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
- [x] Every focus-transfer case covers both a direct `relatedTarget` and null
      `relatedTarget` followed by document `focusin`. Its positive assertion
      records `focus-transfer: direct-related-target + null-related-target ->
      focusin`; completion records `direct-related-target: pass`,
      `null-related-target: pass`, and `focusin-resolution: pass`.
- [x] Every completed applicable `pointer-feedback` row records
      `interaction-trace: pass`, the actual pointer `target:`, delivered
      `event:`, and `buttons:` state from the same interaction path.
- [x] Every flash, flicker, or one-frame pointer-feedback claim uses a target-
      capture or equivalent pre-handler oracle and records
      `pre-handler-state: pass`; eventual post-handler style is insufficient.
- [x] Every reporter click reproduced through a drag surrogate proves the same
      gesture delivered a click event; a drag surrogate without the delivered
      click cannot authorize a product patch.
- [x] Every focus-first click report records the reporter's concrete setup in
      both required evidence and the focus oracle as
      `initial-focus: <concrete reporter state>`, records one real gesture as
      `event-order: <actual pointerdown/mousedown/(focus when emitted)/click trace>`,
      and proves
      `first-click-popup: open` immediately after that click. A pre-focused or
      outside-focused setup is valid only when reporter evidence matches it;
      an invented focus state or `fireEvent.click`-only test cannot close
      single-click behavior.
- [x] Every repeated focus-first contradiction whose component test stays green
      reruns against a passive popup wrapper that only reflects the component's
      `open` input and never injects a click toggle; completion records
      `component-open-owner: pass`.
- [x] When reporter video identifies concrete hit targets after locator-click
      or programmatic-selection proof stayed green, required evidence records
      `physical-hit-path: <first target -> action target>`. Browser proof drives
      both gestures from live coordinates, records
      `physical-hit-target: <actual target>` and
      `selection-origin: physical-pointer`, and completion records
      `physical-hit-target: pass`, `click-delivery: pass`, and
      `selection-origin: pass`. Locator clicks and direct Range mutation remain
      proxy evidence.
- [x] When reporter video visibly identifies a browser family, profile,
      extension, or browser-owned overlay, required evidence and Exact
      environment record
      `reporter-profile: <browser family and visible profile/extension state>`.
      In-app Browser, clean-profile, different-binding, and exact-binary-only
      proof stay support-only. Applicable DOM/native, focus, and popup rows
      replay the physical path in that reporter profile and record
      `reporter-profile-replay: pass`; the receipt host binds the same profile.
      If only Computer Use can replay the profile/OS path, Exact environment
      records `tool-proof: computer-use`, every applicable profile oracle names
      Computer Use, and an exact executable receipt still binds the final bytes
      and browser binary.
      Every scroll, selection, focus, layout, or overlay-state change refreshes
      and verifies the live hit target before the next physical gesture.
- [x] When editor capture routing branches on target/ancestor attributes,
      required evidence records
      `capture-routing-path: <target -> capture owner>`. The DOM/native oracle
      inventories the complete target-to-owner chain and the attributes read on
      their actual owners as `interaction-owner-chain: <nodes>` and
      `capture-routing-contract: <owner attributes>`; completion records both
      `interaction-owner-chain: pass` and `capture-routing-contract: pass`. A
      child-only attribute assertion is proxy evidence when capture reads the
      ancestor.
- [x] When a reporter's live tab stays red while an isolated exact-host case is
      green, required evidence inventories active dev overlays and global
      capture listeners as
      `interaction-interceptor-path: <global capture owner -> target>` and
      `external-interceptor-state: <active mode/settings>`. Product code may not
      compensate for an external owner that calls
      `preventDefault`/`stopPropagation` on the gesture;
      completion records `external-interceptor-isolated: pass` after the same
      tab is replayed with that interceptor inactive or permissive.
- [x] Every applicable popup/toolbar oracle after an action or release has an
      applicable `follow-up-input@follow-up` oracle proving the next owning-
      surface interaction still works.
- [x] Every applicable popup/toolbar focus oracle records
      `focus-stability: settled + follow-up-key`, uses browser-native proof
      after the named layout/render settling boundary, and completes with
      `settled-focus: pass` plus `follow-up-key: pass`. Immediate focus samples
      and locator-side refocus are support-only.
- [x] Every shortcut- or hotkey-opened popup focus oracle records
      `trigger-path: pre-focused-surface + native-keyboard`, delivers the key
      through the browser keyboard instead of locator-owned `press()`, and
      completes with `native-trigger-key: pass`.
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
- [ ] Every applicable oracle row has a positive assertion, a distinct forbidden
      state, an executable layer/anchor, and an exact result; every inapplicable
      row has N/A reasons.
- [x] The smallest falsifying executable probe ran before scaling.
- [ ] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [ ] The executable test is red before the fix, or the exact safe-red
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
- [x] Every managed browser receipt includes its literal `--base-url` in the
      proof command (for example `PLAYWRIGHT_BASE_URL=<url>`); a host label and
      command default may not name different ports.
- [x] Required retry-free stability runs passed with no retry.
- [x] Responsive geometry proof waits through animation-frame, resize-observer,
      or renderer-commit settling with a bounded invariant poll; it records
      pre-convergence and converged geometry instead of treating one immediate
      post-resize bounding-box read as final.
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
- [x] When Regression adopts already-applied work previously called
      `candidate-local`, `kept`, or `completed`, the frozen candidate corpus
      runs before baseline restoration or product edits. A red candidate intake
      invalidates the prior claim and enters `final-verification` Failed-Fix
      Interrupt before attempt N+1.
- [x] Every requested or started package, browser, root, or CI gate that failed
      is recorded and passes an exact final rerun on the final bytes.
- [ ] Every selected case is kept, reverted, quarantined, deferred, or blocked
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
- [x] Every failed popup/toolbar focus replay records native focus events,
      focus owners at mount/positioned/settled/follow-up-key, the first divergent
      phase, and a native `focus()` call trace with target, connected, display,
      visibility, disabled, and active-after-call state before another product
      attempt.
- [x] Every failed scheduled popup/toolbar focus replay records
      `focus-scheduler-trace: request + cancel + run` and
      `focus-scheduler-result: <ran-or-cancelled/target-readiness>` before
      another scheduler or readiness predicate is selected.
- [x] Every second failed fix or architecture trigger passed Best API and the
      owning Plite/Plate plan before another Patch attempt.
- [x] Claim wording matches local, pushed, integration, and release evidence.
- [ ] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
- [x] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [x] Output budget discipline was followed.


Checklist applicability and remaining gaps:

- Unchecked universal rows remain open because #5126 has no red reproduction. They must not be marked complete from current-green probes.
- Related-target focus transfer, capture routing, external interception isolation, held-pointer boundaries, shortcuts, compositor classifiers, responsive geometry, scheduling, shared styles, subscription lifecycle, and adopted-candidate rules are N/A: no corresponding report, owner edit, or failed claimed fix. No raw-device or pixel-classifier claim is made.
- Date caret paint was visually inspected after real native arrows; native endpoints and editor focus were reasserted after capture. Popup focus was observed after DOM settlement and tested by a native calendar arrow.
- The speculative Escape-close cleanup exceeded the reporter acceptance. The corrected reporter gate uses trigger-toggle cleanup and passes five times; no claim is made that Escape behavior changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | blocked: #5126 has no reproduced red; full run is partial |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: exact dirty ref and six-input digest recorded in generated receipt |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: PID 32261 started after final product edit; fresh standalone routes |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | partial: Date red-to-green complete; comment 2 current-green tests cannot prove a repair |
| E2E escalation closure | yes | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | partial: Date unit-red forbids new E2E; comment needs exact reproduction, no new E2E created |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pass: Date directions, highlighted link/plain leaves, unfocused first click, dismissal/reopen, and next clarification retained |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all eight observations and every applicable interaction phase per case | partial: Date exact assertions pass; comment coverage supports green current behavior only |
| Failed-fix interrupt closure | no | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | N/A: no claimed fix failed; initial TDD reds are expected |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pass: Best API and Plite Plan decision recorded before generic deletion fix |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: generated Date receipt validates input fingerprints; no comment fix receipt claimed |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: final Date 160/160 and comment 29/29; picker 5/5 |
| Shared-style consumer closure | no | Inventory every shared selector/class consumer and prove explicit paint neutralizers do not inherit or duplicate the shared surface | N/A: no CSS selector or style edits |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: command/harness gates repaired and pass; native reporter gate uses valid trigger-toggle cleanup; Escape-specific behavior is outside the fix claim |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: Date unit/native red before repair; comment exact probes green |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | pass: single Date Patch return reviewed; proof-only comment worker returned |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: 194 targeted tests, 79 typecheck tasks, scoped lint, native Browser proof |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: Date 5/5 retry-free native runs; comment 5/5 reopen cycles per target remain support-only |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | pass: keep Date local fix; keep comment coverage, needs-repro product repair |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | partial: Date completed locally; comment needs-repro; run remains partial |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: executable tests own behavior; plan and ignored diagnostic logs only |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: source host refreshed; no generated runtime edits required |
| Orchestrator writer closure | yes | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | pass: serialized product ownership; separate proof file writer; root host/plan owner |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: pinned pnpm exec, exact Bun paths, source host readiness; separate Escape exploration deferred |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | pass: evidence-backed no-change for both cases; existing rules covered the discovered invariants |
| Source/generated sync | no | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | N/A: no agent source, registry runtime source, exported file, or template edits |
| Agent-native review | no | Run for changed agent workflows or record N/A | N/A: no agent workflow changes |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: tests, local/ref status, risks, screenshots, and next owner recorded below |
| Autoreview | no | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A: repository forbids autoreview on next; manual bounded diff review found no blocker |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5125-5126-date-navigation-and-comment-activation-regression.md --complete` | blocked: --complete cannot pass while selected comment case is needs-repro |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5125-5126-date-navigation-and-comment-activation-regression.md` | blocked: full completion intentionally unclaimed while #5126 remains unreproduced |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | done | explicit requirements captured before work | recorded |
| Current source and proof-host readiness | done | next ref and final host PID recorded | recorded |
| Executable case discovery and selection | done | Date and comment executable anchors recorded | recorded |
| Cumulative reporter evidence inventory | done | live issues, existing video transcript, latest next clarification | recorded |
| Reporter oracle expansion | done | phase-specific rows and applicability recorded | recorded |
| Pre-implementation semantic validation | done | passed before Date implementation | recorded |
| Smallest high-value probe | done | Date native and package red; comment mounted/native green | recorded |
| Reproduce, classify, and red test | partial | Date reproduced; comment needs-repro | Regression: #5126 exact reproduction |
| One-case Patch delegation | done | Date implementation; comment proof-only | recorded |
| Focused verification and stability | done | 194 tests; 79 typecheck tasks; native five-run evidence | recorded |
| Keep/revert/quarantine | done | Date keep; comment proof keep and product needs-repro | recorded |
| Methodology repair/no-change/defer | done | existing methodology sufficient; no-change decisions | recorded |
| Reviews and final handoff | done | manual review; no public or git mutation | recorded |
| Final goal-plan check | blocked | all-selected completion blocked by #5126 no red | Regression: #5126 exact reproduction |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| date-arrow-crossing | https://github.com/udecode/plate/issues/5125 | Default Date between text; ArrowRight from left and ArrowLeft from right | Cross once; unchanged date/text; picker stays interactive | reporter: #5125 acceptance criteria | unit-red: test: packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx#crosses the date to the right without changing content | browser: local desktop Browser; runtime-modes: editable, no suggestion preview, normal history; fixture-scope: complete Date between two text runs | test: packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx#crosses the date to the right without changing content; ./node_modules/.bin/bun test packages/platejs/src/features/date ./packages/plitejs/test/delete-contract.ts ./packages/plitejs/test/query-contract.ts ./packages/plitejs/test/text-units-contract.ts | completed | dirty:05d25a581b44c7aaa0f545f7cf36ec4a5b8e8533 | none: local proof complete; integration requires authorization |
| comment-first-click | https://github.com/udecode/plate/issues/5126 | One physical click on linked comments and sibling plain highlighted text from initially unfocused editor; dismiss and reopen | Correct existing discussion opens on the first click | reporter: #5126 acceptance criteria and video; latest clarification is next branch | blocked: package and real component probes are green; no exact red can currently be produced; no E2E escalation is justified | browser: local Browser plus Chrome; runtime-modes: full EditorKit and discussionValue with suggestions, links, comments, history; fixture-scope: complete discussionValue; initial-focus: BODY with null selection; event-order: pointerdown -> mousedown -> focus -> click; reporter-profile: unspecified, next branch confirmed | test: apps/www/src/registry/components/editor/comment.spec.tsx#existing comment activation (#5126); ./node_modules/.bin/bun test apps/www/src/registry/components/editor/comment.spec.tsx | needs-repro | dirty:05d25a581b44c7aaa0f545f7cf36ec4a5b8e8533 | Regression: compare a reproducible reporter gesture; no speculative product fix |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| date-arrow-crossing | base-acceptance | #5125 body and acceptance criteria | after-action | One key moves caret across Date in both directions; value/text preserved and picker still interactive | required | model@after-action, dom-native@after-action, focus@after-action, popup@after-action, follow-up-input@follow-up | test: packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx#crosses the date to the right without changing content | pass: package red then green; native Browser 5/5 |
| comment-first-click | base-acceptance | #5126 body, linked video, existing tracker timestamp transcript | after-action | First click existing highlighted comment opens correct discussion; editor can start unfocused; dismiss then one click reopens; linked and plain segments required | required | model@after-action, dom-native@after-action, focus@after-action, popup@after-action, follow-up-input@follow-up | test: apps/www/src/registry/components/editor/comment.spec.tsx#existing comment activation (#5126) | needs-repro: current implementation passes exact component and native route probes; no red |
| comment-first-click | reporter-delta | User reply: next branch | setup | Test local next; no narrower page or focus precondition supplied | required | dom-native@after-action, focus@after-action | test: apps/www/src/registry/components/editor/comment.spec.tsx#existing comment activation (#5126) | pass: verified next branch and fresh localhost source host |

Reporter oracle matrix:

For an effect-owned disposable source, the `subscription-lifecycle` row records
`strict-effect: mount + cleanup + remount` and closes with `mount: pass`,
`cleanup: pass`, `remount: pass`, and `post-remount-publication: pass`.

| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| date-arrow-crossing | model | after-action | yes | Navigation preserves full text and Date value | mutation of value or adjacent text | package | test: packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx#crosses the date to the right without changing content | pass: final package corpus 160/160 and native Browser 5/5; no retries |
| date-arrow-crossing | dom-native | after-action | yes | Caret lands on opposite adjacent text after one key; browser native selection and caret observed | caret stops in Date child | Browser native keyboard + package | test: packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx#crosses the date to the right without changing content | pass: final package corpus 160/160 and native Browser 5/5; no retries |
| date-arrow-crossing | pointer-feedback | during-action | yes | reporter-noun: Date; affordance-inventory: DateElement button; pointer cursor and delivered click opens picker | inert button or text-only cursor | Browser native click | test: packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx#crosses the date to the right without changing content | pass: pointer cursor on Date button; native primary click opens picker; target: January 1, 2024; event: click; buttons: 0 at click; interaction-trace: pass via Browser native delivery |
| date-arrow-crossing | focus | after-action | yes | Editor owns focus during arrows; calendar owns focus after DOM settlement; focus-stability: settled + follow-up-key | focus lost or extra key needed | Browser native key and settled follow-up | test: packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx#crosses the date to the right without changing content | pass: editor focused after both arrow directions; settled-focus: pass; follow-up-key: pass; native calendar ArrowRight advances focused day after DOM settlement; 5/5 |
| date-arrow-crossing | popup | after-action | yes | Date click opens calendar; arrows alone leave it closed | picker fails to open | Browser click + existing date.slow.tsx | test: apps/www/src/registry/components/editor/date.slow.tsx#owns first-click opening with a passive popover wrapper | pass: final package corpus 160/160 and native Browser 5/5; no retries |
| date-arrow-crossing | geometry-paint | after-action | no | N/A: no geometry or duplicate paint repair; caret position observed in dom-native | N/A: no geometry repair | N/A: no geometry repair | N/A: no geometry repair | N/A: stated above |
| date-arrow-crossing | subscription-lifecycle | after-action | no | N/A: schema behavior, no subscription owner edits | N/A: no subscription edits | N/A: no subscription edits | N/A: no subscription edits | N/A: stated above |
| date-arrow-crossing | runtime-errors | after-action | yes | No browser runtime error from navigation or picker | exception or overlay | Browser logs + package | test: packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx#crosses the date to the right without changing content | pass: final package corpus 160/160 and native Browser 5/5; no retries |
| date-arrow-crossing | follow-up-input | follow-up | yes | Typing after navigation edits adjacent text; Date trigger toggles picker closed and reopens it | Date value changed or editing blocked | Browser native input + package | test: packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx#crosses the date to the right without changing content | pass: final package corpus 160/160 and native Browser 5/5; no retries |
| comment-first-click | model | after-action | yes | activeId equals discussion1 after one click | stale or wrong active discussion | DOM component test with real mounted EditorKit | test: apps/www/src/registry/components/editor/comment.spec.tsx#existing comment activation (#5126) | support-only: current green; no reproduced regression; component 2/2 and Browser five reopen cycles per target |
| comment-first-click | dom-native | after-action | yes | Native selection lands in clicked link or plain leaf; physical-hit-path: native primary click -> highlighted leaf | first click lost before leaf activation | Browser and Chrome native click | test: apps/www/src/registry/components/editor/comment.spec.tsx#existing comment activation (#5126) | support-only: current green; no reproduced regression; component 2/2 and Browser five reopen cycles per target |
| comment-first-click | pointer-feedback | during-action | yes | reporter-noun: highlighted comment text; affordance-inventory: linked comments and sibling plain CommentLeaf; yellow highlight and text cursor remain visible | missing highlight or inert target | Browser screenshot and native click | test: apps/www/src/registry/components/editor/comment.spec.tsx#existing comment activation (#5126) | support-only: current green; no reproduced regression; component 2/2 and Browser five reopen cycles per target |
| comment-first-click | focus | after-action | yes | Initial BODY focus and null selection; click establishes editor focus; existing discussion remains open after settlement; focus-stability: settled + follow-up-key; native ArrowLeft changes text offset 11 to 10 while dialog remains open | focus consumed without discussion | mounted event trace plus native Browser | test: apps/www/src/registry/components/editor/comment.spec.tsx#existing comment activation (#5126) | support-only: current green; no reproduced regression; component 2/2 and Browser five reopen cycles per target |
| comment-first-click | popup | after-action | yes | Correct Charlie and Bob discussion is visible after one click | closed or wrong discussion | real Radix popover plus Browser | test: apps/www/src/registry/components/editor/comment.spec.tsx#existing comment activation (#5126) | support-only: current green; no reproduced regression; component 2/2 and Browser five reopen cycles per target |
| comment-first-click | geometry-paint | after-action | no | N/A: no layout or paint defect reported | N/A: no geometry repair | N/A: no geometry claim | N/A: no applicable test | N/A: no applicable repair |
| comment-first-click | subscription-lifecycle | after-action | no | N/A: no subscription edits | N/A: no lifecycle repair | N/A: unchanged product | N/A: no applicable test | N/A: no applicable repair |
| comment-first-click | runtime-errors | after-action | yes | No route runtime error during comment activation | exception or error overlay | Browser logs | test: apps/www/src/registry/components/editor/comment.spec.tsx#existing comment activation (#5126) | support-only: current green; no reproduced regression; component 2/2 and Browser five reopen cycles per target |
| comment-first-click | follow-up-input | follow-up | yes | Click unmarked text dismisses; one click on either highlighted target reopens correct discussion | second opening requires another click | component and native Browser | test: apps/www/src/registry/components/editor/comment.spec.tsx#existing comment activation (#5126) | support-only: current green; no reproduced regression; component 2/2 and Browser five reopen cycles per target |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| date-arrow-crossing | 1 | completed | "./node_modules/.bin/bun" "test" "packages/platejs/src/features/date" "./packages/plitejs/test/delete-contract.ts" "./packages/plitejs/test/query-contract.ts" "./packages/plitejs/test/text-units-contract.ts" | pass: exit 0 in 1938ms | dirty:05d25a581b44c7aaa0f545f7cf36ec4a5b8e8533 | sha256:a3a402500d9fac6dcf86c24690694b23c1d515f24dd6a817d3c4ae460789668a | 6 | packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx,packages/platejs/src/features/date/lib/BaseDatePlugin.ts,packages/plitejs/src/transforms-text/delete-text.ts,packages/plitejs/test/delete-contract.ts,packages/plitejs/test/query-contract.ts,packages/plitejs/test/text-units-contract.ts | host:none - authoritative package regression; native Browser evidence recorded separately in plan | 2026-09-09T10:20:04.853Z | 2026-09-09T10:27:58.739Z | 2026-09-09T10:28:00.678Z | 0 | sha256:0298a61adc446e0fb0aceb07b429cab69b0a167ac4dac630a0f3ce78fd35180d |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite collapsed deletion and Plate Date schema | date-arrow-crossing | pass: Date 17/17; existing delete contract 43/43 before shared-owner edits | 2026-09-09T10:20:04.853Z | ./node_modules/.bin/bun test packages/platejs/src/features/date ./packages/plitejs/test/delete-contract.ts ./packages/plitejs/test/query-contract.ts ./packages/plitejs/test/text-units-contract.ts | sha256:a3a402500d9fac6dcf86c24690694b23c1d515f24dd6a817d3c4ae460789668a | pass: final 160/160 after last owner edit |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Date package RED | Desired arrows fail; schema-only probe then exposes adjacent deletion loss | expected test-first red, before candidate claim | Fix Date schema and generic collapsed deletion | pass: exact files included in final 160/160 receipt |
| Comment component harness | about:blank origin; missing TooltipProvider | test-host setup | Reuse existing origin setup and real TooltipProvider in new test only | pass: exact test 2/2; combined corpus 29/29 |
| Scoped ultracite | oxfmt ENOENT with direct binary invocation | command PATH | Use pnpm exec to expose workspace binaries | pass: same five files; formatting and lint pass |
| Receipt capture | --help unsupported; directory input rejected | command shape | Pass explicit source/test files | pass: generated final receipt |
| Date picker component | Bun filter does not discover .slow.tsx | command shape | Prefix exact path with ./ | pass: ./node_modules/.bin/bun test ./apps/www/src/registry/components/editor/date.slow.tsx; 5/5 |
| Exploratory Date Escape dismissal | First Escape did not close picker | pre-existing behavior outside reported Date arrow/picker-opening acceptance; no claimed fix failed | No product edits; source opening-gesture close guard observed; reporter proof uses Date trigger toggle | pass: corrected reporter-valid native gate uses trigger toggle for cleanup; five consecutive runs pass; the broader Escape behavior remains outside this repair |
| Chrome click and selector startup timeouts | Automation returned timeout before interaction delivered or selector ready | proof-host readiness; not a delivered first-click failure | Confirm actual DOM state and readiness before native gestures | pass: delivered first click opens correct discussion in Browser and Chrome |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| none | 0 | N/A: no prior fix | N/A: no prior fix | N/A: no prior fix | N/A: no prior fix | N/A: no prior fix | none | N/A: no prior fix | N/A: initial attempt |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| date-arrow-crossing | 0 | cross-layer-compensation | escalate | required: best-api review rejects Date key/delete overrides; existing selectable and delete owners retained | plite-plan: Date architecture decision in this plan | accepted: canonical collapsed deletion preserves neighboring characters across nonselectable inline voids |
| comment-first-click | 0 | none: no product fix attempted | patch | N/A: no API change | N/A: no product edit | support-only: no red; no speculative timing or focus workaround |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| date-arrow-crossing | workspace Date and Plite source | www localhost:3000/blocks/date-demo; PID 32261 | process started 2026-09-09 03:21:42 PDT after final product edits; source imports; native behavior agrees with package | No registry runtime source or exported files added; build:registry and brl N/A | pass: fresh host and final screenshot reassertion |
| comment-first-click | registry CommentLeaf and discussionValue | Browser /blocks/discussion-demo; Chrome /view/editor-ai and / | Fresh next host; Browser route reloaded after final product freeze | Only .spec.tsx added; generated registry runtime output unchanged | pass: source observed; reporter-specific failing environment unresolved |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| date-arrow-crossing | test: packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx#crosses the date to the right without changing content | BaseDatePlugin schema/spec, generic collapsed-delete owner/contract, two changesets | Exact red/green; shared-owner baseline; native 5 runs owned by root | Patch returned 160 passing affected tests, 79 successful typecheck tasks, fingerprints and code root cause | pass: one serialized implementation worker |
| comment-first-click | none: cannot reproduce | Read-only intake, then new comment.spec.tsx only | Full fixture, real components, native interaction sequence; no forced stale selection | 2 tests / 25 assertions; no product edits | pass: proof-only packet returned; repair not authorized by absent red |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| date-arrow-crossing | Browser native keys/clicks; localhost:3000/blocks/date-demo | 5 consecutive warm native runs | pass: 5/5 arrows both ways, typing/backspace restore, picker open, calendar ArrowRight, trigger toggle dismissal | 0 | completed locally |
| comment-first-click | Browser native highlighted text clicks; localhost:3000/blocks/discussion-demo | 5 reopen cycles per target; unfocused first-open separately | pass: linked and plain target 5/5 each; current-green component event trace starts BODY/null selection | 0 | needs-repro; supporting green is not a fix |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| date-arrow-crossing | package RED -> final 160 green; Date popup 5 green; native five runs | keep | completed locally on dirty:05d25a581b44c7aaa0f545f7cf36ec4a5b8e8533; uncommitted/unpushed | No release or public completion claim; Escape dismissal outside scope remains unchanged | user for commit/push if desired |
| comment-first-click | 2 exact component tests and existing 27 tests pass; Browser/Chrome first click green | blocked | needs-repro; keep added behavior coverage; no product repair claimed | Reporter interaction may depend on an unobserved page/profile/precondition | Regression when exact failing interaction is available |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| date-arrow-crossing | Navigation skip must preserve destructive-input atom law | no-change | Existing architecture trigger correctly routed generic delete ownership; behavior regression lives in existing delete-contract | Date + deletion + query + units 160/160 | pass: no reusable workflow owner gap proven |
| comment-first-click | Full reported highlighted phrase includes linked and plain leaves | no-change | Existing cumulative reporter rules retained full fixture and both targets; new component test | 2/2 exact current-green tests plus Browser/Chrome support | pass: no synthetic stale-selection reproduction or speculative fix |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| pnpm availability and direct CLI invocation | local tool environment | brief setup | pnpm shim unavailable and direct ultracite lacked child-binary PATH | Commands ran against local pinned dependencies | repaired: npx pnpm@9.15.0 exec |
| Browser route startup | local Next compile and browser bridge | 3-second selector/dispatch deadline | First command before page/automation ready | No product claim based on undelivered gesture | repaired: inspect DOM readiness and current state |
| Exploratory Escape oracle | Regression probe scope | one failed exploration | Dismissal expectation exceeded Date issue acceptance | Identified pre-existing close guard; no timing patch | defer: separate Date Escape investigation if requested |

Findings:

- #5125: Date inherited selectable:true, so arrows stopped in its hidden child. Declare selectable:false.
- Generic collapsed deletion assumed a skipped boundary consumed a character. Inspect the adjacent atom before applying text-boundary expansion.
- #5126: all current probes open the correct discussion on the first click. No production repair is justified without a red reproduction.

Timeline:

- Live issue intake, cumulative evidence, requirement checkpoint, and semantic preflight preceded product work.
- Date package/native RED; single Patch delegation; architecture review; generic deletion RED; final green.
- Fresh final dev server; five Date native runs; component and Chrome comment probes; final receipts and report.

Decisions and tradeoffs:

- Preserve the existing DateKit API and generic atom deletion law. Avoid Date-specific input handlers.
- Keep #5126 proof additions without claiming the report resolved.
- No commit, push, PR, public comment, labels, or issue closure under this invocation.

Review fixes:

- Manual current-diff review found no blocking issue in the bounded changed owners.
- Autoreview is prohibited by repository instructions on next. Agent-native review is N/A because no agent workflow was changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Expected Date and generic delete reds | initial TDD | Fix owning schema and deletion range | pass: 160 final tests |
| Harness/command readiness errors | resolved | Correct origin/provider, pnpm exec, explicit file receipt inputs, exact Bun path | pass: exact gates rerun |
| Date Escape exploratory close | 1 | Retain scope boundary; use reported picker-open acceptance and toggle for cleanup | defer: no Escape fix claim |

Verification evidence:

- Date affected corpus: 160/160; Date picker component: 5/5; comment corpus: 29/29.
- Scoped package typechecks: 79 successful tasks; scoped format/lint: pass; git diff --check: pass.
- Date native proof: five consecutive retry-free runs; Backspace/Delete preserve adjacent text and undo restores Date.
- Comment: current-green native first-open and five reopen cycles on each leaf; Chrome full editor/homepage first-open also green.
- Logs: /tmp/plate-5125-receipt-final.log, /tmp/plate-5125-typecheck.log, /tmp/plate-5125-picker-component.log, /tmp/plate-5126-final-corpus.log, /tmp/plate-regression-final-lint.log.
- Native observations/screenshots: tmp/regression/5125-5126/native-proof.txt, date-arrow-after.png, comment-first-click.jpg. Date caret is visibly after Date; DOM selection and editor focus reasserted after capture. Comment correct discussion remains visible after capture.

Final handoff:

- executable cases: Date locally completed; comment needs-repro.
- cumulative reporter evidence: both Date directions and complete highlighted comment phrase retained; latest next-branch reply applied.
- failed-fix invalidation: none; all Date reds preceded a candidate claim. Exploratory Escape is explicitly outside the repair claim.
- receipts: generated final Date package receipt above; native proof is separately scoped.
- changed files: Date schema/spec, generic collapsed deletion/contract, two changesets, comment component spec, this plan.
- tests: 194 passing targeted tests; 79 typecheck tasks; scoped lint; native five-run checks.
- sync: no generated registry runtime source, package barrel, template, or agent-source changes.
- reviews: manual source review; no accepted P1 finding; autoreview prohibited on next.
- residual risk: #5126 failing reporter precondition remains unknown; Date Escape dismissal not repaired.
- local/public boundary: all code remains local and uncommitted; no public issue completion or shipped claim.
- next owner: Regression for a reproducible #5126 gesture; user can test local dev server already running.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Local Date repair verified; comment investigation needs-repro |
| Where am I going? | Await evidence that distinguishes failing reporter comment interaction from current green next |
| What is the goal? | Resolve #5125 and #5126 with exact reporter-valid proof |
| What have I learned? | Date navigation required generic deletion preservation; comment first click currently works |
| What have I done? | Two owning Date fixes, durable tests, fresh Browser/Chrome checks, five-run native proof, generated receipt |

Open risks:

- #5126 is unreproduced; full-run completion and all-selected-cases checks must remain unresolved.
- Date Escape dismissal is a separate existing behavior observed during exploration; only arrow crossing and picker interaction are repaired/proved.
- No pushed-ref, integration, release, or public status proof exists.

Current intake evidence:
- Date baseline: 17 pass, 0 fail. Existing tests enforce superseded Date child stop; reporter expressly requests skipping it.
- Native Browser reproduction: from Try selecting text offset 14, one ArrowRight lands inside Date zero-width child, not following text.
- #5126 tracker transcript cache reused verbatim and normalized in memory to <video-transcripts>; no new transcript/public comment needed.

Date architecture decision (Best API review + Plite Plan boundary):
- Strongest justified cut: do not add Date-specific key/delete handlers, a skip option, or a second navigation policy. Reuse the existing schema selectable flag and canonical collapsed-delete owner.
- Ideal caller stays DateKit; the Date descriptor declares selectable:false. No consumer API or serialized value changes.
- Evidence: selection.move and mounted caret traversal use selectable. keyboardSelectable is not the inline-text traversal owner. Current getCollapsedDeleteTarget assumes a traversed boundary means another character must be consumed; that is false when a nonselectable inline void was crossed.
- Hard law from existing Date deleteBackward/deleteForward tests: a single character delete adjacent to a void removes that atom while preserving neighboring text. Selecting/crossing policy cannot widen destructive input.
- Chosen boundary: Plate Date owns whether arrows enter Date. Plite transforms-text/delete-text.ts owns the generic single-character deletion range; repair adjacent nonselectable inline-void handling there.
- Alternatives rejected: keyboardSelectable-only cannot change current inline traversal; Date delete overrides would compensate substrate; a new public option duplicates existing policy.
- Plite Plan execution slice: baseline existing delete-contract first, add exact generic inline-void deletion red in that owner, preserve isolation/roots/void semantics, patch collapsed deletion, rerun complete affected Date+delete corpus. Browser final replay includes Date crossing, deletion, picker, and subsequent input.
- Scale gate N/A: no cache, scheduler, registry, subscription, per-node fanout, or new runtime layer. This corrects the range chosen by an existing input command.
- API repair N/A: no API noun/signature/serialized contract is added or reinterpreted; existing single-atom deletion correctness is restored under a supported schema configuration.
- Implementation is authorized by the user's regression repair scope; no separate approval is needed for the owning fix necessary to preserve required adjacent behavior.

Final validation status:

- Regression semantic --complete: intentionally incomplete for comment-first-click. Date proof/receipt checks pass; comment has no red, completion receipt, or completed repair corpus. Current-green support rows remain labeled support-only.
- Autogoal structural check: incomplete because seven universal full-run Work Checklist items remain unchecked for #5126. No complete goal or run claim is made.
- Validator logs: /tmp/plate-regression-plan-complete.log and /tmp/plate-regression-structural-complete.log.

Sync checkpoint:

- The user subsequently requested syncing this work to next. Commit and push to origin/next are authorized for the verified eight-file packet.
- Before sync, local next and origin/next both point to 05d25a581b44c7aaa0f545f7cf36ec4a5b8e8533. All Date product/test fingerprints and the comment test fingerprint still match the passing verification.
- Earlier local/uncommitted statements describe the verification snapshot. The final sync response records the resulting pushed commit after remote readback.
- Sync does not change #5126 needs-repro status or authorize public issue comments, labels, closure, or a release.
