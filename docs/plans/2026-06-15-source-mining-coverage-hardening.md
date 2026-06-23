# source mining coverage hardening

Objective:
Harden Plite source-mining coverage; done when accepted proof/docs/example packets close or defer with evidence; plan docs/plans/2026-06-15-source-mining-coverage-hardening.md.

Goal plan:
docs/plans/2026-06-15-source-mining-coverage-hardening.md

Template:
docs/plans/templates/slate-auto.md

Primary template:
docs/plans/templates/slate-auto.md

Applied packs:
- none

Automation source:
- type: slate-auto full-loop, source-mining execution
- prompt / link: user accepted source-mining hardening list and corrected scope:
  defer collab/Yjs, battle-test external dossier, maximize coverage without
  corrupting raw Plite architecture.
- surface / route / package: `.tmp/plite` raw Plite packages, React examples,
  Playwright example proofs, and parent `docs/**` plan/docs only.
- invocation mode: full-loop
- minimum runtime / deadline: N/A: no duration given.
- completion threshold summary: accepted source-mining packets are kept,
  reverted, quarantined, or explicitly deferred with owner/proof evidence.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: scope, non-goals, timing,
  stop conditions, deliverables, final handoff sections, verification surfaces,
  and success criteria.
- The initial checkpoint list is only the seed. After every loop, the
  supervisor must reconcile this plan against new evidence and may add, update,
  split, merge, retire, remove, reprioritize, or reopen checkpoints.
- Do not continue into implementation until first extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Required packets are closed or explicitly deferred with owner/evidence:
  state fields, controlled history preview, clipboard middleware, local
  provenance docs/tests, and guarded static/off-editor rendering docs. Closed:
  transaction atomicity, runtime IDs, editable islands, annotations.
- External source-mining claims are checked against live `.tmp/plite`
  source/tests/examples before promotion. If live v2 already owns the surface,
  strengthen proof/docs/examples instead of adding a duplicate primitive.
