# Plite long IME history atomicity regression

Objective:
Close Plite long-IME history atomicity; done when the expanded marked-selection
undo/redo case passes 5 retry-free runs, any reproduced defect is fixed, and
Regression gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-22-plite-long-ime-history-atomicity-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:
- target bug / surface / corpus: long IME composition history atomicity for an
  expanded selection spanning marked text
- lane and current source owner: Plite React editable composition/history input
  path, exercised through the `apps/plite` browser proof host
- selected executable test cases: `PLITE-IME-HISTORY-001` only
- tested ref or dirty-state boundary: base ref
  `0231a088c40911aa9a3dc41978d00a6fd41ff76f`; final issue-owned fingerprints
  required because the checkout is shared and may contain local edits
- route / proof host and freshness method: source-built `apps/plite` Playwright
  host; the exact focused command must start or refresh its own host
- invocation mode / timebox: one-shot execution; no timebox

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
- Every case has positive and forbidden-state assertions for model, DOM/native,
  focus, popup, geometry/paint, runtime errors, and follow-up input, with an N/A
  reason for observations that do not apply.
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
- `PLITE-IME-HISTORY-001` exercises an expanded marked selection, remains in
  composition for more than one second, uses the alternate terminal-event
  ordering, then proves exact value and selection restoration after one undo
  and exact composed state after one redo.
- If the new test is already green, close the hypothesis without product-source
  changes. If it is red, repair only the proven owner and replay it five times
  without retry.

