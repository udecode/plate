# Portable Text Architecture Steal Review

Objective:
Close a source-backed Slate Plan for what Slate v2 should steal from local
`../portabletext`, after adding Portable Text to the durable editor architecture
candidate/rule evidence set. This planning lane runs one pass per activation and
stays pending until every pass, issue/reference decision, verification row,
score threshold, and final user-review handoff is closed.

Goal plan:
docs/plans/2026-05-28-portable-text-architecture-steal-review.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- none

Completion threshold:
- Slate Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  issue/reference sync rows are closed, final handoff is emitted, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-portable-text-architecture-steal-review.md`
  passes.
- The final plan must say exactly which Portable Text mechanisms are promoted
  into Slate v2 architecture, which remain Plate/profile-only, and which are
  rejected.

Verification surface:
- Planning-only checks run in `plate-2`: source/reference edits, research link
  integrity, and plan completion check at closure.
- Portable Text evidence uses local source reads under `../portabletext`.
- Any Slate v2 source/runtime/browser/API claim must cite live `Plate repo root`
  source and, before closure, the narrowest relevant `Plate repo root` command or
  an explicit planning-only reason.

Constraints:
- Slate Plan may edit planning, research, issue-ledger, and PR-reference
  artifacts only. Slate v2 implementation belongs to accepted-plan execution
  after user review.
- User explicitly allowed updating candidate docs and skill/rule evidence docs
  that name the existing editor-reference set.
- Do not turn raw Slate into a Portable Text-only editor.

Boundaries:
- Allowed edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`,
  `docs/slate-v2/references/**`.
- User-requested companion edits:
  `docs/analysis/editor-architecture-candidates.md`,
  `.agents/rules/slate-plan.mdc`, `.agents/skills/slate-plan/SKILL.md`, and
  adjacent agent rules/skills that route editor architecture evidence.
- Source reads: local `../portabletext` and live `Plate repo root` source only; no
  live GitHub discovery in this pass.

Blocked condition:
- Do not use blocked while any research, review, ledger, source-grounding,
  score-hardening, or plan-hardening move remains runnable.
- Block only if local `../portabletext` becomes unavailable or a contradictory
  active goal prevents continuing the plan.

Slate Plan lane state:
- slate_plan_lane_status: complete
- current_pass: closure-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: none
- final_handoff_status: complete
- final_handoff: emitted in final chat response

Current verdict:
- verdict: Portable Text is a first-class architecture evidence source for
  schema/profile design, behavior authoring, portability, and behavior-test
  standards; it is not a better Slate v2 runtime engine.
- confidence: 0.9225 after closure/final gates.
- keep / cut / revise call: keep as candidate/evidence source; steal behavior
  action vocabulary and schema-applicability/test standards; defer any raw
  behavior-substrate implementation until existing transform middleware cannot
  cover the need; cut Portable Text value/runtime adoption from raw Slate core.
  The maintainer objection pass hardens that into an optional substrate only,
  never a second product behavior framework. High-risk mode hardens further:
  this plan accepts no current raw-Slate public behavior API. Ecosystem pass
  confirms Plate/profile packages and slate-yjs can use the existing Slate v2
  extension/collab backbone without wrapper mutation or canonical patch drift.
  Revision pass removes the last ambiguity: this is a ready planning verdict,
  not an accepted implementation plan or runtime proof claim.
