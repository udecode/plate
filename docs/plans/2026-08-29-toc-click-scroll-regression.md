# toc click scroll regression

Objective:
Restore TOC click scrolling on the Playground; done when exact click-to-target
movement passes 5/5 with durable coverage.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-29-toc-click-scroll-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: `/blocks/playground`; clicking a visible Table
  of Contents entry no longer scrolls its corresponding heading into view.
- lane and current source owner: discover the rendered TOC click handler,
  heading identity projection, and actual scroll owner before Patch.
- selected executable test cases: `toc:click-scrolls-owning-surface`, one exact
  visible entry with source-backed target text plus one follow-up entry.
- tested ref or dirty-state boundary: current checkout at
  `bc647af42db2f309a2ece9e424c11f77f86cc121`; exact fingerprints recorded before
  final proof.
- route / proof host and freshness method: fresh source-built www host, exact
  `/blocks/playground`, real visible click, before/after target geometry and
  actual scroll-owner offset, five retry-free runs.
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

- Exact current route reproduces a visible TOC click that leaves the target and
  owning scroll offset unchanged before product edits.
- One permanent executable test is RED then green on the real click path.
- Clicking a TOC entry moves the actual owning scroll surface and brings only
  the matching heading into the visible reading region; a second entry works
  afterward and no runtime error occurs.
