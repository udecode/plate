# Suggestion Grouping Regression

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
Make contiguous authored edits one review suggestion, define the merge/split law from `main` and Google Docs evidence, and prove the behavior with executable Plite contracts and the reported Playground route.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-14-suggestion-grouping-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:

- target bug / surface / corpus: two adjacent character deletions currently mint two pending authored change IDs, so the Playground discussion count shows 2 instead of 1; audit the full merge/split matrix around deletion, insertion, replacement, selection, author, gap, break, mark, paste, block, and history boundaries
- lane and current source owner: `next`; `packages/plitejs/src/authored/steps.ts` owns inferred edit identity, `packages/plitejs/src/authored/authored.ts` assigns the final change ID, and `packages/plitejs/test/authored-history-input-contract.test.ts` owns native-input grouping contracts
- selected executable test cases: SG-01 contiguous backward deletion, SG-02 contiguous forward deletion, SG-03 split and replacement boundaries
- tested ref or dirty-state boundary: `dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0`; preserve pre-existing checkout changes and record scoped final fingerprints
- route / proof host and freshness method: package proof imports source directly; a managed Plite browser run rebuilds and serves the canonical authored example from the final bytes; the reporter homepage at `http://localhost:3000/` is a support check because unrelated shared-checkout Yjs edits made its dev logs unreliable during this task
- invocation mode / timebox: one-shot local repair; package RED before production edits, then focused green, affected authored corpus, and five retry-free exact runs

First-checkpoint requirements:

- Two contiguous character deletions by the same author form one pending change ID, one discussion item, and one visible count.
- Cover both Backspace and Delete and keep the combined deleted text reviewable through one suggestion decision.
- Audit and record when suggestions merge or split across insertion, deletion, replacement, cursor/gap, selection, author, view, marks, breaks, blocks, paste, and history boundaries.
- Use `main` as historical implementation evidence and direct Google Docs Suggesting-mode probes as upstream product evidence; do not preserve known `main` inconsistencies without a current product law.
- Add the smallest owner-level executable coverage and avoid a duplicate E2E when the package test reproduces the violation exactly.
- Preserve unrelated checkout work; do not commit, push, release, publish, or mutate a public API.
- Final handoff names the root cause, behavior matrix, changed files, red/green/stability commands, exact route proof, and residual risks.

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-09-14-suggestion-grouping-regression.md --complete`
- Task-owned review when explicitly requested or closing a PR
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-14-suggestion-grouping-regression.md`

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

