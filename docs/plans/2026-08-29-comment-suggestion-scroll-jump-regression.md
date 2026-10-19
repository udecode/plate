# comment suggestion scroll jump regression

Objective:
Prevent comment/suggestion annotations from snapping an upward scroll downward;
done when exact RED/green proof and 5 retry-free browser runs preserve scroll
ownership.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-29-comment-suggestion-scroll-jump-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: comment/suggestion annotation rendering while
  scrolling upward through the AI editor demo; one reporter video case
- lane and current source owner: registry `CommentLeaf` and `SuggestionLeaf`;
  derived hover store writes forced a React commit inside the contenteditable,
  so native CSS hover is the durable presentation owner
- selected executable test cases: `comment-suggestion-scroll-jump-001`
- tested ref or dirty-state boundary:
  `dirty:bc647af42db2f309a2ece9e424c11f77f86cc121`, input digest
  `sha256:78fb01b9734a6fd044ca13c32915a37b9ceb4f6ef17587f8343f1eb29397ef3d`;
  no commit or push requested
- route / proof host and freshness method: fresh PID 54639 on
  `http://127.0.0.1:3001/blocks/playground`, exact Chrome 151, after final
  registry generation and before five retry-free runs
- invocation mode / timebox: one-shot Regression execution; no timebox

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-29-comment-suggestion-scroll-jump-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-29-comment-suggestion-scroll-jump-regression.md`

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
- Preserve comment and suggestion rendering, editor selection/focus, document
  content, follow-up scrolling, and unrelated Date/TOC/void/HR behavior.
- Do not commit, push, publish, or mutate GitHub state.

Boundaries:

- allowed source owners: registry comment/suggestion presentation and their
  copied registry/changelog output; Plite diagnostics/candidates were removed
- allowed proof/test owners: focused package/DOM/browser tests for the affected
  editor behavior and local visual evidence artifacts
- generated/source boundary: edit registry source only; `build:registry`
  generated `public/r/comment.json` and `public/r/suggestion.json`; changelog
  JSON came only from its MDX source
- browser/device claim width: exact Chrome desktop wheel-equivalent upward
  scrolling on the local `/blocks/playground`; no mobile/device claim
- forbidden product/API/release/public mutations: no public API redesign unless
  architecture pressure proves it mandatory; no commit, push, release, issue,
  PR, or external mutation
- orchestration mode and writer ownership: one local writer in this thread; no
  subagents and no concurrent mutation of the server, source, tests, or plan

Output budget strategy:

- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap logs and exclude generated/build trees.
- Search only `apps/www/src/registry`, affected package owners, and focused test
  folders first; cap source reads to named ranges and store screenshots/logs in
  `.tmp/regression/comment-suggestion-scroll/` rather than streaming them.

Blocked condition:

- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.
- The goal tool is degraded because the prior terminal blocked goal cannot be
  replaced; the user's explicit new Regression request authorizes work under
  this plan, but this plan cannot claim goal-tool completion unless that runtime
  limitation clears.

Regression state:

- current phase: completed
- current executable case: `comment-suggestion-scroll-jump-001`
- current case status: completed-local
- next owner: user for optional commit
- goal status: completed in the Regression plan; the runtime goal tool remains
  locked to the unrelated blocked Date objective and was not falsely updated

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Exact case, upward-scroll action, comment/suggestion trigger, immediate downward jump forbidden state, supplied MP4, no commit/push, 5 retry-free final runs captured below. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read in full before source mutation. |
| Active goal checked or created | yes | `get_goal` found the unrelated terminal blocked Date goal; `create_goal` rejected replacement. Explicit new user request authorizes degraded plan control; no false completion transition was made. |
| Current source owner and tested ref recorded | yes | Registry comment/suggestion hover presentation; final dirty ref and receipt digest recorded. |
| Executable test cases discovered | yes | `unit-red: apps/www/src/registry/components/editor/annotation-hover.spec.tsx#renders comment and suggestion hover feedback with native CSS states`; exact Chrome remains final verification only. |
| Cumulative reporter evidence resolved | yes | Original Chinese report plus supplied MP4 are the complete current evidence set; no later deltas exist yet. |
| Reporter oracle matrix resolved | yes | Eight observation rows below resolve model, DOM/native, pointer event, focus, popup N/A, geometry, errors, and follow-up input. |
| Regression semantic validator ready | yes | Run the focused validator before the first test edit; `--complete` remains a closeout gate. |
| Route/proof-host readiness plan recorded | yes | Fresh PID 54639 on loopback port 3001; exact Chrome 151 completed warm plus five no-retry runs. |
| Patch delegation boundary recorded | yes | One case only; Patch may edit only the proven scroll/annotation owner and its focused test. |
| Orchestrator writer ownership recorded | N/A: no orchestrator or subagent | Single main-thread writer owns source, plan, tests, and proof host. |
| Output budget strategy recorded | yes | Narrow owner searches, capped reads/logs, `.tmp` artifacts, generated/build trees excluded. |
| Claim width and blocked rules recorded | yes | Desktop exact-local-route claim only; goal-tool degradation is not product completion or product blocker. |