- Five retry-free fresh browser runs pass on the final source bytes.
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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-29-toc-click-scroll-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-29-toc-click-scroll-regression.md`

Constraints:

- Preserve TOC labels/order/indentation, heading text and IDs, editor selection,
  ordinary page/editor scrolling, formula/void layout, HR Backspace/Undo, and
  all document content.
- Do not fake success by calling `scrollTo` from the test, changing the fixture,
  hard-coding one heading, or asserting only that a handler ran.
- Do not commit, push, create/update PRs/issues, or change release state unless
  separately requested.
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

- allowed source owners: the single current TOC click/scroll owner proven by
  reproduction, its focused tests, and exact route proof.
- allowed proof/test owners: existing package/component tests first; exact
  browser test only if no lower layer can prove real scroll-owner movement.
- generated/source boundary: source owners only; registry/template output uses
  its generator if a registry source changes.
- browser/device claim width: desktop browser on the exact Playground route;
  no mobile/raw-device claim.
- forbidden product/API/release/public mutations: fixture changes, route-only
  CSS or test shortcuts, public API without Best API/plan, Git/GitHub/release.
- orchestration mode and writer ownership: one sequential main-thread writer;
  no subagents or overlapping hosts.

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

- current phase: completed local closeout
- current executable case: toc:click-scrolls-owning-surface
- current case status: completed
- next owner: user for optional commit
- goal status: completed

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | TOC component click must scroll again; preserve current document behavior and make no unauthorized Git/public mutation. |
| Regression methodology loaded | yes | Current Regression skill and complete methodology loaded before implementation. |
| Active goal checked or created | yes | Goal created with this plan path and exact 5/5 click-scroll threshold. |
| Current source owner and tested ref recorded | yes | Plate registry `toc.tsx` owns click/scroll; current ref `bc647af42d`; no public API involved. |
| Executable test cases discovered | yes | Existing `toc.spec.tsx` can reproduce a container that becomes scrollable after render; Browser proves the exact visible click. |
| Cumulative reporter evidence resolved | yes | One current reporter claim: a visible TOC entry click must navigate to its matching heading; no superseding evidence. |
| Reporter oracle matrix resolved | yes | All eight observations resolve below; actual scroll-owner offset plus target geometry and a second click are blocking. |
| Regression semantic validator ready | yes | Current validator accepts the complete pre-implementation case matrix. |
| Route/proof-host readiness plan recorded | yes | Fresh source host on port 3100; Browser CUA click reproduced aria-current change with scrollTop/targetTop unchanged. |
| Patch delegation boundary recorded | yes | Patch may edit only the current TOC click scroll-owner decision and focused spec; no fixture/public API/test shortcut. |
| Orchestrator writer ownership recorded | yes | One sequential main-thread writer and one host; no subagents. |
| Output budget strategy recorded | yes | Exact TOC source/spec/hook owners and capped browser state only. |
| Claim width and blocked rules recorded | yes | Desktop exact Playground scroll-owner claim; block only if fresh host cannot replay after repair. |

Work Checklist:

- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work:
      real TOC click scroll, matching target, actual owner movement, follow-up
      click, preserved document behavior, and no Git/public mutation.
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
| Named completion threshold | yes | Close the selected case and methodology row | completed: exact two-entry navigation passed 5/5 |
| Current-source readiness | yes | Prove final source and dirty boundary | completed: dirty `bc647af42d`, receipt digest `f7d30c2e` |
| Route/proof-host readiness | yes | Bind fresh source host and Chrome | completed: PID 79678, Chrome 151, localhost:3100 |
| Executable regression coverage | yes | Record red and green owner tests | completed: Plite DOM, Core Navigation, and TOC specs pass |
| E2E escalation closure | yes | Keep durable coverage below E2E | completed: unit-red coverage kept; temporary Browser probe deleted |
| Cumulative reporter evidence closure | yes | Keep all reporter claims | completed: click-scroll and visible-target claims remain required |
| Reporter oracle closure | yes | Resolve eight observations | completed: five pass and three evidence-backed N/A rows |
| Failed-fix interrupt closure | yes | Repair each invalidated candidate | completed: four repair-now workflow tests pass |
| Architecture pressure closure | yes | Accept Best API and Plite plan | completed: no public API; post-selection explicit navigation accepted |
| Proof receipt closure | yes | Generate a managed receipt | completed: receipt `a16d0fb36fc4` passes |
| Affected-corpus replay closure | yes | Replay shared owners | completed: final `check:plite:dev`, focused receipt, and 5/5 Browser pass |
| Shared-style consumer closure | no | N/A: no shared selector or paint expansion changed | completed: only target inline scroll margin is requested |
| Started-gate failure closure | yes | Rerun every red gate | completed: www typecheck, browser, receipt, and source parity pass |
| Smallest-probe closure | yes | Record first falsifying probe | completed: current row changed while owner and target geometry stayed fixed |
| Patch delegation closure | yes | Read back Patch evidence | completed: root cause, red/green, ref, stability, and review recorded |
| Focused verification closure | yes | Run owner tests and route replay | completed: 25 focused tests, TOC 2 tests, and final Browser pass |
| Stability closure | yes | Run retry-free warm repetitions | completed: five of five, zero retries |
| Packet decision closure | yes | Decide case | completed: keep local candidate |
| Local completion status | yes | Mark local state honestly | completed: local, uncommitted, and unpushed |
| No duplicate registry | yes | Avoid sidecar case databases | completed: only this transient plan and executable tests exist |
| Generated/source and host repair | yes | Sync registry and agent mirrors | completed: build:registry, changelog check, and mirror check pass |
| Orchestrator writer closure | no | N/A: one sequential writer and one managed host | completed: no subagents or overlapping writers |
| Workflow slowdown closure | yes | Repair avoidable proof misses | completed: strict screenshot, ordering, bounded geometry, and real-library rules added |
| Methodology delta closure | yes | Record repair-now | completed: Regression source, template, tests, and mirrors updated |
| Source/generated sync | yes | Run install and parity | completed: `pnpm install` and `sync-resources --check` pass |
| Agent-native review | yes | Review agent workflow parity | completed: source owner, mirrors, commands, and proof route pass |
| Final handoff contract | yes | Record evidence and risk | completed below |
| Autoreview | no | N/A: branch `next` forbids autoreview | completed: direct P1 review pass after one P1 scope fix |
| Regression semantic plan | yes | Run complete semantic validator | completed in final validation |
| Goal plan complete | yes | Run Autogoal checker | completed in final validation |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | objective, constraints, boundaries, goal, and exact 5/5 threshold recorded | source/host readiness |
| Current source and proof-host readiness | completed | fresh PID/port-3100 source host; current TOC/scroll hook owners read | discover executable cases |
| Executable case discovery and selection | completed | existing TOC Bun spec owns dynamic scrollability case; Browser is final route proof | smallest probe |
| Cumulative reporter evidence inventory | completed | current click-navigation claim retained exactly | reporter oracle expansion |
| Reporter oracle expansion | completed | model/DOM/geometry/errors/follow-up applicable; pointer/focus/popup N/A | semantic validation |
| Pre-implementation semantic validation | completed | initial matrix accepted before Patch | smallest probe |
| Smallest high-value probe | completed | native CUA click changed aria-current but kept scrollTop 2200 and targetTop 378.375 | reproduce/classify |
| Reproduce, classify, and red test | completed | owner tests were red for phase, tag, margin persistence, and visible placement | patch delegation |
| One-case Patch delegation | completed | Plite DOM, Core Navigation, and TOC owners only | verification |
| Focused verification and stability | completed | focused receipt plus exact Chrome 5/5 | packet decision |
| Keep/revert/quarantine | completed | keep: all final gates pass | methodology delta |
| Methodology repair/no-change/defer | completed | repair-now: four workflow invariants added and proved | closure |
| Reviews and final handoff | completed | direct P1 and agent-native review pass | goal-plan check |
| Final goal-plan check | completed | semantic validator and Autogoal checker pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| toc:click-scrolls-owning-surface | current user report; `/blocks/playground`; TOC, Navigation feedback, and Plite DOM scheduler | From a settled scrollable EditorContainer, click `Dates and Equations`, wait past highlight cleanup and screenshot, then repeat with `Callouts and Toggles` | Each click moves the owning surface, keeps the matching heading at 60-120px, marks only that entry current, preserves document content, and remains stable | accepted-product-law: TOC is in-document navigation; explicit navigation outranks selection restoration | unit-red: `packages/plite-dom/test/scroll-into-view.test.ts#scrollIntoView delays only explicit navigation past selection repair` | exact-chrome: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` 151 on fresh `/blocks/playground`; Bun owns durable tests | `bun test --preload ./config/plite-source-test-setup.ts packages/plite-dom/test/scroll-into-view.test.ts packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx && bun test apps/www/src/registry/components/editor/toc.spec.tsx` | completed | dirty:bc647af42db2f309a2ece9e424c11f77f86cc121 | user for optional commit |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| toc:click-scrolls-owning-surface | base-acceptance | user message: TOC component click cannot scroll | after-action | Clicking a visible TOC item scrolls its matching heading into view and keeps it there | required | model@after-action, dom-native@after-action, geometry-paint@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: apps/www/src/registry/components/editor/toc.spec.tsx#marks only the active heading row as current | pass: final Chrome click moves the owner and keeps each target at 87-103px in five runs |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| toc:click-scrolls-owning-surface | model | after-action | yes | TOC heading key/title order and document value remain unchanged while UI selected key points at the clicked heading | Click mutates document content, targets another key, or loses TOC order | package/component state plus browser DOM key/label | test: apps/www/src/registry/components/editor/toc.spec.tsx#marks only the active heading row as current | pass: document stays unchanged and only clicked row becomes current |
| toc:click-scrolls-owning-surface | dom-native | after-action | yes | Exact visible button click dispatches to the registered scroll owner; matching entry alone gets `aria-current=location` | Window or stale owner receives scroll, no owner moves, or wrong row is current | component DOM test and exact Chrome real mouse click | test: apps/www/src/registry/components/editor/toc.spec.tsx#marks only the active heading row as current | pass: registered owner scrolls and matching row alone is current |
| toc:click-scrolls-owning-surface | pointer-feedback | during-action | no | N/A: report names click outcome, not hover/cursor/active pointer affordance | N/A: no pointer-feedback claim | N/A: no pointer-feedback proof | N/A: no pointer test | N/A: no pointer claim |
| toc:click-scrolls-owning-surface | focus | after-action | no | N/A: TOC navigation does not require moving focus from the clicked semantic button | N/A: no focus ownership claim | N/A: no focus proof | N/A: no focus test | N/A: no focus claim |
| toc:click-scrolls-owning-surface | popup | after-action | no | N/A: TOC click opens or closes no popup/toolbar | N/A: no popup claim | N/A: no popup proof | N/A: no popup test | N/A: no popup claim |
| toc:click-scrolls-owning-surface | geometry-paint | after-action | yes | Actual owner offset changes and the heading paint stays within the bounded 60-120px reading region after highlight cleanup and screenshot | Owner/target remain fixed, heading is above or below the interval, or only aria-current changes | exact-chrome pixel capture/classification, `layout-bounds`, owner offset, `.tmp/regression/toc-click-scroll/pixel-classifier.py` | test: packages/plite-dom/test/scroll-into-view.test.ts#scrollIntoView preserves requested path margins across a rerender | pass: layout-bounds pass; bands 87-103px in 5/5; positive-control: pass; negative-control: pass; duplicate-control: pass |
| toc:click-scrolls-owning-surface | runtime-errors | after-action | yes | Click, smooth completion, highlight cleanup, screenshot, and follow-up produce no action-time runtime error | exception, rejected promise, nested update, or error overlay appears | exact-chrome: executable runtime-error recorder after warmed route | test: packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx#flashTarget sets and clears the active target | pass: five counted runs report no runtime error |
| toc:click-scrolls-owning-surface | follow-up-input | follow-up | yes | A second visible TOC entry click scrolls the same owner to its own matching heading and updates current row | First click leaves stale owner or selection that prevents the second click | exact-chrome: executable second real mouse click plus component test | test: apps/www/src/registry/components/editor/toc.spec.tsx#marks only the active heading row as current | pass: `Callouts and Toggles` succeeds after `Dates and Equations` in 5/5 |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| toc:click-scrolls-owning-surface | 5 | completed | "bash" "-lc" "'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --version && curl -fsS http://localhost:3100/blocks/playground >/dev/null && bun test --preload ./config/plite-source-test-setup.ts packages/plite-dom/test/dom-phase-scheduler.test.ts packages/plite-dom/test/scroll-into-view.test.ts packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx >/dev/null && bun test apps/www/src/registry/components/editor/toc.spec.tsx >/dev/null && node --test .agents/rules/regression/scripts/test-first-contract.test.mjs .agents/skills/regression/scripts/test-first-contract.test.mjs >/dev/null && /opt/homebrew/bin/python3 .tmp/regression/toc-click-scroll/pixel-classifier.py .tmp/regression/toc-click-scroll/final-{1..5}.png >/dev/null && node tooling/scripts/generate-ui-changelog-entries.mjs --check >/dev/null && node .agents/rules/plate-next/scripts/sync-resources.mjs --check >/dev/null && git diff --check" | pass: exit 0 in 3421ms | dirty:bc647af42db2f309a2ece9e424c11f77f86cc121 | sha256:f7d30c2e9b9f16534352b8e9e72f1a4b7d065b5dca1ec371543d8492da7a3ac1 | 28 | .agents/rules/regression.mdc,.agents/rules/regression/references/methodology.md,.agents/rules/regression/scripts/test-first-contract.test.mjs,.agents/skills/regression/SKILL.md,.agents/skills/regression/references/methodology.md,.agents/skills/regression/scripts/test-first-contract.test.mjs,.changeset/core-navigation-flash-scroll.md,.changeset/plite-navigation-scroll.md,.tmp/regression/toc-click-scroll/final-1.png,.tmp/regression/toc-click-scroll/final-2.png,.tmp/regression/toc-click-scroll/final-3.png,.tmp/regression/toc-click-scroll/final-4.png,.tmp/regression/toc-click-scroll/final-5.png,.tmp/regression/toc-click-scroll/pixel-classifier.py,VISION.md,apps/www/public/r/toc.json,apps/www/src/registry/changelog/2026-08-29-fix-toc-scroll-navigation.json,apps/www/src/registry/changelog/entries/2026-08-29-fix-toc-scroll-navigation.mdx,apps/www/src/registry/components/editor/toc.spec.tsx,apps/www/src/registry/components/editor/toc.tsx,docs/plans/templates/regression.md,docs/vision/plite.md,packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx,packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts,packages/plite-dom/src/plugin/dom-editor.ts,packages/plite-dom/src/plugin/dom-phase-scheduler.ts,packages/plite-dom/test/dom-phase-scheduler.test.ts,packages/plite-dom/test/scroll-into-view.test.ts | pid:79678;started:2026-08-29T16:01:01.000Z;base-url:http://localhost:3100/blocks/playground;browser:exact-chrome:chromium;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-29T15:55:47.317Z | 2026-08-29T16:05:52.470Z | 2026-08-29T16:05:55.891Z | 0 | sha256:f8384c00cd623babbd0e0c1b7320e88daa42bb4ff65f58029c0463f9ec47ba07 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite DOM scheduler, Navigation feedback, and TOC adoption | toc:click-scrolls-owning-surface | red: row changed but owner/target stayed fixed; later candidates exposed post-capture restore and out-of-bounds target | 2026-08-29T15:55:47.317Z | `bun test` Plite DOM/Core/TOC plus exact Chrome 5/5 and pixel classifier | sha256:f7d30c2e9b9f16534352b8e9e72f1a4b7d065b5dca1ec371543d8492da7a3ac1 | pass: final `check:plite:dev`, receipt, and exact route replay all pass |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Exact browser final state | target returned to 255.53125px after screenshot/highlight cleanup | product final-verification | added post-capture settle oracle and repaired explicit-navigation ordering | pass: final target band 87-103px in 5/5 |
| Bounded geometry | one-sided `<120` accepted target top 0.375px | product final-verification | added 60-120px bounded interval and registered-owner top alignment | pass: 5/5 plus pixel controls |
| www typecheck | `tx.navigation` missing on generic Plate transaction | implementation/type gate | retained typed Navigation plugin portal; moved skip-scroll tag into Navigation owner | pass: exact `PLATE_WWW_ASYNC_DOCS=1 pnpm --filter www typecheck` |
| Browser warm | first dev request emitted hydration mismatch | proof-host warm failure | revoked warm run and warmed unchanged source host | pass: second warm plus five counted runs have no runtime error |
| Proof receipt Python | receipt shell selected Python without Pillow | proof-command failure | bound `/opt/homebrew/bin/python3` | pass: managed receipt `a16d0fb36fc4` |
| Registry HMR | build while dev server ran triggered Turbopack panic | proof-host serialization failure | stopped host before generation and restarted fresh | pass: final build and source host replay |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| toc:click-scrolls-owning-surface | 1 | target reached the top then returned to 255.53125px after screenshot/highlight cleanup | final-verification | yes: invalidated post-selection-only green | repair-now: `.agents/rules/regression.mdc` and methodology require post-capture settle reassertion | pass: `final screenshots reassert settled reporter state after capture` | yes: ui-repairs-substrate | best-api kept existing DOM API; plite-plan owned final navigation ordering | reproduced: diagnostic: unchanged bytes fail after screenshot and delayed highlight cleanup |
| toc:click-scrolls-owning-surface | 2 | tag-only candidate never overcame pre-handler queued selection restore | exact-replay | yes: invalidated tag-only green | repair-now: `.agents/rules/regression.mdc` and methodology require queued-before and delayed-after competitors | pass: `ordering fixes cover queued-before and delayed-after competitors` | yes: second-failed-fix | best-api rejected app timers; plite-plan accepted private post-selection phase | reproduced: diagnostic: unchanged tag-only bytes stay at scrollTop 1809 |
| toc:click-scrolls-owning-surface | 3 | target top settled at 0.375px outside the visible heading region | final-verification | yes: invalidated movement-only green | repair-now: `.agents/rules/regression.mdc` and methodology require bounded placement | pass: `geometry placement proof uses a bounded visible interval` | yes: second-failed-fix | best-api kept standard scroll options; plite-plan kept offset in DOM owner | reproduced: diagnostic: unchanged bytes move owner but hide heading above viewport |
| toc:click-scrolls-owning-surface | 4 | mocked geometry call was green while real library emitted no scroll action | exact-replay | yes: invalidated mocked margin snapshot green | repair-now: `.agents/rules/regression.mdc` and methodology keep geometry mocks proxy-only | pass: `geometry library mocks remain proxy evidence` | yes: second-failed-fix | best-api rejected a new offset API; plite-plan used registered scroll owner | reproduced: diagnostic: unchanged bytes call library with target at 769.375px and leave owner at 1809 |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| toc:click-scrolls-owning-surface | 4 | ui-repairs-substrate, second-failed-fix | escalate | required: best-api keeps `editor.api.dom.scrollIntoView` and rejects app timers, internal imports, and a new offset API | plite-plan: explicit `always` navigation settles in private post-selection phase; registered owner applies captured top margin; default `if-needed` stays single-frame | accepted: owner tests, exact Chrome 5/5, and P1 scope review pass |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| toc:click-scrolls-owning-surface | TOC source, Core Navigation feedback, Plite DOM scheduler and registered scroll owner | Bun tests; fresh www `/blocks/playground`; exact Chrome real mouse click | PID 79678 serves final dirty `bc647af42d`; Chrome 151 attested; owner clientHeight 720 and scrollHeight 3604 | `build:registry` generated `public/r/toc.json`; changelog generator wrote JSON; no generated hand edits | pass: managed receipt, fresh host, and five counted runs bind current source |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| toc:click-scrolls-owning-surface | package RED: explicit navigation used ordinary DOM write; Core RED: flash commit lacked skip-scroll tag; TOC spec lacked DOM API assertion | Plite DOM scheduler/editor, Core Navigation feedback, TOC source/spec, generated registry, release artifacts, Regression workflow repair | owner red/green, full affected corpus, exact Chrome two-click 5/5, pixels, typecheck, registry, receipt | root cause and four failed-fix repairs; final dirty ref/digest; P1 and agent-native reviews; no commit/push | pass: Patch evidence complete and case kept |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| toc:click-scrolls-owning-surface | exact Chrome real mouse clicks on fresh localhost:3100; post-screenshot reassertion | 5 | pass, pass, pass, pass, pass | 0 | completed: each run keeps heading band at 87-103px and second click works |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| toc:click-scrolls-owning-surface | receipt `a16d0fb36fc4`; final `check:plite:dev`; www typecheck; exact Chrome 5/5 | keep | local completed candidate on dirty `bc647af42d`; uncommitted and unpushed | known first-request dev hydration mismatch requires warm and is unrelated to action; no product risk left in tested desktop claim | user for optional commit |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| toc:click-scrolls-owning-surface | false-green final-state, ordering, placement, and mocked geometry proof | repair-now | `.agents/rules/regression.mdc`, methodology, template, test-first contract, generated mirrors | pass: 21 source and 21 mirror workflow tests; source parity exact | four failed candidates now fail the workflow before product completion |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Registry generation while host ran | www/Turbopack | panic versus expected clean generation | shared generated outputs changed under HMR | low after classification | stop host before `build:registry`; final generation passes |
| Browser counted setup | temporary proof helper | 100ms versus required 1000ms settle | forced scroll left selection restore queued | high: distinguished harness from product | restored 1000ms warm setup; final 5/5 passes |
| Receipt Python | proof command | missing Pillow in login-shell Python | shell path selected system Python | high: pixel proof stayed blocking | bound `/opt/homebrew/bin/python3`; final receipt passes |

