# combobox trigger regressions

Objective:
Restore `@` mention and `/` slash-command triggers through executable RED/GREEN coverage and fresh Browser proof, then push the complete checkout and leave all local and PR CI green.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-29-combobox-trigger-regressions.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:
- target bug / surface / corpus: `@` mention and `/` slash-command transient-input creation in Plate React editors
- lane and current source owner: Plate command wiring in `packages/platejs`; registry integration in `apps/www/src/registry/components/editor`
- selected executable test cases: `mention-at-trigger`, `slash-command-trigger`
- tested ref or dirty-state boundary: `dirty:98184323b5fde44e423d71d8597a6cfeb5c233f8`
- route / proof host and freshness method: fresh reloads of `http://localhost:3000/blocks/mention-demo` and `/blocks/slash-command-demo`, followed by final Browser replay on a fresh source host
- invocation mode / timebox: one-shot sequential Regression run; no parallel writers; continue until local and authoritative PR CI are green

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
- focused Plate package tests for mention, slash-command, combobox, and the canonical shared owner
- isolated Browser replays on `/blocks/mention-demo` and `/blocks/slash-command-demo`
- follow-up query filtering, focus transfer, popup visibility, and runtime-log assertions
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-29-combobox-trigger-regressions.md --complete`
- P1 autoreview is N/A because the user explicitly waived it for this delivery
- full `pnpm check`, commit of the complete checkout, push, and authoritative PR CI closure
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-29-combobox-trigger-regressions.md`

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
- allowed source owners: the Plite beforeinput/DOM-repair runtime proven causal, Plate command/plugin adoption owners, and the smallest registry integration owner proven causal
- allowed proof/test owners: colocated Plate tests, registry DOM tests, Regression receipts, and isolated Browser demos
- generated/source boundary: edit source only; regenerate barrels/registry/skills only when their source owners change
- browser/device claim width: Chromium Browser behavior for the two isolated desktop demos; no mobile, WebKit, Firefox, or raw-device claim
- forbidden product/API/release/public mutations: no API redesign, release, merge, public issue mutation, or unrelated behavior expansion
- orchestration mode and writer ownership: one sequential main-thread writer; Patch contract applied one case at a time; no child agents

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
- current phase: completed local repair and proof; checkout/PR integration remains
- current executable case: both selected cases
- current case status: `completed` and kept
- next owner: repository and PR CI
- goal status: active until the pushed PR is fully green

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Repair both triggers; no autoreview; finish prior checkout; run local and PR CI; commit and push all current files. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read in full. |
| Active goal checked or created | yes | No active durable goal existed; create one after this first checkpoint validates. |
| Current source owner and tested ref recorded | yes | Plate command/plugin and registry owners at `dirty:98184323b5fde44e423d71d8597a6cfeb5c233f8`. |
| Executable test cases discovered | yes | `mention-at-trigger` and `slash-command-trigger`. |
| Cumulative reporter evidence resolved | yes | The current user report is the base acceptance; no recording or later reporter contradiction exists. |
| Reporter oracle matrix resolved | yes | Eight observation classes are resolved below for both keyboard-only cases. |
| Regression semantic validator ready | yes | `.agents/skills/regression/scripts/validate-regression-plan.mjs`. |
| Route/proof-host readiness plan recorded | yes | Isolated demo routes are current-source and clean; final replay requires a fresh host/reload. |
| Patch delegation boundary recorded | yes | One case at a time through the Patch contract in the main thread. |
| Orchestrator writer ownership recorded | yes | N/A: no orchestrator or child writer; one main-thread writer. |
| Output budget strategy recorded | yes | Exact owners and focused runners first; broad output capped; full gates only after focused green. |
| Claim width and blocked rules recorded | yes | Chromium desktop demos plus local/PR CI; no release or cross-browser claim. |

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
      post-resize bounding-box read as final.
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
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: both cases completed and kept |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: current source at `dirty:98184323b5fde44e423d71d8597a6cfeb5c233f8` |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: PID 1100 served current source on port 3011 |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: Plite runtime, Plate owner, registry, and Browser tests |
| E2E escalation closure | yes | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | pass: owner-level RED plus existing affected Browser corpus |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pass: the sole report maps to both case matrices |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all eight observations and every applicable interaction phase per case | pass: functional rows green; pointer and paint rows explicitly N/A |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pass: attempts 1 and 2 invalidated and workflow proof passed |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pass: Best API and Plite Plan accepted before attempt 3 |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: two attempt-3 receipts with shared digest below |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: 2/2 exact and 10/10 retry-free stability |
| Shared-style consumer closure | no | Inventory every shared selector/class consumer and prove explicit paint neutralizers do not inherit or duplicate the shared surface | N/A: no style, selector, or paint owner changed |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: every row in Gate failure closure has an exact green rerun |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: isolated demos first falsified trigger insertion |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | pass: sequential main-thread Patch contracts below |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: focused suites and exact Browser replay green |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: five runs per case, zero retries |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | pass: both cases kept |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pass: local proof complete; commit/push still separate |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: executable tests and this transient plan only |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: generated entrypoint proof and current-source host repaired |
| Orchestrator writer closure | no | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | N/A: one main-thread writer; no orchestrator |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: wrong runner paths/configs corrected below |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | pass: mention repair-now and slash no-change recorded |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pass: install, 34/34 validator tests, and byte parity |
| Agent-native review | yes | Run for changed agent workflows or record N/A | pass: route/source/proof capability review found no gap |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: final handoff below |
| Autoreview | no | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A: user explicitly waived autoreview for this delivery |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-29-combobox-trigger-regressions.md --complete` | pass: final command rerun before handoff |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-29-combobox-trigger-regressions.md` | pass: final command rerun before handoff |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | requirements captured | none |
| Current source and proof-host readiness | completed | current source on port 3011 | none |
| Executable case discovery and selection | completed | two selected cases | none |
| Cumulative reporter evidence inventory | completed | sole report mapped | none |
| Reporter oracle expansion | completed | eight observation classes per case | none |
| Pre-implementation semantic validation | completed | validator passed before attempt 3 | none |
| Smallest high-value probe | completed | isolated Browser RED | none |
| Reproduce, classify, and red test | completed | exact runtime and owner RED | none |
| One-case Patch delegation | completed | sequential Patch evidence | none |
| Focused verification and stability | completed | focused green plus 10/10 Browser | none |
| Keep/revert/quarantine | completed | both kept | none |
| Methodology repair/no-change/defer | completed | repair-now/no-change resolved | none |
| Reviews and final handoff | completed | user waiver and agent-native pass | none |
| Final goal-plan check | completed | semantic and goal checks rerun | none |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| mention-at-trigger | User report: combobox `@` no longer works; isolated `/blocks/mention-demo` Browser reproduction | Focus the editor at a valid line start and type `@`, then type `aa` | Replace the trigger with `mentionInput`, focus its combobox, show mention options, filter after `aa`, and emit no trigger-path runtime error | reporter: `@` must open the mention combobox; existing-contract: `BaseMentionPlugin` transient-input test and Mention registry demo | unit-red: React `MentionPlugin` owner test plus mounted runtime contract; Browser remains final verification | browser: current-source Chromium on isolated mention demo | `packages/platejs/src/react/features/mention/MentionPlugin.spec.tsx`; `pnpm --filter platejs test:partition:mention` | completed | dirty:98184323b5fde44e423d71d8597a6cfeb5c233f8 | repository CI |
| slash-command-trigger | User report: combobox `/` no longer works; isolated `/blocks/slash-command-demo` Browser reproduction | Focus the editor at an empty line and type `/`, then type `hea` | Replace the trigger with `slashInput`, focus its combobox, show slash options, filter to heading commands after `hea`, and emit no trigger-path runtime error | reporter: `/` must open the slash-command combobox; existing-contract: slash demo copy and `BaseSlashPlugin` trigger defaults | unit-red: shared runtime contract and exact slash owner test; Browser remains final verification | browser: current-source Chromium on isolated slash-command demo | `packages/platejs/src/features/slash-command/lib/BaseSlashPlugin.spec.ts`; `pnpm --filter platejs test:partition:slash-command` | completed | dirty:98184323b5fde44e423d71d8597a6cfeb5c233f8 | repository CI |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| mention-at-trigger | base-acceptance | Current user message: `combobox (@ / ) are not working anymore` | after-action | Typing `@` in a valid editor position opens the mention chooser and remains usable | required | model@after-action, dom-native@after-action, focus@after-action, popup@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/combobox.spec.ts#mention | pass: transient model input, focused control, popup, filtering, and zero runtime errors |
| slash-command-trigger | base-acceptance | Current user message: `combobox (@ / ) are not working anymore` | after-action | Typing `/` in a valid editor position opens the slash-command chooser and remains usable | required | model@after-action, dom-native@after-action, focus@after-action, popup@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/combobox.spec.ts#slash | pass: transient model input, focused control, popup, filtering, and zero runtime errors |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| mention-at-trigger | model | after-action | yes | The editor document contains one transient `mentionInput` at the typed position | The document contains literal `@` text with no transient input | package test plus Browser DOM | test: packages/platejs/src/react/features/mention/MentionPlugin.spec.tsx#publishes a semantic trigger replacement to the mounted React tree | pass: transient `mentionInput` replaces the trigger |
| mention-at-trigger | dom-native | after-action | yes | One editable combobox input and mention option list mount | No input/options mount, or the editor retains literal `@` | DOM Browser | test: apps/www/tests/browser/combobox.spec.ts#combobox:mention-trigger | pass: runtime-owner: pass; mutation-owner: pass; input and options mount without literal trigger |
| mention-at-trigger | pointer-feedback | after-action | no | N/A: reporter names a keyboard trigger, not pointer feedback | N/A: no cursor, hover, drag, or pointer affordance claim | N/A: keyboard-only behavior | N/A: no pointer test applies | N/A: not applicable |
| mention-at-trigger | focus | after-action | yes | Focus moves from the editor surface to the mention combobox input | Focus stays on the contenteditable editor or falls to the document | DOM Browser | test: apps/www/tests/browser/combobox.spec.ts#mention | pass: active element is the internal combobox input |
| mention-at-trigger | popup | after-action | yes | The mention option popover is open with visible mention options | The popover is absent, closed, or contains no options | DOM Browser | test: apps/www/tests/browser/combobox.spec.ts#mention | pass: visible role=option nodes mount |
| mention-at-trigger | geometry-paint | after-action | no | N/A: reporter requires functional opening, not pixel geometry or paint | N/A: no placement, clipping, flash, or visual-diff claim | N/A: DOM visibility is sufficient | N/A: no pixel test applies | N/A: not applicable |
| mention-at-trigger | runtime-errors | after-action | yes | The isolated trigger interaction adds zero console errors or warnings | Trigger insertion throws, logs, or hydrates a broken subtree | Browser runtime logs | test: apps/www/tests/browser/combobox.spec.ts#mention | pass: zero trigger-path runtime errors |
| mention-at-trigger | follow-up-input | follow-up | yes | Typing `aa` updates the combobox query and filters options while focus stays in the input | Follow-up text lands in the editor, closes the popup, or fails to filter | DOM Browser | test: apps/www/tests/browser/combobox.spec.ts#mention | pass: query and hidden store value update; expected option remains and forbidden option is absent |
| slash-command-trigger | model | after-action | yes | The editor document contains one transient `slashInput` at the typed position | The document contains literal `/` text with no transient input | package test plus Browser DOM | test: apps/www/tests/browser/combobox.spec.ts#slash | pass: transient `slashInput` replaces the trigger |
| slash-command-trigger | dom-native | after-action | yes | One editable combobox input and slash option list mount | No input/options mount, or the editor retains literal `/` | DOM Browser | test: apps/www/tests/browser/combobox.spec.ts#combobox:slash-trigger | pass: runtime-owner: pass; mutation-owner: pass; input and options mount without literal trigger |
| slash-command-trigger | pointer-feedback | after-action | no | N/A: reporter names a keyboard trigger, not pointer feedback | N/A: no cursor, hover, drag, or pointer affordance claim | N/A: keyboard-only behavior | N/A: no pointer test applies | N/A: not applicable |
| slash-command-trigger | focus | after-action | yes | Focus moves from the editor surface to the slash combobox input | Focus stays on the contenteditable editor or falls to the document | DOM Browser | test: apps/www/tests/browser/combobox.spec.ts#slash | pass: active element is the internal combobox input |
| slash-command-trigger | popup | after-action | yes | The slash option popover is open with visible commands | The popover is absent, closed, or contains no options | DOM Browser | test: apps/www/tests/browser/combobox.spec.ts#slash | pass: visible role=option nodes mount |
| slash-command-trigger | geometry-paint | after-action | no | N/A: reporter requires functional opening, not pixel geometry or paint | N/A: no placement, clipping, flash, or visual-diff claim | N/A: DOM visibility is sufficient | N/A: no pixel test applies | N/A: not applicable |
| slash-command-trigger | runtime-errors | after-action | yes | The isolated trigger interaction adds zero console errors or warnings | Trigger insertion throws, logs, or hydrates a broken subtree | Browser runtime logs | test: apps/www/tests/browser/combobox.spec.ts#slash | pass: zero trigger-path runtime errors |
| slash-command-trigger | follow-up-input | follow-up | yes | Typing `hea` updates the combobox query and filters to heading commands while focus stays in the input | Follow-up text lands in the editor, closes the popup, or leaves unrelated commands visible | DOM Browser | test: apps/www/tests/browser/combobox.spec.ts#slash | pass: query and hidden store value update; heading remains and unrelated commands are absent |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| mention-at-trigger | 3 | completed | "env" "PLAYWRIGHT_BASE_URL=http://localhost:3011" "pnpm" "--filter" "www" "test:www-browser:chromium" "tests/browser/combobox.spec.ts" | pass: exit 0 in 4385ms | dirty:98184323b5fde44e423d71d8597a6cfeb5c233f8 | sha256:8c5bfd5d8e31e7641bea98822013f4b3e8f4bfedc49b02e3d2b79f9a8c392b81 | 9 | apps/www/src/registry/components/editor/inline-combobox.tsx,apps/www/src/registry/components/editor/mention.tsx,apps/www/src/registry/components/editor/slash.tsx,apps/www/tests/browser/combobox.spec.ts,packages/platejs/src/features/combobox/lib/triggerCombobox.ts,packages/plitejs/src/react/editable/input-router.ts,packages/plitejs/src/react/editable/runtime-before-input-events.ts,packages/plitejs/src/react/editable/runtime-input-events.ts,packages/plitejs/src/react/editable/selection-controller.ts | pid:1100;started:2026-08-29T23:51:45.000Z;base-url:http://localhost:3011;browser:chromium | 2026-08-30T00:47:01.568Z | 2026-08-30T00:49:46.427Z | 2026-08-30T00:49:50.813Z | 0 | sha256:94a054ef69dafdd67db900f562ae35931f19cba3c3388fbec95a4aee4d761f6b |
| slash-command-trigger | 1 | completed | "env" "PLAYWRIGHT_BASE_URL=http://localhost:3011" "pnpm" "--filter" "www" "test:www-browser:chromium" "tests/browser/combobox.spec.ts" | pass: exit 0 in 4304ms | dirty:98184323b5fde44e423d71d8597a6cfeb5c233f8 | sha256:8c5bfd5d8e31e7641bea98822013f4b3e8f4bfedc49b02e3d2b79f9a8c392b81 | 9 | apps/www/src/registry/components/editor/inline-combobox.tsx,apps/www/src/registry/components/editor/mention.tsx,apps/www/src/registry/components/editor/slash.tsx,apps/www/tests/browser/combobox.spec.ts,packages/platejs/src/features/combobox/lib/triggerCombobox.ts,packages/plitejs/src/react/editable/input-router.ts,packages/plitejs/src/react/editable/runtime-before-input-events.ts,packages/plitejs/src/react/editable/runtime-input-events.ts,packages/plitejs/src/react/editable/selection-controller.ts | pid:1100;started:2026-08-29T23:51:45.000Z;base-url:http://localhost:3011;browser:chromium | 2026-08-30T00:47:01.568Z | 2026-08-30T00:49:58.701Z | 2026-08-30T00:50:03.005Z | 0 | sha256:dfe928c01006d71488226cb8e888a03cde90837e18beb652eaadea8d2007d829 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite input runtime plus Plate trigger owner | mention-at-trigger, slash-command-trigger | red: both isolated demos retained literal triggers and mounted no combobox | 2026-08-30T00:17:31.087Z | `PLAYWRIGHT_BASE_URL=http://localhost:3011 pnpm --filter www test:www-browser:chromium tests/browser/combobox.spec.ts --repeat-each=5` | sha256:8c5bfd5d8e31e7641bea98822013f4b3e8f4bfedc49b02e3d2b79f9a8c392b81 | pass: 2/2 exact and 10/10 stability, zero retries |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Exact Browser replay after mention candidate 1 | Fresh `http://localhost:3010/blocks/mention-demo` still rendered literal `@`, kept editor focus, and mounted zero options | final-verification: reporter assertion ran and failed | Invalidated candidate 1; repaired Regression to require mounted runtime-owner proof before another product attempt | pass: port-3011 exact Browser receipt and 5-run stability |
| Exact Browser replay after mounted-view candidate 2 | Fresh `http://localhost:3010/blocks/mention-demo` still rendered literal `@`, kept editor focus, and mounted zero options | final-verification: constructed-view command proof did not execute the mounted route's direct DOM-repair branch | Invalidated candidate 2; exact mounted probe proved `runtime-owner: pass`, a valid selection, and material `mention` command before direct DOM repair bypassed model dispatch; repaired Regression to reject unmounted proxy proof | pass: runtime-owner and mutation-owner exact Browser assertions |
| `apps/www/src/registry/components/editor/plugins.spec.tsx` with full `EditorKit` | Bun failed during UploadThing module initialization with `InvalidURL` before the trigger assertion | proof-host scope: unrelated eager kit initialization prevented the reporter assertion | Narrowed the model contract to `ComboboxKit`, `EmojiKit`, `FootnoteKit`, `MentionKit`, and `SlashKit`; mounted-owner behavior remains Browser-owned | pass: narrowed root-config test 5/5 and exact Browser replay |
| Focused Vitest command | Wrong `.ts` filename found no tests | proof-host command | Corrected to `selection-controller-contract.test.ts` | pass: 37/37 |
| Focused Bun package command | Package-local invocation skipped the root Bun JSX config | proof-host command | Reran with the root config | pass: Plate 44/44 and apps/www 5/5 |
| `pnpm check:plite:dev` | Generated runtime proof called `.configure` after nominal-only narrowing | generated/source drift | Deleted the redundant calls in both generators and regenerated entrypoint proof | pass: exact affected lane green |
| `pnpm plite:release:packages` | Reviewed bundle snapshots grew 42-105 bytes | intentional size snapshot | Accepted the input-runtime delta and updated the canonical size baseline | pass: normal packed release lane green |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| mention-at-trigger | 1 | Candidate 1 made package tests green, but the fresh port-3010 Browser route still rendered literal `@`, kept editor focus, and mounted zero options | final-verification | yes: package-green candidate and its proof were invalidated | repair-now: `.agents/rules/regression/scripts/validate-regression-plan.mjs` requires mounted runtime-owner Browser proof | pass: 33 source tests, 33 generated-mirror tests, and source/generated parity | no: first failed fix and no proven structural trigger | N/A: no escalation on the first failed fix | reproduced: exact Browser remains red after workflow repair; diagnose the mounted owner before attempt 2 |
| mention-at-trigger | 2 | Candidate 2 proved a constructed editor view could discover the material command, but the fresh mounted Browser route still rendered literal `@` and mounted zero options | final-verification | yes: constructed-view green proof and candidate 2 were invalidated | repair-now: `.agents/rules/regression.mdc` and its validator now reject a failed Browser command fix until the exact mounted owner records `runtime-owner: pass`; an unmounted constructed view remains proxy evidence | pass: 34 source tests, 34 generated-mirror tests, source/generated parity, and agent-native route/source/proof review | yes: second-failed-fix | best-api: accepted; plite-plan: accepted below before attempt 3 | reproduced: product bytes were frozen; attempt 3 resumes only through the accepted Plite runtime slices below |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| mention-at-trigger | 2 | second-failed-fix | escalate | required: best-api accepts no new public API; semantic command ownership remains private to the Plite input runtime | plite-plan: accepted; gate direct DOM repair on an exact post-sync command probe, then execute model-owned input when material | pass: runtime-owner: pass on the mounted Browser root; selection `[2,4]@2`; material handler `mention`; literal trigger proves the direct DOM-repair bypass |
| slash-command-trigger | 0 | none: shared runtime repair applies | patch | N/A: no public API redesign or architecture trigger | N/A: no layer plan required for first owner-local repair | pass: shared owner exact replay and focused slash suite |