Work Checklist:

- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work:
      upward scroll; comment/suggestion annotations entering view; no immediate
      downward snap; supplied MP4 as reporter evidence; exact local browser
      proof; 5 retry-free final runs; preserve annotations, selection/focus,
      content, and follow-up scrolling; no commit/push/public mutation.
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
- [x] Every reporter click reproduced through a drag surrogate proves the same
      gesture delivered a click event; a drag surrogate without the delivered
      click cannot authorize a product patch.
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
- [x] Required retry-free stability runs passed with no retry.
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
| Named completion threshold | yes | Close every selected executable case and methodology row | completed: one case kept, exact Chrome 5/5, no-change methodology row |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | completed: registry owner, dirty ref, 10-input receipt digest |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | completed: fresh PID 54639, exact Chrome 151, loopback route |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | completed: annotation-hover RED/green and exact Browser oracle |
| E2E escalation closure | yes | Prove `unit-red:` without a new E2E | completed: focused DOM/CSS unit test; Browser final only |
| Cumulative reporter evidence closure | yes | Map base acceptance and recording to oracles | completed: both evidence rows required and green |
| Reporter oracle closure | yes | Resolve all eight observation rows | completed: six applicable green, popup/geometry N/A |
| Failed-fix interrupt closure | no | N/A: no claimed candidate/kept/completed fix failed | completed: wrong probes were rejected before claim |
| Architecture pressure closure | yes | Best API and layer-plan evidence | completed: hard-cut derived hover state; Plite no-change decision |
| Proof receipt closure | yes | Validate generated final receipt | completed: receipt `58199c453720...`, retry 0 |
| Affected-corpus replay closure | yes | Replay affected cases after last owner edit | completed: focused corpus, www checks, exact Chrome 5/5 |
| Shared-style consumer closure | yes | Inventory comment/suggestion style consumers | completed: single/overlapping comments and inline/block insert/remove suggestions covered; line-break transparent classes remain separate and unchanged |
| Started-gate failure closure | yes | Rerun every failed started gate | completed: Node 22 `check:plite:dev`, final component tests, typecheck, Browser baseline |
| Smallest-probe closure | yes | Record first falsifying probe | completed: hover at scrollTop 0 caused 0→683 with distant selection |
| Patch delegation closure | yes | Read back one-case evidence | completed: root cause, owner, tests, receipt, stability, review recorded |
| Focused verification closure | yes | Run owning test and exact replay | completed: 3 tests and final exact Chrome 5/5 |
| Stability closure | yes | Record retry-free warm runs | completed: final five consecutive runs, zero retries |
| Packet decision closure | yes | Decide case | completed: keep registry native-hover patch |
| Local completion status | yes | Mark case/run completed | completed-local, uncommitted, unpushed |
| No duplicate registry | yes | Avoid sidecar behavior database | completed: only executable test and transient plan |
| Generated/source and host repair | yes | Repair drift/host issues | completed: registry/changelog generation and fresh host receipt pass |
| Orchestrator writer closure | no | N/A: one main-thread writer | completed: no subagent or overlapping host writer |
| Workflow slowdown closure | yes | Repair slow/stale/noisy paths | completed: noisy transcript rejected; stale-tab helper fixed; wrong owners removed |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer | completed: no-change, existing Regression rules caught every miss |
| Source/generated sync | no | N/A: no agent source; registry generators ran | completed: build:registry and changelog check pass |
| Agent-native review | no | N/A: no agent workflow/API changed | completed: no agent surface |
| Final handoff contract | yes | Record evidence and risk | completed below |
| Autoreview | no | N/A: branch `next` forbids autoreview helper | completed: direct P1 review clean after one simplification/coverage pass |
| Regression semantic plan | yes | Run complete semantic validator | completed: semantically complete |
| Goal plan complete | yes | Run Autogoal checker | completed: final mechanical checker pass |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | all user constraints, degraded goal-tool state, and 5/5 threshold recorded | source/host readiness |
| Current source and proof-host readiness | completed | registry owners; fresh PID 54639; exact Chrome 151 | executable cases |
| Executable case discovery and selection | completed | one report/video case and focused native-hover test | smallest probe |
| Cumulative reporter evidence inventory | completed | report plus frames 36-39 retained | oracle expansion |
| Reporter oracle expansion | completed | eight rows resolved | semantic validation |
| Pre-implementation semantic validation | completed | structural validator passed before final Patch | smallest probe |
| Smallest high-value probe | completed | exact hover reproduced 0→683 and later 240→683 | reproduce/classify |
| Reproduce, classify, and red test | completed | native CSS contract RED; store-backed hover identified | Patch |
| One-case Patch delegation | completed | registry native CSS only; Plite candidates removed | verification |
| Focused verification and stability | completed | 3 tests, www/type/registry gates, exact Chrome 5/5 | packet decision |
| Keep/revert/quarantine | completed | keep final registry patch | methodology delta |
| Methodology repair/no-change/defer | completed | no-change; workflow caught wrong owners/proof failures | closure |
| Reviews and final handoff | completed | direct P1 clean; evidence/risk recorded | goal-plan check |
| Final goal-plan check | completed | semantic validator and Autogoal checker pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| comment-suggestion-scroll-jump-001 | User report and `CleanShot 2026-08-29 at 22.14.42.mp4`; visual frames 37→38 | Open `/blocks/playground`, select the distant `Images and Media` heading, scroll upward while keeping that selection, and let the stationary pointer enter `.plite-comment` then `.plite-suggestion` | Upward motion remains monotonic; viewport never snaps down; both annotations retain hover feedback; selection/focus stay intact; later upward input still works | reporter: current request and supplied MP4 explicitly forbid the immediate downward snap | unit-red: `apps/www/src/registry/components/editor/annotation-hover.spec.tsx#renders comment and suggestion hover feedback with native CSS states` | exact-chrome: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` 151 on fresh PID 54639 at `http://127.0.0.1:3001/blocks/playground` | `bun test ./apps/www/src/registry/components/editor/annotation-hover.spec.tsx ./apps/www/src/registry/components/editor/suggestion.spec.tsx` | completed | dirty:bc647af42db2f309a2ece9e424c11f77f86cc121 | user for optional commit |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| comment-suggestion-scroll-jump-001 | base-acceptance | User: “上划碰到comment/suggestions的时候会立即滚动下来” | during-action | Upward scrolling through comment/suggestion annotations must not reverse or jump downward | required | dom-native@during-action, pointer-feedback@during-action, follow-up-input@follow-up | test: apps/www/src/registry/components/editor/annotation-hover.spec.tsx#renders comment and suggestion hover feedback with native CSS states | pass: final exact Chrome five-run sequence is monotonic through both annotations |
| comment-suggestion-scroll-jump-001 | recording | `/Users/felixfeng/Library/Application Support/CleanShot/media/media_i6s73qGj0V/CleanShot 2026-08-29 at 22.14.42.mp4` | during-action | Frames 36–37 show `Collaborative Editing`; frame 38 abruptly shows `Images and Media` within one 250ms interval | required | dom-native@during-action, runtime-errors@during-action | test: apps/www/src/registry/components/editor/annotation-hover.spec.tsx#renders comment and suggestion hover feedback with native CSS states | pass: final sequence replaces red 240→683 with 240→220→200→180 in 5/5 |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| comment-suggestion-scroll-jump-001 | model | during-action | yes | Document nodes, annotation marks, and the `Images and Media` model/native selection remain unchanged | Hover mutates document content or rewrites the selected point | package DOM component test plus exact-chrome selection text | test: apps/www/src/registry/components/editor/annotation-hover.spec.tsx#renders comment and suggestion hover feedback with native CSS states | pass: 5/5 finish with selection `Images and Media`; CSS hover publishes no store update |
| comment-suggestion-scroll-jump-001 | dom-native | during-action | yes | Scroll offsets decrease monotonically through comment and suggestion intersection | Any positive/downward discontinuity such as 240→683, detached selection, or wrong scroll owner | package DOM component test and exact-chrome scrollTop/selection trace | test: apps/www/src/registry/components/editor/annotation-hover.spec.tsx#renders comment and suggestion hover feedback with native CSS states | pass: each run is 940,780,620,460,300,280,260,240,220,200,180,160,140,120,100,80,60,40 |
| comment-suggestion-scroll-jump-001 | pointer-feedback | during-action | yes | `reporter-noun: comment/suggestions`; `affordance-inventory: .plite-comment, .plite-suggestion, [data-block-suggestion=true]`; real stationary pointer activates native CSS hover on comment and suggestion without React state publication | The event is lost, hover feedback disappears, or hover triggers the distant selection scroll | exact-chrome: pointer target/event/buttons trace plus `:hover`, class, and computed-background diagnostic | test: apps/www/src/registry/components/editor/annotation-hover.spec.tsx#renders comment and suggestion hover feedback with native CSS states | pass: interaction-trace: pass; target: `.plite-comment` at 220 and `.plite-suggestion` at 200; event: mouseenter; buttons: 0; both `:hover=true` in 5/5 |
| comment-suggestion-scroll-jump-001 | focus | during-action | yes | Contenteditable remains active and selection remains `Images and Media` while native CSS hover changes | Annotation hover moves focus or scrolls the distant caret into view | exact-chrome: activeElement plus native selection trace | test: apps/www/src/registry/components/editor/annotation-hover.spec.tsx#renders comment and suggestion hover feedback with native CSS states | pass: `activeEditable=true` and selection `Images and Media` after every run |
| comment-suggestion-scroll-jump-001 | popup | during-action | no | N/A: no popup or toolbar opens/closes in the reported flow | N/A: no popup state claim | N/A: no popup proof | N/A: no popup test | N/A: no popup claim |
| comment-suggestion-scroll-jump-001 | geometry-paint | during-action | no | N/A: the report supplies no fixed paint, size, layer, or bounded placement reference; viewport ownership is asserted by DOM scrollTop | N/A: no independent pixel/placement contract | N/A: recording supports reproduction only; final geometry claim is excluded | N/A: no geometry-paint test | N/A: no geometry-paint claim |
| comment-suggestion-scroll-jump-001 | runtime-errors | during-action | yes | Scroll, both annotation intersections, and follow-up emit no page/console error | Any uncaught error, rejection, or error overlay accompanies the action | exact-chrome: per-run runtime-error recorder | test: apps/www/src/registry/components/editor/annotation-hover.spec.tsx#renders comment and suggestion hover feedback with native CSS states | pass: zero action-time runtime errors in 5/5 |
| comment-suggestion-scroll-jump-001 | follow-up-input | follow-up | yes | Inputs after suggestion hover continue upward from 200 to 40 with annotations rendered | Follow-up snaps down, stalls, or loses hover rendering | exact-chrome: later real wheel inputs plus DOM/selection assertions | test: apps/www/src/registry/components/editor/annotation-hover.spec.tsx#renders comment and suggestion hover feedback with native CSS states | pass: 200→180→160→140→120→100→80→60→40 in 5/5 |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| comment-suggestion-scroll-jump-001 | 1 | completed | "/bin/zsh" "-lc" "'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --version >/dev/null && bun test ./apps/www/src/registry/components/editor/annotation-hover.spec.tsx ./apps/www/src/registry/components/editor/suggestion.spec.tsx >/dev/null && PLATE_WWW_ASYNC_DOCS=1 pnpm --filter www typecheck >/dev/null && node tooling/scripts/generate-ui-changelog-entries.mjs --check >/dev/null && pnpm exec ultracite check apps/www/src/registry/components/editor/comment.tsx apps/www/src/registry/components/editor/suggestion.tsx apps/www/src/registry/components/editor/annotation-hover.spec.tsx >/dev/null && git diff --check" | pass: exit 0 in 19040ms | dirty:bc647af42db2f309a2ece9e424c11f77f86cc121 | sha256:78fb01b9734a6fd044ca13c32915a37b9ceb4f6ef17587f8343f1eb29397ef3d | 10 | apps/www/public/r/comment.json,apps/www/public/r/suggestion.json,apps/www/src/registry/changelog/2026-08-30-fix-annotation-hover-scroll.json,apps/www/src/registry/changelog/components.json,apps/www/src/registry/changelog/entries/2026-08-30-fix-annotation-hover-scroll.mdx,apps/www/src/registry/changelog/index.json,apps/www/src/registry/components/editor/annotation-hover.spec.tsx,apps/www/src/registry/components/editor/comment.tsx,apps/www/src/registry/components/editor/suggestion.spec.tsx,apps/www/src/registry/components/editor/suggestion.tsx | pid:54639;started:2026-08-29T18:08:48.000Z;base-url:http://127.0.0.1:3001/blocks/playground;browser:exact-chrome:chromium;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-29T18:14:20.177Z | 2026-08-29T18:14:44.530Z | 2026-08-29T18:15:03.570Z | 0 | sha256:58199c4537205ffcfca52695cd4e0ab91658c1257c83350daf0f59af948a5393 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Registry comment/suggestion native hover plus generated payloads | comment-suggestion-scroll-jump-001 | red: exact Chrome 240→683 when store-backed hover rendered; unit CSS contract missing | 2026-08-29T18:14:20.177Z | focused 3 tests, www typecheck, registry/changelog checks, exact Chrome 5/5 | sha256:78fb01b9734a6fd044ca13c32915a37b9ceb4f6ef17587f8343f1eb29397ef3d | pass: receipt and final exact-route corpus pass |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| `check:plite:dev` browser smoke | Node 24 rejected; repo requires Node 22 | proof environment | reran exact gate with `/Users/felixfeng/.nvm/versions/node/v22.21.1/bin` | pass: typecheck, package tests, and 3 Chromium smoke tests |
| Chrome stability baseline | CDP input timeout before the first counted scroll | proof-host, pre-action | froze product edits, recovered the input channel, and restarted stability count | pass: replacement baseline 5/5, zero retries |
| Browser helper target | stale closure referenced an older error tab and returned null traces | proof-harness | passed the current tab explicitly to the helper | pass: warm plus final 5/5 on current tab |
| CSS component test | unknown paragraph type, missing React import, then overlapping Tailwind merge expectation | test-harness | used `paragraph`, imported React, and asserted single/overlapping leaves separately | pass: 3 tests, 16 assertions |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| none | 0 | N/A: no claimed candidate has failed exact replay | N/A: no failure kind | N/A: no prior claim | N/A: no repair trigger | N/A: no workflow repair | N/A: no architecture trigger | N/A: no Best API or layer plan | ready for first Patch attempt |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| comment-suggestion-scroll-jump-001 | 0 | ui-repairs-substrate | escalate | required: best-api accepted no public API, plugin flag, skip-scroll tag, imperative scroll compensation, or new owner; delete registry-derived hover state and keep active click state | plite-plan: no Plite change; exact diagnostics show selection controller receives `preserveScroll=true` only after the browser already moved to 643/683, so the Plate registry presentation owner removes the unnecessary React commit | accepted: native CSS keeps hover feedback; all Plite candidates and diagnostics were removed; exact Chrome and copied registry output pass |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| comment-suggestion-scroll-jump-001 | `comment.tsx`, `suggestion.tsx`, native CSS hover | focused Bun DOM tests; fresh PID 54639; exact Chrome 151 at `127.0.0.1:3001/blocks/playground` | final input digest `sha256:78fb...ef3d`; final host started after registry build; no product input changed after 5/5 | `build:registry` generated only copied payloads; changelog JSON generated from MDX source | pass: fresh host, exact Chrome, generated/source checks, and receipt complete |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| comment-suggestion-scroll-jump-001 | unit RED: missing native CSS hover contract (`getCommentLeafClassName` export absent before implementation) | registry `comment.tsx`, `suggestion.tsx`, focused DOM test, generated payloads, registry changelog; no package/public API change | exact RED/green, www typecheck, copied output, exact Chrome warm plus 5/5, P1 direct review | root cause, changed files, receipt, stability, architecture verdict, and caveats recorded | pass: completed-local |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| comment-suggestion-scroll-jump-001 | exact Chrome 151, fresh PID 54639, current-tab explicit helper | 5 | 1-5 each: 940,780,620,460,300,280,260,240,220,200,180,160,140,120,100,80,60,40; comment and suggestion `:hover=true`; focus/selection preserved; errors 0 | 0 | completed |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| comment-suggestion-scroll-jump-001 | unit 3/3, www typecheck, registry build/check, receipt `58199c453720...`, exact Chrome 5/5 | keep | completed-local, uncommitted, unpushed; no integration/release/public claim | cross-segment hover no longer shares React store state; click-active still highlights matching IDs, native hover highlights the pointed segment | user for optional commit |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| comment-suggestion-scroll-jump-001 | Regression exact replay, architecture pressure, and proof-host rules | no-change | existing Regression workflow correctly rejected two wrong Plite candidates, classified pre-action input failure, restarted stability, and required final input receipt | pass: semantic plan plus exact Chrome/receipt | no missing reusable methodology rule found |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Video transcript | Gemini helper | 3 model attempts | repetitive/noisy output | low after rejection | used 4fps frame evidence; no fabricated transcript |
| Browser input | Chrome extension CDP | intermittent before-action timeout | stale/input channel | high for final proof | froze edits, classified pre-action, recovered, reset baseline, final 5/5 |
| Product diagnosis | Regression/Patch | two narrow Plite candidates before final owner | scroll restoration observes the already-jumped position | high: ruled out wrong substrate owner | removed all Plite diffs; cut derived registry hover state |