- allowed source owners: `packages/plitejs/src/authored/steps.ts` and, only if identity cannot be fixed there, the smallest authored runtime owner in `packages/plitejs/src/authored/authored.ts`
- allowed proof/test owners: `packages/plitejs/test/authored-history-input-contract.test.ts`, existing affected authored tests, `apps/www` reporter-route browser proof, and this transient plan
- generated/source boundary: package source is canonical; no generated registry edit is expected unless the final implementation touches registry source
- browser/device claim width: Chrome/Google Docs supplies comparison evidence; local completion claims only Plite package behavior plus the freshly served `exact-route: http://localhost:3000/`
- forbidden product/API/release/public mutations: no public API redesign, dependency change, template edit, commit, push, PR, release, or accept/reject action on the Google Docs baseline suggestion
- orchestration mode and writer ownership: root is the sole writer; read-only subagents audit `main` and `next`; all test/source/plan/host mutations are serialized at root

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
- current executable case: SG-01 through SG-03
- current case status: completed
- next owner: user review; no publication action authorized
- goal status: completed locally

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | First-checkpoint requirements preserve contiguous-delete count, coverage audit, `main`/Google Docs comparison, proof, and publication limits. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely before product mutation. |
| Task plan reused; standing Autogoal request or explicit opt-out resolved | yes | Native goal is active and this file is the single goal/regression plan. |
| Current source owner and tested ref recorded | yes | `steps.ts` identity inference, `authored.ts` fallback, history-input contract; `dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0`. |
| Executable test cases discovered | yes | SG-01 through SG-03 use the Plite native authored-input package runner. |
| Cumulative reporter evidence resolved | yes | Screenshot count 2, explicit contiguous requirement, `main` identity behavior, and direct Google Docs probes are mapped below. |
| Reporter oracle matrix resolved | yes | All required observations are resolved below; UI-only observations are N/A with concrete reasons because the owner-level RED is exact. |
| Regression semantic validator ready | yes | Selected-case, evidence, oracle, host, delegation, corpus, and methodology rows are populated for preimplementation validation. |
| Route/proof-host readiness plan recorded | yes | `exact-route: http://localhost:3000/`; unexplained ambient server is support-only and final proof requires fresh restart or digest. |
| Patch delegation boundary recorded | yes | One normalized owner repair after SG-01/SG-02 RED; only `steps.ts` or the smallest necessary authored runtime state plus the focused test file. |
| Orchestrator writer ownership recorded | yes | Root is sole writer; audit subagents are read-only. |
| Output budget strategy recorded | yes | Bounded source ranges, focused Bun test, scoped diffs, then one affected authored corpus replay. |
| Claim width and blocked rules recorded | yes | Local package plus freshly served reporter route only; no integration/release claim and blocking only for an unavailable exact owner or proof host. |

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
| Named completion threshold | yes | Close all selected grouping cases | pass: SG-01 through SG-03 are completed and kept |
| Current-source readiness | yes | Bind proof to final source inputs | pass: receipts bind the dirty HEAD and three final authored inputs |
| Route/proof-host readiness | yes | Rebuild the canonical browser example from final bytes | pass: managed Plite runner rebuilt 472 files and passed the Chromium case |
| Exact reporter route | no | The invariant is owned below the homepage composition | N/A: http://localhost:3000/ loaded the editor and existing suggestions, while final mutation proof uses the freshly built canonical authored example |
| Executable regression coverage | yes | Record RED and green tests | pass: original backward, forward and history cases failed 3 assertions; bridge case separately failed 3 versus 2; all pass after the owner repair |
| E2E escalation closure | yes | Keep package RED as the owner and one browser count assertion | pass: package tests own semantics; the browser test checks real Backspace routing and one list item |
| Cumulative reporter evidence closure | yes | Reconcile user, main, and Google Docs evidence | pass: evidence inventory records all applicable claims |
| Reporter oracle closure | yes | Resolve all nine observation classes | pass: applicable model, DOM, popup, error and follow-up rows pass; others have concrete N/A reasons |
| Failed-fix interrupt closure | no | No claimed fix failed | N/A: both failures were expected RED probes before a kept candidate |
| Architecture pressure closure | no | Escalate only for an architecture trigger or second failed fix | N/A: one bounded owner defect, no public API or new layer |
| Proof receipt closure | yes | Capture final source-bound receipts | pass: three completed receipts have current matching SHA-256 input digests |
| Measurement-owner closure | no | No render or profiler claim | N/A: this task counts authored identities, not render events |
| Affected-corpus replay closure | yes | Replay the full authored partition | pass: 360 tests across 19 files |
| Shared-style consumer closure | no | No CSS or style owner changed | N/A: source change is authored identity inference only |
| Started-gate failure closure | yes | Resolve and rerun started failures | pass: typecheck and managed browser build failures were repaired or cleared and reran green |
| Smallest-probe closure | yes | Prove the violation before the patch | pass: exact package RED returned two IDs for adjacent deletions |
| Patch delegation closure | yes | Keep mutation inside the inferred edit owner | pass: only authoredEditOwner changed in product source |
| Focused verification closure | yes | Rerun owner tests | pass: 31 tests across the two focused files |
| Stability closure | yes | Run five retry-free focused repetitions | pass: five of five runs returned 31 pass and 0 fail |
| Packet decision closure | yes | Keep or reject every selected case | pass: all three cases kept |
| Local completion status | yes | Record checkout and publication state | pass: local dirty HEAD tested; no commit, push, PR, release or publication performed |
| No duplicate registry | yes | Keep behavior authority in executable tests | pass: no sidecar registry or behavior database created |
| Generated/source and host repair | yes | Avoid generated source edits and attest browser bytes | pass: managed browser build consumed final source; no registry/template output changed by this task |
| Orchestrator writer closure | yes | Serialize mutable owners | pass: root was the sole writer for source, tests, plan and browser host |
| Workflow slowdown closure | yes | Record host and command detours | pass: wrong-root and unrelated Yjs failures are recorded below |
| Methodology delta closure | yes | Resolve each methodology row | pass: all cases are no-change for workflow method |
| Source/generated sync | no | No reusable agent source or registry source changed | N/A: install/regeneration is outside the changed inputs |
| Agent-native review | no | No agent workflow changed | N/A: product source and tests only |
| Final handoff contract | yes | Record behavior, proof, files and risks | pass: final handoff fields are complete below |
| Autoreview | no | No PR closure or explicit autoreview request | N/A: no publication action authorized |
| Regression semantic plan | yes | Run the complete validator | pass: complete validator executed after this table was finalized |
| Goal plan complete | yes | Run the Autogoal completion checker | pass: checker executed after this table was finalized |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | Goal and exact grouping request recorded | completed |
| Current source and proof-host readiness | completed | authoredEditOwner and canonical runner identified | completed |
| Executable case discovery and selection | completed | SG-01 through SG-03 selected | completed |
| Cumulative reporter evidence inventory | completed | User screenshot, main, current corpus and direct Google Docs probes reconciled | completed |
| Reporter oracle expansion | completed | Nine observation classes resolved per case | completed |
| Pre-implementation semantic validation | completed | Preimplementation validator passed before mutation | completed |
| Smallest high-value probe | completed | Adjacent delete owner returned two IDs | completed |
| Reproduce, classify, and red test | completed | Three initial RED failures plus one bridge RED | completed |
| One-case Patch delegation | completed | Bounded authoredEditOwner repair | completed |
| Focused verification and stability | completed | 31 focused tests, five repetitions | completed |
| Keep/revert/quarantine | completed | All cases kept | completed |
| Methodology repair/no-change/defer | completed | No workflow defect found | completed |
| Reviews and final handoff | completed | Changeset and handoff evidence recorded | completed |
| Final goal-plan check | completed | Semantic and Autogoal validators run | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| SG-01 | User screenshot and direct Google Docs Backspace probe | Proposed view over Base; issue two native Backspaces | Projected Ba, accepted Base, one same-author change at revision 2, one review item, atomic accept | reporter: two contiguous deletes have one count; upstream-contract: Google Docs emitted one deletion card | unit-red: packages/plitejs/test/authored-history-input-contract.test.ts | runtime-modes: propose/proposed and propose/markup with history; fixture-scope: complete Base | pnpm --filter plitejs exec bun test test/authored-history-input-contract.test.ts | completed | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | complete |
| SG-02 | Direct Google Docs forward Delete probe and main adjacent resolver | Proposed view over Base; issue two native forward Deletes | Projected se, accepted Base, one same-author change at revision 2 | upstream-contract: Google Docs emitted one deletion card and main reused an adjacent removal ID | unit-red: packages/plitejs/test/authored-history-input-contract.test.ts | runtime-modes: propose/proposed with history; fixture-scope: complete Base | pnpm --filter plitejs exec bun test test/authored-history-input-contract.test.ts | completed | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | complete |
| SG-03 | User grouping audit request, main, current authored corpus and Google Docs gap/bridge probes | Exercise range edges, history detour, gap, author switch, bridge, replacement, inline and paragraph boundaries | Compatible same-author adjacent edits share identity; gaps/authors split; deleting a bridge extends one established group and leaves two; own insertion deletion cancels | accepted-product-law: review identity follows compatible spatial continuity while established IDs stay stable | unit-red: packages/plitejs/test/authored-history-input-contract.test.ts | runtime-modes: proposed and markup projections, author switch, history, semantic commands; fixture-scope: complete focused fixtures | pnpm --filter plitejs exec bun test test/authored-history-input-contract.test.ts test/authored-command-lifecycle-contract.test.ts | completed | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | complete |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| SG-01 | base report | User text and attached screenshot | after-action | Two contiguous deletions display one count | required | model@after-action, dom-native@after-action, popup@after-action, runtime-errors@after-action | test: packages/plitejs/test/authored-history-input-contract.test.ts#groups contiguous backward deletions into one suggestion | pass: package contract and managed browser Backspace test both produce one identity/item |
| SG-01 | upstream behavior | Direct Google Docs Suggesting-mode probe on 2026-09-14 | after-action | Two Backspaces produce one deletion card | required | model@after-action, follow-up-input@follow-up | test: packages/plitejs/test/authored-history-input-contract.test.ts#groups contiguous backward deletions into one suggestion | pass: observed one card; scratch document restored to its one baseline suggestion |
| SG-02 | upstream behavior | Direct Google Docs forward-delete probe and main source audit | after-action | Two forward Deletes share a deletion card | required | model@after-action, runtime-errors@after-action | test: packages/plitejs/test/authored-history-input-contract.test.ts#groups contiguous forward deletions into one suggestion | pass: direct observation and final package contract agree |
| SG-03 | behavior audit | Direct Google Docs insertion, replacement, gap, history and bridge probes plus current corpus | after-action | Spatially compatible edits group; gaps/authors split; a bridge extends one side without minting a third or merging old IDs | required | model@after-action, follow-up-input@follow-up | test: packages/plitejs/test/authored-history-input-contract.test.ts#extends one adjacent deletion when removing the gap between two suggestions | pass: Google Docs and executable matrix agree; scratch document restored |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| SG-01 | model | after-action | yes | Ba projected, Base accepted, one revision-2 ID | two IDs or accepted mutation | package contract | test: packages/plitejs/test/authored-history-input-contract.test.ts#groups contiguous backward deletions into one suggestion | pass: exact RED is green and accept applies both deletions |
| SG-01 | dom-native | after-action | yes | Two real Backspaces route to one pending proposal | two proposal list rows or divergent model text | managed browser E2E | test: apps/plite/tests/plite-browser/authored-changes.spec.ts#groups contiguous browser Backspaces into one pending proposal | pass: one list row, expected block text and no runtime errors |
| SG-01 | pointer-feedback | during-action | no | N/A: keyboard-only grouping case | N/A: no pointer behavior claimed | N/A: no pointer owner | N/A: no pointer test | N/A: no pointer interaction |
| SG-01 | focus | after-action | no | N/A: no focus-transfer or caret-paint claim | N/A: focus is outside identity grouping | N/A: selection setup only | N/A: no focus test | N/A: no focus claim |
| SG-01 | popup | after-action | yes | The proposals list contains one row | two rows for the same contiguous deletion | managed browser E2E | test: apps/plite/tests/plite-browser/authored-changes.spec.ts#groups contiguous browser Backspaces into one pending proposal | pass: row count equals one |
| SG-01 | geometry-paint | after-action | no | N/A: no layout claim | N/A: geometry outside scope | N/A: no pixel proof | N/A: no geometry test | N/A: no geometry claim |
| SG-01 | subscription-lifecycle | after-action | no | N/A: no subscription owner changed | N/A: no listener lifecycle claim | N/A: authored transaction only | N/A: no lifecycle test | N/A: no lifecycle claim |
| SG-01 | runtime-errors | after-action | yes | Mutation, read and decision complete without error | stale identity or node-key exception | package and E2E | test: packages/plitejs/test/authored-history-input-contract.test.ts#groups contiguous backward deletions into one suggestion | pass: focused and browser error assertions are clean |
| SG-01 | follow-up-input | follow-up | yes | Undo/Redo preserves the ID and accepting it applies both deletions | stale owner or partial decision | package contract | test: packages/plitejs/test/authored-history-input-contract.test.ts#groups contiguous backward deletions into one suggestion | pass: undo, redo and accept assertions pass |
| SG-02 | model | after-action | yes | se projected, Base accepted, one revision-2 ID | two IDs or accepted mutation | package contract | test: packages/plitejs/test/authored-history-input-contract.test.ts#groups contiguous forward deletions into one suggestion | pass: exact contract passes |
| SG-02 | dom-native | after-action | no | N/A: forward direction is represented exactly by the public command contract | N/A: no extra DOM-specific invariant | N/A: package owner is sufficient | N/A: no DOM test | N/A: no DOM-only claim |
| SG-02 | pointer-feedback | during-action | no | N/A: keyboard-only grouping case | N/A: no pointer behavior claimed | N/A: no pointer owner | N/A: no pointer test | N/A: no pointer interaction |
| SG-02 | focus | after-action | no | N/A: no focus-transfer claim | N/A: focus outside scope | N/A: command selection only | N/A: no focus test | N/A: no focus claim |
| SG-02 | popup | after-action | no | N/A: popup mapping is ID based and proven by SG-01 | N/A: no direction-specific popup path | N/A: shared identity mapping | N/A: no duplicate popup test | N/A: shared UI mapping |
| SG-02 | geometry-paint | after-action | no | N/A: no layout claim | N/A: geometry outside scope | N/A: no pixel proof | N/A: no geometry test | N/A: no geometry claim |
| SG-02 | subscription-lifecycle | after-action | no | N/A: no subscription owner changed | N/A: no lifecycle claim | N/A: authored transaction only | N/A: no lifecycle test | N/A: no lifecycle claim |
| SG-02 | runtime-errors | after-action | yes | Forward deletes and change reads complete without error | stale identity or exception | package contract | test: packages/plitejs/test/authored-history-input-contract.test.ts#groups contiguous forward deletions into one suggestion | pass: focused contract clean |
| SG-02 | follow-up-input | follow-up | yes | The second delete amends the first ID | a second ID or unusable next delete | package contract | test: packages/plitejs/test/authored-history-input-contract.test.ts#groups contiguous forward deletions into one suggestion | pass: revision equals two |
| SG-03 | model | after-action | yes | Range edges and history detours group; gap/author split; bridge remains two IDs with revisions 1 and 2 | session-defined identity, gap merge or third bridge ID | package matrix | test: packages/plitejs/test/authored-history-input-contract.test.ts#extends one adjacent deletion when removing the gap between two suggestions | pass: all matrix assertions pass |
| SG-03 | dom-native | after-action | no | N/A: remaining matrix cases are canonical transaction semantics | N/A: no distinct DOM representation | N/A: package owner | N/A: browser duplication omitted | N/A: package proof is exact |
| SG-03 | pointer-feedback | during-action | no | N/A: no pointer affordance claim | N/A: pointer outside scope | N/A: no pointer owner | N/A: no pointer test | N/A: no pointer claim |
| SG-03 | focus | after-action | no | N/A: selection detours are setup, not focus behavior | N/A: no focus-transfer outcome | N/A: package selection | N/A: no focus test | N/A: no focus claim |
| SG-03 | popup | after-action | no | N/A: established ID preservation is asserted directly | N/A: no unique popup path beyond SG-01 | N/A: ID-to-list mapping shared | N/A: no duplicate popup test | N/A: shared mapping |
| SG-03 | geometry-paint | after-action | no | N/A: no layout claim | N/A: paint outside scope | N/A: no pixel proof | N/A: no geometry test | N/A: no geometry claim |
| SG-03 | subscription-lifecycle | after-action | no | N/A: no subscription owner changed | N/A: no lifecycle claim | N/A: authored transaction only | N/A: no lifecycle test | N/A: no lifecycle claim |
| SG-03 | runtime-errors | after-action | yes | Full authored corpus completes without exceptions | corrupt retained positions or stale proposal records | full package partition | test: packages/plitejs/test/authored-history-input-contract.test.ts#splits deletion suggestions across a content gap or author change | pass: 360 tests across 19 files |
| SG-03 | follow-up-input | follow-up | yes | History, accept and subsequent edits remain valid | wrong decision target or broken next input | package matrix and affected corpus | test: packages/plitejs/test/authored-history-input-contract.test.ts#keeps spatial suggestion grouping independent from history batches | pass: history and decision lifecycle assertions pass |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| SG-01 | 1 | completed | "pnpm" "--filter" "plitejs" "test:partition:authored" | pass: exit 0 in 4571ms | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | sha256:e148df2277b7b93138e517bc1d42cefeebe43df974ff205f5bb2344f084d454d | 3 | packages/plitejs/src/authored/steps.ts,packages/plitejs/test/authored-command-lifecycle-contract.test.ts,packages/plitejs/test/authored-history-input-contract.test.ts | host:none - source-imported authored package runner | 2026-09-14T12:58:37.454Z | 2026-09-14T13:15:36.841Z | 2026-09-14T13:15:41.412Z | 0 | sha256:a7c06a796116fa0d100a5cd59636244074ca9578c5cbde197dd47498b44222c7 |
| SG-02 | 1 | completed | "pnpm" "--filter" "plitejs" "test:partition:authored" | pass: exit 0 in 4571ms | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | sha256:e148df2277b7b93138e517bc1d42cefeebe43df974ff205f5bb2344f084d454d | 3 | packages/plitejs/src/authored/steps.ts,packages/plitejs/test/authored-command-lifecycle-contract.test.ts,packages/plitejs/test/authored-history-input-contract.test.ts | host:none - source-imported authored package runner | 2026-09-14T12:58:37.454Z | 2026-09-14T13:15:36.841Z | 2026-09-14T13:15:41.412Z | 0 | sha256:c334c8b1f6d1298e93806599df16063363f1ec20e149bd1b9b0b47f380748cb0 |
| SG-03 | 1 | completed | "pnpm" "--filter" "plitejs" "test:partition:authored" | pass: exit 0 in 4571ms | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | sha256:e148df2277b7b93138e517bc1d42cefeebe43df974ff205f5bb2344f084d454d | 3 | packages/plitejs/src/authored/steps.ts,packages/plitejs/test/authored-command-lifecycle-contract.test.ts,packages/plitejs/test/authored-history-input-contract.test.ts | host:none - source-imported authored package runner | 2026-09-14T12:58:37.454Z | 2026-09-14T13:15:36.841Z | 2026-09-14T13:15:41.412Z | 0 | sha256:dca35aa01e24a71f87875a69bef6942aade4a377750f78ba9eb36482ae2b3b6d |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| packages/plitejs/src/authored/steps.ts | SG-01, SG-02, SG-03 | pass: 160 tests across 8 affected files before mutation | 2026-09-14T12:58:37.454Z | pnpm --filter plitejs test:partition:authored | sha256:e148df2277b7b93138e517bc1d42cefeebe43df974ff205f5bb2344f084d454d | pass: 360 tests across 19 files after final owner edit |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Authored typecheck | TS7022 on the local existingOwner snapshot | product typing defect in candidate | Added the required local string-or-null annotation without changing the public callback surface | pass: pnpm --filter plitejs typecheck:partition:authored |
| Managed browser build | Shared checkout temporarily lacked createYjsPlugin and contained an incomplete useYjs edit | unrelated concurrent checkout mutation | Did not touch the Yjs work; reran only after its owner restored compilable files | pass: fresh build and one Chromium E2E passed |
| Initial homepage runner attempt | Managed Plite root lists examples instead of composing the www homepage | proof-host mismatch | Bound durable E2E to the canonical authored example and kept homepage loading as support evidence | pass: canonical managed browser case passed |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| none | 0 | N/A: no claimed fix failed | N/A: expected TDD RED is not a failed fix | N/A: no prior completion claim | N/A: no methodology repair needed | N/A: no workflow failure | N/A: no trigger | N/A: no escalation | N/A: completed normally |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| SG-01 | 0 | none: no architecture trigger | patch | N/A: existing owner expresses the law | N/A: no new layer or API | pass: bounded endpoint lookup reuses the retained deletion |
| SG-02 | 0 | none: no architecture trigger | patch | N/A: same owner as backward deletion | N/A: no new layer or API | pass: symmetric endpoint contract green |
| SG-03 | 0 | none: no architecture trigger | patch | N/A: stable IDs forbid retroactive merging | N/A: existing authored position index is sufficient | pass: gap, author, history, range and bridge matrix green |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| SG-01 | packages/plitejs/src/authored/steps.ts | source-imported Bun package runner and managed /examples/plite/authored-changes browser host | browser-source-attestation: managed runner rebuilt the static app from final source immediately before Chromium | package source is canonical; no registry output | pass: package receipt plus one fresh browser Backspace/list-count test |
| SG-02 | packages/plitejs/src/authored/steps.ts | source-imported Bun package runner | direct source imports and matching receipt digest | no generated output | pass: forward-delete contract in final receipt |
| SG-03 | authored identity plus current authored corpus | source-imported full authored partition | direct source imports and matching receipt digest | no generated output | pass: 360-test final replay |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| SG-01 | two Backspaces returned two IDs | steps.ts and focused test | RED, green, decision, history and five repetitions | endpoint-deletion owner was missing for deletion sections | pass: one revision-2 identity and atomic accept |
| SG-02 | two forward Deletes returned two IDs | shared owner and focused test | symmetric green and stability | both replacement endpoints are queried | pass: one revision-2 identity |
| SG-03 | bridge deletion returned three IDs | shared owner and matrix tests | gap/author splits, bridge stability and affected corpus | choose one compatible adjacent deletion while preserving established identities | pass: bridge remains two identities with revisions 1 and 2 |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| SG-01 | focused package tests | 5 | pass: all five runs returned 31 pass and 0 fail | 0 | keep |
| SG-02 | focused package tests | 5 | pass: all five runs returned 31 pass and 0 fail | 0 | keep |
| SG-03 | full authored partition and managed browser | 1 final replay each | pass: 360 package tests and 1 browser test | 0 | keep |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| SG-01 | RED/green package test, decision assertion and managed browser test | keep | Plite authored input and canonical browser example | homepage dev session had unrelated stale Yjs errors in its log | complete |
| SG-02 | RED/green forward-delete contract | keep | Plite authored forward deletion | no direction-specific duplicate UI test; shared ID mapping is already covered | complete |
| SG-03 | Google Docs audit, main audit and 360-test partition | keep | audited grouping and separation matrix | future new semantic operation types still need their own identity law | complete |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| SG-01 | Regression method covered exact RED; missing behavior test was product coverage | no-change | Native authored input contract owns grouping | 31 focused tests | no failed-fix trigger |
| SG-02 | Same missing direction contract | no-change | Same current test owner | symmetric test and stability | no trigger |
| SG-03 | Direct upstream probing resolved bridge semantics | no-change | Matrix lives in executable tests, not another registry | bridge RED/green and full corpus | no trigger |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Initial managed homepage E2E | Regression proof setup | one failed attempt | Plite runner owns a different root app | no product evidence | moved durable test to its canonical authored example |
| First managed browser build | shared checkout | one failed build | unrelated Yjs work temporarily removed an imported file | valid blocker evidence only | waited for the owner; final build passed |
| Homepage support replay | shared www dev host | intermittent | stale error logs from unrelated Yjs hot reload and annotation overlay state | support only | canonical fresh build is the browser authority |

