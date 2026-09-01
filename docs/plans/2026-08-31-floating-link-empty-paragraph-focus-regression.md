# floating link empty paragraph focus regression

Objective:
Fix empty-paragraph Link input focus and repair its false-green proof; done when
workflow regression, exact red/green, and fresh Browser focus pass 5/5.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-floating-link-empty-paragraph-focus-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: the Link insert toolbar opens from an empty
  paragraph but its `Paste link` input does not retain focus
- lane and current source owner: website reduced-motion transition policy and
  the copied Link toolbar's private initial-focus effect
- selected executable test cases: `floating-link-empty-paragraph-focus`
- tested ref or dirty-state boundary:
  `dirty:377a77a537971b793a4ddbb34cc13797fdfeee15`; prior geometry candidate and
  browser regression remain uncommitted
- route / proof host and freshness method: canonical `/blocks/link-demo` on a
  source-built `apps/www`; frozen-byte diagnostic first, fresh process and page
  after the last product edit
- invocation mode / timebox: one-shot `regression repair` followed by one
  serialized Patch attempt; no timebox

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-31-floating-link-empty-paragraph-focus-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-floating-link-empty-paragraph-focus-regression.md`

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

- allowed source owners: `.agents/rules/regression.mdc`, its methodology,
  validator/test/template sources, and—only after repair plus architecture
  review—the canonical Link/focus owner selected by current source;
  `apps/www/src/app/globals.css` owns the reproduced reduced-motion transition
- allowed proof/test owners:
  `.agents/rules/regression/scripts/validate-regression-plan.test.mjs`, generated
  Regression mirrors, and
  `apps/www/tests/browser/transient-editor-geometry.spec.ts`
- generated/source boundary: edit `.agents/rules/**` and project template source;
  never hand-edit `.agents/skills/**`; run `pnpm install` to regenerate mirrors;
  registry payloads come only from `pnpm --filter www build:registry`
- browser/device claim width: existing Chromium route plus exact native Chrome
  shortcut/follow-up-key proof; no OS-dialog, paint-layer, or device claim
- forbidden product/API/release/public mutations: no public API invention,
  generated-file hand edit, package release claim, commit, push, PR, or tracker
  mutation
- orchestration mode and writer ownership: main thread only; one writer and one
  route host at a time; no subagents

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

- current phase: completed; product, workflow, and final plan gates passed
- current executable case: `floating-link-empty-paragraph-focus`
- current case status: completed; kept after exact red/green and retry-free proof
- next owner: none for this local fix; commit/push requires a separate request
- goal status: completed locally, uncommitted and unpushed

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Latest correction requires the floating URL input to retain focus on open; no commit, PR, or wider API request was made |
| Regression methodology loaded | yes | Complete Regression skill and `references/methodology.md` read before goal creation or mutable work |
| Active goal checked or created | yes | Prior goal was complete; new exact objective created with this plan |
| Current source owner and tested ref recorded | yes | Current Link source and focus effect read at `dirty:377a77a537971b793a4ddbb34cc13797fdfeee15`; final owner remains subject to mandatory architecture review |
| Executable test cases discovered | yes | Existing mounted Chromium case `link floating editor opens from an empty paragraph 5/5` will be strengthened instead of adding another E2E file |
| Cumulative reporter evidence resolved | yes | Original popup/geometry acceptance, existing URL-focus contract, prior Browser `active:false` evidence, and latest reporter contradiction are all inventoried below |
| Reporter oracle matrix resolved | yes | All nine observations below have phase, positive/forbidden state, proof layer, executable anchor, and current result or N/A reason |
| Regression semantic validator ready | yes | Run the current validator before any workflow or product implementation and rerun after the failed-packet enforcement lands |
| Route/proof-host readiness plan recorded | yes | Frozen current bytes for diagnosis; fresh `apps/www` process and fresh Browser page after final product edit |
| Patch delegation boundary recorded | yes | No product Patch until automatic Regression repair, agent-native proof, Best API, and Plate plan close; then one focus owner only |
| Orchestrator writer ownership recorded | no | N/A: main thread executes serially; subagents are forbidden |
| Output budget strategy recorded | yes | Exact owner files, validator slices, focused tests, capped build/browser output; generated trees excluded from searches |
| Claim width and blocked rules recorded | yes | Local focus/open/close/follow-up behavior only; block only on an unrecoverable exact route or proof-host failure |

Work Checklist:

- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work:
      retain URL-input focus on open; invalidate the prior false green; repair
      workflow first; prove exact mounted behavior 5/5; preserve popup geometry;
      no API, Git, release, or public mutation.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded above and below.
- [x] Generated/source drift and host readiness are repaired or block the claim;
      source/mirror parity and the final source-built host PID 61177 passed.
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
      model state, DOM selection, preview state, and eventual action. N/A: this
      is a keyboard focus case.
- [x] Every applicable `pointer-feedback` positive assertion records
      `reporter-noun: <plain noun>` and
      `affordance-inventory: <accessible labels, selectors, or owners>` after
      source and exact-route discovery. Any excluded matching affordance cites
      explicit reporter or accepted-product authority. N/A: no pointer claim.
- [x] Every focus-transfer case covers both a direct `relatedTarget` and null
      `relatedTarget` followed by document `focusin`. Its positive assertion
      records `focus-transfer: direct-related-target + null-related-target ->
      focusin`; completion records `direct-related-target: pass`,
      `null-related-target: pass`, and `focusin-resolution: pass`. N/A: this is
      focus acquisition on popup mount, not transfer classification from an
      inactive-selection owner.
- [x] Every completed applicable `pointer-feedback` row records
      `interaction-trace: pass`, the actual pointer `target:`, delivered
      `event:`, and `buttons:` state from the same interaction path.
      N/A: no pointer claim.
- [x] Every flash, flicker, or one-frame pointer-feedback claim uses a target-
      capture or equivalent pre-handler oracle and records
      `pre-handler-state: pass`; eventual post-handler style is insufficient.
      N/A: no pointer-feedback flash claim.
- [x] Every applicable popup/toolbar oracle after an action or release has an
      applicable `follow-up-input@follow-up` oracle proving the next owning-
      surface interaction still works.
- [x] Every applicable popup/toolbar focus oracle records
      `focus-stability: settled + follow-up-key`, uses browser-native proof
      after the named layout/render settling boundary, and completes with
      `settled-focus: pass` plus `follow-up-key: pass`. Immediate focus samples
      and locator-side refocus are support-only. The final native Chrome and
      Browser cycles passed 5/5; permanent tests cover both motion settings.
- [x] Every shortcut-opened popup focus oracle records
      `trigger-path: pre-focused-surface + native-keyboard` and
      `native-trigger-key: pass`. The permanent Playwright case uses
      `page.keyboard`; native Chrome uses actual character key events. Both
      motion preferences reproduce the relevant environment in the test.
- [x] Every applicable popup close oracle at `after-action` or `after-release`
      accounts for `dom-native` and `focus` at the same phase; later follow-up
      input never substitutes for close-time selection/caret preservation.
- [x] Every required caret, insertion-point, caret-accessible line, editable
      blank line/row, or text-cursor claim maps to applicable same-phase
      `dom-native` and `focus` rows plus `follow-up-input@follow-up`. Native
      browser proof replays the real interaction and asserts caret paint
      independently from wrapper height, DOM markers, and block highlighting.
      N/A: this request concerns focus acquisition, not caret-pixel rendering.
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
- [x] Responsive geometry proof waits through animation-frame, resize-observer,
      or renderer-commit settling with a bounded invariant poll; it records
      pre-convergence and converged geometry instead of treating one immediate
      post-resize bounding-box read as final. N/A: no responsive resize claim;
      the existing anchored-popup assertion uses a bounded geometry poll.
- [x] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification. No final product stability
      failure occurred; hot reload and unsupported tool actions were classified
      with native event traces before rerunning unchanged product bytes.
- [x] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
      N/A: the focus fix has no compositor-phase or caret-paint claim.
- [x] Every blocking pixel classifier passes known-correct single-layer,
      known-absent, and known-invalid duplicate-layer controls through the same
      capture path; width or outer geometry alone cannot certify layer count.
      A failed control invalidates prior results and freezes product edits until
      the proof helper is repaired. N/A for this focus case; existing Link,
      table, and AI surface pixel controls passed as adjacent support.
- [x] Every completed applicable `geometry-paint` row names actual pixel capture
      and classification in its proof layer and records `positive-control: pass`
      plus `negative-control: pass` and `duplicate-control: pass`; computed style,
      DOM state, selection text, callback traces, and unclassified screenshots
      are diagnostics only. N/A: the selected focus case has no paint-layer claim.
- [x] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
- [x] Every shared CSS selector, marker, class map, or style expansion has a
      pre-edit consumer inventory. The affected corpus includes explicit
      transparent, borderless, shadowless, and ringless overrides, each with a
      forbidden duplicate/inherited-paint geometry oracle. No selector or paint
      token expands; the existing reduced-motion duration changes to zero.
      The Link surface test preserves transparent/borderless/shadowless/ringless
      field overrides and adjacent table/AI shells remain green.
- [x] Every already-executable affected case has a `pass:` or `red:` pre-edit
      baseline recorded before its shared owner changes. Exact focus was RED
      under reduced motion; Link edit and surface controls were green before
      attempt 6. Other demo runs are additional support, not invented baselines.
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
- [x] Every failed popup focus replay captures native focus events, owners at
      mount/positioned/settled/follow-up-key, first divergence, and the native
      focus-call target state before another lifecycle choice. Attempt 2
      predates call interception; attempt 3 supplies the decisive call trace.
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
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: exact red/green, five Browser cycles, five native Chrome cycles, and 50 retry-free permanent focus cycles |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: final generated receipts identify dirty:377a77a537971b793a4ddbb34cc13797fdfeee15 and the same eight-file input digest |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: fresh source-built Next PID 61177; registry rebuilt before host start; final pages reloaded after the last source update |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: the existing empty-paragraph test fails with reduced-motion 0.01ms and passes with zero transition duration |
| E2E escalation closure | yes | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | pass: e2e-required because actual CSS visibility, native focus, mounted React, and keyboard defaults cannot be proved by a detached unit test; no new E2E file |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pass: original empty-paragraph anchoring and latest focus/typing correction remain required and are green |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all eight observations and every applicable interaction phase per case | pass: native open/close focus and next-key oracles are explicit; pointer, pixel, model-mutation, and subscription claims have N/A reasons |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pass: attempts 1-5 remain invalidated; workflow repairs and executable tests precede attempt 6 |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pass: Best API/Plate Plan reject a public focus service and timing compensation; CSS owns visibility, copied Link owns input choice |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: both generated final receipts use sha256:dbeaa090c0d77b11fdf038eeda3d8b27009050aa3593e4c24b7311f57f1864b5 and immutable inputs during each command |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: all nine tests in the two affected browser files passed on the final receipt digest |
| Shared-style consumer closure | yes | Inventory every shared selector/class consumer and prove explicit paint neutralizers do not inherit or duplicate the shared surface | pass: no selector or paint-token expansion; zero reduced-motion duration only; existing Link neutralizers and table/AI shells passed |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: final exact and combined tests, repeat stability, www typecheck, registry/changelog, workflow suites, and source/mirror checks passed |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: strengthened existing focus test first; reduced-motion variant produced exact RED matching frozen-byte native traces |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | pass: main thread ran one normalized case; final root cause, owner, diff, red/green, and browser proof are recorded |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: insert and edit in both motion modes; five native Chrome and five in-app Browser open/focus/type/close cycles |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: repeat-each=5 contains five cycles in each of two motion modes, giving 50 cycles with retries=0 |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | pass: keep attempt 6; all prior failed candidates remain superseded, with no retained scheduler or manager |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pass: completed locally, uncommitted and unpushed; no integration/release/public issue claim |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: executable tests remain the behavior inventory; no sidecar behavior database was created |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: pnpm install, registry build, required-resource parity, fresh host, and final post-reload Browser proof |
| Orchestrator writer closure | yes | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | pass: no delegated writers; external Plite edits were detected by fingerprints and final proof was rerun after they settled |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: stale host and duplicate-host mistakes were repaired; Browser synthetic Tab and Chrome text-insertion limits were diagnosed |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | pass: repair-now; native shortcut, phase/focus-call ownership, and timer/animation-frame scheduler evidence are enforced |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pass: pnpm install; exact validator/test/methodology cmp; sync-resources --check |
| Agent-native review | yes | Run for changed agent workflows or record N/A | pass: source rule to generated skill to executable validator path audited; 146 source/mirror tests pass |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: final handoff below includes tests, decision, fingerprints, sync, reviews, risks, and local-only status |
| Autoreview | no | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A: forbidden on next; direct scoped source/diff review found no remaining P1 issue |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-31-floating-link-empty-paragraph-focus-regression.md --complete` | pass: Regression plan is semantically complete |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-floating-link-empty-paragraph-focus-regression.md` | pass: autogoal check-complete |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source/host readiness | completed | exact correction, local boundary, and fresh source-built route recorded | none |
| Reproduce and classify | completed | existing mounted case and native visibility trace falsified focus under reduced motion | none |
| Failed-fix workflow repair | completed | attempts 1-5 invalidated; red/green workflow tests and source/mirror parity | none |
| Best API and Plate Plan | completed | fix reduced-motion CSS; keep one private focus effect; no API or geometry-hook expansion | none |
| One-case Patch | completed | zero transition duration and removal of focus scheduling/state relay | none |
| Final verification and stability | completed | nine browser tests, 50 permanent focus cycles, and native/browser 5/5 | none |
| Packet decision and reviews | completed | keep local fix; direct P1 scope review and agent-native audit passed | none |
| Final plan validation | completed | semantic Regression validation and autogoal check-complete passed | local handoff |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| floating-link-empty-paragraph-focus | latest user correction plus prior exact Browser `active:false` 5/5 | On `/blocks/link-demo`, replace content with one empty paragraph, focus the editable, deliver ControlOrMeta+K through the native keyboard path, wait through popup settling, then type one key without clicking | The anchored Link popup stays open, `Paste link` owns settled focus, the key lands in that input, Escape closes it, and editor focus returns | existing-contract: `apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5` plus exact Chrome CUA replay | e2e-required: focus ownership depends on the mounted Link plugin, React commit/paint ordering, editor focus controller, Floating UI positioning, and real browser key delivery; no detached owner test can reproduce that lifecycle | browser: current-source Chromium route and native Chrome; motion-preferences: no-preference + reduce; runtime-modes: editing active, Link insert active, ordinary history, writable editor, no active comment or suggestion; fixture-scope: complete one empty paragraph; trigger-path: pre-focused-surface + native-keyboard; native-trigger-key: pass; no-click follow-up key | Playwright E2E: `apps/www/tests/browser/transient-editor-geometry.spec.ts`; `pnpm --filter www test:www-browser:chromium tests/browser/transient-editor-geometry.spec.ts --grep "link floating editor opens from an empty paragraph"`; final native Chrome CUA replay | completed | dirty:377a77a537971b793a4ddbb34cc13797fdfeee15 | none: local fix proved; commit/push requires a separate request |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| floating-link-empty-paragraph-focus | base-acceptance | prior empty-paragraph Link request and accepted geometry behavior | after-action | ControlOrMeta+K opens one Link insert popup at the empty paragraph's line anchor | required | popup@after-action, dom-native@after-action | test: apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5 | pass: popup is visible and anchored after the geometry repair |
| floating-link-empty-paragraph-focus | base-acceptance | existing mounted browser test and normal Link shortcut contract | after-action | The `Paste link` input owns focus after open and remains ready for typing | required | focus@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5 | pass: final same-source receipts and Browser/Chrome 5/5 retain URL-input focus and receive the next key |
| floating-link-empty-paragraph-focus | latest-reporter-delta | user: `ouch floating input not getting focused on open, fix it` | after-action | The floating URL input must retain focus on open | required | focus@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5 | pass: reporter contradiction remains the acceptance source; attempt 6 passes settled focus and no-click input |

Reporter oracle matrix:

For an effect-owned disposable source, the `subscription-lifecycle` row records
`strict-effect: mount + cleanup + remount` and closes with `mount: pass`,
`cleanup: pass`, `remount: pass`, and `post-remount-publication: pass`.

| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| floating-link-empty-paragraph-focus | model | after-action | no | N/A: opening the toolbar must not mutate editor content | N/A: no document-model outcome belongs to this focus case | N/A: focus is browser-native | N/A: focus is browser-native | N/A: no model claim |
| floating-link-empty-paragraph-focus | dom-native | after-action | yes | The exact mounted runtime receives the physical shortcut and mounts the Link input while preserving the empty editor DOM | A detached command or direct DOM repair substitutes for the mounted Link runtime | Browser mounted runtime diagnostic | test: apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5 | pass: runtime-owner: pass; mutation-owner: pass; mounted popup receives native shortcut and its URL input owns focus |
| floating-link-empty-paragraph-focus | pointer-feedback | during-action | no | N/A: keyboard focus report has no pointer affordance | N/A: no pointer state | N/A: no pointer proof | N/A: no pointer proof | N/A: no pointer claim |
| floating-link-empty-paragraph-focus | focus | after-action | yes | focus-stability: settled + follow-up-key; trigger-path: pre-focused-surface + native-keyboard keeps `Paste link` as activeElement after popup layout settles | The editable root or body steals focus before the next key | Browser mounted focus lifecycle plus exact native Chrome | test: apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5 | pass: settled-focus: pass; follow-up-key: pass; native-trigger-key: pass; final Chrome 5/5 and permanent both-motion tests |
| floating-link-empty-paragraph-focus | popup | after-action | yes | One anchored `Paste link` popup remains visible while focus transfers into it | The popup is hidden, duplicated, or returns to viewport origin | Browser mounted popup and DOM bounds | test: apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5 | pass: one popup is visible at the empty line anchor |
| floating-link-empty-paragraph-focus | geometry-paint | after-action | no | N/A: focus is the current claim and popup bounds are DOM support, not a paint-layer claim | N/A: no pixel-classified paint outcome | N/A: no paint proof | N/A: no paint proof | N/A: no paint claim |
| floating-link-empty-paragraph-focus | subscription-lifecycle | after-action | no | N/A: no keyed or effect-owned disposable source changes | N/A: no subscription lifecycle | N/A: no subscription proof | N/A: no subscription proof | N/A: no subscription claim |
| floating-link-empty-paragraph-focus | runtime-errors | after-action | yes | The exact open/focus/type/close cycle emits no runtime error | Console error, unhandled rejection, or error overlay appears | Browser runtime error recorder | test: apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5 | pass: zero runtime errors in the final permanent tests and Browser/Chrome proof window 15:17:42-15:18:02Z |
| floating-link-empty-paragraph-focus | follow-up-input | follow-up | yes | Without clicking, the next physical key changes `Paste link`; after Escape the next editor key changes the document | The key lands in the editor while the popup is open, is dropped, or the editor stays unusable after close | Browser mounted keyboard lifecycle | test: apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5 | pass: permanent tests type x in the URL input and q after Escape; native Chrome types X and Q via actual keypress events, without target clicks |

| floating-link-empty-paragraph-focus | popup | after-release | yes | Escape unmounts the Link form and leaves the editor available | A hidden form remains active or the popup reopens | Browser native keyboard lifecycle | test: apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5 | pass: input hidden/unmounted after Escape in both motion modes and native Chrome |
| floating-link-empty-paragraph-focus | dom-native | after-release | yes | Escape removes the popup DOM while retaining the mounted editable root | Direct DOM repair or a detached editor substitutes for close behavior | Browser mounted runtime | test: apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5 | pass: runtime-owner: pass; mutation-owner: pass; editor remains connected and popup input is absent |
| floating-link-empty-paragraph-focus | focus | after-release | yes | focus-stability: settled + follow-up-key; trigger-path: pre-focused-surface + native-keyboard; Escape restores the editor and its next character key edits the document | Body or the closed popup retains focus and the next key is lost | Browser native keyboard lifecycle | test: apps/www/tests/browser/transient-editor-geometry.spec.ts#link floating editor opens from an empty paragraph 5/5 | pass: settled-focus: pass; follow-up-key: pass; native-trigger-key: pass; Chrome 5/5 and permanent tests |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| floating-link-empty-paragraph-focus | 6 | completed | "pnpm" "--filter" "www" "test:www-browser:chromium" "tests/browser/transient-editor-geometry.spec.ts" "tests/browser/link-floating-toolbar.spec.ts" "--retries=0" | pass: exit 0 in 38012ms | dirty:377a77a537971b793a4ddbb34cc13797fdfeee15 | sha256:dbeaa090c0d77b11fdf038eeda3d8b27009050aa3593e4c24b7311f57f1864b5 | 8 | apps/www/public/r/link.json,apps/www/public/r/use-widget-floating.json,apps/www/src/app/globals.css,apps/www/src/registry/components/editor/link.tsx,apps/www/src/registry/hooks/use-widget-floating.ts,apps/www/tests/browser/link-floating-toolbar.spec.ts,apps/www/tests/browser/transient-editor-geometry.spec.ts,packages/plitejs/src/react/stable-id-mapped-source.ts | pid:61177;started:2026-08-31T15:08:52.000Z;base-url:http://localhost:3000;browser:chromium | 2026-08-31T15:15:28.513Z | 2026-08-31T15:15:59.577Z | 2026-08-31T15:16:37.589Z | 0 | sha256:bc762eb9db7130d6e830d9e8c0fa1ba18d909c2e841edb077343b2bcf6a6d9b6 |
| floating-link-empty-paragraph-focus | 6 | completed | "pnpm" "--filter" "www" "test:www-browser:chromium" "tests/browser/transient-editor-geometry.spec.ts" "--grep" "link floating editor opens from an empty paragraph" "--repeat-each=5" "--retries=0" | pass: exit 0 in 28548ms | dirty:377a77a537971b793a4ddbb34cc13797fdfeee15 | sha256:dbeaa090c0d77b11fdf038eeda3d8b27009050aa3593e4c24b7311f57f1864b5 | 8 | apps/www/public/r/link.json,apps/www/public/r/use-widget-floating.json,apps/www/src/app/globals.css,apps/www/src/registry/components/editor/link.tsx,apps/www/src/registry/hooks/use-widget-floating.ts,apps/www/tests/browser/link-floating-toolbar.spec.ts,apps/www/tests/browser/transient-editor-geometry.spec.ts,packages/plitejs/src/react/stable-id-mapped-source.ts | pid:61177;started:2026-08-31T15:08:52.000Z;base-url:http://localhost:3000;browser:chromium | 2026-08-31T15:15:28.513Z | 2026-08-31T15:17:33.852Z | 2026-08-31T15:18:02.400Z | 0 | sha256:495f90f13531ddf46935de09237b7b0697b6c0bfad385e194720115b6e8c7b9a |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| reduced-motion CSS and copied Link initial focus | floating-link-empty-paragraph-focus | red: exact insert focus under reduced motion; pass: existing edit/submit and Link surface controls before attempt 6 | 2026-08-31T15:15:28.513Z | pnpm --filter www test:www-browser:chromium tests/browser/transient-editor-geometry.spec.ts tests/browser/link-floating-toolbar.spec.ts --retries=0 | sha256:dbeaa090c0d77b11fdf038eeda3d8b27009050aa3593e4c24b7311f57f1864b5 | pass: 9/9, including adjacent Link edit/submit and surface neutralizers plus additional Find, inactive selection, remote cursor, floating toolbar, table, and AI support; no retroactive baseline claim for those support rows |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Current-route source freshness | Early route served stale generated Link code; registry regeneration briefly removed its import target | proof-host/source-freshness | Build registry through owner command, then use a fresh host/page | pass: final nine-test receipt plus Browser and Chrome 5/5 |
| Empty-paragraph exact replay | Input was hidden at focus under reduced motion | product | Zero transition duration and one private positioned focus effect | pass: both-motion exact and 50-cycle receipts |
| Final native proof setup | External stable-id-mapped-source edits hot-reloaded the editor between proof runs | concurrent source mutation | Discard stale snapshots, capture the dependency, rerun combined/stability/native proof on the same digest | pass: final corpus and stability share sha256:dbeaa090c0d77b11fdf038eeda3d8b27009050aa3593e4c24b7311f57f1864b5; fresh native proof follows latest dependency edit |
| Browser Tab / Chrome editor text insertion | Browser Tab delivered untrusted events without default navigation; Chrome type emitted input with empty inputType and no beforeinput | proof-tool action mismatch | Use Chrome actual character keypress events for native navigation and editor typing; keep Browser as focus/value/close support | pass: Chrome keypress X, Tab, Shift+Tab, Escape, and Q pass 5/5; Browser focus/value/close passes 5/5 |
| Scheduler workflow guard | Guard accepted timer/setTimeout labels without required scheduler trace | workflow | Extend failing regression to timer and setTimeout; extend owning matcher | pass: focused red/green and 146 source/mirror tests |
| www typecheck, scoped lint, registry, and source mirrors | Earlier host/generated drift prevented reliable proof | generated/host | Final source-first typecheck, scoped lint, registry/changelog check, install and parity audit | pass: all commands completed on final source |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| floating-link-empty-paragraph-focus | 1 | Prior handoff called the empty-paragraph Link case fixed while Browser recorded `active:false`; latest reporter confirms focus remains broken | reporter-contradiction | yes: prior green, completion receipt, and local completion wording revoked | repair-now: `.agents/rules/regression/scripts/validate-regression-plan.mjs` rejects immediate-only popup focus proof and source rules define settled focus | pass: `popup focus completion requires settled focus and a follow-up key`; full workflow suite 89/89 | yes: timer-focus-correctness and attempt 2 require architecture review | best-api: pass, no public API; plate-plan: pass, copied Link UI owns focus after Floating UI positioning | reproduced: strengthened exact RED captured; one registry-owner Patch authorized |
| floating-link-empty-paragraph-focus | 2 | The `isPositioned` layout-effect candidate still left the editor focused; mount, positioned, settled, and follow-up-key all reported `editor`, with zero native focus events | exact-replay | yes: attempt 2 hypothesis and any candidate-green claim revoked; no completion receipt existed | repair-now: `.agents/rules/regression/scripts/validate-regression-plan.mjs` requires a native focus-owner trace before choosing another scheduler or position gate | pass: `a failed popup focus fix requires a native focus-owner trace`; full workflow suite 90/90 | yes: second failed fix plus focus lifecycle ownership | best-api: pass, keep focus private and delete hand-rolled scheduling; plate-plan: pass, copied Link UI composes installed `FloatingFocusManager`, while `useWidgetFloating` remains geometry-only | reproduced: current generated route; diagnostic: unchanged attempt-2 bytes kept editor focus at mount, positioned, settled, and follow-up-key; focus-owner-trace: mount + positioned + settled + follow-up-key; native-focus-events: focusin + focusout capture; first-divergence: positioned/url-input-never-focused; focus-call-trace: target + connected + display + visibility + disabled + active-after-call unavailable for superseded attempt-2 bytes; focus-call-result: unavailable/attempt-2-predated-call-interception; attempt 3 authorized |
| floating-link-empty-paragraph-focus | 3 | `FloatingFocusManager` called the connected URL input, but computed visibility was still hidden and activeElement remained the editor | exact-replay | yes: attempt 3 target and any candidate-green claim revoked; no completion receipt existed | repair-now: `.agents/rules/regression/scripts/validate-regression-plan.mjs` requires a native focus-call trace that distinguishes a missing call from a browser-rejected call | pass: `a failed popup focus fix requires a native focus-owner trace` covers the call boundary; full source/generated workflow suite 138/138 | yes: repeated focus lifecycle failure and copied-style interaction | best-api: pass, no public API or hook widening; plate-plan: pass, copied Link UI neutralizes its accidental visibility transition and composes installed `FloatingFocusManager` | reproduced: unchanged attempt-3 generated bytes; diagnostic: native focus call targeted the connected enabled URL input while hidden and left activeElement on editor; focus-owner-trace: mount + positioned + settled + follow-up-key; native-focus-events: focusin + focusout capture; first-divergence: focus-call/url-input-hidden; focus-call-trace: target + connected + display + visibility + disabled + active-after-call; focus-call-result: called/url-input-connected-flex-hidden-enabled/editor; attempt 4 authorized |
| floating-link-empty-paragraph-focus | 4 | The `transition-none` plus `FloatingFocusManager` candidate passed Playwright but failed native Chrome: Cmd+K opened the popup, activeElement remained the editor, and native typing did not change `Paste link` | final-verification | yes: attempt 4 candidate green, 5x stability, and adjacent Playwright proof revoked as exact-case completion; they remain proxy coverage | repair-now: `.agents/rules/regression.mdc`, its validator/methodology, and `docs/plans/templates/regression.md` require shortcut popup focus to name `trigger-path: pre-focused-surface + native-keyboard` and `native-trigger-key: pass` | pass: `shortcut-opened popup focus requires a native keyboard trigger`; full source/generated workflow suite 140/140 and exact mirror parity | yes: fourth failed focus-lifecycle attempt | best-api: pass, delete `FloatingFocusManager` because this non-modal Link input needs acquisition, not managed focus; plate-plan: pass, copied Link UI alone schedules one cancelable animation-frame focus after Floating UI position commit while `useWidgetFloating` remains geometry-only | reproduced: current native Chrome bytes; diagnostic: CUA Meta+K opened one correctly positioned popup but input focus was rejected; focus-owner-trace: mount + positioned + settled + follow-up-key remained editor; native-focus-events: focusin + focusout capture showed no URL-input focus event; first-divergence: focus-call/url-input-hidden-before-keyup; focus-call-trace: target + connected + display + visibility + disabled + active-after-call; focus-call-result: called/url-input-connected-flex-hidden-enabled/editor; attempt 5 authorized |
| floating-link-empty-paragraph-focus | 5 | requestAnimationFrame focus still failed native Chrome: the wrapper was visible, but the URL input and form descendants remained hidden | exact-replay | yes: attempt 5 candidate and default-motion Playwright green revoked as exact-case closure | repair-now: `.agents/rules/regression.mdc`, validator/test, methodology, and template require focus scheduler request/cancel/run evidence; the permanent case replays both motion preferences | pass: `a failed scheduled popup focus fix requires a scheduler trace`; full source/generated suite 142/142; exact source/mirror parity | yes: repeated scheduler compensation masked a global CSS owner | best-api: pass, delete scheduler and manager rather than publish a focus API; plate-plan: pass, repair global reduced-motion transition policy, retain one position-gated focus effect in copied Link UI | reproduced: reduced-motion Chromium RED matches native Chrome; diagnostic: frozen-byte animation trace found the form container running a visibility transition with duration 0.01ms, while the wrapper was visible; focus-owner-trace: mount + positioned + settled + follow-up-key remained editor; native-focus-events: focusin + focusout capture, zero URL input events; first-divergence: focus-call/form-hidden-by-reduced-motion; focus-call-trace: target + connected + display + visibility + disabled + active-after-call; focus-call-result: called/connected-enabled-url-input-hidden/editor; focus-scheduler-trace: request + cancel + run; focus-scheduler-result: ran/not-cancelled/url-input-hidden; attempt 6 authorized |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| floating-link-empty-paragraph-focus | 5 | timer-focus-correctness, second-failed-fix, cross-layer-compensation | escalate | required: best-api deletes timing compensation and rejects API/hook widening; native focusability is a CSS/DOM law, not a new public focus service | plate-plan: `globals.css` reduced-motion policy uses zero transition duration so static descendants do not acquire visibility transitions; copied `link.tsx` focuses its URL input once when its active positioned view commits, without manager/timer/animation-frame machinery | accepted: current Chrome reports reduced motion; computed animation keyframes show hidden-to-visible visibility on the form container; the existing Chromium test becomes exact RED only with `page.emulateMedia({ reducedMotion: 'reduce' })` |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| floating-link-empty-paragraph-focus | globals.css reduced-motion policy and copied Link UI; Plite focus marker and geometry hook unchanged | source-built Next PID 61177 on localhost:3000/blocks/link-demo; started 2026-08-31T15:08:52Z | registry built before host start; final Browser/Chrome pages reloaded at 15:17:42Z after latest captured input update | registry source owns generated payload; no package exports or generated hand edits | pass: 9/9 corpus, 50 retry-free focus cycles, Browser 5/5 and Chrome 5/5 |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| floating-link-empty-paragraph-focus | red: native focus call sees a connected enabled hidden input; permanent test reproduces under reduced motion with 0.01ms duration | globals.css and registry Link; existing browser test; generated registry and changelog through their owner commands | both-motion exact focus, 50 cycles, edit/submit, adjacent surfaces, Browser and Chrome 5/5 | root cause: global positive transition duration creates hidden-to-visible descendant transitions; fix: 0s and one private focus effect; receipts, direct review and parity below | completed: attempt 6 kept locally |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| floating-link-empty-paragraph-focus | final Chromium receipt; fresh Browser and Chrome on PID 61177 | permanent repeat-each=5 with 5 opens in each of 2 motion modes; native Chrome 5/5; Browser focus 5/5 | pass: 50 permanent cycles; native Chrome full-keyboard flow 5/5; Browser focus/value/close 5/5; no errors | 0 | keep, completed |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| floating-link-empty-paragraph-focus | exact reduced-motion RED, nine-test final corpus, 50 stable cycles, native/browser 5/5 | keep | completed locally at the recorded dirty ref and digest; no commit, push, integration, or release claim | no separate Safari/Firefox/device claim; Browser tool keyboard limits are covered by native Chrome and permanent tests | none for this local request |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| floating-link-empty-paragraph-focus | Early focus samples, locator refocus, missing native call state, and scheduler guesses masked rejected focus; no-preference tests omitted the actual reduced-motion environment | repair-now | .agents/rules/regression.mdc, its methodology and validator/test, and docs/plans/templates/regression.md require settled next-key focus, native shortcut delivery, call-state ownership and scheduler request/cancel/run evidence; permanent test covers both motion settings | pass: focused workflow RED/GREEN, including timer/setTimeout guard, 146 source/mirror tests and exact parity | all five failed-fix interrupts repaired; attempt 6 completed |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| `pnpm --filter www dev:plite -- -p 3008` | proof host | immediate / immediate | `next dev` interpreted `--` as a project directory | none; command-shape error | used `pnpm --filter www exec next dev -p 3008`, then returned to one canonical port-3000 host |
| Temporary `127.0.0.1:3008` replay | proof host | one replay / one replay | two dev hosts caused cross-origin development chunks and selection setup failed before the focus assertion | diagnosed host contamination, not product behavior | stopped both temporary hosts and started one clean `localhost:3000` process |
| Playwright attempt-4 final verification | test oracle | 1 exact plus 5x stability / expected | locator/browser automation timing did not reproduce native Chrome's hidden-at-focus call | proxy coverage only | native Chrome became the exact final oracle; Regression now requires a named native shortcut path |

| Hung canonical dev process | proof host | repeated 10s HTTP timeouts | PID 35192 used 99.5% CPU and its original PTY was unavailable | host failure, not product evidence | stopped exact owned PIDs 35192/35186; restarted one host; final PID 61177 serves the route |
| External dependency edits during verification | proof host | two stale receipt sets discarded | another writer updated stable-id-mapped-source and HMR reset editor state | fingerprint changed between runs | captured dependency in receipts; reran final corpus, stability, and native proof after 15:15:28Z |
| Synthetic/tool text actions | Browser/Chrome proof | diagnosed with one event trace per action | Browser Tab is untrusted; Chrome type on an empty editable omitted beforeinput | native event trace separates tool behavior from product | Chrome character keypress emits trusted insertText and passes; temporary listeners removed |

Findings:
- The reduced-motion rule assigned a positive transition duration to every
  descendant. The default transition property is all, so revealing a popup
  created a hidden-to-visible transition on its otherwise-static form.
- Native tracing showed the wrapper visible while the URL input remained
  hidden. The browser correctly rejected focus. Both Browser and Chrome used
  reduced motion, while the earlier permanent fixture used no preference.
- Changing that duration to zero removes the accidental transition. Link keeps
  one private position-gated effect, one active form, and a URL input ref.
  No timer, animation frame, manager, updated store flag, or consumed-focus
  latch remains in initial focus.
- Native Chrome and the both-motion permanent test agree on focus, first input,
  Tab/Shift+Tab, Escape, and next editor input. Browser separately confirms
  focus/value/close. Its synthetic Tab is not counted as native tab-order proof.
- No package/core API, geometry hook, selection marker, or paint token changed.
  The global CSS effect is limited to transitions under reduced motion.
  Source review found no transitionend/transitioncancel consumer in the
  website component/registry/hooks/app owners.

Timeline:

- 2026-08-31 New reporter contradiction revoked attempt 1 completion and created this Regression goal.
- 2026-08-31 Workflow regression failed because the validator accepted immediate-only popup focus proof.
- 2026-08-31 Regression rule, methodology, template, validator, and executable test were repaired; 89/89 workflow tests and source/mirror parity passed.
- 2026-08-31 Best API rejected a public focus API and selected the maximum
  private deletion; Plate Plan kept geometry in `useWidgetFloating` and focus
  policy in copied Link UI.
- 2026-08-31 The strengthened current-source Chromium case failed before the
  product edit at settled activeElement, proving the focus race.
- 2026-08-31 Attempt 2's position-gated layout effect failed exact replay after
  registry regeneration; a native trace proved the URL input never received a
  focus event.
- 2026-08-31 Regression was repaired again with mandatory focus-owner tracing;
  the focused workflow test and full 90/90 suite passed with exact mirrors.
- 2026-08-31 Best API and Plate Plan retained the copied Link owner but replaced
  the failed custom focus gate with installed `FloatingFocusManager`.
- 2026-08-31 Attempt 3 still failed. Native `focus()` interception proved the
  manager called the correct connected target while its computed visibility was
  hidden; the browser correctly rejected the call.
- 2026-08-31 Regression was repaired a third time to require native focus-call
  target state; focused RED/GREEN and the full 138/138 source/mirror suite passed.
- 2026-08-31 Best API and Plate Plan rejected hook/API widening and selected a
  local `transition-none` neutralizer on the copied Link floating surface.
- 2026-08-31 Attempt 4 passed focused and stability Playwright runs but failed
  final native Chrome replay: the popup opened, activeElement stayed on the
  editor, and the next typed key missed the URL input.
- 2026-08-31 Regression was repaired a fourth time to require a native shortcut
  trigger path; focused RED/GREEN, the full 140/140 suite, generated parity,
  and the agent-native capability map passed.
- 2026-08-31 Native CDP tracing on frozen attempt-4 bytes found the same first
  divergence: `FloatingFocusManager` called the connected URL input while its
  computed visibility was hidden, before keyup, and the browser rejected focus.

- 2026-08-31 Attempt 5's scheduler still targeted a hidden input. Frozen-byte
  animation inspection identified reduced-motion CSS as the actual owner;
  both-motion permanent replay produced exact RED.
- 2026-08-31 Attempt 6 corrected the duration and removed scheduling. Registry,
  source-first typecheck, 146 workflow tests, nine browser tests, 50 focus cycles,
  and fresh Browser/Chrome 5/5 passed on the final input fingerprint.

Decisions and tradeoffs:
- Repair the CSS owner that makes the input nonfocusable; do not publish a
  focus service or add another timing layer.
- Keep input choice in copied Link UI and geometry in useWidgetFloating.
  The effect runs on the transition to an active positioned form, so typing or
  Tab navigation does not repeatedly reacquire focus.
- Keep transition-none on the Link wrapper because its generic popover class
  otherwise applies duration-100. The global reduced-motion rule must use zero
  to avoid creating transitions on static descendants.
- Preserve reduced-motion animation and scroll policies, input paint
  neutralizers, empty-line anchoring, selection markers, and Enter submission.
- No Best API doctrine change is needed: this removes private compensating
  machinery without changing a reusable public contract. Package changeset and
  barrel generation are N/A; registry changelog and payload generation apply.

Review fixes:
- Direct scoped source/diff review: no remaining P1 finding. Native focus
  acquisition is position-gated, only one form mounts, and no focus loop runs
  while typing or tabbing.
- The workflow review found that scheduler matching omitted timer/setTimeout.
  Added executable RED for both labels and corrected the matcher; 146 tests
  pass after source/mirror regeneration.
- Agent-native capability map: user action -> Regression rule -> validator ->
  generated skill -> executable test. Source/mirror parity is exact.
- Autoreview is N/A because the checkout is next and that helper is forbidden.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Route initially served the prior generated registry payload | 1 | Regenerate through the registry owner, then rerun the exact trace | `pnpm --filter www build:registry` passed; compiled chunk contained attempt-2 `focusReady` bytes |
| Attempt 2 position-gated layout focus still never focused the URL input | 1 | Capture native ownership phases, repair Regression, then use Floating UI's focus owner | trace recorded zero focus events and first divergence at positioned; workflow repair passed 90/90; attempt 3 authorized |
| Attempt 3 focus manager called while computed visibility remained hidden | 1 | Trace the native call target, repair Regression, then remove the local accidental visibility transition | target was connected, enabled, displayed, hidden, and still left editor active; workflow repair passed 138/138; attempt 4 authorized |
| Attempt 4 passed Playwright but failed native Chrome | 1 | Require native shortcut-path proof, trace frozen bytes, then focus after the committed paint boundary | native trace showed the input remained hidden at the manager call; workflow repair passed 140/140; attempt 5 authorized |
| `pnpm --filter www dev:plite -- -p 3008` treated `--` as a directory | 1 | Invoke Next directly through the workspace executor | corrected command started the temporary host |
| Temporary second host used `127.0.0.1` and broke development chunk origin | 1 | Stop duplicate hosts and use one canonical `localhost:3000` server | clean canonical host restored exact route setup |

| Attempt 5 scheduler still focused a hidden descendant | 1 | Trace scheduler and actual CSS animations, then reproduce reduced motion | 0.01ms global rule identified; both-motion RED; attempt 6 corrected the owning CSS |
| Browser Tab / Chrome type action mismatch | 1 each | Inspect delivered native events before changing product | Native Chrome keypress supplies trusted Tab/insertText; final native 5/5 passes |
| Proof input changed between receipt sets | 2 | Discard stale receipts and rerun against current captured inputs | final corpus and stability share the same eight-file digest |

Verification evidence:
- Exact product RED: the existing empty-paragraph test fails settled focus
  under reduced motion with transition-duration 0.01ms. No-preference alone
  stays proxy coverage for that environment.
- Exact product GREEN: the same test passes in both motion preferences with
  zero duration and the final private effect. Edit/submit also runs both modes.
- Final combined command: 9/9 browser tests in 37.5s; the generated receipt
  checks immutable inputs before and after execution.
- Final stability: repeat-each=5, five opens in two motion modes per repeat,
  50 cycles total, retries=0, 5/5 tests in 27.8s.
- Fresh Browser and native Chrome: 2026-08-31T15:17:42.209Z through
  15:18:02.439Z; both 5/5, zero new runtime errors. Native Chrome additionally
  proves Tab/Shift+Tab and actual next-key editor typing after Escape.
- Workflow RED/GREEN includes settled focus, native trigger, native focus-call
  state, scheduler tracing, and timer/setTimeout labels. Final source/mirror
  suite: 146 passed, zero failed.
- pnpm --filter www typecheck passed on final source, including source registry
  and docs checks, route type generation, app types, and package integration.
- Scoped ultracite check passed. pnpm install and exact validator/test/
  methodology cmp plus sync-resources --check passed.
- pnpm --filter www build:registry passed: 366 canonical payloads and 15 sparse
  overlays. Generated Link contains the private effect and no manager/RAF.
  generate-ui-changelog-entries --check passed for 97 entries.

Final handoff:
- executable cases: floating-link-empty-paragraph-focus is completed and kept;
  nine-test combined corpus plus 50-cycle stability are green.
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  exact empty-paragraph open/focus/type/close behavior and first editor key pass.
- failed-fix invalidation and automatic repair: attempts 1-5 stay invalidated;
  Regression is repaired with executable workflow proof.
- proof receipts and affected-corpus replay: two generated final receipts share
  sha256:dbeaa090c0d77b11fdf038eeda3d8b27009050aa3593e4c24b7311f57f1864b5; no input changed during either command.
- started-gate failure closure: all final exact, stability, native, typecheck,
  registry, workflow and parity checks pass; stale host/tool actions were
  classified and superseded by exact proof.
- changed files: globals.css; copied registry Link; existing transient geometry
  browser spec; Link registry changelog source/generated artifacts; Regression
  source rule, methodology, validator/test, template and generated mirrors;
  this plan. External stable-id-mapped-source edits are not part of this fix.
- design decisions: correct CSS visibility; private one-shot positioned focus;
  no new package/core API or geometry-hook option.
- tests and proof: nine browser tests, 50 repeated cycles, Chrome and Browser
  5/5, source-first www typecheck, scoped lint, 146 workflow tests.
- source/generated sync: registry generation, changelog check, pnpm install,
  exact source/mirror cmp and required-resource check passed.
- P1 and agent-native findings: no remaining P1 in direct scoped review;
  agent-native map passed; autoreview is forbidden on next.
- residual risks and next owner: no Safari/Firefox/raw-device claim; no further
  owner action required for this local request.
- local completion status and integration/public-status boundary: completed
  locally at dirty:377a77a537971b793a4ddbb34cc13797fdfeee15; uncommitted and
  unpushed; no public issue, integration, or release update.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Local product, workflow, and final plan checks passed |
| Where am I going? | Hand off the local fix; no remaining implementation owner |
| What is the goal? | Link URL input retains focus and receives the next key after an empty-paragraph open |
| What have I learned? | Positive global reduced-motion durations create visibility transitions on static descendants; match the user's media setting |
| What have I done? | Corrected CSS, deleted compensating focus machinery, strengthened both-motion tests, repaired workflow, and passed final native and permanent proof |

Open risks:

- No remaining known focus regression in the tested scope. Safari, Firefox,
  mobile device, integration, and release claims are not covered.
- The captured unrelated Plite dependency remained unchanged across final corpus,
  stability, and native proof. Later checkout edits require their own rerun.