Findings:

- `ffprobe` reports a 1538×924, 120fps, 10.403333s recording.
- The 4fps extraction shows the exact visual RED at frames 37→38: the viewport
  leaves the `Collaborative Editing` comment/suggestion region and lands on
  `Images and Media` within one 250ms interval.
- Gemini transcript attempts were rejected because all available model outputs
  were repetitive/noisy and did not provide trustworthy event timing; no
  handwritten transcript was substituted for the failed helper.
- Exact Browser RED: select `Images and Media`, retain that model/native
  selection, scroll the editor container to `scrollTop=0`, then move the pointer
  onto `like this added text`. The annotation `mouseenter` leaves the selection
  at `Images and Media` but jumps the container from `scrollTop=0` to `683`.
- Instrumenting every Plite React scroll owner showed only the selection
  controller after the jump. It entered with `preserveScroll=true` and
  `scrollTop=643/683`, proving post-commit restoration was observing an already
  wrong position rather than causing the first move.
- The actual owner was registry-derived hover state: `mouseenter` wrote
  `hoverId`, causing a React contenteditable commit only to change colors.
  Native CSS `:hover` provides the same pointed-segment feedback without a
  model/store publication or DOM replacement.
- The final exact Chrome run crosses comment at 220 and suggestion at 200 in
  each of five runs; every sequence remains monotonic to 40, with selection and
  focus preserved and zero action-time errors.

