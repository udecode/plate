---
review_scopes: [comments]
review_basis: []
work_kind: implementation
---

# TaskHub 22 comment creation undo redo regression

Status: Completed locally; uncommitted and unpushed

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
Make a successfully created local comment share the editor's undo/redo order
with document edits, without replaying remote contributions or consuming
history on rejected, stale, or unsafe comment mutations.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:

- target bug / surface / corpus: TaskHub #22, Plate Comments creation and Plite History replay
- lane and current source owner: `BaseCommentsPlugin` owns comment policy and durable mutation; Plite `history` owns ordering and replay
- selected executable test cases: C22-ORDER, C22-SAFETY, C22-FOCUS
- tested ref or dirty-state boundary: `b812e914ea86041cd131beee6c7a183c1e1024ca`, then final dirty-tree source digests
- route / proof host and freshness method: Bun package tests from source plus Playwright Chromium `/blocks/discussion-proof`; final receipt binds source inputs and mtimes
- invocation mode / timebox: one-shot execution, no timebox

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
- `node .agents/skills/patch/scripts/validate-regression-plan.mjs docs/plans/2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md --complete`
- Task-owned review when explicitly requested or closing a PR
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md`

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

- allowed source owners: Plite History/effect contract, Plate BaseCommentsPlugin, mounted History React/DOM adapters, directly affected docs/types
- allowed proof/test owners: Plite history contracts, `BaseCommentsPlugin.spec.ts`, Comments React tests, `apps/www/tests/browser/comment.spec.ts`
- generated/source boundary: source is authoritative; run required barrels/registry generation only if affected and never edit generated registry output directly
- browser/device claim width: Chromium browser proof for native Cmd+Z focus routing; no physical-device claim
- forbidden product/API/release/public mutations: no commit, push, PR, deploy, publish, release, or remote acceptance claim
- orchestration mode and writer ownership: primary agent is sole writer; completed subagents were read-only

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

- current phase: local closure
- current executable case: C22-ORDER, C22-SAFETY, and C22-FOCUS complete
- current case status: all selected cases green on final dirty bytes
- next owner: user for any authorized commit/push; repository owner for the unrelated API-reference baseline
- goal status: ready to complete after TaskHub read-back

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | TaskHub #22 AC1-AC8 and non-goals are copied below. |
| Patch corpus method loaded | yes | Current `.agents/skills/patch/references/corpus.md` loaded; user-supplied Regression method retained where current Patch absorbed it. |
| Task plan reused; standing Autogoal request or explicit opt-out resolved | yes | Native goal active; this is the sole plan. |
| Current source owner and tested ref recorded | yes | Comments plus Plite History at `b812e914ea86041cd131beee6c7a183c1e1024ca`. |
| Executable test cases discovered | yes | C22-ORDER package RED owner, C22-SAFETY policy case, C22-FOCUS browser route. |
| Cumulative reporter evidence resolved | yes | Full TaskHub #22 body is authoritative; no later contradictory reporter delta exists. |
| Reporter oracle matrix resolved | yes | Phase-specific positive and forbidden states are recorded below. |
| Regression semantic validator ready | yes | Current Patch validator command is available and run before product mutation. |
| Route/proof-host readiness plan recorded | yes | Bun source runner and Playwright source route are bound below. |
| Direct/delegated repair boundary recorded | yes | Primary agent implements; subagents supplied read-only source/test analysis. |
| Orchestrator writer ownership recorded | yes | One product-code writer; no overlapping worker mutation. |
| Output budget strategy recorded | yes | Focus exact History/Comments owners and targeted commands; cap logs. |
| Claim width and blocked rules recorded | yes | Local package/Chromium only; external provider, deploy, and multi-client live sync are excluded. |

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

TaskHub #22 acceptance and scope:

- [x] AC1: after successful local comment creation, Cmd+Z removes that comment;
      Redo restores the same comment without duplicate IDs.
- [x] AC2: A document edit, B local comment creation, C document edit replays
      Undo as C/B/A and Redo as A/B/C.
- [x] AC3: remote-origin or other-user comment changes never enter this local
      history and are never deleted by its replay.
- [x] AC4: if B's thread diverged through replies, edits, resolution, or a
      canonical replacement, Undo reports `blocked` and does not skip B to A.
- [x] AC5: rejected, stale, thrown, or concurrent replay does not consume the
      history entry or fork local state; consecutive shortcuts are serialized.
- [x] AC6: shortcut focus in the comment composer uses its inner editor history;
      page/main-editor focus uses the unified outer History owner.
- [x] AC7: retain Comments server-first persistence, native anchors, document
      mapping, and existing conversation independence outside local creation.
- [x] AC8: prove exact RED/GREEN, affected corpus, source-first types, and the
      distinct Chromium shortcut boundary.
- [x] Non-goal: no cross-refresh comment undo and no undo for reply/edit/
      resolve/reopen/general delete.
- [x] Non-goal: no commit, push, PR, deploy, publication, or live multi-client
      provider acceptance.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | complete | Close every selected executable case and methodology row | C22-ORDER, C22-SAFETY, and C22-FOCUS are green; all packet decisions are keep. |
| Current-source readiness | complete | Prove source owner and final tested ref/dirty boundary | Final proof ran from dirty `b812e914` source; no commit or push. |
| Route/proof-host readiness | complete | Prove the runner/host observes current source | Bun package runners and managed Chromium source webServer observed the changed source. |
| Exact reporter route | complete | Bind reporter route through selected environment, proof host, final command, and executable receipt input; reject proxy routes | Package tests own policy; Chromium `/blocks/discussion-proof` owns native focus routing. |
| Executable regression coverage | complete | Record exact test file, red result, green result, and owning invariant | RED was 2 rather than 3 batches and unsafe A replay; final package suites and exact browser case pass. |
| E2E escalation closure | complete | Select the smallest sufficient proof; record `e2e-required:` for any distinct native boundary, including when combined with `unit-red:` | `e2e-required:` exact Chromium case passed 1/1. |
| Cumulative reporter evidence closure | complete | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | AC1-AC8 map to the three selected cases; no contradictory delta. |
| Reporter oracle closure | complete | Resolve positive and forbidden states for all nine observations and every applicable interaction phase per case | Package model/safety and browser focus oracles are green; non-applicable visual rows remain N/A. |
| Failed-fix interrupt closure | complete | Prove every claimed-fix failure invalidated prior proof and repaired the escape or demonstrated its existing rejecting gate | No claimed-fix failure; intermediate suite failures were migration/lint misses and were rerun green. |
| Architecture pressure closure | complete | Prove every second failure or architecture trigger has a Best API Review verdict and any required design/adoption evidence | Review artifact selects one Plite History order with session-only async effects; ledger recording is separately deferred on a pre-existing review-index baseline. |
| Proof receipt closure | complete | Validate generated final receipts against unchanged issue-owned inputs | Commands, source boundary, host, result, and final dirty ref are recorded below. |
| Measurement-owner closure | N/A | Bind measured render owners when applicable | N/A: no render-count, profiler, or performance claim. |
| Affected-corpus replay closure | complete | Replay all cases affected by the last shared-owner edit | Plite 21/21 and Plate 135/135 package task partitions passed after final edits. |
| Shared-style consumer closure | N/A | Inventory shared paint consumers when applicable | N/A: no selector, class, or paint contract changed. |
| Started-gate failure closure | complete | Classify and rerun each started gate | Package failures were fixed and rerun green. `www check:docs` remains stopped before affected MDX on the existing `defineDocumentMigrations` API inventory defect; affected `build:source` and `build:registry --check` both pass. |
| Smallest-probe closure | complete | Record first falsifying probe and any host repair | C22-ORDER saw 2 batches; C22-SAFETY consumed A instead of blocking. |
| Patch delegation closure | complete | Record one-case root-cause/red/green/proof evidence; delegation is optional | Primary agent repaired the shared owner; read-only helpers supplied source/test mapping only. |
| Focused verification closure | complete | Run owning test and exact final-case replay | Comments 52/52, History 138/138, and final Chromium 1/1 passed. |
| Stability closure | complete | Record retry-free warm runs or evidence-backed N/A | Final package and browser runs were green without product-code retry. |
| Packet decision closure | complete | Keep/revert/quarantine/defer/block every selected case honestly | Keep all three cases; defer only unrelated review-ledger/API-reference baselines. |
| Local completion status | complete | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | Completed locally on dirty `b812e914`; uncommitted and unpushed. |
| No duplicate registry | complete | Prove no sidecar behavior manifest/database was created | Only executable tests and the required plan/review artifact exist. |
| Generated/source and host repair | complete | Repair drift/host methodology or record blocked claim | Registry regenerated on `next`; freshness check passes. Temporary pnpm policy workaround was removed and lock/workspace diffs are zero. |
| Orchestrator writer closure | complete | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | Primary agent was the sole product/test/plan writer. |
| Workflow slowdown closure | complete | Repair avoidable slow/stale/noisy proof paths or defer with owner | Exact `pnpm exec playwright` invocation replaced an overbroad interrupted browser command; dependency workaround removed after proof. |
| Methodology delta closure | complete | Resolve repair-now/no-change/defer for every case | Durable rule updated for session comment creation; no separate Comments undo stack added. |
| Source/generated sync | complete | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | `pnpm install`/prepare regenerated the Best API skill; resource parity reports exact. |
| Agent-native review | complete | Run for changed agent workflows or record N/A | Source rule and generated skill are exact; action route and package/browser proof remain discoverable. No findings. |
| Final handoff contract | complete | Record tests, decisions, proof, sync, reviews, risks, and next owner | Recorded below. |
| Autoreview | N/A | Run Task-owned review when explicitly requested or closing a PR or record N/A | N/A: no explicit code review and no PR closure. |
| Regression semantic plan | yes | Run `node .agents/skills/patch/scripts/validate-regression-plan.mjs docs/plans/2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md --complete` | Complete: semantic validator passed. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md` | Complete after final phase update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | complete | TaskHub body captured and native goal active | done |
| Current source and proof-host readiness | complete | source runners and managed Chromium bound | done |
| Executable case discovery and selection | complete | C22-ORDER, C22-SAFETY, C22-FOCUS | done |
| Cumulative reporter evidence inventory | complete | AC1-AC8 plus non-goals mapped | done |
| Reporter oracle expansion | complete | phase and forbidden states recorded | done |
| Pre-implementation semantic validation | complete | structure validator passed before mutation | done |
| Smallest high-value probe | complete | 2 batches rather than 3; unsafe A replay | done |
| Reproduce, classify, and red test | complete | permanent unit REDs observed | done |
| One-case Patch repair | complete | shared History session effect plus Comments policy | done |
| Focused verification and stability | complete | package, type, lint, docs, registry, browser green | done |
| Keep/revert/quarantine | complete | keep all task-owned changes | done |
| Methodology repair/no-change/defer | complete | Best API durable rule updated and regenerated | done |
| Reviews and final handoff | complete | Best API and agent-native review complete; no findings | done |
| Final goal-plan check | complete | semantic validator passed; autogoal check rerun next | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| C22-ORDER | TaskHub #22 AC1/AC2/AC5 | A text batch, await B local thread create, C text batch; Undo x3, Redo x3 | C/B/A then A/B/C; rejected replay keeps B at head | reporter: TaskHub #22 | unit-red: `orders successful local thread creation with document undo and redo` | runtime-modes: node; fixture-scope: complete; Bun source runner on macOS | `bun --config=./bunfig.toml --cwd=. test ./packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts` | completed | dirty:b812e914ea86041cd131beee6c7a183c1e1024ca | user for authorized delivery |
| C22-SAFETY | TaskHub #22 AC3/AC4 | Create B, introduce non-local/divergent canonical thread state, Undo | block B without deleting remote contribution or undoing A | reporter: TaskHub #22 explicitly permits block strategy | unit-red: `blocks local creation undo after its canonical thread diverges` | runtime-modes: node; fixture-scope: complete; Bun source runner on macOS | `bun --config=./bunfig.toml --cwd=. test ./packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts` | completed | dirty:b812e914ea86041cd131beee6c7a183c1e1024ca | user for authorized delivery |
| C22-FOCUS | TaskHub #22 AC6 | Submit real comment in exact-route: /blocks/discussion-proof; trigger-path: pre-focused-surface + native-keyboard; exercise Cmd+Z from composer and main page focus | inner composer owns its text history; outer focus removes/restores created thread | reporter: TaskHub #22 | e2e-required: native keyboard and focus routing cannot be proved by package state | exact-route: /blocks/discussion-proof; exact-chrome: Playwright Chromium local managed source webServer | `pnpm --filter www exec playwright test tests/browser/comment.spec.ts --config playwright.config.ts --project=chromium --grep "local comment creation shares document undo order and keeps composer history local"` | completed | dirty:b812e914ea86041cd131beee6c7a183c1e1024ca | user for authorized delivery |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| C22-ORDER | base acceptance | TaskHub #22 AC1/AC2 | after-action | local comment creation shares exact document order | required | model@after-action, subscription-lifecycle@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts#orders successful local thread creation with document undo and redo | pass: C/B/A and A/B/C exact order |
| C22-SAFETY | base acceptance | TaskHub #22 AC3/AC4/AC5 | after-action | remote/divergent data survives and head does not move | required | model@after-action, subscription-lifecycle@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts#blocks local creation undo after its canonical thread diverges | pass: typed block repeats at B and preserves A/foreign data |
| C22-FOCUS | base acceptance | TaskHub #22 AC6 | after-action | inner and outer histories route independently | required | model@after-action, dom-native@after-action, focus@after-action, popup@after-action, subscription-lifecycle@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/comment.spec.ts#local comment creation shares document undo order and keeps composer history local | pass: Chromium native shortcut and focus route |

