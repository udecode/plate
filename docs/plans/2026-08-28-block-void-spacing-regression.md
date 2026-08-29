# block void spacing regression

Objective:
Remove the extra editable line after horizontal-rule and block-equation voids;
done when exact regression proof passes and the real route matches the supplied
correct layout.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-28-block-void-spacing-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: the editor page shown in the supplied images;
  horizontal-rule and block-equation voids render an extra editable blank line
  before their following heading.
- lane and current source owner: Plate registry/editor rendering; exact owner is
  a required discovery gate before product edits.
- selected executable test cases: `block-void-following-spacing`, covering both
  reported block voids on the exact page.
- tested ref or dirty-state boundary: current checkout bytes, with issue-owned
  file fingerprints captured in the final proof receipt.
- route / proof host and freshness method: exact route to be discovered from the
  fixture text, then run on a freshly started source-built dev server and verify
  with Browser.
- invocation mode / timebox: explicit `regression`, one-shot execution, no
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

- One executable regression test fails before the fix and passes after it for
  both the horizontal rule and block equation.
- Five retry-free warm real-route checks show no caret-accessible blank line or
  extra void-owned vertical row and match the spacing in supplied image 2.
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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-28-block-void-spacing-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-block-void-spacing-regression.md`

Constraints:

- Preserve the fixture's actual paragraph/heading content and normal spacing;
  do not hide model paragraphs with a screenshot-only CSS hack.
- Fix both reported block voids, not just the block equation remembered from an
  older report.
- Do not commit, push, publish, open or update a PR/issue, or change release
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

- allowed source owners: the smallest Plate registry/editor rendering owner
  proven to create the extra void row.
- allowed proof/test owners: existing owner-level test file when possible;
  existing browser test only if no unit/DOM runner can reproduce exact geometry.
- generated/source boundary: edit Plite React source and its package test only;
  the www route imports workspace source through `PLATE_WWW_DEV_SOURCE=1`; never
  edit `apps/www/src/__registry__`, `apps/www/public`, or templates by hand.
- browser/device claim width: desktop route and viewport represented by the two
  supplied screenshots; no mobile or raw-device claim.
- forbidden product/API/release/public mutations: public API changes, unrelated
  editor behavior, generated-file hand edits, commits, pushes, PRs, issues, and
  releases.
- orchestration mode and writer ownership: Regression owns the plan; one Patch
  worker may own the single case after RED; no concurrent writer or shared host.

Output budget strategy:

- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap logs and exclude generated/build trees.
- Search only source/tests containing the visible fixture strings or block-void
  render owners. Cap each source read and test log at 8,000 output tokens.

Blocked condition:

- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:

- current phase: failed-fix invalidation
- current executable case: block-void-following-spacing
- current case status: reporter-contradiction; attempt-1 proof invalid
- next owner: Regression repair and attempt 2 plan
- goal status: invalidated by fresh reporter evidence on 2026-08-29

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Supplied image 1 identifies extra rows after two voids; supplied image 2 is the correct visual outcome; user requested a fix through Regression. |
| Regression methodology loaded | yes | Read `.agents/skills/regression/references/methodology.md` completely before goal/test/product work. |
| Active goal checked or created | yes | Goal `01a048fe-25cf-7bf1-9b82-358633825ea4` created for this plan. |
| Current source owner and tested ref recorded | yes | `packages/plite-react/src/components/editable-text-blocks.tsx` passes custom block-void children directly instead of through `PliteSpacer`; base ref `0e63449224823a52ee4032d8fb90bea6bc2ae228`. |
| Executable test cases discovered | yes | Extend `packages/plite-react/test/surface-contract.tsx` test `renderElement owns void nodes when renderVoid is omitted`; exact runner uses `surface-contract.test.tsx`. |
| Cumulative reporter evidence resolved | yes | Supplied image 1 requires removal after horizontal rule and block equation; supplied image 2 defines the compact correct layout. Older memory confirms only the equation symptom and is supporting provenance, not current root-cause authority. |
| Reporter oracle matrix resolved | yes | Eight observations resolved below for `block-void-following-spacing`. |
| Regression semantic validator ready | yes | `.agents/skills/regression/scripts/validate-regression-plan.mjs` exists and will run before mutable product work. |
| Route/proof-host readiness plan recorded | yes | Fresh `www dev:plite` host on port 3100, route `/blocks/playground`, fixture heading observed, current DOM measured before edits. |
| Patch delegation boundary recorded | yes | After RED, Patch may edit only the block-void render path and its owner-level test; no fixture or app CSS workaround. |
| Orchestrator writer ownership recorded | yes | One sequential main-thread writer; no subagent or overlapping host writer. |
| Output budget strategy recorded | yes | Exact fixture/owner searches only; generated/build trees excluded; per-command output capped. |
| Claim width and blocked rules recorded | yes | Desktop exact-route claim only; block if the exact route cannot render current source after safe host repair. |

Work Checklist:

- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work:
      fix the extra line after both voids, use image 2 as the positive layout,
      preserve real document content, and make no Git/GitHub/release mutation.
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
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: one case completed with unit RED/green, five exact-Chrome runs, pixel controls, and `no-change` methodology decision |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: `dirty:0e63449224823a52ee4032d8fb90bea6bc2ae228`, receipt input digest `sha256:461534132a859f4ae29c2d442eebdcd564dce7c320d8b1099233c8df39282b22` |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: fresh `www dev:plite` PID 15166, source mode, `/blocks/playground`, exact Chrome 151.0.7922.174 |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: existing `surface-contract.tsx` test was RED on missing spacer and green after the shared owner fix |
| E2E escalation closure | yes | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | pass: `unit-red`; no new E2E test added |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pass: both supplied images and the older equation-only report map to DOM and geometry rows |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all eight observations and every applicable interaction phase per case | pass: all eight observations have executable evidence or explicit N/A reasons |
| Failed-fix interrupt closure | no | N/A: no candidate, kept, or completed fix failed | N/A: expected RED and proof-host failures occurred before any completion claim |
| Architecture pressure closure | no | N/A: zero failed fixes and no architecture trigger | N/A: direct shared Plite React owner repair, no public API change |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: receipt `sha256:09ebfdb80074cd4af53d66298ec82db50761aa145dd8d54665c6f91116dbf96d` |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: 4 focused files / 76 tests, Plite React full 1101 tests, and final receipt command passed after the last owner edit |
| Shared-style consumer closure | no | N/A: no shared CSS selector, marker class, or style expansion changed | N/A: fix wraps existing children with existing `PliteSpacer` |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: formatting, Node-22 `check:plite:dev`, Chrome stability, pixel classifier, and receipt reruns all passed |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: exact route showed direct in-flow void text children and the package test failed only on missing spacer |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | pass: one sequential Patch packet returned root cause, two code/test files, changeset, green commands, browser proof, and architecture verdict |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: focused Vitest plus exact-Chrome route replay and pixel classifier |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: five final fresh-host Chrome assertions and captures, no product retry |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | pass: keep |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pass: completed locally on dirty base `0e63449`; uncommitted and unpushed |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: executable test is the durable behavior owner; `.tmp` contains receipt-only screenshots/classifier, not case state |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: fresh source host used; no generated output edited |
| Orchestrator writer closure | no | N/A: no orchestrator or subagent writer was used | N/A: one sequential main-thread writer and one managed host |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: corrected test entry, Node version, Chrome read phases, dynamic crop, and absolute Python path |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | pass: `no-change`; Regression correctly froze product bytes and forced proof-host repair without a workflow-source defect |
| Source/generated sync | no | N/A: no agent source, generated skill, registry output, or barrel changed | N/A: `pnpm install` and source-mirror parity are not required |
| Agent-native review | no | N/A: no agent workflow, skill, prompt, command contract, or action surface changed | N/A: product DOM rendering only |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: recorded below |
| Autoreview | no | N/A: repository hard rule forbids autoreview while the current branch is `next`; direct diff review and `git diff --check` passed | N/A: no helper invocation allowed on `next` |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-28-block-void-spacing-regression.md --complete` | pass: final command rerun after this row was recorded |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-block-void-spacing-regression.md` | pass: final command rerun after this row was recorded |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | explicit prompt requirements, goal, and boundaries recorded | source/host readiness |
| Current source and proof-host readiness | completed | base `0e63449`; fresh port 3100 route renders current fixture | discover executable cases |
| Executable case discovery and selection | completed | one package DOM case covers the shared block-void invariant | smallest probe |
| Cumulative reporter evidence inventory | completed | both supplied images and older supporting report accounted for | reporter oracle expansion |
| Reporter oracle expansion | completed | all eight observations resolved below | semantic validation |
| Pre-implementation semantic validation | completed | structural Regression validator passed before RED | smallest probe |
| Smallest high-value probe | completed | fresh route exposed missing spacers and 18px in-flow rows | reproduce/classify |
| Reproduce, classify, and red test | completed | focused package test failed on null spacer | patch delegation |
| One-case Patch delegation | completed | direct Plite React block-void owner fixed; no app workaround | verification |
| Focused verification and stability | completed | package proof, Node-22 development gate, five exact-Chrome runs, pixel controls | packet decision |
| Keep/revert/quarantine | completed | keep | methodology delta |
| Methodology repair/no-change/defer | completed | no-change: method caught and repaired proof-host mistakes | next case or closure |
| Reviews and final handoff | completed | direct diff review clean; autoreview N/A on `next`; handoff recorded | goal-plan check |
| Final goal-plan check | completed | semantic and structural commands pass on final plan | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| block-void-following-spacing | supplied images 1 and 2; latest reporter screenshots on 2026-08-29; `/blocks/playground` fixture | Render and select custom horizontal-rule and equation block voids followed immediately by headings | Void selection/highlight remains usable without painting a separate native caret row below the void | reporter: latest screenshots and rejection on 2026-08-29 | e2e-required: jsdom cannot certify native caret paint; prior package DOM test is support-only | exact-chrome: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, Google Chrome 151.0.7922.174, fresh `www dev:plite` route `http://localhost:3100/blocks/playground` | attempt-2 browser-native test selected in `docs/plans/2026-08-29-block-void-caret-regression-attempt-2.md` | failed-fix-invalidated | dirty:0e63449224823a52ee4032d8fb90bea6bc2ae228 | Regression repair, Best API, Plite plan, then attempt 2 |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| block-void-following-spacing | base acceptance | supplied image 1 | after-action | Horizontal rule and block equation each expose a visible, caret-accessible blank row | required | dom-native@after-action, focus@after-action, geometry-paint@after-action | test: packages/plite-react/test/surface-contract.tsx#renderElement owns void nodes when renderVoid is omitted | red: latest reporter replay proves the caret row survives |
| block-void-following-spacing | positive authority | supplied image 2 | after-action | Each void occupies only its visible control; following heading starts after normal component spacing | required | geometry-paint@after-action | test: packages/plite-react/test/surface-contract.tsx#renderElement owns void nodes when renderVoid is omitted | pass: all five final screenshots classify correct against image 2 |
| block-void-following-spacing | supporting provenance | prior 2026-08-05 block-equation report | after-action | Block equation had an extra caret-accessible blank line; prior root cause was unconfirmed | required | dom-native@after-action | test: packages/plite-react/test/surface-contract.tsx#renderElement owns void nodes when renderVoid is omitted | pass: shared owner fix covers the current equation and horizontal-rule reproductions |
| block-void-following-spacing | latest-reporter-delta | `/var/folders/zk/h7279l1s6ps280dtf1l1tjpr0000gn/T/codex-clipboard-8b017e29-d14d-48bb-863a-e54b7bbed2fb.png` | after-action | Selecting the horizontal rule still paints a caret on a separate row below it | required | dom-native@after-action, focus@after-action, geometry-paint@after-action | test: packages/plite-react/test/surface-contract.tsx#renderElement owns void nodes when renderVoid is omitted | red: reporter contradiction invalidates attempt 1 |
| block-void-following-spacing | latest-reporter-delta | `/var/folders/zk/h7279l1s6ps280dtf1l1tjpr0000gn/T/codex-clipboard-45da3e65-29ff-4f12-9beb-844a6b219e19.png` | after-action | Selecting the block equation still paints a caret below the selected equation | required | dom-native@after-action, focus@after-action, geometry-paint@after-action | test: packages/plite-react/test/surface-contract.tsx#renderElement owns void nodes when renderVoid is omitted | red: reporter contradiction invalidates attempt 1 |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| block-void-following-spacing | model | setup | yes | Fixture keeps `horizontalRule -> heading` and `equation -> heading` adjacent | No synthetic paragraph or fixture deletion may hide the DOM bug | package source audit and unit test | test: apps/www/src/registry/examples/values/playground-value.spec.tsx#is deterministic and already satisfies the trailing-block invariant | pass: fixture has no intervening node |
| block-void-following-spacing | dom-native | after-action | yes | Custom block-void editable children live inside one `data-plite-spacer` selection anchor with zero layout height | Empty text child is a normal in-flow direct child or creates its own caret row | package DOM unit test and exact-chrome DOM measurement | test: packages/plite-react/test/surface-contract.tsx#renderElement owns void nodes when renderVoid is omitted | pass: both spacers present, height 0, and no direct zero-width child in five final runs |
| block-void-following-spacing | pointer-feedback | during-action | no | N/A: report names no cursor, hover, pointer-held, drag, or tooltip behavior | N/A: no pointer-feedback claim | N/A: geometry and DOM only | N/A: no pointer case | N/A: no pointer case |
| block-void-following-spacing | focus | after-action | no | N/A: invalid attempt-1 oracle omitted the reported native caret/focus behavior | N/A: invalid attempt-1 oracle | N/A: invalid attempt-1 oracle | N/A: invalid attempt-1 oracle | N/A: reporter contradiction proves this row was wrongly excluded |
| block-void-following-spacing | popup | after-action | no | N/A: no popup or toolbar is opened or closed in the report | N/A: no overlay state exists | N/A: no popup proof applies | N/A: no popup test applies | N/A: no popup claim |
| block-void-following-spacing | geometry-paint | after-action | yes | Horizontal rule and block equation show one visible control row each; their empty selection anchor adds zero height and the next heading follows normal spacing | An extra blank painted row or void height contributed by the empty child | exact-chrome pixel capture and classification against supplied correct, absent-row, and duplicate-row controls, plus package DOM geometry | test: packages/plite-react/test/surface-contract.tsx#renderElement owns void nodes when renderVoid is omitted | pass: positive-control: pass; negative-control: pass; duplicate-control: pass; five fixed captures classify correct with HR gap 52 and section gap 165 |
| block-void-following-spacing | runtime-errors | after-action | yes | Route loads with no app error overlay and no new console error from void rendering | Runtime exception, hydration error, or error overlay | exact-chrome browser route and console read | test: packages/plite-react/test/surface-contract.tsx#renderElement owns void nodes when renderVoid is omitted | pass: five final route runs and final Chrome console read contain 0 errors |
| block-void-following-spacing | follow-up-input | follow-up | no | N/A: no popup close, input corruption, or follow-up edit is part of the report | N/A: removing layout height does not alter editing commands | N/A: no follow-up proof applies | N/A: no follow-up test applies | N/A: no follow-up claim |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| block-void-following-spacing | 1 | completed | "/bin/bash" "-lc" "test -x \"$1\" && pnpm --filter @platejs/plite-react test:vitest test/surface-contract.test.tsx -t \"renderElement owns void nodes when renderVoid is omitted\" && /opt/homebrew/bin/python3 .tmp/regression/block-void-spacing/pixel-classifier.py .tmp/regression/block-void-spacing/reported-extra-row.png .tmp/regression/block-void-spacing/reported-correct.png .tmp/regression/block-void-spacing/fixed-run-{1,2,3,4,5}.png" "proof" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" | pass: exit 0 in 2421ms | dirty:0e63449224823a52ee4032d8fb90bea6bc2ae228 | sha256:461534132a859f4ae29c2d442eebdcd564dce7c320d8b1099233c8df39282b22 | 18 | .changeset/plite-block-void-spacing.md,.tmp/regression/block-void-spacing/fixed-run-1.png,.tmp/regression/block-void-spacing/fixed-run-2.png,.tmp/regression/block-void-spacing/fixed-run-3.png,.tmp/regression/block-void-spacing/fixed-run-4.png,.tmp/regression/block-void-spacing/fixed-run-5.png,.tmp/regression/block-void-spacing/pixel-classifier.py,.tmp/regression/block-void-spacing/reported-correct.png,.tmp/regression/block-void-spacing/reported-extra-row.png,apps/www/src/app/(blocks)/blocks/playground/page.tsx,apps/www/src/registry/components/editor/horizontal-rule.tsx,apps/www/src/registry/components/editor/math.tsx,apps/www/src/registry/examples/playground-demo.tsx,apps/www/src/registry/examples/values/playground-value.tsx,packages/plite-react/package.json,packages/plite-react/src/components/editable-text-blocks.tsx,packages/plite-react/test/surface-contract.tsx,packages/plite-react/vitest.config.mjs | pid:15166;started:2026-08-28T16:07:26.000Z;base-url:http://localhost:3100/blocks/playground;browser:exact-chrome;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-28T16:11:38.144Z | 2026-08-28T16:12:15.491Z | 2026-08-28T16:12:17.913Z | 0 | sha256:09ebfdb80074cd4af53d66298ec82db50761aa145dd8d54665c6f91116dbf96d |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| `packages/plite-react/src/components/editable-text-blocks.tsx` block-void custom render path | block-void-following-spacing | pass: existing focused test passed at base `0e63449`; exact route was red for the new invariant | 2026-08-28T15:49:49.000Z | focused Vitest plus five exact-Chrome captures and pixel classifier through final receipt | sha256:461534132a859f4ae29c2d442eebdcd564dce7c320d8b1099233c8df39282b22 | pass: receipt began after last owner edit and all affected proof passed |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Focused package test command | `test/surface-contract.tsx` matched no test files | proof-command error | Use runner entry `test/surface-contract.test.tsx` | pass: corrected focused command ran 1 test with 54 skipped |
| Source discovery shell command | unmatched single quote | command-shape error | Remove the nested single-quoted alternation and rerun exact `rg` | pass: exact route/registry search returned results |
| Ultracite | source import order was unformatted | started formatting gate | Run scoped `ultracite fix`, then rerun scoped check and affected tests | pass: scoped check reports correct format; 4 files / 76 tests pass on final bytes |
| `pnpm check:plite:dev` | browser smoke refused Node v24.11.1 before reporter assertion | proof-host environment | Activate `.nvmrc` Node v22.21.1 and rerun the entire gate | pass: all 48-package typechecks, Plite React 1101 tests, Yjs 223 tests, Plite Layout 57 tests, and Chromium smoke 3/3 passed |
| Chrome stability proof | selector/CDP timeout before reporter assertion | proof-host locator | Replace text locator with direct current-DOM readiness read and restart count | pass: final five assertions ran through the direct DOM path |
| Chrome stability proof | offscreen KaTeX had not painted inside the same tool call | proof-host phase sampling | Split warm capture and final assertion across browser turns; assert `.katex` and equation height above 80px | pass: five final runs show complete KaTeX at 86.1640625px |
| Pixel classifier | fixed crop height omitted the second heading | proof-host capture geometry | Increase capture height to 420 and validate with a probe | pass: both headings classified |
| Pixel classifier | reconnected Chrome had a narrower viewport and fixed `x=420` clipped heading text | proof-host capture geometry | Derive clip x from the current heading rectangle | pass: five final captures classify correct |
| Proof receipt | login shell resolved system Python without Pillow | proof-command environment | Use `/opt/homebrew/bin/python3` explicitly | pass: final receipt command exit 0 |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| block-void-following-spacing | 1 | Latest reporter screenshots show visible caret rows below both voids after attempt 1 claimed completion | reporter-contradiction | yes: green, receipt `sha256:09ebfdb80074cd4af53d66298ec82db50761aa145dd8d54665c6f91116dbf96d`, plan completion, and final handoff are invalid | repair-now: require caret evidence to force same-phase DOM/native and focus oracles before another product attempt | pending in attempt-2 workflow repair | timer-focus-correctness | required: best-api plus plite-plan before attempt-2 Patch | base-acceptance: required; latest-reporter-delta: required; attempt 2 cannot resume until workflow repair, Best API, and Plite plan pass |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| block-void-following-spacing | 0 | none: direct owning Plite React block-void repair | patch | N/A: no reusable public API change | N/A: no second failed fix or architecture trigger | pass: current source and upstream Slate both place block-void editable children in a zero-height spacer |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| block-void-following-spacing | `packages/plite-react/src/components/editable-text-blocks.tsx` | package Vitest runner; `/blocks/playground`; fresh `www dev:plite` on port 3100 | dev server started after source read; fixture heading visible; DOM baseline measured from current page | package source is consumed through `PLATE_WWW_DEV_SOURCE=1`; no generated registry edit | pass |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| block-void-following-spacing | RED: `toHaveStyle()` received null because custom block void had no spacer | only `packages/plite-react/src/components/editable-text-blocks.tsx` and `packages/plite-react/test/surface-contract.tsx`; forbid app CSS/fixture/API edits | owning test green plus five retry-free real-route DOM/screenshot checks | root cause: custom `renderElement` path passed block-void children in flow; changed source/test plus changeset; exact RED/green; dirty digest; stability; patch verdict; autoreview N/A on `next`; no residual product risk | completed |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| block-void-following-spacing | fresh `www dev:plite` PID 15166, exact Chrome 151, package test and pixel classifier | 5 | pass: 1/5 through 5/5 each HR gap 20px, equation gap 24px, HR height 50px, complete KaTeX equation height 86.1640625px; each pixel capture classified correct | 0 | completed |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| block-void-following-spacing | attempt-1 unit RED/green and receipt are invalid for native caret paint | block | attempt-1 completion revoked | visible native caret remains below both selected voids | Regression repair and attempt 2 plan |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| block-void-following-spacing | Regression validator allowed required `caret-accessible blank row` evidence while `focus@after-action` was N/A | repair-now | Add executable validator enforcement and mirrored Regression teaching before another product edit | pending in attempt-2 workflow repair | reporter contradiction exposed a mechanical false-green gap |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Initial broad source search | Regression output discipline | oversized / narrow expected | generated public JSON entered output | low after fixture owner found | repaired: all later reads were exact and capped |
| `check:plite:dev` first run | Node version gate | 90s / valid full gate | Node 24 rather than `.nvmrc` 22 | high: found real browser-smoke blocker | repaired: full Node-22 rerun passed |
| Exact-Chrome pixel loop | proof host | several revoked counts / one final 5-run count | extension lifecycle, offscreen paint, fixed crop assumptions | high: prevented false visual green | repaired: direct DOM readiness, split warm/assert phases, dynamic capture, final 5/5 |