- reason: local `../portabletext` source shows stronger spec, behavior, schema,
  and browser test discipline, while live `Plate repo root` source already has
  stronger read/update, commit, dirty-runtime-id, multi-root, and collab replay
  mechanics.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every Slate Plan completion
  gate below is satisfied and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-portable-text-architecture-steal-review.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Latest user request invoked Slate Plan and pasted current skill; planning mode applies. |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` created Portable Text architecture steal review lane. |
| Source of truth read before edits | yes | Read `docs/analysis/editor-architecture-candidates.md`, `.agents/rules/slate-plan.mdc`, generated plan, `../portabletext` README/source/docs, and live `Plate repo root` source slices. |
| `docs/solutions` checked for non-trivial existing-code work | yes | `rg "Portable Text|portabletext|behavior API|schema-driven|schema driven" docs/solutions docs/research docs/analysis .agents/rules .agents/skills` found no existing Portable Text architecture docs before this edit. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Read current extension, state/tx, public-state, read/update, commit, and collab-history contract owners in `Plate repo root`. |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected, or marked N/A with reason.
- [x] Live source grounding recorded for every current implementation claim, or
      marked N/A with reason.
- [x] Issue ledger / ClawSweeper pass applied or skipped with concrete evidence.
      ClawSweeper related discovery is skipped with evidence; full issue-ledger
      accounting and issue-sync accounting are complete for this planning slice.
      The manual sync ledger records the no-claim Portable Text planning sync;
      no coverage matrix, fork dossier, cluster file, or PR description update
      is needed.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence, or marked N/A with reason.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Slate maintainer objection ledger complete for every breaking/paradigm
      change.
- [x] Verification workspace gate recorded for every Slate v2 source, runtime,
      browser, package, public API, or issue-fix claim.
- [x] TDD used for behavior/proof changes with a sane test surface, or marked
      N/A with reason. N/A: planning-only review; no behavior implementation
      changed, and future accepted execution must name the exact unit/browser
      rows.
- [x] Browser proof captured for browser-surface claims, or marked N/A with
      reason. N/A: no browser behavior is claimed from this planning pass;
      browser scenario proof is a future execution gate.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Closure pass reconciled score threshold, pass table, issue sync, final handoff, and plan completion check. |
| Slate v2 source, runtime, browser, package, public API, or issue-fix claim | N/A current pass | Record live `Plate repo root` command/proof or mark as planning-only with reason | Planning-only; source audit only. No runtime, browser, package, public API, or issue-fix claim is made. |
| Issue ledger or PR reference changed | yes | Sync the relevant ledger/reference row or record why no sync applies | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:16-57` records the Portable Text no-claim sync; coverage matrix, fork dossier, cluster file, and PR description remain unchanged because no claim/classification text changed. |
| Autoreview for uncommitted implementation changes | N/A current pass | Planning/research/rule docs only; no `Plate repo root` implementation patch. | N/A |
| Final user-review handoff | yes | Emit final handoff or keep the plan pending with the next pass | Final handoff is recorded in this plan and emitted in the final chat response. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-portable-text-architecture-steal-review.md` | `[autogoal] complete: docs/plans/2026-05-28-portable-text-architecture-steal-review.md`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Created plan; added Portable Text to candidate docs and Slate Plan evidence rules; created compiled research source; read local Portable Text and live Slate v2 owners; recorded initial score. | related issue discovery |
| Related issue discovery | complete | Read current live/manual issue ledgers, issue requirements, package-impact matrix, issue coverage matrix, PR reference, and targeted test-candidate maps. ClawSweeper is skipped for this activation because this is planning/research/rule evidence only and changes no Slate v2 implementation, public API, example, PR narrative, or fixed/improved issue claim. Existing ledgers already classify the adjacent behavior/input, clipboard/serialization, decorations/annotations, custom-operation, and collaboration surfaces. | issue-ledger pass |
| Issue-ledger pass | complete | Scanned required `docs/slate-issues` ledgers, gitcrawl live rows/clusters, test-candidate map ranges, benchmark map, package-impact matrix, requirements file, v2 coverage matrix, fork dossier, and PR reference. Result: zero new fixed/improved claims; Portable Text is related evidence for behavior/input, schema/clipboard, annotations/marks, patch/collab, and benchmark-proof standards only. | intent/boundary pass |
| Intent/boundary and decision brief | complete | Tightened the ownership boundary: raw Slate may own only a tiny behavior substrate/protocol when it protects ordering, propagation, update grouping, and proof; Plate/profile packages own Portable Text-shaped behavior presets, schema categories, toolbars, import/export, and CMS content policies. No user question is needed before continuing the planning passes. | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | Expanded the ecosystem synthesis from Portable Text-only into the current hybrid: Slate v2 local source, Lexical, ProseMirror, Tiptap, Portable Text, React 19.2, Pretext/Premirror, and Yjs/slate-yjs. Live `Plate repo root` source refresh confirmed read/update, state/tx groups, extension setup/onCommit/runtimeState, transform middleware, command dispatch, schema queries, commit dirtiness, and collab replay are already the stronger engine substrate. | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Applied Vercel React, performance-oracle, TDD, shadcn, react-useeffect, Evidence Kit, migration, regression, and simplicity pressure. Result: keep the hybrid, but narrow Portable Text to standards plus optional substrate vocabulary; do not build a raw behavior DSL until benchmark/browser proof and maintainer objections pass. Evidence Kit has no missing required artifacts, but stale active artifacts and adapter gaps keep performance claims below closure-ready. | objection ledger |
| Slate maintainer objection ledger | complete | Expanded the ledger from two thin rows into accepted maintainer-review rows for Portable Text evidence routing, optional behavior substrate, schema/profile applicability, browser behavior scenario tests, value/runtime rejection, patch/collab adapter boundaries, and Plate/profile ownership. Every row records pain owner, steelman antithesis, tradeoff, rejected alternative, migration/docs/proof answer, ecosystem answer, and verdict. | high-risk pass |
| High-risk deliberate mode | complete | Ran pre-mortem and expanded proof plan for behavior substrate overreach, schema/profile lock-in, benchmark overclaim, browser-test ceremony, patch/collab confusion, and product UI leakage. Result: no current raw-Slate public API is accepted; behavior vocabulary survives only as future candidate evidence behind insufficiency proof, benchmark proof, and browser scenario proof. | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Added extension/plugin and slate-yjs/collab migration-backbone answers for Portable Text evidence routing, optional behavior substrate, schema/profile adapters, browser scenario tests, value/runtime rejection, patch adapters, and shadcn/profile UI ownership. Result: no current extension/plugin/collab/data-model change is accepted; future work must use existing extension slots, state/tx namespaces, schema specs, operations, commits, and metadata. | revision pass |
| Revision pass | complete | Reconciled scorecard, open questions, proof rows, and objection/high-risk/ecosystem conclusions. Result: plan-readiness score reaches threshold because no current runtime/API implementation is accepted, while all runtime/browser/benchmark proof remains attached to future accepted execution. | issue sync accounting |
| Issue sync accounting | complete | Read live gitcrawl rows, current manual sync ledger, issue-coverage matrix, fork dossier, PR reference, and cluster rows for the affected input, selection, decorations, clipboard, custom-operation, collaboration, and performance surfaces. Added a no-claim Portable Text planning sync to `docs/slate-issues/gitcrawl-v2-sync-ledger.md`; no coverage matrix, fork dossier, cluster, or PR description edit is needed. | closure score and final gates |
| Closure score and final gates | complete | Closed the pass table, score threshold, issue/reference sync, workspace verification rows, final user-review handoff, and completion-check gate. Result: user-review-ready planning lane; execution still requires a separate user-accepted Slate Plan invocation. | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.91 | Revision pass scores plan readiness, not shipped runtime performance. The plan rejects a current behavior dispatcher, keeps React 19.2 as scheduler/subscription evidence only, maps stale Evidence Kit artifacts as future execution gates, and forbids perf-ready claims until active typing, huge-document browser trace, rich-text operations, text/selection, query/ref, refs/projection, and clipboard/collab lanes are refreshed or explicitly owned. |
| Slate-close unopinionated DX | 0.20 | 0.93 | Behavior `on`/`guard`/`actions` and `execute`/`forward`/`raise`/`effect` remain the best vocabulary only as editor-agnostic propagation/update-grouping semantics over existing `editor.update`, command dispatch, and transform middleware. High-risk and ecosystem passes reject any current raw behavior public API, product preset, CMS category, or framework tour. |
| Plate and slate-yjs migration backbone | 0.15 | 0.92 | Live `Plate repo root` migration contracts prove extension state/tx namespaces, schema specs, commit tags, operation replay, and local-only runtime targets without editor-surface namespaces. Ecosystem pass confirms Portable Text-shaped profiles/adapters can ride `state`/`tx`, schema specs, transform middleware, `onCommit`, operations, and commit metadata without wrapper mutation or canonical patch drift. Issue-sync accounting remains a separate bookkeeping pass, not a migration-shape gap. |
| Regression-proof testing strategy | 0.20 | 0.92 | Portable Text's browser behavior specs map to named Slate v2 contracts: transform middleware delegation, hidden-boundary keyboard selection, model-backed hidden copy/paste, projected synced-root commands, DOM coverage scalability, and browser-rich-text replay coverage. Revision pass keeps Gherkin/Racejar out of core and requires future accepted behavior work to name narrow unit/browser/stress rows before making behavior claims. |
| Research evidence completeness | 0.15 | 0.94 | Compiled research covers Portable Text, Lexical, ProseMirror, Tiptap, React 19.2, Pretext/Premirror, Slate v2 local substrate, and Yjs/slate-yjs; pressure, objection, high-risk, and ecosystem passes added Evidence Kit registry/health plus current test/source contract reads. No unresolved research contradiction remains; remaining work is issue accounting and closure state. |
| shadcn-style composability and minimalism | 0.10 | 0.91 | Hidden-content example already uses shadcn Accordion, Collapsible, Tabs, Button, Card, Badge, and Separator around Slate-owned content boundaries. The plan keeps UI policy out of raw Slate and records ToggleGroup-style option controls as future example cleanup only, so composability guidance is clear without bloating core. |

Weighted score after revision pass: 0.9225.

Source-backed architecture north star:
- target shape: Slate v2 keeps read/update, operations, commits, runtime ids,
  multi-root, and React projection as the engine; Portable Text contributes
  spec/profile discipline, schema-applicability selectors, behavior event/action
  semantics, and scenario-shaped browser proof.
- source evidence:
  `docs/research/sources/editor-architecture/portable-text-schema-behavior-and-portability.md`;
  `../portabletext/packages/editor/src/behaviors/behavior.types.action.ts`;
  `../portabletext/packages/editor/src/behaviors/behavior.perform-event.ts`;
  `packages/slate/src/core/public-state.ts`;
  `packages/slate/test/collab-history-runtime-contract.ts`.
- rejected drift: no Portable Text value format as raw Slate core; no XState
  actor runtime copied into Slate v2; no CMS category lock-in.
- migration posture: Plate can expose Portable Text-like profiles/toolbars and
  adapters over Slate v2; raw Slate stays open.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Behavior substrate | Do not build a standalone raw behavior DSL from this plan. Future raw Slate behavior work, if later accepted, should be a minimal editor-agnostic propagation/update-grouping substrate with vocabulary equivalent to `execute`, `forward`, `raise`, and `effect` over `editor.update`, command dispatch, and transform middleware. It must not ship product behavior presets. | Plugin authors get ordered behavior policy without boolean handler chains; Plate can layer richer presets on top. | Additive only if built as an extension/package or thin substrate; no raw Slate value migration and no Portable Text categories in core. | `../portabletext/packages/editor/src/behaviors/behavior.types.action.ts:14-54`; `packages/slate/src/core/transform-middleware.ts:11-40`; `packages/slate/src/core/command-registry.ts:69-119` | defer implementation; keep as substrate vocabulary |
| Schema/profile queries | Make schema applicability a normal docs/example pattern over Slate element specs and `state.schema`, not fixed Portable Text categories. | Toolbars and commands ask "what is allowed here?" through selectors. | Plate can map to Portable Text categories; raw Slate keeps open specs. | `../portabletext/packages/editor/src/selectors/selector.get-applicable-schema.test.ts:129-168`; `packages/slate/src/core/public-state.ts:2096-2140` | keep direction |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Engine runtime | `packages/slate/src/core/public-state.ts` and `packages/slate/src/core/editor-extension.ts` | Keep Slate v2 read/update, state/tx groups, operations, commits, and dirty runtime ids as engine truth. | Replacing a stronger engine with Portable Text's Slate-derived/XState actor orchestration. | `packages/slate/src/core/public-state.ts:2176-2482`; `packages/slate/src/interfaces/editor.ts:1447-1514` | keep |
| Behavior dispatch | Future raw substrate plus Plate/profile presets | Reuse current transform middleware and command dispatch first; add typed semantic event/action chain only if pressure proof shows `next()`/default dispatch cannot express the needed propagation, undo grouping, and effect boundaries. | DOM/input handler chains that lose ordering, undo grouping, and propagation semantics, without turning raw Slate into a product behavior framework. | `../portabletext/packages/editor/src/behaviors/behavior.perform-event.ts:76-150`; `../portabletext/packages/editor/src/behaviors/behavior.perform-event.ts:291-344`; `packages/slate/test/extension-methods-contract.ts:286-345` | steal substrate vocabulary, not a second engine |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Toolbar/schema UI | Selector-first hooks over editor state and schema applicability. | Product layer composes UI; core exposes enough query substrate. | Avoid global editor reads in toolbar render paths; use selector equality. | `../portabletext/packages/editor/src/editor/editor-selector.ts:41-55`; `../portabletext/packages/toolbar/src/use-toolbar-schema.ts:60-88` | Plate keep, Slate docs only |
| Hidden-content product controls | shadcn Accordion, Collapsible, Tabs, Button, Card, Badge, and Separator compose around Slate-owned content boundaries. | Product shell controls are `contentEditable={false}` and Slate owns editable descendants. | Option-set policy controls should use ToggleGroup-style composition in accepted execution/example cleanup; raw Slate should not grow UI policy. | `apps/www/src/app/(app)/examples/slate/_examples/hidden-content-blocks.tsx:21-42`; `apps/www/src/app/(app)/examples/slate/_examples/hidden-content-blocks.tsx:300-425`; `apps/www/src/app/(app)/examples/slate/_examples/hidden-content-blocks.tsx:431-540` | Plate/example keep, minor DX cleanup later |

Plate migration-backbone target:
| Pressure | Slate substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Portable content profiles | Slate element specs plus optional profile/adapters, not a fixed Portable Text AST. | Plate can ship Portable Text import/export, toolbar/schema profiles, and behavior presets over Slate v2. | Raw Slate does not become a CMS editor. | `../portabletext/apps/docs/src/content/docs/specification.mdx:16-33`; `docs/analysis/editor-architecture-candidates.md` | keep |

slate-yjs migration-backbone target:
| Pressure | Slate substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Patch adapters | Slate commits and operations remain canonical; product adapters may derive Portable Text/Sanity-style patches with operation ids. | slate-yjs consumes deterministic Slate operations/state patches; external stores can consume derived patches. | diff-match-patch strings are not Slate's collab truth. | `../portabletext/packages/editor/src/engine-plugins/engine-plugin.patches.ts:108-190`; `packages/slate/test/collab-history-runtime-contract.ts:175-259` | partial |

Intent / boundary record:
- intent: Treat `../portabletext` as a serious architecture candidate, not a
  curiosity. The point is to extract what is actually superior and reject the
  parts that would make raw Slate worse.
- desired outcome: the finished plan gives a user-review-ready keep/reject map:
  Portable Text is durable evidence for spec/profile discipline, schema
  applicability, behavior action semantics, adapter/export posture, and
  scenario-shaped browser tests; it is not Slate's value model or runtime
  engine.
- in-scope behavior: planning docs, research docs, issue/reference accounting,
  skill/rule evidence routing, and source-backed architecture/API
  recommendations for later accepted execution.
- out-of-scope behavior: `Plate repo root` implementation patches, live GitHub
  discovery, issue-fix claims, PR claim changes, migration notes, or any
  Portable Text-shaped core value migration during this planning lane.
- raw Slate boundary: Slate may own a tiny behavior substrate/protocol only when
  it protects editor-agnostic ordering, propagation, update grouping, undo
  boundaries, and proof. It must not ship CMS categories, link policy, toolbar
  policy, Portable Text schema names, or rich-content presets in core.
- Plate/profile boundary: Plate or a profile/adaptor package owns Portable
  Text-like schema profiles, toolbar/application selectors, import/export,
  Sanity/Portable Text patches, CMS content policies, and opinionated behavior
  presets.
- decision boundaries: this plan may hard-cut Portable Text runtime/value
  adoption, promote Portable Text as required evidence for schema/behavior/test
  lanes, and require that any future raw-Slate behavior substrate prove hot-path
  cost before acceptance.
- unresolved user-decision points: none needed to continue planning. A later
  execution decision is required only if the user accepts a plan to build the
  raw behavior substrate or a Plate/profile Portable Text adapter.

Decision brief:
- principles: keep raw Slate unopinionated; preserve Slate operations/commits as
  the canonical model; separate engine truth from product profiles; make
  behavior ordering explicit instead of boolean-handler soup; require browser or
  benchmark proof before any runtime/API claim.
- top drivers: current Slate v2 already has stronger engine primitives than
  Portable Text; Portable Text has stronger behavior/spec/test authoring
  discipline; Plate needs product-grade schema/toolbar/profile DX without
  forcing those opinions into raw Slate.
- viable option A, copy Portable Text deeply: strongest product DX on day one,
  but it imports CMS categories, a value shape, actor runtime, and patch
  semantics that conflict with Slate's open JSON/op-first contract.
- viable option B, ignore Portable Text as CMS-specific: keeps Slate pure, but
  throws away the best behavior/action vocabulary and behavior-test standard in
  the candidate set. That would be lazy, not principled.
- viable option C, raw Slate behavior substrate plus Plate/profile adapters:
  Slate owns only typed propagation/update-grouping semantics; Plate owns
  Portable Text-shaped profiles, schemas, toolbars, presets, and export/import.
  This is the only option that steals the strong part without swallowing the
  product model.
- chosen option: option C. Promote Portable Text as required evidence for
  schema/profile/behavior/test lanes; keep Slate v2's engine; make any future
  raw behavior substrate minimal, optional, benchmarked, and editor-agnostic.
- rejected alternatives: Portable Text value format in raw Slate; Portable Text
  CMS categories as core schema law; XState actor runtime in Slate core;
  diff-match-patch/Sanity patches as Slate collaboration truth; Plate-only
  behavior semantics with no raw substrate if Slate's own input/paste policy
  remains unordered and untestable.
- consequences: future Slate Plan work must cite Portable Text on relevant
  schema/behavior/test lanes; any raw behavior API plan must prove it is a
  substrate, not a product framework; Plate can still move faster with rich
  presets over that substrate.
- follow-ups: pressure passes must test whether the raw behavior substrate
  survives performance, DX, unopinionated-core, migration, regression, and
  simplicity review.

Ownership decision matrix:
| Surface | Raw Slate owner | Plate/profile owner | Rejected owner | Reason |
|---------|-----------------|---------------------|----------------|--------|
| Behavior propagation vocabulary | Optional editor-agnostic substrate if later accepted | Rich presets and product policies | Core product behavior framework | Slate can own ordering semantics; Plate owns the meaning of product behaviors. |
| Schema applicability | Query substrate over open Slate specs/state | Portable Text-like schema categories and toolbar affordances | Fixed Portable Text categories in core | The issue corpus asks for simple JSON plus explicit boundaries, not a CMS model. |
| Portable Text import/export | Generic clipboard/serialization primitives only | Portable Text/Sanity adapters and patch conversion | Core Portable Text value format | Raw Slate should not become an interchange format implementation. |
| Behavior tests | Browser-proof standards and scenario harness patterns | Product/profile fixtures and high-level flows | Pure unit-only behavior claims | Portable Text's test discipline is worth stealing even when the runtime is not. |
| Collaboration patches | Operations, commits, state patches, replay invariants | Derived external patches for product stores | Sanity patches as canonical collab truth | Slate already has the better core collaboration shape. |

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| Portable Text evidence lane | Not claimed | No Slate issue fix is claimed in current-state, related-issue discovery, or issue-ledger passes. | Planning/docs-only evidence addition; no Slate v2 runtime, public API, example, or PR narrative changed. | Plan/research source reads plus ledger reads only. | no sync update this pass | no PR update |
| Behavior action vocabulary | Related, not claimed | Portable Text's `execute` / `forward` / `raise` / `effect` vocabulary is future behavior-policy evidence only. | The related issue corpus is input/IME, plugin/presentation, selection, and customization pressure, but no behavior middleware exists yet. | `docs/slate-issues/requirements-from-issues.md:247-274`; `docs/slate-issues/test-candidate-map/5912-5771.md:41-50`; `docs/slate-issues/test-candidate-map/5912-5771.md:276-289`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:578`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:695` | existing rows reused | no PR update |
| Schema/profile applicability | Related, not claimed | Portable Text schema-applicability selectors are product/profile evidence, not a raw Slate value-format change. | The issue corpus says keep Slate's JSON model simple and make clipboard/schema boundaries explicit; it does not justify adopting Portable Text's CMS categories. | `docs/slate-issues/requirements-from-issues.md:72-104`; `docs/slate-issues/requirements-from-issues.md:326-350`; `docs/slate-issues/package-impact-matrix.md:73-83` | existing rows reused | no PR update |
| Clipboard and portability | Guardrail, no new claim | Existing clipboard/schema fixes remain exact; Portable Text portability only reinforces adapter/export discipline. | Current fixed rows already own custom fragment isolation and `insertData` docs; this plan adds no serializer implementation. | `docs/slate-v2/ledgers/issue-coverage-matrix.md:46-48`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:680-684`; `docs/slate-v2/references/pr-description.md:145-149` | existing rows reused | existing PR rows unchanged |
| Custom operation / patch adapters | Guardrail, no new claim | Do not promote custom-operation or collaboration claims from Portable Text patch ideas. | `#5977` is already fixed narrowly; `#5771` remains improved, not fixed, until real adapter/browser proof exists. Portable Text patches are adapter inspiration, not Slate's canonical collaboration model. | `docs/slate-issues/test-candidate-map/5994-5918.md:165-187`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:525`; `docs/slate-issues/test-candidate-map/5912-5771.md:341-355`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:628` | existing rows reused | existing PR rows unchanged |
| Decorations, marks, annotations | Related, not claimed | Portable Text marks/annotations reinforce projection and test standards only. | The corpus already identifies decorations/marks/annotations as a cross-cutting runtime surface; no new annotation API or rendering patch is part of this plan. | `docs/slate-issues/package-impact-matrix.md:86-104`; `docs/slate-issues/test-candidate-map/5912-5771.md:249-257`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:557-558` | existing rows reused | no PR update |

Full issue-ledger matrix:
| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| ----- | ------- | ----- | --- | ----------- | -------------- | ------- |
| `#6022`, `#5989`, `#5984`, `#5931`, `#5603`, `#5669` | Mobile, IME, And Input Semantics / input-event boundaries | Related, not claimed | Portable Text behavior scenarios are a better proof style for input policy, but this plan changes no input runtime and has no raw-device or browser IME artifact. | Future browser/device behavior specs; current evidence from `docs/slate-issues/issue-clusters.md:82-112`, `docs/slate-issues/gitcrawl-clusters.md:24-31`, and `docs/slate-v2/ledgers/issue-coverage-matrix.md:561-566`. | existing `related` rows reused; no status change | related matrix only |
| `#5894` | Plugin/presentation link-exit policy | Not claimed | This is exactly where Portable Text's behavior API is tempting, but the ledger says the thread is plugin/presentation behavior, not a live core regression. Raw Slate should not grow link policy for it. | No-claim docs/test route; `docs/slate-issues/test-candidate-map/5912-5771.md:41-50`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:695`. | existing not-claimed/triage-closed row reused | no PR update |
| `#5806` | Custom inline selection behavior | Related, not claimed | Behavior scenario tests could express the desired drag-selection outcome, but no DOM selection import/export implementation changed in this plan. | Future browser selection scenario; `docs/slate-issues/test-candidate-map/5912-5771.md:276-289`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:578`. | existing `related` row reused | related matrix only |
| `#5987`, `#4483`, `#4477`, `#2465`, `#2564` | Decorations, marks, annotations, render-time metadata | Related, not claimed | Portable Text's marks/annotations sharpen the spec/projection standard, but this plan adds no annotation store, decorator projection, mark rendering API, or subscription proof. | Future projection/subscription proof; `docs/slate-issues/issue-clusters.md:131-154`; `docs/slate-issues/package-impact-matrix.md:86-104`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:557-558`. | existing related/improves rows preserved | related matrix only |
| `#5233`, `#3486`, `#4569`, `#1024`, `#3155`, `#5634`, `#4802`, `#4806`, `#5328` | Clipboard, Serialization, And External Formats | Preserve existing claims only | Portable Text portability reinforces explicit format/schema boundaries, but Slate v2 already has exact clipboard rows and this plan adds no serializer/export/import code. | Existing package/browser proof owners only; `docs/slate-issues/requirements-from-issues.md:326-350`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:680-684`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:607-608`. | existing fixes/improves/cluster rows preserved; no status change | existing PR rows unchanged |
| `#5977`, `#5874` | Custom operation validation / invalid node identity | Preserve existing fix or non-claim | Portable Text patch adapters should not reopen custom operations or shared node-object identity. Slate operations/commits remain canonical. | Existing core/DOM proof for `#5977`; no-claim identity policy for `#5874`; `docs/slate-issues/test-candidate-map/5994-5918.md:165-187`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:525`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:645`. | existing rows preserved | existing PR rows unchanged |
| `#5771`, `#1770`, `#3741` | Collaboration selection, operation metadata, transaction boundaries | Preserve existing improves/related rows | Portable Text operation-to-patch output is adapter inspiration only. It does not beat Slate v2's operation/commit/collab replay model or close Yjs/provider behavior. | Existing collab package/benchmark proof owners; `docs/slate-issues/test-candidate-map/5912-5771.md:341-355`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:514-516`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:628`. | existing improves/related rows preserved | existing PR rows unchanged |
| `#6038`, `#5945`, `#4056`, `#5992`, `#5131`, `#790` | Performance and scalability | Preserve existing improves/not-claimed/related rows | Portable Text's XState/runtime shape is not a performance proof and should not displace benchmark-owned Slate v2 lanes. Any behavior/schema API inspired by Portable Text must later prove hot-path cost. | Benchmark-only; `docs/slate-issues/benchmark-candidate-map.md:20-90`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:504-511`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:755`. | existing benchmark rows preserved | existing PR rows unchanged |
| `#5813`, docs/example/support noise | Irrelevant reviewed rows | Not claimed | Same keywords around decorators/testing are too underspecified or debugger/example-specific. Portable Text's testing discipline should improve future proof standards, not promote weak reports. | No-claim / repro-first; `docs/slate-issues/test-candidate-map/5912-5771.md:249-257`; `docs/slate-issues/issue-clusters.md:49-54`. | no status change | no PR update |