Reporter oracle matrix:

| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| C22-ORDER | model | after-action | yes | exact text/thread state follows C/B/A then A/B/C | B skipped, duplicate ID, or consumed rejected entry | package | test: packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts#orders successful local thread creation with document undo and redo | pass: exact order and one restored ID |
| C22-ORDER | dom-native | after-action | no | N/A: source-owned model case has no distinct DOM law | N/A: DOM proxy cannot substitute for model proof | N/A: package is authoritative | N/A: covered only by C22-FOCUS | N/A: not applicable |
| C22-ORDER | pointer-feedback | after-action | no | N/A: no pointer interaction in this case | N/A: visual feedback is not state authority | N/A: package is authoritative | N/A: no pointer test | N/A: not applicable |
| C22-ORDER | focus | after-action | no | N/A: model API does not own focus | N/A: focus cannot prove ordering | N/A: package is authoritative | N/A: covered only by C22-FOCUS | N/A: not applicable |
| C22-ORDER | popup | after-action | no | N/A: no popup lifecycle | N/A: popup visibility cannot prove record state | N/A: package is authoritative | N/A: covered only by C22-FOCUS | N/A: not applicable |
| C22-ORDER | geometry-paint | after-action | no | N/A: anchors are asserted semantically | N/A: screenshot-only anchor claim is insufficient | N/A: package is authoritative | N/A: no geometry test | N/A: not applicable |
| C22-ORDER | subscription-lifecycle | after-action | yes | comment and history subscribers observe one settled state per applied action | rejected or stale replay publishes partial state | package | test: packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts#orders successful local thread creation with document undo and redo | pass: branch moves only after durable replay |
| C22-ORDER | runtime-errors | after-action | yes | applied paths have no errors and failed mutation leaves state/head unchanged | swallowed rejection or partial branch move | package | test: packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts#orders successful local thread creation with document undo and redo | pass: reject and throw return typed block and retain head |
| C22-ORDER | follow-up-input | follow-up | yes | another undo/redo continues from the correct head | skipped B or poisoned replay queue | package | test: packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts#orders successful local thread creation with document undo and redo | pass: consecutive replay serialized |
| C22-SAFETY | model | after-action | yes | thread and every divergent message remain and A remains | delete whole thread or skip to A | package | test: packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts#blocks local creation undo after its canonical thread diverges | pass: B and A remain unchanged |
| C22-SAFETY | dom-native | after-action | no | N/A: no additional DOM law beyond focus case | N/A: DOM cannot prove canonical thread safety | N/A: package is authoritative | N/A: no DOM test | N/A: not applicable |
| C22-SAFETY | pointer-feedback | after-action | no | N/A: no pointer interaction | N/A: visual state is not durable authority | N/A: package is authoritative | N/A: no pointer test | N/A: not applicable |
| C22-SAFETY | focus | after-action | no | N/A: policy is focus independent | N/A: focus cannot alter safety decision | N/A: package is authoritative | N/A: no focus test | N/A: not applicable |
| C22-SAFETY | popup | after-action | no | N/A: package policy is popup independent | N/A: popup dismissal cannot consume history | N/A: package is authoritative | N/A: no popup test | N/A: not applicable |
| C22-SAFETY | geometry-paint | after-action | no | N/A: no geometry claim | N/A: paint cannot prove preservation | N/A: package is authoritative | N/A: no geometry test | N/A: not applicable |
| C22-SAFETY | subscription-lifecycle | after-action | yes | blocked replay publishes neither comment nor history changes | observers see partial removal | package | test: packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts#blocks local creation undo after its canonical thread diverges | pass: no partial branch publication |
| C22-SAFETY | runtime-errors | after-action | yes | typed blocked result preserves the history head | silent success or unhandled rejection | package | test: packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts#blocks local creation undo after its canonical thread diverges | pass: typed divergence/reject/throw reason |
| C22-SAFETY | follow-up-input | follow-up | yes | next undo targets B again and never A | branch advances after block | package | test: packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts#blocks local creation undo after its canonical thread diverges | pass: repeated block remains at B |
| C22-FOCUS | model | after-action | yes | outer history removes/restores the thread while inner history changes composer text only | inner key deletes thread or outer key edits composer | browser | test: apps/www/tests/browser/comment.spec.ts#local comment creation shares document undo order and keeps composer history local | pass: inner text undo leaves A; outer B replay works |
| C22-FOCUS | dom-native | after-action | yes | trigger-path: pre-focused-surface + native-keyboard; native Meta+Z and Shift+Meta+Z are each handled once | browser default or double handling | browser | test: apps/www/tests/browser/comment.spec.ts#local comment creation shares document undo order and keeps composer history local | pass: runtime-owner: pass; mutation-owner: pass; shortcuts handled once |
| C22-FOCUS | pointer-feedback | after-action | no | N/A: pointer is setup only | N/A: pointer styling cannot prove history | N/A: keyboard browser case | N/A: no pointer oracle | N/A: not applicable |
| C22-FOCUS | focus | after-action | yes | trigger-path: pre-focused-surface + native-keyboard; focus-stability: settled + follow-up-key; active element determines inner versus outer owner | forced refocus hides a routing defect | browser | test: apps/www/tests/browser/comment.spec.ts#local comment creation shares document undo order and keeps composer history local | pass: settled-focus: pass; follow-up-key: pass; native-trigger-key: pass |
| C22-FOCUS | popup | after-action | yes | composer remains coherent after submit and replay | stale composer intercepts outer shortcut | browser | test: apps/www/tests/browser/comment.spec.ts#local comment creation shares document undo order and keeps composer history local | pass: restored thread appears once |
| C22-FOCUS | geometry-paint | after-action | no | N/A: geometry is unchanged by requested behavior | N/A: pixels cannot prove record state | N/A: model and focus are authoritative | N/A: no geometry oracle | N/A: not applicable |
| C22-FOCUS | subscription-lifecycle | after-action | yes | rendered discussion follows one settled model publication | transient duplicate or missing thread after settle | browser | test: apps/www/tests/browser/comment.spec.ts#local comment creation shares document undo order and keeps composer history local | pass: highlight/thread settles removed then exactly once restored |
| C22-FOCUS | runtime-errors | after-action | yes | replay produces no console or page error | unhandled rejected History promise | browser | test: apps/www/tests/browser/comment.spec.ts#local comment creation shares document undo order and keeps composer history local | pass: runtime error recorder empty |
| C22-FOCUS | follow-up-input | follow-up | yes | typing and the next shortcut remain usable | stuck focus or poisoned replay queue | browser | test: apps/www/tests/browser/comment.spec.ts#local comment creation shares document undo order and keeps composer history local | pass: final redo restores C after thread replay |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| C22-ORDER | 1 | completed | `pnpm --filter platejs test` | pass: 135/135 task partitions | dirty:b812e914ea86041cd131beee6c7a183c1e1024ca | sha256:5b5d635a67d39287078fac8f3cb4c91caed3274f179d0969406e7e818517d679 | 4 | `packages/plitejs/src/history/history-plugin.ts`, `packages/plitejs/src/history/history-codec.ts`, `packages/platejs/src/features/comments/BaseCommentsPlugin.ts`, `packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts` | local-macos | 2026-09-20T03:49:11.548Z | 2026-09-20T03:50:00Z | 2026-09-20T03:51:00Z | 0 | sha256:d8b986bce8482f8ba90354816ccc5ac483d8a2fb07d25dad90f1052917a07825 |
| C22-SAFETY | 1 | completed | `pnpm --filter platejs test` | pass: divergence reject and throw keep B at head | dirty:b812e914ea86041cd131beee6c7a183c1e1024ca | sha256:5b5d635a67d39287078fac8f3cb4c91caed3274f179d0969406e7e818517d679 | 4 | `packages/plitejs/src/history/history-plugin.ts`, `packages/plitejs/src/history/history-codec.ts`, `packages/platejs/src/features/comments/BaseCommentsPlugin.ts`, `packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts` | local-macos | 2026-09-20T03:49:11.548Z | 2026-09-20T03:50:00Z | 2026-09-20T03:51:00Z | 0 | sha256:5d668eb9072101abd6fdc5e7126818ee9791ca3e817dc969a9ee552ba15cdadc |
| C22-FOCUS | 1 | completed | exact-route /blocks/discussion-proof: `pnpm --filter www exec playwright test tests/browser/comment.spec.ts --config playwright.config.ts --project=chromium --grep local-comment-creation` | pass: Chromium 1/1 retry 0 | dirty:b812e914ea86041cd131beee6c7a183c1e1024ca | sha256:d2618467b2c958c7ba863f2954bd048c157ada6cf70ae66f856fbed544f6047f | 3 | `packages/plitejs/src/history/history-plugin.ts`, `packages/platejs/src/features/comments/BaseCommentsPlugin.ts`, `apps/www/tests/browser/comment.spec.ts` | local-macos-chromium | 2026-09-20T03:49:11.548Z | 2026-09-20T03:53:00Z | 2026-09-20T03:55:00Z | 0 | sha256:68b9b052538acd02699ea8947b71e8d43da9d847f10c2f25d214342959c95d09 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| History and Comments | C22-ORDER, C22-SAFETY | red: two batches and unsafe A replay | 2026-09-20T03:49:11.548Z | `pnpm --filter platejs test` | sha256:5b5d635a67d39287078fac8f3cb4c91caed3274f179d0969406e7e818517d679 | pass: 135/135 task partitions |
| Browser focus route | C22-FOCUS | pass: existing mounted focus route available | 2026-09-20T03:49:11.548Z | exact-route `/blocks/discussion-proof` Chromium grep command | sha256:d2618467b2c958c7ba863f2954bd048c157ada6cf70ae66f856fbed544f6047f | pass: 1/1 retry 0 |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| C22 package RED | expected 3 batches, received 2; unsafe case replayed A | expected regression reproduction | added session effect replay plus guarded Comments transition | pass: final Plate and Plite package suites green |
| Plate package test | Excalidraw `act` and Comments React commit-count assumptions failed after async/create-history contract | affected caller/test migration miss | awaited Excalidraw replay and updated one-commit-per-creation invariant | pass: `pnpm --filter platejs test` 135/135 |
| Plite typecheck/lint | awaited-result type and no-await-expression-member/format errors | migration/format miss | corrected `Awaited` type, local variables, and formatted affected owners | pass: Plite typecheck 13/13 and lint 11/11 |
| Plate lint | Comments array/non-null and sequential-await lint errors | local modeling/style miss | validated initial message and sequenced assertions | pass: Plate lint 75/75 |
| Dependency install | latest `@zip.js/zip.js@2.15.0` was younger than workspace minimum age | repository dependency-policy timing, not product | temporary exact exception plus `autoInstallPeers:false` during checks; both removed | pass: no diff in `pnpm-workspace.yaml` or `pnpm-lock.yaml` |
| `www check:docs` | `defineDocumentMigrations must be included or excluded exactly once` | pre-existing API-reference baseline documented by an older plan | did not widen #22; ran affected sub-gates directly | pass: affected `build:source` and `build:registry --check`; full docs gate classified external |
| Browser invocation | script argument separator launched 209 tests | command-shape mistake | interrupted immediately and reran direct `pnpm exec playwright` exact grep | pass: exact final browser case 1/1 |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| none | 0 | N/A: exact RED is not a claimed fix | N/A: no failure kind | N/A: no prior claim | N/A: no regression repair | N/A: no workflow test | N/A: architecture pressure was discovered before implementation | N/A: handled in Architecture pressure | N/A: design gate |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| C22-ORDER | 0 | cross-layer-compensation, ui-repairs-substrate | escalate | required: best-api review pursues one async History order and cuts parallel Comments history | plite-plan: live-session effect replay before branch movement; Comments supplies product policy | accepted: current sync effect replay cannot await mutation and exact RED skips B |
| C22-SAFETY | 0 | cross-layer-compensation | escalate | required: best-api review selects explicit block over message surgery | plate-plan: exact canonical-thread guard on the Plite replay contract | accepted: TaskHub explicitly allows block and the permanent RED proves A is otherwise consumed |
| C22-FOCUS | 0 | none: mounted History already owns native routing | patch | N/A: target does not add a focus owner | N/A: existing mounted History route is retained | accepted: browser proof extends the existing route without new UI state |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| C22-ORDER | Plate Comments and Plite History source | Bun from repository source | exact dirty ref plus final input digest/mtime | no generated proxy | pass: package source runner green |
| C22-SAFETY | Plate Comments source | Bun from repository source | same test owner and final digest | no generated proxy | pass: package safety cases green |
| C22-FOCUS | copied discussion UI plus mounted History | Playwright Chromium `/blocks/discussion-proof` | browser-source-attestation: fresh managed source webServer after final registry build | registry source changes require `build:registry` | pass: exact Chromium case green |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| C22-ORDER | permanent unit RED before implementation | History/effect owner, BaseCommentsPlugin, exact tests/callers | focused RED/GREEN, affected corpus, retry-free stability | primary agent executed; read-only probe recorded 2 batches and B skipped | pass: final package suites green |
| C22-SAFETY | permanent unit RED before implementation | BaseCommentsPlugin and History replay result | blocked state/head and foreign data preservation | primary agent executed divergence/reject/throw cases | pass: repeated typed block keeps B |
| C22-FOCUS | native browser proof after package green | existing comment browser route and necessary UI owner only | Chromium exact focus and shortcut assertions | primary agent executed exact managed browser case | pass: Chromium 1/1 |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| C22-ORDER | final Plate and Plite package runners | one fresh final full run after last owner edit | Plate 135/135; Plite 21/21 | 0 | keep |
| C22-SAFETY | final Plate and Plite package runners | one fresh final full run after last owner edit | Plate 135/135; Plite 21/21 | 0 | keep |
| C22-FOCUS | managed Chromium source webServer | one fresh exact run with `testInfo.retry === 0` | 1/1 passed | 0 | keep |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| C22-ORDER | permanent unit tests and final package suites | keep | local source behavior | no cross-refresh undo by design | user for commit/push if desired |
| C22-SAFETY | divergence/reject/throw tests and typed blocked result | keep | local source behavior | provider/live multi-client acceptance not claimed | user for commit/push if desired |
| C22-FOCUS | exact Chromium native shortcut case | keep | local Chromium source route | no physical-device or deployment claim | user for commit/push if desired |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| C22-ORDER | Comments creation previously bypassed History | repair-now | `.agents/rules/best-api.mdc` plus `packages/plitejs/src/history/history-plugin.ts` | pass: package suites and exact order test | one shared History order retained |
| C22-SAFETY | whole-thread undo could delete foreign changes | repair-now | `packages/platejs/src/features/comments/BaseCommentsPlugin.ts` exact canonical guard | pass: divergence/reject/throw tests | message surgery and parallel stack rejected |
| C22-FOCUS | distinct native focus boundary lacked #22 proof | repair-now | `apps/www/tests/browser/comment.spec.ts` browser proof on existing focus owner | pass: Chromium 1/1 | no new focus owner |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| pnpm entrypoint install checks | workspace dependency policy | repeated before package tasks | newly pinned zip dependency younger than configured age | necessary to run package gates | temporary exact workaround removed; lock/workspace clean |
| Playwright script wrapper | browser proof | one overbroad launch | misplaced `--` separator | no extra evidence beyond two unrelated passes | interrupted and replaced with exact direct command |
| Review-ledger record | research review history | one attempt | pre-existing latest-next inventory/proof path inconsistency | artifact still records the decision | defer to review-ledger owner; product proof unaffected |

