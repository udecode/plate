# Fix native select-all deletion and consecutive Enter

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
Restore native homepage editing after Cmd+A: Backspace deletes the editable document, repeated Enter creates successive paragraphs, and follow-up typing remains usable.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-21-native-select-all-delete-consecutive-enter.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:

- target bug / surface / corpus: homepage `editor-ai` authored markup editor on `/`
- lane and current source owner: Plite authored view selection in `packages/plitejs/src/react/editable/mutation-controller.ts` and `projected-selection-target.ts`
- selected executable test cases: `AUTHORED-SELECT-ALL`, `HOMEPAGE-SELECT-ALL`, and `HOMEPAGE-CONSECUTIVE-ENTER`
- tested ref or dirty-state boundary: dirty:4de58926f2a321dbdf1afd8e10178c3d0815756c
- route / proof host and freshness method: exact `/` on a fresh source-backed www host at `http://localhost:3297`
- invocation mode / timebox: one-shot repair; stop on exact replay failure, contested ownership, or unavailable fresh host

First checkpoint:

- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/patch/references/corpus.md`.
- Fill the selected-case, reporter-oracle, failed-fix, and architecture tables,
  then run `validate-regression-plan.mjs` before implementation.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:

- Every required selected case has permanent executable red/green coverage,
  exact final-byte proof, applicable stability and a completed local decision.
- Apply the canonical [Patch corpus method](../../../.agents/rules/patch/references/corpus.md)
  and applicable [Verify Plate oracles](../../../.agents/rules/verify-plate/references/regression-oracles.md).
  Their tags and domain gates remain required; this template stores evidence.
- Every still-applicable reporter claim has a phase-specific positive and
  forbidden-state oracle; evidence deltas never erase base acceptance.
- Resolve every canonical checklist/gate and pass semantic validation before
  structural completion. Commit and push are not local completion gates.

Verification surface:

- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/patch/scripts/validate-regression-plan.mjs docs/plans/2026-09-21-native-select-all-delete-consecutive-enter.md --complete`
- Task-owned review when explicitly requested or closing a PR
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-21-native-select-all-delete-consecutive-enter.md`

Constraints:

- Executable tests own durable behavior; the Task plan is transient coordination.
- Patch owns case selection and repair; Verify Plate owns applicable proof.
- No parallel writers to shared source, tests, plans, builds or managed hosts.
- Generated output is not a source owner. A proxy cannot close the exact case.
- Mark fully proved local work `completed` with ref/dirty fingerprints and
  uncommitted/unpushed state when true. Do not widen that
  status into integrated, shipped, released, or public issue completion without
  the owning evidence and authority.
- A failed claimed fix follows Patch’s failed-fix method before product work
  resumes. Expected red reproduction does not count as a failed fix.

Boundaries:

- allowed source owners: Plite authored selection/mutation code only
- allowed proof/test owners: Plite React contracts and `apps/www/tests/browser/suggestion.spec.ts`
- generated/source boundary: registry generation may refresh generated www output; never hand-edit generated registry files
- browser/device claim width: local Chromium homepage only; no Firefox, WebKit, mobile, deployed, or release claim
- forbidden product/API/release/public mutations: no public API change, commit, push, PR, issue, release, or deployment
- orchestration mode and writer ownership: direct execution with one writer; no subagents or parallel mutable host

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

- current phase: final evidence reconciliation
- current executable case: all three selected cases
- current case status: package and exact Chromium cases green; five retry-free browser repetitions pass
- next owner: Task closeout
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
| Prompt requirements captured | yes | Two explicit outcomes, local fix scope and proof threshold recorded once. |
| Patch corpus method loaded | yes | Corpus and applicable runtime/native/caret diagnostics loaded before implementation. |
| Task plan reused; standing Autogoal request or explicit opt-out resolved | yes | One native goal and this one plan used throughout. |
| Current source owner and tested ref recorded | yes | Plite owners and dirty base `4de58926f2a321dbdf1afd8e10178c3d0815756c` recorded. |
| Executable test cases discovered | yes | Three atomic package/browser cases selected with exact commands. |
| Cumulative reporter evidence resolved | yes | Base acceptance and later residual Enter/native-selection evidence retained. |
| Reporter oracle matrix resolved | yes | All nine observations resolved per case with executable anchors or N/A reasons. |
| Regression semantic validator ready | yes | Initial validation passed before product implementation. |
| Route/proof-host readiness plan recorded | yes | Fresh source host `localhost:3297`, pid 34070, Node 22 and generated boundary recorded. |
| Direct/delegated repair boundary recorded | yes | Direct execution; allowed Plite and proof owners recorded. |
| Orchestrator writer ownership recorded | no | N/A: no subagents or parallel writers used. |
| Output budget strategy recorded | yes | Focused files/commands used; broad output capped. |
| Claim width and blocked rules recorded | yes | Local Chromium/package claim only; public/release/device boundaries explicit. |

Work Checklist:

- [x] Capture explicit requirements, scope, completion threshold and proof once.
- [x] Apply Patch corpus mode and load only relevant Verify Plate domain oracles.
- [x] Bind current source, exact environment, route/host and runtime inputs.
- [x] Select atomic executable cases with positive-outcome authority and scope.
- [x] Inventory cumulative base acceptance and every later reporter delta.
- [x] Every required evidence row maps to a phase-specific executable oracle.
- [x] Fill all schema observations with applicable proof or explicit N/A reasons.
- [x] Run semantic validation before implementation and the smallest falsifying probe.
- [x] Record affected-owner pre-edit baselines before shared changes.
- [x] Repair one case and record exact red/green evidence in `Patch delegation`;
      direct execution satisfies this historical schema heading.
- [x] Prove final inputs, applicable domain oracles, receipts and affected corpus.
- [x] Count fresh retry-free executions for required stability; cached reuse is invalid.
- [x] Close each started gate failure with its exact final rerun.
- [x] Invalidate and diagnose every failed claimed fix before another attempt.
- [x] Prove canonical escape prevention or an existing gate rejecting each escape.
- [x] Resolve required architecture review, methodology deltas and packet decisions.
- [x] Mark evidence-complete local cases completed; preserve wider claim limits.
- [x] Finish applicable source regeneration, parity and Task-owned review gates.
- [x] Reconcile acceptance and record final evidence, risks and next owner.
- [x] Pass semantic completion, then structural completion.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: all three cases completed and kept |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: dirty base and receipt inputs recorded |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: pid/cwd/source host and digest recorded |
| Exact reporter route | yes | Bind reporter route through selected environment, proof host, final command, and executable receipt input; reject proxy routes | pass: literal `http://localhost:3297/` in cases, host and commands |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: package and browser cases anchored |
| E2E escalation closure | yes | Select the smallest sufficient proof; record `e2e-required:` for any distinct native boundary, including when combined with `unit-red:` | pass: mounted keyboard/focus/DOM boundaries use Playwright |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pass: three required evidence rows |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all nine observations and every applicable interaction phase per case | pass: semantic validator complete |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and repaired the escape or demonstrated its existing rejecting gate | pass: two attempts, traces and rejecting gates recorded |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has a Best API Review verdict and any required design/adoption evidence | pass: Pursue existing-owner verdict; rejected API expansion recorded |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: three zero-retry receipts validate current inputs |
| Measurement-owner closure | no | N/A: no render-count or performance claim | N/A: no measurement owner |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: full suites and exact browser replay after last edit |
| Shared-style consumer closure | no | N/A: no shared style change | N/A: no style consumer proof |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: four relevant failures have exact green reruns |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: exact package RED and host repairs recorded |
| Patch delegation closure | yes | Record one-case root-cause/red/green/proof evidence; delegation is optional | pass: direct-execution rows complete |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: package receipts and Chromium receipts |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: browser cases 5/5, retries 0 |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | pass: all cases kept locally |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pass: local uncommitted/unpushed boundary recorded |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: only executable tests, active plan and required review artifact added |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: registry generator used; localhost host fixed |
| Orchestrator writer closure | no | N/A: no orchestrator or worker used | N/A: one direct writer |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: Node, origin, command and broad-dispatch slowdowns resolved; unrelated diagnostics reported |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | pass: three methodology rows resolved |
| Source/generated sync | no | N/A: no agent source changed; registry generated through owning command | N/A: no skill regeneration or package barrel change |
| Agent-native review | no | N/A: no agent workflow source changed | N/A: product repair only |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: final handoff section complete |
| Autoreview | no | N/A: not requested, no PR, and branch is `next` | N/A: prohibited on next |
| Regression semantic plan | yes | Run `node .agents/skills/patch/scripts/validate-regression-plan.mjs docs/plans/2026-09-21-native-select-all-delete-consecutive-enter.md --complete` | pass: semantically complete |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-21-native-select-all-delete-consecutive-enter.md` | pass: final structural checker |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | pass | goal and plan created | complete |
| Current source and proof-host readiness | pass | owners, Node 22, pid/cwd and localhost host bound | complete |
| Executable case discovery and selection | pass | three atomic cases | complete |
| Cumulative reporter evidence inventory | pass | base and residual claims retained | complete |
| Reporter oracle expansion | pass | all observations resolved | complete |
| Pre-implementation semantic validation | pass | validator structurally valid | complete |
| Smallest high-value probe | pass | proxy green isolated authored homepage mode | complete |
| Reproduce, classify, and red test | pass | exact package/browser REDs | complete |
| One-case Patch repair | pass | existing-owner fixes implemented | complete |
| Focused verification and stability | pass | full suites and 5/5 browser runs | complete |
| Keep/revert/quarantine | pass | three keep decisions | complete |
| Methodology repair/no-change/defer | pass | architecture review and rows resolved | complete |
| Reviews and final handoff | pass | implementation review and handoff recorded | complete |
| Final goal-plan check | pass | semantic and structural commands recorded | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| AUTHORED-SELECT-ALL | User report plus existing authored retained-selection protection contract | Mount edit/markup authored content with live `AB` and retained `XYZ`; select all, delete, undo/redo, then insert two breaks | Select-all retains the full editable model range and visible projected selection; deletion publishes one reviewable full-document change, normalizes to one empty paragraph, undo/redo works, and repeated breaks remain legal | existing-contract: mixed accepted and pending gestures remain reviewable without implicit decisions | unit-red: packages/plitejs/test/react/authored-fragment-provider.test.tsx#deletes the live document after select-all spans retained authored content | runtime-modes: authored intent edit, markup projection, retained deletion, history; fixture-scope: complete `AXYZB` with retained `XYZ` | `PATH=/Users/felixfeng/.nvm/versions/node/v22.21.1/bin:$PATH pnpm --filter plitejs exec vitest run --config vitest.config.mjs test/react/authored-fragment-provider.test.tsx -t "deletes the live document after select-all spans retained authored content\|inserts consecutive breaks after authored select-all deletion"` | completed | dirty:4de58926f2a321dbdf1afd8e10178c3d0815756c | Task closeout |
| HOMEPAGE-SELECT-ALL | User report on exact homepage `/` | Focus the homepage editor, press native Cmd+A and Backspace, then type `x` | Backspace leaves one empty paragraph with a collapsed selection; the next key produces `x` with matching model and DOM selection and no runtime error | reporter: Cmd+A all-selection must be deletable | e2e-required: mounted authored runtime, native shortcut, focus and DOM selection cannot be proved by package tests | exact-route: http://localhost:3297/; runtime-modes: authored intent edit, markup projection, current editor-ai plugins; fixture-scope: complete current richTextEditorValue; reporter-profile: macOS Chromium | `PATH=/Users/felixfeng/.nvm/versions/node/v22.21.1/bin:$PATH PLAYWRIGHT_BASE_URL=http://localhost:3297 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/suggestion.spec.ts --grep "homepage select-all deletion stays editable"` | completed | dirty:4de58926f2a321dbdf1afd8e10178c3d0815756c | Task closeout |
| HOMEPAGE-CONSECUTIVE-ENTER | User report on exact homepage `/` | Prepare one empty homepage paragraph, focus it, press native Enter twice, then type `x` | Each Enter adds one empty paragraph, selection advances to the new block, and `x` lands in the third paragraph with matching model and DOM selection and no runtime error | reporter: consecutive line breaks must work | e2e-required: mounted authored runtime, native Enter sequence, focus and DOM selection cannot be proved by package tests | exact-route: http://localhost:3297/; runtime-modes: authored intent edit, markup projection, current editor-ai plugins; fixture-scope: complete current richTextEditorValue reduced through the real editor command; reporter-profile: macOS Chromium | `PATH=/Users/felixfeng/.nvm/versions/node/v22.21.1/bin:$PATH PLAYWRIGHT_BASE_URL=http://localhost:3297 pnpm --filter www exec playwright test --config playwright.config.ts --project=chromium tests/browser/suggestion.spec.ts --grep "homepage preserves consecutive empty paragraphs before follow-up typing"` | completed | dirty:4de58926f2a321dbdf1afd8e10178c3d0815756c | Task closeout |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| AUTHORED-SELECT-ALL | base-acceptance | User report, retained-selection contract, and direct-editing review law | after-action | Explicit select-all over retained markup keeps a full editable model selection, publishes the dependent gesture as one proposal, normalizes deletion, and preserves ordinary retained-only protection | required | model@after-action | test: packages/plitejs/test/react/authored-fragment-provider.test.tsx#deletes the live document after select-all spans retained authored content | pass: targeted receipt plus 61/61 authored React file |
| HOMEPAGE-SELECT-ALL | base-acceptance | User report on `http://localhost:3000/` | after-action | Native Cmd+A then Backspace deletes the homepage editor document | required | model@after-action, dom-native@follow-up, focus@follow-up, runtime-errors@follow-up | test: apps/www/tests/browser/suggestion.spec.ts#homepage select-all deletion stays editable | pass: exact current-source Chromium replay and follow-up key |
| HOMEPAGE-CONSECUTIVE-ENTER | base-acceptance | User report on `http://localhost:3000/` | follow-up | Two native Enter keys create successive paragraphs and the next key edits the last paragraph | required | model@follow-up, dom-native@follow-up, focus@follow-up, runtime-errors@follow-up, follow-up-input@follow-up | test: apps/www/tests/browser/suggestion.spec.ts#homepage preserves consecutive empty paragraphs before follow-up typing | pass: exact current-source Chromium replay and five-run stability |

