# block void layout regression attempt 3

Objective:
Restore full-row centered block-equation layout without caret rows and preserve
HR Backspace deletion; done when attempt-3 exact Chrome passes 5/5.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-29-block-void-layout-regression-attempt-3.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: `/blocks/playground`; the pushed attempt-2 fix
  compresses the visible block equation to content width instead of keeping the
  full-row centered layout shown in the reporter's positive reference.
- lane and current source owner: Regression repair first; then Plate UI's copied
  `apps/www/src/registry/components/editor/math.tsx` block-equation trigger.
- selected executable test cases: `block-void:full-row-centered-layout`, attempt
  3, retaining no-caret, HR Backspace/Undo, equation layout, focus, and next edit.
- tested ref or dirty-state boundary: pushed `b10d7ad47c509a91f3bc551a3bd31025f8e64f17`;
  attempt-2 receipt and completion are invalid.
- route / proof host and freshness method: fresh source-built www host, exact
  `/blocks/playground`, exact Chrome, browser geometry/pixels, five fresh runs.
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

- Attempt-2 completion, receipt, final screenshot authority, and pushed fixed
  claim are invalidated by the reporter contradiction.
- Regression source/validator mechanically reject a positive layout reference
  that is reduced to a negative paint oracle without reference geometry and
  executable layout-bounds proof.
- Exact current pushed ref reproduces the compressed equation before product
  edits. A permanent exact-route test is RED on full-row centered layout.
- The equation's visible renderer remains in normal full-row flow and centered
  exactly like the supplied correct image; only the hidden selection anchor is
  non-painting and out of flow.
- HR/equation expose no extra caret row; selected HR Backspace deletes and Undo
  restores; the next real text edit and Undo work.
