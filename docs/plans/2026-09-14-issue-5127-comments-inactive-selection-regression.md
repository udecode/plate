# Issue 5127 comments inactive selection regression

## Historical record notice — 2026-09-18

This file preserves the September 14 investigation and its original evidence.
The behavior results, running hosts, proof fingerprints, blockers and authority
statements below describe that run; they have not been revalidated against
`8748befe14`, the September 18 checkout. This follow-up commits the Regression
workflow changes and this record only. It does not certify or close Issue #5127.
The current Regression script suites pass all 118 tests, including 83 validator
tests. `pnpm install --frozen-lockfile` regenerated the skill mirrors; the
changed resource mirrors match their sources and `git diff --check` passes.
Agent Native Reviewer checked the existing validator route and source ownership.
Autoreview is not run on `next`. No product browser replay, push or public issue
update is part of this follow-up.

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
Fix Issue #5127 so a multi-line selected range remains visibly painted while
the Comments composer owns focus, with a red/green exact-route test, five
retry-free Chrome runs, and a final proof receipt.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-14-issue-5127-comments-inactive-selection-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:

- target bug / surface / corpus: GitHub Issue #5127, Comments new-comment
  composer inactive-selection paint on `/blocks/discussion-proof`
- lane and current source owner: copied Plate Discussion UI in
  `apps/www/src/registry/components/editor/discussion.tsx`; Plite inactive
  selection is the existing lower-level contract
- selected executable test cases:
  `issue-5127:comment-composer-selection-paint`
- tested ref or dirty-state boundary: `dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0`;
  the pre-existing task-local instrumentation fingerprint for
  `discussion-proof.tsx` is
  `533958fb4c1926d4e06d2a4e8f7b6017b1cf38f745fbc59277a6571b460110df`
- route / proof host and freshness method: `exact-route:
  /blocks/discussion-proof`; fresh `pnpm --filter www dev --port 3297`, PID/cwd
  read-back, HTTP 200, and exact Chrome 152 replay
- invocation mode / timebox: explicit `$regression` one-shot repair; no timebox

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
- Every reporter-named route uses one literal `exact-route:` in the selected
  environment and Proof-host readiness row. Final proof names the route and a
  receipt input contains it as the executable navigation target; proxy routes
  cannot certify it.
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
- Render-count, rerender, and profiler-event cases declare every measured event
  emitter/router/filter/aggregator/render owner as `measurement-owner-inputs:`;
  completion records `measurement-owner-closure: pass`, and one final receipt
  includes every named path.
- All canonical Work Checklist and Completion Gates rows resolve and
  both semantic validation and `check-complete.mjs` pass.

Verification surface:

- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-09-14-issue-5127-comments-inactive-selection-regression.md --complete`
- Task-owned review when explicitly requested or closing a PR
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-14-issue-5127-comments-inactive-selection-regression.md`

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

- allowed source owners: copied Discussion positioning/selection presentation;
  move to `plitejs/react` only if an exact lower-level red proves the substrate
  contract wrong
- allowed proof/test owners: existing
  `apps/www/tests/browser/comment.spec.ts`, adjacent Discussion/Plite inactive
  selection tests, Regression receipt inputs, and this transient plan
- generated/source boundary: edit registry source only; on `next`, regenerate
  current registry output only if registry generation reports it required;
  never hand-edit generated files
- browser/device claim width: exact Chrome 152 on macOS 15.7.3, desktop route,
  multi-line expanded selection, native shortcut, settled composer focus,
  actual pixel classification, popup geometry, and follow-up input
- forbidden product/API/release/public mutations: no public API redesign,
  package migration, commit, push, PR, issue comment, close, completed label,
  release, or template edits
- orchestration mode and writer ownership: root Regression is the single plan,
  test, host, and decision writer; one serialized Patch worker may edit only
  the normalized case after red proof; no parallel writers

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

- current phase: failed-fix interrupt after reporter contradiction
- current executable case: `issue-5127:comment-composer-selection-paint`
- current case status: needs-repro; prior completion and receipt invalidated by reporter focus contradiction
- next owner: Regression reporter-path recovery
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
| Prompt requirements captured | yes | User authorized local Regression repair of Issue #5127; no Git publication authority. Screenshot, issue acceptance, AI Menu comparison, exact route, temporary Console cleanup, test-first proof, stability, and receipt are captured. |
| Regression methodology loaded | yes | Full `.agents/skills/regression/references/methodology.md`, Regression template, Patch method, Task workflow, and Autogoal method read before product work. |
| Task plan reused; standing Autogoal request or explicit opt-out resolved | yes | Native goal created for this run; this is its only plan. |
| Current source owner and tested ref recorded | yes | Discussion virtual anchor at `discussion.tsx:620-753`; base ref `5a899edc`; dirty route instrumentation fingerprint recorded above. |
| Executable test cases discovered | yes | Existing `comment.spec.ts` owns exact Comments route/browser behavior; lower unit tests prove marker/focus mechanics but cannot prove layout pixels. |
| Cumulative reporter evidence resolved | yes | Issue #5127 body and screenshot plus reporter follow-up “AI Menu has this function, Comments popover does not” retained below. |
| Reporter oracle matrix resolved | yes | One phase-specific case covers model, DOM/native, focus, popup, geometry/paint, runtime errors, and follow-up input; pointer/subscription are N/A with reasons. |
| Regression semantic validator ready | yes | `.agents/skills/regression/scripts/validate-regression-plan.mjs` selected for this plan. |
| Route/proof-host readiness plan recorded | yes | Fresh source-built port 3297 host, literal exact route, PID/cwd/HTTP checks, exact Chrome executable, and fresh page required. |
| Patch delegation boundary recorded | yes | Patch may edit Discussion virtual-anchor selection and its exact browser test only after RED; no API/substrate/public mutation without escalation. |
| Orchestrator writer ownership recorded | yes | Single root writer; one serialized Patch child only after RED. |
| Output budget strategy recorded | yes | Exact files/greps/tests only; exclude generated/build/log trees and cap outputs. |
| Claim width and blocked rules recorded | yes | Claim is local uncommitted/unpushed exact-route Chrome behavior; block only on unavailable exact paint/host or unresolved positive authority. |

Work Checklist:

- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Every reporter-named route binds one literal `exact-route:` across the
      selected environment and Proof-host readiness row. Final proof names that
      route, a receipt input contains it as executable navigation, and a
      route-based reporter contradiction records
      `exact-route-reproduction: red` or `pass` before product work resumes.
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
- [x] A physical pointer path appears in setup only when the case's source,
      action, or outcome claims that path. Setup-only selection uses the
      smallest deterministic browser setup such as `locator.selectText()` or
      native-keyboard selection, asserts the seeded state, and does not widen
      the result. Reporter-identified pointer paths still use physical proof.
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
- [x] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
- [x] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [x] Output budget discipline was followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: one case completed with RED/GREEN, three entry paths, 15/15 stability, affected corpus, registry output, and attempt-2 receipt |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: `discussion.tsx` owner on dirty base `5a899edc`; final receipt fingerprints 24 inputs |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: PID 81004 cwd `apps/www`, port 3297, HTTP 200, Chrome 152, fresh route and final receipt |
| Exact reporter route | yes | Bind reporter route through selected environment, proof host, final command, and executable receipt input; reject proxy routes | pass: literal `/blocks/discussion-proof` in case, host, test `openDemo`, and receipt input |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: `comment.spec.ts#Issue 5127...`; RED 6633 pixels; GREEN exact Chrome |
| E2E escalation closure | yes | Record why no owner-level exact RED exists | pass: `e2e-required` because jsdom owner tests cannot prove Base UI geometry or pixels; no extra test layer added |
| Cumulative reporter evidence closure | yes | Map every base acceptance and reporter delta | pass: issue body, screenshot, AI Menu comparison, and latest auto-focus contradiction map to phase-specific executable oracles |
| Reporter oracle closure | yes | Resolve all observation rows | pass: model, DOM/native, focus, popup, geometry/pixels, runtime errors, and follow-up pass; pointer/subscription have N/A reasons |
| Failed-fix interrupt closure | yes | Revoke attempt 1 and repair Regression before attempt 2 | pass: reporter contradiction invalidated attempt 1; named entry-path enforcement added and 150 workflow tests passed |
| Architecture pressure closure | yes | Reclassify after the first failed claimed fix | pass: no product architecture trigger; current focus behavior is green, so attempt 2 changed proof rather than adding timing machinery |
| Proof receipt closure | yes | Validate final receipt against unchanged issue-owned inputs | pass: attempt-2 receipt `sha256:e141d0aff14ee504919e9fc3ed2498573244322cbf2d72eb2b5028dc42bd1c06`, 24 inputs, zero retries |
| Measurement-owner closure | no | N/A: no rerender, profiler, or performance claim | N/A: correctness/paint only |
| Affected-corpus replay closure | yes | Replay all cases after last shared-owner edit | pass: full Comments `28 passed, 2 skipped`; app units 11; Plite owner 28; final receipt repeats full corpus |
| Shared-style consumer closure | no | N/A: no shared CSS selector, marker, class map, or style expansion changed | N/A: only virtual anchor client-rect choice changed |
| Started-gate failure closure | yes | Rerun every started failed gate | pass: corrected Plite test path; warmed cold playground route; same full corpus and receipt passed |
| Smallest-probe closure | yes | Record first falsifying probe and host repair | pass: lower unit green established E2E need; exact pixel RED 6633; one trailing-space oracle correction recorded |
| Patch delegation closure | yes | Read back one-case evidence | pass: one serialized Patch worker returned owner, root cause, one-line fix, exact GREEN, lint/unit proof, and fingerprints |
| Focused verification closure | yes | Run owner test and exact final replay | pass: exact Chrome focused test, Computer Use reporter-profile replay, and owner unit tests |
| Stability closure | yes | Record retry-free warm runs | pass: all three entry paths passed five times, 15/15 exact Chrome rows, zero retries |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block case | pass: keep |
| Local completion status | yes | Mark local state and publication boundary | pass: completed locally; uncommitted/unpushed; public issue remains open |
| No duplicate registry | yes | Prove no behavior sidecar was created | pass: permanent authority is the browser test; plan is transient; no TSV/JSON behavior registry created |
| Generated/source and host repair | yes | Generate owned registry/changelog outputs and resolve host drift | pass: changelog write/check, `build:registry`, warm host rerun, generated `public/r/discussion.json` bound in receipt |
| Orchestrator writer closure | yes | Prove serialized ownership | pass: root owned plan/test/host; exactly one Patch worker edited product; root resumed after final return |
| Workflow slowdown closure | yes | Resolve avoidable cold-host failure | pass: classified 10.7-minute cold route, warmed it to 340ms, restarted full command on frozen bytes |
| Methodology delta closure | yes | Resolve per-case delta | pass: repair-now; Regression now rejects named popup entry paths missing from executable settled-focus proof |
| Source/generated sync | yes | Resolve applicable source generation | pass: Registry Changelog source plus JSON generated/checked; `build:registry` passed; `pnpm install` synced changed agent rules and skill mirrors |
| Agent-native review | yes | Review the changed Regression workflow route | pass: source owner, discoverability, mirror sync, executable validator test, and proof path all passed |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: Final handoff section completed below |
| Autoreview | no | N/A: no explicit review/PR closure and branch is `next` | N/A: Task policy forbids Autoreview on `next` |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-09-14-issue-5127-comments-inactive-selection-regression.md --complete` | pass: Regression plan semantically complete |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-14-issue-5127-comments-inactive-selection-regression.md` | pass: generic checker completed after semantic validation |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | complete | Native goal plus Regression plan with source obligations | source/host readiness |
| Current source and proof-host readiness | complete | fresh PID 81004 cwd `apps/www`, HTTP 200 exact route, Chrome 152 | discover executable cases |
| Executable case discovery and selection | complete | E2E required; lower DOM tests cannot prove pixels | smallest probe |
| Cumulative reporter evidence inventory | complete | Issue, screenshot, AI Menu comparison, and auto-focus contradiction mapped | reporter oracle expansion |
| Reporter oracle expansion | complete | all observations phase-specific with N/A reasons | semantic validation |
| Pre-implementation semantic validation | complete | `validate-regression-plan.mjs` structurally valid | smallest probe |
| Smallest high-value probe | complete | lower tests green; exact pixel test chosen | reproduce/classify |
| Reproduce, classify, and red test | complete | exact Chrome RED: 6633 pixel difference after controls pass | patch delegation |
| One-case Patch delegation | complete | one-line `findLast` fix; test unchanged; Patch evidence accepted | verification |
| Focused verification and stability | complete | all three paths GREEN; 15/15; Computer Use; units/lint | packet decision |
| Keep/revert/quarantine | complete | keep on durable copied Discussion owner | methodology delta |
| Methodology repair/no-change/defer | complete | repair-now; named entry paths enforced by validator and 150 workflow tests | next case or closure |
| Reviews and final handoff | complete | Agent Native Reviewer pass; Autoreview N/A on next; registry output complete | goal-plan check |
| Final goal-plan check | complete | semantic and generic plan validators pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| issue-5127:comment-composer-selection-paint | GitHub #5127, both 2026-09-14 CleanShot reporter videos, and latest focus contradiction | `exact-route: /blocks/discussion-proof`; physically triple-click the second block, physically double-click `from`, physically click the selection-toolbar Comment control, then send native `2` without waiting for focus | The selected word stays visibly painted and the first native key lands in New comment immediately, matching the reporter's Ask AI baseline | reporter: `CleanShot 2026-09-14 at 17.12.21.mp4` failure versus `17.13.24.mp4` Ask AI baseline; existing-contract: NewComment `autoFocus` and Editable inactive-selection lifecycle | unit-red: `packages/plitejs/test/react/editable-behavior.tsx#commits autoFocus before the first native key targets the previous surface`; unit-red: `packages/plitejs/test/dom/dom-coverage.ts#settles focus and native selection without stealing it or reviving a replaced root` | exact-chrome: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` 152.0.7977.84; entry-paths: fixed-toolbar + selection-toolbar + shortcut; runtime-modes: Plite `Editable autoFocus` mounted, Comments new-comment composer active, Suggestions installed but inactive, history enabled, primary writable, reviewer read-only, static snapshot mounted; focus-lifecycle-modes: writable-mount + transient-read-only + read-only-transition + remount; fixture-scope: complete Plite editor/Editable plus layout-phase focus probe, clear-before/after DOM focus fixture, and complete discussion-proof initial value/initialThreads for final native replay; exact-route: /blocks/discussion-proof; reporter-profile: Chrome 152 Feng profile with installed extension state; tool-proof: computer-use; physical-hit-path: second block -> word `from` -> selection-toolbar Comment; first-key-boundary: trigger-release -> native-key without focus wait | focused Plite React and DOM tests plus native Computer Use exact-profile replay | completed | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | local handoff; publication not authorized |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| issue-5127:comment-composer-selection-paint | base-acceptance | GitHub #5127 body and screenshot | setup | A multi-line source range is selected in the primary Comments editor. | required | model@setup, dom-native@setup, geometry-paint@setup | test: apps/www/tests/browser/comment.spec.ts#Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus | pass: exact Chrome creates and verifies the cross-block source selection before composer focus |
| issue-5127:comment-composer-selection-paint | base-acceptance | GitHub #5127 body and screenshot | after-action | New comment composer opens and owns focus while the complete selected source remains clearly visible. | required | focus@after-action, popup@after-action, geometry-paint@after-action | test: apps/www/tests/browser/comment.spec.ts#Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus | pass: final pixel/layout oracle and Computer Use screenshot show the popup below the complete visible selection |
| issue-5127:comment-composer-selection-paint | reporter-delta | User follow-up: AI Menu has this function, Comments popover does not | after-action | Comments uses the same inactive-selection experience as AI Menu. | required | dom-native@after-action, geometry-paint@after-action | test: apps/www/tests/browser/comment.spec.ts#Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus | pass: Comments now preserves the visible inactive selection while its nested composer owns focus |
| issue-5127:comment-composer-selection-paint | latest-reporter-delta | User follow-up: the popover input currently does not receive focus automatically | after-action | The fixed-toolbar, selection-toolbar, and shortcut entry paths must each move focus into New comment and retain it through a no-click follow-up key. | superseded: exact reporter video establishes the physical word-selection starting state and immediate first-key boundary | N/A: replaced by later exact video delta | N/A: replaced by later exact video delta | N/A: narrower automated setup invalidated by exact reporter video |
| issue-5127:comment-composer-selection-paint | latest-reporter-delta | `CleanShot 2026-09-14 at 17.12.21.mp4` failure video | after-action | initial-focus: primary source editor with native word `from` selected; physical-hit-path: second block -> word `from` -> selection-toolbar Comment; first native key immediately after trigger release must land without waiting for focus; after the popup appears, native key `2` is shown but the composer stays empty | required | dom-native@after-action, focus@after-action, popup@after-action, follow-up-input@follow-up | test: packages/plitejs/test/react/editable-behavior.tsx#commits autoFocus before the first native key targets the previous surface | pass: final macOS Chrome native-app replay follows the same physical selection/control path 5/5; each first key appears in New comment with no composer click |
| issue-5127:comment-composer-selection-paint | expected-reference | `CleanShot 2026-09-14 at 17.13.24.mp4` Ask AI baseline | after-action | The same selection-toolbar workflow opens Ask AI, retains the selected `comments` paint, and immediately accepts repeated native `2` keys without a refocus click. | required | dom-native@after-action, focus@after-action, popup@after-action, geometry-paint@after-action, follow-up-input@follow-up | test: packages/plitejs/test/react/editable-behavior.tsx#commits autoFocus before the first native key targets the previous surface | pass: helper transcript and inspected frames show `222222` in Ask AI while the original selected word remains visibly painted |