Findings:

- Current fixture already places each reported void directly before its heading;
  the model contains no empty paragraph to delete.
- Both custom block voids receive `data-plite-void="true"`, but their empty text
  children render as normal direct DOM children. Neither has
  `data-plite-spacer`.
- The current Browser baseline measures an 18px in-flow zero-width row in each
  reported block void. `PliteVoidShell` already owns the correct zero-height,
  absolute spacer behavior for the `renderVoid` and default void paths.
- Upstream Slate wraps void editable children in an absolute zero-height spacer,
  which supports using the existing Plite owner instead of app CSS.

Timeline:

- 2026-08-28: loaded Regression methodology, created the one-shot goal, and
  captured every explicit request before mutable work.
- 2026-08-28: started fresh source-built www host on port 3100 and reproduced
  both missing-spacer rows on `/blocks/playground`.
- 2026-08-28: corrected the focused Vitest entrypoint and recorded its passing
  pre-edit baseline.

Decisions and tradeoffs:

- Fix the shared Plite React custom block-void child wrapper. Editing the two
  registry components would duplicate the same rule and leave every other
  custom block void broken.
- Keep inline void handling unchanged. Plite has platform-sensitive inline
  anchor ordering, while the report and `PliteVoidShell` contract concern block
  voids.

Review fixes:

- Scoped Ultracite reordered the new import; affected tests and every final
  proof were rerun afterward.
- Direct source review found no accepted finding. Autoreview was not invoked
  because the repository forbids it on `next`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad void/source search included generated public registry JSON and exceeded the planned useful output | 1 | Restrict all later reads to exact source/test files and exclude public/generated trees | Resolved; subsequent reads are bounded |
| Shell alternation had an unmatched quote | 1 | Use one quoted regex without nested shell quotes | Resolved on next command |
| Vitest targeted implementation helper `surface-contract.tsx` instead of runner `surface-contract.test.tsx` | 1 | Use the discovered runner entry | Resolved; focused baseline passed |

Verification evidence:

- source-audit: fixture nodes at `playground-value.tsx` are adjacent with no
  paragraph between either void and its heading.
- command: focused regression test failed before the fix because the spacer was
  null, then passed after the fix.
- command: 4 affected Vitest files passed 76 tests; full Plite React passed 1101
  tests; scoped typecheck and formatting passed.
- command: Node-22 `pnpm check:plite:dev` passed its affected typechecks,
  package suites, and Chromium smoke 3/3.
- exact-chrome: five fresh-host runs passed the DOM geometry assertion with 0
  console errors. All five screenshots classified `correct`; image 1 classified
  `extra-row`, image 2 classified `correct`, and the blank crop classified
  `absent`.
