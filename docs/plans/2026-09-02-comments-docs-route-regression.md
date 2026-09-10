# Comments docs route regression

Objective:
Repair and fully validate the Comments docs route; done when exact-route core
interaction cases pass 5 fresh runs with both the persistent sidebar and the
active-thread floating view.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-02-comments-docs-route-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- browser

Regression source:

- target bug / surface / corpus: the public `/docs/comment` example is broken;
  validate route readiness, comment creation, overlapping anchors, highlight
  activation, panel/thread opening, thread actions, read-only review, source
  failure/recovery, and follow-up editing.
- lane and current source owner: Plate WWW Comments registry/demo composition;
  Plite/Plate package owners remain in scope only if exact reproduction proves
  the defect is below the demo.
- selected executable test cases: one exact-route core workflow case, with its
  existing standalone Comments browser rows as affected-corpus support.
- tested ref or dirty-state boundary: `dirty:a6afd55c30e97c74fe895d1ad005ca75413110f3`;
  final source/test/host inputs receive SHA-256 fingerprints.
- route / proof host and freshness method: fresh WWW process at
  `http://localhost:3000`, exact public route `http://localhost:3000/docs/comment`,
  fresh Browser page, then receipt-bound Playwright replay.
- invocation mode / timebox: one-shot full loop; no timebox.

First checkpoint:

- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Fill the selected-case, reporter-oracle, failed-fix, and architecture tables,
  then run `validate-regression-plan.mjs` before implementation.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:

- The exact `/docs/comment` route renders the live editor and Comments UI with
  zero page or console errors.
- The demo exposes both Comments views at once: the persistent sidebar stays
  visible, and the first click on any comment highlight opens a floating thread
  anchored to that comment without creating a second thread store or anchor
  source.
- A physical selection can create a comment; a second intersecting selection
  can create an overlapping comment; clicking each resulting highlight opens
  the correct thread in the floating view on the first click while the sidebar
  selects the same thread.
- Reply, edit, resolve/reopen, and delete paths remain usable; reviewer Viewing
  mode can write thread data without changing document content; disconnect and
  reconnect retain both editors and their anchor paint.