Reporter oracle matrix:

| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| AUTHORED-SELECT-ALL | model | after-action | yes | Select-all records the full live model range; delete-fragment publishes one dependent authored gesture, normalizes to an empty paragraph, clears the view selection, and supports undo/redo | Model selection is null, prior changes are implicitly decided, or retained protection turns delete into a no-op | package Vitest | test: packages/plitejs/test/react/authored-fragment-provider.test.tsx#deletes the live document after select-all spans retained authored content | pass: two targeted package cases and full authored React file |
| AUTHORED-SELECT-ALL | dom-native | after-action | no | N/A: package contract does not claim browser DOM | N/A: covered by homepage case | N/A: browser owner is separate | N/A: browser owner is separate | N/A: browser owner is separate |
| AUTHORED-SELECT-ALL | pointer-feedback | after-action | no | N/A: no pointer interaction | N/A: no pointer interaction | N/A: no pointer interaction | N/A: no pointer interaction | N/A: no pointer interaction |
| AUTHORED-SELECT-ALL | focus | after-action | no | N/A: package contract has no native focus | N/A: covered by homepage case | N/A: browser owner is separate | N/A: browser owner is separate | N/A: browser owner is separate |
| AUTHORED-SELECT-ALL | popup | after-action | no | N/A: no popup | N/A: no popup | N/A: no popup | N/A: no popup | N/A: no popup |
| AUTHORED-SELECT-ALL | geometry-paint | after-action | no | N/A: no visual claim | N/A: no visual claim | N/A: no visual claim | N/A: no visual claim | N/A: no visual claim |
| AUTHORED-SELECT-ALL | subscription-lifecycle | after-action | no | N/A: no subscription change | N/A: no subscription change | N/A: no subscription change | N/A: no subscription change | N/A: no subscription change |
| AUTHORED-SELECT-ALL | runtime-errors | after-action | no | N/A: browser runtime owned by homepage case | N/A: browser runtime owned by homepage case | N/A: browser runtime owned by homepage case | N/A: browser runtime owned by homepage case | N/A: browser runtime owned by homepage case |
| AUTHORED-SELECT-ALL | follow-up-input | follow-up | no | N/A: package case stops at deletion | N/A: homepage case owns follow-up input | N/A: homepage case owns follow-up input | N/A: homepage case owns follow-up input | N/A: homepage case owns follow-up input |
| HOMEPAGE-SELECT-ALL | model | after-action | yes | Native Cmd+A and Backspace produce exactly one empty paragraph with model selection `[0,0]:0` | Original multi-block value remains or selection stays expanded/null | browser Playwright plus package contract | test: apps/www/tests/browser/suggestion.spec.ts#homepage select-all deletion stays editable | pass: exact Chromium model assertion |
| HOMEPAGE-SELECT-ALL | dom-native | follow-up | yes | The next native `x` produces model and DOM selection `[0,0]:1`; runtime-owner: pass; mutation-owner: pass | DOM selection is absent, stale, or disagrees with the model | browser-native Playwright Chromium | test: apps/www/tests/browser/suggestion.spec.ts#homepage select-all deletion stays editable | pass: runtime-owner: pass; mutation-owner: pass; collapsed model/DOM selection matches |
| HOMEPAGE-SELECT-ALL | pointer-feedback | setup | no | N/A: keyboard-only report | N/A: keyboard-only report | N/A: keyboard-only report | N/A: keyboard-only report | N/A: keyboard-only report |
| HOMEPAGE-SELECT-ALL | focus | follow-up | yes | The same homepage editor owns Cmd+A, Backspace and `x` without another click | Focus leaves the editor or keys target the page | browser-native Playwright Chromium | test: apps/www/tests/browser/suggestion.spec.ts#homepage select-all deletion stays editable | pass: native sequence and follow-up key reach one editor |
| HOMEPAGE-SELECT-ALL | popup | setup | no | N/A: no popup | N/A: no popup | N/A: no popup | N/A: no popup | N/A: no popup |
| HOMEPAGE-SELECT-ALL | geometry-paint | after-action | no | N/A: no layout or paint claim | N/A: no layout or paint claim | N/A: no layout or paint claim | N/A: no layout or paint claim | N/A: no layout or paint claim |
| HOMEPAGE-SELECT-ALL | subscription-lifecycle | after-action | no | N/A: no subscription change | N/A: no subscription change | N/A: no subscription change | N/A: no subscription change | N/A: no subscription change |
| HOMEPAGE-SELECT-ALL | runtime-errors | follow-up | yes | Cmd+A, Backspace and follow-up typing emit no page error, console error or overlay | Any runtime error or Next error overlay appears | browser Playwright strict runtime recorder | test: apps/www/tests/browser/suggestion.spec.ts#homepage select-all deletion stays editable | pass: strict runtime recorder empty |
| HOMEPAGE-SELECT-ALL | follow-up-input | follow-up | yes | `x` appears in the normalized paragraph immediately after deletion | Typing is ignored, lands elsewhere, or corrupts retained content | browser Playwright native keyboard | test: apps/www/tests/browser/suggestion.spec.ts#homepage select-all deletion stays editable | pass: `x` is the only live model block text |
| HOMEPAGE-CONSECUTIVE-ENTER | model | follow-up | yes | Starting from one empty paragraph, Enter produces `['', '']`, the next Enter produces `['', '', '']`, and `x` produces `['', '', 'x']` with selection `[2,0]:1` | Either Enter is swallowed, empty paragraphs collapse, or text lands outside the third block | browser Playwright plus package contract | test: apps/www/tests/browser/suggestion.spec.ts#homepage preserves consecutive empty paragraphs before follow-up typing | pass: every intermediate model state and selection asserted |
| HOMEPAGE-CONSECUTIVE-ENTER | dom-native | follow-up | yes | Final model and DOM selection match `[2,0]:1`; runtime-owner: pass; mutation-owner: pass | DOM selection is absent, stale, or disagrees with the model | browser-native Playwright Chromium | test: apps/www/tests/browser/suggestion.spec.ts#homepage preserves consecutive empty paragraphs before follow-up typing | pass: runtime-owner: pass; mutation-owner: pass; post-DOM-commit selection export matches |
| HOMEPAGE-CONSECUTIVE-ENTER | pointer-feedback | setup | no | N/A: keyboard-only report | N/A: keyboard-only report | N/A: keyboard-only report | N/A: keyboard-only report | N/A: keyboard-only report |
| HOMEPAGE-CONSECUTIVE-ENTER | focus | follow-up | yes | The same editor owns both Enter keys and `x` without another click | Focus is lost between breaks or before typing | browser-native Playwright Chromium | test: apps/www/tests/browser/suggestion.spec.ts#homepage preserves consecutive empty paragraphs before follow-up typing | pass: uninterrupted native sequence reaches one editor |
| HOMEPAGE-CONSECUTIVE-ENTER | popup | setup | no | N/A: no popup | N/A: no popup | N/A: no popup | N/A: no popup | N/A: no popup |
| HOMEPAGE-CONSECUTIVE-ENTER | geometry-paint | after-action | no | N/A: no layout or paint claim | N/A: no layout or paint claim | N/A: no layout or paint claim | N/A: no layout or paint claim | N/A: no layout or paint claim |
| HOMEPAGE-CONSECUTIVE-ENTER | subscription-lifecycle | after-action | no | N/A: no subscription change | N/A: no subscription change | N/A: no subscription change | N/A: no subscription change | N/A: no subscription change |
| HOMEPAGE-CONSECUTIVE-ENTER | runtime-errors | follow-up | yes | Repeated Enter and follow-up typing emit no page error, console error or overlay | Any runtime error or Next error overlay appears | browser Playwright strict runtime recorder | test: apps/www/tests/browser/suggestion.spec.ts#homepage preserves consecutive empty paragraphs before follow-up typing | pass: strict runtime recorder empty |
| HOMEPAGE-CONSECUTIVE-ENTER | follow-up-input | follow-up | yes | `x` appears in the third paragraph immediately after two Enter keys | Typing is ignored, lands in the wrong block, or corrupts prior content | browser Playwright native keyboard | test: apps/www/tests/browser/suggestion.spec.ts#homepage preserves consecutive empty paragraphs before follow-up typing | pass: `x` appears only in block three |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| AUTHORED-SELECT-ALL | 1 | completed | "/Users/felixfeng/.nvm/versions/node/v22.21.1/bin/node" "/Users/felixfeng/.nvm/versions/node/v24.11.1/lib/node_modules/corepack/dist/pnpm.js" "--filter" "plitejs" "exec" "vitest" "run" "--config" "vitest.config.mjs" "test/react/authored-fragment-provider.test.tsx" "-t" "deletes the live document after select-all spans retained authored content\u007cinserts consecutive breaks after authored select-all deletion" | pass: exit 0 in 2495ms | dirty:4de58926f2a321dbdf1afd8e10178c3d0815756c | sha256:3616b2684dc9d2fe526fcda9992780857cd5660cb05afcf1eb17541b01f8af25 | 3 | packages/plitejs/src/react/editable/mutation-controller.ts,packages/plitejs/src/react/editable/projected-selection-target.ts,packages/plitejs/test/react/authored-fragment-provider.test.tsx | host:none - source-first package contract | 2026-09-21T11:02:23.888Z | 2026-09-21T11:26:52.541Z | 2026-09-21T11:26:55.036Z | 0 | sha256:b7ea7066871c7df3c205f1bb6c89422de79719b2d11b677442a5d2f8bdd09a05 |
| HOMEPAGE-SELECT-ALL | 3 | completed | "env" "PLAYWRIGHT_BASE_URL=http://localhost:3297" "/Users/felixfeng/.nvm/versions/node/v22.21.1/bin/node" "/Users/felixfeng/.nvm/versions/node/v24.11.1/lib/node_modules/corepack/dist/pnpm.js" "--filter" "www" "exec" "playwright" "test" "--config" "playwright.config.ts" "--project=chromium" "tests/browser/suggestion.spec.ts" "--grep" "homepage select-all deletion stays editable" | pass: exit 0 in 3054ms | dirty:4de58926f2a321dbdf1afd8e10178c3d0815756c | sha256:032734c896aef50e94ab1ed4400a04cccf2039671b768deda1b78da1f56effd3 | 8 | apps/www/playwright.config.ts,apps/www/src/registry/blocks/editor-ai/components/editor/rich-text-editor-value.ts,apps/www/src/registry/blocks/editor-ai/components/editor/rich-text-editor.tsx,apps/www/tests/browser/suggestion.spec.ts,packages/plitejs/src/react/editable/decoration-repair-bridge.ts,packages/plitejs/src/react/editable/mutation-controller.ts,packages/plitejs/src/react/editable/projected-selection-target.ts,packages/plitejs/test/react/authored-fragment-provider.test.tsx | pid:34070;started:2026-09-21T09:30:20.000Z;base-url:http://localhost:3297;browser:chromium | 2026-09-21T11:02:23.888Z | 2026-09-21T11:18:55.788Z | 2026-09-21T11:18:58.842Z | 0 | sha256:0bde2823c82b56de7e6a4be5d9e2f06cf5e5b1516ffa14aa2f5fcf68d395a5b2 |
| HOMEPAGE-CONSECUTIVE-ENTER | 1 | completed | "env" "PLAYWRIGHT_BASE_URL=http://localhost:3297" "/Users/felixfeng/.nvm/versions/node/v22.21.1/bin/node" "/Users/felixfeng/.nvm/versions/node/v24.11.1/lib/node_modules/corepack/dist/pnpm.js" "--filter" "www" "exec" "playwright" "test" "--config" "playwright.config.ts" "--project=chromium" "tests/browser/suggestion.spec.ts" "--grep" "homepage preserves consecutive empty paragraphs before follow-up typing" | pass: exit 0 in 3350ms | dirty:4de58926f2a321dbdf1afd8e10178c3d0815756c | sha256:032734c896aef50e94ab1ed4400a04cccf2039671b768deda1b78da1f56effd3 | 8 | apps/www/playwright.config.ts,apps/www/src/registry/blocks/editor-ai/components/editor/rich-text-editor-value.ts,apps/www/src/registry/blocks/editor-ai/components/editor/rich-text-editor.tsx,apps/www/tests/browser/suggestion.spec.ts,packages/plitejs/src/react/editable/decoration-repair-bridge.ts,packages/plitejs/src/react/editable/mutation-controller.ts,packages/plitejs/src/react/editable/projected-selection-target.ts,packages/plitejs/test/react/authored-fragment-provider.test.tsx | pid:34070;started:2026-09-21T09:30:20.000Z;base-url:http://localhost:3297;browser:chromium | 2026-09-21T11:02:23.888Z | 2026-09-21T11:19:33.277Z | 2026-09-21T11:19:36.627Z | 0 | sha256:ca02fa8597db30be57f0283f0a5c198b69ad7c10587f27006c7e1a89a2d5abf7 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite projected authored selection, mounted break dispatch, and post-DOM-commit selection export | AUTHORED-SELECT-ALL, HOMEPAGE-SELECT-ALL, HOMEPAGE-CONSECUTIVE-ENTER | pass: original Plite richtext select-all Backspace, plaintext repeated Enter, and 1305 React tests | 2026-09-21T11:02:23.000Z | Full Plite core 2857/2857, React 1307/1307, authored file 61/61, typecheck 13/13, lint 11/11, then exact homepage five-run replay | sha256:032734c896aef50e94ab1ed4400a04cccf2039671b768deda1b78da1f56effd3 | pass: every affected case and materially different retained/view consumer is green after the last owner edit |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Plite Chromium proxy probe | runner rejected Node 24 before product action | proof-host configuration | use repository Node 22.21.1 | pass: richtext select-all and plaintext repeated Enter proxies passed |
| Exact homepage host | editor root absent because Next blocked `127.0.0.1` client chunks | proof-host origin mismatch | use server-declared `http://localhost:3297` | pass: exact homepage assertions executed and final five-run replay passed |
| Plite core suite | 18 retained/history/insertBreak failures after the global dispatch experiment | in-scope over-broad product candidate | revert global dispatch and keep structural Enter in its mounted owner | pass: 2857/2857 core tests |
| Package proof receipt | Vitest rejected unsupported `--grep` | proof command shape | use Vitest `-t` | pass: receipt `sha256:b7ea7066871c7df3c205f1bb6c89422de79719b2d11b677442a5d2f8bdd09a05` |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| HOMEPAGE-SELECT-ALL | 1 | Package candidate passed, but exact homepage Backspace and the next Enter both threw `AuthoredMappingConflictError` and left 35 model blocks unchanged | exact-replay | yes: revoked the package-green candidate and every local completion implication | no-change: `apps/www/tests/browser/suggestion.spec.ts` already rejects this incomplete candidate on the exact route | pass: the exact browser test rejected attempt 1 and emitted the native/model/view/next-input trace | no: first failure remained within the existing Plite authored mutation owner | N/A: first failure, no architecture trigger | reproduced: exact-route-reproduction: red; diagnostic: unchanged frozen candidate after Backspace and next Enter both fail in authored mapping; selection-transition-trace: native + model + view + next-input; first-divergence: Backspace/applyProjectedViewSelectionTextCommand to authored mapping; model and view remain full-document, native stays collapsed, editor stays active |
| HOMEPAGE-SELECT-ALL | 2 | Implicit reject-then-delete removed content but left authored selection null in the exact package replay | exact-replay | yes: revoked the implicit-decision candidate before another product edit | repair-now: `packages/plitejs/test/react/authored-fragment-provider.test.tsx` now uses edit/markup, retained content, selection, undo/redo, and consecutive-break contracts | pass: package test rejected null selection and browser gate rejected implicit review resolution | yes: second-failed-fix and cross-layer-compensation required architecture review | required: best-api-review Pursue existing `tx.authored.propose` and mounted command owners; plite-plan active plan adoption | reproduced: diagnostic: frozen attempt 2 normalized content but dropped selection; selection-transition-trace: native + model + view + next-input; first-divergence: implicit authored decision suffix discarded the selected view coordinate; exact-route-reproduction: red |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| AUTHORED-SELECT-ALL | 0 | none: package owner accepted after architecture verdict | patch | N/A: no public API change | N/A: direct package repair | pass: package receipt and full React file |
| HOMEPAGE-SELECT-ALL | 2 | second-failed-fix, cross-layer-compensation | escalate | required: best-api-review Pursue existing projected selection, `tx.authored.propose`, and mounted command transaction owners; reject new replacement API and implicit decisions | plite-plan: active Task plan adopts the bounded Plite repair and proof | accepted: review artifact `docs/plans/artifacts/2026-09-21-authored-select-all-command-review.json` plus exact final receipt |
| HOMEPAGE-CONSECUTIVE-ENTER | 0 | none: independent Enter invariant resolved at mounted command owner | patch | N/A: no public API change | N/A: direct package repair | pass: package and five-run browser proof |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| AUTHORED-SELECT-ALL | Plite projected selection/mutation owners and authored fragment package test | source-first Vitest in `packages/plitejs` | current TypeScript source through `config/plite-source-test-setup.ts`; receipt digest `sha256:3616b2684dc9d2fe526fcda9992780857cd5660cb05afcf1eb17541b01f8af25` | N/A: package contract uses source, not generated output | pass: receipt `sha256:752ee03ad38e06646df9219564848ae2fbca078335b965e8a13666044d1af4b1` |
| HOMEPAGE-SELECT-ALL | same Plite source consumed by `apps/www` editor-ai | Playwright Chromium at exact route `http://localhost:3297/`, pid 34070, cwd `apps/www` | browser-source-attestation: fresh `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1` host plus receipt digest `sha256:032734c896aef50e94ab1ed4400a04cccf2039671b768deda1b78da1f56effd3` | registry generated by `pnpm --filter www dev`; no generated file edited by hand | pass: receipt `sha256:0bde2823c82b56de7e6a4be5d9e2f06cf5e5b1516ffa14aa2f5fcf68d395a5b2` |
| HOMEPAGE-CONSECUTIVE-ENTER | same Plite source consumed by `apps/www` editor-ai | Playwright Chromium at exact route `http://localhost:3297/`, pid 34070, cwd `apps/www` | browser-source-attestation: same fresh host and unchanged browser receipt inputs | registry generated by `pnpm --filter www dev`; no generated file edited by hand | pass: receipt `sha256:ca02fa8597db30be57f0283f0a5c198b69ad7c10587f27006c7e1a89a2d5abf7` |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| AUTHORED-SELECT-ALL | package test received `null` instead of a full model selection | Plite mutation/selection owner and authored fragment contract test | targeted red/green, 61/61 authored file, full Plite suites and typecheck | full model plus projected selection, proposal publication, undo/redo, immutable nodes | pass: direct execution completed |
| HOMEPAGE-SELECT-ALL | exact Chromium homepage left the document unchanged, then exposed mapping conflict and null-selection candidates | shared Plite owner plus exact www test | fresh host exact replay, five retry-free runs, next-key model/DOM selection | source review, architecture verdict, receipt and strict runtime recorder | pass: direct execution completed |
| HOMEPAGE-CONSECUTIVE-ENTER | Enter threw immutable-node errors before mounted command evaluation moved inside the view update | mounted Plite line-break command owner plus exact www test | intermediate empty-block assertions, final DOM selection, five retry-free runs | package contract, source review, receipt and strict runtime recorder | pass: direct execution completed |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| AUTHORED-SELECT-ALL | targeted source-first Vitest | 1 red plus final affected-file and full-suite passes | pass: targeted receipt, 61/61 authored file, 1307/1307 React | 0 | keep |
| HOMEPAGE-SELECT-ALL | exact Playwright case on fresh 3297 host | five retry-free warm runs after green | pass: runs 1-5, 5/5 | 0 | keep |
| HOMEPAGE-CONSECUTIVE-ENTER | exact Playwright case on fresh 3297 host | five retry-free warm runs after green | pass: runs 1-5, 5/5 | 0 | keep |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| AUTHORED-SELECT-ALL | package receipt, 61/61 authored file, 2857/2857 core, 1307/1307 React | keep | local source-first authored model/history contract | no released or collaboration claim | Task closeout |
| HOMEPAGE-SELECT-ALL | exact receipt plus five retry-free Chromium runs | keep | local exact homepage Chromium, uncommitted/unpushed | Firefox, WebKit, mobile and deployed behavior not claimed | Task closeout |
| HOMEPAGE-CONSECUTIVE-ENTER | exact receipt plus five retry-free Chromium runs | keep | local exact homepage Chromium, uncommitted/unpushed | Firefox, WebKit, mobile and deployed behavior not claimed | Task closeout |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| AUTHORED-SELECT-ALL | Patch corpus method and existing retained-selection protection | no-change | `packages/plitejs/test/react/authored-fragment-provider.test.tsx` remains the behavior owner | pass: RED rejected null model selection; final targeted and full-file tests pass | existing method routed owner and proof correctly |
| HOMEPAGE-SELECT-ALL | Two failed candidates triggered architecture escalation | repair-now | `apps/www/tests/browser/suggestion.spec.ts` rejects incomplete candidates; review artifact records the owner decision | pass: browser gate rejected both incomplete candidates; final exact receipt passes | Best API Review kept existing `tx.authored.propose` and cut implicit decisions/new APIs |
| HOMEPAGE-CONSECUTIVE-ENTER | Mounted structural command and post-DOM-commit selection owners | no-change | `packages/plitejs/src/react/editable/mutation-controller.ts` and `decoration-repair-bridge.ts` with package/browser tests | pass: immutable-node RED, package GREEN, final model/DOM selection GREEN | existing methods found the command-lifecycle and DOM-commit owners |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Browser runner under Node 24 | Plite proof runner | immediate failure | repository requires Node 22 | host-only | switched to Node 22.21.1; exact rerun passed |
| Fresh www URL used `127.0.0.1` | Next dev host | 20 second editor timeout | Next blocked cross-origin chunks for the undeclared origin | host-only | changed proof URL to server-declared `localhost:3297`; exact rerun reached assertion |
| Vitest receipt used unsupported `--grep` | package proof command | immediate failure | Vitest uses `-t` for test names | no product evidence | corrected command and captured passing receipt |
| Global command-dispatch experiment | Plite core | 18 core failures | transaction-wrapping every semantic command changed unrelated retained/history behavior | decisive architecture evidence | reverted global change; kept only mounted structural Enter transaction; core 2857/2857 passed |
| Bare www `tsc` | www type gate | OOM at 4GB; 8GB rerun reached four unrelated errors | existing registry dependency, AI, dropdown test and HistoryPlugin diagnostics outside this change | broad diagnostic only | exact package and browser owners pass; broad www typecheck remains a reported checkout limitation |