Reporter oracle matrix:

For an effect-owned disposable source, the `subscription-lifecycle` row records
`strict-effect: mount + cleanup + remount` and closes with `mount: pass`,
`cleanup: pass`, `remount: pass`, and `post-remount-publication: pass`.

For render-count, rerender, or profiler-event proof, the applicable oracle's
positive assertion records `measurement-owner-inputs: <comma-separated paths>`.
Its result records `measurement-owner-closure: pass`; one completed receipt
must contain every named path.

| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| issue-5127:comment-composer-selection-paint | model | setup | yes | Canonical primary selection equals the reporter-selected word `from`; the source document value is recorded. | Selection is collapsed, targets another word/editor, or setup mutates the document. | exact Chrome native selection plus browser harness model read on exact route | test: packages/plitejs/test/react/editable-behavior.tsx#commits autoFocus before the first native key targets the previous surface | pass: reporter video and native replay bind the selected word; prior cross-block model setup remains support-only |
| issue-5127:comment-composer-selection-paint | model | after-action | yes | Comments new-comment range equals the setup range and the primary document value is unchanged by opening the composer. | Comment range diverges, selection changes ownership, or source content mutates. | exact-chrome browser harness model read on exact route | test: apps/www/tests/browser/comment.spec.ts#Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus | pass: source model value is identical after open, nested input, Escape, and follow-up navigation |
| issue-5127:comment-composer-selection-paint | dom-native | setup | yes | physical-hit-target: second-block `from`; triple-click block then double-click `from` produces the exact native selected word in the primary Editable. | Empty, collapsed, cross-block, different-word, programmatically seeded, or wrong-editor selection. | macOS Chrome native-app physical pointer plus exact-route DOM/native reread | test: packages/plitejs/test/react/editable-behavior.tsx#commits autoFocus before the first native key targets the previous surface | pass: native replay matched the two physical selection gestures and selected `from` |
| issue-5127:comment-composer-selection-paint | dom-native | after-action | yes | Inactive-selection spans cover the exact selected word while New comment is under `data-plite-keep-selection-visible`; first-key-caret: popup-input; first-key-caret-competitors: clear-before-focus + clear-after-focus; event-order: pointerdown -> mousedown -> click; physical-hit-target: selection-toolbar Comment; runtime-owner: primary Discussion route; mutation-owner: Comments begin; capture-routing-path: primary Editable blur -> document focus coordinator -> marked Discussion composer; interaction-owner-chain: primary Editable -> portaled popover -> marked form -> nested comment Editable; capture-routing-contract: content/form markers; reporter-profile-replay: Computer Use + exact Chrome. | Missing/partial spans, native caret outside the popup input, post-focus selection clear survives settle, wrong editor ownership, unmarked focus path, reordered/missing native click events, or native selection as the only paint. | exact-chrome browser DOM/native trace plus native-app key boundary | test: packages/plitejs/test/dom/dom-coverage.ts#settles focus and native selection without stealing it or reviving a replaced root | pass: first-key-caret: pass; clear-before-focus: pass; clear-after-focus: pass; event-order: pass; physical-hit-target: pass; click-delivery: pass; runtime-owner: pass; mutation-owner: pass; interaction-owner-chain: pass; capture-routing-contract: pass; reporter-profile-replay: pass |
| issue-5127:comment-composer-selection-paint | pointer-feedback | during-action | yes | reporter-noun: Comment control; affordance-inventory: fixed-toolbar Comment and selection-toolbar Comment; the physical pointer targets the visible selection-toolbar Comment control. | A hidden/different control receives the click or the visible control does not dispatch Comments begin. | exact-chrome browser native-app physical pointer trace | test: apps/www/tests/browser/comment.spec.ts#Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus | pass: interaction-trace: pass; target: selection-toolbar Comment; event: click; buttons: 0; popup opens from that click |
| issue-5127:comment-composer-selection-paint | focus | after-action | yes | initial-focus: primary source editor with native word `from` selected; selection-origin: physical-pointer; entry-paths: fixed-toolbar + selection-toolbar + shortcut; focus-stability: settled + follow-up-key; first-key-before-focus-wait: required; focus-lifecycle-modes: writable-mount + transient-read-only + read-only-transition + remount; trigger-path: pre-focused-surface + native-keyboard for shortcut; focus-transfer: direct-related-target + null-related-target -> focusin; reporter-profile-replay required. | The first native key arrives while focus still belongs to the primary editor/page, transient read-only readiness consumes autofocus, autofocus mutates a read-only view, a remount lacks its own focus, or any named entry loses settled focus. | exact-chrome browser-native Computer Use trace plus Plite layout-phase owner test and Comments edit lifecycle E2E | test: apps/www/tests/browser/comment.spec.ts#Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus | pass: initial-focus: pass; selection-origin: pass; settled-focus: pass; follow-up-key: pass; first-key-routing: pass; writable-mount: pass; transient-read-only: pass; read-only-transition: pass; remount: pass; native-trigger-key: pass; direct-related-target: pass; null-related-target: pass; focusin-resolution: pass; reporter-profile-replay: pass; entry-path-coverage: pass; entry-path:fixed-toolbar: pass; entry-path:selection-toolbar: pass; entry-path:shortcut: pass |
| issue-5127:comment-composer-selection-paint | focus | follow-up | yes | Without click/refocus, the New comment editor retains focus for a native follow-up key; focus-transfer: direct-related-target + null-related-target -> focusin. | Follow-up key targets the primary editor, page, or nowhere. | exact-chrome browser native keyboard trace | test: apps/www/tests/browser/comment.spec.ts#Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus | pass: direct-related-target: pass; null-related-target: pass; focusin-resolution: pass; native `x` lands once in New comment without refocus |
| issue-5127:comment-composer-selection-paint | popup | after-action | yes | first-click-popup: open; exactly one positioned New comment popup opens below the final selected client rect with the full selected interval unobscured. | First toolbar click does not open the popup, or popup is absent, duplicated, unpositioned, or intersecting selected interval. | exact-chrome browser layout-bounds and screenshot | test: apps/www/tests/browser/comment.spec.ts#Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus | pass: first-click-popup: pass; one popup is below the final selected rect and inside the viewport in automated and Computer Use replay |
| issue-5127:comment-composer-selection-paint | geometry-paint | setup | yes | The selected client-rect union and viewport bounds are captured before popup open as reference-geometry. | Empty or out-of-viewport reference interval. | exact-chrome browser layout-bounds and pixel screenshot | test: apps/www/tests/browser/comment.spec.ts#Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus | pass: nonempty multi-block reference geometry captured; positive-control: pass; negative-control: pass; duplicate-control: pass through the same selected clip |
| issue-5127:comment-composer-selection-paint | geometry-paint | after-action | yes | reference-geometry: popup top is at least the final selected client rect bottom plus side offset and remains inside viewport lower/upper bounds; screenshot clip over selection matches one visible inactive-selection layer; identical-path single, absent, duplicate controls classify. | Any selected rect intersects/vanishes behind popup; absent/duplicate selection layer; popup outside viewport. | exact-chrome browser pixel screenshot decoder/classifier plus layout-bounds and post-capture reassertion | test: apps/www/tests/browser/comment.spec.ts#Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus | pass: positive-control: pass; negative-control: pass; duplicate-control: pass; layout-bounds: pass; actual equals one-layer control; post-capture state reasserted |
| issue-5127:comment-composer-selection-paint | subscription-lifecycle | after-action | no | N/A: fix must not change keyed Comments subscriptions or membership. | N/A: no subscription owner change authorized. | N/A: existing Comments corpus only if Patch widens owner. | N/A: no new subscription test. | N/A: not applicable unless owner changes. |
| issue-5127:comment-composer-selection-paint | runtime-errors | after-action | yes | No page error, relevant console error, React overlay, or duplicate-key warning. | Any runtime error or error overlay. | exact-chrome browser runtime-error recorder | test: apps/www/tests/browser/comment.spec.ts#Issue 5127 keeps a multi-line selection visibly painted while the comment composer owns focus | pass: no relevant runtime errors in exact case, stability, full corpus, or Computer Use replay |
| issue-5127:comment-composer-selection-paint | follow-up-input | follow-up | yes | first-key-target: popup-input; native `2` immediately after trigger release inserts once without a focus wait, then later input and Escape remain usable without document mutation. | First key lost/duplicated/routed to the primary editor or page, popup stuck, source document changes, or focus unusable after close. | Plite layout-phase owner test plus macOS Chrome native-app key and model/DOM reread | test: packages/plitejs/test/react/editable-behavior.tsx#commits autoFocus before the first native key targets the previous surface | pass: first-key-input: pass; native first key lands once in New comment 5/5; delayed input, Escape, primary focus restoration, and unchanged source model pass in exact Chrome corpus |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| issue-5127:comment-composer-selection-paint | 7 | completed | "sh" "-c" "pnpm --filter plitejs test -- test/dom/dom-coverage.test.ts && pnpm --filter plitejs test -- test/react/editable-behavior.test.tsx && pnpm --filter plitejs typecheck:partition:react && pnpm --filter plitejs typecheck:partition:dom && EXACT_ROUTE=/blocks/discussion-proof PLAYWRIGHT_BASE_URL=http://localhost:3297 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm --filter www test:www-browser:chromium tests/browser/comment.spec.ts --workers=1" | pass: exit 0 in 82699ms | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | sha256:d2c72c954ace8ea6f1972f3999cc5d88703cbd466c706decc3ab4811cce4fbbf | 29 | .changeset/plite-autofocus-caret.md,apps/www/playwright.config.ts,apps/www/public/r/discussion.json,apps/www/src/app/(blocks)/blocks/discussion-proof/discussion-proof.tsx,apps/www/src/app/(blocks)/blocks/discussion-proof/page.tsx,apps/www/src/components/site-registry/floating-popover.tsx,apps/www/src/registry/bases/base/floating-popover.tsx,apps/www/src/registry/bases/radix/floating-popover.tsx,apps/www/src/registry/changelog/2026-09-14-fix-comments-selection-visibility.json,apps/www/src/registry/changelog/components.json,apps/www/src/registry/changelog/entries/2026-09-14-fix-comments-selection-visibility.mdx,apps/www/src/registry/changelog/index.json,apps/www/src/registry/components/editor/comment-toolbar-button.tsx,apps/www/src/registry/components/editor/comment.tsx,apps/www/src/registry/components/editor/discussion.tsx,apps/www/src/registry/components/editor/editor.tsx,apps/www/src/registry/components/editor/fixed-toolbar.tsx,apps/www/src/registry/components/editor/floating-toolbar.tsx,apps/www/tests/browser/comment.spec.ts,apps/www/tsconfig.json,packages/plitejs/package.json,packages/plitejs/src/dom/plugin/dom-editor.ts,packages/plitejs/src/react/editable/runtime-root-engine.ts,packages/plitejs/src/react/inactive-selection.ts,packages/plitejs/test/dom/dom-coverage.test.ts,packages/plitejs/test/dom/dom-coverage.ts,packages/plitejs/test/react/editable-behavior.test.tsx,packages/plitejs/test/react/editable-behavior.tsx,packages/plitejs/vitest.config.mjs | pid:40032;started:2026-09-14T10:45:09.000Z;base-url:http://localhost:3297;browser:exact-chrome: Google Chrome 152.0.7977.84;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 152.0.7977.84 | 2026-09-14T10:44:20.163Z | 2026-09-14T10:53:54.166Z | 2026-09-14T10:55:16.865Z | 0 | sha256:ae79853fcb6e1f4fbca9d90c88321a0fa1034203ee51cc95198fcf8ee9fe8ed2 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite `Editable autoFocus` and `DOMEditor.focus` | issue-5127:comment-composer-selection-paint | red: activeElement/caret timing, read-only transition, and clear-after-focus owner tests reproduced the failed candidates | 2026-09-14T18:44:20+08:00 | combined receipt runs full DOM and Editable suites, React/DOM partition typechecks, and full exact-route Comments corpus | sha256:d2c72c954ace8ea6f1972f3999cc5d88703cbd466c706decc3ab4811cce4fbbf | pass: DOM coverage 30, Editable behavior 30, both source partitions typecheck |
| Comments exact route and copied UI | issue-5127:comment-composer-selection-paint | red: reporter native first key lost; attempt-4 read-only edit crashed; attempt-5 stability lost caret | 2026-09-14T18:44:20+08:00 | same combined exact Chrome receipt runs all 30 `comment.spec.ts` rows on fresh source host | sha256:d2c72c954ace8ea6f1972f3999cc5d88703cbd466c706decc3ab4811cce4fbbf | pass: 28 passed, 2 intentional main-baseline skips; native macOS reporter path 5/5; no click inside composer |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Plite editable behavior focused test path | `test/react/editable-behavior.tsx` matched no test files | proof-command error, not product | reran canonical `test/react/editable-behavior.test.tsx` | pass: 1 file, 28 tests |
| Full Comments corpus first final run | `/blocks/playground-demo` first render exceeded the 45s test timeout; server completed after 10.7 minutes while the failure snapshot contained the target heading | proof-host cold-route compile/render failure before the route assertion, not an Issue #5127 product failure | froze product bytes; warmed exact route; verified subsequent HTTP 200 in 340ms; restarted the full command without code changes | pass: same full command = 26 passed, 2 skipped; final receipt rerun also 26 passed, 2 skipped |
| Attempt-4 full Comments corpus | `Cannot update a read-only editor view` while saving an edited reply; focused rerun reproduced | product final-verification failure in autofocus lifecycle | automatic Regression repair plus mount-owned/read-only-safe autofocus | pass: exact focused row and final full receipt; edited reply succeeds, 28 passed / 2 skipped |
| `pnpm check:plite:dev` | existing `plitejs/authored` and `EditorDocumentRange` public-contract export drift fails entrypoint typecheck before affected tests | unrelated current-checkout contract drift, not caused by autofocus files | focused React partition typecheck is the owning type gate; broad checkout gate remains independently red | red: exact rerun remains blocked by unrelated authored-contract work |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| issue-5127:comment-composer-selection-paint | 1 | Reporter says the Comments input still does not auto-focus after local completion was claimed. | reporter-contradiction | yes: prior completed claim and receipt invalidated | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator reject multiple named entry paths when only one executes | pass: 150 workflow tests; new named-entry test red before validator repair and green after; source/mirrors synced | no: first failed fix and no architecture trigger | N/A: no second failure or cross-layer trigger | reproduced: exact Chrome fixed-toolbar, selection-toolbar, and shortcut paths reconstructed; exact-route-reproduction: pass; selection-transition-trace: native + model + view + next-input; first-divergence: prior permanent test omitted toolbar entry boundaries, not product focus |
| issue-5127:comment-composer-selection-paint | 2 | Reporter videos show the physical macOS selection-toolbar click loses the first native key even though locator/CDP proof passed. | reporter-contradiction | yes: attempt-2 completion and receipt invalidated | repair-now: `.agents/rules/regression.mdc`, methodology, template, validator, and validator test require the trigger-release-to-first-key boundary before any focus wait | pass: red-first validator test; 151 workflow tests; `pnpm install`; exact source/mirror parity | yes: second-failed-fix | best-api: accepted existing `Editable autoFocus` contract with no new API; plite-plan: move its focus write from passive effect to layout commit; Plate copied UI keeps no compensating timer/ref API | reproduced: exact-route-reproduction: red; selection-transition-trace: native + model + view + next-input; focus-owner-trace: mount + positioned + settled + follow-up-key; native-focus-events: focusin + focusout capture; first-divergence: native key arrives before the passive effect-owned focus; focus-call-trace: target + connected + display + visibility + disabled + active-after-call; focus-call-result: called too late/then owns focus; focus-scheduler-trace: request + cancel + run; focus-scheduler-result: passive effect ran after first native key/target ready |
| issue-5127:comment-composer-selection-paint | 3 | Attempt-3 layout-effect candidate makes New comment the DOM activeElement, but native `2` is still lost until the user clicks inside the nested Editable. | final-verification | yes: attempt-3 candidate-local claim invalidated before any receipt | repair-now: `.agents/rules/regression.mdc`, methodology, template, validator, and validator test now require `first-key-caret: popup-input`; activeElement-only proof is rejected | pass: validator test red before repair and green after; 151 workflow tests; `pnpm install`; source/mirror parity | yes: prior second-failed-fix escalation remains active | best-api: keep `Editable autoFocus`, but route it through canonical `editor.api.dom.focus()` rather than raw `HTMLElement.focus()`; plite-plan: layout commit must establish both activeElement and native caret/selection | reproduced: diagnostic: unchanged candidate bytes keep activeElement on New comment while native selection/caret is absent; exact-route-reproduction: red; selection-transition-trace: native + model + view + next-input; focus-owner-trace: mount + positioned + settled + follow-up-key; native-focus-events: focusin + focusout capture; first-divergence: layout commit/raw focus leaves DOM selection outside nested Editable; focus-call-trace: target + connected + display + visibility + disabled + active-after-call; focus-call-result: raw focus called/activeElement correct/caret missing; focus-scheduler-trace: request + cancel + run; focus-scheduler-result: layout effect ran/target ready/caret absent |
| issue-5127:comment-composer-selection-paint | 4 | Attempt-4 semantic focus passes native first-key 5/5 but deterministically crashes while editing a reply because autofocus reruns on a read-only CommentInput view. | final-verification | yes: attempt-4 candidate-local claim invalidated before receipt | repair-now: `.agents/rules/regression.mdc`, methodology, template, validator, and validator test require `focus-lifecycle-modes: writable-mount + read-only-transition + remount` | pass: validator test red before repair and green after; 151 workflow tests; `pnpm install`; source/mirror parity | yes: prior escalation remains active | best-api: autoFocus is one mount-owned request; plite-plan: writable mount uses canonical semantic focus, read-only mount uses raw focus, later view/readOnly rerenders do not replay it | reproduced: diagnostic: unchanged candidate bytes throw `Cannot update a read-only editor view` from `editor.api.dom.focus()` during CommentInput edit save; exact-route-reproduction: red; selection-transition-trace: native + model + view + next-input; focus-owner-trace: mount + positioned + settled + follow-up-key; native-focus-events: focusin + focusout capture; first-divergence: read-only CommentInput rerender re-enters semantic autofocus; focus-call-trace: target + connected + display + visibility + disabled + active-after-call; focus-call-result: called on read-only view/throws; focus-scheduler-trace: request + cancel + run; focus-scheduler-result: layout effect reran on view identity change/read-only target |
| issue-5127:comment-composer-selection-paint | 5 | Attempt-5 mount-only candidate passes owner/corpus checks but exact native stability run 1 loses the key with activeElement correct and rangeCount zero. | final-verification | yes: attempt-5 candidate-local claim invalidated before receipt | repair-now: `.agents/rules/regression.mdc`, methodology, template, validator, and validator test require clear-before-focus plus clear-after-focus caret competitors | pass: validator test red before repair and green after; 151 workflow tests; `pnpm install`; source/mirror parity | yes: prior escalation remains active | best-api: keep canonical DOM focus and repair its settle path; plite-plan: an owned active root resynchronizes its canonical model selection after a competing post-focus clear | reproduced: diagnostic: unchanged candidate bytes show activeElement New comment, `window.getSelection().rangeCount=0`, and lost native key; exact-route-reproduction: red; selection-transition-trace: native + model + view + next-input; focus-owner-trace: mount + positioned + settled + follow-up-key; native-focus-events: focusin + focusout capture; first-divergence: `settleFocus` returns on active root before restoring caret; focus-call-trace: target + connected + display + visibility + disabled + active-after-call; focus-call-result: active root/caret missing; focus-scheduler-trace: request + cancel + run; focus-scheduler-result: settle runs but skips selection sync |
| issue-5127:comment-composer-selection-paint | 6 | Attempt-6 settle candidate still loses native input because New comment's initial transient read-only view consumes mount-owned autofocus before writable readiness. | final-verification | yes: attempt-6 candidate-local claim invalidated before receipt | repair-now: `.agents/rules/regression.mdc`, methodology, template, validator, and validator test add `transient-read-only` lifecycle coverage | pass: exact autofocus logs; validator test red before repair and green after; 151 workflow tests; `pnpm install`; source/mirror parity | yes: prior escalation remains active | best-api: distinguish explicit read-only mount from transient writable readiness without new API; plite-plan: do not consume autofocus until the intended writable view is ready | reproduced: diagnostic: unchanged candidate logs show `{autoFocus:true,didAutoFocus:false,hasRoot:true,readOnly:true}` followed by `{autoFocus:true,didAutoFocus:true,readOnly:false}`; exact-route-reproduction: red; selection-transition-trace: native + model + view + next-input; focus-owner-trace: mount + positioned + settled + follow-up-key; native-focus-events: focusin + focusout capture; first-divergence: transient read-only layout effect consumes autofocus; focus-call-trace: target + connected + display + visibility + disabled + active-after-call; focus-call-result: raw focus on transient view/no caret; focus-scheduler-trace: request + cancel + run; focus-scheduler-result: later writable layout run skipped by mount guard |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| issue-5127:comment-composer-selection-paint | 6 | second-failed-fix, timer-focus-correctness | escalate | required: best-api keeps existing mount-only `Editable autoFocus` and canonical DOM focus; distinguish explicit read-only from transient writable readiness internally; add no caller API or workaround | plite-plan: accepted Plite React waits through transient read-only readiness, then performs semantic focus once; explicit read-only mount raw-focuses; DOM settle resync remains | pass: exact runtime logs prove the transient state transition; existing owner/corpus tests retain read-only and settle laws |