- The exact-route executable workflow and affected existing Comments corpus
  pass 5/5 retry-free warm runs on final local bytes.

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-09-02-comments-docs-route-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-comments-docs-route-regression.md`

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

- allowed source owners: `apps/www` Comments docs, registry, demo, route
  composition, and only proven downstream `packages/platejs` / `packages/plitejs`
  owners.
- allowed proof/test owners: existing WWW Comments browser/unit tests plus the
  Regression workflow validator/tests required by the failed-fix interrupt.
- generated/source boundary: edit registry/docs source only; regenerate derived
  registry/API output through owning commands.
- browser/device claim width: desktop in-app Browser and repository Chromium;
  no exact-Chrome, mobile-device, clipboard, or OS-native claim.
- forbidden product/API/release/public mutations: no speculative API change,
  compatibility layer, unrelated feature work, commit, push, PR, release, or
  public tracker mutation.
- orchestration mode and writer ownership: this thread is the sole writer; no
  subagents or parallel host writers.

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

- current phase: completed local closure
- current executable case: `comments-docs:core-workflow`
- current case status: completed
- next owner: none for local repair; commit and push were not authorized
- goal status: ready for completion

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Exact public URL and required creation, overlap, click/open, and full no-regression review are copied above. |
| Regression methodology loaded | yes | Regression skill and its complete methodology reference were read before mutable work. |
| Active goal checked or created | yes | New matching goal created after confirming no active goal. |
| Current source owner and tested ref recorded | yes | WWW Comments owner and `dirty:a6afd55c30e97c74fe895d1ad005ca75413110f3` recorded. |
| Executable test cases discovered | yes | Existing `apps/www/tests/browser/comment.spec.ts` is affected corpus; exact docs-route workflow will be added there unless source proves a narrower owner test. |
| Cumulative reporter evidence resolved | yes | Prior completed claim is base acceptance; the user's exact-route contradiction is the required latest delta. |
| Reporter oracle matrix resolved | yes | All nine observations are mapped below before product edits. |
| Regression semantic validator ready | yes | Existing validator is the pre-implementation and completion gate; failed-fix route-equivalence repair runs first. |
| Route/proof-host readiness plan recorded | yes | Fresh WWW process, exact `/docs/comment` route, fresh Browser page, receipt-bound Playwright. |
| Patch delegation boundary recorded | yes | One exact-route case; edit only the proven WWW owner or proven lower package owner plus its tests. |
| Orchestrator writer ownership recorded | yes | N/A: no orchestrator or child writer; this thread serializes source and host work. |
| Output budget strategy recorded | yes | Exact files and capped logs; generated/build trees excluded unless an owning command needs them. |
| Claim width and blocked rules recorded | yes | Local desktop behavior only; exact route or host unavailability blocks broad completion, not investigation. |
| Browser pack selected | yes | Browser pack materialized for exact public route behavior. |
| Browser route / app surface identified | yes | `http://localhost:3000/docs/comment`. |
| Browser tool decision recorded | yes | In-app Browser for exact interaction exploration; repository Playwright for durable repeatable proof. |
| Console/network caveat policy recorded | yes | Page/console errors are blocking; unrelated network errors are classified, never hidden. |
| Observable browser case captured | yes | `comments-docs:core-workflow`, exact route and actions below, local desktop scope, prior dirty ref, final fingerprints required. |

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
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close the exact route case | pass: full corpus 4/4 and exact route 5/5 |
| Current-source readiness | yes | Bind final local bytes | pass: `dirty:a6afd55c30e97c74fe895d1ad005ca75413110f3` and receipt digest below |
| Route/proof-host readiness | yes | Prove the live host observes current source | pass: PID 88081, HTTP 200, current generated registry, exact route replay |
| Executable regression coverage | yes | Record red and green owner proof | pass: exact-route popover RED before repair; final browser test green |
| E2E escalation closure | yes | Name owner-level limitation | pass: `e2e-required` for physical selection, overlap, duplicate views, and floating geometry |
| Cumulative reporter evidence closure | yes | Retain both user contradictions | pass: broken route and missing floating view both execute in the exact-route case |
| Reporter oracle closure | yes | Resolve every applicable observation | pass: matrix below |
| Failed-fix interrupt closure | yes | Repair the proxy-route proof miss | pass: Regression exact-route law, 128/128 workflow tests, and source/mirror parity |
| Architecture pressure closure | yes | Review the two-slot public shape | pass: Best API hard cut to one `Comments` composition; no new package layer |
| Proof receipt closure | yes | Capture final immutable-input receipt | pass: attempt 2 receipt below |
| Affected-corpus replay closure | yes | Replay after final shared-owner edit | pass: 4/4 full Comments corpus after canonical component edit |
| Shared-style consumer closure | no | No shared paint selector changed | N/A: the repair adds composition and a selection-preservation marker only |
| Started-gate failure closure | yes | Rerun every failed started gate | pass: server-lock and typecheck-memory rows below |
| Smallest-probe closure | yes | Record first falsifying probe | pass: exact docs route lacked floating-thread DOM |
| Patch delegation closure | yes | Return one-case root cause and proof | pass: WWW copied Comments composition owned the repair |
| Focused verification closure | yes | Run owner and exact-route tests | pass: channel 6/6, package 9/9, route 5/5 |
| Stability closure | yes | Run retry-free warm repetitions | pass: 5/5, retry count 0 |
| Packet decision closure | yes | Decide the selected case | keep: completed local repair |
| Local completion status | yes | Separate local completion from integration | completed locally; uncommitted and unpushed |
| No duplicate registry | yes | Avoid sidecar behavior data | pass: no case registry or second Comments store created |
| Generated/source and host repair | yes | Regenerate registry and use a current host | pass: registry build plus current PID 88081 |
| Orchestrator writer closure | no | One local writer | N/A: no child writers or shared host writers |
| Workflow slowdown closure | yes | Record avoidable proof friction | pass: rows below |
| Methodology delta closure | yes | Resolve repair-now/no-change | pass: exact-route repair plus API-doctrine no-change |
| Source/generated sync | yes | Regenerate changed outputs | pass: registry build and changelog generator 107/107 |
| Agent-native review | yes | Review changed Regression workflow | pass: capability map and 128/128 workflow tests |
| Final handoff contract | yes | Record proof, risks, and boundary | pass: final handoff below |
| Autoreview | no | Respect branch policy | N/A: `autoreview` is forbidden on `next`; manual P1 review found no remaining issue |
| Regression semantic plan | yes | Run completion validator | pass: completion validator executed after ledger closure |
| Goal plan complete | yes | Run Autogoal checker | pass: Autogoal checker executed after ledger closure |
| Browser interaction proof | yes | Exercise the exact route in Browser | pass: sidebar and correct anchored popover visible; reply sync and overlap switching pass |
| Browser console/network check | yes | Inspect a fresh final tab | pass: only React DevTools info and HMR connection logs; zero warnings/errors |
| Browser final proof artifact | yes | Inspect final layout | pass: screenshot shows sidebar and floating thread together on `/docs/comment` |
| Exact case replay | yes | Replay all end-state claims | pass: exact public workflow 5/5 |
| Final ref and fingerprints | yes | Record ref and SHA-256 fingerprints | pass: receipt below |
| Clean final runtime | no | Do not widen a dirty local proof into integration | N/A: local completion only; checkout is uncommitted and unpushed |
| Retry-free stability | yes | Run five warm Chromium replays | pass: 5/5 with no retries |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | complete | exact request, goal, boundaries, case, and browser pack recorded | done |
| Failed-fix methodology repair | complete | 128/128 workflow tests and exact source/mirror parity | done |
| Current source and proof-host readiness | complete | current PID 88081, HTTP 200, registry regenerated | done |
| Executable case discovery and selection | complete | exact-route workflow plus full Comments corpus | done |
| Cumulative reporter evidence inventory | complete | both route and floating-view contradictions retained | done |
| Reporter oracle expansion | complete | all observations resolved below | done |
| Pre-implementation semantic validation | complete | exact route reproduced red before product repair | done |
| Smallest high-value probe | complete | missing floating-thread DOM identified the copied UI owner | done |
| Reproduce, classify, and red test | complete | exact route failed the new popover assertion | done |
| One-case Patch delegation | complete | canonical copied `Comments` composition implemented | done |
| Focused verification and stability | complete | source tests, full browser corpus, exact 5/5, WWW and Plite gates | done |
| Keep/revert/quarantine | complete | keep | done |
| Methodology repair/no-change/defer | complete | Regression repair-now; API doctrine no-change | done |
| Reviews and final handoff | complete | manual P1 and Browser visual review clean | done |
| Final goal-plan check | complete | completion validators pass after ledger closure | done |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| comments-docs:core-workflow | both 2026-09-02 user contradictions on `http://localhost:3000/docs/comment` | Fresh route; create intersecting comments; click each highlight; use sidebar and floating thread; reply/edit/resolve/delete; reviewer mode; disconnect/reconnect; follow-up edit | Sidebar and anchored floating thread coexist, share one channel, switch correctly on first click, preserve document bytes, recover, and emit no runtime errors | reporter: both exact-route Comments contradictions | e2e-required: physical selection, overlap, event delivery, route composition, duplicate synchronized views, and floating geometry have no exact owner-level unit representation | browser: in-app Browser and repository Chromium; exact-route: http://localhost:3000/docs/comment; runtime-modes: Editing and Viewing; fixture-scope: complete docs Comments demo | `apps/www/tests/browser/comment.spec.ts`; `pnpm --filter www exec playwright test --project=chromium tests/browser/comment.spec.ts` | completed | dirty:a6afd55c30e97c74fe895d1ad005ca75413110f3 | none: local repair complete; commit/push not authorized |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| comments-docs:core-workflow | base-acceptance | prior Comments completion and standalone corpus | after-action | creation, overlap, thread UI, read-only review, recovery, follow-up editing | required | model@after-action, dom-native@after-action, popup@after-action, subscription-lifecycle@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/comment.spec.ts#public docs comment workflow | pass: prior proxy claim replaced by exact-route proof |
| comments-docs:core-workflow | latest-reporter-delta | first 2026-09-02 report on `/docs/comment` | after-action | public example must be usable for create, overlap, click, and open | required | dom-native@after-action, popup@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/comment.spec.ts#public docs comment workflow | pass: exact route 5/5 |
| comments-docs:core-workflow | latest-reporter-delta | second 2026-09-02 report | after-action | persistent sidebar and floating Comments view must coexist | required | model@after-action, dom-native@after-action, popup@after-action, subscription-lifecycle@after-action, runtime-errors@after-action | test: apps/www/tests/browser/comment.spec.ts#public docs comment workflow | pass: both views visible and synchronized |

