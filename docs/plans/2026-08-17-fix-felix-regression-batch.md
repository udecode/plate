# fix Felix regression batch

Objective:
Fix all nine Felix-retested Plate regressions locally, including the critical
homepage typing regression in #5066; done when every exact
case is reproduced, repaired or honestly terminal, passes claim-matched Chrome
stability and P2 review, and the regression ledger/checker close.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-fix-felix-regression-batch.md

Template:
docs/plans/templates/auto-regression.md

Primary template:
docs/plans/templates/auto-regression.md

Applied packs:
- none

Regression source:
- target bug / surface / corpus: Felix follow-up retests for issues #5064,
  #5065, #5066, #5070, #5085, #5086, #5087, #5088, and #5091
- lane: shared Plate product/browser behavior over Plite substrate
- master ledger path: `docs/editor-behavior/example-story-coverage.tsv`
- tested ref / expected ledger ref: `dirty:a18bab5bba2d73e446523cbd848c5baeb19935f4`
  until the final issue-owned fingerprints are frozen; no public fixed claim is
  legal without later replay on a clean final pushed ref
- route or proof host: fresh `apps/www` process; homepage `/` for seven cases
  and `/blocks/playground` for #5085; exact Chrome on macOS for native behavior
- invocation mode / timebox: standalone Regression full-loop; no duration;
  continue until all nine rows are terminal. The plan started under the former
  Auto Regression owner; the new standalone `regression` skill now owns it.
- selected case IDs: `homepage:native-typing-latency`,
  `homepage:enter-followup-lag`,
  `table:tab-destination-selection`, `dnd:block-inline-caret`,
  `toolbar:floating-bold-selection`, `suggestion:accept-removechild`,
  `mention:inline-drag`, `block-selection:native-toolbar`, and
  `font-size:selection-paint`

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop condition, deliverable, handoff section, verification surface, and success criterion into the Work Checklist before mutable work.
- Load `.agents/skills/auto/references/regression-methodology.md` and do not copy one run's routes, cases, refs, blockers, or results into reusable methodology.

Completion threshold:
- Every selected case has one valid 21-column ledger row and a terminal `kept`, `reverted`, `quarantined`, `deferred`, or `blocked` decision supported by current evidence.
- Current source and every proof host are ready before behavior claims; stale source, generated drift, and stale-server findings are repaired or explicitly block the claim.
- Each kept case has exact reproduction/red-proof accounting, one-case `patch` delegation, focused green proof, required retry-free stability, current ref/fingerprints, and no accepted P2 finding.
- Every packet records `repair-now`, evidence-backed `no-change`, or evidence-backed `defer` for the methodology.
- The ledger validator passes with `--expected-ref`, every selected `--selected-case`, every case-owned `--owned-file`, and `--require-complete`; all canonical Work Checklist and Completion Gates rows resolve; `check-complete.mjs` passes.
- All nine reporter-visible workflows finish as local `kept` candidates or an
  honest non-success terminal state with no safe autonomous move. A kept native
  case requires 5/5 retry-free warm exact-Chrome runs from a fresh process,
  complete post-action claim fields, issue-owned fingerprints, and clean P2
  review. No GitHub status is changed and no issue is called fixed/completed.