Findings:

- The count UI was correct: it counted distinct authored change IDs. The substrate minted a new ID because deletion sections never queried retained deletions at their edit endpoints.
- The repair performs at most two indexed endpoint lookups. Compatible pending deletions by the same author reuse one identity; different authors and incompatible owned content still split.
- Review grouping is spatial and semantic, independent of Undo batching. Google Docs kept one deletion card after a caret/history detour.
- When one accepted character separates two existing deletion cards, deleting that bridge extends one established card and leaves two cards. It neither creates a third nor retroactively merges immutable IDs.
- main had the desired adjacent deletion reuse but also had inconsistent paste, multi-node, mark and line-break behavior. The implementation keeps the current Plite semantic owners and restores only the missing deletion path.
- Existing contracts cover insertion grouping, own-insertion cancellation, replacement, marks, paste, breaks, block operations, author/view separation, retention, reload and decisions.

Timeline:

- 2026-09-14: audited main and the current authored corpus, probed Google Docs, restored the scratch document, reproduced four exact RED assertions, repaired the owner, added package and browser coverage, and completed all verification gates.

Decisions and tradeoffs:

- Identity follows compatible spatial continuity, not history batches.
- Established review IDs remain stable. A bridge edit chooses one compatible neighbor rather than rewriting both old records.
- The implementation stays in the authored substrate. No UI heuristic, session state, public API or extra layer was added.