Best API and Plite Plan decision:

Verdict: keep the public API unchanged. Delete the false ownership split inside the beforeinput path: DOM repair may reconcile only native-equivalent text; a material semantic `insertText` command always belongs to model dispatch.

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
|---------|---------|--------|-------|--------|----------|-------|------|---------|
| semantic text-command probe | The native decision probes trusted single-character input, but untrusted or demoted paths can reach direct DOM repair without evaluating the command at the final selection | Evaluate the existing private command probe at the exact post-sync selection before direct DOM repair | Plite React input runtime | Command materiality is runtime behavior, not Plate product policy or a public caller choice | Plate mention and slash commands need no new API or configuration | mounted Browser owner plus focused Plite contract | a handler may depend on the final synchronized selection | rearchitect |
| direct DOM text repair | Repairs any non-native collapsed `insertText` target and then suppresses model mutation | Repair only when the exact semantic command is native-equivalent; otherwise continue to canonical model-owned mutation | Plite DOM/input runtime | Repair is transport reconciliation and cannot become a competing mutation authority | no app, docs, or package adoption | focused branch test, Plite suite, Browser replay | duplicate probe work on a rare demoted path; accepted over stale-selection reuse | rearchitect |
| Plate trigger handlers | Explicit range targeting makes command evaluation deterministic across root and view owners | Keep explicit range targeting; no registry workaround | Plate combobox, mention, and slash owners | Product commands own trigger policy; Plite owns dispatch | package tests and both demos | Plate partitions plus affected Browser corpus | both triggers share one runtime owner, so both must replay after the final edit | keep |

