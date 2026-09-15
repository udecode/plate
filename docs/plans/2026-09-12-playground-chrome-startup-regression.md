# Playground Chrome startup regression

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
Make the exact Playground route load and remain usable in user-selected Chrome with AIKit and SuggestionKit installed, then complete the human interaction and responsive coverage.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-12-playground-chrome-startup-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:

- target bug / surface / corpus: Playground startup with copied AIKit, SuggestionKit, DiscussionKit and the complete EditorKit
- lane and current source owner: Plate plugin portal schema exposure in `packages/platejs/src/lib/plugin/createPluginContext.internal.ts`
- selected executable test cases: `playground-dynamic-schema-portal`
- tested ref or dirty-state boundary: dirty `5a899edcbea2c31f1bd34dc575c9dd3860c577d0`
- route / proof host and freshness method: exact `http://localhost:3000/`; restart the source-built www host after product edits and attest the served source before Chrome replay
- invocation mode / timebox: one-shot execution requested by the user; finish the regression and bounded human Chrome matrix

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
- Every browser proof after product-source edits records
  `browser-source-attestation: <fresh host restart or served-input digest>` in
  Proof-host readiness before its behavior assertion. Browser-family changes
  repeat the attestation; an unexplained running server and unproved hot reload
  are invalid.
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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-09-12-playground-chrome-startup-regression.md --complete`
- Task-owned review when explicitly requested or closing a PR
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-12-playground-chrome-startup-regression.md`

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

- allowed source owners: `packages/platejs/src/lib/plugin/createPluginContext.internal.ts`; expand only if the executable RED proves a different canonical owner
- allowed proof/test owners: `packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx`, existing `BaseTablePlugin.spec.ts`, this plan, existing Show Me Your Work trail, and Chrome evidence directory
- generated/source boundary: edit `.agents/rules/**` and run `pnpm install` for generated `.agents/skills/**`; product generated registry output changes only if source requires regeneration
- browser/device claim width: exact installed Chrome on desktop plus responsive viewport emulation; no raw mobile-device claim
- forbidden product/API/release/public mutations: no public API expansion, commit, push, PR, release, deployment, or external AI submission
- orchestration mode and writer ownership: primary agent only; no subagents or parallel writers

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