Timeline:

- 2026-08-30: Loaded Regression methodology and video-transcript workflow;
  inspected the supplied MP4 at 2fps/4fps and isolated the frame 37→38 jump.
- 2026-08-30: Goal tool remained locked to an unrelated blocked Date objective;
  continued under explicit user authorization with degraded plan control.
- 2026-08-30: Reproduced the exact local route: suggestion `mouseenter` with a
  distant `Images and Media` selection jumped editor scrollTop 0→683.
- 2026-08-30: Rejected selection-reconciler and React commit-fence candidates;
  exact diagnostics proved their snapshots began after the browser jump.
- 2026-08-30: Replaced registry hover store updates with native CSS hover,
  regenerated copied registry/changelog output, and passed unit/www checks.
- 2026-08-30: Final exact Chrome 151 on PID 54639 passed warm plus 5/5,
  zero retries and zero action-time errors; receipt `58199c453720...` captured.

Decisions and tradeoffs:

- Treat the recording as exact visual reporter evidence, not as an executable
  durable oracle -> source diagnosis and a RED test remain mandatory.
- Reject noisy generated transcripts -> frame evidence is narrower but honest.
- Reject the initial Plite React candidate -> controller diagnostics proved it
  received an already-jumped scroll position; keeping that machinery would be
  a false systemic fix.
