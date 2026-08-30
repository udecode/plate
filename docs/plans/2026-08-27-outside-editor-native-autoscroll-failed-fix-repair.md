# outside editor native autoscroll failed fix repair

Objective:
恢复浏览器原生拖选自动滚动并修复第4次漏检；完成条件是旧包因无可见位移被拒绝，attempt 5 精确 RED→GREEN 与双向真实路由 5/5。

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-27-outside-editor-native-autoscroll-failed-fix-repair.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: reporter contradiction for `outside-editor:selection-autoscroll-continues`; 8.88s 120fps retest shows selection expansion but no viewport/content displacement; custom autoscroll false green
- lane and current source owner: dirty `next`; repair Regression visible-displacement oracle first, then Best API/Plite hard-cut review of Plite React root interaction versus browser-native drag selection
- selected executable test cases: attempt 5 of `outside-editor:selection-autoscroll-continues`
- tested ref or dirty-state boundary: dirty `219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493`; attempt-4 completion and receipt revoked by reporter contradiction
- route / proof host and freshness method: existing homepage `selection-drag-scroll.spec.ts` expanded to measure the actual scroll owner/visible content geometry; fresh current-source route; Browser then Chrome native proof
- invocation mode / timebox: automatic fourth failed-fix repair and one-shot execution; no timebox

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-27-outside-editor-native-autoscroll-failed-fix-repair.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-outside-editor-native-autoscroll-failed-fix-repair.md`

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
- Browser-native selection, drag, and autoscroll own the positive behavior.
  Selection expansion, scheduler liveness, a `scrollBy` call, or synthetic
  `scrollTop` mutation cannot substitute for visible route displacement.
- Preserve #5113 selection following, bidirectional drag, terminal release,
  focus, and follow-up editing while deleting custom compensation when source
  and exact RED prove it is unnecessary.

Boundaries:

- allowed source owners: Regression rule/methodology/validator/tests, then only accepted Plite React root-interaction/native-selection owners and related changeset
- allowed proof/test owners: Regression workflow tests; existing root interaction tests for deletion fallout; existing `apps/www/tests/browser/selection-drag-scroll.spec.ts` as exact native-browser owner
- generated/source boundary: edit `.agents/rules/**`, run `pnpm install`, prove `.agents/skills/**` parity; never hand-edit generated skill mirrors or registry/templates
- browser/device claim width: held primary-button text selection crosses the editor/browser vertical boundary; actual originating scroll owner offset/content geometry must move both directions while focus and native selection remain live
- forbidden product/API/release/public mutations: no public API, replacement autoscroll controller, timer/focus/UI compensation, commit, push, PR, GitHub issue/comment/label, release, or unrelated screenshot evidence
- orchestration mode and writer ownership: Regression owns plan/method repair; one Patch worker-equivalent in the main thread only after executable RED and accepted native architecture; one route host at a time

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

- current phase: attempt5 final closure
- current executable case: `outside-editor:selection-autoscroll-continues`, attempt 5
- current case status: completed locally with exact Chrome visible-displacement proof
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
| Prompt requirements captured | yes | Reporter says the whole recording never scrolls and identifies behavior as browser-native; prior completion invalid; restore actual native visible movement; no Git/public mutation. |
| Regression methodology loaded | yes | Regression SKILL and methodology read completely after the contradiction. |
| Active goal checked or created | yes | Previous goal was closed; new attempt5 goal created with this plan. |
| Current source owner and tested ref recorded | yes | Dirty `219d1a...`; current custom drag target/root interaction and exact route harness named. |
| Executable test cases discovered | yes | Existing #5113 route harness can measure actual scroll owner/geometry; unit/jsdom cannot prove browser-native autoscroll. |
| Cumulative reporter evidence resolved | yes | Base fast bidirectional native scroll, earlier stall/speed deltas, and latest “never scrolled” correction all remain required; payment screenshot remains excluded. |
| Reporter oracle matrix resolved | yes | Eight observation rows below include actual owner displacement, native event path, focus, release and follow-up. |
| Regression semantic validator ready | yes | Pre-implementation validator passed after workflow repair, accepted architecture, and exact E2E title were present. |
| Route/proof-host readiness plan recorded | yes | Fresh current-source homepage, exact actual scroll owner discovery, Browser support and Chrome native verification. |
| Patch delegation boundary recorded | yes | No product Patch before failed-fix workflow repair, architecture acceptance and exact route RED; one case only. |
| Orchestrator writer ownership recorded | yes | N/A: not orchestrator mode; main-thread serialized workflow and product writes. |
| Output budget strategy recorded | yes | Exact Regression and Plite root-interaction/selection files only; exclude builds/generated trees; cap route/test logs. |
| Claim width and blocked rules recorded | yes | Local native drag-scroll claim only; block only if exact Chrome/current-source gesture cannot be automated or observed after all in-scope host repairs. |

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
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: attempt5 exact RED→GREEN; Google Chrome bidirectional visible scroll 5/5; methodology repair complete. |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: dirty `219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493`; receipt fingerprints 27 exact inputs. |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: fresh final PID 37689 at localhost:3002; Chrome 151 executable attested. |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: existing E2E rewritten from programmatic scrolling to actual native owner displacement; RED `scrollTop=0`, GREEN both directions. |
| E2E escalation closure | yes | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | pass: e2e-required because jsdom cannot execute or observe native held-selection autoscroll; one existing untracked E2E owner was repaired. |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pass: base fast bidirectional scroll, held-pointer liveness, stall/speed deltas, and latest never-scrolled correction all map below. |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all eight observations and every applicable interaction phase per case | pass: model, DOM/native, pointer, focus, runtime and follow-up resolved; popup/paint N/A with reason. |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pass: attempts1-4 sequentially invalidated; attempt4 now mechanically fails visible-scroll requirements. |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pass: accepted browser-owned ordinary text path; no public API/controller; exceptional projected/root-chrome behavior retained only for its independent job. |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: receipt `sha256:66c1f18c7368d762bc73c7d51b7214fa9061fa3907a181e9698ae004999ef8b0`, retries 0. |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: receipt workflow71, unit46, typecheck, Ultracite, exact Chrome5; Node22 full Plite dev gate passed separately. |
| Shared-style consumer closure | no | Inventory every shared selector/class consumer and prove explicit paint neutralizers do not inherit or duplicate the shared surface | N/A: no CSS selector, class, marker, or paint surface changed. |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: Node24 full gate reran under required Node22; proof-host and sampling failures were repaired; final exact commands pass. |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: same Chrome gesture scrolled a plain contenteditable control while Plate stayed at zero. |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | pass: Patch skill main-thread packet returned root cause, deletion cone, files, RED/GREEN, fingerprints, proof and caveats. |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: exact Chrome5, adjacent unit46, typecheck and Ultracite. |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: final exact Google Chrome command passed 5/5 with retries 0. |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | keep: completed locally. |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | completed locally; uncommitted/unpushed; no integration/release/public claim. |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: executable source/tests plus transient plans only. |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: `pnpm install`, resource sync, body/resource parity, fresh final host. |
| Orchestrator writer closure | no | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | N/A: not orchestrator mode; main-thread writes and one managed host serialized. |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: bad cmp, Node version, fixed-time/model sampling, outside-release delivery, toolbar proxy and variable gesture depth all repaired. |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | repair-now complete: scrolling claims require actual owner offset plus content geometry and `visible-scroll: pass`. |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pass: generated mirrors current; 71 workflow tests and resource/body/resource parity pass. |
| Agent-native review | yes | Run for changed agent workflows or record N/A | pass: user correction -> Regression route -> source -> mirrors -> executable old-packet rejection -> final handoff. |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: final handoff below records each item and local-only claim width. |
| Autoreview | no | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A: repo forbids autoreview on `next`; manual P1 diff review clean. |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-27-outside-editor-native-autoscroll-failed-fix-repair.md --complete` | pass: `Regression plan: semantically complete.` |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-outside-editor-native-autoscroll-failed-fix-repair.md` | pass: `[autogoal] complete`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | attempt5 goal, native-browser authority, exact displacement threshold and boundaries recorded | source/host readiness |
| Current source and proof-host readiness | completed | dirty ref, final fingerprints, fresh PID 37689, Google Chrome 151 and Node22 lane recorded | discover executable cases |
| Executable case discovery and selection | completed | existing route harness selected; lower-layer unit cannot prove browser-native viewport displacement | smallest probe |
| Cumulative reporter evidence inventory | completed | base plus all four reporter/final-verification deltas retained | reporter oracle expansion |
| Reporter oracle expansion | completed | actual owner offset/geometry, native selection, focus, release and follow-up rows below | semantic validation |
| Pre-implementation semantic validation | completed | Regression plan structurally valid before product Patch | smallest probe |
| Smallest high-value probe | completed | plain contenteditable native control scrolled; Plate route remained at `scrollTop=0` | reproduce/classify |
| Reproduce, classify, and red test | completed | exact Chrome/Playwright E2E RED at visible owner displacement assertion | patch delegation |
| One-case Patch delegation | completed | Patch skill applied in main thread: ordinary text mousedown/browser ownership and selection-export guard only | verification |
| Focused verification and stability | completed | exact Chrome receipt 5/5; unit 46; typecheck; Ultracite; full Plite dev gate | packet decision |
| Keep/revert/quarantine | completed | keep locally; uncommitted/unpushed | methodology delta |
| Methodology repair/no-change/defer | completed | repair-now visible-scroll rule/validator/workflow test; source/generated synced | next case or closure |
| Reviews and final handoff | completed | manual P1 clean; agent-native PASS; no public API | goal-plan check |
| Final goal-plan check | completed | semantic complete and Autogoal complete | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| outside-editor:selection-autoscroll-continues | Original #5113 report, later stall/speed contradictions, and 2026-08-27 18:04:46 retest corrected by reporter as “一直都没有滚动”; user says behavior should be browser-native | On fresh homepage, start real primary-button native text drag; keep button held; move below then above editor/browser boundary; sample actual originating scroll owner `scrollTop` and stable content-anchor rect while native selection remains expanded; release and edit again | The browser-native drag moves the actual originating scroll owner and visible content continuously in both directions; selection follows; terminal release stops; no custom Plate/Plite autoscroll loop is needed | reporter: latest correction plus explicit browser-native law, while retaining base bidirectional fast-scroll requirement | e2e-required: jsdom/package tests cannot execute browser-native held-selection autoscroll or prove actual rendered scroll owner/content displacement | exact-chrome: Google Chrome 151.0.7922.174 at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` on fresh localhost:3002 PID 37689 | `pnpm --filter www exec playwright test tests/browser/selection-drag-scroll.spec.ts --config playwright.config.ts --project=chromium --workers=1` | completed | dirty:219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493 | user/coordinator |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| outside-editor:selection-autoscroll-continues | base-acceptance | Original report: held selection outside editor should rapidly scroll upward/downward | during-action | Actual editor/page scroll owner and visible content move while selection extends | required | dom-native@during-action, pointer-feedback@during-action | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#keeps native selection drag scrolling outside the editor | pass: exact Chrome actual owner and stable content anchor move both directions |
| outside-editor:selection-autoscroll-continues | reporter-delta | Earlier correction: pointer remained held when selection appeared to stop | during-action | Native held drag stays live without synthetic early release | required | model@during-action, pointer-feedback@during-action, focus@during-action | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#keeps native selection drag scrolling outside the editor | pass: buttons=1 throughout each counted gesture; release/return cleanup separate |
| outside-editor:selection-autoscroll-continues | reporter-delta | Earlier correction: outside editor/browser scroll can stall and speed varies | during-action | Actual owner displacement continues at browser-native speed instead of custom step/call counts | required | dom-native@during-action, pointer-feedback@during-action | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#keeps native selection drag scrolling outside the editor | pass: scroll event samples are monotonic in each native direction; no custom delta used |
| outside-editor:selection-autoscroll-continues | latest-reporter-delta | 18:04:46 video plus reporter correction “一直都没有滚动”; user says this should be browser-native | during-action | Recording is red because content/owner position never moves despite selection expansion; fixed path delegates scroll to browser | required | dom-native@during-action, pointer-feedback@during-action | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#keeps native selection drag scrolling outside the editor | pass: exact RED was owner zero; final Chrome5 has owner/content displacement and expanded native/model selection |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| outside-editor:selection-autoscroll-continues | model | during-action | yes | Model selection follows the browser DOM selection while the actual owner scrolls | Selection expands on a static viewport, clears, reverses, or stops following | exact-chrome browser state plus Playwright model/DOM trace | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#keeps native selection drag scrolling outside the editor | pass: phase-sampled model selection changes after each native drag; unit guard blocks model-to-DOM export during native ownership |
| outside-editor:selection-autoscroll-continues | dom-native | during-action | yes | Browser-native Selection remains expanded and actual originating owner `scrollTop` changes monotonically in drag direction | Selection-only change, `scrollBy` call, synthetic offset mutation, zero owner displacement, or wrong outer owner | exact-chrome browser native Selection plus Playwright owner offset/anchor geometry | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#keeps native selection drag scrolling outside the editor | pass: plain native control certifies host; product owner and Rich anchor move down/up without programmatic counted scroll |
| outside-editor:selection-autoscroll-continues | pointer-feedback | during-action | yes | reporter-noun: selection drag; affordance-inventory: native text selection, editor scroll owner, browser viewport boundary; boundary-liveness: real held mouse move and browser last coordinate; release-cleanup: mouseup/pointerup or return buttons=0; scroll-owner: actual origin editor scrollport; speed-law: browser-native monotonic displacement over sampled phases; visible-scroll: actual owner offset and Rich anchor rect move | Custom scheduler/call claims green while visible owner is static, wrong owner moves, or release is fabricated | exact-chrome browser boundary-exit held-pointer trace with native event/buttons and live owner geometry | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#keeps native selection drag scrolling outside the editor | pass: interaction-trace: pass; target: native editor text and editor/browser boundary; event: mousemove; buttons: 1; boundary-exit-trace: pass; range-miss: continue; owner-lock: pass; speed-consistency: pass; visible-scroll: pass; release: stop |
| outside-editor:selection-autoscroll-continues | focus | during-action | yes | Editor/root retains native selection focus during boundary exit; real blur stops | Programmatic focus/blur compensation drives or terminates ordinary boundary scroll | exact-chrome browser activeElement/focus trace | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#keeps native selection drag scrolling outside the editor | pass: editor remains focused throughout both native gestures; no focus compensation added |
| outside-editor:selection-autoscroll-continues | popup | after-release | no | N/A: floating toolbar visibility is outside this scroll repair | N/A: popup state is not used as scroll evidence | N/A: exact route excludes toolbar assertion | N/A: no popup anchor | N/A: no popup result |
| outside-editor:selection-autoscroll-continues | geometry-paint | during-action | no | N/A: owner `scrollTop` and anchor rect are exact DOM geometry, not a pixel-fidelity claim | N/A: no layer, color, overlap, or compositor-paint assertion | N/A: DOM geometry remains in dom-native proof | N/A: no separate geometry-paint test | N/A: no pixel claim |
| outside-editor:selection-autoscroll-continues | runtime-errors | during-action | yes | Native drag, selection import, scroll and cleanup complete without console/page errors | Event/scheduler/selection exception aborts the gesture | exact-chrome browser and Playwright runtime console | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#keeps native selection drag scrolling outside the editor | pass: receipt Chrome5 and manual Chrome route show no page/console errors |
| outside-editor:selection-autoscroll-continues | follow-up-input | follow-up | yes | After real mouseup the editor accepts a new collapsed caret/edit and no scrolling continues | Stale custom loop, selection bridge, or native drag blocks the next edit | exact-chrome browser and Playwright follow-up click/key plus stable owner offset | test: apps/www/tests/browser/selection-drag-scroll.spec.ts#keeps native selection drag scrolling outside the editor | pass: release/return stops owner movement; heading click and ArrowRight retain focus and model selection |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| outside-editor:selection-autoscroll-continues | 5 | completed | "bash" "-lc" "set -e\nnode --test .agents/rules/regression/scripts/test-first-contract.test.mjs .agents/rules/regression/scripts/validate-regression-plan.test.mjs .agents/skills/regression/scripts/test-first-contract.test.mjs\nnode .agents/rules/plate-next/scripts/sync-resources.mjs --check\ndiff -u <(sed -n \"/^# Regression/,\\$p\" .agents/rules/regression.mdc) <(sed -n \"/^# Regression/,\\$p\" .agents/skills/regression/SKILL.md)\ncmp .agents/rules/regression/references/methodology.md .agents/skills/regression/references/methodology.md\ncmp .agents/rules/regression/scripts/validate-regression-plan.mjs .agents/skills/regression/scripts/validate-regression-plan.mjs\ncmp .agents/rules/regression/scripts/validate-regression-plan.test.mjs .agents/skills/regression/scripts/validate-regression-plan.test.mjs\npnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/root-interaction-controller.test.tsx test/selection-controller-contract.test.ts\npnpm --filter @platejs/plite-react typecheck\npnpm exec ultracite check apps/www/tests/browser/selection-drag-scroll.spec.ts packages/plite-react/src/editable/input-state.ts packages/plite-react/src/editable/root-interaction-controller.ts packages/plite-react/src/editable/selection-controller.ts packages/plite-react/test/root-interaction-controller.test.tsx packages/plite-react/test/selection-controller-contract.ts .agents/rules/regression/scripts/validate-regression-plan.mjs .agents/rules/regression/scripts/validate-regression-plan.test.mjs\nfor run in 1 2 3 4 5; do PLAYWRIGHT_BASE_URL=http://localhost:3002 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=\"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\" pnpm --filter www exec playwright test tests/browser/selection-drag-scroll.spec.ts --config playwright.config.ts --project=chromium --workers=1; done\ngit diff --check" | pass: exit 0 in 32152ms | dirty:219d1a9a2d8f79c4a3b0f07a7e3070c1f3296493 | sha256:a41a829caf356abfe580ef6c5d9addb4d65ca065fc1f3a3a3aef56cee132f566 | 27 | .agents/rules/regression.mdc,.agents/rules/regression/references/methodology.md,.agents/rules/regression/scripts/validate-regression-plan.mjs,.agents/rules/regression/scripts/validate-regression-plan.test.mjs,.agents/skills/regression/SKILL.md,.agents/skills/regression/references/methodology.md,.agents/skills/regression/scripts/validate-regression-plan.mjs,.agents/skills/regression/scripts/validate-regression-plan.test.mjs,.changeset/quiet-drag-scroll.md,.nvmrc,apps/www/package.json,apps/www/playwright.config.ts,apps/www/src/app/(app)/page.tsx,apps/www/src/components/playground-preview.tsx,apps/www/tests/browser/selection-drag-scroll.spec.ts,package.json,packages/browser/src/playwright/index.ts,packages/plite-react/package.json,packages/plite-react/src/editable/drag-auto-scroll-target.ts,packages/plite-react/src/editable/input-state.ts,packages/plite-react/src/editable/root-interaction-controller.ts,packages/plite-react/src/editable/root-interaction-resolver.ts,packages/plite-react/src/editable/runtime-root-engine.ts,packages/plite-react/src/editable/selection-controller.ts,packages/plite-react/test/root-interaction-controller.test.tsx,packages/plite-react/test/selection-controller-contract.ts,tooling/scripts/check-plite.mjs | pid:37689;started:2026-08-27T14:15:57.000Z;base-url:http://localhost:3002;browser:exact-chrome;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-27T14:33:50.381Z | 2026-08-27T14:34:08.904Z | 2026-08-27T14:34:41.057Z | 0 | sha256:66c1f18c7368d762bc73c7d51b7214fa9061fa3907a181e9698ae004999ef8b0 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite React native text selection bridge/root interaction | outside-editor:selection-autoscroll-continues | red: exact Chrome Plate owner `scrollTop=0` while same-page native control scrolls; pass: attempt4 adjacent root owner 20/20 before hard cut | 2026-08-27T14:33:50.381Z | attempt5 exact Chrome receipt command | sha256:a41a829caf356abfe580ef6c5d9addb4d65ca065fc1f3a3a3aef56cee132f566 | pass: workflow71, unit46, typecheck, Ultracite, exact Chrome5; Node22 full Plite dev gate passed |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Exact route first control injection | page body absent at `waitUntil: commit` | proof-host | wait for body before installing native-control oracle | pass: native control scrolls before Plate RED assertion |
| Attempt5 first candidate | actual owner moved but native selection cleared | product | ordinary text mousedown still prevented/custom-projected; make it browser-owned and skip DOM export | pass: exact E2E selection, model and owner all move |
| Stability release samples | outside-coordinate mouseup sometimes not delivered; toolbar proxy sometimes inapplicable | proof-oracle | accept actual release event or return `mousemove buttons=0`; prove stop/follow-up directly, not toolbar presence | pass: final Chrome5 |
| Stability geometry/model samples | event-interleaved rect strictness and immediate model import drift | proof-oracle | compare direction endpoints and poll model import phase | pass: final Chrome5 |
| `check:plite:dev` first run | browser smoke rejected Node 24 before assertion | proof-host | rerun the entire gate with `.nvmrc` Node 22 | pass: all affected typechecks, package tests, build and 3 smoke rows |
| Workflow parity command | full rule/SKILL `cmp` and first receipt sed quoting were invalid | command | compare generated body after metadata and exact resources; escape sed `$` | pass: final receipt |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| outside-editor:selection-autoscroll-continues | 1 | Reporter contradicted the completed outside-edge target fix | reporter-contradiction | yes: attempt1 completion/receipt revoked | repair-now: `.agents/rules/regression.mdc` boundary liveness/release validator | pass: workflow packet rejection | yes: timer-focus-correctness | best-api + plite-plan prior target | reproduced: attempt2 exact range-miss RED |
| outside-editor:selection-autoscroll-continues | 2 | Fresh #5113 final verification failed a fixed-time upward sample | final-verification | yes: attempt2 candidate/receipt revoked | repair-now: `.agents/rules/regression.mdc` unchanged-bytes diagnostic requirement | pass: workflow diagnostic packet rejection | yes: second-failed-fix | best-api + plite-plan retained target | reproduced: diagnostic: phase-sampled unchanged bytes classified oracle drift; attempt3 resumed |
| outside-editor:selection-autoscroll-continues | 3 | Reporter contradicted attempt3: outside speed varies and scrolling can stop | reporter-contradiction | yes: attempt3 completion/receipt revoked | repair-now: `.agents/rules/regression.mdc` owner-lock/speed validator | pass: 70 workflow tests; old packet rejected | yes: second-failed-fix | best-api + plite-plan stable-owner target | reproduced: attempt4 exact owner/speed unit RED |
| outside-editor:selection-autoscroll-continues | 4 | Reporter says the 18:04:46 retest never scrolls; frame sampling confirms static content while selection grows | reporter-contradiction | yes: attempt4 plan completion, receipt and final answer revoked | repair-now: `.agents/rules/regression.mdc`, methodology, validator/tests require actual visible-scroll owner offset/content geometry | pass: 71 workflow tests; attempt4 packet rejected for missing `visible-scroll` declaration/result | yes: second-failed-fix and ui-repairs-substrate | best-api hard cut + plite-plan native-selection owner target | reproduced: current video/static route evidence; exact route displacement RED next |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| outside-editor:selection-autoscroll-continues | 4 | second-failed-fix, ui-repairs-substrate | escalate | required: best-api hard cut makes ordinary native text drag browser-owned; delete attempt1-4 scroll compensation and retain only one private active-native-drag guard plus exceptional projected/root-chrome behavior | plite-plan: browser owns ordinary text selection/autoscroll; Plite imports DOM selection and skips DOM export while native drag is active; projected cross-root/coverage and non-text root-chrome selection keep their exceptional private owners | accepted: user named browser-native ownership; source proves normal same-root projected handler already returns false, while selection export/scroll restoration remains the interfering owner |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| outside-editor:selection-autoscroll-continues | Plite React native text mousedown, DOM selection export, exact Chrome route | fresh PID 37689 localhost:3002; Google Chrome 151; Node22 package lane | final receipt starts after latest input; manual Chrome extension fresh replay: down 0→609, up 609→0, selection/focus retained | generated Regression mirrors synced; product generated outputs untouched | pass: current source and exact executable authoritative |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| outside-editor:selection-autoscroll-continues | e2e-required exact RED: same-page native control scrolls but Plate owner remains 0 | native text root interaction/input state/selection controller, adjacent tests, existing E2E, changeset only | actual owner+anchor both directions, native/model selection, buttons/focus/release/follow-up, exact Chrome 5/5 | root cause, deletion cone, files, RED/GREEN, final fingerprints, full gate, review and caveat read back | pass: one normalized Patch completed in main thread |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| outside-editor:selection-autoscroll-continues | fresh PID 37689; exact Google Chrome binary plus receipt | 5 | exact Chrome bidirectional owner/anchor/native/model/focus/release/follow-up pass×5 | 0 | completed attempt5 |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| outside-editor:selection-autoscroll-continues | exact RED→GREEN; Chrome5 receipt; manual Chrome; unit46; full Plite gate | keep: completed locally | dirty current source only; not committed/pushed/integrated/released/public | exact Chrome extension cannot expose its live executable to shell receipt, so receipt separately attests same installed Chrome binary/version and manual path is support | user/coordinator |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| outside-editor:selection-autoscroll-continues | attempt4 owner/speed bookkeeping passed while route never moved | repair-now | `.agents/rules/regression.mdc`, methodology, validator/tests require actual owner+content `visible-scroll` and reject selection/call/synthetic offset proxies | pass: 71 workflow tests; attempt4 plan rejected for declaration/result gaps | attempt4 reporter contradiction repaired before attempt5 product work |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| native browser proof stabilization | Regression/Patch | several diagnostic reruns / expected one | original harness programmatically scrolled, overfit toolbar, mixed two directions in one gesture, and sampled event/model phases too strictly | high: prevented a fifth false completion | native control sentinel, separate directional gestures, actual owner/anchor trace, phase poll, direct release/follow-up; final exact Chrome5 |

Findings:

- Previous analysis was wrong: the 8.88s video shows selection expansion but stable viewport/content; Gemini transcript falsely labeled selection growth as scrolling.
- Exact control proved the automation path: a plain contenteditable scrolled under the same held Chrome input while Plate stayed at `scrollTop=0`.
- Root cause: ordinary native text mousedown was converted to `place-native-editable` and prevented; model selection/custom coordinate behavior simulated drag while the browser never owned selection/autoscroll.
- Final ownership: ordinary text mousedown is ignored by Root Interaction so the browser owns selection/autoscroll; Plite imports DOM selection and skips model-to-DOM export during that active native drag. Pre-existing custom rAF autoscroll remains only for non-text coordinate/root-chrome behavior.
- Attempt4 unit tests prove custom target/delta/session bookkeeping, not actual browser-native visible displacement.

Timeline:

- 2026-08-27: reporter correction “一直都没有滚动” invalidated attempt4 completion/receipt.
- 2026-08-27: user identified browser-native ownership; automatic attempt5 Regression repair and architecture escalation started.
- 2026-08-27: visible-scroll workflow repair synced and passed 71 tests; attempt4 packet now fails mechanically.
- 2026-08-27: exact route RED proved plain native control movement versus Plate owner zero; candidate restored browser-owned text drag and removed attempt1-4 compensation/legacy coordinate-selection assertions.
- 2026-08-27: final fresh PID 37689 receipt attested Google Chrome 151 and passed bidirectional visible scroll 5/5, unit46, typecheck, Ultracite and workflow71; Node22 full Plite dev gate passed.

Decisions and tradeoffs:

- Treat actual scroll-owner offset plus stable content-anchor geometry as the scroll oracle; selection expansion and transcript prose are not scroll evidence.
- Browser owns ordinary native text drag. Plite keeps one private active-drag bit only to prevent DOM export from stealing native ownership.
- Keep projected cross-root/DOM-coverage and non-text root-chrome coordinate selection because those are independent exceptional jobs; delete their application to ordinary native text.
- Programmatic scroll is allowed only as between-gesture setup for the upward case; every counted direction asserts interaction-owned offset and anchor movement.

Review fixes:

- Agent-native workflow review PASS: user correction -> Regression route -> `.agents/rules` source -> generated mirrors -> executable old-packet rejection -> plan/handoff; Browser/Chrome route is explicit.
- Best API maximum cut: do not add or publish an autoscroll API. Revert attempt-specific target/scheduler compensation; keep only native-drag lifetime state needed to suppress Plite DOM export, plus pre-existing exceptional projected/root-chrome selection.
- Manual P1 product review clean: no public/barrel API; browser-owned branch never calls projected selection/preventDefault; mouseup, return buttons=0 and unmount boundaries clear ownership; obsolete ordinary-text coordinate tests removed.
- Best API repair N/A: no reusable public API changed and existing Plite Vision already says active selection stays on the native/browser path.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full-file rule/SKILL `cmp` | 1 | compare generated body after metadata header and exact copied resources | resolved: body diff plus methodology/validator/test cmp pass; `sync-resources --check` pass |
| First native-control injection | 1 | wait for page body after commit | resolved: control proves browser/automation native scroll before product assertion |
| Native Chrome stability/proof proxies | 6 classes | freeze product, trace the failing phase, replace programmatic scroll/toolbar/fixed sample/combined direction/variable anchor with direct owner evidence | resolved: separate stable directional gestures and final exact Chrome5 |
| `check:plite:dev` under Node24 | 1 | rerun entire gate under `.nvmrc` Node22 | resolved: status passed, 1101 Plite React tests and 3 browser smoke rows |
| First receipt sed quoting | 1 | escape `$` inside nested shell | resolved: final receipt pass and valid ID |

Verification evidence:

- attached video metadata: 1730×1374, 8.876667s, 120fps; 4fps and 8fps frame sheets show static content geometry while selection changes.
- Regression workflow repair: focused validator 37/37; minimum source/generated workflow 71/71; resource sync and body/resource parity pass; attempt4 packet rejects missing `visible-scroll` declaration/result.
- exact Chrome E2E RED: same-page native control scrolled; Plate editor owner stayed at 0.
- exact Chrome E2E GREEN: actual owner and Rich content anchor move down/up; native/model selection, buttons, focus, release/return and follow-up input pass 5/5 on Google Chrome 151.
- final receipt: `sha256:66c1f18c7368d762bc73c7d51b7214fa9061fa3907a181e9698ae004999ef8b0`; digest `sha256:a41a829caf356abfe580ef6c5d9addb4d65ca065fc1f3a3a3aef56cee132f566`; 27 inputs; retries 0.
- focused owners: root interaction + selection controller 46/46; Plite React typecheck; scoped Ultracite; `git diff --check` pass.
- Node22 `pnpm check:plite:dev`: affected typechecks pass; Plite React 1101/1101, Yjs 223/223, layout 57/57; production build and Chromium smoke 3/3 pass.
- manual fresh Chrome extension support: down 0→609 and up 609→0, selection/focus retained, zero console errors.

Final handoff:

- executable cases: `outside-editor:selection-autoscroll-continues` completed on attempt5.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: base bidirectional fast scroll, held-pointer liveness, stall/speed and never-scrolled corrections all pass direct owner/anchor/native/model proof.
- failed-fix invalidation and automatic repair: attempts1-4 revoked; visible-scroll workflow rule/test prevents the attempt4 false green.
- proof receipts and affected-corpus replay: exact Chrome receipt/digest above; final Chrome5 and Node22 full affected gate pass.
- started-gate failure closure: proof host, Node version, command quoting, release delivery, model sampling, geometry and toolbar proxy failures all classified and rerun green.
- changed files: Regression source/methodology/validator/tests and generated mirrors; Plite input/root-interaction/selection source; adjacent tests; exact browser case; changeset and plans. Attempt-specific drag-target changes were fully removed.
- design decisions: browser owns ordinary text drag; Plite imports without DOM export; exceptional projected/root-chrome behavior remains private; no public API/controller/timer workaround.
- tests and proof: workflow71, unit46, Plite React typecheck, Ultracite, exact Chrome5, manual Chrome, full Node22 Plite dev gate and final receipt.
- source/generated sync: `pnpm install`, resource check and exact body/resource parity pass.
- P1 and agent-native findings: autoreview N/A on `next`; manual P1 clean; agent-native PASS.
- residual risks and next owner: exact Chrome automation uses separate directional gestures with programmatic scroll only between gestures; both counted gestures are native and direct. User/coordinator owns optional commit/push.
- local completion status and integration/public-status boundary: completed locally, uncommitted/unpushed; no PR, issue update, integration, release, or public-status mutation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | attempt5 completed locally with final exact Chrome receipt and full Plite gate |
| Where am I going? | user/coordinator decides optional commit/push |
| What is the goal? | restore browser-native visible bidirectional autoscroll and prevent another selection-only false green |
| What have I learned? | preventing ordinary text mousedown replaced native behavior with a simulation; selection/calls never prove visible movement |
| What have I done? | revoked attempt4, repaired Regression, restored browser ownership, deleted obsolete compensation, and proved actual bidirectional Chrome movement |

Open risks:

- Work is local and uncommitted/unpushed; no integration, release, or public issue claim exists.
- Upward/downward stability uses separate native selection gestures so direction does not collapse back to the same anchor. Programmatic scroll only positions the second setup and is excluded from counted samples.