- Collab/Yjs, pagination, Plate product work, release/PR/readiness, and raw
  mobile/device claims are out of this run unless a hard stop routes them.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-source-mining-coverage-hardening.md`
  passes.

Verification surface:
- `.tmp/plite` source audits for current owners before patching:
  `packages/plite/test/transaction-contract.ts`,
  `packages/plite/test/range-ref-contract.ts`,
  `packages/plite/test/clipboard-contract.ts`,
  `packages/plite-history/test/**`,
  `packages/plite-react/test/annotation-store-contract.test.tsx`,
  `packages/plite-react/test/state-field-selector-contract.test.tsx`,
  `site/examples/ts/editable-voids.tsx`,
  `site/examples/ts/persistent-annotation-anchors.tsx`,
  `site/examples/ts/forced-layout.tsx`,
  `playwright/integration/examples/editable-voids.test.ts`,
  `playwright/integration/examples/persistent-annotation-anchors.test.ts`.
- Focused package proof from `.tmp/plite`: root Bun contracts for
  `packages/plite/**`, package Vitest for `packages/plite-react/**`, and
  slate-history package tests for history packets.
- Browser/Playwright proof from `.tmp/plite`: editable-voids and
  persistent-annotation-anchors example specs, with native/model/visual
  assertions for touched browser-visible behavior.
- Parent repo proof: this plan plus final
  `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-06-15-source-mining-coverage-hardening.md`.

Constraints:
- Plite private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Plite behavior commands from `.tmp/plite`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite.

Boundaries:
- Source of truth: live `.tmp/plite` source/tests/examples outrank the
  external source-mining dossier and old plans.
- Allowed edit scope: `.tmp/plite/packages/**`,
  `.tmp/plite/site/examples/**`, `.tmp/plite/playwright/**`, parent
  `docs/plans/**`, and parent `docs/plite/**` only when consolidating
  accepted latest-state decisions.
- Browser surfaces: `/examples/editable-voids` and
  `/examples/persistent-annotation-anchors`; add only the smallest route proof
  needed for controlled history / clipboard examples if new examples are added.
- Package/API surfaces: raw Plite runtime/history/react APIs already present;
  no public API expansion without source proof that current API cannot express
  the invariant cleanly.
- Agent/skill surfaces: N/A unless this loop discovers a reusable workflow miss.
- Docs/research surfaces: this plan plus accepted latest-state docs only; no
  public changelog/migration prose.
- Non-goals: Yjs/collab binding proof, pagination architecture, Plate product
  tests, raw mobile/device lane, release/publish/PR/changeset, comment thread
  model, AI turn semantics, template engine, DOCX policy, worker pool, ephemeral
  node registry, and a new core annotation primitive unless current annotation
  proof fails.

Blocked condition:
- Stop for user input only if a live source gap exposes two viable public
  API/runtime futures and choosing wrong would create durable API debt.
- Stop/defer if the next safe owner is Yjs/collab, pagination, raw mobile
  devices, release/PR authority, or Plate product work.
- Do not block on scoped proof gaps while other accepted packets remain
  runnable.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious
  backlog looks empty. Enter supervision mode and infer the next checkpoint from
  `vision`, current evidence, weak proofs, benchmark gaps, API/docs
  mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- surface: source-mining coverage hardening for raw Plite
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 10
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: none
- goal_status: complete

Current verdict:
- verdict: complete
- confidence: 0.95 after P0-P9, `bun check`, autoreview, and autogoal
  check-complete.
- next owner: user review of the four attention rows, then commit if desired
- keep / revert / quarantine call: keep P1-P9; no reverted/quarantined packets.
- reason: scope is now concrete and collab/Yjs is deferred by user instruction.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-source-mining-coverage-hardening.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-auto | complete | P0 | Copy prompt requirements and read north-star before implementation. | Requirements encoded; `plite-auto`, `autogoal`, `vision`, `agent-start`, and source rule read. | update |
| status | slate-auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Live owners inspected for transactions/range refs/editable islands/annotations/state/history. | update |
| gap-scan | slate-auto | complete | P0 | Battle-test dossier claims against live v2; route duplicate/missing proof accurately. | Accepted source-mining packets P1-P9 closed against live owners. | keep |
| transaction-atomicity | tdd / slate-patch | complete | P0 | Source mining highlights old AI accept corruption class without importing AI. | `bun test ./packages/plite/test/transaction-contract.ts` proves id-addressed multi-node replace publishes once, avoids mid-normalize, and rolls back on throw. | keep |
| runtime-id-docs-proof | slate-auto / docs | complete | P0 | Runtime IDs are a v2 selling point and persisted IDs should not leak back. | README docs added; `bun test ./packages/plite/test/state-tx-public-api-contract.ts` proves runtime-id path resolution through insert/move/split/fragment without JSON pollution. | keep |
| editable-island-proof | Playwright / slate-patch | complete | P0 | Editable islands already exist but must be canonical and edge-proofed. | Added child-root copy/cut browser oracle; Chromium slice covers mouse caret, boundaries, shift selection, paste, copy/cut, and parent cross-root selection. | keep |
| annotation-hardening | slate-react / Playwright | complete | P1 | Dossier suggests annotations; live v2 already has annotation store, so harden not reinvent. | Package annotation contract passes; browser example now proves anchor collapse when annotated text is deleted. | keep |
| state-field-policy | slate-react / slate-history | complete | P1 | Collab deferred; local state/history/persist/selector semantics still need proof. | React selector, slate-history state patch, docs, and Chromium document-state example proof passed. | keep |
| controlled-history-preview | slate-history / example | complete | P1 | Product AI snapshot maps to generic preview accept/cancel pattern. | Local preview state stays unsaved, cancel is history-free, accept is one undoable document edit, and undo/redo do not resurrect preview UI. | keep |
| clipboard-middleware-example | slate / plite-dom | complete | P1 | Product paste/copy policies map to middleware, not core DOCX policy. | DOM clipboard middleware consumes custom paste and delegates fallback; fragment query middleware strips transient copy metadata; docs route product formats out of core. | keep |
| provenance-local-only | slate / docs | complete | P2 | Provenance still matters locally; Yjs proof is deferred. | Commit tags, `metadata.origin`, and `persist: false` local provenance state are documented/tested without serializing runtime IDs or claiming distributed provenance. | keep |
| static-render-docs | slate-layout / docs | complete | P2 | Static rendering belongs above core and `plite-layout` is experimental. | Package/library docs state headless/static output is derived geometry and not authoritative PDF/print/collab layout without product engine/proof; package tests pass. | keep |
| behavior-proof | slate-auto | complete | P0 | Prove in-scope behavior before perf. | Source-mining behavior rows P1-P9 pass; broad stable sweep is out of scope. | scoped |
| oracle-repair | slate-patch / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | New oracles added/kept for transaction, runtime IDs, editable islands, annotations, preview, clipboard, provenance, and layout docs. | keep |
| visual-proof | Browser / Playwright | complete | P0 | Prove visible editor behavior and native selection. | Browser-visible touched routes passed in Chromium; package-only packets are N/A. | scoped |
| plite-browser-promotion | plite-browser | complete | P1 | Promote repeated browser proof into reusable API/helper. | N/A: no repeated browser proof trick appeared beyond existing harness usage. | scoped |
| mobile-claim-width | slate-auto | complete | P1 | Separate raw-device proof from viewport proof. | N/A: no mobile/raw-device claim made. | scoped |
| huge-document-smoke | slate-ar-stabilize | complete | P1 | Smoke huge-doc correctness without broad architecture work. | N/A: huge-doc/pagination explicitly outside this source-mining packet run. | scoped |
| perf-packet | slate-ar-fast / slate-ar-perf | complete | P2 | Optimize only after correctness is green. | N/A: no perf packet. | scoped |
| supervision-mode | slate-auto | complete | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from north-star and evidence. | N/A: no timed minimum runtime. | scoped |
| consolidation | slate-auto | complete | P1 | Move accepted reusable decisions to durable docs/rules. | Durable docs updated for runtime identity, preview, clipboard, local provenance, and layout claim width. | keep |
| final-handoff | slate-auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows filled in plan and final response will summarize. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded by source-mining rows |
| 0 | split/add/update | checkpoint-zero, gap-scan, source-mining packets | user accepted final packet list; live source quick audit from previous turn | Generic automation rows were too vague for this dossier-driven run. | checkpoint-zero complete; packet rows added |
| 1 | update/reprioritize | status, gap-scan, transaction-atomicity, runtime-id-docs-proof | focused source audit plus P0 transaction proof | Live v2 had most primitives, but transform-level `withoutNormalizing` normalized inside outer updates. | transaction packet kept; next runtime-id docs/proof |
| 2 | update/reprioritize | runtime-id-docs-proof, editable-island-proof | focused runtime docs/proof packet | Public README did not explain runtime identity even though source/tests already had the primitive. | runtime-id packet kept; next editable island browser proof |
| 3 | update/reprioritize | editable-island-proof, annotation-hardening | Playwright editable-voids slice and new child-root copy/cut test | Existing browser coverage was strong, but child-root copy/cut was only implied by lower-level clipboard tests. | editable island packet kept; next annotation hardening |
| 4 | update/reprioritize | annotation-hardening, state-field-policy | annotation package tests and persistent-annotation browser proof | Existing store coverage was strong; browser example lacked delete/collapse semantics. | annotation packet kept; next state field/history policy |
| 5 | no runtime change / reprioritize | state-field-policy, controlled-history-preview | React selector, slate-history document-state, docs, and document-state Playwright proof | State-field policy already has exact package and browser owners; adding API would be duplicate surface. | state-field packet kept; next controlled-history preview |
| 6 | add / reprioritize | controlled-history-preview, clipboard-middleware-example | New document-state history contract and history docs section | Rollback/history flags existed separately, but no generic accept/cancel preview contract owned the app pattern. | controlled preview packet kept; next clipboard middleware |
| 7 | add / no public API expansion | clipboard-middleware-example, provenance-local-only | New DOM clipboard and core fragment-query contracts plus plugins docs | Source-mining copy/paste policy maps to existing extension slots; a new outbound clipboard hook would be avoidable API debt. | clipboard packet kept; next provenance local-only |
| 8 | add / scope-limit | provenance-local-only, static-render-docs | New commit metadata local provenance contract and editor docs section | User deferred Yjs/collab; local tags/metadata/state are enough for v2 provenance UI without durable node fields. | provenance packet kept; next static render docs |
| 9 | update / scope-limit | static-render-docs, consolidation | Plite-layout docs and package tests | Static/headless layout exists, but must stay derived/experimental and not become a pagination/export architecture claim in this run. | static render packet kept; next consolidation |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell,
  visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command,
  exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become
  too large.
- Merge checkpoints when overlap confuses routing or two rows always close
  together.
- Retire or remove checkpoints that are stale, superseded, irrelevant,
  duplicated, or contradicted by current evidence. Record the reason in the
  mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current
  evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The
  user's latest request, `vision`, and current source evidence outrank
  stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Accepted packet list and non-goals copied into objective, boundaries, threshold, and checkpoint rows. |
| `plite-auto` source rule read | yes | `.agents/skills/slate-auto/SKILL.md` and `.agents/rules/slate-auto.mdc` read before implementation. |
| `vision` read as checkpoint zero | yes | `.agents/skills/vision/SKILL.md` read; relevant taste rows match current scope. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this active goal. |
| Invocation mode and timebox recorded | yes | Full-loop mode; no minimum runtime/deadline because prompt omitted duration. |
| Dynamic checkpoint policy accepted | yes | Checkpoint supervisor rows are mutable; source-mining-specific rows added. |
| Source of truth and allowed workspaces recorded | yes | Boundaries section names live `.tmp/plite` and parent docs scope. |
| Output budget strategy recorded | yes | Known owner files first; broad scans use file/count preflights or scratch artifacts. |
| Private-alpha release/PR boundary recorded | yes | Constraints and non-goals exclude release, PR, changeset, publish. |
| Browser proof strategy recorded | yes | Editable-voids and persistent-annotation-anchors routes are primary visual proof surfaces. |
| Package/API proof strategy recorded | yes | Verification surface names package owners and focused test families. |
| Mobile/raw-device claim-width policy recorded | yes | Raw mobile/device proof out of scope; no Playwright viewport proof will be called raw-device proof. |
| Skill repair authority and source-rule boundary recorded | yes | Agent/skill surfaces marked N/A unless a reusable workflow miss appears; source-rule-only repair rule applies. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining
      backlog ladder, and supervision-mode fallback are recorded.
- [x] Checkpoint supervisor table has been reconciled at least once after the
      initial seed.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split,
      merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-tree/status packet recorded before new runtime patches.
- [x] Behavior proof packet recorded for every in-scope stable editor family or
      explicitly skipped/deferred with reason.
- [x] Visual/native selection proof packet recorded for browser-visible
      selection/editing risks or explicitly scoped.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or
      deferred with owner and proof command.
- [x] Repeated browser proof patterns are promoted to `plite-browser` or queued
      with reason.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited;
      Playwright viewport proof is not recorded as raw-device proof.
- [x] Huge-document correctness smoke is run or deferred with owner and reason.
- [x] Perf packet runs only after correctness is green, or is marked N/A for
      this run.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are
      audited when in scope.
- [x] Docs/north-star/rule consolidation is applied when a reusable decision is
      accepted, or marked N/A.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the
      owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark,
      docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or
      marked N/A with reason.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or
      prompt/tooling changes, or marked N/A with reason.
- [x] Output budget discipline is followed: broad scans are capped or written
      to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run the proof commands/artifacts named in this plan | P1-P9 proof commands passed; source-mining accepted packets closed. |
| Dynamic checkpoint reconciliation | complete | Prove the plan was updated from evidence and not frozen to the initial seed | Mutation rows 1-9 recorded; checkpoints added/reprioritized from live source evidence. |
| Workspace authority proof | complete | Record cwd/tool for each Plite, parent-docs, skill, browser, package, or benchmark proof | Plite commands ran from `.tmp/plite` or package cwd; plan edits ran from parent repo. |
| Behavior gates | complete | Run focused stable behavior proof or record scoped defer rows | In-scope behavior is source-mining packet behavior; package and browser proof rows pass. |
| Visual/native selection proof | complete | Record Browser/Playwright/native-selection evidence or scoped blocker | Editable-islands and annotation browser-visible risks proved in Chromium; non-browser package packets are N/A. |
| Missing oracle repair | complete | Add/verify/revert/quarantine oracle packets or record owner defer | New oracles P1-P4 and P6-P9 kept; P5 kept existing coverage with proof. |
| `plite-browser` promotion | complete | Add/verify helper/API or record queue/defer reason | N/A: no repeated browser proof trick appeared beyond existing harness usage. |
| Mobile/raw-device claim width | complete | Run raw-device proof or record that only scoped viewport/browser proof is available | N/A/out of scope: no mobile/raw-device claim made in this run. |
| Huge-document correctness smoke | complete | Run focused huge-document behavior smoke or record owner defer | N/A/out of scope: source-mining packet run excluded pagination/huge-doc architecture. |
| Package/API proof | complete | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | Package proof rows pass; no new public API added. |
| Skill/rule sync | complete | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | N/A: no `.agents/**` source edited in this run. |
| Changed list / review attention / stopping checkpoints | complete | Fill final handoff ledgers from current packet evidence | Changed list, needs-attention, and stopping checkpoints filled in plan for final handoff. |
| Final lint/check | complete | Run scoped lint/check or record why no code changed | `bun check` passed from `.tmp/plite` after formatting fixes. |
| Workflow slowdown review | complete | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Bun package-root path-filter slowdown logged; package-cwd workaround used. |
| Agent-native review for agent/tooling changes | complete | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no `.agents/**`, commands, skills, hooks, or prompt/tooling source changed. |
| Autoreview for non-trivial implementation changes | complete | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local` from `.tmp/plite`: clean, no accepted/actionable findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-source-mining-coverage-hardening.md` | Passed after stale final rows were updated. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Prompt requirements, non-goals, source truth, full-loop mode, start gates, and source-mining packet rows recorded. | status |
| Status and current-tree closure | complete | Inspected transaction/range-ref/editable-island/annotation/state/history owner tests before first runtime patch. | gap scan |
| Gap scan and scenario matrix | complete | Accepted source-mining packets closed through P1-P9. | runtime-id-docs-proof |
| Transaction atomicity packet | complete | Added runtime-id multi-node replacement atomicity/rollback contract; fixed transform-level mid-update normalization. | runtime-id-docs-proof |
| Runtime ID docs/proof packet | complete | Added package README runtime identity section and public state/tx runtime-id structural draft test. | editable-island-proof |
| Editable island proof packet | complete | Added child-root copy/cut browser oracle and ran representative Chromium editable-voids slice. | annotation-hardening |
| Annotation hardening packet | complete | Added example delete-anchor affordance/test; package and browser annotation proof pass. | state-field-policy |
| State field policy packet | complete | Existing coverage kept: React selector isolation, slate-history state patch semantics, document-state docs, and 11 Chromium browser example proofs passed. | controlled-history-preview |
| Controlled history preview packet | complete | Added no-AI controlled preview contract and docs: local preview state is `persist: false` / `history: 'skip'`, cancel clears it without history, accept applies the document edit as one undoable batch. | clipboard-middleware-example |
| Clipboard middleware packet | complete | Added DOM paste policy and core fragment sanitation contracts plus docs. Kept API surface small: no outbound clipboard hook because `queries.fragment.get` already owns copied/dragged Plite fragment cleanup. | provenance/static-render docs |
| Provenance and static-render docs packets | complete | Local provenance closed; static/off-editor rendering claim width tightened and package tests pass. | consolidation |
| Consolidation and review | complete | Docs/plan consolidated; final gates passed. | final handoff |
| Final handoff and goal-plan check | complete | `bun check` and autoreview passed; first goal checker run only found stale final rows. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| transaction atomicity | core document roots + runtime ids | package contract | multi-node replace, throw rollback | commit count, no mid-normalize, final value, rollback | complete |
| runtime ids | moved/split/fragment-inserted blocks and leaves | package contract + docs/example | resolve by runtime id after structural edit | path resolution, no persisted node id, current API naming | complete |
| editable islands | editable void with same-runtime child root + native inputs | chromium first; widen if touched proof changes | copy/cut, paste, mouse caret, boundary nav, shift selection, cross-root parent selection | model selection, native text, DOM/caret, no outer text mutation | complete |
| annotations | bookmark-backed sidecar store + projection buckets | package contract + example route | insert/delete/collapse/overlap/large locality | projected ranges, subscribers, metrics, browser sidebar/widget | complete |
| state fields | state + document body + history | package contract + browser example | body edit, state edit, undo/redo, persist snapshot, focus transfer | selector render count, history stack, serialized state, input focus, model selection | complete |
| controlled history | no-AI preview changes | package contract + docs | preview, cancel, accept, undo, redo | value, history stack, no preview state patch, no preview resurrection | complete |
| clipboard middleware | text/fragment + transient mark | package contracts + docs | paste consume/delegate, copy strip transient | DataTransfer handler order, fallback text insert, fragment sanitation, source value unchanged | complete |
| provenance local-only | tags + metadata + local state | package contract + docs | paste/import provenance label | commit tags, `metadata.origin`, local state, serialized JSON | complete |
| static rendering | off-editor rendering/layout projection | docs/source audit + package tests | docs/package claim width, headless layout proof | experimental label, derived geometry, no worker/export/pagination promotion | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| P0 | 0 | slate-auto | Checkpoint zero plan hardening. | `docs/plans/2026-06-15-source-mining-coverage-hardening.md`; skill/north-star/source reads. | N/A: planning only. | keep | status/gap-scan |
| P1 | 1 | slate-patch / tdd | Runtime-id addressed multi-node replacement could publish/normalize partial state inside one update. | Changed `.tmp/plite/packages/plite/src/editor/without-normalizing.ts`; added `.tmp/plite/packages/plite/test/transaction-contract.ts`; commands below. | Package proof: no publish/no normalizer during callback, one structural commit after callback, rollback has zero publish. | keep | runtime-id-docs-proof |
| P2 | 2 | slate-auto / tdd / docs | Runtime ids are public but under-explained; docs must prevent persisted node-id confusion. | Changed `.tmp/plite/packages/plite/README.md`; added `.tmp/plite/packages/plite/test/state-tx-public-api-contract.ts`; commands below. | Package proof: runtime ids resolve through insert/move/split/fragment draft edits and are absent from serialized value JSON. | keep | editable-island-proof |
| P3 | 3 | Playwright / slate-patch | Same-runtime editable void child-root copy/cut lacked direct browser proof. | Changed `.tmp/plite/playwright/integration/examples/editable-voids.test.ts`; ran focused and representative Chromium commands. | Browser proof: copy/cut serializes multi-leaf child-root selection, cut deletes only child content, and follow-up outer typing still works. | keep | annotation-hardening |
| P4 | 4 | slate-react / Playwright | Annotation deletion semantics were package-covered but not browser-visible in the example. | Changed `.tmp/plite/site/examples/ts/persistent-annotation-anchors.tsx` and `.tmp/plite/playwright/integration/examples/persistent-annotation-anchors.test.ts`; commands below. | Package proof plus browser proof: deleting annotated text collapses bookmark/sidebar/widget instead of inventing core annotation deletion. | keep | state-field-policy |
| P5 | 5 | slate-react / slate-history / Playwright | State fields might need a source-mining promotion, but live v2 may already own the policy. | No runtime change. Ran `bun test ./packages/plite-react/test/state-field-selector-contract.tsx`; `bun test ./packages/plite-history/test/document-state-history-contract.ts`; `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/document-state.test.ts --project=chromium`. | Package/browser proof: selector isolation, history push/skip, absent-field undo, compact patches, state-only focus preservation, unfocused selection preservation, remote replay, and metadata-not-content example all pass. | keep | controlled-history-preview |
| P6 | 6 | slate-history / docs | Preview accept/cancel could be implemented badly by mutating document content during preview and trying to retroactively accept history. | Changed `.tmp/plite/packages/plite-history/test/document-state-history-contract.ts` and `.tmp/plite/docs/libraries/slate-history/history.md`; ran focused history/docs commands. | Package proof: preview field is local/unsaved, cancel does not touch history, accept is one undoable document batch with no preview state patch, undo/redo keep preview cleared. | keep | clipboard-middleware-example |
| P7 | 7 | slate / plite-dom / docs | Product paste/copy policies could leak into core as hardcoded DOCX/product behavior or a broad outbound clipboard API. | Changed `.tmp/plite/packages/plite-dom/test/clipboard-boundary.ts`, `.tmp/plite/packages/plite/test/query-extension-contract.ts`, and `.tmp/plite/docs/concepts/08-plugins.md`; commands below. | Package proof: custom paste middleware consumes app payload and delegates fallback text; fragment query middleware strips transient copy metadata without mutating source content. | keep | provenance-local-only |
| P8 | 8 | slate / docs | Provenance could drift into durable node fields or Yjs claims despite collab being deferred. | Changed `.tmp/plite/packages/plite/test/commit-metadata-contract.ts` and `.tmp/plite/docs/concepts/07-editor.md`; commands below. | Package proof: tags and `metadata.origin` label the commit, local provenance state is readable, saved value excludes local state and runtime IDs. | keep | static-render-docs |
| P9 | 9 | slate-layout / docs | Static/headless layout could be overclaimed as authoritative export, print, collaboration, or pagination architecture. | Changed `.tmp/plite/docs/libraries/slate-layout/README.md`, `.tmp/plite/packages/plite-layout/README.md`, and `.tmp/plite/packages/plite-layout/test/page-layout-contract.test.ts`; commands below. | Package proof: docs remain experimental/proof-gated and `createPliteLayout` works without browser canvas; full slate-layout package tests pass. | keep | consolidation |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| source-mining accepted packets | `.tmp/plite` packages/examples | focused source read first; commands after patch | N/A | pass | status/gap-scan |
| transaction atomicity | `.tmp/plite/packages/plite` | `bun test ./packages/plite/test/transaction-contract.ts`; normalization/runtime adjacent commands | N/A | pass | runtime-id-docs-proof |
| runtime identity | `.tmp/plite/packages/plite` | `bun test ./packages/plite/test/state-tx-public-api-contract.ts`; public-surface runtime grep; runtime ids index spec | N/A | pass | editable-island-proof |
| editable islands | `.tmp/plite/playwright/integration/examples/editable-voids.test.ts` | `PLAYWRIGHT_RETRIES=0 bun run playwright ... --project=chromium --grep "same-runtime child-root caret usable|moves across editable void child-root boundaries|extends keyboard selection|pastes text inside same-runtime child root|copies and cuts same-runtime|ignores a parent selection"` | Chromium | pass | annotation-hardening |
| annotations | `.tmp/plite/packages/plite-react` + persistent-annotation example | `bun test ./packages/plite-react/test/annotation-store-contract.tsx`; `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/persistent-annotation-anchors.test.ts --project=chromium` | Chromium | pass | state-field-policy |
| state fields | `.tmp/plite/packages/plite-react`, `.tmp/plite/packages/plite-history`, document-state example | `bun test ./packages/plite-react/test/state-field-selector-contract.tsx`; `bun test ./packages/plite-history/test/document-state-history-contract.ts`; `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/document-state.test.ts --project=chromium` | Chromium | pass | controlled-history-preview |
| controlled preview | `.tmp/plite/packages/plite-history` + history docs | `bun test ./packages/plite-history/test/document-state-history-contract.ts --test-name-pattern "controlled preview"`; `bun test ./packages/plite-history/test/document-state-history-contract.ts`; `bun test ./packages/plite/test/public-surface-contract.ts --test-name-pattern "history|docs|README|readme"`; package-cwd README contract | N/A | pass | clipboard-middleware-example |
| clipboard policy | `.tmp/plite/packages/plite-dom`, `.tmp/plite/packages/plite`, plugin docs | `bun test ./packages/plite-dom/test/clipboard-boundary.ts --test-name-pattern "clipboard middleware"`; `bun test ./packages/plite/test/query-extension-contract.ts --test-name-pattern "transient copy"`; full owner files and public-surface docs slice | N/A | pass | provenance-local-only |
| local provenance | `.tmp/plite/packages/plite` + editor docs | `bun test ./packages/plite/test/commit-metadata-contract.ts --test-name-pattern "local provenance"`; `bun test ./packages/plite/test/commit-metadata-contract.ts`; public-surface metadata/docs slice | N/A | pass | static-render-docs |
| static layout claim width | `.tmp/plite/packages/plite-layout` + layout docs | package-cwd `bun test ./test/page-layout-contract.test.ts --test-name-pattern "public docs|headless layout"`; package-cwd `bun test`; public-surface layout/docs slice | N/A | pass | consolidation |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| editable islands | child-root and outer model selection checked through harness | child-root multi-leaf text copied/cut | mouse caret, keyboard boundary, and cross-root DOM selection rows passed | Playwright Chromium slice | pass |
| persistent annotations | sidebar/projection range checked | N/A | collapsed bookmark and widget panel checked after delete | Playwright Chromium persistent-annotation spec | pass |

plite-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | No repeated browser helper pattern appeared; used existing `plite-browser` harness APIs. | N/A | Existing Playwright commands passed. | No promotion this run. |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| None | N/A | N/A | N/A | No mobile/raw-device claim made; user already deferred raw mobile until a real lane exists. |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | Out of scope: source-mining hardening excluded huge-doc/pagination architecture unless a packet forced it. |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Root-cwd Bun path filter for package `*.test.ts` files | slate-history / slate-layout / bun | ~2 min | Bun treated exact package `*.test.ts` paths as unmatched filters from repo root and kept asking for another `./`. | Package README contract passed from `.tmp/plite/packages/plite-history`; slate-layout docs/headless contract passed from `.tmp/plite/packages/plite-layout`. | No skill repair: package-cwd command is enough; log as command pitfall. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `.tmp/plite/packages/plite/src/editor/without-normalizing.ts`: defer transform-level normalization to the outer transaction when already inside one. |
| tests/oracles/browser proof | `.tmp/plite/packages/plite/test/transaction-contract.ts`: added runtime-id multi-node replace atomicity and rollback oracle. `.tmp/plite/packages/plite/test/state-tx-public-api-contract.ts`: added runtime-id structural draft/serialization oracle. `.tmp/plite/packages/plite/test/query-extension-contract.ts`: added transient copy metadata fragment-query oracle. `.tmp/plite/packages/plite/test/commit-metadata-contract.ts`: added local provenance persistence-boundary oracle. `.tmp/plite/packages/plite-history/test/document-state-history-contract.ts`: added controlled preview accept/cancel history oracle. `.tmp/plite/packages/plite-dom/test/clipboard-boundary.ts`: added clipboard paste middleware consume/delegate oracle. `.tmp/plite/packages/plite-layout/test/page-layout-contract.test.ts`: tightened static/headless docs contract. `.tmp/plite/playwright/integration/examples/editable-voids.test.ts`: added child-root copy/cut browser oracle. `.tmp/plite/playwright/integration/examples/persistent-annotation-anchors.test.ts`: added collapsed-anchor delete browser oracle. |
| benchmarks/metrics/targets | N/A: no perf packet in this source-mining run. |
| examples/docs | `.tmp/plite/packages/plite/README.md`: added runtime identity section. `.tmp/plite/docs/concepts/07-editor.md`: added local provenance guidance. `.tmp/plite/docs/libraries/slate-history/history.md`: added controlled preview guidance. `.tmp/plite/docs/concepts/08-plugins.md`: added clipboard ingress and fragment sanitation guidance. `.tmp/plite/docs/libraries/slate-layout/README.md` and `.tmp/plite/packages/plite-layout/README.md`: tightened static/headless claim width. `.tmp/plite/site/examples/ts/persistent-annotation-anchors.tsx`: added delete-anchor-text control. |
| skills/workflow | N/A: no `.agents/**` source edited; Bun package-cwd command pitfall logged only. |
| reverted/quarantined packets | None. Two oracle expectations were corrected before keep: editable-void outer-selection expectation and controlled-preview operation list. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `withoutNormalizing` transaction boundary fix | It changes when normalization flushes inside nested transform/update paths; tests are good, but this is the only runtime behavior change. | `.tmp/plite/packages/plite/src/editor/without-normalizing.ts` | Review first. |
| 2 | Controlled preview policy | The docs intentionally say previews should not mutate document content until accept. That is strong taste, not just mechanics. | `.tmp/plite/docs/libraries/slate-history/history.md` | Confirm this is the public guidance you want. |
| 3 | Clipboard outbound policy | I did not add outbound clipboard middleware; copy/drag cleanup goes through `queries.fragment.get`. | `.tmp/plite/docs/concepts/08-plugins.md` | Review if you expected a separate clipboard write hook. |
| 4 | Static layout claim width | `plite-layout` stays experimental and non-authoritative for PDF/print/collab without product proof. | `.tmp/plite/docs/libraries/slate-layout/README.md` | Review wording only. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | No blocker. | Accepted source-mining packets all closed or scoped. | None. | Final gates. | Continue with review/check, then handoff. | This plan. |

Findings:
- Live v2 already has strong transaction, runtime-id, editable-island,
  annotation, state-field, and history owners. The first real source-mining
  gap was not missing API surface; it was transform-level normalization running
  before an outer update callback exited.
- `Editor.withoutNormalizing` flushed normalization at the end of each
  primitive transform even inside `editor.update`, so a multi-step public tx
  could expose normalizer work before the batch boundary. Deferring that flush
  to the outer transaction preserves standalone transform normalization while
  restoring batch atomicity.
- Runtime ids were present in API and tests but under-documented at the package
  entry. The README now states the architectural rule: runtime ids are local
  editor identity, not serialized product/document identity.
- Editable-void child-root coverage was already broad for native click, arrow,
  paste, cross-root selection, and boundary navigation. Direct copy/cut proof
  was missing and is now covered by a multi-leaf child-root browser oracle.
- Persistent annotation delete semantics are collapsed-anchor semantics, not
  automatic annotation removal. Package coverage already proved stale-range
  nulling, overlap/order, metrics, and large locality; the browser example now
  visibly proves the collapsed bookmark/sidebar/widget behavior.
- State fields do not need a new primitive. Live v2 already has the right
  split: persisted/shared state fields, local `persist: false` fields, history
  push/skip policy, compact patches for large state, React selector isolation,
  and browser proof that metadata changes do not steal focus or hide in nodes.
- Controlled previews should be app-owned state until accepted. The accepted
  pattern is: render preview from local `persist: false` / `history: 'skip'`
  state, cancel by clearing it, accept by clearing it and applying the real
  document edit as one normal history batch.
- Clipboard policy should stay split: app/product paste formats belong in
  `clipboard.insertData` and copied/dragged Plite fragment cleanup belongs in
  `queries.fragment.get`. A new outbound clipboard middleware would duplicate
  the fragment-query boundary.
- Provenance is local-first in this run. Tags and `metadata.origin` label
  commits; `persist: false` state fields can drive local chrome. Runtime IDs
  remain local and Yjs/collab provenance stays deferred.
- Static/headless layout stays a derived experimental surface. `plite-layout`
  can support previews, tests, and export planning, but authoritative PDF,
  print, collaboration, or pagination architecture needs a product-owned
  measurement engine and proof.

Decisions and tradeoffs:
- Kept the fix in `without-normalizing.ts` instead of special-casing the new
  test path. This is the long-term owner: all transform-level batching shares
  the same boundary.
- Did not introduce an AI-specific preview API. The generic transaction/runtime
  primitive now owns the invariant.
- Kept runtime ids local. No persisted node-id field, node-id alias, or public
  product identity primitive was added.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First oracle edit used the internal transaction helper for `tx.nodes`, then accidentally converted an existing internal test to `editor.update`. | 2 | Keep internal helper tests internal; use public `editor.update` only for public tx facade proof. | Fixed test placement; full transaction contract now passes. |

Verification evidence:
- From `.tmp/plite`:
  - `bun test ./packages/plite/test/transaction-contract.ts --test-name-pattern "runtime-id multi-node replacement"`: pass.
  - `bun test ./packages/plite/test/snapshot-contract.ts --test-name-pattern "withoutNormalizing"`: pass.
  - `bun test ./packages/plite/test/transaction-contract.ts`: 36 pass.
  - `bun test ./packages/plite/test/normalization-contract.ts`: 14 pass.
  - `bun test ./packages/plite/test/snapshot-contract.ts --test-name-pattern "withoutNormalizing|normalizeNode removes|normalizeNode inserts|normalizeNode flattens"`: 9 pass.
  - `bun test ./packages/plite/test/transaction-target-runtime-contract.ts`: 4 pass.
  - `bun test ./packages/plite/test/state-tx-public-api-contract.ts`: 19 pass.
  - `bun test ./packages/plite/test/editor-runtime-view-contract.ts --test-name-pattern "node|insert|remove|transaction|runtime"`: 54 pass.
  - `bun test ./packages/plite/test/transforms-contract.ts --test-name-pattern "insert|remove|withoutNormalizing|normaliz"`: 7 pass.
  - `bun test ./packages/plite/test/state-tx-public-api-contract.ts --test-name-pattern "runtime ids through structural"`: 1 pass.
  - `bun test ./packages/plite/test/state-tx-public-api-contract.ts`: 20 pass.
  - `bun test ./packages/plite/test/public-surface-contract.ts --test-name-pattern "README|public|exports|tx|runtime"`: 893 pass.
  - `bun test ./packages/plite/test/index.spec.ts --test-name-pattern "runtime ids"`: 1 pass.
  - `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "copies and cuts same-runtime"`: 1 pass after oracle correction.
  - `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "same-runtime child-root caret usable|moves across editable void child-root boundaries|extends keyboard selection|pastes text inside same-runtime child root|copies and cuts same-runtime|ignores a parent selection"`: 6 pass.
  - `bun test ./packages/plite-react/test/annotation-store-contract.tsx --test-name-pattern "stale resolved ranges|partial annotation projection|large annotation locality|annotation metrics|only affected runtime buckets"`: 4 pass.
  - `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/persistent-annotation-anchors.test.ts --project=chromium --grep "anchored text is deleted"`: 1 pass after oracle correction.
  - `bun test ./packages/plite-react/test/annotation-store-contract.tsx`: 14 pass.
  - `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/persistent-annotation-anchors.test.ts --project=chromium`: 2 pass.
  - `bun test ./packages/plite-react/test/state-field-selector-contract.tsx`: 1 pass.
  - `bun test ./packages/plite-history/test/document-state-history-contract.ts`: 8 pass.
  - `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/document-state.test.ts --project=chromium`: 11 pass.
  - `bun test ./packages/plite-history/test/document-state-history-contract.ts --test-name-pattern "controlled preview"`: 1 pass after oracle correction.
  - `bun test ./packages/plite-history/test/document-state-history-contract.ts`: 9 pass.
  - `bun test ./packages/plite/test/public-surface-contract.ts --test-name-pattern "history|docs|README|readme"`: 568 pass.
  - From `.tmp/plite/packages/plite-history`: `bun test ./test/package-readme-contract.test.ts`: 2 pass.
  - `bun test ./packages/plite/test/query-extension-contract.ts --test-name-pattern "transient copy"`: 1 pass.
  - `bun test ./packages/plite-dom/test/clipboard-boundary.ts --test-name-pattern "clipboard middleware"`: 1 pass.
  - `bun test ./packages/plite/test/query-extension-contract.ts`: 8 pass.
  - `bun test ./packages/plite-dom/test/clipboard-boundary.ts`: 38 pass.
  - `bun test ./packages/plite/test/public-surface-contract.ts --test-name-pattern "clipboard|fragment|middleware|docs|README|readme"`: 561 pass.
  - `bun test ./packages/plite/test/commit-metadata-contract.ts --test-name-pattern "local provenance"`: 1 pass.
  - `bun test ./packages/plite/test/commit-metadata-contract.ts`: 7 pass.
  - `bun test ./packages/plite/test/public-surface-contract.ts --test-name-pattern "metadata|docs|README|readme|tag"`: 560 pass.
  - From `.tmp/plite/packages/plite-layout`: `bun test ./test/page-layout-contract.test.ts --test-name-pattern "public docs|headless layout"`: 1 pass.
  - From `.tmp/plite/packages/plite-layout`: `bun test`: 51 pass.
  - `bun test ./packages/plite/test/public-surface-contract.ts --test-name-pattern "plite-layout|layout|docs|README|readme"`: 568 pass.
  - `bun check`: pass after formatting fixes.
  - `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local` from `.tmp/plite`: clean, no accepted/actionable findings.
  - `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-source-mining-coverage-hardening.md`: pass.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-15-source-mining-coverage-hardening.md`.
- Surface and route/package: `.tmp/plite` packages, docs, site examples,
  and focused Playwright example routes.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop,
  no timebox, 10 loops including checkpoint-zero and consolidation.
- Behavior gates and visual proof: focused package proof plus Chromium example
  proof for editable islands, annotations, and document state.
- Primary metric baseline/latest/best and stop reason: N/A; no perf packet.
  Stop reason: accepted source-mining packets closed and no blocker remains.
- Bugs fixed and oracles added: see Changed list and Packet ledger P1-P9.
- Benchmark/skill/docs repairs: no benchmark or skill repair; docs repaired in
  runtime identity, history preview, plugin clipboard, local provenance, and
  slate-layout claim-width docs.
- Workflow slowdowns and repairs: Bun package `*.test.ts` root-cwd path filter
  quirk logged; package-cwd command is the workaround.
- Changed list: see Changed list.
- Needs your attention: see ranked list above.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: collab/Yjs, mobile/raw-device,
  huge-doc/pagination/perf, and authoritative static export proof are deferred
  by scope, not silently claimed.
- Next owner: user review of the four attention rows; commit if desired.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Source-mining packets, consolidation, review, and check-complete are closed. |
| Where am I going? | Handoff only; user review of the four attention rows, then commit if desired. |
| What is the goal? | Harden Plite source-mining coverage before public beta without importing bad architecture. |
| What have I learned? | See Findings: first gap was mid-update normalization; second was docs clarity around local runtime identity; third was missing direct child-root copy/cut browser proof; fourth was missing visible annotation delete/collapse proof; state fields were already well-owned; preview needs local-state-first docs; clipboard should use existing ingress/query slots; provenance stays local-only until Yjs work starts; static layout must not overclaim export authority. |
| What have I done? | See Timeline and Packet ledger. |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-06-15T14:03:08.094Z Goal plan created.
- 2026-06-15T14:12:10Z P0 transaction atomicity packet kept.
- 2026-06-15T14:24:00Z Runtime ID docs/proof packet kept.
- 2026-06-15T14:36:00Z Editable island browser proof packet kept.
- 2026-06-15T14:49:00Z Annotation hardening packet kept.
- 2026-06-15T15:00:00Z State-field policy packet kept with no runtime patch.
- 2026-06-15T15:10:00Z Controlled-history preview packet kept.
- 2026-06-15T15:20:00Z Clipboard policy packet kept.
- 2026-06-15T15:28:00Z Local provenance packet kept.
- 2026-06-15T15:36:00Z Static/headless layout docs packet kept.

Open risks:
- No open source-mining work. Deferred scopes remain collab/Yjs,
  mobile/raw-device, huge-doc/pagination/perf, and authoritative static export
  proof.