Findings:

- Root cause: explicit TOC scrolling ran before browser/React selection
  restoration and Navigation highlight cleanup could re-enter selection scroll.
- The TOC's `topOffset` lived on a React-owned element and disappeared before
  delayed scroll execution; Plite DOM now snapshots it and aligns the registered
  scroll owner without changing the public call shape.
- Navigation feedback owns `skip-scroll-into-view` on flash commits, so old
  selections cannot reclaim the viewport during decoration refresh.
- Direct P1 review found and fixed one scope issue: ordinary `if-needed` scrolls
  retain the original single-frame path; only explicit `always` navigation uses
  post-selection settlement.

Timeline:

- Reproduced the report on the real scroll owner and added owner-level REDs.
- Invalidated four false greens through post-capture, competing-order,
  bounded-geometry, and real-library probes; repaired Regression after each.
- Accepted Best API/Plite plan with no public API addition.
- Implemented final Plite DOM, Core Navigation, and TOC adoption changes.
- Generated registry/changelog/release artifacts and ran final proof.

Decisions and tradeoffs:

- Keep `editor.api.dom.scrollIntoView`; reject a TOC timer, internal scheduler
  import, or new public offset option.
- Preserve default `if-needed` timing and apply post-selection settlement only
  to explicit `scrollMode: 'always'` navigation.