Best API / Plite Plan decision:

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
|---------|---------|--------|-------|--------|----------|-------|------|---------|
| `Editable autoFocus` | Attempt 3 moves raw `rootRef.current.focus()` to layout phase, so activeElement changes but the nested Editable still has no native caret/selection | Keep the same prop and call canonical `editor.api.dom.focus()` from the existing isomorphic layout-effect phase | Plite React `runtime-root-engine.ts` plus DOM editor focus owner | Printable native input needs both activeElement and a DOM selection inside the contenteditable; the canonical operation already owns selection creation, focus state, DOM projection, and settle repair | No call-site, Plate API, registry, docs, or serialized-data change | owner unit RED distinguishes activeElement from caret; exact macOS Chrome shows manual click supplies the missing caret | canonical focus schedules its existing settle repairs; prove first key before waits, no focus theft, Strict Mode, and follow-up input | rearchitect |
| Comments focus compensation | `NewComment` passes `autoFocus`; `DiscussionPopover` prevents generic popover initial focus | Add nothing | Plate copied Discussion UI | Feature-specific timer/ref focus would duplicate the substrate contract and still race another entry path | Keep current call site; no new registry dependency or public noun | source audit and final Comments browser corpus | none beyond substrate adoption | cut |
| Inactive selection paint | Plite derives paint from focus moving into `data-plite-keep-selection-visible`; Plate supplies marker/style | Keep the existing owner split | Plite React mechanics + Plate copied UI policy | Reporter wants the same selection preservation shown by AI; current DOM protocol already expresses it | Reuse existing marker and overlay; no Range copy or editor-global state | exact pixel/selection oracle plus native first-key replay | focus phase must not clear or duplicate paint | keep |
| DOM focus settle | Canonical focus schedules settle callbacks but returns immediately when the owned root is already active, even if a competing owner cleared its DOM selection | Resync the canonical model selection to DOM before returning for an active owned root | Plite DOM `DOMEditor.focus` | `activeElement` and native caret are separate browser facts; printable input needs both | No public API or scheduler change; every existing caller benefits | focused DOM clear-after-focus RED/GREEN, full DOM coverage, native 5x, Comments corpus | must not steal focus from another element or revive a replaced root | rearchitect |