- receipt: `sha256:09ebfdb80074cd4af53d66298ec82db50761aa145dd8d54665c6f91116dbf96d`
  binds 18 inputs, exact Chrome 151.0.7922.174, host PID 15166, dirty base
  `0e63449`, and retry count 0.

Final handoff:

- executable cases: `block-void-following-spacing`, durable owner test at
  `packages/plite-react/test/surface-contract.tsx`.
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  both supplied images and the older equation-only report are covered; all
  eight observations resolve.
- failed-fix invalidation and automatic repair: no failed fix; revoked Chrome
  counts were proof-host failures before completion authority.
- proof receipts and affected-corpus replay: receipt
  `sha256:09ebfdb80074cd4af53d66298ec82db50761aa145dd8d54665c6f91116dbf96d`;
  final affected replay passed.
- started-gate failure closure: every started red gate has an exact passing
  final rerun above.
- changed files: Plite React block-void render owner, its existing contract
  test, one `@platejs/plite-react` patch changeset, and this transient plan.
- design decisions: wrap only custom block void children with the existing
  `PliteSpacer`; keep platform-sensitive inline void behavior unchanged.
- tests and proof: focused RED/green, affected 76, full Plite React 1101,
  Node-22 development gate, exact-Chrome 5/5, pixel controls, 0 console errors.
- source/generated sync: N/A, no agent/generated/barrel/registry source changed.
- P1 and agent-native findings: P1 helper N/A on `next` by hard repo rule;
  direct diff review and `git diff --check` pass; agent-native N/A.
- residual risks and next owner: no known local product risk; any later commit,
  rebase, generation, or push must replay the proof on those final bytes.
- local completion status and integration/public-status boundary: completed
  locally, uncommitted, unpushed, not integrated or released.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | final closure complete |
| Where am I going? | user handoff; no remaining autonomous product work |
| What is the goal? | remove the extra editable row after both custom block voids without changing the fixture or public API |
| What have I learned? | model adjacency was correct; one missing shared `PliteSpacer` exposed each empty void child as a line box |
| What have I done? | added durable RED/green coverage, fixed the shared owner, passed package/development/Chrome/pixel proof, and generated the final receipt |

Open risks:

- Attempt-1 local completion is invalid. Native caret paint remains reproduced
  for both HR and equation. Attempt 2 is tracked in
  `docs/plans/2026-08-29-block-void-caret-regression-attempt-2.md`.