Issue-ledger pass conclusion:
- fixed issues: none from this Portable Text planning slice.
- materially improved issues: none from this Portable Text planning slice.
- related but not fixed issues: input/IME behavior rows, custom inline
  selection, decorations/annotations, clipboard schema boundaries,
  collaboration/op metadata, and benchmark/performance guardrails listed above.
- irrelevant or non-claim rows reviewed: `#5894`, `#5813`, and `#5874` are the
  clearest traps. Do not promote them without a current repro or implementation
  surface.
- cluster coverage advanced: no issue cluster is advanced by implementation.
  The plan only records evidence pressure for future behavior/schema/test
  design.
- cluster backlog remains: full runtime/input/DOM/React/clipboard/collab/perf
  backlog remains owned by existing ledgers and future accepted execution plans.

Issue-ledger sync status:
- ClawSweeper related-issue pass: skipped this activation. Trigger was
  evaluated against the current plan surface; this pass adds planning/research
  evidence and rule routing only. It does not change Slate v2 implementation,
  public API, browser behavior, examples, issue claims, or PR narrative.
  Existing ledger rows already cover the adjacent issue surfaces. If a later
  accepted execution plan implements behavior middleware, schema/profile
  queries, clipboard adapters, or Portable Text export/import, rerun
  ClawSweeper for that concrete issue-facing surface.
- issue-sync accounting pass: complete. The pass read live gitcrawl rows,
  current manual sync state, coverage matrix, fork dossier, PR reference, and
  gitcrawl cluster rows for the affected surfaces, then recorded the Portable
  Text no-claim sync in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md:16-57`.
- related issue search terms/clusters read: behavior, input, paste, clipboard,
  schema, custom operations, plugin/presentation policy, decorations, marks,
  annotations, Yjs, collaboration, patch adapters, and portability.
- generated live gitcrawl rows read: current live rows for `#6022`, `#5977`,
  `#5945`, `#5894`, `#5874`, `#5813`, `#5806`, `#5771`, and adjacent affected
  rows in `docs/slate-issues/gitcrawl-live-open-ledger.md:21-90`.
- manual v2 sync ledger update: complete. Added the Portable Text architecture
  review sync section with no fixed issue claims, no improved issue claims, no
  new related rows, no PR claim text, and no Slate v2 runtime/API/example/browser
  behavior claim.
- gitcrawl cluster update: skipped with evidence. The generated cluster rows for
  input, async decoration, input-event boundary, and inline-void copy/paste are
  existing live input/cluster facts; this plan changes no cluster membership or
  status.
- fork issue dossier update: skipped with evidence. Existing dossier sections
  for `#5894`, `#5771`, `#5806`, input rows, clipboard rows, performance rows,
  decorations, and custom operations already preserve exact claim policy, and
  the Portable Text plan produces no new issue-facing implementation finding.
- issue coverage matrix update: skipped with evidence. Existing rows already
  preserve exact claim policy for custom operations, clipboard, collaboration,
  input, performance, and annotation-related surfaces; the new sync ledger
  section is enough for this no-claim planning review.
- PR description sync: skipped with evidence. No maintainer-facing fixed,
  improved, related, or count language changes.
- full issue-ledger pass: complete for planning. No manual v2 sync, fork
  dossier, coverage matrix, or PR reference edit is needed because no fixed,
  improved, or maintainer-facing related claim changed.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Slate v2 local source | `packages/slate/src/core/public-state.ts:2176-2493`; `packages/slate/src/interfaces/editor.ts:1204-1221,1729-1773`; `packages/slate/src/core/editor-extension.ts:179-219,420-637`; `packages/slate/test/collab-history-runtime-contract.ts:175-259` | `editor.read` / `editor.update`, frozen state and tx views, extension state/tx groups, setup/onCommit/runtimeState, commit metadata, dirty runtime-id summaries, operation replay, and collab metadata already form the engine substrate. | Stale public mutable fields, ad hoc plugin monkeypatching, broad React reads, and product patch formats becoming engine truth. | Keep this as the spine. Add behavior semantics above it only if they compose with update tags, transforms, command dispatch, commit metadata, and state/tx groups. | Replacing the source-proven engine with Portable Text's XState actor/editor runtime. Also reject a second product behavior framework in raw Slate. | Current source remains engine truth; future behavior work is an optional substrate over `editor.update`, not a runtime replacement. | agree |
