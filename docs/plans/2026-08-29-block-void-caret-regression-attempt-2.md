# block void caret regression attempt 2

Objective:
INVALIDATED by the attempt-3 reporter contradiction: this packet removed the
caret and restored HR deletion but compressed the visible block equation.
Its completion, receipt authority, screenshots, and pushed fixed claim are
revoked.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-29-block-void-caret-regression-attempt-2.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: `/blocks/playground`; selecting the horizontal
  rule or block equation still paints a caret on a separate row below the void.
- lane and current source owner: first repair Regression validator/rules, then
  classify the Plite React void text renderer from frozen product bytes.
- selected executable test cases: `block-void-following-spacing`, attempt 2,
  covering the reporter's HR and equation screenshots and exact selection path.
- tested ref or dirty-state boundary: current dirty base
  `0e63449224823a52ee4032d8fb90bea6bc2ae228`; attempt-1 receipt is invalid.
- route / proof host and freshness method: fresh source-built www host, exact
  `/blocks/playground`, real native selection/caret in Chrome 151, five runs.
- invocation mode / timebox: reporter-contradiction failed-fix interrupt,
  one-shot execution, no timebox.

First checkpoint:

- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Fill the selected-case, reporter-oracle, failed-fix, and architecture tables,
  then run `validate-regression-plan.mjs` before implementation.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:

- Attempt-1 `completed`, receipt, pixel green, and plan authority are invalid.
- Regression source and validator require applicable same-phase `dom-native`
  and `focus` oracles when reporter evidence names a caret-accessible or
  editable blank line; an executable workflow test rejects the failed packet.
- The exact current route proves both reported voids RED through the real
  click/selection path before product edits.
- One permanent browser-native regression test is RED then green, because jsdom
  cannot certify native caret paint.
