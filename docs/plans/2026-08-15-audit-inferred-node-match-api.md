# audit inferred node match api

Objective:
Choose the best breaking matcher-inference API and audit every similar node API; done when the full NodeMatch surface has a disposition and one coherent target shape.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-15-audit-inferred-node-match-api.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- none

Major source:
- type: user prompt plus current Plate/Plite source
- id / link: N/A: no tracker item
- title: Inferred node matcher API
- decision to make: define a breaking, inference-first matcher grammar that preserves additional match conditions and identify every affected API
- decision criteria: no caller-selected output generic; descriptor/schema-handle and type-guard inference; arbitrary extra predicates remain composable; one grammar across reads and transforms; no Plate concepts leaked into Plite

Major lane:
- lane: architecture or public API
- output type: source-backed API recommendation and complete affected-surface inventory
- implementation expected: no; analysis only until the user explicitly says go
- affected packages / surfaces: packages/plite node matcher types and APIs, packages/core Plate specialization, package and registry consumers, public docs and type contracts
- dominant risk: solving `find` locally while leaving parallel unsafe caller-selected generics on sibling query/transform APIs

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: completion uses a counted API inventory
- improvement loop: audit declarations, implementation normalization, docs, and representative consumers; reconcile every NodeMatch-bearing method
- final score / loop closure: N/A