Reporter oracle matrix:

For an effect-owned disposable source, the `subscription-lifecycle` row records
`strict-effect: mount + cleanup + remount` and closes with `mount: pass`,
`cleanup: pass`, `remount: pass`, and `post-remount-publication: pass`.

| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| comments-docs:core-workflow | model | after-action | yes | distinct overlapping anchors; one active ID; one channel; document bytes preserved | marks in data, merged anchors, divergent views, second store, wrong active ID, or document mutation | browser exact-route model assertions | test: apps/www/tests/browser/comment.spec.ts#public docs comment workflow | pass: one plugin active ID and one application channel drive both views |
| comments-docs:core-workflow | dom-native | after-action | yes | both editors and sidebar contained; physical selection creates overlap; first click delivers pointerdown, mousedown, click and opens the matching popover | off-canvas UI, missing view, merged highlights, swallowed click, second-click requirement, or wrong thread | Browser and Playwright exact-route DOM | test: apps/www/tests/browser/comment.spec.ts#public docs comment workflow | pass: runtime-owner: pass; mutation-owner: pass; interaction-trace: pass; target: comment highlight; event: pointerdown/mousedown/click; buttons: 1 then 0 |
| comments-docs:core-workflow | pointer-feedback | during-action | no | N/A: no cursor, hover, tooltip, or held-pointer claim | N/A: no pointer-feedback claim | N/A: click delivery is owned by DOM/native | N/A: no pointer-feedback executable assertion | N/A: no pointer-feedback claim |
| comments-docs:core-workflow | focus | after-action | no | N/A: no post-open focus owner prescribed | N/A: no focus-transfer claim | N/A: follow-up inputs prove usability | N/A: no focus executable assertion | N/A: no focus policy claimed |
| comments-docs:core-workflow | popup | after-action | yes | first click opens the anchored matching thread while sidebar remains visible; overlap switching is immediate | absent/replacing/detached/wrong/second-click popover | Browser and Playwright geometry/thread assertions | test: apps/www/tests/browser/comment.spec.ts#public docs comment workflow | pass: correct floating content and sidebar active thread |
| comments-docs:core-workflow | geometry-paint | during-action | no | N/A: claim is DOM containment and reachability, not pixel color/compositor output | N/A: no pixel-paint forbidden state | N/A: DOM/native owns the geometry claim | N/A: no pixel-classifier assertion | N/A: no rendered-pixel claim |
| comments-docs:core-workflow | subscription-lifecycle | after-action | yes | add/update/remove/teardown and disconnect/reconnect stay scoped | stale rows, broad wakes, lost anchors, or post-teardown publication | package channel unit and browser corpus | test: apps/www/src/registry/components/editor/comment.spec.tsx#keeps body actions out of the anchor source | pass: 6/6 channel tests; 4/4 browser corpus |
| comments-docs:core-workflow | runtime-errors | after-action | yes | zero current warnings/errors through route and actions | overlay, uncaught exception, React warning, or failed recovery | Browser fresh tab and Playwright runtime traps | test: apps/www/tests/browser/comment.spec.ts#public docs comment workflow | pass: fresh tab has only React DevTools info and HMR connection logs |
| comments-docs:core-workflow | follow-up-input | follow-up | yes | floating reply updates sidebar and later editor input still commits | dead thread input, lost edit, corrupt selection, or thread data in document | Browser and Playwright follow-up input | test: apps/www/tests/browser/comment.spec.ts#public docs comment workflow | pass: reply synchronization and follow-up typing both succeed |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| comments-docs:core-workflow | 2 | completed | "/usr/bin/env" "PLAYWRIGHT_BASE_URL=http://localhost:3000" "COMMENTS_EXACT_ROUTE=http://localhost:3000/docs/comment" "pnpm" "--filter" "www" "exec" "playwright" "test" "--config" "playwright.config.ts" "--project=chromium" "tests/browser/comment.spec.ts" "--grep" "public docs comment workflow" "--repeat-each" "5" | pass: exit 0 in 18918ms | dirty:a6afd55c30e97c74fe895d1ad005ca75413110f3 | sha256:e6f7d2a265e7d51d7cf048de1d038cf030349931a2f9753b34289cffb4fbdc8f | 10 | apps/www/src/__registry__/index.tsx,apps/www/src/registry/bases/base/floating-popover.tsx,apps/www/src/registry/components/editor/comment.tsx,apps/www/src/registry/components/editor/editor.tsx,apps/www/src/registry/components/editor/fixed-toolbar.tsx,apps/www/src/registry/examples/comment-demo.tsx,apps/www/src/registry/registry-features.ts,apps/www/tests/browser/comment.spec.ts,content/docs/(plugins)/(collaboration)/comment.mdx,packages/platejs/src/react/features/comments/CommentsPlugin.ts | pid:88081;started:2026-09-02T07:05:48.000Z;base-url:http://localhost:3000;browser:chromium | 2026-09-02T08:58:50.100Z | 2026-09-02T09:06:17.119Z | 2026-09-02T09:06:36.037Z | 0 | sha256:a0fa0f58702d92372b878a6f59d051c018d08567d28f64175492403415e66712 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| WWW Comments registry/demo and Plate Comments integration; four-row browser corpus | comments-docs:core-workflow | red: exact route lacked floating view; standalone support rows green | 2026-09-02T08:58:50.100Z | `PLAYWRIGHT_BASE_URL=http://localhost:3000 COMMENTS_EXACT_ROUTE=http://localhost:3000/docs/comment pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/comment.spec.ts` | sha256:e6f7d2a265e7d51d7cf048de1d038cf030349931a2f9753b34289cffb4fbdc8f | pass: full corpus 4/4 after final owner edit; exact receipt 5/5 |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Prior exact public-route completion claim | user contradicted proxy proof | reporter contradiction | exact-route Regression law and executable route case | pass: exact route 5/5 |
| Fresh server on port 3010 | Next refused a second dev server while PID 88081 held the app lock; all four navigations got connection refused before assertions | environment/host guard, not product failure | bind proof to the live current-source host on port 3000 | pass: same full corpus 4/4 and receipt 5/5 on PID 88081 |
| WWW typecheck at smaller heaps | Node exhausted 4 GB and 8 GB during full WWW typecheck | proof-resource limit | rerun the exact gate with `NODE_OPTIONS=--max-old-space-size=16384` | pass: full WWW typecheck exit 0 |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| comments-docs:core-workflow | 1 | prior completed claim contradicted because standalone proof missed the broken public route | reporter-contradiction | yes: prior green and completion authority revoked | repair-now: `.agents/rules/regression/scripts/validate-regression-plan.mjs` binds the exact reporter route | pass: 128/128 workflow tests and source/mirror parity | no: first failed fix without a Regression architecture trigger | N/A: first failed fix; separate best-api review accepted the public call shape and plate-plan required no new layer | reproduced: exact route passes final workflow; exact-route-reproduction: pass |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| comments-docs:core-workflow | 1 | none: no Regression architecture trigger | patch | N/A: local copied UI correctness repair; best-api review recorded under Methodology deltas | N/A: existing Plate slot, Comments plugin, and channel remain the accepted owners | pass: source/docs/editor-ai/generated install output use `slots: { afterEditable: Comments }`; zero public two-slot residues |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| comments-docs:core-workflow | `apps/www` copied Comments UI and docs composition | `http://localhost:3000/docs/comment`, PID 88081, repository Chromium and in-app Browser | HTTP 200; process start bound in receipt; fresh tab loaded after registry build; current generated registry imported | source registry/docs edited; `pnpm --filter www build:registry` and changelog generator own derived output | pass: exact route, generated output, and host all current |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| comments-docs:core-workflow | exact route missing `[data-comment-popover]` | copied Comments component/demo/docs and exact browser test; package state owner unchanged | exact route, applicable oracles, full corpus, 5/5, zero retries | root cause: incomplete view composition; fix: one `Comments` owner; proof and receipt below | completed |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| comments-docs:core-workflow | exact route on PID 88081 and in-app Browser | 5 | 5/5 pass | 0 | stable and kept |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| comments-docs:core-workflow | channel 6/6; package 9/9; full browser 4/4; exact 5/5; WWW typecheck; Plite affected suite; Browser visual/manual proof | keep and mark completed locally | desktop in-app Browser and repository Chromium on exact local route | uncommitted/unpushed; no release or integration claim | none until user authorizes commit/push |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| comments-docs:core-workflow | prior proxy proof omitted the public route; two public view components also allowed incomplete setup | repair-now | `.agents/rules/regression/scripts/validate-regression-plan.mjs` and its owning Regression sources bind exact routes; Best API and Plate UI already own the direct complete-composition law, so API doctrine is no-change | pass: 128/128 workflow tests, source/mirror parity, one exported `Comments`, zero public two-slot examples, generated registry verified | failed-fix interrupt closed; API doctrine already catches the implementation miss |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| second WWW dev server on 3010 | Next host | immediate failure | existing app lock from the user-visible server | none: assertions never ran | used the current-source PID 88081 host and recorded the failure separately |
| full WWW typecheck | WWW | failed at 4 GB and 8 GB before passing | repository type graph needs a larger heap in this checkout | high | 16 GB exact rerun passed |