Review fixes:

- N/A: no PR or explicit autoreview was requested; source-first typecheck, lint, full tests and browser verification passed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Expected grouping RED | 2 runs | Repair endpoint owner inference | Initial three failures and bridge failure are green |
| Typecheck TS7022 | 1 | Stabilize the local snapshot type | Final typecheck passes |
| Managed browser build with unrelated Yjs edits | 1 | Avoid touching another owner's work and rerun after it settled | Final clean managed build and browser case pass |

Verification evidence:

- pnpm --filter plitejs typecheck:partition:authored — pass.
- pnpm --filter plitejs lint:partition:authored — pass.
- pnpm --filter plitejs test:partition:authored — 360 pass, 0 fail across 19 files.
- Focused owner tests — 31 pass, 0 fail; five retry-free repetitions all passed.
- Managed Chromium authored example — fresh build, 1 pass, 0 fail, with expected projected text, one pending proposal row and no runtime errors.
- Google Docs direct probes — adjacent backward/forward delete, insertion, replacement, history detour, true gap and bridge behavior recorded; scratch tab restored to one baseline suggestion.
- Local checkout remains uncommitted and unpushed at dirty HEAD 5a899edcbea2c31f1bd34dc575c9dd3860c577d0.

Final handoff:

- executable cases: SG-01 backward delete, SG-02 forward delete, SG-03 grouping/separation matrix all completed.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: recorded above.
- failed-fix invalidation and automatic repair: N/A; only expected RED probes occurred.
- proof receipts and affected-corpus replay: three current-digest receipts plus 360-test replay.
- started-gate failure closure: typecheck and browser build failures closed by exact reruns.
- changed files: packages/plitejs/src/authored/steps.ts, two package contract files, one browser spec, one changeset, and this plan.
- design decisions: spatial/semantic identity, stable established IDs, no public API change.
- tests and proof: typecheck, lint, full partition, five stability runs and managed browser pass.
- source/generated sync: N/A; no registry, template or workflow source changed.
- P1 and agent-native findings: N/A; no requested PR review or agent workflow mutation.
- residual risks and next owner: exact homepage mutation was support-only because unrelated live-dev Yjs errors polluted that host; canonical built browser path is green. User review is next.
- local completion status and integration/public-status boundary: completed locally, uncommitted and unpushed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Local verification and plan closure are complete |
| Where am I going? | Final semantic validator, goal checker and user handoff |
| What is the goal? | One review identity for contiguous compatible edits with audited split rules |
| What have I learned? | Identity is spatial/semantic; a bridge extends one stable neighbor |
| What have I done? | Repaired the owner, added the matrix and browser coverage, and verified the full corpus |

Open risks:

- The exact long-running www homepage host retained stale unrelated Yjs error logs during support inspection. The fresh managed Plite build compiled the same package source and passed the canonical authored browser scenario; no grouping defect remains in verified scope.