Completion threshold:
- Every public `NodeMatch`-bearing read and transform declaration is counted and classified.
- The target call shape covers descriptor matching plus additional conditions without an explicit output generic.
- Plite and Plate ownership, inference law, runtime validation, rejected alternatives, breaking impact, and next owner are explicit.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-audit-inferred-node-match-api.md`
  passes.

Verification surface:
- Source audit of `NodeMatch`, all public interfaces using it, implementation normalization, docs examples, and all explicit `nodes.*<...>` query consumers under `packages/**`, `apps/**`, and `content/**`.
- Count reconciliation between declarations and classifications in this plan/final handoff.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.

Boundaries:
- Source of truth: current `packages/plite`, `packages/core`, relevant `VISION.md` / `docs/vision/**`, and `best-api` doctrine.
- Allowed edit scope: this goal plan only; production source remains read-only.
- External sources: N/A: local ownership and types settle this decision.
- Browser surface: N/A: type/API design only.
- Tracker sync: N/A: no tracker item.
- Non-goals: implementation, compatibility aliases, package changes, docs changes, tests, browser proof, or unrelated schema redesign.

Output budget strategy:
- Count files and declarations first with focused `rg`; inspect only owning interfaces, normalization, docs, and representative consumers; cap every output and exclude generated/build trees.

Blocked condition:
- Block only if public API ownership cannot be determined from current Plite/Core source; otherwise choose the best breaking target and report implementation questions separately.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A: analytical goal closed
- goal_status: complete

Current verdict:
- verdict: split structural selection from conditions: `type: PluginOrSchemaHandle` selects and infers the element; `match` applies additional typed conditions. Remove caller-selected output generics and do not add descriptor-first overloads.
- confidence: high after full declaration/caller inventory and alternative pressure pass
- next owner: plate-plan/plite-plan after user acceptance
- reason: one options-object grammar composes across reads, selection predicates, mutations, and corrections while preserving arbitrary property/predicate conditions

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-audit-inferred-node-match-api.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact call must lose `<LinkElement>`, preserve additional conditions, allow a breaking API/overload decision, and include every similar API. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md` fully. |
| Active goal checked or created | yes | `get_goal` returned none; goal created with this plan path. |
| Source of truth read before analysis | yes | Read `best-api`, relevant Vision doctrine, `EditorNodesReadOptions`, `NodeMatch`, `find`, runtime normalization, and Link callers. |
| Major lane selected | yes | Architecture/public API, analytical only. |
| Decision criteria stated | yes | Recorded under Major source and Completion threshold. |
| Existing repo patterns / prior decisions checked | yes | Current doctrine requires schema handles for matching, descriptor identity in Plate, and rejects caller-selected generics/casts. |
| Helper stack selected | yes | `best-api`, `major-task`, and `autogoal`; no external reviewer needed for a local type-surface audit. |
| External research decision recorded | no | N/A: current repo types and doctrine settle the question. |
| Implementation expectation recorded | yes | No production implementation until explicit user authorization. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`, current Plite/Core source. |
| Branch / PR expectation decided | no | N/A: analytical task with no PR request. |
| Output budget strategy recorded | yes | Focused counts first, capped owner reads, no generated/build trees. |

Work Checklist:
- [x] N/A: no duration was requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] N/A: implementation did not happen, so no touched-surface pack is required.
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | Reconciled 36 public `NodeMatch*` declaration references; 319 explicit node API generics across 76 files; 177 `match: { type }` syntax candidates across 56 files. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Read `NodeMatch`, editor read/transaction interfaces, transform options, runtime normalization, correction queries, Link callers, and representative insert/duplicate implementations. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Final target has separate `type` selector and `match` condition; no output generic; one options grammar; Plate descriptors lower to Plite schema handles/types. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Rejected descriptor-only `match`, positional overload, tuple/combinator DSL, and plugin-scoped `read.find`; reasons recorded below. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Applied `best-api` two-pass gate against arbitrary extra conditions, all matcher-bearing APIs, Plite/Plate ownership, and TypeScript inference/runtime truth. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Accepted: previous `match: LinkPlugin` recommendation consumed the condition slot; corrected target separates selector from condition. No production fix authorized. |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: local public types, implementation, doctrine, and callers settle the API. |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: production source stayed read-only; only this analysis plan changed. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below and in final response. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent when files changed | N/A: no source code changed; formatting the analysis plan would not prove the API. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used counts, capped `rg`, focused `sed`, and `/tmp` inventories; no build/generated trees. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-audit-inferred-node-match-api.md` | Pass after final plan reconciliation on 2026-08-15. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | prompt, skills, Vision, Link call, and owning interfaces read | current-state map |
| Current-state map | complete | declaration, implementation, caller, and docs counts reconciled | options |
| Options and recommendation | complete | `type` selector plus `match` condition chosen | review |
| Review / pressure pass | complete | four alternatives rejected against all affected surfaces | implementation decision |
| Implementation or plan artifact | complete | analysis-only plan updated; production code intentionally untouched | verification |
| Verification | complete | focused source audits and count reconciliation recorded | closeout |
| Closeout | complete | recommendation, affected-surface inventory, proof contract, and final handoff recorded; goal checker passes | N/A |

Findings:
- Fact: `EditorStateNodesApi.find` is declared as `<T extends Node = ValueNode<V>>(options?: EditorNodesReadOptions<T>) => NodeEntry<T> | undefined`; callers choose output `T` without runtime proof.
- Fact: the same caller-selected generic pattern exists on `above`, `block`, `levels`, `entries`, `some`, `toArray`, `next`, and `previous`; `get<T>` and `parent<T>` are also unchecked when given paths or keys.
- Fact: scoped searches found 319 explicit node API type arguments across 76 files: get 154, above 53, find 28, parent 25, toArray 20, entries 12, block 9, set 8, previous 5, some 2, next 2, levels 1.
- Fact: 177 `match: { type: ... }` syntax candidates exist across 56 files, proving that element identity selection is a common independent job.
- Fact: `NodeInsertNodesOptions<T>` types its split-target `match` with the inserted node `T`, although runtime `insertNodes` uses that matcher to choose the node split around a point. Those are different roles.
- Fact: query/transform `at` targets are repeatedly coupled to matched/output `T`, although a traversal scope may have a different node type from the nodes returned or mutated.
- Fact: `nodes.duplicate` and `blocks.insertAfter` expose inherited `match` even though both compute a Path before delegating to insert, where the matcher is not consulted.
- Fact: correction `query` uses `NodeMatch`, but its selected node type is not projected into `correct({ entry })`.
- Inference: the owning defect is not missing overloads on `find`; it is one generic representing location, selector, condition, and output.
- Recommendation: introduce a query contract with independent `type` and `match`; infer from query input and runtime validation, never from a caller-selected node output generic.

Decisions and tradeoffs:
- Choose `type: LinkPlugin` plus `match: ...` -> `type` selects compiled element identity and supplies inference; `match` is a function-only additional condition.
- Keep `type` rather than `plugin`, `element`, or `of` -> persisted AST identity is the actual selection job; Plate descriptors and Plite schema handles are resolver inputs, while raw strings remain the dynamic boundary.
- Reject `match: LinkPlugin` alone -> it consumes the only condition slot and forces a second composition mechanism.
- Reject `find(LinkPlugin, options)` overload -> it creates per-method positional grammar and does not scale cleanly to `set(props, options)`, `wrap(element, options)`, selection predicates, or correction queries.
- Reject tuple/AND matcher DSL -> it adds a new mini-language solely to compensate for conflated selector and condition roles.
- Reject `editor.plugin(LinkPlugin).read.find()` -> generic tree traversal belongs to the node owner; plugin scoping would duplicate every query verb.
- Raw Plite owns schema-handle/string selection and matcher normalization; Core adds exact Plate descriptor lowering and exact `ElementOf` inference without leaking plugins into Plite.
- `NodeApi.matches` and `applyDeepToNodes` keep condition-only matching because they already receive a concrete node; they do not need an editor-resolved selector.
- Insert gets a separate `split` query because its matcher selects the split target, not the inserted node. Dead matcher options on `nodes.duplicate` and `blocks.insertAfter` are deleted.

Implementation notes:
- None yet.

Review fixes:
- Previous recommendation `match: LinkPlugin` -> accepted as incomplete -> replaced with `type: LinkPlugin, match: ...` after checking additional predicates and non-find APIs.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `rg` explicit generic inventory in `/Users/zbeyens/git/plate-2` -> 319 calls across 76 files, reconciled by method count.
- multiline `rg` for `match: { type:` -> 177 candidates across 56 files.
- public declaration audit -> 36 `NodeMatch*` references across Plite interfaces plus Core/feature public consumers.
- source reads -> `packages/plite/src/interfaces/editor.ts`, `interfaces/node.ts`, `interfaces/transforms/node.ts`, `utils/node-match.ts`, `editor/nodes.ts`, `transforms-node/insert-nodes.ts`, `core/public-state.ts`, Core plugin runtime schema types, and Link callers.

Final handoff contract:
- Recommendation: hard-cut caller-selected node output generics; use independent `type` selectors and additional `match` conditions across node queries/transforms/corrections.
- Confidence: high for public shape; implementation feasibility still requires compile-only inference and runtime lowering proof.
- Evidence: declaration/runtime/caller counts and four-option pressure pass recorded above.
- Tests / commands: source-audit only; no implementation tests apply yet.
- Browser proof: N/A: type/API design only.
- PR / tracker: N/A: no request and no source implementation.
- Caveats: Core must lower an exact installed Plate descriptor to the current compiled schema type; raw Plite must remain plugin-free. TypeScript proofs must prevent output type arguments and avoid full application grammar expansion.
- Next owner: `plate-plan` with `plite-plan` for the substrate query contract after user acceptance; `best-api repair` must record the accepted selector/condition law.

Timeline:
- 2026-08-15T09:05:06.975Z Major-task goal plan created.
- 2026-08-15T11:05:19+02:00 Goal contract filled and active goal created.
- 2026-08-15T11:20:00+02:00 Completed declaration, implementation, caller, and docs inventory; selected `type` plus `match` target.
- 2026-08-15T11:25:00+02:00 Reconciled the final plan and passed the autogoal completion checker.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Return the API verdict; implementation awaits explicit authorization. |
| What is the goal? | Choose the best breaking matcher-inference API and classify every similar node API. |
| What have I learned? | The root defect is one generic conflating target, selector, condition, and output; `type` plus `match` is the smallest uniform correction. |
| What have I done? | Audited public declarations, runtime normalization, representative implementations, docs syntax, and 319 explicit generic callers. |

Open risks:
- Implementation must prove contextual typing of `match` from `type`, descriptor arrays/unions, app schema overrides, transaction-local behavior, and finite declaration emit without expanding the complete application grammar.