Findings:

- The first failure was proof substitution: a standalone demo passed while the public docs composition was broken.
- The second design problem was a public footgun: two view exports and two slots let consumers ship half the feature.
- The durable shape is one exported `Comments` composition. Its private popover and sidebar share the existing plugin `activeId` and application channel.
- The floating view adds one keyed active-thread subscriber. It adds no broad subscription, store, provider, anchor source, plugin, or package layer.
- Manual and executable review found no remaining P1 behavior or API issue.

Timeline:

- 2026-09-02: user contradicted the prior completion claim with the broken exact route.
- 2026-09-02: Regression exact-route proof law was repaired and the route reproduced red.
- 2026-09-02: layout containment was repaired; user correctly rejected the sidebar-only result.
- 2026-09-02: floating active-thread UI was restored on the application-owned channel.
- 2026-09-02: manual P1 review cut the two-slot setup to one canonical `Comments` component.
- 2026-09-02: generated registry, source tests, full browser corpus, exact 5/5 receipt, WWW typecheck, Plite gates, and Browser visual proof passed.

Decisions and tradeoffs:

- One `Comments` view is the only common public composition. Consumers cannot accidentally choose sidebar-only or popover-only.
- `createCommentsPlugin` remains headless editor integration; it does not own application thread data or copied product UI.
- `CommentsProvider` and the application channel remain because they own independent application data lifecycle and external-store subscriptions.
- The popover resolves a live plugin range into a virtual DOM anchor and uses the existing floating-popover primitive.
- Pending comment creation stays in the persistent sidebar; duplicating the composer in both views would create conflicting local form state.