- current phase: completed local verification
- current executable case: `playground-dynamic-schema-portal`
- current case status: completed
- next owner: none for the selected regression; separate owners retain unrelated checkout failures
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
| Prompt requirements captured | yes | Exact Chrome, human interaction coverage, before/after evidence, and breaking behavior are required. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely. |
| Task plan reused; standing Autogoal request or explicit opt-out resolved | yes | Native goal active; this Regression plan is the current execution record and links the owning feature plan. |
| Current source owner and tested ref recorded | yes | Plugin portal schema exposure and dirty base `5a899edcbea2c31f1bd34dc575c9dd3860c577d0`. |
| Executable test cases discovered | yes | Generic owner RED is `resolvePlugins.spec.tsx`; existing `BaseTablePlugin.spec.ts` reproduces the real consumer. |
| Cumulative reporter evidence resolved | yes | Original descriptor-identity startup report remains required; Chrome exposed the next eager-accessor failure during final verification. |
| Reporter oracle matrix resolved | yes | Startup model, mounted DOM, runtime-error and follow-up-input fields are applicable; unrelated pointer/focus/popup/paint/lifecycle fields are N/A for the atomic startup case. |
| Regression semantic validator ready | yes | Current validator and generated mirror pass 160 workflow tests after browser-source-attestation repair. |
| Route/proof-host readiness plan recorded | yes | Exact route `http://localhost:3000/`; source-built host restart plus Chrome reload required after product edits. |
| Patch delegation boundary recorded | yes | Plugin portal exposure and one owner test only; BaseTable remains unchanged consumer proof. |
| Orchestrator writer ownership recorded | yes | Primary agent is sole writer; no subagents. |
| Output budget strategy recorded | yes | Focused source, test and Chrome state only; capped logs. |
| Claim width and blocked rules recorded | yes | Complete reported composition surface in Chrome; no claim over every unrelated editor feature or raw device. |

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
- [x] Every browser proof after product-source edits records
      `browser-source-attestation: <fresh host restart or served-input digest>`
      in Proof-host readiness before behavior assertions. Browser-family
      changes repeat the attestation; unexplained running servers and unproved
      hot reload do not validate current bytes.
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
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Exact reporter route | yes | Bind reporter route through selected environment, proof host, final command, and executable receipt input; reject proxy routes | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| E2E escalation closure | yes | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all eight observations and every applicable interaction phase per case | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Measurement-owner closure | no | For render-count/rerender/profiler claims, bind every measured event emitter/router/filter/aggregator/render owner through `measurement-owner-inputs:` and one completed receipt | N/A: no measurement claim. |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Shared-style consumer closure | yes | Inventory every shared selector/class consumer and prove explicit paint neutralizers do not inherit or duplicate the shared surface | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Orchestrator writer closure | yes | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Agent-native review | yes | Run for changed agent workflows or record N/A | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Autoreview | no | Run Task-owned review when explicitly requested or closing a PR or record N/A | N/A: no PR closure or explicit code review requested. |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-09-12-playground-chrome-startup-regression.md --complete` | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-12-playground-chrome-startup-regression.md` | pass: selected-case evidence is recorded below and in `chrome-human-checks.md`. |
Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | complete | Native goal and this Regression plan created. | source/host readiness |
| Current source and proof-host readiness | complete | Exact Chrome loaded current route and captured deterministic `editor.plugin is not a function`; workflow now requires source attestation. | discover executable cases |
| Executable case discovery and selection | complete | A dynamic-schema dependency queried through `editor.extension` is the smallest owner case. | smallest probe |
| Cumulative reporter evidence inventory | complete | Original startup invariant plus final-verification failure retained. | reporter oracle expansion |
| Reporter oracle expansion | complete | Startup/runtime/follow-up rows below. | semantic validation |
| Pre-implementation semantic validation | complete | Structural validator passed before implementation. | smallest probe |
| Smallest high-value probe | complete | Generic callback-schema test and exact Chrome isolated the portal owner. | reproduce/classify |
| Reproduce, classify, and red test | complete | Package RED and Chrome stack agreed on schema portal failure. | patch delegation |
| One-case Patch delegation | complete | Primary agent repaired portal publication, aliases and derived-view adaptation. | verification |
| Focused verification and stability | complete | 376 tests plus five clean-host reloads passed. | packet decision |
| Keep/revert/quarantine | complete | Kept the fixes; they resolve package and human Chrome evidence. | methodology delta |
| Methodology repair/no-change/defer | complete | Added browser source attestation to Regression. | next case or closure |
| Reviews and final handoff | complete | Evidence, failures and decision trail recorded. | goal-plan check |
| Final goal-plan check | complete | Semantic and Autogoal validators pass. | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| playground-dynamic-schema-portal | User report and exact Chrome `http://localhost:3000/blocks/playground` final verification | Resolve a plugin that reads a required dependency whose schema is declared by a callback without an explicit type, then load the complete Playground route | `editor.extension(Dependency).schema.type` resolves the canonical default type during authoring; Playground mounts without a runtime overlay and accepts follow-up input | reporter: Playground must load; accepted-product-law: `editor.extension` is the current descriptor-aware lookup across resolution and runtime | unit-red: `packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx#exposes required dependency schema identity while author callbacks resolve` | exact-chrome: user-selected installed Chrome; exact-route: http://localhost:3000/blocks/playground; runtime-modes: full EditorKit plus AIKit, SuggestionKit, DiscussionKit and CommentsPlugin active; fixture-scope: complete Playground value and plugin composition | `bun test packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx --test-name-pattern 'exposes required dependency schema identity while author callbacks resolve'` | completed | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | none |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| playground-dynamic-schema-portal | base-acceptance | User runtime report report | setup | The Playground starts with one authored descriptor identity and no initialization exception. | required | model@setup, dom-native@setup, runtime-errors@setup | test: packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx#exposes required dependency schema identity while author callbacks resolve | pass: the shared descriptor and portal fixes mount the exact route without an initialization exception. |
| playground-dynamic-schema-portal | final-verification | Chrome screenshot `execution/chrome-human/01-desktop-initial.png` and fresh www server output | setup | The source-attested exact route fails because the consumer portal omits `.schema` for BaseTableCellPlugin's callback declaration. | required | model@setup, dom-native@setup, runtime-errors@setup | test: packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx#exposes required dependency schema identity while author callbacks resolve | pass: shared authored identity and schema portal fixes mount the exact route; see `chrome-human-checks.md`. |
| playground-dynamic-schema-portal | user-follow-up | User request for human Chrome coverage | follow-up | After startup, ordinary edit, Suggestion mode, AI entry/dismissal, reload and responsive layouts remain usable. | required | follow-up-input@follow-up | test: packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx#exposes required dependency schema identity while author callbacks resolve | pass: editing, undo/redo, Suggestion, Viewing, AI menu, tablet and mobile checks completed in Chrome. |

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
| playground-dynamic-schema-portal | model | setup | yes | A plugin author callback resolves a callback-declared dependency schema and receives its canonical default element type. | The consumer portal omits `.schema` because the declaration is a function. | package unit | test: packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx#exposes required dependency schema identity while author callbacks resolve | pass: callback-declared dependency schema resolves as `schemaDependency`; 150 Plate integration tests pass. |
| playground-dynamic-schema-portal | dom-native | setup | yes | Exact Chrome mounts the complete Playground editor root after schema resolution; runtime-owner is the source-built Plate editor and mutation-owner is `resolvePluginWithConfigurations`. | Next runtime overlay replaces the editor root. | exact-chrome | test: packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx#exposes required dependency schema identity while author callbacks resolve | pass: fresh Chrome mounts the complete editor; runtime-owner: pass; mutation-owner: pass. |
| playground-dynamic-schema-portal | pointer-feedback | setup | no | N/A: startup resolution has no pointer action. | N/A: no pointer state belongs to this atomic case. | N/A: no pointer proof. | N/A: no pointer test. | N/A: not applicable. |
| playground-dynamic-schema-portal | focus | setup | no | N/A: startup success does not require a focused element. | N/A: no focus owner is asserted at load. | N/A: no focus proof. | N/A: no focus test. | N/A: not applicable. |
| playground-dynamic-schema-portal | popup | setup | no | N/A: AI popup behavior is a later human-coverage action, not startup resolution. | N/A: popup state cannot exist before the editor mounts. | N/A: no popup proof. | N/A: no popup test. | N/A: not applicable. |
| playground-dynamic-schema-portal | geometry-paint | setup | no | N/A: this atomic case requires mounted content, not a reference layout. | N/A: no exact geometry is part of the startup report. | N/A: no paint proof. | N/A: no paint test. | N/A: not applicable. |
| playground-dynamic-schema-portal | subscription-lifecycle | setup | no | N/A: schema portal exposure owns no subscription. | N/A: no lifecycle registration is changed. | N/A: no lifecycle proof. | N/A: no lifecycle test. | N/A: not applicable. |
| playground-dynamic-schema-portal | runtime-errors | setup | yes | Plugin resolution and exact route startup complete without a Next runtime dialog or console exception. | Undefined dynamic schema portal, stale `editor.plugin` crash, or duplicate authored descriptor error appears. | package unit plus exact-chrome | test: packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx#exposes required dependency schema identity while author callbacks resolve | pass: no application runtime exception or Next error overlay on five clean-host reloads. |
| playground-dynamic-schema-portal | follow-up-input | follow-up | yes | After mount, normal typing and Suggestion mode typing publish through the mounted runtime; runtime-owner: pass; mutation-owner: pass. | The editor remains absent, loses input, or throws after mode change. | exact-chrome | test: packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx#exposes required dependency schema identity while author callbacks resolve | pass: normal typing, proposal typing, undo/redo and readonly refusal all passed in installed Chrome. |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| playground-dynamic-schema-portal | 2 | completed | "env" "NODE_PATH=apps/www/node_modules" "node" "docs/plans/artifacts/native-authored-changes/execution/chrome-human/chrome-browser-proof.cjs" "--browser-executable" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "--base-url" "http://localhost:3000" "--exact-route" "http://localhost:3000/blocks/playground" | pass: exit 0 in 869ms | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | sha256:79f9cbe9fb986ebe46c29a2ae6879e114f8e66bc08a5d371fbee2bacb5b9e586 | 8 | apps/www/src/registry/components/editor/mode-toolbar-button.tsx,docs/plans/artifacts/native-authored-changes/execution/chrome-human/chrome-browser-proof.cjs,packages/platejs/src/internal/utils/mergePlugins.ts,packages/platejs/src/lib/editor/withPlite.ts,packages/platejs/src/lib/plugin/createPluginContext.internal.ts,packages/plitejs/src/authored/steps.ts,packages/plitejs/src/core/editor-extension.ts,packages/plitejs/src/react/hooks/use-plite-runtime.tsx | pid:42607;started:2026-09-12T12:57:17.000Z;base-url:http://localhost:3000;browser:exact-chrome:installed-profile;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 152.0.7977.83 | 2026-09-12T13:08:18.966Z | 2026-09-12T13:08:28.140Z | 2026-09-12T13:08:29.010Z | 0 | sha256:7a905875d4e7623fc9f3e3c5b2eee16520e1701ed0dd11789eab0c45ea187060 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plate/Plite extension publication and authored input | playground-dynamic-schema-portal | red: exact Chrome failed before mount and proposal typing produced 18 items | 2026-09-12T13:08:18.966Z | `bun test` selected 13 files plus clean-host Chrome replay | sha256:79f9cbe9fb986ebe46c29a2ae6879e114f8e66bc08a5d371fbee2bacb5b9e586 | pass: 376 selected tests plus five Chrome reloads and the generated exact-Chrome receipt |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| fresh-source browser proof | stale host and an overlapping file rename contaminated earlier server logs | proof-host contamination | restarted after the rename settled, then repeated the exact route five times | pass: no application runtime overlay on the clean host |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| playground-dynamic-schema-portal | 1 | Source-attested exact Chrome final verification fails at BaseTablePlugin because a callback-declared dependency portal has no `.schema`. | final-verification | yes: prior route-green claim and receipt revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template and validator require browser-source-attestation | pass: 160 Regression workflow tests and resource parity | yes: ui-repairs-substrate; fixing every converted caller would duplicate the same portal law | best-api: accepted `editor.extension` as the sole descriptor-aware lookup; plate-plan: repair dynamic schema exposure in the existing plugin portal owner | reproduced: generic owner and BaseTable consumer are RED; diagnostic: deterministic current-source portal classification after fresh host restart; exact-route-reproduction: red |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| playground-dynamic-schema-portal | 1 | ui-repairs-substrate | escalate | required: best-api keeps one `editor.extension` lookup and makes its existing schema portal truthful for static and callback declarations | plate-plan: change `createPluginAccess` exposure only; no caller-by-caller compatibility edits or new API | pass: generic owner, BaseTable consumer, derived-view identity tests and exact Chrome all pass. |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| playground-dynamic-schema-portal | `packages/platejs/src/lib/plugin/createPluginContext.internal.ts`; `packages/plitejs/src/core/editor-extension.ts` | generic package units and exact-route http://localhost:3000/blocks/playground on a source-built www host in user-selected Chrome | browser-source-attestation: clean `pnpm --filter www dev` restart after the concurrent `getCorePlugins.internal.ts` rename settled; input digest sha256:83306609a92c68c26bc87962a79194d3b23afcd7a77fe3f29f5a1ec5db27283e | package source is canonical; registry rebuilt; Turbopack output is disposable | pass: five settled reloads and the full human matrix completed without an application runtime overlay |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| playground-dynamic-schema-portal | `resolvePlugins.spec.tsx#exposes required dependency schema identity while author callbacks resolve` RED plus existing BaseTable consumer RED | `createPluginContext.internal.ts` and the generic owner test; no caller edits or new API | focused generic green, BaseTable consumer green, plugin-context suite, fresh Chrome route, five retry-free startup replays, human interaction matrix | root cause, changed files, exact RED/GREEN, source fingerprints, stability and residual limits | ready: exact RED captured |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| playground-dynamic-schema-portal | clean source-built Chrome host at exact route | 5 | pass: heading and mode control visible and no runtime-error overlay on all five settled reloads | 0 | keep: selected regression completed |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| playground-dynamic-schema-portal | Current-source Chrome proof and 376 focused tests | keep | exact startup, editing, authored-mode, derived-view, AI-menu and responsive behavior | wider checkout checks remain red outside this case | existing checkout owners |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| playground-dynamic-schema-portal | Missing browser source attestation | repair-now | `.agents/rules/regression.mdc`, its methodology, template and validator require a fresh host restart or served-input digest | pass: 80 focused workflow tests, generated-resource parity and source-attested Chrome replay | stale-host proof invalidated; durable check added |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Browser source verification | Regression workflow | one invalid proof cycle | Reused dev host served stale code; a later concurrent rename contaminated another restart. | High: clean source identity was required to trust the Chrome result. | Added mechanical browser source attestation, waited for filesystem stability, restarted cleanly and replayed five times. |