Execution slices:

1. Keep the exact native physical video replay and focused Plite RED that asserts both layout-phase activeElement and native caret/selection before passive effects.
2. Keep autofocus mount-owned and read-only-safe; writable mounts call canonical `editor.api.dom.focus()`.
3. Repair canonical `DOMEditor.focus` settle so an already-active owned root restores a caret cleared after focus without stealing another target or reviving a replaced root.
4. Run focused Plite tests, exact Comments browser proof, five retry-free native-risk runs, full affected corpus, registry/package gates if their source changed, and final macOS Chrome native-app replay.

Scale applicability: N/A. The target keeps one existing `focus()` per opted-in
mount and only changes its React phase; it adds no scheduler, subscription,
store, cache, geometry work, or repeated-unit fan-out.

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| issue-5127:comment-composer-selection-paint | `discussion.tsx`; Plite inactive-selection runtime; exact proof route and browser test | fresh `pnpm --filter www dev --port 3297`; `exact-route: /blocks/discussion-proof`; exact Chrome command with literal base URL | stopped prior server; final PID 81004 cwd `apps/www`; ready output; HTTP 200; Chrome 152; source and generated registry fingerprints bound by final receipt | registry source plus `public/r/discussion.json` and registry changelog outputs are authoritative and generated through owned commands | pass: fresh-host exact route, registry generation, Computer Use, and final receipt observe current bytes |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| issue-5127:comment-composer-selection-paint | red: exact Chrome pixel oracle reports 6633 changed pixels; lower DOM/package tests green and cannot express layout paint | `apps/www/src/registry/components/editor/discussion.tsx` and exact test only; no FloatingPopover or Plite edit | same red/green exact Chrome command; pixel controls; popup bounds; settled focus/follow-up; five retry-free warm runs; affected existing comment tests | returned root cause, durable owner, one source edit, exact GREEN, fingerprints, architecture verdict patch, registry changelog instead of changeset, review N/A on next | pass: Patch candidate accepted and independently replayed by Regression |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| issue-5127:comment-composer-selection-paint | exact Chrome 152, fresh source-mapped port 3297, Feng native app path plus exact browser corpus | five retry-free native reporter runs after final product edit; three automated entry paths retained | pass: native physical `from` -> Comment -> first digit 5/5 with no composer click; automated fixed-toolbar, selection-toolbar, shortcut and pixel controls pass in final receipt | 0 | keep |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| issue-5127:comment-composer-selection-paint | attempt-7 package/browser receipts plus final native Chrome 5/5 cover caret, first key, inactive paint, popup placement, read-only edit, and all three entry paths | keep | completed locally for the two reporter videos and named creation entry paths | broad checkout `check:plite:dev` remains red on unrelated authored-contract drift; no integrated/pushed claim | local handoff; publication not authorized |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| issue-5127:comment-composer-selection-paint | Prior completion missed entry-path breadth, pre-key focus waits, caret ownership, read-only/remount lifecycle, post-focus clears, and transient read-only readiness | repair-now | `.agents/rules/regression.mdc`, methodology, plan template, validator, and validator tests require all named entry paths, first-key boundary/target/caret, clear-before/after competitors, and full focus lifecycle modes | pass: red-first workflow tests; 151 tests after each repair; `pnpm install`; sync-resources check; source/mirror parity; Agent Native Reviewer pass | trigger: reporter contradictions and failed final replays; result: validator mechanically rejects each false-green packet class |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| First full final Comments corpus | Next dev proof host | 10.7-minute cold render versus 45-second test timeout | first request compiled/rendered `/blocks/playground-demo`; subsequent request 340ms; no product-byte relation | failure snapshot already contained target heading after timeout; other 25 tests and Issue #5127 passed | no-change to product; warm exact route and restart full count; same command and final receipt passed |