Verification surface:
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-22-plite-long-ime-history-atomicity-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-plite-long-ime-history-atomicity-regression.md`

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
- Retain the current publication wording. Do not create a P0 blocker, new proof
  framework, composition redesign, release hold, or wider browser-support
  promise.
- Do not preselect epoch metadata or history grouping as the cause. Architecture
  work requires a reproducible failure and source classification first.
- Effective-transport artifact enrichment is optional and out of this selected
  case unless the executable failure proves it necessary for the oracle.

Boundaries:
- allowed source owners: only the literal Plite React composition/history owner
  proven by a red case; no source edit is authorized for an already-green case
- allowed proof/test owners: the existing `apps/plite` browser test and its
  existing browser helper only if the case cannot be expressed without a
  narrowly scoped helper repair
- generated/source boundary: source test and helper files only; no generated or
  template output
- browser/device claim width: desktop Playwright Chromium browser proof only;
  no raw-device, Firefox, WebKit, or OS-IME claim
- forbidden product/API/release/public mutations: no public API, docs wording,
  release state, GitHub mutation, commit, push, or PR
- orchestration mode and writer ownership: one writer in the root thread;
  subagents are not authorized, and any Patch work runs serially after red proof

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
- current phase: completed local handoff
- current executable case: PLITE-IME-HISTORY-001
- current case status: completed
- next owner: none; integration remains separately authorized
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
| Prompt requirements captured | yes | Decision rows 1-3 are captured in the threshold, constraints, selected case, and non-goals; only row 2 is mandatory execution. |
| Regression methodology loaded | yes | Read `.agents/skills/regression/SKILL.md` and `references/methodology.md` completely before source work. |
| Active goal checked or created | yes | No prior goal; created the active goal for this plan. |
| Current source owner and tested ref recorded | yes | Base ref `0231a088c40911aa9a3dc41978d00a6fd41ff76f`; final owner is the private React composition lifecycle plus existing History merge annotation. |
| Executable test cases discovered | yes | One case selected from the correction: `PLITE-IME-HISTORY-001`; exact existing file/anchor will be resolved before validation. |
| Reporter oracle matrix resolved | yes | Initial seven-row matrix below records applicable assertions and N/A reasons; exact anchor/result remains pre-proof. |
| Regression semantic validator ready | yes | `.agents/skills/regression/scripts/validate-regression-plan.mjs` exists and will run before implementation. |
| Route/proof-host readiness plan recorded | yes | Existing source-built `apps/plite` focused Playwright lane; runner and freshness command will be read from current source. |
| Patch delegation boundary recorded | yes | No Patch before red. If red, touch only the classified Plite React owner plus the selected regression; no API/docs/release work. |
| Orchestrator writer ownership recorded | yes | N/A: root executes serially; no subagents or concurrent writer/host. |
| Output budget strategy recorded | yes | Exact-file reads and focused `rg`; exclude generated/build/log trees and cap command output. |
| Claim width and blocked rules recorded | yes | Desktop Chromium local proof only; block only if the exact host cannot express the event order and no safe helper repair exists. |

Work Checklist:
- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work:
      current publication stays, only the long marked-selection case is
      mandatory, artifact enrichment stays optional, and architecture work
      requires a red result.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Generated/source drift and host readiness are repaired or block the claim:
      the focused runner rebuilt the proof app before the pre-edit baseline and
      reused only its matching fresh export afterward.
- [x] Every selected case has a stable ID, source reference, owner, setup,
      action, expected outcome, executable test path/command, tested ref, and
      required stability.
- [x] Every selected case has one reporter-oracle row for model, DOM/native,
      focus, popup, geometry/paint, runtime errors, and follow-up input.
- [x] Every applicable oracle row has a positive assertion, a distinct forbidden
      state, an executable layer/anchor, and an exact result; every inapplicable
      row has N/A reasons.
- [x] The smallest falsifying executable probe ran before scaling: the one exact
      focused Chromium row failed on the first undo assertion.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [x] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [x] Regression delegated only one normalized case at a time to Patch.
- [x] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [x] Focused green proof and exact final fresh-host replay passed.
- [x] Final proof ran through `capture-proof-receipt.mjs`; its ref, input digest,
      host, timestamps, retry count, and receipt ID validate.
- [x] Required retry-free stability runs passed with no retry.
- [x] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification; N/A because no stability run
      failed after cached reuse was rejected and the five executions restarted.
- [x] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause;
      N/A because this case makes no compositor or pixel claim.
- [x] Every blocking pixel classifier passes a known-positive and known-negative
      control through the same capture path; a failed control invalidates prior
      results and freezes product edits until the proof helper is repaired; N/A
      because no pixel classifier participates.
- [x] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
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
- [x] Output budget discipline was followed after the initial broad source
      search was replaced by exact-file reads.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | completed: PLITE-IME-HISTORY-001 is kept and completed; its repair-now row is proved. |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | completed: dirty:0231a088c40911aa9a3dc41978d00a6fd41ff76f plus issue-owned hashes in Final handoff. |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | completed: forced source-built Chromium receipt passed after the latest input mtime. |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | completed: the richtext row failed before the fix and passes with exact undo/redo state. |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all seven observation rows per case | completed: five applicable rows pass and popup/geometry rows have exact N/A reasons. |
| Failed-fix interrupt closure | completed | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | Attempt 1 was revoked; the new structural-history package diagnostic failed at exact undo restoration before attempt 2. |
| Architecture pressure closure | yes | Prove each architecture trigger has Best API and layer-plan evidence | accepted: Best API and plite-plan keep the fact private and History generic. |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | completed: exact and combined receipts are recorded below with retries 0. |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | completed: 3 passed in two bounded batches after the final product edit. |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed on final bytes | completed: exact case, failed candidate, proof matcher, source-drift interruptions, and huge-document timeout all have passing final reruns. |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | completed: one exact Chromium row first exposed split undo history. |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | completed: one serial Patch packet returned the private composition-history repair and proof. |
| Focused verification closure | yes | Run owning test and exact final-case replay | completed: DOM 12/12, React 51/51, typecheck 6/6, exact browser receipt pass. |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | completed: five forced executions passed; retries 0. |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | completed: keep PLITE-IME-HISTORY-001. |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record integration state separately | completed: local, uncommitted, and unpushed on dirty base ref. |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | completed: only the executable tests and transient plan were added/updated. |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | completed: forced runner rebuilt/fingerprinted inputs; unrelated writers were serialized before the final strict pass. |
| Orchestrator writer closure | N/A: no orchestrator | Prove one shared-state writer and serialized overlapping owners/hosts | completed: root was the sole task writer; external root tests finished before strict proof resumed. |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | completed: cached stability was rejected, the rule now forbids it, and the corpus path typo was corrected. |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | completed: repair-now updated `.agents/rules/regression.mdc` with executable contract proof. |
| Source/generated sync | yes | Run `pnpm install` and parity audit after agent-source changes | completed: `pnpm install` and `sync-resources.mjs --check` passed. |
| Agent-native review | yes | Review the changed Regression action route/source/mirror/proof chain | pass: the source rule, generated mirror, command, and contract test form a repeatable agent route. |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | completed in Final handoff below. |
| Autoreview | yes | Run P1 autoreview for non-trivial implementation changes | pass: invocation 3 accepted the private WeakSet repair with no P0/P1 finding. |
| Regression semantic plan | yes | Run the complete semantic validator | completed: final command passes after this evidence update. |
| Goal plan complete | yes | Run the Autogoal structural validator | completed: final command passes after this evidence update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | Active goal plus exact request/non-goal extraction in this plan | source/host readiness |
| Current source and proof-host readiness | completed | Source-built runner rebuilt the route; literal composition/history owners traced | discover executable cases |
| Executable case discovery and selection | completed | Exact richtext test and focused Chromium command selected | smallest probe |
| Reporter oracle expansion | completed | Seven observations resolved against the exact new test | semantic validation |
| Pre-implementation semantic validation | completed | `validate-regression-plan.mjs` reported `Regression plan: structurally valid.` after exact red evidence and architecture rows were filled | Patch |
| Smallest high-value probe | completed | Exact focused row failed on one-undo value restoration | reproduce/classify |
| Reproduce, classify, and red test | completed | One undo left `This is , ` instead of the marked selection | Patch after architecture decision |
| One-case Patch delegation | completed | Attempt 2 merges the final structural composition mutation with its predelete while keeping the marker in module-private React storage | focused proof |
| Focused verification and stability | completed | DOM 12/12, React 51/51, typecheck 6/6, five forced browser runs, and affected corpus 3/3 | packet decision |
| Keep/revert/quarantine | completed | Kept the executable regression and private repair | methodology delta |
| Methodology repair/no-change/defer | completed | repair-now forbids cached result reuse from counting as stability | reviews |
| Reviews and final handoff | completed | Agent-native review passed; final P1 invocation found no P0/P1 issue | goal-plan check |
| Final goal-plan check | completed | Semantic and structural completion validators pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| PLITE-IME-HISTORY-001 | Corrected decision row 2 in the attached request; existing collapsed `imeCompositionUndo` is adjacent evidence only | On `plite/richtext`, select `editable rich text` across plain/bold/plain leaves; start/update synthetic composition, wait 1,100 ms while `activeIntent=composition`, dispatch `compositionend` before terminal `insertFromComposition`, then undo once and redo once | One undo restores the exact pre-composition document value and expanded selection; one redo restores the exact composed document and post-composition selection | Source-built `apps/plite`, desktop Playwright Chromium on macOS, synthetic terminal order explicitly controlled, retries 0; 5 retry-free final runs | `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts`; `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/richtext.test.ts -g "keeps long expanded marked composition atomic when compositionend precedes final input"` | completed | dirty:0231a088c40911aa9a3dc41978d00a6fd41ff76f | none: local handoff complete |

Reporter oracle matrix:
| Case ID | Observation | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|---------|--------------------|-----------------|-------------|-------------------|--------|
| PLITE-IME-HISTORY-001 | model | yes | After one undo, document value and selection equal the pre-composition snapshot; after one redo, document value and selection equal the composed snapshot | Split history groups, lost marks, stale replacement text, or a selection unequal to either exact snapshot | browser Playwright editor-handle state assertions | test: apps/plite/tests/plite-browser/donor/examples/richtext.test.ts#keeps long expanded marked composition atomic when compositionend precedes final input | pass: exact pre-composition and composed model value plus selection restore after one undo and redo. |
| PLITE-IME-HISTORY-001 | dom-native | yes | The expanded DOM selection is projected before composition and the composed text is rendered after terminal events | Collapsed pre-composition DOM selection, duplicate composition text, or stale selected text | browser Playwright DOM/native-selection assertions | test: apps/plite/tests/plite-browser/donor/examples/richtext.test.ts#keeps long expanded marked composition atomic when compositionend precedes final input | pass: expanded DOM selection and first-block text match at precomposition, composed, undo, and redo states. |
| PLITE-IME-HISTORY-001 | focus | yes | The editable owns focus through setup, terminal events, undo, and redo | `document.body` or another element owns focus during an asserted state | browser Playwright active-element assertion | test: apps/plite/tests/plite-browser/donor/examples/richtext.test.ts#keeps long expanded marked composition atomic when compositionend precedes final input | pass: editor owns focus after terminal commit and redo; selection projection passes after undo. |
| PLITE-IME-HISTORY-001 | popup | no | N/A: no popup or overlay participates in composition/history | N/A: the selected route action opens no popup | N/A: no popup proof needed | N/A: no popup behavior in this case | N/A: no popup behavior in the selected case |
| PLITE-IME-HISTORY-001 | geometry-paint | no | N/A: no geometry or pixel claim is made | N/A: no painted intermediate state is part of the history invariant | N/A: model/DOM text and selection are sufficient | N/A: no geometry or screenshot oracle | N/A: no geometry or paint claim in the selected case |
| PLITE-IME-HISTORY-001 | runtime-errors | yes | The exact flow completes without page, console, or unhandled runtime errors | Any page error, error overlay, or unhandled exception | browser Playwright route/runtime-error recorder | test: apps/plite/tests/plite-browser/donor/examples/richtext.test.ts#keeps long expanded marked composition atomic when compositionend precedes final input | pass: runtime error recorder remained empty through terminal input, undo, and redo. |
| PLITE-IME-HISTORY-001 | follow-up-input | yes | Redo restores the exact composed value and selection after the undo | Redo is a no-op, duplicates text, loses marks, or restores the wrong selection | browser Playwright editor-handle redo plus exact state assertions | test: apps/plite/tests/plite-browser/donor/examples/richtext.test.ts#keeps long expanded marked composition atomic when compositionend precedes final input | pass: one redo restores exact composed value, collapsed composed selection, DOM text, and focus. |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| PLITE-IME-HISTORY-001 | 2 | completed | `env PLITE_BROWSER_FORCE_PROOF=1 pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/richtext.test.ts --grep "keeps long expanded marked composition atomic when compositionend precedes final input"` | pass: exit 0 in 3617ms | dirty:0231a088c40911aa9a3dc41978d00a6fd41ff76f | sha256:6bc3321121e33bc5cf02088dbc763b5e5ae9877e6e5522a31835f9253b695bd6 | 27 | apps/plite/package.json,apps/plite/playwright.config.ts,apps/plite/scripts/build-app-if-stale.mjs,apps/plite/scripts/build-browser-if-stale.mjs,apps/plite/scripts/plite-browser-runner.mjs,apps/plite/scripts/plite-proof-inputs.mjs,apps/plite/scripts/run-plite-browser.mjs,apps/plite/tests/plite-browser/donor/examples/richtext.test.ts,apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx,apps/www/src/app/(app)/examples/plite/plite-example-data.ts,apps/www/src/app/(app)/examples/plite/plite-example-loaders.tsx,apps/www/src/app/(app)/examples/plite/plite-example-registry.ts,packages/browser/src/playwright/index.ts,packages/browser/src/playwright/runtime-errors.ts,packages/browser/src/playwright/selection-contract.ts,packages/browser/src/playwright/types.ts,packages/plite-dom/src/plugin/dom-input-runtime.ts,packages/plite-dom/test/dom-root-runtime.test.ts,packages/plite-history/src/history-extension.ts,packages/plite-history/src/history-merge-policy.ts,packages/plite-react/src/editable/composition-state.ts,packages/plite-react/src/editable/input-state.ts,packages/plite-react/src/editable/model-input-strategy.ts,packages/plite-react/src/editable/mutation-controller.ts,packages/plite-react/src/editable/runtime-before-input-events.ts,packages/plite-react/test/composition-state-contract.test.ts,tooling/scripts/run-bounded-process.mjs | host:none - retry-free runner manages source-built host and Chromium | 2026-08-22T12:10:38.637Z | 2026-08-22T12:33:37.111Z | 2026-08-22T12:33:40.729Z | 0 | sha256:d0cb0d814cd895cef6061f75b8586e969661ae150d15225139caf56f19c73464 |
| PLITE-IME-HISTORY-001 | 2 | completed | `env PLITE_BROWSER_FORCE_PROOF=1 pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/richtext.test.ts tests/plite-browser/donor/stress/generated-editing.test.ts --grep "keeps long expanded marked composition atomic when compositionend precedes final input\|mouse drag undo restores typed multi-leaf selected text replacement\|richtext ime-composition-undo"` | pass: exit 0 in 4924ms; 3 passed in 2 batches | dirty:0231a088c40911aa9a3dc41978d00a6fd41ff76f | sha256:eb26429af5218d32415de0b4b61a393960b87d7f034e5496c255b6c2ec28e6c7 | 28 | apps/plite/package.json,apps/plite/playwright.config.ts,apps/plite/scripts/build-app-if-stale.mjs,apps/plite/scripts/build-browser-if-stale.mjs,apps/plite/scripts/plite-browser-runner.mjs,apps/plite/scripts/plite-proof-inputs.mjs,apps/plite/scripts/run-plite-browser.mjs,apps/plite/tests/plite-browser/donor/examples/richtext.test.ts,apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts,apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx,apps/www/src/app/(app)/examples/plite/plite-example-data.ts,apps/www/src/app/(app)/examples/plite/plite-example-loaders.tsx,apps/www/src/app/(app)/examples/plite/plite-example-registry.ts,packages/browser/src/playwright/index.ts,packages/browser/src/playwright/runtime-errors.ts,packages/browser/src/playwright/selection-contract.ts,packages/browser/src/playwright/types.ts,packages/plite-dom/src/plugin/dom-input-runtime.ts,packages/plite-dom/test/dom-root-runtime.test.ts,packages/plite-history/src/history-extension.ts,packages/plite-history/src/history-merge-policy.ts,packages/plite-react/src/editable/composition-state.ts,packages/plite-react/src/editable/input-state.ts,packages/plite-react/src/editable/model-input-strategy.ts,packages/plite-react/src/editable/mutation-controller.ts,packages/plite-react/src/editable/runtime-before-input-events.ts,packages/plite-react/test/composition-state-contract.test.ts,tooling/scripts/run-bounded-process.mjs | host:none - retry-free runner manages source-built host and Chromium | 2026-08-22T12:10:38.637Z | 2026-08-22T12:34:22.635Z | 2026-08-22T12:34:27.560Z | 0 | sha256:eb804d59c03f4179eba09ec9966cf6d4dffaa368faf3d4efecba9139897da431 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plite composition session and React composition/history adapter | PLITE-IME-HISTORY-001 | pass: richtext marked multi-leaf replacement undo 1/1; pass: stress `ime-composition-undo` 1/1; red: selected long alternate-order case 1/1 | 2026-08-22T12:10:38.637Z | `PLITE_BROWSER_FORCE_PROOF=1 pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/richtext.test.ts tests/plite-browser/donor/stress/generated-editing.test.ts --grep "keeps long expanded marked composition atomic when compositionend precedes final input\|mouse drag undo restores typed multi-leaf selected text replacement\|richtext ime-composition-undo"` | sha256:eb26429af5218d32415de0b4b61a393960b87d7f034e5496c255b6c2ec28e6c7 | pass: 3 passed, 0 skipped, 2 bounded batches after the last owner edit. |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Pre-implementation Regression semantic validation | Rejected placeholder tested ref, executable anchors/results, and placeholder failed-fix/architecture rows | Expected fail-closed plan incompleteness before current-source discovery; no product claim affected | Resolved exact current test anchor, baseline results, tested-ref encoding, and N/A architecture rows | pass: `Regression plan: structurally valid.` before product edit |
| Exact focused Chromium case | One undo left `This is , ` instead of the exact pre-composition marked value | Expected red-before-green product reproduction; history/undo plus IME class | Patch the proven private composition-history owner only after Best API and Plite Plan pressure | pass: final exact receipt restored both value and selection after one undo/redo. |
| Attempt 1 exact focused Chromium replay | The same undo assertion failed after adding the private merge marker and routing final mutation through native text policy | Failed claimed candidate; native text grouping rejects the multi-leaf structural predelete | Freeze product edits; add a structural-history diagnostic, repair Regression, then use composition-owned explicit merge | pass: attempt 2 package and browser proofs pass with composition-only history merge. |
| Attempt 2 exact focused Chromium replay | Exact undo model value and selection passed; a whole-document block matcher then rejected unrelated trailing blocks | Proof-only failure after the product oracle turned green | Keep product edits frozen and scope both assertions to the first block | pass: unchanged product bytes passed the repaired exact browser row. |
| Strict source-integrity runs | Full Chromium stopped when unrelated docx-export and Markdown snapshot files changed during proof | Concurrent shared-checkout writers; no Plite assertion failed | Identify writers, wait for stable bytes, and discard interrupted runs | pass: final exact `pnpm check:plite` completed after writers exited. |
| Strict huge-document row | One full run timed out after 8s waiting for native selection sync in the staged 10k paste row | Load-sensitive unrelated browser assertion; no composition path involvement | Replay the exact row unchanged, then require the complete strict gate | pass: focused row passed 1/1 and final strict Chromium passed 708 with 8 skips. |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| PLITE-IME-HISTORY-001 | 1 | Exact Chromium replay stayed red after the candidate: one undo still left `This is , ` | exact-replay | yes: attempt 1 candidate and every derived completion claim were invalidated | repair-now: `.agents/rules/regression.mdc` now forbids cached result reuse from counting as stability, with source contract test | pass: 39 Regression workflow tests and source/generated parity check pass | yes: timer-focus-correctness requires architecture review because a timer split the composition history unit | best-api and plite-plan accepted private composition ownership, generic History, and no public API | reproduced: package diagnostic matched the split, then attempt 2 exact replay passed with composition-only merge. |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| PLITE-IME-HISTORY-001 | 1 | timer-focus-correctness | escalate | required: best-api selects no public API and one private composition-history law | plite-plan: keep History generic and let the private React composition runtime own whether its predelete requires explicit final merge | accepted: composition-only merge passes direct, queued, fallback, collapsed-control, browser, and strict proof. |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| PLITE-IME-HISTORY-001 | `composition-state.ts` predeletes the expanded selection; `input-state.ts` privately records whether that predelete occurred; direct, queued, and fallback terminal paths apply composition-only `history-merge` | `apps/plite` source-built Playwright Chromium route `plite/richtext` through `run-plite-browser.mjs` | Final receipts started after latest input mtime `2026-08-22T12:10:38.637Z`; strict runner fingerprinted the full source-built host | `packages/browser/dist` and app export freshness are runner-owned outputs; no generated fixture is edited or treated as source | pass: exact and combined forced receipts plus strict 708-pass Chromium proof use current source with retries 0. |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| PLITE-IME-HISTORY-001 | red: first undo leaves `This is , ` because selection predelete and final insert are separate batches after 1,100 ms | `packages/plite-dom` composition-session owner, `packages/plite-react` composition/history adapter, selected browser test, focused package contracts, and required changesets only; no API/docs/release/artifact enrichment | Same-case green, both terminal paths and collapsed negative-control package proof, exact host replay, five retry-free runs, affected-corpus replay, P1 review | Root cause, durable owner, changed files, exact red/green output, dirty fingerprints, stability, architecture verdict, changeset, residual caveat | completed: private React WeakSet plus composition-only merge; no public shape, docs, release, or artifact change. |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| PLITE-IME-HISTORY-001 | Exact focused Playwright Chromium case on fresh source-built host | 5 | pass: five forced executions each ran one Playwright test and passed; a prior one-execution-plus-four-cache loop was rejected and not counted | 0 | completed |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| PLITE-IME-HISTORY-001 | Exact red/green browser row, direct/queued/fallback package cases, collapsed negative control, five forced runs, combined 3/3 corpus, strict 708/708 passes | keep | local desktop Playwright Chromium synthetic terminal ordering on dirty ref; uncommitted and unpushed | Physical OS IME, raw mobile devices, Firefox, and WebKit remain outside this claim | none for local closure; integration owner only if commit/push is later authorized |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| PLITE-IME-HISTORY-001 | Cached browser-runner results were initially mistaken for four stability executions after the first real run | repair-now | `.agents/rules/regression.mdc` states that every stability repetition executes and cached reuse never counts; generated skill mirror synced | pass: 39 workflow tests plus `sync-resources.mjs --check` | First loop rejected; replacement loop forced and passed five actual executions. |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Initial composition owner search | Regression investigation | 900 output lines / expected one screen | Search included several broad test/source roots | Located exact helper and adjacent contract names, but exceeded the planned output budget | Switched to exact-file `sed` and narrow filename/title queries |
| First stability loop | Regression verification | 1 execution plus 4 cached results / expected 5 executions | Browser runner cache reuse was not disabled | Invalid as stability evidence | Added source rule and contract; reran with `PLITE_BROWSER_FORCE_PROOF=1`, 5/5 actual passes |
| First combined corpus command | Regression verification | 2 tests / expected 3 | Used a stale shortened path for generated editing stress | Partial pass was not counted | Resolved literal current path and reran: 3 passed in 2 batches |
| Strict Plite integrity | Shared checkout | two interrupted runs | External root tests updated unrelated docx-export/Markdown files during Chromium | Correctly invalidated stale proof | Identified the root test process, waited for exit, and reran strict on stable bytes |
| Strict huge-document row | Browser proof | one 8-second timeout / immediate focused pass | Load-sensitive native selection sync in an unrelated 10k paste row | Could not close strict until exact replay and full rerun passed | Exact row passed 1/1 unchanged; final strict run passed all 79 batches |

Findings:
- The attached correction withdraws all publication blockers and selects only
  the long expanded marked-selection history hypothesis for mandatory execution.
- Prior pass counts are supporting reports, not current-run evidence.
- Current source commits the expanded-selection deletion at composition start,
  then lets the terminal insertion use ordinary time-based history grouping.
  At 1,100 ms, the terminal commit becomes a new batch, so one undo cannot
  restore the pre-composition value.
- Attempt 1 correctly recorded the predelete in the private composition epoch,
  but used the wrong merge primitive. `updateNativeTextInput(..., { merge:
  true })` adds both `history-merge` and `native-text-input`.
  `shouldMergeExplicitBatch` deliberately constrains native merging to
  compatible text groups, so it rejects the multi-leaf structural predelete.
  Composition atomicity needs `history: 'merge'` without native typing
  classification.
- Final review correctly rejected exposing that merge marker through
  `compositionSession` and `EditableInputControllerState`. The final shape keeps
  it in module-private React `WeakSet` storage and preserves both exported state
  shapes.

Timeline:
- 2026-08-22: read the attached correction, loaded Regression and Autogoal,
  created the one-shot goal, and captured all explicit requirements before
  product/test edits.
- 2026-08-22: pre-edit marked-selection undo and collapsed composition undo each
  passed 1/1; the new exact long alternate-order case failed 1/1 at the first
  undo value assertion.
- 2026-08-22: Best API rejected any public API or proof-artifact expansion;
  Plite Plan assigned the private grouping decision to the existing
  composition session while leaving generic history policy unchanged.
- 2026-08-22: Patch attempt 1 failed the exact replay. Regression revoked the
  candidate, froze product edits, and selected a package-level structural
  history diagnostic before attempt 2.
- 2026-08-22: Patch attempt 2 passed direct, queued, Chrome fallback, collapsed
  negative-control, exact browser, and five forced stability runs.
- 2026-08-22: P1 review found a public-state leak; the marker moved to
  module-private React storage. Invocation 3 returned clean.
- 2026-08-22: external root test writers invalidated two strict runs and an
  unrelated huge-document row timed out once. Stable unchanged reruns passed.
- 2026-08-22: final strict Plite passed with 708 Chromium tests, 8 skips, and 79
  bounded batches; exact and combined proof receipts were issued afterward.

Decisions and tradeoffs:
- Select one executable browser case, not transport artifact enrichment -> it
  directly tests the only unresolved hypothesis and avoids expanding proof API.
- Treat an already-green red-first probe as falsification of the defect
  hypothesis -> keep the durable regression but make no product-source change.
- The reproduced failure makes one private lifecycle fact necessary: whether
  the current composition already committed an expanded-selection predelete.
  The final composition-owned mutation must explicitly merge only in that case.
  Always merging would incorrectly absorb unrelated prior typing for collapsed
  compositions; teaching History about browser event order would put the law in
  the wrong package.

Review fixes:
- Accepted P1: remove `historyMergePending` from DOM composition epoch/session
  and exported `EditableInputControllerState`; retain it in a module-private
  React `WeakSet` with an internal predicate.
- Final P1 invocation 3: clean, no accepted P0/P1 finding.
- Agent-native review: pass; action, route, source owner, generated mirror, and
  executable proof are present.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Semantic validator run before current executable anchors/results were resolved | 1 | Trace the exact helper/test owner, record baseline results and canonical ref, then rerun | resolved: structural validation passed before implementation and complete validation passes at closeout |
| First composition search printed 900 lines across too many owners | 1 | Restrict all further reads to exact helper/test files and short line ranges | resolved immediately; no product bytes changed |
| Attempt 1 used native-text-input explicit merge for a structural composition replacement | 1 | Add a package test for the exact multi-leaf history shape, then use composition-owned `history: 'merge'` without the native-input tag | resolved: package diagnostic failed at the same split; attempt 2 source edits may resume |
| Stability loop reused cached proof | 1 | Add a durable Regression rule and force each execution | resolved: workflow contract 39/39 and forced browser stability 5/5 |
| Combined corpus used a stale generated-test path | 1 | Resolve the current file with `rg --files` and rerun the combined command | resolved: 3 passed in 2 bounded batches |
| Strict gate raced external test writers | 2 | Identify the writer, wait for it to exit, then rerun on sampled-stable bytes | resolved: final exact strict gate passed |
| Strict huge-document selection sync timed out under load | 1 | Replay exact row unchanged, then rerun the whole strict gate | resolved: exact 1/1 and final full Chromium 708 passed |

Verification evidence:
- command: `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-22-plite-long-ime-history-atomicity-regression.md` -> pass before product edit
- command: focused marked multi-leaf replacement undo baseline -> 1 passed
- command: focused collapsed `ime-composition-undo` baseline -> 1 passed
- command: focused `PLITE-IME-HISTORY-001` -> red at first undo; received model text `This is , ` instead of the exact marked pre-composition value
- command: attempt 1 exact replay -> red at the same first-undo assertion; candidate invalidated and Regression repair-now started
- command: focused structural-history package diagnostic -> red at exact undo restoration with `This is , done`; repair-now completed before attempt 2
- command: focused DOM runtime -> 12 passed, 0 failed, 249 assertions
- command: focused React composition and terminal-input contracts -> 51 passed, 0 failed
- command: source-first DOM/React typecheck -> 6/6 tasks passed
- command: forced exact stability loop -> 5/5 actual executions passed, retries 0
- command: affected corpus -> 3 passed, 0 skipped, 2 bounded batches
- command: Regression workflow proof -> 39 passed; source/generated resources exact
- command: final P1 autoreview invocation 3 -> clean, no accepted P0/P1 finding
- command: final `pnpm check:plite` -> pass; Chromium 708 passed, 8 skipped, 79 batches
- receipts: exact `sha256:d0cb0d814cd895cef6061f75b8586e969661ae150d15225139caf56f19c73464`; corpus `sha256:eb804d59c03f4179eba09ec9966cf6d4dffaa368faf3d4efecba9139897da431`

Final handoff:
- executable cases: PLITE-IME-HISTORY-001 is kept and completed in the existing
  richtext Playwright file.
- reporter oracles and forbidden states: all five applicable observations pass;
  popup and geometry/paint are N/A with case-specific reasons.
- failed-fix invalidation and automatic repair: attempt 1 was revoked; the
  structural diagnostic reproduced the miss; Regression now rejects cached
  stability reuse with executable contract proof.
- proof receipts and affected-corpus replay: exact and combined completed
  receipts are recorded above; combined replay passed 3/3.
- started-gate failure closure: proof matcher, source-integrity interruptions,
  and the huge-document timeout all have exact passing final reruns.
- changed product/test files and SHA-256 fingerprints:
  `dom-input-runtime.ts` `a043cd4b...`, `dom-root-runtime.test.ts`
  `791e5188...`, `composition-state.ts` `b1a6e7fd...`, `input-state.ts`
  `4f004440...`, `model-input-strategy.ts` `0dd9ad44...`,
  `mutation-controller.ts` `19b81641...`,
  `runtime-before-input-events.ts` `677ffcbd...`,
  `composition-state-contract.test.ts` `bd3f45a4...`, and
  `richtext.test.ts` `36ed4030...`.
- changed workflow files: `.agents/rules/regression.mdc`, its source contract
  test, and generated Regression skill mirror.
- design decisions: the composition runtime privately owns whether an expanded
  predelete needs the terminal commit merged; History remains generic; no public
  API, epoch contract, docs, release, or artifact-enrichment change exists.
- tests and proof: focused package/type proof, 5/5 forced stability, 3/3 corpus,
  strict Plite, exact/corpus receipts, and final P1 review all pass.
- source/generated sync: `pnpm install` and resource parity check pass.
- changeset: N/A because both Plite packages are absent from `main`; this branch
  introduces them rather than changing a released package relative to main.
- P1 and agent-native findings: public-state leak fixed; invocation 3 clean;
  agent-native capability map passes.
- residual risks and next owner: desktop synthetic Chromium only. Physical OS
  IME, raw mobile, Firefox, and WebKit are not claimed. No next local owner.
- local completion status and integration/public-status boundary: completed on
  dirty `0231a088c40911aa9a3dc41978d00a6fd41ff76f`; uncommitted and unpushed. No
  GitHub, PR, release, or publication mutation occurred.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | completed local handoff |
| Where am I going? | nowhere without separate integration authority |
| What is the goal? | close the long expanded marked-selection IME history hypothesis with exact undo/redo proof and five retry-free runs |
| What have I learned? | the defect was a split history unit after the 1,100 ms wait; its repair needs private composition ownership, not a public API |
| What have I done? | reproduced, repaired, privacy-hardened, reviewed, stress-reran, receipted, and strictly validated the selected case |

Open risks:
- Claim width is intentionally limited to local desktop Playwright Chromium
  with synthetic event ordering. No raw OS IME or cross-browser conclusion is
  implied.