Verification surface:
- `node .agents/skills/regression/scripts/validate-ledger.mjs --ledger <ledger.tsv> --expected-ref <tested-ref> --selected-case <case-id>`
- focused unit, DOM, Playwright, Browser, or device proof chosen per case
- exact final-case replay and retry-free stability rows when required
- P2 autoreview for non-trivial implementation packets
- exact Chrome replay through the user's Chrome session for every selected case
- focused package/model tests and source-first typechecks for each durable owner
- final current-checkout source/fingerprint audit; clean pushed-ref replay is a
  later coordinator gate because this request does not authorize push
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-fix-felix-regression-batch.md`

Constraints:
- Regression owns the master plan, ledger, selection, proof width, packet decision, and methodology delta.
- `patch` owns exactly one normalized local behavior repair at a time.
- Baselines are evidence, not law. Proxy proof never upgrades the exact case.
- No parallel writers to shared source owners, ledgers, plans, generated output, package builds, or route hosts.
- Generated output is not a source owner. Repair source/generation and rerun the generator.
- Do not widen a local candidate into fixed, shipped, or completed wording without matching integration/release evidence.
- Do not create wrapper skills or put case-specific facts into reusable rules/templates.
- Serialize all nine cases and managed route hosts; one production-code writer
  and one master-ledger writer in this thread.
- Use the issue's exact route, setup, target, action, and complete final state.
  Do not replace manual pointer/keyboard behavior with a direct model operation.
- Do not use temporary stubs, stale servers, old built exports, generated-file
  edits, or route bypasses as red or green proof.
- Preserve unrelated checkout changes. Do not inspect `git status`, switch
  branches/worktrees, commit, push, create a PR, release, or mutate GitHub.

Boundaries:
- allowed source owners: current owners under `packages/table`,
  `packages/selection`, `packages/dnd`, `packages/core`, `packages/plite-react`,
  feature packages proven by source, and canonical `apps/www/src/registry/**`
- allowed proof/test owners: focused package tests, `tooling/e2e/**`, existing
  `apps/www` browser lane, Chrome, and the shared regression ledger/plan
- generated/source boundary: registry/component/package source is authoritative;
  `apps/www/src/__registry__`, generated mirrors, `templates/**`, and build
  output are not hand-edited; never run `build:registry`
- browser/device claim width: exact Chrome/macOS pointer, keyboard, selection,
  focus, DnD, paint, error, toolbar/popup, and follow-up-input state; 5/5 warm
  retry-free runs for every selected native/lifecycle case
- forbidden product/API/release/public mutations: no public API redesign without
  `best-api`; no GitHub comment/label/close; no commit/push/PR/release
- orchestration mode and writer ownership: current thread is Auto master and
  sequential Patch worker; orchestrator/subagents N/A; no parallel writers or
  concurrent managed Playwright/Chrome hosts

Output budget strategy:
- Start from exact owner files and current ledger rows. Count or artifact broad corpus scans. Cap logs and reviewer output. Do not stream generated trees, build output, raw corpora, or broad test inventories.

Blocked condition:
- Block only when the exact case cannot be observed on current source, the authoritative host/device/credential is unavailable, an unsafe owner/API decision requires user authority, or the same blocker leaves no safe alternate packet.
- A broken command shape, stale server, generated drift, or missing route host is a methodology repair target before it is a product blocker.

Regression state:
- current phase: #5066 local candidate kept; pushed-ref replay pending
- current case: `homepage:native-typing-latency`
- current case status: kept locally; not pushed or publicly fixed
- next owner: push authority, then exact-ref replay and public status promotion
- goal status: active

Completion rule:
- Do not call `update_goal(status: complete)` while any required Work Checklist or Completion Gates row is unchecked or unresolved.
- Custom case, proof, stability, or methodology tables support the canonical gates; they never replace them.
- Run the ledger validator with `--require-complete` before the final plan checker.
- Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-fix-felix-regression-batch.md` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Fix all eight Felix-invalidated/incomplete cases; exact reporter proof; no false completion; no git/public mutation |
| Auto regression reference loaded | yes | Read complete Auto skill and `regression-methodology.md` before mutable work |
| Active goal checked or created | yes | `get_goal` returned none; goal creation follows this filled plan shell |
| Master ledger path and exact tested ref recorded | yes | Existing 21-column example-story ledger; dirty HEAD token recorded above |
| Current source owner resolved | yes | Candidate owner set bounded above; each case locks one durable owner after red reproduction |
| Route/proof-host readiness plan recorded | yes | Fresh apps/www process, `/` and `/blocks/playground`, package-build/source freshness, exact Chrome |
| Selected atomic cases and provenance recorded | yes | Eight stable issue-derived case IDs and issue URLs recorded below |
| Risk and test-decision policy recorded | yes | Observed regressions first; #5086/#5088 score 12, remaining rows score 11; all multi-layer |
| Patch delegation boundary recorded | yes | One normalized row at a time; Patch returns evidence only; Auto writes ledger/decisions |
| Orchestrator writer ownership recorded | yes | N/A: one current-thread writer; no subagents or parallel managed hosts |
| Output budget strategy recorded | yes | Exact issue/owner files, compact ledgers, capped commands; no broad generated/test dumps |
| Claim width and blocked rules recorded | yes | Exact Chrome/native state and clean-host gates above; route/freshness failures trigger methodology repair |

Work Checklist:
- [ ] Skill analysis complete: `auto` is the master, `patch` is the one-case worker, and the conditional regression reference is loaded.
- [ ] First checkpoint complete: every explicit requirement, scope boundary, timing rule, stop condition, deliverable, final handoff section, verification surface, and success criterion is captured before mutable work.
- [ ] Objective, threshold, verification surface, constraints, boundaries, output budget, and blocked condition are concrete.
- [ ] Current source owner, exact ref, route/proof host, runner entrypoint, package export/build path, and freshness method are recorded before behavior claims.
- [ ] Generated/source boundaries are audited; any drift, wrong owner, or route-host dependency is repaired or blocks the claim honestly.
- [ ] Every selected case is atomic with stable ID, setup, action, expected outcome, owner, source refs, protocol decision, tested ref, and source fingerprints.
- [ ] Every selected case has `impact`, `rewrite_exposure`, `browser_dependence`, and `proof_gap` in `0..3`, with exact `risk_score` sum.
- [ ] Baseline verdict is recorded as evidence, conflicting evidence is preserved, and current accepted law is named.
- [ ] Each case has one exact test decision: `unit`, `dom`, `playwright`, `browser`, `device`, `multi-layer`, `no-test-with-evidence`, `needs-repro`, or `defer-with-owner`.
- [ ] The smallest high-value probe ran before scaling; command-shape, stale-server, source/export, or host failures were repaired before more cases were added.
- [ ] Exact case reproduction and owner classification are recorded; proxy evidence stays labeled proxy.
- [ ] Exact red proof exists before the fix when possible, or the limitation and substitute evidence are explicit.
- [ ] Auto delegated only one normalized case at a time to `patch`, including the ledger row, invariant, red evidence, edit boundary, proof width, stability count, and return contract.
- [ ] Patch returned root cause, durable owner, changed files, exact red/green evidence, tested ref/fingerprints, stability, architecture-pressure verdict, P2 review, and caveat.
- [ ] Focused green proof ran on the owning source and fresh host; broader proof matches the claim width instead of running by habit.
- [ ] Required retry-free warm stability runs passed and every run is recorded, or N/A reason is evidence-backed.
- [ ] Each packet is explicitly kept, reverted, or quarantined; deferred/blocked cases name the owner, missing evidence, and next trigger.
- [ ] Orchestrator mode, when active, used one master writer for shared plan/ledger state and no parallel writers for overlapping owners or hosts.
- [ ] Every workflow slowdown records command/owner, elapsed estimate, evidence value, repair decision, and result.
- [ ] Irrelevant skill loading, wrong command shape, stale server, proof-host drift, generated drift, and noisy/broad proof were repaired in their durable owner or deferred with evidence.
- [ ] Every packet records one methodology delta: `repair-now`, evidence-backed `no-change`, or evidence-backed `defer` with owner and trigger.
- [ ] Reusable methodology repairs changed source rules/resources only, ran focused proof, and synced generated mirrors when applicable.
- [ ] Claim wording distinguishes reproduced, candidate-local, verified-local, kept, fixed, shipped, and completed according to actual evidence.
- [ ] Ledger schema, unique IDs, aligned columns, dimensions, exact sums, decisions, statuses, provenance, expected ref, selected-case set, exact owned-file fingerprint manifest, and completion eligibility pass the deterministic validator.
- [ ] Final handoff records changed files, decisions, tests, sync results, review findings, residual risks, and the exact fresh-worker prompt.
- [ ] Output budget discipline was followed; any accidental broad output is logged with the narrower recovery.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | pending | Close every selected case and methodology row with fresh evidence | pending |
| Current-source readiness | pending | Prove source owners and tested ref are current | pending |
| Route/proof-host readiness | pending | Prove the runner/host observes current source, or record a blocking limitation | pending |
| Atomic case/provenance closure | pending | Validate stable IDs, source refs, protocol decisions, refs, and fingerprints | pending |
| Risk/test decision closure | pending | Validate 0..3 dimensions, exact score sums, and claim-matched proof choices | pending |
| Smallest-probe closure | pending | Record the first falsifying probe and any harness repair before scale | pending |
| Reproduction/classification closure | pending | Record exact red behavior or `needs-repro`, plus durable owner | pending |
| Patch delegation closure | pending | Read back one-case red/green/root-cause/proof evidence from `patch` | pending |
| Focused verification closure | pending | Run owning-layer and exact final-case proof on current source | pending |
| Stability closure | pending | Record retry-free warm runs or evidence-backed N/A | pending |
| Packet decision closure | pending | Keep, revert, quarantine, defer, or block every selected row honestly | pending |
| Generated/source and host repair closure | pending | Repair drift/host methodology or record the exact blocked claim | pending |
| Orchestrator writer closure | pending | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | pending |
| Workflow slowdown closure | pending | Repair avoidable slow/irrelevant/stale proof paths or defer with owner | pending |
| Methodology delta closure | pending | Resolve `repair-now`, `no-change`, or `defer` for every packet | pending |
| Regression ledger validation | pending | Run validator with `--expected-ref <tested-ref>` and every `--selected-case <case-id>` | pending |
| Regression completion eligibility | pending | Run validator with `--expected-ref`, every `--selected-case`, every case-owned `--owned-file`, and `--require-complete` | pending |
| Source/generated sync | pending | Run `pnpm install` and parity audit when reusable agent sources changed, otherwise N/A | pending |
| Agent-native review | pending | Run for changed skills/rules/templates/commands and close accepted findings, otherwise N/A | pending |
| Final handoff contract | pending | Record changed files, design decisions, proof, sync, reviews, risks, and fresh-worker prompt | pending |
| P2 autoreview | pending | Run P2 review for non-trivial implementation packets and close accepted findings, otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-fix-felix-regression-batch.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | All requirements, cases, boundaries, proof width, and non-goals materialized | source/host readiness |
| Current source and proof-host readiness | pending | | case inventory |
| Atomic case inventory and provenance | pending | | score and select |
| Risk score and proof decision | pending | | smallest probe |
| Smallest high-value probe | pending | | reproduce/classify |
| Reproduce, classify, and red proof | pending | | patch delegation |
| One-case patch delegation | pending | | verification |
| Focused verification and stability | pending | | packet decision |
| Keep/revert/quarantine | pending | | methodology delta |
| Methodology repair/no-change/defer | pending | | next case or closure |
| Ledger validation and reviews | pending | | final handoff |
| Final handoff and goal-plan check | pending | | final response |

Selected case ledger readback:
| Case ID | Ledger path | Status | Risk score | Test decision | Tested ref / fingerprint | Next owner |
|---------|-------------|--------|------------|---------------|--------------------------|------------|
| homepage:native-typing-latency | example-story coverage | kept | 12 | multi-layer | dirty:a18bab5... / exact five-file fingerprint manifest | pushed-ref replay |
| suggestion:accept-removechild | example-story coverage | selected | 12 | multi-layer | dirty:a18bab5... / current e2e manifest | Auto smallest probe |
| block-selection:native-toolbar | example-story coverage | inventory | 12 | multi-layer | dirty:a18bab5... / current e2e manifest | Auto after #5086 |
| homepage:enter-followup-lag | example-story coverage | inventory | 11 | multi-layer | dirty:a18bab5... / current e2e manifest | sequential queue |
| table:tab-destination-selection | example-story coverage | inventory | 11 | multi-layer | dirty:a18bab5... / current e2e manifest | sequential queue |
| dnd:block-inline-caret | example-story coverage | inventory | 11 | multi-layer | dirty:a18bab5... / current e2e manifest | sequential queue |
| toolbar:floating-bold-selection | example-story coverage | inventory | 11 | multi-layer | dirty:a18bab5... / current e2e manifest | sequential queue |
| mention:inline-drag | example-story coverage | inventory | 11 | multi-layer | dirty:a18bab5... / current e2e manifest | sequential queue |
| font-size:selection-paint | example-story coverage | inventory | 11 | multi-layer | dirty:a18bab5... / current component manifest | sequential queue |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| homepage:native-typing-latency | apps/www homepage Plate-on-Plite stack | current checkout; `http://localhost:3000/`; exact Chrome | dirty:a18bab5... plus exact five-file fingerprints; clean dev restart | canonical homepage registry source; generated API manifest refreshed | local green; pushed-ref replay pending |
| pending | pending | pending | pending | pending | pending |

Patch delegation ledger:
| Case ID | Red evidence | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|--------------|---------------------|--------------------------|-----------------------|--------|
| homepage:native-typing-latency | 20/20 keys caused 90–115 ms long tasks; mutation p95 98.5 ms; second-paint p95 104.8 ms | Plite real pure-command evaluation; Plite React renderer/input ownership; Plate audited renderer and post-paint chrome adoption | preserve every insertText policy; exact Chrome correctness, native-event proof, hard budgets, and retry-free stability | P2-clean local candidate: mutation p95 5.5-5.9 ms; second paint 16.0-18.0 ms; zero long tasks; exact text/caret | kept locally; pushed-ref replay pending |

Stability ledger:
| Case ID | Proof command / host | Required runs | Results | Retry count | Decision |
|---------|----------------------|---------------|---------|-------------|----------|
| homepage:native-typing-latency | exact Chrome homepage, 5 warm runs of 20 measured keys | 5 | all pass; mutation p95 5.5-5.9 ms; second-paint p95 16.0-18.0 ms; 20/20 native events and commits; exact text/caret/focus; zero long tasks/errors | 0 product retries; one transport pre-dispatch retry was observation-gated | keep local candidate |

Packet decisions:
| Packet / case | Exact evidence | Decision | Claim width | Residual risk | Next owner |
|---------------|----------------|----------|-------------|---------------|------------|
| homepage:native-typing-latency | P2 clean; ledger completion eligible; exact Chrome 5/5; package/browser proof green | keep | local dirty candidate only | checkout-wide strict gate is red on unrelated duplicate changesets and stale collaboration input; no pushed-ref replay | push owner |
| pending | pending | pending | pending | pending | pending |

Methodology deltas:
| Packet / case | Miss or owner checked | Decision | Durable owner / change | Focused proof | Trigger / result |
|---------------|-----------------------|----------|------------------------|---------------|------------------|
| homepage:native-typing-latency | old homepage harness accepted p95 below a loose 150 ms budget | repair-now | Regression case contract and owning performance gate after root cause | exact Chrome measured p95 98.5 ms and 20/20 long tasks | old “green” was visibly slow and contradicted by reporter replay |
| pending | pending | pending | pending | pending | pending |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair decision / result |
|----------------|-------|--------------------|-------|----------------|--------------------------|
| pending | pending | pending | pending | pending | pending |

Findings:
- Felix's latest replies are the red source: five original failures remain and
  three workflows have residual failures. #5071/#5084 are excluded because the
  reporter confirmed them fixed.
- Existing browser tests cover the nominal actions but previously missed final
  pushed-ref freshness and several post-action fields. They are evidence, not
  current green truth.
- #5066 reproduces on Felix's exact pushed `next` ref. The former 150 ms budget
  encoded the bug as success: exact Chrome produced 20 long tasks for 20 keys,
  mutation p95 98.5 ms, and second-paint p95 104.8 ms.
- #5066 is not a Plite core document-operation regression and not one rogue
  Plate plugin. Plate always supplies a custom `renderText` and multiple
  `insertText` command policies. Plite React therefore rejects DOM text sync
  as `custom-text` and rejects native input whenever any command handler is
  present. The model/React path replaces the text DOM, the browser selection
  falls back to the `<h1>`, and Plite repairs it on every key.
- A comparable 249-node minimal Plate/Plite document measured 10.8 ms mutation
  p95, ruling out bare Plite/document scale. A lab-only DOM-sync capability
  reduced the rich homepage from 111.8 to 39.7 ms; allowing native input at the
  plain heading reduced mutation p95 to 5.7 ms. The fix must keep Plate command
  semantics rather than globally bypassing them.

Timeline:
- 2026-08-17: user authorized the full eight-case repair batch after the
  reporter-valid verification workflow was repaired.
- 2026-08-17: loaded Auto Regression, Autogoal, Patch, Maintainer, current
  regression methodology, and created this plan with eight atomic cases.
- 2026-08-17: user added #5066 as the first critical case. Reloaded the new
  standalone Regression owner and reproduced it on exact pushed ref
  `a18bab5bba2d73e446523cbd848c5baeb19935f4` in exact Chrome.
- 2026-08-17: user required a literal Plate-versus-Plite root-cause decision
  before any repair. Diagnosis must compare the same input path with layers
  removed one at a time and name the first owner whose removal clears the long
  task; a route-level speed difference alone is not sufficient attribution.
- 2026-08-17: Best API target hardened into binary-ready issue plan
  `docs/plans/5066-hard-cut-native-input-cliff.md`; its mechanical completion
  checker passes. Runtime source remains untouched pending exact-plan execution.

Decisions and tradeoffs:
- Process #5066 first because exact Chrome independently confirms a critical
  homepage-wide 90–115 ms long task on every keystroke. Process #5086 next
  because an exact homepage action still crashes. Process #5088 after that
  because mixed native/projected selection
  proves the most dangerous oracle gap. Serialize remaining cases by owner.
- Keep all work local. Public fixed/completed truth cannot be established until
  the user separately pushes and the exact cases replay on that clean ref.

### #5066 Best API architecture checkpoint

Verdict:
- Rearchitect. Do not ship an app-level `domStrategy.textSync` opt-in or retain
  `hasCommandHandler(insertText)` as native-input eligibility. Both make an
  unrelated renderer or pure command registration silently disable the common
  typing path.

Selected long-term target:
- Normal Plate and Plite call sites configure plugins/renderers only. They do
  not configure input strategy or DOM text-sync performance flags.
- Plite evaluates its already-pure `insertText` command pipeline per event.
  Pass-through handlers (`false`, unchanged `next()`, or a native-equivalent
  transaction spec) preserve native input. Only a materially different spec
  selects model-owned input.
- Ordinary live text/leaf renderers are text-invariant by contract and owner,
  so Plate can publish that capability internally. Truly text-dependent DOM
  rendering is an explicit advanced renderer lane and cannot silently pose as
  the normal fast path.
- `DOMTextSyncOptions` and `DOMStrategyOptions.textSync` are hard-cut from the
  app-facing API. DOM mounting strategy remains separate from renderer/input
  capability.
- Development diagnostics name the exact material blocker when a plain,
  collapsed, unmarked insertion cannot use the native path. CI proves that a
  no-op/pass-through command handler cannot change the strategy.

Hard cuts:
- delete presence-based native-input gating from
  `packages/plite-react/src/editable/runtime-before-input-events.ts`;
- delete public `DOMTextSyncOptions` export and nested `textSync` strategy
  configuration after renderer ownership replaces it;
- delete route/example capability assertions such as
  `textSync: { renderLeaf: 'text-invariant' }`;
- do not add `nativeSafe`, `fast`, or another boolean to every command handler.
  Pure command results already contain the material behavior decision.

Bounded source audit:
- renderer/input option surface: public `DOMTextSyncOptions`, one nested
  `DOMStrategyOptions.textSync` channel, three production Plite example owners
  (`editable-voids`, `synced-blocks`, `pagination`), and Plate's
  `PlateContent -> pipeRenderText -> Editable` bridge;
- command surface: ten production `insertText` registration files across AI,
  Copilot, table, link, suggestion, combobox, input rules, affinity, and two raw
  Plite examples. The package handlers are conditional and normally fall
  through for a plain character in a heading;
- reviewed rows: all bounded public option/bridge owners and all ten production
  command registration files; exclusions: tests, generated public registry
  output, static-only rendering, and unrelated DOM mounting strategies.

Rejected alternatives:
- homepage-only plugin cuts: they reduce cost but preserve the hidden cliff;
- a 150 ms budget: it encodes the regression as success;
- app-owned text-sync flags: wrong owner and impossible to keep honest;
- a per-handler `nativeSafe` boolean: duplicated policy that drifts from the
  pure transaction spec;
- always showing native DOM first and repairing later: latency theater that can
  violate suggestion/input-rule semantics.

Required proof after implementation:
- pure command evaluation/strategy unit contracts, including unchanged
  `handle` and `around(next)` pass-through, rewritten input, prefix/continuation,
  effects/tags, suggestion mode, link end, table multi-cell selection, input
  rules, affinity, IME/composition, undo, and follow-up typing;
- live renderer contracts that prove invariant renderers keep DOM sync while a
  truly text-dependent advanced renderer falls back explicitly;
- exact Chrome homepage replay with final text, model/DOM selection, focus,
  commit trace, zero long tasks, retry-free stability, and a main-relative plus
  one-frame latency gate rather than the old 150 ms threshold.

Review fixes:
- pending

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | N/A: no failure yet | N/A: no failure yet |

Verification evidence:
- #5066 exact Chrome red on clean pushed `next` ref
  `a18bab5bba2d73e446523cbd848c5baeb19935f4`: 20 sequential native key
  presses at 100 ms spacing; final text and focus correct; wall 4.904 s;
  mutation median/p95/max 93.7/98.5/114.0 ms; second-paint
  median/p95/max 93.696/104.8/119.2 ms; 20 long tasks, one per key.
- Rejected `cua.type` as proof because it produced no keydown rows and no text
  mutation; repeated through exact Chrome sequential key presses instead.
- The standalone Regression ledger validator passed the 21-column schema,
  exact selected-case set, expected ref, risk sum, and fingerprints for
  `homepage:native-typing-latency`; completion eligibility is correctly false
  while the case remains red.
- Deterministic diagnosis command on the exact clean ref:
  `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/run-homepage-input-perf.mts --url http://localhost:3005 --max-p95 30`.
  Original rich stack failed at 111.8 ms mutation p95; comparable 249-node
  minimal Plate/Plite passed at 10.8 ms; DOM text-sync capability reached
  39.7 ms; lab-only native-policy bypass reached 5.7 ms. The bypass is proof,
  not an acceptable fix.

Final handoff contract:
- changed files: pending
- design decisions: pending
- tests and proof: pending
- source/generated sync: pending
- P2 and agent-native findings: pending
- residual risks and claim width: pending
- exact fresh-worker prompt: pending

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| #5066 red reproduced | profile its 90–115 ms repeated task, then one-case Patch | close all nine exact cases locally without another false green | the 150 ms gate accepted the regression and CUA typing was not a valid keyboard oracle | exact clean-ref Chrome proof and fingerprints recorded |

Open risks:
- The checked-in apps/www generated registry host was stale during the prior
  harness pilot. If the real routes still cannot render current source without
  forbidden generated edits, host repair becomes the first methodology packet.
- Final public fixed/completed claims remain impossible without a separate push
  and clean-pushed-ref replay.
