# outside editor autoscroll owner speed failed fix repair

Objective:
Repair the third Regression miss and complete attempt 4 for inconsistent/stalled outside drag scrolling; done when the old packet is mechanically rejected, a stable private scroll-owner/speed target is accepted, exact RED→GREEN passes both directions 5/5, and all prior corpus stays green.

Invalidated:
Reporter contradiction on 2026-08-27: the 18:04:46 retest never visibly scrolls. Attempt-4 completion, receipt, and final claim are revoked; selection expansion and custom scroll bookkeeping did not prove actual owner/content displacement.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-27-outside-editor-autoscroll-owner-speed-failed-fix-repair.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: third reporter contradiction for `outside-editor:selection-autoscroll-continues`; outside editor/browser speed varies and scrolling intermittently stops; attached payment screenshot is unrelated and excluded
- lane and current source owner: dirty `next`; Regression owner-lock/speed proof repair first, then Best API/Plite ownership for Plite React drag-autoscroll session
- selected executable test cases: attempt 4 of `outside-editor:selection-autoscroll-continues`
- tested ref or dirty-state boundary: dirty `219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493`; attempt-3 plan/receipt explicitly invalidated
- route / proof host and freshness method: workflow validator fixtures/source parity; owner-level unit for horizontal/browser exit, scroll-owner identity and constant outside speed; fresh homepage and #5113 affected corpus
- invocation mode / timebox: automatic third `regression repair`, Best API/Plite Plan, then attempt 4 after acceptance; no timebox

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-27-outside-editor-autoscroll-owner-speed-failed-fix-repair.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-outside-editor-autoscroll-owner-speed-failed-fix-repair.md`

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

- allowed source owners: `.agents/rules/regression.mdc`, Regression methodology/validator/tests, then only the accepted private Plite React drag-autoscroll session/target owner
- allowed proof/test owners: Regression workflow tests; existing root-interaction unit file; existing #5113 E2E as affected corpus; no new E2E for a unit RED
- generated/source boundary: edit `.agents/rules/**`, run `pnpm install`, prove `.agents/skills/**` parity; product source only after architecture acceptance
- browser/device claim width: drag originated in one editor; pointer may exit vertically and horizontally beyond editor/browser viewport while buttons=1; one scroll owner and outside speed remain stable until terminal cleanup
- forbidden product/API/release/public mutations: no public API, app/toolbar workaround, timer/focus delay, commit, push, PR, GitHub, #5113 mutation, release, or generated hand edits
- orchestration mode and writer ownership: Regression master owns workflow/architecture; one Patch writer only after exact RED and accepted target

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

- current phase: attempt-4 final closure
- current executable case: `outside-editor:selection-autoscroll-continues`, attempt 4
- current case status: completed locally with owner-lock, speed, liveness, release, corpus, and receipt proof
- next owner: user/coordinator for optional commit/push
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
| Prompt requirements captured | yes | Text report says speed inconsistent and intermittent no-scroll; attached payment screenshot excluded; prior claims invalid; no Git/public mutation. |
| Regression methodology loaded | yes | Regression SKILL/methodology re-read before new goal/work. |
| Active goal checked or created | yes | No active goal; attempt-4 repair goal created. |
| Current source owner and tested ref recorded | yes | Dirty base `219d1a...`; attempt-3 plan/receipt invalidated. |
| Executable test cases discovered | yes | Workflow validator fixture plus planned stable-owner/horizontal-exit/constant-speed unit in existing owner test file. |
| Cumulative reporter evidence resolved | yes | pass: base rapid outside scroll, intermittent stall, and latest speed/no-scroll delta map to the exact owner/speed/liveness oracle. |
| Reporter oracle matrix resolved | yes | Stable owner, speed law, boundary liveness, range recovery and terminal cleanup fields defined below. |
| Regression semantic validator ready | yes | Initial semantic validation passed before Patch; final `--complete` runs after this evidence ledger closes. |
| Route/proof-host readiness plan recorded | yes | Workflow repair/parity, owner unit RED, then fresh source process/Browser and existing corpus. |
| Patch delegation boundary recorded | yes | No Patch before repair-now and accepted Best API/Plite target; one attempt-4 case only. |
| Orchestrator writer ownership recorded | yes | Not orchestrator mode; one Patch child after master gates. |
| Output budget strategy recorded | yes | Exact Regression and Plite autoscroll owners only; capped output, no generated/build scans. |
| Claim width and blocked rules recorded | yes | Local attempt-4 claim only; block only after repair/architecture/proof alternatives are exhausted. |

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
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: owner-lock/speed/liveness/release critical set passed 5/5; owner file 20/20; #5113 passed 5/5. |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: dirty `219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493`; receipt covers 19 issue-owned inputs. |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: fresh PID 99850, started 2026-08-27T09:53:03Z at localhost:3002; Browser saw editor and zero errors. |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: exact unit RED was null at x=-200/y=180; same test GREEN proves fixed owner and signed ±28 speed. |
| E2E escalation closure | yes | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | pass: `unit-red:` in existing owner test; no new E2E; existing #5113 only replayed as affected corpus. |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pass: base rapid scroll, intermittent stall, and inconsistent-speed deltas all map to during-action owner/speed/liveness proof. |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all eight observations and every applicable interaction phase per case | pass: matrix below resolves model, DOM, pointer, focus, runtime, follow-up and justified popup/paint N/A. |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pass: attempts 1-3 invalidated; each workflow repair is executable; attempt3 packet is mechanically rejected. |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pass: accepted private owner anchor; no public API/controller; stable origin scrollport is terminal owner. |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: receipt `sha256:7a9e9d5db6e09767a604d21014358c795a56d01c6e77031e27b52966049f06e8`, retries 0. |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: critical 7×5, owner 20/20, #5113 receipt plus separate 5/5, typecheck and scoped Ultracite. |
| Shared-style consumer closure | no | Inventory every shared selector/class consumer and prove explicit paint neutralizers do not inherit or duplicate the shared surface | N/A: no CSS selector, class map, style expansion, or paint surface changed. |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: stale homepage host and missing jsdom fixture were repaired; all final commands pass. |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: exact x=-200/y=180 target-null unit RED before product edit; fresh localhost:3002 repaired host. |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | pass: one-case Patch return read back with changed files, fingerprints, commands, stability and review. |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: exact 1/1, critical 7/7, full owner 20/20, #5113 5/5. |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: attempt4 critical set 5/5 and #5113 5/5, retries 0. |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | keep: completed locally on dirty current source. |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | completed locally; uncommitted/unpushed; no integration/release/public claim. |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: only executable tests, source, changeset, workflow source/mirrors and plans changed. |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: `pnpm install`, resource check, three source/mirror parity checks, fresh source host. |
| Orchestrator writer closure | no | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | N/A: not orchestrator mode; one Patch writer and one proof host were serialized. |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: replaced stale localhost:3000 and completed the missing jsdom range fixture before final replay. |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | repair-now completed: Regression requires scroll owner, speed law, owner lock and speed consistency. |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pass: install generated mirrors; 70 workflow tests, resource check and exact parity pass. |
| Agent-native review | yes | Run for changed agent workflows or record N/A | pass: source-to-mirror-to-validator-to-handoff path is executable and discoverable. |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: final handoff below records each item and local-only claim width. |
| Autoreview | no | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A: repo rule forbids autoreview on `next`; manual P1 readback is clean. |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-27-outside-editor-autoscroll-owner-speed-failed-fix-repair.md --complete` | pass: `Regression plan: semantically complete.` |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-outside-editor-autoscroll-owner-speed-failed-fix-repair.md` | pass: `[autogoal] complete`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | attempt-4 goal and boundaries recorded; screenshot excluded | workflow repair |
| Current source and proof-host readiness | completed | dirty ref, current helper scan and prior session state inspected | discover executable cases |
| Executable case discovery and selection | completed | workflow validator + planned stable-owner/document-move unit | workflow repair |
| Cumulative reporter evidence inventory | completed | base plus two reporter deltas retained | reporter oracle expansion |
| Reporter oracle expansion | completed | owner lock, speed, liveness, recovery and cleanup defined | semantic validation |
| Pre-implementation semantic validation | completed | user accepted with “修复”; executable attempt4 target passed semantic gate | smallest probe |
| Smallest high-value probe | completed | x=-200/y=180 returned null before owner/speed assertions | reproduce/classify |
| Reproduce, classify, and red test | completed | exact owner unit RED classified x-filter/rescan/local-move ownership gap | patch delegation |
| One-case Patch delegation | completed | Patch changed only accepted private owner/session/test/changeset surface | verification |
| Focused verification and stability | completed | exact 1/1; critical 7×5; owner 20/20; #5113 5/5 | packet decision |
| Keep/revert/quarantine | completed | kept locally; uncommitted/unpushed | methodology delta |
| Methodology repair/no-change/defer | completed | repair-now: owner/speed validator fields, workflow test, generated parity | architecture gate |
| Reviews and final handoff | completed | manual P1 clean; agent-native pass; handoff below | goal-plan check |
| Final goal-plan check | completed | semantic complete and autogoal complete | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| outside-editor:selection-autoscroll-continues | Base outside-speed report plus editor/browser stall and latest speed/no-scroll contradiction | Start held editor drag near edge; leave vertically and horizontally into editor/browser exterior while buttons=1; feed document mousemoves with varying x but same outside y; place editor scrollport inside a scrollable page ancestor; reach inner limit; deliver terminal release | scroll-owner: originating editor scrollport stays fixed through horizontal/browser exit and at its own limit; speed-law: outside vertical region remains constant signed ±28px/tick; boundary/range/release laws from prior attempts remain required | reporter: prior accepted max outside speed plus latest explicit inconsistent-speed/no-scroll delta | unit-red: packages/plite-react/test/root-interaction-controller.test.tsx#keeps one drag autoscroll owner and speed through horizontal browser exit | Plite React DOM/runtime unit on dirty `next`; fresh route/corpus supportive | `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/root-interaction-controller.test.tsx -t "keeps one drag autoscroll owner and speed through horizontal browser exit"` | completed | dirty:219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493 | user/coordinator |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| outside-editor:selection-autoscroll-continues | base-acceptance | Prior report: outside editor should rapidly scroll both directions | during-action | Held drag keeps scrolling until terminal release | required | dom-native@during-action, pointer-feedback@during-action | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps one drag autoscroll owner and speed through horizontal browser exit | pass: both directions stay at signed 28 until owner limit or terminal release |
| outside-editor:selection-autoscroll-continues | reporter-delta | Prior delta: outside editor/browser intermittently stalls | during-action | Exiting the owner/browser and transient range misses cannot kill the loop | required | model@during-action, dom-native@during-action, pointer-feedback@during-action | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps one drag autoscroll owner and speed through horizontal browser exit | pass: document mousemove updates active session outside editor; range miss continues and recovers |
| outside-editor:selection-autoscroll-continues | latest-reporter-delta | Current text: speed inconsistent and scrolling sometimes unavailable; payment screenshot unrelated | during-action | Same originating editor and same outside vertical region keep one owner and constant signed speed | required | dom-native@during-action, pointer-feedback@during-action | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps one drag autoscroll owner and speed through horizontal browser exit | pass: x-outside target remains inner owner; inner ±28, outer 0; no promotion at limit |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| outside-editor:selection-autoscroll-continues | model | during-action | yes | Last valid selection survives exit/miss and advances on recovered range under the same owner | Selection clears, reverses, or resumes against another owner | package DOM/runtime unit | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps one drag autoscroll owner and speed through horizontal browser exit | pass: coherent selection/range recovery remains green under the fixed owner |
| outside-editor:selection-autoscroll-continues | dom-native | during-action | yes | Origin editor scrollTop changes by the same signed 28 each outside tick; outer page stays unchanged; clamped range point stays on origin edge | Delta varies, target becomes null, or outer page starts scrolling | package DOM nested-scrollport unit | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps one drag autoscroll owner and speed through horizontal browser exit | pass: inner ±28, outer 0, target null at inner limit without promotion |
| outside-editor:selection-autoscroll-continues | pointer-feedback | during-action | yes | reporter-noun: selection drag; affordance-inventory: origin editor scrollport, browser viewport boundary, page ancestor; boundary-liveness: document mousemove feeds last held coordinate; release-cleanup: mouseup pointerup dragend blur stop; scroll-owner: nearest origin scrollport stays fixed; speed-law: outside vertical region is constant ±28 | Horizontal/browser exit drops target, changes owner, changes signed speed, or release leaves loop alive | package DOM/browser boundary-exit owner/speed lifecycle oracle | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps one drag autoscroll owner and speed through horizontal browser exit | pass: interaction-trace: pass; target: originating editor scrollport; event: document mousemove; buttons: 1; boundary-exit-trace: pass; range-miss: continue; owner-lock: pass; speed-consistency: pass; release: stop |
| outside-editor:selection-autoscroll-continues | focus | during-action | yes | Window remains focused on pointer-only exit; actual blur is terminal cleanup | Pointer exit fakes blur or real blur leaves loop alive | package DOM window lifecycle | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps one drag autoscroll owner and speed through horizontal browser exit | pass: pointer exit uses document mousemove; explicit blur clears ref and scheduled frame |
| outside-editor:selection-autoscroll-continues | popup | during-action | no | N/A: no popup behavior | N/A: no popup state | N/A: #5113 affected corpus | N/A: no new popup test | N/A: unaffected |
| outside-editor:selection-autoscroll-continues | geometry-paint | during-action | no | N/A: numeric owner/speed/lifecycle claim, not pixel fidelity | N/A: no paint state | N/A: DOM/runtime metrics | N/A: no pixel test | N/A: no paint claim |
| outside-editor:selection-autoscroll-continues | runtime-errors | during-action | yes | Exit, constant-speed ticks, range recovery and cleanup complete without errors | Scheduler/runtime error aborts session | package unit runner | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps one drag autoscroll owner and speed through horizontal browser exit | pass: critical 7×5 and owner 20/20, no runtime error |
| outside-editor:selection-autoscroll-continues | follow-up-input | follow-up | yes | After terminal cleanup a new drag acquires its own editor owner cleanly | Stale owner/scheduler leaks into follow-up | package lifecycle unit + existing #5113 corpus | test: packages/plite-react/test/root-interaction-controller.test.tsx#keeps one drag autoscroll owner and speed through horizontal browser exit | pass: four cleanup paths clear state; follow-up scheduling remains green |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| outside-editor:selection-autoscroll-continues | 4 | completed | "bash" "-lc" "set -e; node --test .agents/rules/regression/scripts/test-first-contract.test.mjs .agents/rules/regression/scripts/validate-regression-plan.test.mjs .agents/skills/regression/scripts/test-first-contract.test.mjs; node .agents/rules/plate-next/scripts/sync-resources.mjs --check; for run in 1 2 3 4 5; do echo \"attempt4-owner-speed:$run\"; pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/root-interaction-controller.test.tsx -t \"keeps one drag autoscroll owner and speed through horizontal browser exit\u007ckeeps maximum selection drag autoscroll running beyond both scrollport edges\u007ccontinues drag autoscroll through transient boundary range misses\u007cstops drag autoscroll on\"; done; pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/root-interaction-controller.test.tsx; pnpm --filter @platejs/plite-react typecheck; pnpm exec ultracite check apps/www/tests/browser/selection-drag-scroll.spec.ts packages/plite-react/src/editable/drag-auto-scroll-target.ts packages/plite-react/src/editable/root-interaction-controller.ts packages/plite-react/test/root-interaction-controller.test.tsx .agents/rules/regression/scripts/validate-regression-plan.mjs .agents/rules/regression/scripts/validate-regression-plan.test.mjs; cd apps/www; PLAYWRIGHT_BASE_URL=http://localhost:3002 pnpm --filter www exec playwright test tests/browser/selection-drag-scroll.spec.ts --config playwright.config.ts --project=chromium --workers=1" | pass: exit 0 in 17829ms | dirty:219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493 | sha256:e183bf9d23f9bfd0bca54c09737cd93d1bf5add8c4634b44f72993234585fa46 | 19 | .agents/rules/regression.mdc,.agents/rules/regression/references/methodology.md,.agents/rules/regression/scripts/validate-regression-plan.mjs,.agents/rules/regression/scripts/validate-regression-plan.test.mjs,.agents/skills/regression/SKILL.md,.agents/skills/regression/references/methodology.md,.agents/skills/regression/scripts/validate-regression-plan.mjs,.agents/skills/regression/scripts/validate-regression-plan.test.mjs,.changeset/quiet-drag-scroll.md,apps/www/playwright.config.ts,apps/www/src/app/(app)/page.tsx,apps/www/src/components/playground-preview.tsx,apps/www/tests/browser/selection-drag-scroll.spec.ts,packages/plite-react/src/editable/drag-auto-scroll-target.ts,packages/plite-react/src/editable/input-state.ts,packages/plite-react/src/editable/root-interaction-controller.ts,packages/plite-react/src/editable/selection-controller.ts,packages/plite-react/test/root-interaction-controller.test.tsx,packages/plite-react/test/selection-controller-contract.ts | pid:99850;started:2026-08-27T09:53:03.000Z;base-url:http://localhost:3002;browser:chromium | 2026-08-27T09:50:40.067Z | 2026-08-27T09:54:36.215Z | 2026-08-27T09:54:54.044Z | 0 | sha256:7a9e9d5db6e09767a604d21014358c795a56d01c6e77031e27b52966049f06e8 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite React drag-autoscroll session | outside-editor:selection-autoscroll-continues | red: attempt4 owner/speed test; pass: previous edge-speed/liveness/release 6 tests; pass: #5113 fresh localhost:3002 | 2026-08-27T09:50:40.067Z | attempt4 combined receipt command | sha256:e183bf9d23f9bfd0bca54c09737cd93d1bf5add8c4634b44f72993234585fa46 | pass: workflow 70/70; critical 7×5; owner 20/20; typecheck; Ultracite; receipt #5113; separate #5113 5/5 |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Pre-edit homepage host | existing localhost:3000 lacked homepage editor | proof-host | stopped old PID and started fresh source server on localhost:3002 | pass: #5113 1/1 before product edit |
| First post-Patch owner unit | jsdom lacked `document.elementFromPoint` in the new fixture | proof-host fixture | added the canonical elementFromPoint fixture; no product change for this error | pass: exact 1/1, critical 7×5 and owner 20/20 on final bytes |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| outside-editor:selection-autoscroll-continues | 1 | Reporter contradicted completed outside-edge target fix | reporter-contradiction | yes: attempt1 completion/receipt revoked | repair-now: `.agents/rules/regression.mdc` boundary liveness/release validator | pass: workflow packet rejection | yes: timer-focus-correctness | best-api + plite-plan prior target | reproduced: attempt2 accepted and exact RED created |
| outside-editor:selection-autoscroll-continues | 2 | Fresh #5113 final verification caught fixed-time sample before shrink | final-verification | yes: attempt2 candidate/receipt revoked | repair-now: `.agents/rules/regression.mdc` requires unchanged-bytes diagnostic | pass: workflow diagnostic rejection test | yes: second-failed-fix | best-api + plite-plan retained target | reproduced: diagnostic classified oracle drift; diagnostic: phase-sampled unchanged-bytes 5/5 |
| outside-editor:selection-autoscroll-continues | 3 | Reporter contradicts attempt3: outside speed varies and scrolling can still stop | reporter-contradiction | yes: attempt3 plan/receipt explicitly invalidated | repair-now: `.agents/rules/regression.mdc`, methodology, validator/tests require owner-lock and speed-consistency | pass: 70 workflow tests; old packet rejected for owner/speed gaps | yes: second-failed-fix and stable-owner architecture gap | best-api review + accepted plite-plan target below | reproduced: user authorized attempt4 with “修复” |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| outside-editor:selection-autoscroll-continues | 3 | second-failed-fix | escalate | required: best-api selects no public API/class; existing rootElement is the private owner anchor | plite-plan: root interaction document-move session locks nearest origin scrollport; target helper computes only signed delta/clamped point for that owner | accepted: user said “修复”; attempt4 product test/implementation authorized |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| outside-editor:selection-autoscroll-continues | Plite React target helper + root-interaction document-move session; exact owner unit; existing homepage corpus | source-first unit imports + fresh localhost:3002 PID 99850 | receipt timestamps follow latest input; Browser editor visible with zero errors | workflow mirrors synced; product generated outputs untouched | pass: exact RED, final receipt and fresh corpus authoritative |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| outside-editor:selection-autoscroll-continues | exact RED: x=-200/y=180 target null | drag target/root interaction source, existing unit, related changeset only | horizontal/document exit, owner lock at inner limit, constant ±28 both directions, prior liveness/release, 5/5, full owner/typecheck/#5113/Browser | read back: terminal nearest owner, document mousemove session, exact RED→GREEN, four source/test fingerprints, manual P1 clean | pass: one Patch writer completed the normalized case |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| outside-editor:selection-autoscroll-continues | final receipt on fresh PID 99850 plus separate #5113 loop | 5 | critical owner/speed/liveness/release pass×5; #5113 pass×5 | 0 | completed attempt4 |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| outside-editor:selection-autoscroll-continues | exact RED→GREEN; critical 7×5; owner 20/20; #5113 5/5; receipt pass | keep: completed locally | dirty current source only; not committed, pushed, integrated, released, or public | Browser CUA cannot hold/dwell outside; exact package DOM owns owner/speed law and route corpus guards selection | user/coordinator |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| outside-editor:selection-autoscroll-continues | third claimed fix omitted scroll-owner and speed-law proof | repair-now | `.agents/rules/regression.mdc`, methodology, validator/tests require scroll-owner, speed-law, owner-lock and speed-consistency; generated mirrors synced | pass: 70 workflow tests; invalid attempt3 packet rejected specifically for all four fields | attempt3 reporter contradiction repaired before attempt4 product work |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| localhost and jsdom proof readiness | Regression/Patch proof hosts | two repair detours / expected none | stale wrong-route server; incomplete new unit fixture | high: prevented false browser and unit claims | fresh PID 99850; canonical elementFromPoint fixture; all exact reruns pass |

Findings:

- Payment screenshot is unrelated and excluded from editor behavior evidence.
- Current target helper rejects clientX outside a candidate and rescans ancestors each tick; at inner limits it may promote to the page. Root interaction listens to mousemove only inside the editor, leaving the last sampled edge distance to determine speed after exit.
- Workflow repair complete: attempt3 packet now fails required `scroll-owner`, `speed-law`, `owner-lock`, and `speed-consistency`; 70 workflow tests and generated parity pass.
- Agent-native review PASS: report -> Regression -> rule source -> generated mirror -> executable packet rejection/proof -> handoff.
- Attempt4 fixes the owning law: document mousemove keeps held coordinates current outside the editor; the nearest origin scrollport is terminal; horizontal exit cannot cancel vertical intent; outside speed stays signed ±28 until that owner reaches its limit.
- No public API, class, toolbar, focus delay, timer workaround, outer-page promotion, or generated product edit was added.

Timeline:

- 2026-08-27: fresh reporter contradiction invalidated attempt3 and excluded unrelated payment screenshot.
- 2026-08-27: added owner-lock/speed-consistency Regression enforcement, synced mirrors, and passed 70 workflow tests/resource parity.
- 2026-08-27: Best API/Plite review selected a stable origin scrollport session; user accepted it with “修复”.
- 2026-08-27: exact attempt4 unit failed because x=-200/y=180 returned no target; one Patch changed the terminal owner lookup and document-move lifetime.
- 2026-08-27: final receipt passed workflow 70/70, critical 7×5, owner 20/20, typecheck, Ultracite and #5113 on fresh PID 99850; separate #5113 stability passed 5/5.

Decisions and tradeoffs:

- Best API hard cut: no public API, no new class/controller, no app/UI/timer workaround. Reuse `rootElement` as the private origin anchor.
- Plite target: active drag attaches document mousemove, updates held coordinates outside the editor, always uses the nearest origin scrollport, never promotes to page, ignores horizontal exit for owner selection, and keeps ±28 outside vertical speed until terminal cleanup or owner limit.
- Horizontal exit with y in the middle does not scroll; vertical intent still comes from y. At the origin scroll limit, stop instead of switching owner.
- Exact attempt-4 RED has two coupled owner-level rows in the existing root-interaction test file:
  1. Start at inner-edge y=95, dispatch real document `mousemove` with `buttons=1`, x=-200 and y=180, then flush one scheduler tick. Expected inner delta is +28 and outer remains 0. Current code never consumes that outside document move, so it uses the stale slower edge coordinate.
  2. Nest the editor scrollport inside a scrollable page, put the inner owner at its maximum, and resolve an outside-both point. Expected target is null and outer scrollTop stays 0. Current helper rescans and can promote to the page owner.
- The implementation target is deliberately smaller than a new session class: make the nearest scrollable ancestor terminal for owner selection, ignore x for that acquired owner, and add one document mousemove listener to the existing release-listener lifetime.

Review fixes:

- Workflow manual P1/agent-native review: source/mirror ownership is correct; new requirements are bounded to continuous pointer boundary cases.
- Product manual P1 review: internal `updateDragAutoScroll` export is not in a public barrel; nearest origin scrollport is terminal; release/blur cleanup is unchanged; no public API or outer-owner fallback remains.
- Patch fingerprints: drag target `6aaf5ec0f87005be2734c21e83bed8fa296ce7c811f4fc1d6ffd23fe5b4dafcd`; root interaction `87b97b8ec3dc405cb3290f81e11aa4c38d2d4e97a102d6d9d8930d0399c19e17`; unit `9f65506671b7354a791ab3ee9ed6db176d0f29a4e5a9d155060b6b504eb1ae82`; changeset `b745ee1f6c779ddc2705a7301c0cd39f89e95dc5b5ed4a0397f2af92b18d4f76`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Existing localhost:3000 had no homepage editor | 1 | stop stale process and start current source on 3002 | resolved: fresh PID 99850; Browser and #5113 pass |
| New nested-owner unit lacked jsdom `elementFromPoint` | 1 | add the canonical test fixture without product edits | resolved: exact 1/1, critical 7×5 and owner 20/20 pass |

Verification evidence:

- source validator test -> 36/36; full workflow proof -> 70/70; `pnpm install`, resource check and three source/mirror parity checks pass.
- invalidated attempt3 plan `--complete` -> rejects missing owner/speed fields.
- exact attempt4 owner/speed unit -> RED target null at x=-200/y=180; GREEN 1/1; critical owner/speed/liveness/release set 7/7 and retry-free 5/5.
- full root interaction owner -> 20/20; `@platejs/plite-react` typecheck and scoped Ultracite -> pass.
- #5113 existing affected corpus -> receipt pass 1/1 and separate fresh-source stability 5/5; Browser editor visible with zero console errors.
- final receipt -> `sha256:7a9e9d5db6e09767a604d21014358c795a56d01c6e77031e27b52966049f06e8`; 19 inputs; retries 0; digest `sha256:e183bf9d23f9bfd0bca54c09737cd93d1bf5add8c4634b44f72993234585fa46`.

Final handoff:

- executable cases: `outside-editor:selection-autoscroll-continues` completed on attempt4.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: rapid bidirectional scroll, intermittent stall, speed consistency, fixed owner, range recovery and four terminal cleanup paths all pass; payment screenshot excluded.
- failed-fix invalidation and automatic repair: attempts 1-3 invalidated; third miss now mechanically rejects packets missing owner/speed law and proof.
- proof receipts and affected-corpus replay: final receipt/digest above; critical 7×5, owner 20/20 and #5113 5/5 pass.
- started-gate failure closure: stale localhost route and jsdom fixture failures are repaired and rerun green.
- changed files: Regression source/methodology/validator/tests and generated mirrors; Plite drag target/root interaction/test; existing selection source/test and #5113 diagnostic retained from prior attempts; changeset and plans.
- design decisions: no public API/controller; root interaction owns document-move lifecycle; nearest origin scrollport is terminal; geometry helper returns only its signed delta/clamped point.
- tests and proof: workflow 70, exact RED→GREEN, critical 7×5, owner 20, typecheck, Ultracite, #5113 5×, final receipt and Browser support.
- source/generated sync: `pnpm install`, resource check and rule/skill parity pass.
- P1 and agent-native findings: autoreview N/A on `next`; manual P1 clean; agent-native PASS.
- residual risks and next owner: Browser CUA cannot hold/dwell outside; exact package DOM owns owner/speed/lifecycle while the existing route corpus guards integrated selection. User/coordinator owns optional commit/push.
- local completion status and integration/public-status boundary: completed locally, uncommitted/unpushed; no PR, GitHub issue, integration, release, or public-status mutation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | attempt4 completed locally with final receipt and affected-corpus proof |
| Where am I going? | user/coordinator decides whether to commit or push |
| What is the goal? | stable origin owner and consistent outside speed without stalls or cleanup regressions |
| What have I learned? | current x-filter/rescan/local-move design cannot guarantee owner identity or outside speed |
| What have I done? | invalidated attempt3, repaired Regression mechanically, implemented the accepted private owner/session fix, and proved attempt4 5/5 |

Open risks:

- Browser CUA cannot keep a physical button held while dwelling outside the window. Exact package DOM proof owns that owner/speed/lifecycle law; the current-source #5113 Playwright corpus and Browser readback provide route support.
- Work is local and uncommitted/unpushed. No integration, release, or public issue status is claimed.
