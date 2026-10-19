# 5113 selection drag scrolling regression

Objective:
Fix Plate Beta #5113 locally; done when the exact held-button vertical drag case is RED before the fix, GREEN for five retry-free runs after it, reviewed at P1, and bound to a final proof receipt.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5113-selection-drag-scrolling-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: Plate Beta issue #5113, homepage AI editor text-selection drag across a long vertically scrolling document
- lane and current source owner: `next`; exact owner remains under classification between Plite React root interaction/selection and the app floating toolbar
- selected executable test cases: `issue-5113:held-primary-drag-scroll-lifecycle`
- tested ref or dirty-state boundary: base `219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493`; only this plan is dirty before product/test work
- route / proof host and freshness method: source-built `apps/www` homepage `/` on a newly started local dev server; restart after product bytes change
- invocation mode / timebox: explicit `$regression` one-shot execution; no timebox

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5113-selection-drag-scrolling-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5113-selection-drag-scrolling-regression.md`

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

- allowed source owners: the classified Plite React selection/root-interaction owner and the homepage floating-toolbar source only when exact evidence requires it
- allowed proof/test owners: the nearest existing owner-level unit/DOM test first; existing `apps/plite`/`apps/www` Browser coverage only when the lower layer cannot express the native held-button scroll case
- generated/source boundary: edit canonical source/tests only; never edit `templates/**` or generated registry output by hand
- browser/device claim width: current macOS desktop Browser/Chromium diagnosis and exact local homepage route; exact reporter Chrome version remains `NOT_ENOUGH_INFO`
- forbidden product/API/release/public mutations: no public API redesign, unrelated UI work, generated-output edits, commit, push, PR, release, issue comment/label/close, or shipped/integrated claim
- orchestration mode and writer ownership: Regression master plus exactly one Patch child writer after RED; no overlapping writers or shared route hosts

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

- current phase: current-source and proof-host readiness
- current executable case: `issue-5113:held-primary-drag-scroll-lifecycle`
- current case status: completed locally; final fresh-server exact E2E passed 5/5
- next owner: Regression for exact Browser trace and smallest owner-level RED probe
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
| Prompt requirements captured | yes | Explicit request: use Regression to fix #5113; issue acceptance adds held primary button, bidirectional vertical drag tracking, and no floating toolbar before release. No commit/push/public mutation was requested. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely before goal/test/child work. |
| Active goal checked or created | yes | `get_goal` returned none; goal created for this plan with exact RED/GREEN, five-run stability, review, and receipt threshold. |
| Current source owner and tested ref recorded | yes | Base ref `219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493` on `next`; classification intentionally remains open between current Plite React selection/root interaction and app toolbar. |
| Executable test cases discovered | yes | One atomic case selected: `issue-5113:held-primary-drag-scroll-lifecycle`; nearest existing root-interaction, selection Browser, and floating-toolbar tests identified for probe selection. |
| Cumulative reporter evidence resolved | yes | Issue body, 8.26 s native recording, and reporter clarification that the primary button stayed held are inventoried below; both-direction acceptance remains required. |
| Reporter oracle matrix resolved | yes | All eight observation types are mapped below with phase-specific positive/forbidden states and final executable results. |
| Regression semantic validator ready | yes | Pre-implementation validator passed; final `--complete` rerun recorded below. |
| Route/proof-host readiness plan recorded | yes | Start a fresh source-built `apps/www` dev server for `/`; warm once, instrument event/button/selection/toolbar state, and restart after final source edits. |
| Patch delegation boundary recorded | yes | Patch receives one case only after exact reproduction and RED, limited to the classified durable owner plus its existing test file and required changeset if a published package changes. |
| Orchestrator writer ownership recorded | yes | This is not orchestrator mode; Regression is sole master and one Patch child may write only after the normalized RED packet. |
| Output budget strategy recorded | yes | Exact files and focused `rg`; cap source/test output, exclude templates/generated/build trees, and store long issue/video data under `/tmp`. |
| Claim width and blocked rules recorded | yes | Local completed only; block only if the exact native held-button path cannot be expressed or replayed after proof-host repair and no safe alternative remains. |

Work Checklist:

- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work: fix #5113, keep primary held, selection follows in both vertical directions, toolbar waits for release, exact local proof, no unrequested Git/public mutation.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Generated/source drift and host readiness are repaired or block the claim.
- [x] Every selected case has a stable ID, source reference, owner/classification boundary, setup,
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
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: case completed with final receipt and 5/5 fresh stability |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: dirty:219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493, nine receipt inputs fingerprinted |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: fresh PID 15067 started 2026-08-27T04:01:06Z on localhost:3002 |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: dedicated E2E plus selection-controller contract; RED 3/348px, GREEN >1200px |
| E2E escalation closure | yes | Prove the lower-layer limitation | pass: native contenteditable, live overflow scroller, buttons and toolbar lifecycle require browser E2E |
| Cumulative reporter evidence closure | yes | Map all evidence | pass: base acceptance, recording and held-button delta map to executable rows |
| Reporter oracle closure | yes | Resolve all observations | pass: seven applicable rows pass; paint is evidence-backed N/A |
| Failed-fix interrupt closure | no | N/A | N/A: expected pre-fix RED only; no claimed fix failed |
| Architecture pressure closure | yes | Record verdict | accepted: local O(1) existing-owner patch; no trigger/public API change |
| Proof receipt closure | yes | Validate receipt | pass: receipt sha256:267b0258faaa52b04e1be0491d08c56334b6ec765b651e1023516f516baf139d |
| Affected-corpus replay closure | yes | Replay affected case after final owner edit | pass: combined fresh-server 5-run command bound to input digest sha256:6348c89630dd608d1125dde9f30550756e887db67622df0f18838ce5407a0221 |
| Shared-style consumer closure | no | N/A | N/A: no shared CSS/style change |
| Started-gate failure closure | yes | Rerun failed gates | pass: locator/scroll-host failures repaired; scoped format failures fixed and rerun |
| Smallest-probe closure | yes | Record probe | pass: exact held mousemove reproduced old scroll restore; proof-host misses recorded |
| Patch delegation closure | yes | Read back Patch evidence | pass: root cause, files, 50 tests, typecheck, stability and review returned |
| Focused verification closure | yes | Run exact final replay | pass: fresh-server exact E2E 5/5 |
| Stability closure | yes | Record retry-free warm runs | pass: five fresh-process runs, retries 0 |
| Packet decision closure | yes | Decide case | keep: durable Plite React owner and exact coverage |
| Local completion status | yes | Mark local scope | completed: local, uncommitted, unpushed; no public issue mutation |
| No duplicate registry | yes | Prove no sidecar registry | pass: only executable test and transient plan |
| Generated/source and host repair | yes | Repair host | pass: master server restarted fresh after final bytes |
| Orchestrator writer closure | no | N/A | N/A: one Patch child was the sole product writer |
| Workflow slowdown closure | yes | Resolve proof-host misses | pass: three invalid probes classified and replaced by deterministic scroller + held-move path |
| Methodology delta closure | yes | Record decision | no-change: Regression correctly rejected proof-host failures and required exact RED |
| Source/generated sync | no | N/A | N/A: no agent source/generated skill changed; product changeset added |
| Agent-native review | no | N/A | N/A: no agent action/tooling changed |
| Final handoff contract | yes | Record handoff | pass: files, root cause, proof, review, risk and boundary recorded below |
| Autoreview | yes | Run P1 autoreview | pass: invocation 1 fixed queued pre-drag restore hole; invocation 2 clean |
| Regression semantic plan | yes | Run final validator | pass: final command below |
| Goal plan complete | yes | Run final checker | pass: final command below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | goal created; explicit requirements copied; ref and mutation boundaries recorded | source/host readiness |
| Current source and proof-host readiness | completed | fresh server PID 15067 observes final bytes | discover executable cases |
| Executable case discovery and selection | completed | one atomic case and adjacent owner tests identified | smallest probe |
| Cumulative reporter evidence inventory | completed | issue, recording, and held-button clarification retained | reporter oracle expansion |
| Reporter oracle expansion | completed | all eight observation rows mapped below | semantic validation |
| Pre-implementation semantic validation | completed | validator structurally valid | smallest probe |
| Smallest high-value probe | completed | exact held-move RED after proof-host repair | reproduce/classify |
| Reproduce, classify, and red test | completed | stale deferred scroll restore identified | patch delegation |
| One-case Patch delegation | completed | sole Patch writer returned complete evidence | verification |
| Focused verification and stability | completed | 50 tests, typecheck, fresh E2E 5/5 | packet decision |
| Keep/revert/quarantine | completed | keep | methodology delta |
| Methodology repair/no-change/defer | completed | no-change; method caught host misses | closure |
| Reviews and final handoff | completed | P1 invocation 2 clean | goal-plan check |
| Final goal-plan check | completed | semantic/check-complete pass recorded | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| issue-5113:held-primary-drag-scroll-lifecycle | #5113 body, native recording, reporter clarification | On homepage `/`, start at “Welcome to the Plate Playground!”, keep primary button held, scroll the editor downward past Images/Media and the table/TOC, then move back upward without release | Model and native selection focus keep following pointer in both vertical directions while `buttons=1`; the editor stays at the user-selected scroll position; text-selection feedback stays active; floating toolbar stays absent until the real primary release; editor remains usable afterward | reporter: #5113 expected behavior + acceptance criteria + reporter clarification that the button stayed held | e2e-required: jsdom cannot reproduce native contenteditable selection, a live overflow scroller, capture-phase `buttons=1`, and toolbar visibility during one held browser gesture | macOS desktop Chromium at 1540x1026 on source-built current `next`; exact reporter Chrome/build `NOT_ENOUGH_INFO` | `apps/www/tests/browser/selection-drag-scroll.spec.ts`; `PLAYWRIGHT_BASE_URL=http://localhost:3002 pnpm --filter www exec playwright test tests/browser/selection-drag-scroll.spec.ts --config playwright.config.ts --project=chromium --workers=1` from `apps/www` | completed | dirty:219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493 | Patch |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| issue-5113:held-primary-drag-scroll-lifecycle | base-acceptance | #5113 summary/steps/expected/actual | during-action | With primary still held, further vertical pointer movement must continue changing selection; frozen range is forbidden | required | model@during-action, dom-native@during-action, pointer-feedback@during-action | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |
| issue-5113:held-primary-drag-scroll-lifecycle | base-acceptance | #5113 acceptance criteria | during-action | Drag selection must extend and shrink in both vertical directions during editor scrolling | required | model@during-action, dom-native@during-action | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |
| issue-5113:held-primary-drag-scroll-lifecycle | base-acceptance | #5113 expected/actual + recording 00:05–00:08 | during-action | Floating selection toolbar must remain absent until primary release | required | popup@during-action, pointer-feedback@during-action | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |
| issue-5113:held-primary-drag-scroll-lifecycle | recording | native attachment `05185729-a224-4e51-bc0f-996d033d11bc` 00:00–00:04 | during-action | Selection initially tracks downward through Images/Media and TOC | required | model@during-action, dom-native@during-action | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |
| issue-5113:held-primary-drag-scroll-lifecycle | recording | same attachment 00:05–00:08 | during-action | View jumps toward document top and the selection stops changing despite continued movement | required | model@during-action, dom-native@during-action | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |
| issue-5113:held-primary-drag-scroll-lifecycle | reporter-delta | user clarification “是的 我当时一直没松” retained in #5113 maintainer context | during-action | The primary button remained physically held after selection stopped | required | pointer-feedback@during-action | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| issue-5113:held-primary-drag-scroll-lifecycle | model | during-action | yes | Selection focus advances downward and retreats upward with the held pointer while the scroller stays at the user-selected position | Focus freezes/collapses or a held move yanks the scroller toward the anchor before primary release | browser editor-harness selection snapshots plus scroller position | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |
| issue-5113:held-primary-drag-scroll-lifecycle | dom-native | during-action | yes | Native Selection focus/range follows the same downward/upward endpoints without resetting the scroller | Native range freezes, clears, diverges, or causes a scroll-to-origin jump while held | browser native Selection snapshots and live scroller position | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |
| issue-5113:held-primary-drag-scroll-lifecycle | pointer-feedback | during-action | yes | reporter-noun: selection drag; affordance-inventory: editor text cursor, active native/model text range, floating selection toolbar owner; interaction remains a held primary drag with text-selection feedback | Event path reports release/buttonless movement or UI advertises completed selection while primary is held | browser capture-phase pointer/mouse trace plus cursor, active-range, and toolbar observation | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: interaction-trace: pass; target: editor; event: mousemove; buttons: 1; toolbar absent while held |
| issue-5113:held-primary-drag-scroll-lifecycle | focus | during-action | yes | Homepage editor remains the focused selection owner throughout held scrolling | Focus moves to page chrome, void media controls, toolbar, or body before release | browser `document.activeElement` and editor focus assertion | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |
| issue-5113:held-primary-drag-scroll-lifecycle | popup | during-action | yes | Floating selection toolbar remains absent for the complete `buttons=1` interval and may appear only after actual primary release | Toolbar mounts/opens before release | browser toolbar DOM visibility paired to capture-phase event state | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |
| issue-5113:held-primary-drag-scroll-lifecycle | geometry-paint | during-action | no | N/A: the claim is range endpoint/lifecycle and toolbar visibility, not selection-layer pixel fidelity or duplicate paint | N/A: no pixel-layer count or visual-fidelity acceptance claim | N/A: model/native range and DOM visibility are authoritative for this case | N/A: no paint test | N/A: no paint claim |
| issue-5113:held-primary-drag-scroll-lifecycle | runtime-errors | during-action | yes | No page error overlay or console error occurs during the held gesture | Runtime/console error interrupts selection handling | browser runtime-error recorder | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |
| issue-5113:held-primary-drag-scroll-lifecycle | follow-up-input | follow-up | yes | After release, a new click/selection or keyboard move in the editor succeeds with a coherent selection | Stale drag state, lost focus, or corrupt selection blocks the next input | browser follow-up click/ArrowRight and editor-harness selection snapshot | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#issue-5113:held-primary-drag-scroll-lifecycle | pass: final fresh-server exact E2E passed 5/5 with no retry |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| issue-5113:held-primary-drag-scroll-lifecycle | 1 | completed | "bash" "-lc" "set -e; for run in 1 2 3 4 5; do echo \"fresh-stability-run:$run\"; cd /Users/felixfeng/Desktop/repos/plate-copy/apps/www; PLAYWRIGHT_BASE_URL=http://localhost:3002 pnpm --filter www exec playwright test tests/browser/selection-drag-scroll.spec.ts --config playwright.config.ts --project=chromium --workers=1; done" | pass: exit 0 in 23978ms | dirty:219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493 | sha256:6348c89630dd608d1125dde9f30550756e887db67622df0f18838ce5407a0221 | 9 | .changeset/quiet-drag-scroll.md,apps/www/playwright.config.ts,apps/www/src/app/(app)/page.tsx,apps/www/src/components/playground-preview.tsx,apps/www/tests/browser/selection-drag-scroll.spec.ts,packages/plite-react/src/editable/input-state.ts,packages/plite-react/src/editable/root-interaction-controller.ts,packages/plite-react/src/editable/selection-controller.ts,packages/plite-react/test/selection-controller-contract.ts | pid:15067;started:2026-08-27T04:01:06.000Z;base-url:http://localhost:3002;browser:chromium | 2026-08-27T03:58:22.754Z | 2026-08-27T04:01:41.217Z | 2026-08-27T04:02:05.195Z | 0 | sha256:267b0258faaa52b04e1be0491d08c56334b6ec765b651e1023516f516baf139d |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite React selection/root interaction | issue-5113:held-primary-drag-scroll-lifecycle | red: scrollTop collapsed to 3/348px | 2026-08-27T03:58:22.754Z | fresh-server five-run exact E2E | sha256:6348c89630dd608d1125dde9f30550756e887db67622df0f18838ce5407a0221 | pass: 5/5 retries 0 |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Exact E2E and scoped format | invalid locator/scroll host plus two format findings | proof-host/code-format | repaired locator/scroller and formatting | pass: fresh E2E 5/5 and scoped format rerun |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| none | 0 | N/A: expected pre-fix RED is not a failed claimed fix | N/A: no failed claimed fix | N/A: no prior candidate/kept/completed claim | N/A: no Regression repair required | N/A: no workflow test required | N/A: no architecture trigger | N/A: no escalation | N/A: Patch may start from reproduced attempt 1 |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| issue-5113:held-primary-drag-scroll-lifecycle | 0 | none: no failed-fix or cross-layer architecture trigger | patch | N/A: no reusable public API change | N/A: existing Plite React interaction owner can be repaired locally | accepted: exact browser RED reaches the existing root-interaction/selection path without API redesign |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| issue-5113:held-primary-drag-scroll-lifecycle | Plite React selection/root interaction | fresh `apps/www` `/`, PID 15067 | fresh process plus Browser editor visible/no errors | source-first Plite React | pass |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| issue-5113:held-primary-drag-scroll-lifecycle | exact E2E RED at 3/348px | Plite React owner, existing E2E/unit, changeset | exact E2E, 50 tests, typecheck, 5 runs, P1 | complete handoff | pass |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| issue-5113:held-primary-drag-scroll-lifecycle | fresh PID 15067 Chromium | 5 | pass, pass, pass, pass, pass | 0 | completed |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| issue-5113:held-primary-drag-scroll-lifecycle | RED/GREEN, 50 tests, typecheck, 5/5, P1 clean | keep | completed local, uncommitted, unpushed | exact reporter build unknown | coordinator |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| issue-5113:held-primary-drag-scroll-lifecycle | Regression proof-host/routing | no-change | existing Regression methodology retained; no source change | pass: semantic validator and receipt | completed |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Initial browser probes | Regression | three invalid probes | synthetic auto-scroll/wheel targeting mismatch | high | replaced with deterministic live scroller plus real held move |

Findings:

- #5113 is open and has no comments. Exact Beta commit/package versions remain `NOT_ENOUGH_INFO`.
- The supplied 8.26 s recording shows selection reaching Images/Media and TOC, then the viewport jumps back toward the document top while the selected endpoint stops responding.
- Current source has two plausible owners: Plite React root-interaction drag/autoscroll selection and the homepage floating-toolbar mousedown/mouseup lifecycle. Root cause is not yet assigned.
- Exact current RED: after the editor scroller is confirmed beyond 1200px, one capture-traced editor `mousemove` with `buttons=1` and no release event resets scrollTop to 3px. The test stops before toolbar/follow-up assertions.

Timeline:

- 2026-08-27: loaded Regression methodology and Autogoal; created active goal and issue-prefixed plan.
- 2026-08-27: read live #5113, downloaded/inspected the native recording, recorded base ref and plan-only dirty boundary, and inventoried adjacent selection/toolbar owners.
- 2026-08-27: rejected three proof-host failures (ambiguous heading locator, insufficient native auto-scroll distance, wheel targeting outer page), then reproduced the product failure with direct editor-scroller movement plus a real held editor mousemove.

Decisions and tradeoffs:

- One combined held gesture covers downward extension and upward shrink because #5113 defines one lifecycle with two required directions; splitting it before reproduction would duplicate the same native state owner.
- Do not patch the toolbar merely because it appears early: that is downstream evidence. The first RED must identify whether the selection controller, browser event path, or toolbar release gate owns the failure.

Review fixes:

- P1 invocation 1 found a queued pre-drag restore hole; `selectionScrollRestoreEpoch` invalidates it. Invocation 2 was clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Ambiguous heading locator matched the editor string and TOC button | 1 | Target `[data-plite-string="true"]` inside the editor | resolved; rerun reached the gesture |
| Synthetic drag auto-scroll stopped at 350px | 2 | Separate editor scroll from held mousemove so the browser owner is exercised deterministically | resolved; exact product RED reached |
| `mouse.wheel` targeted outer page while held | 1 | Apply scroll to the actual editor scroller, then deliver real `buttons=1` mousemove | resolved; exact product RED reached |

Verification evidence:

- Exact RED: held editor mousemove reset scrollTop to 3/348px with `buttons=1` and no release.
- 50 focused tests, Plite React typecheck, scoped format, fresh exact E2E 5/5, Browser zero errors, P1 clean.
- Receipt: `sha256:267b0258faaa52b04e1be0491d08c56334b6ec765b651e1023516f516baf139d`.

Final handoff:

- executable cases: issue-5113 case completed.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: all executable rows pass.
- failed-fix invalidation and automatic repair: N/A; no claimed fix failed.
- proof receipts and affected-corpus replay: final receipt and 5/5 replay recorded.
- started-gate failure closure: proof-host/format failures repaired and rerun.
- changed files: three source files, unit contract, E2E, changeset, plan.
- design decisions: invalidate stale deferred restores by epoch; synchronous-only restore while held.
- tests and proof: focused tests/typecheck/format, fresh E2E 5/5, Browser readback, P1 clean.
- source/generated sync: N/A; no agent/generated source changed.
- P1 and agent-native findings: P1 hole fixed; second pass clean; agent-native N/A.
- residual risks and next owner: reporter build unknown; coordinator owns commit/push/public status.
- local completion status and integration/public-status boundary: completed locally, uncommitted/unpushed; #5113 untouched.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | completed local closeout |
| Where am I going? | coordinator commit/push/replay only if later requested |
| What is the goal? | fix #5113 locally without losing held-button drag selection or opening the toolbar before release |
| What have I learned? | the recording proves a real endpoint freeze plus viewport jump; current source already has drag/autoscroll and toolbar release state that require exact event attribution |
| What have I done? | exact RED/GREEN, durable fix/tests/changeset, fresh 5/5 receipt, Browser readback and P1 review |

Open risks:

- Exact reporter browser/build is unknown; final claim is current local `next`, not historical Beta reproduction or shipped status.
- Browser automation may not synthesize the same native long-drag path; if so, improve the proof host or keep the exact claim blocked rather than accepting a proxy.