Execution slices:
1. Add an exact Plite beforeinput regression that proves a material text command prevents direct DOM repair and reaches model command dispatch at the mounted selection.
2. Gate the existing direct-repair branch with the existing private semantic-command probe; keep native-equivalent repair unchanged.
3. Replay Plite focused tests, Plate mention/slash/combobox tests, then both isolated Browser routes with follow-up filtering and five retry-free runs.

Failure controls:
- Selection-dependent handler: re-probe only after pending repair flush and selection synchronization; never reuse a stale earlier decision.
- Native-equivalent text: retain the current direct DOM repair and native fast path when the post-sync probe is equivalent.
- Duplicate mutation: direct DOM repair and model dispatch remain mutually exclusive; assert the repair callback is not called for material commands.

Plan acceptance: accepted by the user's instruction to continue the full repair, push the complete checkout, and keep local and PR CI green. No public break, docs change, benchmark claim, collaboration change, or device claim applies.

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| mention-at-trigger | Plate mention/combobox command wiring plus registry MentionKit | `http://localhost:3011/blocks/mention-demo` in Chromium | PID 1100 started before the final input mtimes and served current source | Source aliases and packed `platejs/mention/react` release artifacts passed | pass: exact final receipt and Browser interaction |
| slash-command-trigger | Plate slash/combobox command wiring plus registry SlashKit | `http://localhost:3011/blocks/slash-command-demo` in Chromium | PID 1100 started before the final input mtimes and served current source | Source aliases and packed `platejs/slash-command/react` release artifacts passed | pass: exact final receipt and Browser interaction |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| mention-at-trigger | Mounted React `MentionPlugin` and Plite material-command contracts | Plate trigger range plus Plite input runtime; registry focus only after causal proof | Exact RED/GREEN command, isolated Browser replay, 5 retry-free warm runs | root cause: direct DOM repair bypassed material model command; focused 44/44 Plate, 56/56 input-router, 37/37 selection; receipt below | completed |
| slash-command-trigger | Shared Plite runtime contract plus exact slash owner test | Same shared owner and slash package test | Exact GREEN command, affected Browser replay, 5 retry-free warm runs | shared owner fixed both cases; slash partition 4/4 and receipt below | completed |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| mention-at-trigger | focused package test plus isolated Browser route | 5 warm runs after final shared-owner edit | pass: 5/5 | 0 | keep |
| slash-command-trigger | focused package test plus isolated Browser route | 5 warm runs after final shared-owner edit | pass: 5/5 | 0 | keep |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| mention-at-trigger | A detached/root editor command test passed while the mounted Browser owner remained red | repair-now | `.agents/rules/regression.mdc`, methodology, semantic validator, and generated Regression mirror require `runtime-owner: pass` | pass: 33 source tests; 33 mirror tests; byte parity; agent-native route/source/proof map PASS with no findings | failed-fix interrupt completed before product attempt 2 |
| mention-at-trigger | A constructed view proved command discovery but never mounted or exercised direct DOM repair | repair-now | Regression now requires exact mounted-owner proof after a failed Browser command candidate and rejects constructed-view proxy closure | pass: 34 source tests; 34 mirror tests; byte parity; agent-native route/source/proof map PASS with no findings | second-failed-fix triggered accepted Best API and Plite Plan before attempt 3 |
| mention-at-trigger | Exact mounted runtime and Browser corpus | keep | Chromium desktop mention trigger and follow-up filtering | no cross-browser or release claim | repository and PR CI |
| slash-command-trigger | Exact shared-owner package and Browser corpus | keep | Chromium desktop slash trigger and follow-up filtering | no cross-browser or release claim | repository and PR CI |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| mention-at-trigger | Detached or constructed editor command proof missed the mounted direct DOM-repair bypass | repair-now | `.agents/rules/regression.mdc`, methodology, validator tests, and generated mirrors require `runtime-owner: pass`; constructed unmounted views remain proxy proof | pass: 34 source tests, 34 mirror tests, byte parity, agent-native PASS | second-failed-fix; Best API and Plite Plan accepted before attempt 3 |
| slash-command-trigger | Shared Plite runtime owner is proven by mention and exact slash replay | no-change | Reuse the same Plite runtime contract; add no duplicate workflow machinery | pass: slash partition 4/4 and Browser 5/5 | shared-owner adoption complete |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Focused Vitest filename | proof command | immediate / immediate | Used `.ts` instead of `.test.ts` | none: no product evidence | corrected command; 37/37 pass |
| Focused Bun cwd/config | proof command | immediate / immediate | Package-local invocation skipped root JSX config | none: no product evidence | reran from root config; Plate 44/44 and www 5/5 pass |
| Packed artifact size snapshot | release tooling | 2 minutes / 2 minutes | Expected byte change needed review | high: package topology and DCE | accepted 42-105 byte deltas; normal gate passes |