- Use registry native CSS hover -> hover is presentation, not editor state;
  active click state remains store-backed and unchanged.
- Use owner-level DOM/CSS RED and Browser final replay -> permanent Playwright
  coverage is unnecessary because the focused component test owns the CSS
  contract and exact Chrome owns native scroll behavior.
- Best API hard-cut verdict -> add no public option, event, caller tag, or
  scroll compensation. Delete derived registry hover state and all attempted
  Plite machinery.
- Plite layer decision -> no Plite change. A substrate restore cannot recover a
  pre-commit position it never observed; the Plate registry must avoid an
  unnecessary React commit for native hover presentation.
- The one-shot Regression request already authorizes implementation of this
  no-public-API internal plan; a second standalone planning goal would duplicate
  the active case ledger and is impossible while the prior blocked goal remains
  tool-locked.

Review fixes:

- Direct P1 review: removed a test-only exported class helper, removed redundant
  `attributes={props.attributes}`, and expanded coverage to single/overlapping
  comments plus inline/block insert/remove suggestions.
- Autoreview helper: N/A because the current branch is `next`, where repo policy
  forbids invoking autoreview. Direct P1 review found no remaining P1 issue.
- Agent-native review: N/A; no agent workflow, tool, command, or instruction
  surface changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | N/A | N/A |