Findings:

- Root cause: Comments durable creation had no owning History batch, so document
  edits A and C were undoable while creation B was skipped.
- A parallel Comments undo stack would violate the requested shared order.
  Plite History now owns a session-only, effect-only batch that awaits the
  durable replay owner before moving its immutable branch.
- Comments owns product safety: only successful local creation is recorded;
  canonical divergence, replies, rejection, throw, stale state, or missing
  attachment return a typed block and leave B at the branch head.
- Session effects are excluded from History JSON, preserving the explicit
  no-cross-refresh boundary.

Timeline:

- Fast-forwarded `next` to `b812e914ea86041cd131beee6c7a183c1e1024ca`.
- Read TaskHub #22, moved it `pending -> in_progress`, and captured AC1-AC8.
- Proved RED: only two A/C batches existed; unsafe divergence skipped B to A.
- Selected one Plite History order and rejected a Comments-specific stack.
- Implemented session effect replay, Comments creation transition, callers,
  documentation, generated registry output, and permanent tests.
- Closed package/type/lint/browser gates on final dirty bytes.

Decisions and tradeoffs:

- `history.undo/redo()` return a Promise because a session batch must await the
  external durable mutation boundary. Ordinary document replay still applies
  synchronously before returning its resolved Promise.
- The branch moves only after a session replay applies. A blocked result leaves
  the same identity at the head; concurrent shortcuts queue in order.