- Five retry-free fresh Chrome runs show the void selection/highlight without a
  separate visible caret row; exact browser coverage proves selected-HR
  Backspace deletion, Undo restoration, and the next valid edit.
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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-29-block-void-caret-regression-attempt-2.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-29-block-void-caret-regression-attempt-2.md`

Constraints:

- Preserve the valid document model, block selection/highlight, normal spacing,
  keyboard navigation, Undo, and inline-void platform behavior.
- Do not hide the caret with route CSS or change the fixture to mask the issue.
- Do not reuse the invalid attempt-1 receipt or screenshots as attempt-2 proof.
- Do not commit, push, publish, open/update a PR or issue, or change release
  state.
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

- allowed source owners: `.agents/rules/regression*` for mandatory workflow
  repair; after that, the smallest Plite React void text owner proven by RED.
- allowed proof/test owners: Regression validator tests, existing Plite React
  DOM contracts as support, and the smallest existing browser test owner that
  can assert native caret paint on the exact Plate route.
- generated/source boundary: edit `.agents/rules/**` only, then run `pnpm
  install` to sync `.agents/skills/**`; never hand-edit generated skill mirrors.
- browser/device claim width: desktop exact Chrome 151 on `/blocks/playground`;
  no mobile or raw-device claim.
- forbidden product/API/release/public mutations: app-only CSS mask, fixture
  deletion, public API change, unrelated editor behavior, commit/push/PR/issue.
- orchestration mode and writer ownership: one sequential main-thread writer;
  no concurrent product or workflow writer.

Output budget strategy:

- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap logs and exclude generated/build trees.
- Limit reads to the failed plan, Regression validator/rule tests, void text
  renderer, and existing browser tests. Cap ordinary output at 12,000 tokens.

Blocked condition:

- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:

- current phase: invalidated by attempt-3 reporter contradiction
- current executable case: block-void-following-spacing attempt 2
- current case status: failed fix; compressed block-equation layout
- next owner: attempt-3 Regression workflow repair and exact reproduction
- goal status: invalidated

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | New reporter screenshots show a native caret row below both HR and equation; the final reporter delta says selected HR cannot be deleted with Backspace. |
| Regression methodology loaded | yes | Reloaded Regression skill and methodology after contradiction. |
| Active goal checked or created | yes | Goal `01a048fe-25cf-7bf1-9b82-358633825ea4` created for attempt 2. |
| Current source owner and tested ref recorded | yes | Workflow owner is `.agents/rules/regression*`; product owners are Plite React void rendering/spacer and Chrome/WebKit keyboard input strategy; dirty base `0e63449`. |
| Executable test cases discovered | yes | Permanent owner is a new focused `apps/www/tests/browser/block-void-caret.spec.ts` exact-route test; package DOM test remains support-only. |
| Cumulative reporter evidence resolved | yes | Original image 1, original correct image 2, both 2026-08-29 caret screenshots, and selected-HR Backspace deletion remain required. |
| Reporter oracle matrix resolved | yes | All eight observations resolve below; caret evidence requires same-phase DOM/native and focus plus follow-up input. |
| Regression semantic validator ready | yes | Added caret-specific mechanical enforcement and RED/green workflow test; 72 workflow contracts and source/mirror parity pass. |
| Route/proof-host readiness plan recorded | yes | Fresh source host on port 3100; in-app Browser reproduces HR selection inside `<br>` marker; exact Chrome 151 required for final caret paint. |
| Patch delegation boundary recorded | yes | Patch may edit only Plite React void rendering/spacer, selected-void keyboard deletion, and exact tests; no app CSS, fixture, or public API. |
| Orchestrator writer ownership recorded | yes | One sequential main-thread writer; workflow and product edits serialized. |
| Output budget strategy recorded | yes | Exact workflow, renderer, and browser test owners only; generated/build trees excluded. |
| Claim width and blocked rules recorded | yes | Exact desktop Chrome caret-paint claim; block only if native interaction cannot be made repeatable after proof-host repair. |

Work Checklist:

- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work:
      invalidate attempt 1, repair the missed caret oracle first, reproduce both
      screenshots exactly, preserve valid void behavior, and make no Git/public
      mutation.
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
      `dom-native` and `focus` plus `follow-up-input@follow-up`; exact Chrome
      proved native paint independently from wrapper geometry and markers.
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
| Named completion threshold | yes | Close the selected case and methodology row | pass: attempt 2 completed locally with exact 5/5 proof |
| Current-source readiness | yes | Prove source owner and final dirty boundary | pass: private Plite React owners on dirty `0e63449`; source hashes recorded below |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: source host PID 60631 on port 3100, Chrome 151 exact route |
| Executable regression coverage | yes | Record red, green, and owning invariant | pass: marker/package RED; permanent package and exact-route browser tests green |
| E2E escalation closure | yes | Record the lower-layer limitation | pass: e2e-required because jsdom cannot certify native caret paint or real HR click deletion |
| Cumulative reporter evidence closure | yes | Map every reporter delta to an oracle | pass: both caret screenshots and selected-HR Backspace delta are required and green |
| Reporter oracle closure | yes | Resolve all eight observations | pass: model, native DOM, focus, popup, paint, errors, and follow-up are green; pointer feedback is N/A |
| Failed-fix interrupt closure | yes | Invalidate attempt 1 and repair Regression | pass: old receipt revoked; caret workflow test RED then green; 72 contracts pass |
| Architecture pressure closure | yes | Complete Best API and Plite plan | pass: no public API; private void anchor/spacer and keyboard owners accepted |
| Proof receipt closure | yes | Validate a final receipt | pass: attempt-2 receipt uses unchanged issue-owned inputs, zero retries |
| Affected-corpus replay closure | yes | Replay shared owners after final edit | pass: Plite React 1102, Yjs 223, Plite Layout, browser smoke, and exact case pass |
| Shared-style consumer closure | yes | Inventory spacer consumers | pass: shared `PliteSpacer` owns block void anchors; inline void shell stays separate; package contracts pass |
| Started-gate failure closure | yes | Rerun every failed gate | pass: Node-22 `check:plite:dev`, exact 5/5 E2E, and final pixel controls pass |
| Smallest-probe closure | yes | Record the first falsifying probe | pass: real HR click exposed `n` plus `<br>` and headed Chrome showed z-only still painted a caret |
| Patch delegation closure | yes | Record one-case Patch evidence | pass: root cause, owners, files, red/green, fingerprints, stability, and caveat are below |
| Focused verification closure | yes | Run owning and exact-route tests | pass: full Plite React and exact Chrome-binary case pass |
| Stability closure | yes | Run five retry-free final replays | pass: Playwright 5/5 and headed Chrome 5/5, retries 0 |
| Packet decision closure | yes | Keep or reject the selected case | pass: one case kept and completed locally |
| Local completion status | yes | Separate local result from integration | pass: uncommitted and unpushed; no shipped/integrated claim |
| No duplicate registry | yes | Avoid sidecar behavior stores | pass: no registry, TSV, JSON manifest, or database created |
| Generated/source and host repair | yes | Repair mirrors and proof host | pass: `pnpm install`, sync check, fresh host, exact Chrome connection |
| Orchestrator writer closure | no | Record why orchestration is N/A | N/A: one sequential main-thread writer and one port-3100 host |
| Workflow slowdown closure | yes | Repair proof-host mistakes | pass: headed pixels replaced invalid headless pixels; Node version and click phase failures closed |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer | pass: repair-now added mechanical caret oracle enforcement |
| Source/generated sync | yes | Sync agent mirrors | pass: `pnpm install` and `sync-resources --check` exact |
| Agent-native review | yes | Audit the changed workflow | pass: report route, source, mirror, and proof are agent-executable |
| Final handoff contract | yes | Record decisions, proof, sync, reviews, and risk | pass: final handoff below is complete |
| Autoreview | no | Record repo-policy exception | N/A: branch `next` forbids the autoreview helper; direct P1 diff audit found no issue |
| Regression semantic plan | yes | Run the complete validator | pass: final semantic validator exits 0 |
| Goal plan complete | yes | Run the Autogoal checker | pass: final completion checker exits 0 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | latest screenshots, invalidation, scope, goal, and constraints recorded | source/host readiness |
| Current source and proof-host readiness | completed | workflow owner repaired; fresh source host port 3100; Browser exact click trace | discover executable cases |
| Executable case discovery and selection | completed | permanent www browser test plus three package block-void contracts | smallest probe |
| Cumulative reporter evidence inventory | completed | original base/correct images and both latest contradiction screenshots retained | reporter oracle expansion |
| Reporter oracle expansion | completed | caret DOM/native, focus, paint, popup, and follow-up rows are applicable | semantic validation |
| Pre-implementation semantic validation | completed | structural validator passed before product edit; final complete validation passes | smallest probe |
| Smallest high-value probe | completed | HR click anchors selection in `n` marker with `<br>` and 18px row | reproduce/classify |
| Reproduce, classify, and red test | completed | exact Chrome-binary E2E RED on `n`; three package contracts RED on `n` | patch delegation |
| One-case Patch delegation | completed | private void anchor/spacer and selected-void keyboard owners fixed; package/E2E tests added | verification |
| Focused verification and stability | completed | `check:plite:dev` pass; Playwright 5/5; headed Chrome 5/5; pixel controls pass | packet decision |
| Keep/revert/quarantine | completed | keep one locally completed attempt-2 packet | methodology delta |
| Methodology repair/no-change/defer | completed | repair-now: mechanical caret oracle enforcement and workflow test | next case or closure |
| Reviews and final handoff | completed | direct P1 and agent-native audits pass; autoreview N/A on `next` | goal-plan check |
| Final goal-plan check | completed | semantic validator and Autogoal checker pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| block-void-following-spacing | original images 1/2, 2026-08-29 HR/equation screenshots, selected-HR Backspace report, `/blocks/playground` | Click HR, Backspace-delete it, Undo; click equation and close its editor; inspect native selection/focus/caret paint; edit and Undo the next real heading | Block void selection/highlight remains usable, selected HR deletes and restores, editor focus stays valid, no separate native caret row paints below either void, and the next real edit works | accepted-product-law: `docs/vision/plite.md` browser selection/caret, deletion, Undo, and follow-up typing law plus reporter deltas | e2e-required: jsdom cannot certify native caret paint or the exact browser click/delete path; owner-level marker and keyboard tests remain support | exact-chrome: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, Google Chrome 151.0.7922.174, fresh `/blocks/playground` | `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium block-void-caret.spec.ts` | completed | dirty:0e63449224823a52ee4032d8fb90bea6bc2ae228 | user decides whether to commit/push |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| block-void-following-spacing | base-acceptance | original supplied image 1 and prior equation report | after-action | HR and equation must not expose a caret-accessible blank row below the void | required | dom-native@after-action, focus@after-action, geometry-paint@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: both use `z` without `<br>`; headed Chrome classifier sees zero caret lines in 5/5 |
| block-void-following-spacing | positive authority | original supplied image 2 | after-action | Void content and following headings keep normal compact layout | required | geometry-paint@after-action | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: selected voids keep compact layout and following headings retain normal placement |
| block-void-following-spacing | latest-reporter-delta | `/var/folders/zk/h7279l1s6ps280dtf1l1tjpr0000gn/T/codex-clipboard-8b017e29-d14d-48bb-863a-e54b7bbed2fb.png` | after-action | Selecting HR must not paint a caret on a separate editable row | required | dom-native@after-action, focus@after-action, geometry-paint@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: HR remains selected/focused with `z`, no `<br>`, transparent spacer caret, and zero classified caret lines |
| block-void-following-spacing | latest-reporter-delta | `/var/folders/zk/h7279l1s6ps280dtf1l1tjpr0000gn/T/codex-clipboard-45da3e65-29ff-4f12-9beb-844a6b219e19.png` | after-action | Closing/selecting the block equation must not paint a caret below the selected equation | required | dom-native@after-action, focus@after-action, geometry-paint@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: equation remains selected/focused with `z`, no `<br>`, transparent spacer caret, and zero classified caret lines |
| block-void-following-spacing | latest-reporter-delta | user message: selected HR cannot be deleted with Backspace | after-action | Backspace removes the selected HR and Undo restores it | required | model@after-action, dom-native@after-action, focus@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: HR count changes 1 -> 0 -> 1, editor remains focused, retries 0 |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| block-void-following-spacing | model | after-action | yes | Fixture stays intact; Backspace removes only selected HR and Undo restores it | Fixture masking, adjacent-node deletion, or failed Undo changes document semantics | package keyboard contract and exact browser model count | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: HR count 1 -> 0 -> 1; equation and following heading stay intact |
| block-void-following-spacing | dom-native | after-action | yes | HR native selection stays in its void anchor; equation selection remains active; both anchors use `data-plite-zero-width="z"` without `<br>` | A line-break marker `n`, `<br>`, separate native caret row, or stale deleted HR survives | exact-chrome browser interaction plus package DOM contracts | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: package contracts and 5/5 exact runs observe `z`, no `<br>`, correct delete/restore |
| block-void-following-spacing | pointer-feedback | during-action | no | N/A: report concerns native caret/focus after selection, not cursor or hover feedback | N/A: no pointer-feedback claim | N/A: no pointer-feedback proof | N/A: no pointer-feedback test | N/A: no pointer-feedback claim |
| block-void-following-spacing | focus | after-action | yes | Editor owns focus after HR selection/deletion/Undo and equation Done; focus does not advertise a phantom editable row | Focus moves to a phantom row, remains trapped in equation textarea, or leaves the editor | exact-chrome browser focus assertion | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: editor remains or regains focus at every asserted phase |
| block-void-following-spacing | popup | after-action | yes | Equation popover closes on Done while the equation remains selected | Popover remains open or steals focus after Done | browser popup lifecycle assertion | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: Done closes the popover and editor regains focus |
| block-void-following-spacing | geometry-paint | after-action | yes | Selected HR/equation paints its valid control/highlight with no vertical caret line in the row below | A native caret line paints below either void, even when wrapper height is zero | exact-chrome pixel capture/classification: `.tmp/regression/block-void-caret-attempt2/pixel-classifier.py` on selected-phase screenshots | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: positive-control: pass (HR/equation 1); negative-control: pass (0); duplicate-control: pass (2); final HR/equation 0 in all five runs |
| block-void-following-spacing | runtime-errors | after-action | yes | Selection, deletion, Undo, popover close, and follow-up input emit no runtime error | Exception, hydration error, or error overlay appears | exact browser runtime error recorder | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: all 5/5 E2E runs call `runtimeErrors.assertNone()` |
| block-void-following-spacing | follow-up-input | follow-up | yes | Backspace/Undo works, then clicking the real Callouts heading, typing `!`, and undoing edits it normally | Caret suppression breaks deletion, redirects input, loses the edit, or breaks Undo | exact-chrome browser follow-up deletion, typing, and Undo | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: exact 5/5 replays complete both Undo paths with zero retries |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| block-void-following-spacing | 2 | completed | "/bin/zsh" "-lc" "source /Users/felixfeng/.nvm/nvm.sh && nvm use >/dev/null && node --test --test-reporter=dot .agents/rules/regression/scripts/test-first-contract.test.mjs .agents/rules/regression/scripts/validate-regression-plan.test.mjs .agents/skills/regression/scripts/test-first-contract.test.mjs .agents/skills/regression/scripts/validate-regression-plan.test.mjs && node .agents/rules/plate-next/scripts/sync-resources.mjs --check && pnpm --filter @platejs/plite-react test && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium block-void-caret.spec.ts && python3 .tmp/regression/block-void-caret-attempt2/pixel-classifier.py" | pass: exit 0 in 18813ms | dirty:0e63449224823a52ee4032d8fb90bea6bc2ae228 | sha256:087669c3723e16de5aff950a2c767ef390ece02aa087dea32d9aa3324f3b08ca | 39 | .agents/rules/regression.mdc,.agents/rules/regression/references/methodology.md,.agents/rules/regression/scripts/validate-regression-plan.mjs,.agents/rules/regression/scripts/validate-regression-plan.test.mjs,.agents/skills/regression/SKILL.md,.agents/skills/regression/references/methodology.md,.agents/skills/regression/scripts/validate-regression-plan.mjs,.agents/skills/regression/scripts/validate-regression-plan.test.mjs,.changeset/plite-block-void-spacing.md,.tmp/regression/block-void-caret-attempt2/final-equation-1.png,.tmp/regression/block-void-caret-attempt2/final-equation-2.png,.tmp/regression/block-void-caret-attempt2/final-equation-3.png,.tmp/regression/block-void-caret-attempt2/final-equation-4.png,.tmp/regression/block-void-caret-attempt2/final-equation-5.png,.tmp/regression/block-void-caret-attempt2/final-hr-1.png,.tmp/regression/block-void-caret-attempt2/final-hr-2.png,.tmp/regression/block-void-caret-attempt2/final-hr-3.png,.tmp/regression/block-void-caret-attempt2/final-hr-4.png,.tmp/regression/block-void-caret-attempt2/final-hr-5.png,.tmp/regression/block-void-caret-attempt2/pixel-classifier.py,.tmp/regression/block-void-caret-attempt2/reported-equation-caret.png,.tmp/regression/block-void-caret-attempt2/reported-hr-caret.png,apps/www/playwright.config.ts,apps/www/src/app/(blocks)/blocks/playground/page.tsx,apps/www/src/registry/components/editor/horizontal-rule.tsx,apps/www/src/registry/components/editor/math.tsx,apps/www/src/registry/examples/playground-demo.tsx,apps/www/src/registry/examples/values/playground-value.tsx,apps/www/tests/browser/block-void-caret.spec.ts,docs/plans/templates/regression.md,packages/plite-react/src/components/editable-text-blocks.tsx,packages/plite-react/src/editable/keyboard-input-strategy.ts,packages/plite-react/src/shell-runtime.ts,packages/plite-react/test/keyboard-input-strategy-contract.test.ts,packages/plite-react/test/plite-void-shell-contract.test.tsx,packages/plite-react/test/primitives-contract.test.tsx,packages/plite-react/test/primitives-contract.tsx,packages/plite-react/test/surface-contract.test.tsx,packages/plite-react/test/surface-contract.tsx | pid:60631;started:2026-08-29T07:33:04.000Z;base-url:http://localhost:3100;browser:exact-chrome:151.0.7922.174;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-29T08:32:33.903Z | 2026-08-29T08:36:51.384Z | 2026-08-29T08:37:10.197Z | 0 | sha256:bde873bf052fa8236af2bb39beca4eb5bd3a14255d85c1644e5f87b29bd02e0e |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite React block-void anchor/spacer, selected-void keyboard deletion, exact Plate route | block-void-following-spacing | red: E2E observes `n`/`<br>`; headed Chrome still paints a caret after z-only; selected HR Backspace is a no-op | 2026-08-29T08:32:33.903Z | receipt command above: 72 workflow contracts, mirror parity, Plite React 1102, exact Chrome-binary E2E, controlled pixel classifier | sha256:087669c3723e16de5aff950a2c767ef390ece02aa087dea32d9aa3324f3b08ca | pass: final shared-owner corpus and 5/5 stability green |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Headless Playwright caret pixels | Normal text positive control stayed at 0 across 12 frames | invalid proof-host pixel oracle | Remove headless native-caret pixel claim; keep real interaction/marker E2E and require headed Chrome pixels for final paint | pass: revised E2E reaches exact HR marker and headed controlled pixels certify final paint |
| Clicking absolute zero-width locator | Playwright waited 45s because the hidden anchor is not visibly actionable | interaction path mismatch | Click visible HR; for equation use visible Edit equation and Done path | pass: visible-control E2E reproduces RED and final exact case passes 5/5 |
| Sentinel-only z marker | Headed Chrome still painted a caret below selected HR | product RED, not proof failure | Make the shared block-void spacer's caret non-painting while preserving native selection/focus | pass: transparent computed caret plus controlled pixels, 5/5 |
| Selected HR Backspace | Reporter says Backspace cannot delete; exact route reproduces HR count staying 1 | product RED in keyboard owner | Run Chrome/WebKit selected-void override before generic deletion and delete a transient NodeSelection fragment | pass: Backspace count 1 -> 0; Undo restores 1; package covers Backspace and Delete |
| `check:plite:dev` browser smoke | Node 24 rejected by repo's Node-22 browser gate | command environment | Activate `.nvmrc` Node 22 and rerun the exact gate | pass: all typechecks/tests/smoke exit 0 |
| First 5-run follow-up input | Run 2 scrolled on `End`; heading text stayed unchanged | proof interaction not proven native | Click the text tail and poll the collapsed native selection at the actual text end before typing | pass: restarted 5/5 exact runs, zero retries |
| Refreshed Chrome tab | Old tab handle was cleaned up before final pixels | proof-host connection | Bind a fresh controlled Chrome tab and rebuild helpers against it | pass: headed Chrome state/pixel runs 5/5 |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| block-void-following-spacing | 1 | Reporter screenshots after attempt-1 completion show caret rows below HR and selected equation | reporter-contradiction | yes: attempt-1 green, receipt, plan completion, and handoff revoked | repair-now: `.agents/rules/regression/scripts/validate-regression-plan.mjs`, Regression rule/reference/template, generated mirror | pass: caret-visible workflow test RED then green; 72 contracts and sync parity pass | yes: timer-focus-correctness | best-api: accepted no-public-surface target; plite-plan: accepted private void-anchor law and proof slices | reproduced: attempt-2 exact Browser and E2E observe `n` marker with `<br>` before product edits |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| block-void-following-spacing | 1 | timer-focus-correctness | escalate | required: best-api rejected every public/app control; keep private Plite React void anchor/spacer and keyboard input owners | plite-plan: keep Range click selection, make the block-void anchor sentinel-only and non-painting, use transient NodeSelection only for deletion, prove package plus exact browser/follow-up behavior | accepted: source, upstream Slate, Vision, reporter deltas, Browser reproduction, and RED tests agree |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| block-void-following-spacing | `.agents/rules/regression*`; Plite React void renderer/spacer and keyboard input strategy | Regression Node tests; Plite React Vitest; exact www route; exact Chrome-binary Playwright; headed Chrome final paint | workflow mirrors synced; fresh PID 60631 port-3100 source host; final receipt fingerprints 39 inputs | no generated product output edits; agent mirrors generated only by `pnpm install` | pass: current source and exact proof host validated |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| block-void-following-spacing | E2E/package marker RED; headed z-only pixel RED; selected-HR Backspace RED | private block-void zero-width/spacer and Chrome/WebKit selected-void keyboard deletion plus exact package/E2E tests; forbid app CSS, fixture, or public API | full Plite React, `check:plite:dev`, affected corpus, exact E2E 5/5, headed Chrome pixels 5/5, focus/popup/delete/Undo/follow-up | root cause: empty block void child was classified as line break; invisible native anchor still painted; generic deletion preempted dead void fallback and block-unit delete was a no-op. Files/hashes: `editable-text-blocks.tsx` 822aea..., `shell-runtime.ts` ecda73..., `keyboard-input-strategy.ts` 0db06d..., E2E f36161...; direct P1 pass; no public API | pass: one-case Patch completed locally |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| block-void-following-spacing | Regression failed-fix workflow | one repair pass plus full contracts | rule/methodology/template/validator/test/mirrors pass; old plan is rejected | 0 | repair completed before product retry |
| block-void-following-spacing | exact Chrome-binary Playwright on `/blocks/playground` | 5 fresh runs after final test bytes | 5/5: select HR, Backspace delete, Undo restore, select equation, no paint marker, next heading edit and Undo | 0 | stable |
| block-void-following-spacing | headed Chrome 151 selected-phase state and pixels | 5 fresh runs after final product bytes | 5/5 HR and 5/5 equation: selected, focused, z, no `<br>`, transparent caret, classified caret count 0 | 0 | stable |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| Headless caret pixel sampling | controlled positive/negative probes | reject as native paint authority | headless screenshot API never painted even a normal caret | none for final claim; headed Chrome owns paint | Regression methodology repaired |
| block-void-following-spacing attempt 2 | package/full Plite gates, exact E2E receipt, headed pixels 5/5 | keep and mark locally completed | desktop Chrome block void caret, selected-HR Backspace/Undo, following edit | no cross-browser paint claim beyond package WebKit branch coverage; uncommitted/unpushed | user decides commit/push |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| block-void-following-spacing | Attempt-1 geometry receipt allowed a caret-visible report to close without same-phase native/focus and follow-up oracles | repair-now | `.agents/rules/regression.mdc`, Regression methodology/template, mechanical validator/test, generated mirrors | pass: workflow test RED then green; 72 contracts; source/mirror exact; invalid attempt-1 plan rejected | reporter contradiction resolved before attempt 2 |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Headless pixel probe | proof host | 12 frames / one probe | headless API omitted caret paint | high: invalidated a false oracle | headed Chrome required for paint |
| `check:plite:dev` first final run | command environment | 112s / normal | shell used Node 24; browser gate requires Node 22 | high: all typechecks/package tests passed before smoke | `.nvmrc` Node 22 rerun passed exact gate |
| Exact E2E stability first batch | browser test | run 2 / expected 5 | `End` default-scrolled because native heading selection was not proven | high: prevented false follow-up green | tail click plus native collapsed-at-end poll; restarted 5/5 |
| Headed Chrome final batch | Chrome connection | one stale tab / normal cleanup | prior controlled tab was removed | low | fresh controlled tab; final state/pixels 5/5 |

Findings:

- Attempt 1 fixed layout flow but not native caret paint. Both latest screenshots
  show the remaining caret row while the void stays selected.
- Before attempt 2, HR/equation empty children were misclassified as normal
  empty-block line breaks: `data-plite-zero-width="n"` plus `<br>`.
- A sentinel-only `z` marker removed the line break but did not stop native
  Chrome caret paint. The shared block-void spacer must also own a transparent
  caret while keeping the real native selection and editor focus.
- Selected-HR Backspace reached the generic destructive command before the old
  Chrome/WebKit void fallback. That fallback was unreachable and its block-unit
  delete was a no-op. The exact void override now runs first and deletes a
  transient NodeSelection fragment without changing click selection semantics.
- Upstream Slate classifies void text before empty-block line breaks and renders
  a sentinel-only zero-width string inside its absolute spacer.
- Regression workflow repair now rejects caret-visible evidence unless
  same-phase `dom-native` and `focus` plus follow-up input are applicable.

Timeline:

- 2026-08-29: reporter contradicted attempt-1 completion with HR and equation
  caret screenshots; receipt and completion invalidated.
- 2026-08-29: workflow test failed before validator repair, then passed after
  caret-oracle enforcement; `pnpm install` synced mirrors and 72 contracts pass.
- 2026-08-29: Best API and Plite quick-plan pressure selected the existing
  internal zero-width resolver and rejected any new public or app-owned control.
- 2026-08-29: fresh Browser click reproduced the HR native selection inside a
  line-break marker and confirmed the same marker below the equation.
- 2026-08-29: z-only rendering stayed visually red in headed Chrome; shared
  spacer caret suppression produced controlled pixel green without losing focus.
- 2026-08-29: the reporter's Backspace delta reproduced a dead selected-void
  fallback; transient NodeSelection deletion fixed Backspace/Delete and Undo.
- 2026-08-29: final Node-22 Plite gate, exact Playwright 5/5, headed Chrome 5/5,
  controlled pixels, receipt, direct review, and semantic completion pass.

Decisions and tradeoffs:

- Best API verdict: add no public API. Hard-cut any prop, flag, plugin, CSS
  class, or component-specific exception. The private Plite React renderer is
  the only surviving authority.
- Plite quick-plan target: a void's required selection anchor uses the existing
  zero-width sentinel without `<br>` and the shared block-void spacer never
  paints its native caret; ordinary empty blocks keep line-break markers,
  inline void shell behavior stays separate, and Plate components remain
  unchanged.
- Keep the public click selection as a collapsed Range. For Backspace/Delete,
  create a transient private NodeSelection only at mutation dispatch so the
  exact selected void is removed and Undo remains canonical.
- Execution slices: workflow repair -> exact browser RED -> package marker RED
  -> headed z-only RED -> private resolver/spacer fix -> Backspace RED -> private
  keyboard fix -> package/browser/follow-up proof. Public adoption, docs
  migration, and compatibility are N/A because no public shape changes.
- `caret-color: transparent` is accepted only on the existing absolute
  block-void spacer, whose sole job is an invisible selection anchor. The
  native selection, editor focus, marker shape, pixels, deletion, and next edit
  are all asserted independently, so this is not the attempt-1 geometry mask.

Review fixes:

- Agent-native review PASS: user report -> Regression route -> rule/validator
  source -> generated mirror -> exact workflow commands are discoverable and
  executable.
- P1 autoreview is N/A while the current branch is `next`; repo policy forbids
  invoking the helper there.
- Direct P1 diff audit PASS: no public API, fixture mask, route CSS, selection
  ownership change, inline-void spacer change, stale generated mirror, or
  untested keyboard direction remains.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Workflow mirror parity failed before sync | 1 | Run required `pnpm install` after source changes | Resolved; 72 contracts and `sync-resources --check` pass |
| First Browser state read used `instanceof HTMLElement` unsupported by the page evaluator | 1 | Read attributes directly from `document.activeElement` | Resolved; HR native selection/marker evidence captured |
| z-only marker still showed a caret in headed Chrome | 1 | Move paint ownership to the existing invisible block-void spacer | Resolved; controlled headed pixels are 0 in 5/5 |
| Selected HR Backspace was a no-op | 1 | Trace keydown ordering and mutation command shape | Resolved; override precedes generic deletion and dispatches `delete-fragment` with NodeSelection |
| First final Plite gate used Node 24 | 1 | Activate repository Node 22 and rerun exact gate | Resolved; `check:plite:dev` passes |
| First exact 5-run batch lost native heading selection on run 2 | 1 | Assert collapsed native selection at the text tail before typing | Resolved; restarted batch passes 5/5 |
| Final headed Chrome tab handle was stale | 1 | Bind a fresh controlled tab and rebuild helpers against it | Resolved; final headed batch passes 5/5 |

Verification evidence:

- command: caret workflow test RED before validator change and green after.
- command: 72 Regression source/generated workflow tests pass; required skill
  resources are exact.
- source-audit: Regression rule, methodology, template, validator, test, and
  generated mirror all contain the mechanical caret requirement.
- red: package contracts expected `z` but observed `n`; headed Chrome proved
  z-only still painted; exact route proved selected HR Backspace did not delete.
- focused green: full Plite React suite passes 75 files and 1102 tests; keyboard
  contract covers both Backspace/backward and Delete/forward NodeSelection
  deletion before generic commands.
- broad green: Node-22 `pnpm check:plite:dev` passes 48-package typechecks,
  Plite React 1102, Yjs 223, Plite Layout, and Chromium smoke.
- exact green: Chrome-binary Playwright passes 5/5 fresh runs with zero retries;
  every run deletes/restores HR, selects both voids without `<br>`, edits/undoes
  the real following heading, and records no runtime error.
- headed Chrome green: 5/5 HR and equation runs stay selected/focused with `z`,
  no `<br>`, and transparent caret. Controlled classifier results are positive
  HR 1, positive equation 1, negative 0, duplicate 2, final 0 for all ten crops.
- final receipt: attempt 2, dirty `0e63449`, 39 unchanged inputs, exact Chrome
  151 host PID 60631, retries 0; digest and ID are in the receipt table.
- formatting/direct audit: Ultracite passes changed code/tests; `git diff
  --check` passes; P1 direct audit passes; autoreview is policy-N/A on `next`.
- release metadata: `.changeset/plite-block-void-spacing.md` names block-void
  caret rendering and selected-void deletion; `pnpm changeset status` passes.

Final handoff:

- executable cases: one selected case, completed locally on attempt 2
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  both caret screenshots and selected-HR Backspace are green; all eight
  observation classes are resolved
- failed-fix invalidation and automatic repair: attempt 1 is revoked; Regression
  now mechanically rejects caret reports without native/focus/follow-up oracles
- proof receipts and affected-corpus replay: final receipt plus full Plite React,
  `check:plite:dev`, exact 5/5, headed 5/5, and controlled pixels pass
- started-gate failure closure: headless pixels, hidden-anchor click, z-only
  paint, Node version, follow-up selection, and stale Chrome tab are closed
- changed product owners: Plite React editable void children, shared block-void
  spacer, selected-void keyboard input strategy, package contracts, exact browser
  case, and one patch changeset
- changed workflow owners: Regression rule, methodology, validator/test,
  template, and generated mirrors; attempt-1 plan remains invalidated
- design decisions: no public API/app CSS/fixture change; Range selection remains;
  transient NodeSelection is private to deletion
- tests and proof: recorded above and in receipt; all final gates pass
- source/generated sync: `pnpm install` plus exact resource audit pass
- P1 and agent-native findings: direct P1 PASS, agent-native PASS, autoreview N/A
  on branch `next`
- residual risks and next owner: no known defect in the exact claim; paint was
  certified on desktop Chrome 151, with WebKit keyboard direction package
  coverage but no Safari pixel claim; user decides commit/push
- local completion status and integration/public-status boundary: completed
  locally, uncommitted and unpushed; not integrated, shipped, or released

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | final locally completed attempt-2 audit |
| Where am I going? | hand off uncommitted/unpushed code and exact proof to the user |
| What is the goal? | remove native caret rows and restore selected-HR Backspace without breaking focus, Undo, or later input |
| What have I learned? | line-break classification, invisible spacer paint, and selected-void deletion ordering were three independent defects |
| What have I done? | invalidated attempt 1, repaired Regression, fixed all three private owners, and passed final package/Chrome/pixel stability gates |

Open risks:

- None for the exact desktop Chrome 151 claim. Safari/WebKit pixel paint was not
  claimed; its selected-void keyboard direction is covered at package level.
- Changes remain uncommitted and unpushed because the user did not request Git
  mutation.