Findings:
- Both isolated demos reproduced the regression without startup or interaction runtime errors.
- Direct DOM repair bypassed material semantic commands after selection synchronization; model dispatch is the canonical mutation owner.
- Internal React controls also lost native and synthetic input propagation until both Plite capture paths stopped swallowing them.

Timeline:
- Reproduced `@` on `/blocks/mention-demo`: literal text, editor focus retained, zero options, clean logs.
- Reproduced `/` on `/blocks/slash-command-demo`: literal text, editor focus retained, zero options, clean logs.
- Invalidated two proxy-green candidates with exact mounted Browser replay and repaired Regression methodology.
- Accepted the private Plite runtime plan, repaired mutation/focus/event ownership, and proved both cases 10/10 retry-free.

Decisions and tradeoffs:
- Repair the canonical shared input runtime and explicit Plate trigger range; do not patch both registry kits independently.
- Keep Browser as final proof, but put durable behavior in package/DOM tests whenever the exact RED is expressible below E2E.
- Skip autoreview only because the user explicitly waived it; all other local, push, and PR CI gates remain mandatory.

Review fixes:
- N/A: user explicitly waived autoreview. Agent-native source/route/proof review passed with no finding.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Wrong focused Vitest filename | 1 | Use discovered `.test.ts` filename | 37/37 pass |
| Package-local Bun command skipped root JSX config | 1 | Run with root config | 44/44 Plate and 5/5 www pass |
| Generated runtime proof narrowed away `.configure` | 1 | Remove redundant configure calls and regenerate | affected Plite lane pass |
| Reviewed entrypoint size snapshot changed | 1 | Accept tiny causal deltas and rerun normal gate | packed release lane pass |