| Video transcript model returned repetitive/noisy summaries | 3 model attempts plus fallbacks | Stop model switching; use extracted visual frames and executable source/browser proof | No transcript claim made |
| `create_goal` rejected a new objective because the prior blocked Date goal is still considered unfinished | 1 | Record degraded goal control; continue only because the user explicitly started this new Regression task | Product work may proceed, but goal-tool completion cannot be claimed |
| First Browser scroll-trace probe used an unsupported `instanceof HTMLElement` inside the browser evaluator after one real scroll | 1 | Use a string `className` guard and continue from the observed scroll position | Corrected trace completed; no product claim depended on the failed evaluator |
| Browser locator inspection timed out after exact RED reproduction | 1 | Keep the valid CUA RED; use source selectors and package proof before reconnecting for final Browser replay | Final Browser freshness still required after the patch |
| First Plite selection-reconciler candidate stayed 240→683 | 1 | Instrument every scroll owner and capture pre-controller scrollTop | Rejected and fully removed; controller entered after jump with preserveScroll true |
| React commit-fence/insertion candidates captured after the jump | 2 narrow probes | Stop substrate edits; apply Best API/Plite pressure to presentation owner | Rejected and fully removed; registry native CSS candidate passed |
| `check:plite:dev` used Node 24 | 1 | Run exact gate with installed Node 22.21.1 | Pass: all affected typechecks/tests and Chromium smoke |
| First counted Browser attempt timed out before the first scroll | 1 | Freeze product edits, classify proof-host failure, recover input, restart stability baseline | Final replacement baseline passed 5/5 with zero retry |
| Browser helper closed over a stale error tab | 1 | Pass the current tab explicitly to the helper | Warm and five final runs passed on the current loopback tab |
| Component test setup errors (element type, React import, overlapping class expectation) | 3 | Use canonical `paragraph`, React JSX import, and separate single/overlapping leaves | Final 3 tests and 16 assertions pass |