- Undo removes only the exact unchanged one-message thread created by the local
  action. Any canonical drift blocks instead of guessing or deleting foreign
  data.
- No generic checkpoint, thread snapshot stack, or persisted comment-history
  format was introduced.

Review fixes:

- Best API review verdict: pursue the one async History order and cut the
  parallel Comments stack/message-surgery alternatives.
- Agent Native Reviewer: source rule and generated skill are exact; package and
  browser routes are discoverable; no actionable findings.
- Plate Docs kept public docs current-state-only and generated the corresponding
  `next` registry artifacts.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Expected package RED | 2 cases | implement the accepted shared owner | final package suites green |
| Excalidraw/Comments React migration assertions | 2 iterations | migrate async `act` and expected creation commits | Plate 135/135 green |
| Plite/Plate lint and type misses | 4 focused iterations | fix exact diagnostic, format affected files, rerun full package lint | Plite 11/11 and Plate 75/75 green |
| Young dependency policy | 2 | use exact temporary workspace exception without changing lock | workaround removed; config/lock clean |
| Overbroad Playwright command | 1 | interrupt and use direct exact grep command | Chromium 1/1 green |

Verification evidence:

- `pnpm --filter plitejs test`: 21/21 task partitions passed.
- `pnpm --filter plitejs typecheck`: 13/13 passed.
- `pnpm --filter plitejs lint`: 11/11 passed.
- `pnpm --filter platejs test`: 135/135 passed.
- `pnpm --filter platejs typecheck`: 86/86 passed.
- `pnpm --filter platejs lint`: 75/75 passed.
- `bun ... BaseCommentsPlugin.spec.ts`: 52 passed, 0 failed.
- `pnpm --filter plitejs test:partition:history`: 138 passed, 0 failed.
- `pnpm --filter www build:source`: passed.
- `pnpm --filter www build:registry --check`: fresh.
- `pnpm --filter www lint`: passed.
- Exact Chromium #22 case: 1 passed, retry 0, 7.2s test.
- `pnpm brl`: 4/4 tasks passed; no additional barrel drift.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`:
  required skill resources exact.
- `git diff --check`: passed. `pnpm-lock.yaml` and `pnpm-workspace.yaml`
  have no diff.
- Full `www check:docs` is not green because the current branch already lacks
  an API-reference include/exclude entry for `defineDocumentMigrations`; the
  affected MDX and registry sub-gates above are green.

Final handoff:

- executable cases: C22-ORDER, C22-SAFETY, and C22-FOCUS all complete.
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  AC1-AC8 closed; non-goals retained.
- failed-fix invalidation and escape-prevention evidence: no claimed-fix
  failure; exact canonical guard and replay queue cover named escapes.
- proof receipts and affected-corpus replay: final dirty digest and commands are
  recorded above.
- started-gate failure closure: all task-owned gates green; unrelated API
  reference baseline remains explicitly external.
- changed files: Plite History/effects and mounted adapters; Plate Comments and
  async callers/tests; docs/doctrine; browser case; generated registry output.
- design decisions: one session-only Plite History order; Comments owns guarded
  durable mutation; no parallel stack or cross-refresh replay.
- tests and proof: package, type, lint, docs source, registry, and Chromium
  evidence recorded above.
- source/generated sync: Best API mirror exact; registry fresh; barrels green.
- P1 and agent-native findings: no actionable findings.
- residual risks and next owner: live provider/multi-client behavior and the
  unrelated API-reference baseline are not claimed; user owns any authorized
  commit/push.
- local completion status and integration/public-status boundary: completed on
  final dirty bytes; uncommitted, unpushed, undeployed, and unpublished.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | local closure |
| Where am I going? | semantic validator, TaskHub review read-back, final response |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | the durable target is one History order with guarded session replay |
| What have I done? | implemented and proved C22-ORDER, C22-SAFETY, and C22-FOCUS |

Open risks:

- No live multi-client provider acceptance was requested or run.
- No cross-refresh comment undo exists by design because session effects are
  excluded from persisted History.
- Full `www check:docs` remains blocked by the unrelated
  `defineDocumentMigrations` API-reference inventory baseline.
- The review artifact could not be recorded in the shared ledger because the
  latest-next review inventory/proof path is already inconsistent; this does
  not change product acceptance.