- Exact Chrome passes five retry-free fresh runs with layout bounds, pixels,
  focus, deletion/Undo, and runtime errors asserted.
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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-29-block-void-layout-regression-attempt-3.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-29-block-void-layout-regression-attempt-3.md`

Constraints:

- Preserve the reporter's correct formula size, horizontal centering, full-row
  layout, following heading spacing, selection feedback, and equation editing.
- Preserve attempt-2 no-caret behavior and selected-HR Backspace/Undo behavior.
- Do not mask compression with route/global CSS, fixture changes, min-width
  hacks, or a public prop/flag. The owning component may express its existing
  block layout with an ordinary full-width class.
- Do not reuse attempt-1 or attempt-2 receipts/screenshots as attempt-3 proof.
- Do not commit, push, create/update PRs/issues, or change release state unless
  the user separately asks.
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

- allowed source owners: first `.agents/rules/regression*` and regression plan
  template/validator; after repair, the copied Plate UI math component, its
  focused spec, exact existing E2E, registry changelog, and generated registry
  outputs.
- allowed proof/test owners: Regression validator contracts, existing Plite
  React void surface contracts, and the existing exact-route
  `apps/www/tests/browser/block-void-caret.spec.ts` affected case.
- generated/source boundary: edit `.agents/rules/**`, then `pnpm install` syncs
  `.agents/skills/**`; product generated registry/templates remain untouched.
- browser/device claim width: desktop exact Chrome on `/blocks/playground`; no
  Safari/mobile/raw-device paint claim.
- forbidden product/API/release/public mutations: app-only CSS, fixture edits,
  public API, compatibility bridge, commit/push/PR/issue/release.
- orchestration mode and writer ownership: one sequential main-thread writer;
  no subagents or overlapping host/source writers.

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

- current phase: final completion audit
- current executable case: block-void:full-row-centered-layout attempt 3
- current case status: attempt 2 invalid; attempt 3 completed locally on dirty `b10d7ad47c`
- next owner: user decision on commit/push; neither is authorized in this turn
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
| Prompt requirements captured | yes | Wrong screenshot shows compressed equation; positive screenshot requires normal full-row centered layout; prior no-caret and Backspace requirements remain. |
| Regression methodology loaded | yes | Current Regression skill and full methodology reloaded after contradiction. |
| Active goal checked or created | yes | Attempt-3 goal created with this exact plan path and 5/5 threshold. |
| Current source owner and tested ref recorded | yes | Pushed bad ref `b10d7ad47c`; Regression then Plate registry `math.tsx` owns block-equation layout. |
| Executable test cases discovered | yes | Existing exact-route `block-void-caret.spec.ts` is affected and will gain reporter geometry assertions; package surface contracts support owner proof. |
| Cumulative reporter evidence resolved | yes | Original no-caret/correct-spacing images, attempt-2 caret screenshots, selected-HR Backspace delta, compressed screenshot, and final correct layout screenshot are all retained. |
| Reporter oracle matrix resolved | yes | All eight observation classes resolve below; geometry requires positive reference bounds/center plus controlled pixels. |
| Regression semantic validator ready | yes | Pushed validator RED accepted missing geometry; current validator/test require reference geometry and layout bounds; 112 source/mirror tests and sync pass. |
| Route/proof-host readiness plan recorded | yes | Fresh port-3100 source host and exact Chrome after workflow repair; pushed ref replay first. |
| Patch delegation boundary recorded | yes | One copied UI component case: full-width block trigger only; no Plite edit, global CSS, fixture, or public API. |
| Orchestrator writer ownership recorded | yes | One sequential main-thread writer; repo rules prohibit subagent delegation here. |
| Output budget strategy recorded | yes | Exact workflow/render/test files only; cap logs and exclude generated/build trees. |
| Claim width and blocked rules recorded | yes | Exact desktop Chrome route/layout/caret/delete claim; block only if exact route cannot run after host repair. |

Work Checklist:

- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work:
      correct full-row centered equation, no caret row, HR Backspace/Undo,
      equation editability, following spacing, no Git/public mutation.
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
- [x] Every required positive layout reference records `reference-geometry:`,
      runs exact-Chrome `layout-bounds`, and finishes with
      `layout-bounds: pass`; no-caret proof alone is insufficient.
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
| Named completion threshold | yes | Close selected case and methodology row | pass: attempt 3 exact/headed Chrome 5/5 and receipt complete |
| Current-source readiness | yes | Prove owner and dirty boundary | pass: Plate registry math owner on dirty `b10d7ad47c`; generated outputs current |
| Route/proof-host readiness | yes | Prove current source host | pass: fresh PID 43838, port 3100, exact Chrome 151 |
| Executable regression coverage | yes | Record RED/green | pass: existing exact E2E RED 536.03125px -> green 0px; workflow RED/green |
| E2E escalation closure | yes | Record lower-layer limitation | pass: jsdom cannot certify page-relative layout plus native caret/input; existing E2E owns case |
| Cumulative reporter evidence closure | yes | Map every delta | pass: original/caret/Backspace/compressed/correct images all remain required and green |
| Reporter oracle closure | yes | Resolve all eight observations | pass: seven applicable rows green; pointer feedback explicitly N/A |
| Failed-fix interrupt closure | yes | Revoke old claims and repair Regression | pass: attempts 1/2 revoked; positive-reference validator/test/mirrors pass |
| Architecture pressure closure | yes | Resolve second-failure owner | pass: Best API + Plate Plan + Plate UI choose direct registry component; no public API/Plite edit |
| Proof receipt closure | yes | Validate final receipt | pass: attempt 3, 40 unchanged inputs, exact Chrome, retries 0 |
| Affected-corpus replay closure | yes | Replay shared owners | pass: matching digest `sha256:84e83a...` after final owner edit |
| Shared-style consumer closure | no | Record N/A | N/A: `w-full` is local to one block-equation trigger; no shared selector/class map changed |
| Started-gate failure closure | yes | Close every started failure | pass: workspace targeting, math mock, Fumadocs cache, Chrome readiness/interaction rows all rerun green |
| Smallest-probe closure | yes | Record first falsifier | pass: live block 700px versus trigger 163.96875px; E2E delta 536.03125px |
| Patch delegation closure | yes | Record one-case evidence | pass: one-line `w-full` owner fix, mock repair, exact proof packet below |
| Focused verification closure | yes | Run owner and route | pass: math 4/4, registry build/check, www typecheck, exact E2E |
| Stability closure | yes | Run five retry-free repetitions | pass: exact E2E 5/5 and headed layout/pixels 5/5, retries 0 |
| Packet decision closure | yes | Keep/revert decision | pass: keep attempt 3 locally |
| Local completion status | yes | Separate local/integration state | pass: local dirty candidate; uncommitted/unpushed in this turn |
| No duplicate registry | yes | Avoid sidecar behavior store | pass: executable tests remain durable authority; `.tmp` only holds proof inputs |
| Generated/source and host repair | yes | Sync mirrors/registry and clean host | pass: `pnpm install`, resource parity, registry generation, clean Fumadocs source |
| Orchestrator writer closure | no | Record N/A | N/A: one sequential main-thread writer and one source host; no subagent allowed |
| Workflow slowdown closure | yes | Repair command/host misses | pass: all four workflow slowdown rows resolved |
| Methodology delta closure | yes | Resolve repair-now | pass: positive reference geometry enforcement is source/test-backed |
| Source/generated sync | yes | Sync agent and registry outputs | pass: required skill resources exact; 379 payloads/15 overlays; changelog 90/90 |
| Agent-native review | yes | Audit workflow action chain | pass: screenshot report -> Regression -> source/mirror -> validator/test -> receipt is executable |
| Final handoff contract | yes | Record proof, decisions, risk, owner | pass: final handoff below complete |
| Autoreview | no | Record repo-policy exception | N/A: branch `next` forbids autoreview; direct P1 diff audit found no actionable issue |
| Regression semantic plan | yes | Run complete validator | pass: semantic validator exits 0 |
| Goal plan complete | yes | Run Autogoal checker | pass: completion checker exits 0 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | exact wrong/correct screenshots, retained requirements, goal, scope, and attempt-3 plan recorded | source/host readiness |
| Current source and proof-host readiness | completed | workflow/registry generated sources current; fresh PID 43838; clean Fumadocs proof cache | discover executable cases |
| Executable case discovery and selection | completed | existing exact-route E2E plus Plite React surface contracts selected | smallest probe |
| Cumulative reporter evidence inventory | completed | all original, attempt-1, attempt-2, Backspace, compressed, and correct-layout evidence retained | reporter oracle expansion |
| Reporter oracle expansion | completed | model/native/focus/popup/layout pixels/errors/follow-up resolved; pointer N/A | semantic validation |
| Pre-implementation semantic validation | completed | validator now rejects attempt-2 packet; 112 contracts, mirrors, agent-native review, Best API/Plite target pass | smallest probe |
| Smallest high-value probe | completed | Browser: block 700px, trigger 163.96875px; center left-shifted | reproduce/classify |
| Reproduce, classify, and red test | completed | exact E2E RED width delta 536.03125px on pushed product bytes | patch delegation |
| One-case Patch delegation | completed | Plate UI component trigger gained `w-full`; stale spec mock repaired | verification |
| Focused verification and stability | completed | workflow 112, math 4/4, registry/typecheck, E2E/headed 5/5, pixels/receipt | packet decision |
| Keep/revert/quarantine | completed | keep attempt-3 local packet | methodology delta |
| Methodology repair/no-change/defer | completed | repair-now: positive layout reference requires executable reference geometry | next case or closure |
| Reviews and final handoff | completed | Best API/Plate Plan/Plate UI, agent-native, direct P1 all pass; autoreview N/A | goal-plan check |
| Final goal-plan check | completed | semantic and Autogoal completion checks pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| block-void:full-row-centered-layout | reporter compressed screenshot and explicit correct screenshot; prior block-void evidence | On pushed `b10d7ad47c`, load `/blocks/playground`; observe unselected equation, select it through Edit/Done, inspect layout/caret/focus; select HR, Backspace, Undo; edit following heading | Equation visible UI stays full-row and formula horizontally centered at the reporter reference size before and after selection; no caret row; HR deletes/restores; next edit works | reporter: `/var/folders/zk/h7279l1s6ps280dtf1l1tjpr0000gn/T/codex-clipboard-1795d768-0e98-4372-b537-0abec6d2cbbe.png` plus still-applicable earlier deltas | e2e-required: jsdom cannot certify page-relative full-row width, horizontal center, native caret paint, and the exact visible interaction together | exact-chrome: fresh `/blocks/playground`, `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` | `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium block-void-caret.spec.ts` | completed | dirty:b10d7ad47c509a91f3bc551a3bd31025f8e64f17 | user decides commit/push |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| block-void:full-row-centered-layout | base-acceptance | original supplied correct image 2 and prior no-extra-row report | after-action | Block equation and following heading keep normal full-row spacing with no caret-accessible blank row | required | dom-native@after-action, focus@after-action, geometry-paint@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: exact layout/caret/follow-up case 5/5 |
| block-void:full-row-centered-layout | latest-reporter-delta | `/var/folders/zk/h7279l1s6ps280dtf1l1tjpr0000gn/T/codex-clipboard-b772f2f7-325f-4fb5-a16a-e46d9fd26e34.png` | after-action | The equation must not compress to a left-aligned content-width box | required | geometry-paint@after-action | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: forbidden 163.96875px button replaced by 700px full-row trigger |
| block-void:full-row-centered-layout | positive-authority | `/var/folders/zk/h7279l1s6ps280dtf1l1tjpr0000gn/T/codex-clipboard-1795d768-0e98-4372-b537-0abec6d2cbbe.png` | after-action | The formula keeps its natural size while its block occupies the row and centers it horizontally above Callouts | required | geometry-paint@after-action | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: block/button 700px, center delta 0, formula 147.96875px in 5/5 |
| block-void:full-row-centered-layout | retained-reporter-delta | 2026-08-29 HR/equation caret screenshots | after-action | Selecting either block void exposes no visible caret row | required | dom-native@after-action, focus@after-action, geometry-paint@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: z/no-br/transparent caret plus controlled pixels 5/5 |
| block-void:full-row-centered-layout | retained-reporter-delta | user report: selected HR Backspace cannot delete | after-action | Backspace removes selected HR and Undo restores it | required | model@after-action, dom-native@after-action, focus@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: every exact E2E run proves HR 1 -> 0 -> 1 and focus retained |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| block-void:full-row-centered-layout | model | after-action | yes | Fixture stays intact; Backspace removes only HR and Undo restores it | Layout repair mutates document content, deletes adjacent nodes, or breaks Undo | package keyboard plus exact browser node counts | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: every exact E2E run proves HR 1 -> 0 -> 1 and unchanged equation/following content |
| block-void:full-row-centered-layout | dom-native | after-action | yes | Equation trigger is a full-width normal-flow sibling of the hidden `z` anchor; no `<br>` or visible caret; HR deletion removes its DOM then Undo restores | Trigger shrinks to content width, line-break marker returns, or deleted HR stays mounted | exact-chrome DOM/native selection plus component/package contracts | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: trigger/block 700px, anchor z/no-br, correct removal/restoration in 5/5 |
| block-void:full-row-centered-layout | pointer-feedback | during-action | no | N/A: report names layout/caret/deletion, not cursor, hover, or held-pointer affordance | N/A: no pointer-feedback claim | N/A: no pointer proof required | N/A: no pointer test | N/A: no pointer claim |
| block-void:full-row-centered-layout | focus | after-action | yes | Editor owns focus after equation Done and HR selection/delete/Undo | Focus stays trapped in equation editor, moves to phantom row, or leaves editor | exact-chrome focus assertion | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: exact E2E and headed selected-state runs retain editor focus |
| block-void:full-row-centered-layout | popup | after-action | yes | Equation editor closes on Done while block returns to normal centered layout | Popover remains open or its close compresses/relocates the equation | exact-chrome popup lifecycle and layout assertion | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: Done closes and the selected block remains 700px centered in 5/5 |
| block-void:full-row-centered-layout | geometry-paint | after-action | yes | reference-geometry: equation block width tracks editor content width, formula center aligns with block center within 2px, natural formula size is preserved, and following heading spacing matches the positive screenshot | Content-width shrink, left alignment, formula scaling, extra caret line, or extra vertical row survives | exact-chrome pixel capture plus executable layout-bounds assertions at unselected and selected phases | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: layout-bounds: pass (700/700px, center 0, formula 147.96875px); positive-control: pass (1); negative-control: pass (0); duplicate-control: pass (2); final caret 0 in 5/5 |
| block-void:full-row-centered-layout | runtime-errors | after-action | yes | Load, select, delete/Undo, popup close, and next edit emit no runtime errors | Exception, hydration error, or error overlay appears | exact browser runtime error recorder | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: exact E2E calls runtime error assertion in all five runs |
| block-void:full-row-centered-layout | follow-up-input | follow-up | yes | Equation remains editable; HR Backspace/Undo works; clicking/typing/undoing the Callouts heading works | Layout fix loses equation editability, deletion, selection, typing, or Undo | exact-chrome visible controls and keyboard follow-up | test: apps/www/tests/browser/block-void-caret.spec.ts#block-void:native-caret-not-painted-below-void | pass: exact E2E completes both Undo paths and equation Edit/Done in 5/5 |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| block-void:full-row-centered-layout | 3 | completed | "/bin/zsh" "-lc" "source /Users/felixfeng/.nvm/nvm.sh && nvm use >/dev/null && node --test --test-reporter=dot .agents/rules/regression/scripts/test-first-contract.test.mjs .agents/rules/regression/scripts/validate-regression-plan.test.mjs .agents/skills/regression/scripts/test-first-contract.test.mjs .agents/skills/regression/scripts/validate-regression-plan.test.mjs && node .agents/rules/plate-next/scripts/sync-resources.mjs --check && bun test apps/www/src/registry/components/editor/math.spec.tsx && pnpm --filter www build:registry && node tooling/scripts/generate-ui-changelog-entries.mjs --check && PLATE_WWW_ASYNC_DOCS=1 pnpm --filter www typecheck && PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium block-void-caret.spec.ts && python3 .tmp/regression/block-void-layout-attempt3/pixel-classifier.py && git diff --check" | pass: exit 0 in 30350ms | dirty:b10d7ad47c509a91f3bc551a3bd31025f8e64f17 | sha256:84e83ab231f08759c58201df63ba2304121066991ed18c1b3f8c2e89baaf9686 | 40 | .agents/rules/regression.mdc,.agents/rules/regression/references/methodology.md,.agents/rules/regression/scripts/validate-regression-plan.mjs,.agents/rules/regression/scripts/validate-regression-plan.test.mjs,.agents/skills/regression/SKILL.md,.agents/skills/regression/references/methodology.md,.agents/skills/regression/scripts/validate-regression-plan.mjs,.agents/skills/regression/scripts/validate-regression-plan.test.mjs,.tmp/regression/block-void-layout-attempt3/final-selected-1.png,.tmp/regression/block-void-layout-attempt3/final-selected-2.png,.tmp/regression/block-void-layout-attempt3/final-selected-3.png,.tmp/regression/block-void-layout-attempt3/final-selected-4.png,.tmp/regression/block-void-layout-attempt3/final-selected-5.png,.tmp/regression/block-void-layout-attempt3/pixel-classifier.py,.tmp/regression/block-void-layout-attempt3/positive-caret.png,.tmp/regression/block-void-layout-attempt3/reported-compressed.png,.tmp/regression/block-void-layout-attempt3/reported-correct.png,apps/www/playwright.config.ts,apps/www/public/r/block-discussion.json,apps/www/public/r/comment.json,apps/www/public/r/floating-toolbar.json,apps/www/public/r/math.json,apps/www/src/app/(blocks)/blocks/playground/page.tsx,apps/www/src/registry/changelog/2026-08-29-fix-block-equation-layout.json,apps/www/src/registry/changelog/components.json,apps/www/src/registry/changelog/entries/2026-08-29-fix-block-equation-layout.mdx,apps/www/src/registry/changelog/index.json,apps/www/src/registry/components/editor/math.spec.tsx,apps/www/src/registry/components/editor/math.tsx,apps/www/src/registry/examples/playground-demo.tsx,apps/www/src/registry/examples/values/playground-value.tsx,apps/www/tests/browser/block-void-caret.spec.ts,docs/plans/2026-08-29-block-void-caret-regression-attempt-2.md,docs/plans/templates/regression.md,packages/plite-react/src/components/editable-text-blocks.tsx,packages/plite-react/src/editable/keyboard-input-strategy.ts,packages/plite-react/src/shell-runtime.ts,packages/plite-react/test/keyboard-input-strategy-contract.test.ts,packages/plite-react/test/primitives-contract.tsx,packages/plite-react/test/surface-contract.tsx | pid:43838;started:2026-08-29T10:55:10.000Z;base-url:http://localhost:3100;browser:exact-chrome:151.0.7922.174;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-29T11:11:33.935Z | 2026-08-29T11:12:57.033Z | 2026-08-29T11:13:27.383Z | 0 | sha256:fd6d926d91d83a48cf6a615c40844af5e61fad47483f18a8411b6c75c38ff5eb |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Regression positive-reference validator plus Plate math registry component/generated outputs | block-void:full-row-centered-layout | red: pushed validator accepted missing positive geometry; exact E2E width delta 536.03125px | 2026-08-29T11:11:33.935Z | receipt command above: workflow, math spec, registry build/check, www typecheck, exact E2E, controlled pixels | sha256:84e83ab231f08759c58201df63ba2304121066991ed18c1b3f8c2e89baaf9686 | pass: final shared-owner replay and exact 5/5 green |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| shadcn info from monorepo root | CLI returned `monorepo_root` and named apps/www | invalid command target | rerun with `-c apps/www`; fetch Button/Popover docs | pass: project context and docs resolved for Radix apps/www |
| direct math Bun spec | two tests reached real Radix because mock targeted stale relative path | adjacent test harness drift | mock the component's actual registry alias import | pass: exact Bun file 4/4, 15 assertions |
| www typecheck docs parity | mixed `.source` modes made parity stop on stale partial `index.ts`; async retry still reused stale file | generated proof-host cache | move `.source` to OS temp backup and regenerate one clean async source | pass: exact www typecheck, docs/registry parity, route types, both TypeScript configs |
| first exact Chrome formula wait | KaTeX attached after the initial extension selector deadline | pre-assertion host readiness | inspect page, wait on rendered counts, then measure | pass: five fresh headed runs measure exact geometry |
| exact Chrome Done locator | first CUA click selected the full-width equation without opening the popover, so no Done button existed | proof interaction mismatch before product assertion | use click-selected state for headed caret/layout pixels; keep actual Edit/Done in exact E2E | pass: headed selected layout 5/5 and exact E2E Edit/Done 5/5 |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| block-void:full-row-centered-layout | 1 | Reporter screenshots showed visible caret rows after attempt-1 layout-height fix | reporter-contradiction | yes: attempt-1 receipt/plan/handoff revoked | repair-now: `.agents/rules/regression.mdc` requires same-phase native/focus/follow-up caret proof | pass: prior validator workflow RED/green, mirrors, and parity | yes: timer-focus-correctness | best-api + plite-plan: accepted no-public-API hidden-anchor target | reproduced: attempt 2 removed caret and later exposed compressed layout |
| block-void:full-row-centered-layout | 2 | Reporter screenshot on pushed `b10d7ad47c` shows equation compressed; explicit positive image requires centered full-row layout | reporter-contradiction | yes: attempt-2 completion, receipt, screenshots, and pushed fixed claim revoked | repair-now: `.agents/rules/regression.mdc` requires positive-reference geometry and executable layout bounds | pass: old validator command RED; new focused test green; old attempt-2 plan rejected; 112 contracts/sync pass | yes: second-failed-fix | best-api + plate-plan + plate-ui: keep Plite anchor; restore full-row layout on the Plate registry block-equation button; no public API | reproduced: pushed ref trigger 163.96875px versus 700px block; exact E2E RED width delta 536.03125px |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| block-void:full-row-centered-layout | 2 | second-failed-fix | escalate | required: best-api rejects props, flags, adapters, Plite changes, and route/global CSS; the existing direct block-equation trigger alone owns its layout | plate-plan: Plate UI `math.tsx` restores the old block-level full-row job with `w-full`; Plite anchor/selection/delete stay unchanged; registry source/changelog/generated output plus exact Chrome proof close adoption | accepted: origin/main used a block-level trigger, v2 uses a shrink-to-fit button, pushed route measured 163.96875px in a 700px block, and the reporter correct image requires centered full-row layout |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| block-void:full-row-centered-layout | Regression source/validator; Plate registry `math.tsx` trigger; existing Plite anchor/delete behavior retained | workflow Node tests; math Bun spec; exact www route E2E; registry build/changelog; Browser and exact Chrome final screenshots | fresh source host PID 43838 on port 3100; exact E2E RED 536.03125px then green; final 700/700px and center delta 0 | agent mirrors generated by `pnpm install`; registry generated only by `build:registry`/changelog generator; templates untouched | pass: final fresh-host receipt and stability validate current bytes |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| block-void:full-row-centered-layout | exact E2E RED: button/block width delta 536.03125px; math spec command repaired and green | `math.tsx`, focused spec mock path, existing E2E geometry, registry changelog/generated outputs; no Plite/API/fixture/global CSS | exact RED/green, math 4/4, registry build/check, exact Chrome layout/caret/delete 5/5, pixels/errors, fresh receipt attempt 3 | root cause: semantic block trigger changed from block `div` to shrink-to-fit `button`; owner/files/commands/ref/fingerprints/stability/architecture/direct P1/caveat | pass: one `w-full` component fix completed locally |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| block-void:full-row-centered-layout | exact Chrome-binary E2E | 5 fresh runs | 5/5: 700/700px, center <=1px, natural formula size, HR delete/Undo, Edit/Done, no caret marker, next edit/Undo, no errors | 0 | stable |
| block-void:full-row-centered-layout | headed Chrome 151 selected-state layout/pixels | 5 fresh runs | 5/5: block/button 700px, center 0, formula 147.96875px, z/no-br, transparent caret, focused, selected | 0 | stable |
| block-void:full-row-centered-layout | controlled caret pixel classifier | positive 1, absent 0, duplicate 2, five finals | all controls pass; final selected caret lines 0 in 5/5 | 0 | valid paint oracle |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| block-void:full-row-centered-layout attempt 3 | workflow RED/green, exact geometry RED/green, math 4/4, registry/typecheck, exact/headed 5/5, pixels, receipt | keep; completed locally | Plate registry block-equation layout plus retained block-void caret/Backspace behavior on desktop Chrome 151 | no Safari pixel claim; no Git mutation in this turn | user decides commit/push |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| block-void:full-row-centered-layout | Attempt-2 retained negative caret proof but omitted the supplied positive layout geometry | repair-now | `.agents/rules/regression.mdc`, methodology, template, validator/test, generated mirrors | pass: old validator RED, focused new test green, 112 contracts, old attempt-2 plan rejection, sync exact | second reporter contradiction closed before product retry |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| shadcn context | CLI | one failed command / expected one | root needs workspace selector | high: correct provider/component context | rerun with `-c apps/www` passed |
| math Bun spec | test harness | two failed tests / expected four | stale mock path missed registry alias | high: adjacent component lifecycle proof | mock repaired; exact file 4/4 |
| www typecheck | generated source cache | two failed parity attempts / one clean run | mixed Fumadocs generation modes | high: final app/type proof | clean async source; exact gate passed |
| exact Chrome visual proof | extension interaction | one selector wait and one Done lookup miss | render readiness and CUA selection path | medium: kept product bytes frozen | readiness repaired; selected pixels and E2E each 5/5 |

Findings:

- The pushed `b10d7ad47c` block equation was 700px wide, but its semantic
  button was only 163.96875px and left aligned; exact E2E measured a
  536.03125px width deficit.
- The Plite spacer is a zero-width sibling of the visible trigger. It correctly
  owns the hidden selection anchor and did not compress the visible equation.
- `origin/main` used a block-level `div` trigger. V2 changed that trigger to a
  semantic `button` without preserving block width. `w-full` restores the
  existing layout job while keeping correct button semantics.
- Final exact/headed Chrome reports block/button 700px, center delta 0, formula
  width 147.96875px, z/no-br anchor, transparent caret, and retained focus.

Timeline:

- 2026-08-29: reporter contradicted pushed attempt 2 with a compressed-layout
  screenshot, then supplied the exact correct centered reference.
- 2026-08-29: attempt-2 completion/receipt authority was revoked; Regression
  gained mechanical positive-reference geometry enforcement and 112 contracts.
- 2026-08-29: Best API/Plate Plan/Plate UI source audit moved ownership from the
  initial Plite hypothesis to the copied registry math component.
- 2026-08-29: exact E2E reproduced 536.03125px width loss; one `w-full` class
  produced 0px width delta and 0px center delta.
- 2026-08-29: registry/changelog generation, www typecheck, exact/headed Chrome
  5/5, controlled pixels, receipt, and completion audits passed.

Decisions and tradeoffs:

- Best API: add no prop, flag, plugin, adapter, or public API. Keep the ordinary
  button and express its existing block-layout job directly.
- Plate Plan/Plate UI: `math.tsx` owns visual layout. Keep Plite's hidden anchor,
  Range/NodeSelection behavior, and keyboard deletion unchanged.
- Preserve natural formula dimensions: only the trigger stretches; KaTeX stays
  147.96875px wide. Do not scale the formula or add min-width/global CSS.
- Registry changelog applies because copied `math` output changes visibly;
  package changeset is N/A because no package source changed in attempt 3.

Review fixes:

- Agent-native PASS: user screenshot -> `$regression` -> source rule/validator ->
  generated mirror -> workflow test -> exact E2E/receipt is discoverable.
- Direct P1 PASS: no Plite/public API/fixture/global CSS change; full-width class
  is local to the block trigger; inline equation is untouched; generated output
  and changelog match source.
- Autoreview N/A: repository policy forbids invoking it on branch `next`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| shadcn info at monorepo root | 1 | Target apps/www with `-c` | Resolved; info/docs fetched for Radix workspace |
| math spec used stale relative mock | 1 | Mock actual registry alias | Resolved; 4/4 pass |
| www typecheck saw mixed Fumadocs source modes | 2 | Move ignored `.source` to temp and regenerate clean async source | Resolved; exact typecheck passes |
| Chrome formula readiness selector | 1 | Inspect live page and wait for actual rendered count | Resolved; exact measurements pass |
| Chrome CUA selected without opening Done popup | 1 | Separate headed selected-state pixel proof from E2E Edit/Done proof | Resolved; each lane 5/5 |

Verification evidence:

- Workflow RED: pushed validator accepted missing positive reference geometry.
- Workflow green: focused test plus 112 source/generated contracts; old
  attempt-2 plan fails on `reference-geometry`, browser `layout-bounds`, and
  `layout-bounds: pass`; mirror parity exact.
- Product RED: exact route width delta 536.03125px on pushed product bytes.
- Product green: exact E2E width delta 0, center <=1px, formula natural size;
  5/5 fresh Chrome-binary runs with zero retries.
- Headed Chrome: 5/5 selected-state geometry/pixels, 700/700px, center 0,
  formula 147.96875px, z/no-br, transparent caret, focused.
- Pixel controls: positive 1, negative 0, duplicate 2; all five finals 0.
- Focused/app proof: math Bun 4/4; registry 379 payloads/15 overlays; changelog
  90/90; clean-cache www typecheck passes docs/registry parity and both TS configs.
- Receipt: attempt 3, dirty `b10d7ad47c`, 40 unchanged inputs, digest
  `sha256:84e83ab231f08759c58201df63ba2304121066991ed18c1b3f8c2e89baaf9686`,
  receipt `sha256:fd6d926d91d83a48cf6a615c40844af5e61fad47483f18a8411b6c75c38ff5eb`.
- Formatting/review: Ultracite, changelog check, changeset status, and
  `git diff --check` pass; direct P1 and agent-native reviews pass.

Final handoff:

- executable cases: one selected case, completed locally on attempt 3
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  every prior caret/Backspace claim plus compressed/correct layout images pass
- failed-fix invalidation and automatic repair: attempts 1/2 revoked;
  positive-reference geometry workflow repaired before attempt-3 product edit
- proof receipts and affected-corpus replay: attempt-3 receipt and matching
  digest bind workflow, component, registry, route, prior Plite behavior, and pixels
- started-gate failure closure: workspace selector, mock alias, generated docs
  cache, Chrome readiness, and headed interaction failures all rerun green
- changed product/proof files: `math.tsx`, its spec, existing block-void E2E,
  math/generated registry payloads, registry changelog source/generated files
- changed workflow files: Regression rule/methodology/validator/test/template,
  generated mirrors, invalidated attempt-2 plan, and this attempt-3 plan
- design decisions: Plate UI local full-width trigger; no Plite/public API or
  formula scaling; inline equations unchanged
- tests and proof: workflow 112, math 4/4, registry/changelog, www typecheck,
  exact/headed Chrome 5/5, controlled pixels, receipt
- source/generated sync: `pnpm install`, resource parity, registry generation,
  and changelog generation/check pass
- P1 and agent-native findings: direct P1 PASS, agent-native PASS, autoreview
  policy-N/A on `next`
- residual risks and next owner: no known exact-case defect; Safari pixels not
  claimed; user decides commit/push
- local completion status and integration/public-status boundary: local dirty
  completion only; uncommitted/unpushed in this turn, not integrated/released

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | final attempt-3 completion audit |
| Where am I going? | hand off the local uncommitted/unpushed fix and evidence |
| What is the goal? | exact correct centered equation plus retained no-caret and Backspace behavior |
| What have I learned? | the regression is a block-level `div` to shrink-to-fit `button` layout loss, not Plite spacer ownership |
| What have I done? | repaired Regression, fixed the Plate UI owner, regenerated registry/changelog, and passed exact proof |

Open risks:

- None for the exact desktop Chrome 151 claim. Safari/WebKit paint was not
  claimed; inline equation behavior was unchanged.
- Changes are local, uncommitted, and unpushed because this turn did not grant
  Git mutation authority.