Findings:

- Cmd+A on authored markup calls the special select-all branch, writes a full projected view selection, and clears the runtime model selection.
- The full-document gesture spans retained contributions, so it must reuse `tx.authored.propose()` as one reviewable edit rather than auto-accepting or auto-rejecting prior changes.
- Enter was an independent second failure: its semantic spec was built before the exact authored view transaction started, then failed immutable-node validation when applied to the projected empty document.
- Authored decoration refresh can replace the text host after a model repair; the final DOM commit must request selection export again.
- Plain Plite richtext select-all deletion and plaintext repeated Enter already pass; the regression requires the mounted authored markup runtime.

Timeline:

- 2026-09-21: reproduced on the user-visible homepage in Chrome; native selection collapsed while the model text stayed unchanged.
- 2026-09-21: added package and homepage executable cases; targeted package case failed on the expected null model selection.
- 2026-09-21: rejected model-range-only, implicit-decision, and global command-dispatch candidates with exact package/browser proof.
- 2026-09-21: final existing-owner repair passed all Plite suites, five browser stability repetitions, and three proof receipts.

Decisions and tradeoffs:

- Keep ordinary retained-only selections protected. Only explicit full-document select-all may retain a full model range and use it as the mutation target.
- Preserve the projected view selection for visible selection/copy and the model range for mutation; do not hard-cut authored markup or bypass it in the registry app.
- Keep mixed accepted/pending gestures reviewable through the existing authored proposal owner. Never make native deletion decide review state.
- Keep semantic command dispatch unchanged globally. Only mounted structural Enter enters its exact view transaction before command construction.