Findings:

- The old general CursorOverlay plugin is gone, but Plite `Editable` owns native
  inactive-selection paint through `data-plite-keep-selection-visible`.
- Both AI Menu and Discussion mark their focused popup descendants. Live Chrome
  shows two inactive-selection spans with brand/25 background while New comment
  owns focus, so marker/state existence is not the visual oracle.
- Discussion's virtual anchor returned the first non-empty DOM client rect. For
  a multi-line or cross-block selection, bottom placement therefore covered
  later selected lines. Returning the last visible client rect is the proved
  durable fix for the copied Discussion UI.

Timeline:

- 2026-09-14: Issue #5127 published with screenshot and exact local route.
- 2026-09-14: Live Chrome reproduced the new-comment composer with inactive spans
  present; source comparison narrowed the likely owner to Discussion virtual
  anchor geometry.
- 2026-09-14: Regression goal and this plan created; no product fix attempted.
- 2026-09-14: Exact Chrome test reached valid RED after one trailing-space
  oracle correction: pixel controls passed and actual differed from one-layer
  paint by 6633 pixels.
- 2026-09-14: One Patch worker changed `find` to `findLast`; same test GREEN.
- 2026-09-14: Exact Chrome stability 5/5; full corpus 26 passed / 2 skipped;
  app owner tests 11 passed; Plite focus owner 28 passed.