- Keep permanent coverage at package/component layers; use the temporary exact
  Browser probe only for final geometry and native interaction proof.

Review fixes:

- P1 accepted and fixed: avoid adding one frame to every normal editor scroll.
- Agent-native review: PASS. Agent route, source owner, generated mirrors,
  exact commands, screenshots, receipt, and authority boundaries are present.
- No remaining P1 findings. `autoreview` is N/A because current branch is
  `next`, where repository policy forbids it.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Screenshot/highlight cleanup restored old selection | 1 | add post-capture settle oracle | fixed by Regression repair and final navigation ownership |
| Tag-only ordering lost to pre-handler queue | 1 | test both competitor windows | fixed by post-selection explicit navigation plus Core tag |
| One-sided geometry accepted target above viewport | 1 | require bounded interval | fixed at 60-120px and pixel classified |
| Geometry mock hid real-library no-op | 1 | execute real browser geometry | fixed by registered-owner alignment |
| www typecheck rejected generic `tx.navigation` | 1 | use typed Navigation owner | fixed; exact typecheck passes |
| Temporary probe used 100ms setup settle | 1 | restore 1000ms settled setup | proof-host repaired; final 5/5 passes |
| Managed receipt used Python without Pillow | 1 | bind verified Python path | receipt `a16d0fb36fc4` passes |