Findings:

- Closed P1: callback-declared dependency schemas were absent from the authoring portal; publication and derived-view adaptation now keep them reachable.
- Closed P1: mode UI observed document commits instead of authored view state.
- Closed P1: insertion-only proposal typing allocated one change per keystroke.

Timeline:

- 2026-09-12: Exact Chrome invalidated the prior in-app-browser green and captured the current TypeError.
- 2026-09-12: Regression repair added mechanical browser source attestation and passed 160 workflow tests plus resource parity.
- 2026-09-12: Chrome found and verified repairs for derived-view identity, stale mode state and per-keystroke proposal fragmentation.
- 2026-09-12: A clean final host restart passed five settled exact-route loads and the human interaction matrix.

Decisions and tradeoffs:

- Preserve strict duplicate-descriptor rejection; share the canonical authored descriptor instead.
- Publish one descriptor-aware portal and adapt it at the framework boundary.
- Subscribe view-only UI to view state.
- Group adjacent insertion-only proposal input under its existing authored owner.

Review fixes:

- Focused lint required JSDoc `@internal` tags on their own line; formatting and lint now pass.
- No P1 finding remains in the selected regression.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Stale server produced a false browser green | 1 | Restart and attest served source | Workflow repaired; current-source Chrome exposed the real portal failure. |
| Concurrent core-plugin file rename contaminated one restart | 1 | Wait for the rename to settle, restart again, and replay | Clean restart and five loads passed. |