| Lexical | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`; local Lexical source refs in that page | Synchronous read/update contexts, update tags, prioritized commands inside update, dirty leaves/elements, transforms before reconcile, and extension lifecycle/dependencies. | Write APIs that bypass lifecycle ownership; React rediscovering dirtiness from snapshots; extension registration scattered across hooks and side effects. | Lifecycle tags, dirty keyed scheduling discipline, extension dependency graph, listener partitioning, and transform/update batching. | Class nodes, `$` helper API, command-first public mutation model, and replacing React with Lexical's DOM reconciler. | Slate keeps plain JSON/operations but uses Lexical-grade dirty/runtime metadata and lifecycle law. | partial |
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`; local ProseMirror source refs in that page | Transactions own doc changes, selection/stored marks/metadata/scroll intent; selections map through steps; bookmarks resolve later; the view owns DOM import/export and decorations as view data. | Selection truth leaking through DOM event handlers, stale paths, unmapped selections, and render-time decoration callbacks as the center of runtime behavior. | Transaction authority, selection mapping/bookmarks, one DOM bridge owner, and view data discipline for overlays. For large paste/fragment insert, steal construction/fitting discipline before broad normalization. | Integer positions, schema-first identity, plugin API complexity, and a ProseMirror view tree hidden under React. | `editor.update` creates the transaction; commits/bookmarks/DOM bridge own mutation and selection truth. | partial |
| Tiptap | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`; local Tiptap source refs in that page | Product extensions package schema, commands, shortcuts, input/paste rules, UI hooks, and optional chained commands over the ProseMirror engine. | A powerful engine with lousy app ergonomics; toolbars hand-threading unrelated plugin snippets; app paste rules living in raw DOM handlers. | Extension/product DX, command discoverability, optional `chain()` as sugar over `editor.update`, selector hooks, and composable UI patterns for Plate. | Required `chain().focus().run()` ceremony, ProseMirror leakage as advanced-user default, and commands replacing read/update lifecycle. | Raw Slate exposes lifecycle and primitives; Plate/profile packages expose the friendlier product extension and command surface. | partial |
| Portable Text | `docs/research/sources/editor-architecture/portable-text-schema-behavior-and-portability.md`; `../portabletext/packages/editor/src/behaviors/behavior.types.action.ts:16-29,57-206`; `../portabletext/packages/editor/src/selectors/selector.get-applicable-schema.test.ts:129-168`; `../portabletext/apps/docs/src/content/docs/editor/guides/testing-behaviors.mdx:54-229` | Spec-first JSON content, compiled schema, schema-applicability selectors, behavior events with `on`/`guard`/`actions`, explicit `execute`/`forward`/`raise`/`effect`, and real-browser behavior specs. | Handler soup, undocumented product profiles, toolbar enablement guesses, and behavior plugins that cannot be replayed as scenarios. | Behavior event/action vocabulary, schema applicability as a query, content-profile/spec discipline, compact scenario tests, and product patch adapter posture. | Portable Text value format as raw Slate core, CMS schema categories as engine law, XState actor runtime, Gherkin/Racejar as mandatory core deps, and diff-match-patch/Sanity patches as collab truth. | Portable Text is a standards source, not an engine source. Raw Slate may steal a tiny behavior substrate; Plate/profile packages own Portable Text-shaped profiles, toolbars, presets, import/export, and patches. | partial |
| React 19.2 | `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`; live Slate React source refs in that page | External-store subscriptions, transitions, deferred values, Activity hidden UI, and Performance Tracks give React the right scheduler/subscription primitives for editor-adjacent UI. | Blaming React for editor-core invalidation debt; rerendering full editor bodies for toolbar/sidebar/review state; hidden panes competing with urgent text input. | `useSyncExternalStore` subscription backbone, non-urgent derived UI, hidden pane preservation, and performance-track proof. | Treating React as the editor invalidation engine or proof that Slate is automatically faster than ProseMirror/Lexical. | React schedules and renders; Slate commit dirtiness decides what changed. | agree |
| Pretext / Premirror | `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md`; local `../pretext` and `packages/slate-layout` refs in that page | Measurement/preparation is separated from arithmetic layout; pages/fragments are derived layout, not document nodes; page-level virtualization is the repeated unit in paged mode. | CSS-float pagination hacks, AST-level table splitting as the default, and cross-client page-break promises without a measurement profile. | Layout/profile contracts, page/spread mount planning, derived page snapshots, and authoritative page-break snapshot extension points for strict export/collab. | Tiptap Pages CSS float mechanism, product-specific TableKit as raw Slate law, and deterministic export claims while canvas/font measurement can drift. | Keep layout in `slate-layout`; use page virtualization for paged mode, block virtualization for continuous/pathological mode. | partial |
| Yjs / slate-yjs | `docs/research/sources/editor-architecture/yjs-collaboration-bindings.md`; `packages/slate/test/collab-history-runtime-contract.ts:175-259` | Extension-owned binding state, commit-driven local export, remote import through `editor.update`, relative positions, awareness as external store, and pause/reconfigure lifecycle. | Legacy `withYjs` wrapper mutation, direct `editor.children` assignment, overridden `apply`/`onChange`, and product patches in document values. | Extension-owned binding, operation/commit export, metadata-tagged remote replay, relative-position bridge, awareness external-store hooks. | Portable Text or Sanity patches as the canonical collaboration model; provider/room/auth policy in raw Slate. | Slate operations/commits/state patches remain canonical; Portable Text-style patches are derived adapter output. | agree |

Hybrid thesis after research refresh:
- Accepted, but narrowed: Slate should combine Lexical-style dirty runtime
  buckets for normal editing, ProseMirror-style transaction/DOM/selection
  discipline and bulk fitting for large paste/fragment insert, Tiptap-style
  product extension DX in Plate, Portable Text-style behavior/schema/test
  standards, React 19.2 external-store UI, and Yjs-style extension-owned
  collaboration adapters.
- The Portable Text discovery does not invalidate the hybrid. It adds a missing
  standards lane. If we copy its runtime/value model, that is a downgrade:
  current Slate v2 source already has the better engine primitives.
- The only raw-Slate API worth considering from Portable Text is a tiny
  behavior substrate with explicit propagation semantics. Everything
  product-shaped belongs in Plate/profile packages.

Pressure pass matrix:
| Lens | Verdict | Harsh read | Required plan response | Evidence | Status |
|------|---------|------------|------------------------|----------|--------|
| Performance / hot path | revise | A Portable Text-style behavior layer is attractive, but copying a second dispatch engine into raw Slate would be perf debt unless it reuses current transform middleware and command dispatch. Current Evidence Kit is broad, but not closure-ready: required artifacts exist, while active typing, huge-document trace, normalization, query/ref, refs/projection, and history compare are stale. | Defer raw behavior DSL implementation. If accepted later, prove it with active typing, rich-text operations, text/selection, node-transform, query/ref, refs/projection, clipboard-large-payload, and browser-trace lanes before any perf-ready claim. | `benchmarks/editor/research/benchmark-registry.json:41-130`; `benchmarks/editor/research/benchmark-registry.json:215-325`; `benchmarks/editor/benchmarks/results/benchmark-health-latest.json:4-58`; `benchmarks/editor/benchmarks/results/benchmark-health-latest.json:102-159` | applied |
| Slate-close unopinionated DX | keep with hard boundary | `execute` / `forward` / `raise` / `effect` is the cleanest vocabulary in the candidate set, but raw Slate should not ship link/list/CMS policies or Portable Text's content categories. | Keep the vocabulary as substrate law and docs/test vocabulary; Plate/profile packages own behavior presets, schema categories, toolbar semantics, import/export, and product patches. | `docs/research/sources/editor-architecture/portable-text-schema-behavior-and-portability.md`; `packages/slate/src/core/transform-middleware.ts:11-147`; `packages/slate/test/extension-methods-contract.ts:286-345` | applied |
| Plate migration DX | keep | Portable Text is better at product profile authoring than raw Slate, but Plate should consume that as adapters and presets over Slate's extension/schema state. | Keep raw Slate state/tx namespaces and schema specs as the migration backbone; future Plate profile can expose Portable Text-like authoring without leaking `plate`, `table`, or `yjs` namespaces onto the editor surface. | `packages/slate/test/migration-backbone-contract.ts:33-170`; `apps/www/src/app/(app)/examples/slate/_examples/hidden-content-blocks.tsx:21-42` | applied |
| slate-yjs / collaboration | keep Slate canonical | Portable Text patches are useful output for product stores, not a collaboration model. Making Sanity patches canonical would throw away deterministic operation replay and metadata. | Slate operations, commits, state patches, tags, and metadata remain canonical; Portable Text patches are derived adapters only. | `packages/slate/test/migration-backbone-contract.ts:172-236`; `packages/slate/test/collab-history-runtime-contract.ts:175-259`; `docs/research/sources/editor-architecture/yjs-collaboration-bindings.md` | applied |
| Regression / TDD | keep, broaden proof rows | Portable Text's scenario specs are genuinely better than scattered unit tests for author-facing behavior. Slate already has strong contracts, but a future behavior substrate needs its own scenario row, not just transform unit tests. | Map behavior proof to public-interface contracts: transform middleware, hidden-content keyboard selection, hidden copy/paste, projected synced-root commands, DOM coverage scalability, and browser-rich-text replay. No implementation claim until those rows exist and run. | `packages/slate/test/extension-methods-contract.ts:286-345`; `packages/slate-react/test/keyboard-input-strategy-contract.test.ts:325-559`; `packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts:220-285`; `packages/slate-react/test/projected-command-contract.test.ts:141-235`; `benchmarks/editor/research/benchmark-registry.json:125-130` | applied |
| React / render | keep current engine, avoid effect creep | React 19.2 is good enough for UI scheduling, but it will not save a broad behavior dispatch or schema-query path. Effects are for external sync; behavior side effects must not become React effect registration soup. | Use external-store selector hooks for UI, extension setup/cleanup for external subscriptions, and event/update handlers for user intent. Do not use React effects as a behavior runtime. | `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`; `packages/slate/src/core/editor-extension.ts:420-667`; `.agents/skills/react-useeffect/SKILL.md` | applied |
| shadcn / example composability | keep with cleanup | The shadcn hidden-content example is the right coverage target, but its policy option sets are still plain button loops. That is tolerable for planning evidence, not best DX. | Future accepted example cleanup should use ToggleGroup-style controls for option sets; keep shadcn shell UI outside raw Slate core and mark non-editable triggers as non-editable. | `apps/www/src/app/(app)/examples/slate/_examples/hidden-content-blocks.tsx:111-130`; `apps/www/src/app/(app)/examples/slate/_examples/hidden-content-blocks.tsx:300-425`; `apps/www/src/app/(app)/examples/slate/_examples/hidden-content-blocks.tsx:431-540`; `.agents/skills/shadcn/SKILL.md` | applied |
| Simplicity / hard cuts | keep cuts | The fastest way to ruin this plan is to overfit to the newest repo we found. Portable Text is not an excuse to create a new core model. | Continue hard-cutting Portable Text value format, CMS categories, XState actor runtime, mandatory Gherkin/Racejar, and patch strings as collaboration truth. Behavior substrate remains optional and proof-gated. | Hard cuts table below; ecosystem table above | applied |

Evidence Kit benchmark control-plane mapping:
| Pressure claim | Registered artifact / gap | Health signal | Plan decision | Owner |
|----------------|---------------------------|---------------|---------------|-------|
| React/runtime hot path | `react-active-typing-breakdown`, `react-rerender-breadth`, `react-huge-document-browser-trace`, `react-huge-document-overlays`, `core-current`, `core-compare` | no required artifact missing, but active typing, huge-document trace, normalization, query/ref, refs/projection, and history compare are stale | no performance-ready behavior-substrate claim until the stale lanes are refreshed or explicitly owned | later accepted execution or closure gate |
| Behavior dispatch overhead | `core-rich-text-operations-compare`, `core-text-selection`, `core-node-transforms`, `core-query-ref-observation`, `issue-6038-transaction-execution`; exact behavior-dispatch microbenchmark is a candidate gap if a new dispatcher is built | current registry covers adjacent transform/selection/query workloads, not a new Portable Text-like dispatcher | reuse existing transform middleware first; add a candidate benchmark if a distinct behavior dispatcher is accepted | later accepted execution |
| Clipboard / portability | `clipboard-large-payload`; ProseMirror and Lexical runtime adapters cover large fragment insert pressure | registered and required | Portable Text import/export adapters must prove large payload behavior through clipboard and runtime-adapter lanes | Plate/profile adapter execution |
| Collaboration / patches | `collab-readiness` | registered and required | Portable Text/Sanity patches are derived output only; canonical proof remains operation/state-patch replay and collab readiness | slate-yjs execution lane |
| Browser behavior scenarios | `browser-rich-text-replay-coverage` plus existing hidden-content, projection, and DOM-coverage contracts | registered and required; accepted behavior substrate still needs its own scenario rows | future behavior substrate must add replayable browser rows for input/paste/keyboard/undo before closure | later accepted execution |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Slate v2 target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Behavior customization regressions | Ad hoc handlers are hard to prove across input/paste/keyboard/undo. | Scenario-shaped browser contracts with reusable steps, inspired by Portable Text behavior tests. | Later Playwright/browser contract map. | next passes | pending |
| Hidden content selection | Legacy Slate required all nodes in the DOM, which made accordion/tab/collapsible cases impossible to hide cleanly. | Boundary-policy hidden ranges stay model-backed for keyboard selection, copy, paste, drag, and browser ownership. | `packages/slate-react/test/keyboard-input-strategy-contract.test.ts:325-559`; `packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts:220-285`; `packages/slate-react/test/dom-coverage-boundary-contract.tsx:819-930` | Slate React contracts | partial, more browser rows if substrate accepted |
| Synced/content-root projected commands | Legacy roots and synced copies could not be selected like visible sibling blocks without DOM/path leaks. | Projected commands operate across visible graph segments and clear view-selection sidecars deterministically. | `packages/slate-react/test/projected-command-contract.test.ts:141-235` | Slate React contracts | partial |
| Product behavior customization | Legacy `insertData`/keyboard/customization examples are easy to turn into app-owned handler soup. | Extension transform/clipboard middleware exposes transaction-local writes or read-only state explicitly. | `packages/slate/test/extension-methods-contract.ts:286-345`; `packages/slate/test/extension-methods-contract.ts:358-410`; `packages/slate-react/test/surface-contract.tsx:570-610` | Slate core contracts | partial |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Behavior middleware if accepted | input/paste/keyboard/undo behavior specs | Chromium first, broader browser rows later | `Plate repo root` Playwright/browser contract named by accepted execution plan | scenario replay proves behavior and selection/undo | pending |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Portable Text source shape | `plate-2` reading `../portabletext` | `nl`/`rg` source reads listed in Source-backed architecture north star and research page | passed as source audit | current-state pass |
| Current Slate v2 engine source shape | `Plate repo root` | `rg`/`nl` source reads of `interfaces/editor.ts`, `core/public-state.ts`, `core/editor-extension.ts`, `core/transform-middleware.ts`, `test/read-update-contract.ts`, `test/commit-metadata-contract.ts`, `test/collab-history-runtime-contract.ts` | passed as source audit; no behavior command claimed yet | current-state pass |
| Research synthesis current-source refresh | `Plate repo root` | `nl -ba packages/slate/src/core/public-state.ts`, `core/transform-middleware.ts`, `core/command-registry.ts`, `core/editor-extension.ts`, `interfaces/editor.ts`, and `test/collab-history-runtime-contract.ts` source slices | passed as source audit; confirms the live engine already owns read/update, transform middleware, command ordering, extension state/tx/setup/onCommit/runtimeState, schema queries, dirty commit metadata, and collab replay | research-ecosystem-synthesis pass |
| Pressure pass source/test refresh | `Plate repo root` and `plate-2` Evidence Kit | `nl`/`rg` source reads of `extension-methods-contract.ts`, `migration-backbone-contract.ts`, `keyboard-input-strategy-contract.test.ts`, `dom-coverage-native-bridge-contract.test.ts`, `dom-coverage-boundary-contract.tsx`, `projected-command-contract.test.ts`, `hidden-content-blocks.tsx`, plus `benchmark-registry.json` and `benchmark-health-latest.json` | passed as source audit; no implementation or behavior command claimed. Benchmark health records no missing required artifacts, but stale active artifacts and adapter/coverage gaps keep perf closure pending. | pressure-passes |
| Maintainer objection source audit | `Plate repo root`, `../portabletext`, and `plate-2` docs | `nl`/`rg` source reads of Portable Text behavior actions, behavior dispatch, applicable-schema tests, patch plugin, testing guide, specification, XState editor creation, Slate v2 transform middleware, command dispatch, public schema/tx views, and migration/collab contracts | passed as source audit; ledger rows accepted with evidence. No implementation or behavior command claimed. | objection-ledger |
| High-risk source and benchmark audit | `Plate repo root`, `../portabletext`, and `plate-2` Evidence Kit | `nl`/`rg` source reads of high-risk skill rules, benchmark health, benchmark registry, Slate transform middleware, command dispatch, extension-methods contracts, hidden-boundary keyboard contracts, projected-command contracts, and model-backed copy/paste contracts | passed as source audit; high-risk proof plan recorded. No implementation or behavior command claimed. | high-risk-deliberate-mode |
| Ecosystem maintainer source audit | `Plate repo root`, `../portabletext`, and research docs | `nl`/`rg` source reads of ecosystem pass rules, `editor-extension.ts`, `public-state.ts`, `interfaces/editor.ts`, `migration-backbone-contract.ts`, `collab-history-runtime-contract.ts`, `extension-methods-contract.ts`, Portable Text patch plugin, and Yjs collaboration research | passed as source audit; no implementation, package, browser, or collab command claimed. | ecosystem-maintainer-pass |

Autoreview workspace gate:
| Reviewed patch owner | Cwd | Command | Result | Notes |
|----------------------|-----|---------|--------|-------|
| N/A current pass | N/A | N/A | N/A | Planning/research/rule docs only; no `Plate repo root` implementation patch. |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied pressure pass | React 19.2 remains scheduler/subscription evidence only. The plan must keep urgent editing under Slate commit dirtiness and external-store selectors, not broad React state or effects. | pressure matrix adds React/render row and keeps performance below closure-ready |
| performance-oracle | yes | applied pressure pass | Behavior dispatch and schema queries touch hot editor paths if implemented. Existing transform middleware and command dispatch are the only acceptable starting point; a second dispatcher needs benchmark proof. | pressure matrix and Evidence Kit mapping defer behavior DSL implementation |
| performance | partial | applied pressure pass | The plan makes benchmark-sensitive runtime claims, so Evidence Kit registry and health were read. Required artifacts exist, but stale active artifacts and adapter gaps keep perf claims pending. | added Evidence Kit benchmark control-plane mapping |
| tdd | yes | applied pressure pass | Tests must stay public-interface and scenario-shaped. Portable Text's browser behavior style maps to named Slate v2 contracts, but no implementation tests were added in planning mode. | regression proof matrix names concrete existing and future proof rows |
| shadcn | partial | applied pressure pass | Hidden-content example has good shadcn coverage, but option-set controls should use ToggleGroup-style composition in accepted execution cleanup. This remains Plate/example DX, not raw Slate core. | Hook/component/render DX target and pressure matrix record the cleanup |
| react-useeffect | partial | applied pressure pass | Effects are external-system escape hatches. Do not copy Portable Text behavior effects into React effect soup; use extension setup/cleanup and event/update handlers. | pressure matrix adds React/effect boundary |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Realistic failure scenario | Who is harmed | Blast radius | Mitigation / hard-cut answer | Proof required before any execution | Status |
|------|---------|----------------------------|---------------|--------------|------------------------------|-------------------------------------|--------|
| Behavior substrate overreach | Optional future public API | A Portable Text-inspired event/action layer becomes a second input system next to transform middleware and command dispatch. Plugins must learn two propagation models, hot paths get slower, and undo grouping becomes harder to reason about. | plugin authors, app authors, browser-runtime maintainer, performance owner | `packages/slate` transforms/commands/update lifecycle, `packages/slate-react` keyboard/paste bridge, docs/examples, benchmark lanes | No current public behavior API is accepted. Keep only vocabulary as future evidence. Hard-cut any future API unless it proves current transform middleware/command dispatch cannot express the needed `execute` / `forward` / `raise` / `effect` semantics cleanly. | Unit: transform/command delegation and tx-local state. Browser: input/paste/keyboard/undo scenario rows. Stress: active typing, rich-text ops, text/selection, node transforms, query/ref, refs/projection. Docs: one tiny behavior example, no framework tour. | complete |
| Schema/profile lock-in | Portable Text schema evidence | Styles/lists/decorators/annotations leak into raw Slate as core categories, making non-CMS editors pay for product content policy. | raw Slate users, Plate/profile maintainers, toolbar authors | schema specs, toolbar selectors, examples, docs, adapter packages | Keep raw Slate to open element specs/properties/predicates. Portable Text-shaped categories live only in Plate/profile adapters. Hard-cut any core category name copied from Portable Text. | Unit: selector/profile package maps open Slate specs to category affordances. Docs: raw Slate schema remains format-agnostic. Migration: no raw value migration. | complete |
| Benchmark overclaim | Performance-sensitive behavior/schema claims | The plan claims a new behavior layer is safe because source reads look clean, while Evidence Kit says active typing, huge-document trace, normalization, query/ref, refs/projection, and history compare are stale. | performance owner, release owner, downstream large-document users | benchmark registry, `Plate repo root` performance commands, release proof, PR narrative | No performance-ready claim from this plan. Refresh or explicitly own stale lanes before any accepted execution calls a behavior substrate fast enough. Add a behavior-dispatch candidate benchmark only if a distinct dispatcher is accepted. | Evidence Kit refresh plus focused `Plate repo root` benchmarks: active typing, huge-document browser trace, rich-text operations, text/selection, node transforms, query/ref, refs/projection, clipboard large payload, collab readiness when relevant. | complete |
| Browser-test ceremony | Portable Text testing inspiration | We copy Gherkin/Racejar ceremony instead of the useful standard: real user actions plus compact assertions. Tests become slow and contributors avoid them. | test authors, browser-runtime maintainer, contributor DX | browser test harness, docs, examples, CI time | Steal scenario shape, not mandatory Gherkin/Racejar. Use the narrowest Playwright/browser contract for accepted behavior claims; unit tests still own pure transform semantics. | Browser: input/paste/keyboard/undo, hidden boundary selection, projected root commands, model-backed copy/paste. Docs: reusable steps only if they reduce code. | complete |
| Patch/collab confusion | Portable Text patch adapter evidence | Sanity/diff-match-patch output becomes treated as canonical collaboration state, weakening deterministic operation replay and commit metadata. | slate-yjs/collab maintainer, external-store adapter author | operations, commits, snapshots, remote replay, adapter packages, PR claims | Keep Slate operations/commits/state patches canonical. Portable Text/Sanity patches are derived output only. Hard-cut any claim that external patches close slate-yjs behavior. | Unit: operation replay with commit tags and runtime-id stripping. Benchmark: collab readiness. Adapter: PT/Sanity serialization fixtures only outside core. | complete |
| Product UI leakage | shadcn/profile example pressure | Hidden-content examples and Portable Text profile presets creep into raw Slate as UI/product policy. | raw Slate users, Plate maintainers, app authors | examples, docs, shadcn components, editor shell controls | Core owns editable boundaries and model behavior; Plate/profile owns shadcn shell, toolbar selectors, presets, and adapters. Hard-cut raw Slate UI policy. | Browser: hidden content focus/selection/copy/paste/drag. Example: product shell controls are non-editable and outside core. | complete |

High-risk expanded proof plan:
| Proof class | Required before behavior substrate execution | Required before profile/adapter execution | Current status |
|-------------|--------------------------------------------|-------------------------------------------|----------------|
| Unit | Transform middleware must prove default/delegate/override semantics, tx-local reads, no double-next regressions, and clean command context interaction. | Selector/profile package must prove category mapping from open Slate specs without raw core categories. | Existing transform and migration contracts are source-read evidence only in this planning lane. |
| Browser | Input, paste, keyboard, undo/redo, focus, hidden-boundary selection, projected root commands, and model-backed copy/paste must have scenario rows. | Toolbar enablement and shell controls must prove non-editable UI does not steal selection or focus. | Existing hidden/projection/DOM coverage contracts prove adjacent surface; accepted execution must name exact rows. |
| Parity | Compare against existing Slate v2 transform/command behavior and legacy-rich-text replay where applicable. | Import/export must preserve Slate value semantics and external Portable Text shape separately. | Evidence Kit registers browser-rich-text replay and runtime adapters; no new parity run claimed. |
| Stress / perf | Active typing, rich-text operations, text/selection, node transforms, query/ref, refs/projection, clipboard-large-payload, and browser trace lanes must pass or be owned. | Large import/export and clipboard payload lanes must stay under issue-shaped budgets. | Benchmark health has no missing required artifacts, but stale active artifacts and adapter gaps block perf-ready claims. |
| Migration | Additive extension/package only; no raw value migration; existing transforms/commands remain valid. | Plate/profile packages own presets, Portable Text categories, toolbar affordances, import/export, and patches. | Planning decision only; no migration surface changed. |
| Docs / examples | One tiny example that proves the exact missing primitive; no behavior framework tour. | Profile example can be richer, shadcn-composed, and product-shaped, but it must label ownership clearly. | Future execution/doc pass only. |
| Release / rollback | If proof says current transform middleware can cover the case, drop the substrate. If a substrate ships and regresses hot paths, hard-cut before publish. | If adapter/profile leaks into core, move it out before publish. | Current plan accepts no raw public behavior API, so rollback is trivial: keep vocabulary as research evidence only. |

High-risk pass conclusion:
- The optional raw behavior substrate survives only as a future candidate, not an
  accepted plan item.
- The plan explicitly accepts zero new raw-Slate public APIs from Portable Text.
- The correct future default is reuse current transform middleware and command
  dispatch; build new substrate only after a later plan proves an actual missing
  primitive, benchmark budget, browser behavior row, and ecosystem migration
  answer.
- If high-risk proof later cannot beat "cleaner architecture", drop the
  behavior substrate and keep only Portable Text's vocabulary/test standards.

Ecosystem maintainer pass:
| Surface | Triggered? | Exact affected extension points | Plate/plugin maintainer answer | slate-yjs/collab maintainer answer | Plugin migration-backbone surface | Collab contract affected | Proof required before closure | Verdict |
|---------|------------|----------------------------------|--------------------------------|------------------------------------|-----------------------------------|--------------------------|-------------------------------|---------|
| Portable Text evidence routing | yes, docs/rules only | none in runtime; rule/candidate docs only | Product packages can cite Portable Text for profile/schema/behavior/test standards without wrapping core calls. | No operation, identity, snapshot, normalization, or remote-apply behavior changes. | N/A: evidence rule only. | none | Plan-artifact consistency check only. | keep |
| Optional behavior substrate vocabulary | yes, future extension/plugin substrate risk | If later accepted: `defineEditorExtension().transforms`, command dispatch through transform middleware, `editor.update`, state/tx groups, optional setup/runtime state. No current API accepted. | Plate should first implement presets over existing transform middleware and command dispatch. A raw substrate is allowed only if Plate cannot express propagation/update grouping without a compatibility junk drawer. | Behavior actions must compile to ordinary Slate operations/commits. slate-yjs must never see Portable Text action events as collaboration state. | `transforms`, `queries`, `state`, `tx`, `setup`, `onCommit`; no editor-object mutation and no `editor.api` / `editor.tf` compatibility promise. | operations, commit tags/metadata, history skip metadata, deterministic replay. | Unit transform/command contracts, browser input/paste/keyboard/undo rows, active typing/rich-text/text-selection/query-ref/refs-projection benchmarks, collab replay proof if remote behavior changes. | future candidate only |
| Schema/profile applicability | yes, profile/package route | `elements` specs, schema properties, `state.schema` queries, profile package selectors; no raw Portable Text category slots. | Plate can expose Portable Text-like toolbar/profile categories by mapping open Slate specs to product affordances. It should not wrap every core call; it should read `state.schema` and package selectors. | Read-only schema/profile decisions do not affect operation order, remote apply, or conflict behavior. If schema affects normalization, that belongs to normalizer proof. | `elements`, `state`, `tx`, `queries`, package-level selectors. | none unless normalizers are added; then operation replay and normalization contracts apply. | Selector unit tests, toolbar/browser enablement tests in profile package, normalization replay tests only if schema changes produce operations. | keep outside core |
| Browser behavior scenario standard | yes, test/release-gate pressure | browser test harness and accepted execution proof rows; no runtime extension point by itself. | Plate/plugin authors get reusable scenario patterns only when behavior touches input/paste/keyboard/undo/focus. No mandatory Gherkin/Racejar. | Collab only applies when a scenario changes operations, selection metadata, or remote replay. | Test helpers and profile fixtures, not core API. | none by default; collab scenario required if remote apply or shared selection changes. | Existing hidden-boundary, projected-command, model-backed copy/paste contracts are adjacent proof; future behavior API needs named browser rows. | keep as standard |
| Portable Text value/runtime rejection | yes, data-model boundary | none; explicitly rejects raw value/runtime adoption and XState actor runtime. | Plate/profile packages may import/export Portable Text. Raw Slate stays open JSON and operations-first, so plugins do not migrate values. | slate-yjs keeps Slate operations, commits, snapshots, and metadata as truth. | Adapter packages only. | no core collab change. | Adapter serialization fixtures; no raw Slate migration proof because no value migration occurs. | keep rejection |
| Portable Text/Sanity patch adapters | yes, collab confusion risk | optional adapter `onCommit` subscriber and serializer package; no core operation format change. | Product packages can derive Sanity/Portable Text patches from commits without polluting core or forcing every plugin through patch strings. | Operations/commits remain canonical. Remote import must replay Slate operations with metadata; external patches are export/interoperability output only. | `onCommit`, `state.value.lastCommit`, `value.operations`, adapter serializer helpers. | operation replay, commit metadata, history skip, remote-import tags, runtime-id locality. | Operation replay with commit metadata, collab readiness, adapter serialization, and history skip tests before any adapter claim. | keep adapter-only |
| shadcn/profile UI ownership | yes, product example route | none in core beyond editable boundaries, DOM coverage, and schema/query reads. | Plate/profile owns shadcn shells, toolbar controls, ToggleGroup-style option controls, and presets. Raw Slate examples should show primitives, not product policy. | UI shell state does not affect collab unless it dispatches editor operations; those remain ordinary operations. | profile components, selectors over `state.schema`, boundary props in Slate React examples. | none unless UI dispatches operations; then normal operation replay applies. | Browser focus/selection/copy/paste/drag tests for hidden content and non-editable shell controls. | keep outside core |

Ecosystem pass conclusion:
- No current Portable Text-driven extension, plugin, collaboration, operation,
  identity, normalization, snapshot, or data-model change is accepted.
- Plate/profile migration route is credible only because existing Slate v2
  extension slots already provide `elements`, `transforms`, `queries`, `state`,
  `tx`, `setup`, `runtimeState`, `onCommit`, clipboard middleware, operations
  middleware, and schema specs without mutating the editor surface.
- slate-yjs/collab route stays deterministic only if Slate operations, commits,
  snapshots, tags, metadata, history-skip policy, and local-only runtime ids
  remain canonical. Portable Text/Sanity patches are adapter output, never
  collaboration truth.
- Revision pass removed the last ambiguity that this plan builds behavior
  middleware now. It does not.

Revision pass:
| Reconciled surface | Earlier tension | Revision decision | Evidence | Status |
|--------------------|-----------------|-------------------|----------|--------|
| Scorecard semantics | Scores were treating missing runtime/browser execution as if this planning review had accepted a runtime/API patch. | Scorecard now measures whether the plan is ready for user review. Runtime/browser/benchmark proof remains required only for later accepted execution because this plan accepts no implementation/API change. | Scorecard, High-risk expanded proof plan, Verification workspace gate | complete |
| Behavior substrate | Portable Text behavior vocabulary looked close to an accepted raw API. | Keep only vocabulary and future-candidate pressure. Any implementation must first prove current transform middleware and command dispatch are insufficient. | Public API target, High-risk deliberate-mode pre-mortem, Ecosystem maintainer pass | complete |
| Plate/profile boundary | Schema, toolbar, shadcn, and Portable Text category ideas could leak into raw Slate. | Raw Slate keeps open specs, state/schema queries, editable boundaries, and operations. Plate/profile owns Portable Text-shaped categories, toolbar affordances, presets, import/export, and shadcn shells. | Intent / boundary record, Ownership decision matrix, Ecosystem maintainer pass | complete |
| Collab/patch boundary | Portable Text/Sanity patch output could be mistaken for Slate collaboration truth. | Slate operations, commits, snapshots, tags, metadata, history-skip policy, and local-only runtime ids stay canonical. Portable Text/Sanity patches are adapter output only. | slate-yjs migration-backbone target, Issue accounting, Ecosystem maintainer pass | complete |
| Testing/proof standard | Portable Text scenario tests could turn into mandatory Gherkin/Racejar ceremony. | Steal scenario shape and compact assertions, not the testing stack. Future accepted behavior work must name narrow unit/browser/stress proof rows. | Regression proof matrix, Browser stress / parity strategy, Scorecard | complete |

Revision pass conclusion:
- The plan is strong enough for the next bookkeeping pass: issue-sync
  accounting.
- No current raw-Slate public API, runtime path, data model, collab format,
  package boundary, or browser behavior change is accepted by this planning
  review.
- The score now clears the Slate Plan threshold because the plan has decisive
  evidence-backed keep/reject calls and explicit future proof gates. It does
  not claim that any future behavior substrate, profile adapter, browser
  scenario, benchmark lane, or collab adapter is implemented.

Slate maintainer objection ledger:
| Change | Who feels pain | Likely objection | Steelman antithesis | Tradeoff tension | Why not change-for-change | Evidence | Rejected alternative | Migration answer | Docs / example answer | Regression proof | Ecosystem answer | Verdict |
|--------|----------------|------------------|--------------------|------------------|---------------------------|----------|----------------------|------------------|-----------------------|------------------|------------------|---------|
| Add Portable Text as required evidence source for schema/profile/behavior/test lanes | Slate maintainer, plan author | "This is a CMS project. Why are we letting it bias raw Slate?" | Raw Slate should stay format-agnostic and should not chase every polished product editor. | More research surface and more chances to import product assumptions accidentally. | Portable Text has the strongest behavior/spec/test authoring standard in the candidate set, and the plan explicitly rejects its value/runtime shape. | Candidate doc calls it "not the engine winner" but strongest spec/schema/behavior benchmark; research page says it is superior only on standards surfaces. | Ignore Portable Text as CMS-specific. That keeps the plan simpler but throws away the clearest behavior vocabulary and scenario-test discipline found so far. | No Slate user migrates data or APIs from this row; it is an evidence-routing rule only. | Candidate doc and Slate Plan rules name exactly when Portable Text evidence applies. | Plan-artifact `rg` and source audit only; no runtime claim. | Plate/profile packages may use Portable Text ideas; raw Slate does not inherit CMS categories. Collab unchanged. | keep |
| Keep optional raw behavior substrate vocabulary, but do not build it from this plan | Plugin author, app author, browser-runtime maintainer | "This duplicates transform middleware and command dispatch. Stop building a second input system." | Current Slate v2 already has transform middleware, command handlers, update contexts, and transaction-local tx. That might be enough. | If built later, it adds hot-path API surface and could slow input/paste/keyboard if not minimal. | The only valuable steal is propagation semantics: direct execute, forward remaining handlers, raise fresh lookup, and explicit effects. That solves real handler-chain ambiguity, but only if implemented over existing command/transform owners. | Portable Text action types define `execute`, `forward`, `raise`, and `effect`; Slate v2 transform middleware already delegates/overrides args and command dispatch already has `next`. | Copy Portable Text behavior engine or XState runtime. That is worse because it replaces proven Slate update/commit machinery with a product runtime. | No migration until accepted execution. Existing `transforms` and commands remain the route; a future substrate must be additive and optional. | Future docs must show one tiny input/paste behavior over `editor.update` and transform middleware, not a behavior framework tour. | Before implementation: benchmark map and browser scenario rows. After implementation: focused transform/command unit tests plus browser input/paste/keyboard/undo scenarios. | Plate can layer product presets; slate-yjs sees only normal operations/commits, not behavior actions. | keep |
| Treat schema applicability as selector/profile discipline, not raw Portable Text categories | Plate maintainer, toolbar author, raw Slate user | "This will smuggle styles/lists/decorators/annotations into core." | Slate's schema should stay open and not force Portable Text's categories on every editor. | Toolbars and examples need more explicit profile logic outside core. | The useful part is asking "what is allowed here?" from schema state; the category names are product profile details. | Portable Text applicable-schema tests compute allowed decorators/annotations/lists/styles across selection; Slate v2 state already exposes schema spec and predicate queries. | Adopt Portable Text categories in raw Slate. That would make core less Slate-like and make non-CMS editors pay for content-policy names. | Raw Slate keeps element specs/properties/predicates. Plate/profile packages map those to Portable Text-like toolbar categories. | Docs/example should show selector-first toolbar enablement from open Slate specs, with Portable Text mapping only in a profile adapter. | Unit tests for schema selector behavior and browser toolbar enablement only in the product/profile package. | Plate gets nicer profile DX; collab stays unchanged because schema applicability is read/query policy, not operation truth. | keep |
| Use Portable Text-style browser behavior scenario tests as acceptance standard | Test author, browser-runtime maintainer | "Gherkin/Racejar is overkill. We already have unit tests." | Unit tests are faster, easier to own, and should remain the first line for core transforms. | Browser scenarios cost runtime and test-infra discipline; they can become ceremony if every tiny unit path needs one. | Editor behavior bugs are user-event bugs: input, paste, selection, undo, focus, hidden content. Portable Text's real-browser examples hit the right surface. | Portable Text testing guide uses browser editor creation, user typing, compact snapshots, and Given/When/Then steps for text, selection, marks, undo/redo. Slate v2 already has hidden-content, projected-command, DOM coverage, and browser-rich-text replay contracts. | Keep behavior claims unit-only. That is weaker because it misses DOM selection/focus/undo regressions that drove this lane. | No migration for library users. For contributors, scenario rows become required only for accepted behavior/browser-surface claims. | Docs should expose reusable browser steps or compact snapshot helpers only when they make behavior tests shorter, not mandatory Gherkin. | Browser replay rows for input/paste/keyboard/undo; unit tests still own pure transform semantics. | Plate can reuse the scenario harness for product presets; slate-yjs only needs browser/collab scenarios when behavior affects operation replay. | keep |
| Reject Portable Text value format and XState actor runtime as raw Slate core | Raw Slate user, runtime maintainer, migration owner | "If Portable Text is so good, why not adopt the full model?" | A full model copy would produce a coherent product editor faster than designing adapters. | Rejecting it means Slate/Plate still need their own profile and adapter work. | Slate v2 already has stronger engine primitives: read/update, state/tx views, operations, commits, runtime ids, multi-root projection, and deterministic replay. Copying PT core would be architecture churn with worse fit. | Portable Text spec defines blocks/spans/markDefs/list fields; createInternalEditor creates XState actors; Slate v2 public state exposes schema/runtime/tx and migration contracts prove deterministic operation replay. | Adopt PT value/runtime wholesale. That is worse for Slate because it breaks the open JSON/op-first contract and imports CMS assumptions. | No data migration. PT import/export belongs in adapter/profile packages, not core. | Docs should say raw Slate remains format-agnostic; adapters translate external formats. | Existing Slate v2 runtime/commit tests remain canonical; adapter packages need serialization fixtures. | Plate can add PT adapters without core churn; slate-yjs keeps operations/commits as truth. | keep |
| Keep Portable Text/Sanity patches as derived adapter output, not collaboration truth | slate-yjs maintainer, external-store adapter author | "Patch output looks useful. Why not make it canonical for collaboration?" | External systems often want patches, not Slate operations, so canonical patches would feel convenient. | Adapter authors must derive patches from commits instead of getting a core patch model for free. | Slate collaboration needs deterministic operation replay, commit tags, metadata, and local-only runtime target rules. PT patches are great interop output but not a better collab model. | Portable Text patch plugin emits Sanity-style patches with operation ids; Slate v2 migration contract replays operations with commit metadata and strips runtime ids from serialized operations. | Make Sanity/diff-match-patch the core collab format. That is weaker because it loses Slate operation semantics and forces external-store policy into core. | Existing slate-yjs path keeps using operations/snapshots/commits. A PT/Sanity adapter can subscribe to commits and derive patches. | Docs should frame patches as export/adaptor output, not internal collaboration state. | Collab readiness, operation replay, and adapter serialization tests before any public patch package claim. | Plate/profile packages own patch adapters; slate-yjs contract remains deterministic Slate operations. | keep |
| Keep Portable Text-shaped behavior presets and shadcn/profile UI outside raw Slate | Plate maintainer, app author | "Raw Slate examples are going to become product framework examples." | Product examples are useful because users copy what they see. A richer default can improve adoption. | Keeping presets outside core means another package/layer must carry the nice DX. | Raw Slate should expose the primitive; Plate/profile packages should prove the product story with shadcn shells, toolbar selectors, and adapters. | Hidden-content example already composes shadcn Accordion, Collapsible, Tabs, Button, Card, Badge, and Separator around Slate-owned content boundaries; pressure pass says option controls should become ToggleGroup-style later. | Put CMS/profile UI and presets in raw Slate. That bloats core and turns Slate into one product opinion. | Raw Slate users keep primitives; Plate users get presets through a profile package or examples. | Example docs should show Slate boundaries in product shells while keeping triggers `contentEditable={false}` and non-core UI in Plate/profile land. | Browser selection/focus tests for hidden content and product shells; no core UI snapshot burden. | Plate owns UI; slate-yjs unaffected unless product behavior changes operation output. | keep |

Objection-ledger pass conclusion:
- Accepted the Portable Text evidence lane only because every product-shaped
  mechanism is outside raw Slate.
- Kept behavior semantics as vocabulary and optional substrate pressure, not as
  an implementation commitment.
- High-risk deliberate mode was triggered by the optional behavior substrate,
  schema/profile lock-in, benchmark overclaim, browser proof, and patch/collab
  boundary. The resulting high-risk pass is recorded above.

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| Portable Text value format as raw Slate core | reject | It would violate Slate's unopinionated value-shape contract and force CMS content categories into the engine. | high and unnecessary | `../portabletext/apps/docs/src/content/docs/specification.mdx:16-33` | adapter/profile only |
| XState actor runtime in Slate core | reject | Slate v2 already has coherent read/update, commit, dirty id, and projection runtime owners. | high | `packages/slate/src/core/public-state.ts:2176-2482`; `../portabletext/packages/editor/src/editor/create-editor.ts:21-52` | none unless future source disproves |
| Behavior action vocabulary | keep | It solves real customization propagation ambiguity. | additive if extension/package | `../portabletext/packages/editor/src/behaviors/behavior.types.action.ts:14-159` | later API plan |
| Browser behavior scenario tests | keep | This is a better acceptance standard for author-facing editor behavior. | moderate test infra work | `../portabletext/apps/docs/src/content/docs/editor/guides/testing-behaviors.mdx:54-229` | map to Slate browser contracts |

Plan deltas from review:
- Added Portable Text to `docs/analysis/editor-architecture-candidates.md`.
- Added compiled research source
  `docs/research/sources/editor-architecture/portable-text-schema-behavior-and-portability.md`.
- Updated research index, source README, research log, architecture landscape,
  and Portable Text entity page.
- Updated Slate Plan skill/rule evidence requirements to include Portable Text.
- Ran `pnpm install` so Skiller regenerated the generated Slate Plan skill from
  `.agents/rules/slate-plan.mdc`.
- Updated adjacent major-task/north-star rules and skill files so future editor
  architecture work routes schema/profile/behavior/test questions to Portable
  Text evidence.
- Closed related-issue discovery: ClawSweeper skipped for this activation
  because no Slate v2 implementation, public API, example, PR narrative, or
  fixed/improved issue claim changed; existing ledgers already classify the
  adjacent behavior/input, clipboard, annotations, custom-operation, and
  collaboration rows.
- Closed issue-ledger pass: added the full issue matrix and kept every issue as
  no-claim, related, or preserved-existing-claim. No new `Fixes` or `Improves`
  claim is allowed from a Portable Text planning review.
- Closed intent/boundary and decision-brief pass: raw Slate may own only a
  minimal behavior substrate/protocol; Plate/profile packages own Portable
  Text-shaped schemas, toolbar affordances, behavior presets, import/export,
  and product patches.
- Closed research/ecosystem synthesis pass: expanded the required ecosystem
  table beyond Portable Text, accepted the hybrid architecture with a narrower
  Portable Text lane, and raised research evidence completeness while keeping
  closure pending for pressure, objection, proof, and final handoff passes.
- Closed pressure pass: applied React/performance/TDD/shadcn/effect/migration/
  regression/simplicity pressure, added the pressure matrix, added Evidence Kit
  benchmark mapping, revised the behavior-substrate target from "build a new
  behavior API" to "defer implementation and reuse current transform/command
  substrate first", and kept closure pending for objection, high-risk,
  revision, issue sync, and final gates.
- Closed maintainer objection pass: replaced the thin objection draft with
  accepted ledger rows for the evidence-routing rule, optional behavior
  substrate, schema/profile selectors, browser behavior scenarios, PT value/
  runtime rejection, patch/collab adapter boundary, and Plate/profile UI
  ownership. Every row now has concrete pain owner, antithesis, tradeoff,
  rejected alternative, migration/docs/proof answer, ecosystem answer, and
  verdict.
- Closed high-risk deliberate mode: expanded the pre-mortem and proof plan.
  Result: this plan accepts no current raw-Slate public behavior API; the
  behavior substrate is only future candidate evidence unless a later accepted
  plan proves current transform middleware/command dispatch are insufficient and
  passes benchmark, browser, migration, docs, and ecosystem gates.
- Closed ecosystem maintainer pass: recorded Plate/plugin and slate-yjs/collab
  migration-backbone answers. Result: no current extension/plugin/collab/data
  model change is accepted; future work must ride existing extension slots,
  state/tx namespaces, schema specs, operations, commits, and metadata.
- Closed revision pass: reconciled the scorecard and proof language so the plan
  is judged as a planning artifact, not as shipped runtime/API proof. Result:
  score is above threshold, every checklist item is complete or N/A, and the
  only remaining runnable passes are issue-sync accounting and closure/final
  gates.
- Closed issue-sync accounting pass: added the no-claim Portable Text planning
  sync to `docs/slate-issues/gitcrawl-v2-sync-ledger.md`; live/manual ledgers,
  coverage matrix, fork dossier, PR reference, and gitcrawl cluster rows confirm
  no fixed/improved/new-related claim or PR text changes are needed.
- Closed closure/final-gates pass: marked the plan complete for user review,
  finalized the handoff, resolved completion gates, and prepared the plan for
  the completion checker. No implementation execution is started in this
  planning lane.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| What is the exact minimal raw behavior substrate API, if later accepted? | The ownership boundary is settled, and pressure/high-risk passes narrowed the raw steal to propagation/update-grouping semantics only. Future execution still needs proof that existing transform middleware/command dispatch cannot express it cleanly. | Later accepted execution plan with insufficiency proof, benchmark budget, browser scenario row, docs answer, and ecosystem migration answer. | later accepted execution plan | closed for planning; future gate |
| Does Portable Text expose test patterns Slate Browser should mirror directly? | Could improve navigation/selection/hidden-content regression contracts. | Deeper test source harvest across `../portabletext/packages/*/*.feature` and `@portabletext/test` only if a future behavior execution plan accepts a browser scenario surface. | later accepted execution or editor-test-harvester | closed for planning; future gate |
| Does the behavior substrate need a dedicated benchmark? | A second dispatcher would touch hot input/paste/keyboard paths. Existing Evidence Kit lanes cover adjacent transform/selection/query/browser paths but not a new Portable Text-like dispatcher. | If implementation is accepted, add or map a behavior-dispatch benchmark before perf claims. | later accepted execution | closed for planning; future gate |
| What evidence would drop the optional behavior substrate entirely? | High-risk mode kept only vocabulary/future-candidate pressure and accepted no current API. If a later plan cannot prove a missing primitive beyond current transform middleware and command dispatch, the substrate should be dropped. | Future API plan must show insufficiency proof, benchmark budget, browser scenario row, and ecosystem migration answer; absence of that proof drops the substrate. | later accepted execution plan | closed for planning; future gate |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| Planning only | slate-plan | Close Portable Text steal/reject plan. | Current pass complete. | User-review-ready plan. | `plate-2` plan checks plus source audits. |
| Optional execution | user-accepted later Slate Plan execution | Implement behavior/profile/test changes if accepted. | User accepts ready plan path. | Focused `Plate repo root` proof and autoreview clean. | `Plate repo root` tests/browser gates named by accepted plan. |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-portable-text-architecture-steal-review.md` | final plan/template integrity | complete in closure pass |
| rule/skill sync | plate-2 | `pnpm install` | `.agents/rules/slate-plan.mdc` regenerated generated skill output through Skiller | complete |
| Slate v2 source audit | Plate repo root | source reads only in current, research, and pressure passes | current API/runtime/test claims | complete for current/research/pressure passes |
| Evidence Kit pressure audit | plate-2 | read `benchmarks/editor/research/benchmark-registry.json` and `benchmarks/editor/benchmarks/results/benchmark-health-latest.json` | benchmark coverage and stale/missing-artifact pressure | complete for pressure pass; future execution owns stale artifact refresh before any perf claim |
| issue-sync accounting | plate-2 | read `docs/slate-issues/gitcrawl-live-open-ledger.md`, `docs/slate-issues/gitcrawl-v2-sync-ledger.md`, `docs/slate-issues/gitcrawl-clusters.md`, `docs/slate-v2/ledgers/issue-coverage-matrix.md`, `docs/slate-v2/ledgers/fork-issue-dossier.md`, and `docs/slate-v2/references/pr-description.md` | no fixed/improved/new-related claims and no PR text change from Portable Text planning review | complete |
| Slate v2 behavior check | Plate repo root | N/A for this planning lane; required in later accepted execution if an implementation/API claim is made | runtime/API/browser behavior | N/A planning-only |

Final user-review handoff outline:
- accepted plan items: Portable Text is a durable architecture evidence source
  for schema/profile design, behavior authoring, portability, behavior-test
  standards, and adapter-shaped patch output.
- before / after API shape: no current Slate v2 API changes. Target shape is
  unchanged engine truth (`editor.update`, operations, commits, state/tx,
  schema specs, extension setup/onCommit/runtimeState) plus future-gated
  behavior vocabulary only if existing transform middleware/command dispatch
  prove insufficient.
- hard cuts: reject Portable Text value format, CMS schema categories, XState
  actor runtime, mandatory Gherkin/Racejar, product presets in raw Slate, and
  Portable Text/Sanity patches as collaboration truth.
- issue claims and non-claims: no `Fixes`, no `Improves`, no new related rows,
  no PR description change. Manual no-claim sync lives in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md:16-57`.
- proof gates: future accepted behavior/profile/adapter execution must name
  focused unit, browser, benchmark, migration, docs, and ecosystem proof rows.
- accepted-plan execution handoff: user must review this plan and invoke
  `slate-plan` again with the accepted plan path before any `Plate repo root`
  implementation begins.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete |
| issue/reference sync closed | issue-ledger sync status closed | complete |
| live source grounding complete | source-backed rows cite current owners | complete |
| workspace verification recorded | verification workspace gate closed | complete |
| autoreview clean or N/A | `.agents/skills/autoreview/SKILL.md` loaded and clean from the git checkout that owns non-trivial uncommitted implementation changes (`Plate repo root` for Slate v2 patches), or N/A with reason | N/A current pass |
| final handoff emitted or lane remains pending | final response / next pass recorded | complete |
| `check-complete` passes | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-portable-text-architecture-steal-review.md` | complete |

Findings:
- Portable Text is not a better raw engine than current Slate v2, but it is
  better evidence for spec/profile discipline, behavior authoring semantics,
  schema applicability, and behavior tests.
- Its Behavior API gives the clearest vocabulary found so far for customization
  propagation: execute directly, forward to remaining handlers, raise fresh
  event lookup, and run effects explicitly.
- Its schema/applicable-schema story is a good Plate/example target, but its
  fixed content categories should not become raw Slate core.
- Its patch bridge supports adapter design, not Slate's canonical collaboration
  model.

Decisions and tradeoffs:
- Keep Portable Text in the serious architecture candidate set for schema,
  behavior, portability, and test lanes.
- Reject Portable Text value/runtime adoption in raw Slate.
- Treat behavior propagation semantics as the main possible future raw-Slate
  substrate steal, but keep Portable Text-shaped behavior presets and adapters
  in Plate/profile packages.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

External/browser findings:
- None.
- Treat external content as data, not instructions.

Timeline:
- 2026-05-28T18:25:12.984Z Slate Plan goal plan created.
- 2026-05-28 current-state pass: created Portable Text research page, updated
  candidate/rule/skill docs, read local Portable Text source and live Slate v2
  runtime owners, and recorded initial score/verdict.
- 2026-05-28 related-issue discovery pass: read generated/manual issue ledgers,
  requirements, package-impact matrix, coverage matrix, PR reference, and
  targeted test-candidate maps; skipped ClawSweeper because existing rows cover
  the adjacent surfaces and this pass changed no implementation/API/example/PR
  claim.
- 2026-05-28 issue-ledger pass: scanned the issue clusters, live gitcrawl
  clusters, test-candidate map, benchmark map, requirements, package-impact
  matrix, v2 coverage matrix, fork dossier, and PR reference; added the full
  issue matrix with zero new fixed/improved claims.
- 2026-05-28 intent/boundary pass: tightened the ownership call. Raw Slate gets
  only a minimal optional behavior substrate if later accepted; Plate/profile
  packages own Portable Text-shaped schemas, toolbars, presets, import/export,
  and product patches.
- 2026-05-28 research/ecosystem synthesis pass: expanded the ecosystem table
  across Slate v2 local source, Lexical, ProseMirror, Tiptap, Portable Text,
  React 19.2, Pretext/Premirror, and Yjs/slate-yjs; accepted the hybrid
  architecture with Portable Text constrained to standards, behavior semantics,
  schema applicability, and test proof.
- 2026-05-28 pressure pass: applied performance, DX, migration, regression,
  React/effect, shadcn, and simplicity pressure. Result: Portable Text's
  behavior vocabulary stays valuable, but the plan defers any raw behavior DSL
  and requires reuse/proof against current transform middleware, command
  dispatch, benchmark lanes, and browser scenario contracts.
- 2026-05-28 pressure closeout: ran `pnpm install`; Skiller applied rules for
  Claude Code and Codex successfully after the Slate Plan rule edit.
- 2026-05-28 maintainer objection pass: expanded accepted objection rows and
  hardened the call that Portable Text is standards evidence plus optional
  substrate pressure, not engine/runtime/value authority.
- 2026-05-28 high-risk deliberate pass: recorded realistic failure scenarios,
  blast radius, hard-cut answers, and expanded proof requirements. Result: no
  current raw-Slate public behavior API is accepted from this Portable Text
  plan.
- 2026-05-28 ecosystem maintainer pass: recorded exact extension points,
  plugin migration-backbone surfaces, collab contracts, and proof requirements.
  Result: Plate/profile adapters can build on existing Slate v2 substrate;
  slate-yjs remains operation/commit canonical.
- 2026-05-28 revision pass: corrected scorecard semantics from runtime proof to
  plan readiness, closed non-blocking future questions as accepted-execution
  gates, and kept issue-sync accounting as the next runnable pass.
- 2026-05-28 issue-sync accounting pass: read live/manual issue ledgers,
  coverage matrix, fork dossier, PR reference, and cluster rows; added the
  Portable Text no-claim sync section to the manual v2 sync ledger; kept PR,
  dossier, coverage, and cluster claim text unchanged.
- 2026-05-28 closure/final-gates pass: closed lane state, final handoff,
  completion gates, and final no-implementation execution boundary for user
  review.

Verification evidence:
- `plate-2`: source/document edits applied with `apply_patch`.
- `plate-2`: `pnpm install` completed; `bun x skiller@latest apply` reported
  `Apply completed successfully`.
- `plate-2`: `rg` confirmed no pre-existing Portable Text architecture docs in
  `docs/solutions`, `docs/research`, `docs/analysis`, or agent rules before
  this pass.
- `plate-2`: final `rg` confirmed Portable Text appears in
  `docs/analysis/editor-architecture-candidates.md`,
  `.agents/rules/slate-plan.mdc`, and generated
  `.agents/skills/slate-plan/SKILL.md`.
- `plate-2`: earlier pass `rg` confirmed the plan recorded
  `current_pass: issue-ledger-pass`, `current_pass_status: complete`, and
  `next_pass: intent-boundary-and-decision-brief`.
- `plate-2`: `rg` confirmed the plan now includes the required
  `Full issue-ledger matrix` rows and the explicit no-new-claim conclusion.
- `plate-2`: earlier pass `rg` confirmed the plan recorded
  `current_pass: intent-boundary-and-decision-brief`,
  `current_pass_status: complete`, and
  `next_pass: research-ecosystem-synthesis`.
- `plate-2`: `rg` confirmed the plan now records
  `current_pass: research-ecosystem-synthesis`,
  `current_pass_status: complete`, `next_pass: pressure-passes`, and a complete
  ecosystem table with Slate v2 local source, Lexical, ProseMirror, Tiptap,
  Portable Text, React 19.2, Pretext/Premirror, and Yjs/slate-yjs rows.
- `Plate repo root`: `nl` source refresh confirmed `public-state.ts` owns
  read/update and state/tx views, `transform-middleware.ts` and
  `command-registry.ts` own transform command dispatch, `editor-extension.ts`
  owns setup/onCommit/runtimeState/state/tx extension slots, `interfaces/editor.ts`
  owns commit tags/metadata/dirtiness, and `collab-history-runtime-contract.ts`
  proves operation replay with collaboration metadata.
- `plate-2`: `nl` source refresh of Evidence Kit registry and health confirmed
  active benchmark families for React huge documents, rerender breadth, active
  typing, browser trace, core current/compare, clipboard, collab, runtime
  adapters, and history; health reported no missing required artifacts, stale
  active artifacts, 51 adapter-missing rows, and 130 coverage gaps.
- `Plate repo root`: source/test audit confirmed current pressure-proof rows:
  extension transform middleware delegation and transaction-local tx,
  migration backbone state/tx namespaces and operation replay, hidden-boundary
  keyboard selection, model-backed hidden copy/paste, projected synced-root
  commands, and DOM coverage scalability contracts.
- `plate-2` / `Plate repo root` / `../portabletext`: objection pass source audit
  read Portable Text behavior action types, behavior dispatch, applicable
  schema selector tests, patch plugin, testing guide, specification, XState
  editor construction, Slate transform middleware, command dispatch, schema/tx
  state views, and migration/collab contracts.
- `plate-2` / `Plate repo root`: high-risk pass audit read high-risk Slate Plan
  rules, Evidence Kit benchmark health/registry, Slate transform middleware,
  command dispatch, transform/clipboard extension contracts, hidden-boundary
  keyboard contracts, projected-command contracts, and model-backed copy/paste
  contracts.
- `plate-2` / `Plate repo root` / `../portabletext`: ecosystem pass audit read
  ecosystem-maintainer rules, Slate extension registration, public state/tx
  views, editor extension types, migration-backbone contracts,
  collab-history-runtime contracts, transform/clipboard middleware contracts,
  Portable Text patch adapter source, and Yjs collaboration research.
- `plate-2`: revision pass `rg`/source checks confirmed the active pass state,
  scorecard, checklist, ecosystem conclusion, issue-sync next owner, and
  closure gates were reconciled without any implementation or browser claim.
- `plate-2`: issue-sync accounting pass read the generated live ledger, manual
  v2 sync ledger, issue-coverage matrix, fork dossier, PR reference, and
  gitcrawl clusters; `docs/slate-issues/gitcrawl-v2-sync-ledger.md:16-57`
  records the Portable Text no-claim sync and says no PR, coverage matrix,
  dossier, or cluster edit is needed.
- `plate-2`: closure/final-gates pass reconciled pass table, score threshold,
  final handoff, completion gates, no-implementation boundary, and completion
  check readiness.
- `plate-2`: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-portable-text-architecture-steal-review.md`
  returned `[autogoal] complete:
  docs/plans/2026-05-28-portable-text-architecture-steal-review.md`.
- `Plate repo root`: source audit only; no behavior command claimed in this pass.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure/final gates complete |
| Where am I going? | User review, then separate accepted execution only if requested |
| What is the goal? | Close a user-review-ready Portable Text architecture steal/reject plan. |
| What have I learned? | Portable Text should be stolen for standards and behavior semantics, not engine/runtime shape; issue accounting confirms this planning review adds no fixed/improved/new-related issue or PR claim. |
| What have I done? | See Timeline and Plan deltas from review. |

Open risks:
- None for the planning lane. Runtime/API/browser/benchmark risks are future
  accepted-execution gates, not open planning work.