Review fixes:

- Source review rejected a global dispatch rewrite after three retained/history failures and a 2857-test blast-radius replay.
- Best API Review rejected a new full-document API, `value.replace`, implicit accept/reject and Plate-only glue. The compact review artifact is complete; ledger recording is deferred because the existing review inventory has unrelated removed feature identities.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser proof invoked under Node 24 | 1 | Use repo Node 22.21.1 | resolved: Plite proxy cases passed |
| Existing www test against unexplained port 3000 missed the lazy editor | 1 | Start a fresh source-backed host on port 3297 | resolved: fresh host ready |
| Fresh host was addressed as `127.0.0.1`, so Next blocked client chunks as cross-origin | 1 | Use the server-declared `localhost:3297` origin | resolved: exact rerun uses localhost |
| Full-document model delete crossed retained contributions | 1 | Preserve the model range but publish the whole gesture through existing `tx.authored.propose()` | resolved: package/browser and undo/redo proof pass |
| Implicit reject-then-delete lost selection | 1 | Reject implicit decisions; apply Best API Review and existing dependent-gesture law | resolved: architecture verdict and final selection proof pass |
| Global command dispatch inside updates broke unrelated consumers | 1 | Revert global change; put structural Enter in the mounted command owner | resolved: full core and React suites pass |