- 2026-09-14: Computer Use replay in Chrome Feng profile showed the popup below
  the complete selected interval, stable nested input, and correct Escape
  return.
- 2026-09-14: Registry changelog generated/checked, registry build passed, and
  final 21-input receipt completed.
- 2026-09-14: Reporter contradiction invalidated attempt 1 because the permanent
  test covered only the shortcut despite toolbar parity being claimed.
- 2026-09-14: Regression was repaired to enforce every named popup entry path;
  150 workflow tests, source/skill mirror checks, and Agent Native review passed.
- 2026-09-14: Attempt 2 proved fixed toolbar, selection toolbar, and shortcut:
  15/15 stability, 28/2 full Comments corpus, and a 24-input final receipt.

Decisions and tradeoffs:

- Preserve Plite's existing inactive-selection lifecycle unless a lower-level
  RED disproves it; the current evidence points to copied Discussion placement.
- Use the existing Comments browser suite as durable coverage because jsdom
  cannot prove Base UI geometry or painted pixels.
- Keep the shortcut path native and the selection setup deterministic; the
  reporter did not claim a pointer gesture.

Review fixes:

- N/A: no explicit review or PR closure; Autoreview is forbidden on `next`.
- Root inspection accepted the Patch worker's one-line owner change without
  widening into FloatingPopover, Plite, public API, or timing machinery.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First test run stopped on trailing whitespace normalization before the reporter assertion. | 1 | Normalize the exact rendered inactive text, then rerun unchanged product bytes. | Valid RED reached the pixel classifier: 6633 changed pixels. |