Verification evidence:

- `pnpm check:plite:dev` -> pass on final bytes; affected typechecks, five
  package suites, and Chromium smoke all pass.
- `PLATE_WWW_ASYNC_DOCS=1 pnpm --filter www typecheck` -> pass after exact red.
- Managed receipt -> `sha256:a16d0fb36fc46a59662c8ded805fcbb0d15d01fcfbb1e565546c5f1aaf52351d`.
- Exact Chrome 151 -> warmed source host, then five retry-free two-click runs.
- Pixel classifier -> positive, negative, duplicate controls pass; every final
  screenshot has one heading band at 87-103px.
- `pnpm --filter www build:registry`, changelog check, `pnpm install`, source
  mirror parity, changesets, and `git diff --check` pass.

Final handoff:

- executable cases: `toc:click-scrolls-owning-surface` completed and kept.
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  all required rows pass; pointer, focus, and popup are evidence-backed N/A.
- failed-fix invalidation and automatic repair: four attempts invalidated; four
  workflow rules and executable tests added before resuming.
- proof receipts and affected-corpus replay: receipt `a16d0fb36fc4`, final
  `check:plite:dev`, www typecheck, registry checks, and Chrome 5/5 pass.
- started-gate failure closure: every listed product, type, host, and receipt
  failure has an exact final pass.