Verification evidence:
- Plite input-router 56/56; selection controller 37/37.
- Plate focused root-config 44/44; combobox 36/36; mention 15/15; slash 4/4.
- apps/www focused root-config 5/5.
- Exact Browser 2/2 and stability 10/10 with zero retries.
- `pnpm check:plite`: 711 Chromium passed, 8 skipped; all packages/contracts passed.
- `pnpm plite:release:packages`: 79 public subpaths, Node/headless/SSR/declaration/DCE/optional-peer/size proofs passed.

Final handoff:
- executable cases: `mention-at-trigger` and `slash-command-trigger`, both completed and kept
- cumulative reporter evidence, phase-specific oracles, and forbidden states: pass; all eight observation classes resolved per case
- failed-fix invalidation and automatic repair: pass; attempts 1 and 2 invalidated, methodology repaired and proved 34/34 in source and mirror
- proof receipts and affected-corpus replay: pass; shared digest `sha256:8c5bfd5d8e31e7641bea98822013f4b3e8f4bfedc49b02e3d2b79f9a8c392b81`, 2/2 exact and 10/10 stability
- started-gate failure closure: pass; every failed started gate has an exact final rerun above
- changed files: Plite input runtime/contracts, Plate trigger/mention tests, registry combobox/tests, Regression workflow, generated entrypoint proof, and size baseline
- design decisions: material commands always use model mutation; DOM repair stays native-equivalent; internal controls keep model selection without swallowing app input handlers
- tests and proof: focused suites, strict Plite, packed artifacts, exact Browser, and stability all pass
- source/generated sync: pass; `pnpm install`, 34/34 source and mirror validator tests, byte parity
- P1 and agent-native findings: P1 N/A by explicit waiver; agent-native review pass with no gap
- residual risks and next owner: Chromium claim only; repository and authoritative PR CI own integration closure
- local completion status and integration/public-status boundary: local regression run completed on dirty ref; not yet committed, pushed, merged, or released

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | local regression repair and proof completed; repository/PR integration remains |
| Where am I going? | full repo check, commit, push, and PR CI green |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | Direct DOM repair must never outrank a material semantic command, and internal controls must retain event propagation. |
| What have I done? | Reproduced, repaired, hardened Regression, proved focused/runtime/browser/packed lanes, and kept both cases. |

Open risks:
- The complete checkout is large, so final local and PR CI may reveal unrelated integration failures that still must be repaired before handoff.