Verification evidence:

- `pnpm --filter plitejs test:bun`: 2857 passed, 0 failed.
- `pnpm --filter plitejs test:react`: 89 files, 1307 tests passed.
- `pnpm --filter plitejs typecheck`: 13/13 tasks passed.
- `pnpm --filter plitejs lint`: 11/11 tasks passed.
- Authored React file: 61/61 passed, including retained-only protection, deletion undo/redo and consecutive breaks.
- Exact homepage Chromium: both cases passed five retry-free repetitions plus individual receipt runs.
- `www` direct `tsc` with 8GB reached four unrelated existing checkout errors; no error points to changed files.

Final handoff:

- executable cases: all three selected cases completed locally
- cumulative reporter evidence, phase-specific oracles, and forbidden states: reconciled above
- failed-fix invalidation and escape-prevention evidence: two select-all attempts invalidated; review and exact gates prevent recurrence
- proof receipts and affected-corpus replay: three completed receipts; shared-owner replay recorded
- started-gate failure closure: relevant owner gates pass; unrelated www type diagnostics reported as a checkout limitation
- changed files: three Plite source owners, one Plite test, one www browser test, current behavior evidence, active plan and compact review artifact
- design decisions: existing authored proposal and projected/model selection owners retained; global dispatch and implicit decisions rejected
- tests and proof: full Plite core/React/type/lint plus exact five-run Chromium proof
- source/generated sync: www registry generator ran through the fresh host; no generated file was hand-edited; changeset N/A because `plitejs` does not exist on `main`
- P1 and agent-native findings: Autoreview N/A on `next`; no workflow source changed, so agent-native review N/A
- residual risks and next owner: unrelated www type errors and review-inventory drift remain outside this repair; no product repair remains
- local completion status and integration/public-status boundary: completed locally, uncommitted and unpushed; no release/public claim

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | final evidence reconciliation |
| Where am I going? | semantic/goal plan checks and handoff |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | full visible selection needs distinct projected and model ownership; mixed content stays proposed, and structural commands must be built in the exact view transaction |
| What have I done? | repaired both native interactions, rejected two incomplete designs, and passed package/full-suite/five-run browser proof |

Open risks:

- Broad `www` typecheck remains red in four unrelated existing files; changed owners pass their package typecheck/lint and exact runtime proof.
- Review-ledger recording is deferred because `review-index.json` has unrelated removed feature identities; the complete review draft remains in the active plan artifacts.
- Firefox, WebKit, mobile, deployed, committed and released behavior are not claimed.
- Fresh www host generation may surface unrelated registry drift; classify it separately.