- changed files: Plite DOM scheduler/scroll owner, Core Navigation feedback,
  TOC source/spec/generated registry, changesets, registry changelog, Vision,
  and Regression source/template/tests/mirrors.
- design decisions: no public API; explicit always-navigation is final while
  ordinary if-needed scrolling keeps its original timing.
- tests and proof: 25 focused receipt tests, 42 workflow tests, full affected
  check, two-click 5/5, and classified screenshots.
- source/generated sync: `pnpm install`, mirror parity, registry build, and
  changelog generation/check pass.
- P1 and agent-native findings: one P1 fixed; final direct and agent-native
  reviews pass.
- residual risks and next owner: only known first dev-request hydration noise;
  user owns optional commit. No server remains running after handoff.
- local completion status and integration/public-status boundary: completed
  locally on dirty `bc647af42d`; uncommitted, unpushed, not integrated/released.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | completed local closeout |
| Where am I going? | optional user-authorized commit |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | navigation must defeat both queued selection restore and delayed decoration re-entry while preserving visible offset |
| What have I done? | fixed owners, repaired Regression, generated artifacts, and proved final desktop behavior 5/5 |

Open risks:

- First fresh dev-server request can emit an unrelated hydration mismatch from
  `NonBreakingSpace`; the warmed final action runs are clean. No production
  TOC risk remains within the tested desktop claim.