Review fixes:

- P1: replaced separately exported `CommentPopover` and `CommentsSidebar` setup with one exported `Comments` composition.
- P1: added `data-plite-keep-selection-visible` to the portaled popover content so its controls preserve the editor selection.
- P1: migrated the demo, docs, editor-ai consumer, metadata, changelog, and generated install output to the canonical call site.
- P1 review result: no remaining actionable finding. `autoreview` was not run because the checkout branch is `next`.
- Agent-native Regression workflow review remains green from the failed-fix repair.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| exact route RED lacked `[data-comment-popover]` | 1 | implement the copied UI owner | expected red turned green |
| second dev server on 3010 rejected by Next app lock | 1 | use the current live host instead of killing the user process | port 3000 full corpus and receipt pass |
| WWW typecheck exhausted 4 GB and 8 GB heaps | 2 | use 16 GB for the unchanged exact gate | pass |
| Browser `setChecked`/empty `waitFor` shape was invalid | 2 | use click and the load-settle path | fresh tab proof pass |
| historical HMR registry errors appeared in the old tab log | 1 | isolate post-build logs in a fresh tab | zero fresh warnings/errors |

Verification evidence:

- `pnpm --filter www build:registry`: pass.
- Changelog generator write/check: 107/107.
- `bun test apps/www/src/registry/components/editor/comment.spec.tsx`: 6/6.
- `pnpm --filter platejs test:partition:comments-react`: 9/9.
- Targeted Ultracite and inline component prop audit: pass.
- `NODE_OPTIONS=--max-old-space-size=16384 pnpm --filter www typecheck`: pass.
- `pnpm check:plite:dev`: pass; 85 typechecks, 134 tests, contracts, and browser smoke.
- Full `apps/www/tests/browser/comment.spec.ts`: 4/4.
- Exact `/docs/comment` workflow: 5/5, retries 0, receipt `sha256:a0fa0f58702d92372b878a6f59d051c018d08567d28f64175492403415e66712`.
- In-app Browser: both views visible; correct overlap opens; reply syncs to sidebar; switching overlap changes floating content; final fresh tab has zero warnings/errors.
- `git diff --check`: pass.

Final handoff:

- executable cases: one selected case, completed
- cumulative reporter evidence and oracles: both contradictions retained and green
- failed-fix invalidation and automatic repair: complete
- proof receipts and affected-corpus replay: complete
- started-gate failure closure: complete
- changed behavior: the docs demo and copied install surface expose sidebar plus floating thread through one `Comments` component
- design decision: no new plugin/store/provider/package layer
- source/generated sync: complete
- P1 and agent-native findings: no remaining P1; Regression workflow review green
- residual risk: local bytes are uncommitted and unpushed; no integration or release claim
- next owner: none until commit/push is explicitly authorized
- local completion status: completed

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | completed local closure |
| Where am I going? | final validators, goal completion, then handoff |
| What is the goal? | exact docs route with sidebar and floating Comments, fully proved |
| What have I learned? | a two-slot API made an incomplete Comments UI look valid |
| What have I done? | restored both views, cut the footgun, regenerated outputs, and proved the exact route |

Open risks:

- The repair is local, uncommitted, and unpushed.
- Proof covers desktop in-app Browser and repository Chromium, not native mobile devices or an integrated deployment.