Verification evidence:

- 221 Plite authored/extension tests pass.
- 150 Plate publication/schema/derived-view tests pass.
- 5 mode and suggestion UI tests pass.
- Six affected typecheck partitions and focused lint pass.
- Registry build passes.
- Exact installed Chrome passes editing, undo/redo, Suggestion grouping, Viewing refusal, AI menu, tablet, mobile and five clean-host reloads.
- Full receipts: `docs/plans/artifacts/native-authored-changes/execution/chrome-human/chrome-human-checks.md`.

Final handoff:

- executable cases: one selected startup and follow-up interaction case completed.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: all applicable rows completed; inapplicable rows record why.
- failed-fix invalidation and automatic repair: stale-host proof revoked; Regression requires browser source attestation.
- proof receipts and affected-corpus replay: current-source digest and 376-test replay recorded.
- started-gate failure closure: clean host passed five retry-free loads.
- changed files: Plate/Plite portal and alias owners, authored insertion grouping, mode toolbar subscription, focused tests, Regression workflow source and generated mirror.
- design decisions: retain strict duplicate detection; canonicalize aliases and adapt one portal at the framework boundary.
- tests and proof: focused tests, type partitions, lint, registry build and installed-Chrome human matrix passed.
- source/generated sync: `pnpm install` regenerated the Regression skill mirror; resource parity passes.
- P1 and agent-native findings: three P1 runtime/UX failures closed; no open agent-native finding in the changed workflow.
- residual risks and next owner: wider core-contract and AI lifecycle suites remain red in unrelated modified checkout files and stay with their existing owners.
- local completion status and integration/public-status boundary: complete locally; no commit, push, PR or publication was authorized.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | selected Playground Chrome regression is complete locally |
| Where am I going? | final evidence handoff; unrelated checkout failures stay with their existing owners |
| What is the goal? | make the exact Playground AI plus Suggestion composition load and remain usable in Chrome |
| What have I learned? | browser proof needs a fresh-source host; Plate descriptor families must remain canonical across author callbacks and derived views; view-only mode state needs a view-state subscription. |
| What have I done? | fixed descriptor publication, derived-view identity, mode updates and proposal typing grouping; completed the installed-Chrome matrix and preserved evidence |

Open risks:

- Chrome React DevTools causes a hydration warning on some reloads; the editor remains mounted and interactive.
- `check:plite:dev` remains red in the wider checkout because a type contract imports the pre-rename `getCorePlugins` path.
- `ai.lifecycle.spec.tsx` and `use-chat.lifecycle.spec.tsx` remain red for existing stream-close and missing-author test setup failures.
- External AI submission was not performed because it depends on credentials and a network service; menu entry and dismissal are proved.