Verification evidence:

- command: `bun test ./apps/www/src/registry/components/editor/annotation-hover.spec.tsx ./apps/www/src/registry/components/editor/suggestion.spec.tsx` -> 3 pass, 16 assertions.
- command: `PLATE_WWW_ASYNC_DOCS=1 pnpm --filter www typecheck` -> pass, including editor/API/source/registry/type generation checks.
- command: `pnpm --filter www build:registry` -> pass; copied `comment.json` and `suggestion.json` contain native hover classes.
- command: registry changelog `--write` and `--check` -> 93/93 events pass.
- command: focused Ultracite plus `git diff --check` -> pass.
- browser: exact Chrome 151, fresh PID 54639, loopback `/blocks/playground`, warm plus five final runs -> monotonic 940→40; comment/suggestion hover true; focus/selection preserved; errors 0; retries 0.
- artifact: receipt `sha256:58199c4537205ffcfca52695cd4e0ab91658c1257c83350daf0f59af948a5393`, input digest `sha256:78fb01b9734a6fd044ca13c32915a37b9ceb4f6ef17587f8343f1eb29397ef3d`.

Final handoff:

- executable cases: `comment-suggestion-scroll-jump-001` completed-local.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: original report/video retained; all eight observation rows resolved.
- failed-fix invalidation and automatic repair: N/A; no candidate/kept/completed claim failed. Wrong pre-candidate probes were removed before claim.
- proof receipts and affected-corpus replay: receipt `58199c453720...`; comment/suggestion source, tests, generated payloads, and changelog bound.
- started-gate failure closure: Node-version, Browser-input, stale-tab, and component-test failures all classified and exact final gates pass.
- changed files: `comment.tsx`, `suggestion.tsx`, `annotation-hover.spec.tsx`, copied `comment.json`/`suggestion.json`, registry changelog MDX/JSON/index/components, and this plan.
- design decisions: native CSS hover owns presentation; click active store remains; no Plite/package/public API change.
- tests and proof: focused 3/3; www typecheck; registry build/check; Ultracite; exact Chrome 5/5; receipt pass.
- source/generated sync: registry build and changelog generator pass; package changeset N/A because no package source changed; `pnpm install` N/A because no agent source changed.
- P1 and agent-native findings: direct P1 clean after one simplification/coverage pass; autoreview helper N/A on `next`; agent-native N/A.
- residual risks and next owner: native hover highlights the pointed split leaf rather than synchronizing transient hover across every leaf sharing an ID; click-active still synchronizes IDs. User owns optional commit.
- local completion status and integration/public-status boundary: completed-local, uncommitted, unpushed; not integrated, shipped, released, or publicly reported.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | completed-local; final receipt and handoff recorded |
| Where am I going? | user-owned optional commit; no autonomous product work remains |
| What is the goal? | keep upward scrolling monotonic when comment/suggestion annotations enter view |
| What have I learned? | store-backed hover caused a React commit solely for color; native CSS removes the commit and preserves scroll |
| What have I done? | fixed source/generated registry, added focused coverage/changelog, passed exact Chrome 5/5 and final receipt |

Open risks:

- Transient hover no longer synchronizes across split leaves sharing an
  annotation ID; the pointed leaf still shows hover and click-active remains
  synchronized. This is deliberate to avoid editor-state publication for CSS.
- Goal-tool control remains locked to the unrelated blocked Date objective, so
  no `update_goal(complete)` call is possible; plan/evidence closure is current.