| Plite focused test path omitted `.test`. | 1 | Discover the canonical wrapper and rerun it. | `editable-behavior.test.tsx`: 28 passed. |
| First full final corpus timed out on cold `/blocks/playground-demo`. | 1 | Freeze product, inspect server/failure snapshot, warm route, restart full command. | 10.7-minute first render classified as proof-host failure; warm route 340ms; full rerun and receipt passed. |
| Direct `www` typecheck from the prior temporary instrumentation task failed before this Regression run on unrelated missing generated/schema exports and `_examples/authored-changes`. | 2 | Do not use those failures as behavior evidence; record and rerun any started gate on final bytes only if this run starts it. | Prior-task evidence only; not yet a Regression gate. |

Verification evidence:

- Both reporter videos were transcribed and inspected frame-by-frame. The
  failure loses native numeric input; the Ask AI reference accepts `222222`
  while preserving the selected word.
- Exact macOS Chrome native-app reproduction matched the physical reporter
  path: triple-click block, double-click `from`, click selection-toolbar
  Comment, then type without clicking the composer.
- Final native replay passed 5/5: the first digit landed once in New comment and
  the selected `from` overlay remained visible.
- Plite owner proof: DOM coverage 30 passed; Editable behavior 30 passed;
  React and DOM source partitions typecheck; targeted Ultracite passed.
- Exact Chrome Comments corpus: 28 passed, 2 intentional main-baseline skips,
  including the read-only edit lifecycle that failed attempt 4.
- Regression workflow proof: 151 tests; source/generated mirrors exact;
  Agent Native Reviewer pass.
- Final combined receipt:
  `sha256:ae79853fcb6e1f4fbca9d90c88321a0fa1034203ee51cc95198fcf8ee9fe8ed2`,
  input digest `sha256:d2c72c954ace8ea6f1972f3999cc5d88703cbd466c706decc3ab4811cce4fbbf`,
  29 inputs, exact Chrome 152, fresh source host PID 40032, zero retries.

Final handoff:

- candidate behavior: exact reporter path, AI Menu parity, all named entry paths,
  inactive paint, first-key caret/input, read-only edit, close, and follow-up
  input pass locally.
- durable owner: Plite `Editable autoFocus` waits through transient read-only
  readiness, runs once per mount, and uses canonical semantic focus; DOM focus
  settle restores a cleared caret while preserving external-focus ownership.
- package release note: `.changeset/plite-autofocus-caret.md` records the
  `plitejs` patch.
- Regression repaired every false-green class encountered: path breadth,
  pre-key waits, caret ownership, lifecycle modes, post-focus clears, and
  transient readiness.
- local closure remains open only because the started broad
  `pnpm check:plite:dev` gate is red on unrelated, pre-existing
  `plitejs/authored` / `EditorDocumentRange` contract drift. Focused owning
  partitions and all Issue #5127 behavior proof are green.
- no commit, push, PR, release, or public Issue update is authorized.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Issue #5127 behavior is green locally; Regression completion is held by one unrelated started broad gate |
| Where am I going? | user retest on the running final source host, then either accept scoped closure or repair the separate authored-contract owner |
| What is the goal? | match the Ask AI selection/focus/first-key behavior on the exact Comments path |
| What have I learned? | nested autofocus must distinguish transient view read-only readiness, establish a native caret, and survive post-focus selection clears without replaying during save |
| What have I done? | repaired Plite React and DOM focus owners, added owner tests and changeset, repaired Regression, and completed native 5/5 plus final combined receipt |

Open risks:

- `pnpm check:plite:dev` remains red on unrelated in-progress authored-contract
  files; Regression's started-gate law prevents a formal completed status.
- No commit, push, PR, or public Issue #5127 status update is authorized.
