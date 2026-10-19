# core packages plite api migration

Objective:
Migrate Plate core/tests to the new Plite direct read/update API and delete redundant core helper glue, with `check:core` green.

Goal plan:
docs/plans/2026-06-26-core-packages-plite-api-migration.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-invoked `$auto`
- prompt / link: `full core packages including tests to use that new api, cut helpers you did`
- lane: shared editor / Plate core consuming Plite runtime
- surface / route / package: `packages/core/**`, core tests, core type tests, and only directly required Plite touch-ups
- invocation mode: full loop until scoped closure
- minimum runtime / deadline: none requested
- completion threshold summary: core source/tests use the accepted `editor.read.*` / `editor.update.*` direct API where it removes redundant helper glue; obsolete helper wrappers are deleted or justified; `pnpm check:core` passes; plan checker passes.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: no timed minimum; finish when scoped gates are green
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Closure is legal only when core API wrappers introduced during the Plite migration are audited, redundant wrappers/helpers are cut or explicitly kept for Plate-specific semantics, core tests/type tests are migrated with the current API shape, focused proof passes, `pnpm check:core` passes, non-app/browser/mobile/perf rows are marked N/A with reason, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-core-packages-plite-api-migration.md` passes.

Verification surface:
- source audits: `rg` for legacy Plate transform/API bridge names, helper wrappers, and direct Plite API adoption in `packages/core/src`, `packages/core/test`, and `packages/core/type-tests`
- focused package proof: focused `bun test` / package tests for changed core files when available
- full scoped proof: `pnpm check:core`
- browser proof: N/A unless code changes affect rendered app/editor browser behavior; this lane targets package API/tests
- mobile/raw-device proof: N/A; no raw-device claim
- benchmark/perf proof: N/A; no perf claim
- docs/skill sync: N/A unless this run edits docs or `.agents/**`
- final plan proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-core-packages-plite-api-migration.md`

Constraints:
- Resolve lane first: Plite, Plate, or shared editor. Use `autoclosure` for post-merge/current-tree until-clean closure.
- Release, PR, and publish work are in scope only when the prompt explicitly asks for them or the active lane requires them.
- Plite-lane proof runs from the Plate repo root against transplanted Plite packages and routes. Do not use donor-checkout proof.
- Plate-lane proof runs in the owning Plate package, app, or docs route. Plite runtime proof does not prove Plate docs, registry, plugin, or package DX.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite. Do not patch Plite runtime when the run is scoped to Plate docs/product unless a shared-editor owner row names that boundary.
- Use root `VISION.md` and relevant `docs/vision/*.md` for durable taste.
- Do not create compatibility aliases or runtime shims unless the checkpoint explicitly requires them.

Boundaries:
- Source of truth: root `VISION.md`, `docs/vision/plite.md`, `docs/vision/plate.md`, current Plite public API shape from `packages/plite`
- Allowed edit scope: `packages/core/**`, core tests/type-tests, and minimal Plite exports/tests only if core exposes a real missing substrate primitive
- Browser surfaces: N/A unless a package change changes rendered editor behavior
- Package/API surfaces: Plate core API and tests; no release package surface outside the scoped core migration
- Agent/skill surfaces: N/A; no skill changes requested
- Docs/research surfaces: N/A; docs only if code API names force a current-state reference fix
- Non-goals: broad Plate v2 redesign, docs rewrite, Plite browser matrix, mobile proof, perf optimization, release, PR, commit, or package migration outside core

Output budget strategy:
- Use targeted `rg` over `packages/core/src`, `packages/core/test`, and `packages/core/type-tests`; cap terminal output and write broad audits to `.tmp/` if needed. Read exact files before editing.

Blocked condition:
- Block only if `check:core` exposes a broader public API fork requiring user taste review, or if a missing Plite primitive would require changing the accepted Plite read/update API contract instead of migrating core callers.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: shared editor / Plate core
- surface: `packages/core/**`
- mode: full scoped closure
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 0
- current_checkpoint: final-handoff
- current_checkpoint_status: done
- next_checkpoint: none
- goal_status: ready-to-complete

Current verdict:
- verdict: complete
- confidence: high for scoped Core/Plite direct API migration
- next owner: none
- keep / revert / quarantine call: keep
- reason: source audits, `pnpm check:core`, Core declaration build, and Table spillover proof passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-core-packages-plite-api-migration.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | done | P0 | Copy prompt requirements and read vision before implementation. | Requirement rows complete. | keep |
| status | auto | done | P0 | Read active plan, latest prompt, source status, and current evidence. | Active goal and current plan continued. | keep |
| gap-scan | auto | done | P0 | Identify core helper/API/test gaps around Plite direct read/update adoption. | Source audits and failing type/test gates routed the packets. | keep |
| core-helper-cut | auto | done | P0 | Delete or justify redundant helpers introduced during the migration. | `createCurrentRuntimeEditor` alias cut; direct read/update API adopted; recursive helper type graph narrowed. | keep |
| core-test-migration | auto | done | P0 | Update core tests/type-tests to the current API shape without losing inference. | Core specs/type-tests repaired and focused specs passed. | keep |
| package-proof | auto | done | P0 | Prove core package after migration. | `pnpm check:core` passed. | keep |
| table-spillover-proof | auto | done | P0 | Prove directly touched Table spillover files. | `pnpm turbo typecheck --filter=./packages/table && pnpm --filter @platejs/table test` passed. | added |
| closure-handoff | autoclosure | N/A | N/A | Post-merge/current-tree until-clean closure is not this prompt. | Not requested. | keep |
| behavior-proof | lane proof owner | N/A | N/A | No editor behavior/runtime browser claim unless core changes affect behavior. | Package tests cover changed runtime API contract; no rendered route touched. | keep |
| oracle-repair | lane test owner / tdd | done | P1 | Repair tests only for changed core API/helper behavior. | Added Plite direct-read coverage and repaired Core/Table tests to current API. | keep |
| visual-proof | Browser / Playwright | N/A | N/A | No rendered route touched unless evidence appears. | Not in scope. | keep |
| browser-helper-promotion | lane proof harness | N/A | N/A | No browser proof helper work in scope. | Not in scope. | keep |
| mobile-claim-width | auto | N/A | N/A | No mobile claim. | Not in scope. | keep |
| huge-document-smoke | lane proof owner | N/A | N/A | No huge-document claim. | Not in scope. | keep |
| perf-packet | lane perf owner | N/A | N/A | No perf claim. | Not in scope. | keep |
| supervision-mode | auto | N/A | P0 when timed runtime remains | No timed runtime requested. | Not needed. | keep |
| consolidation | auto | N/A | P1 | Move accepted reusable decisions to durable docs/rules. | No reusable skill/docs decision emerged. | keep |
| final-handoff | auto | done | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded |
| 0 | update/add | core-helper-cut, core-test-migration, package-proof | prompt extraction | core package migration is the real scope; generic browser/mobile/perf rows are N/A unless evidence reopens them | done |
| 1 | add | table-spillover-proof | Table merge files were touched to satisfy Core type contracts | Spillover package needed its own proof. | done |
| 1 | retire as N/A | visual/mobile/huge/perf/browser-helper rows | No rendered route, mobile, huge-doc, perf, or browser-helper claim | Keep claim width honest. | done |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell, visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command, exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become too large.
- Merge checkpoints when overlap confuses routing or two rows always close together.
- Retire or remove checkpoints that are stale, superseded, irrelevant, duplicated, or contradicted by current evidence. Record the reason in the mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The user's latest request, `vision`, and current source evidence outrank stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | this checkpoint-zero section |
| `auto` source rule read or fallback recorded | yes | `$auto` invoked; local skill read before this plan update |
| `vision` read as checkpoint zero | yes | root/Plite/Plate vision read |
| Active goal checked or created | yes | active goal created for this plan |
| Lane resolved | yes | shared editor / Plate core |
| Invocation mode and timebox recorded | yes | full scoped closure, no timebox |
| Dynamic checkpoint policy accepted | yes | checkpoint supervisor rows updated from prompt |
| Source of truth and allowed workspaces recorded | yes | Boundaries section |
| Output budget strategy recorded | yes | Output budget strategy section |
| Release/PR/publish boundary recorded | yes | no commit/PR/release |
| Browser proof strategy recorded | yes | N/A unless rendered behavior changes |
| Package/API proof strategy recorded | yes | source audit + focused tests + `pnpm check:core` |
| Mobile/raw-device claim-width policy recorded | yes | N/A, no mobile claim |
| Skill repair authority and source-rule boundary recorded | yes | N/A unless skill/tooling gap appears |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plite, Plate, or shared editor, with owning workspace/package/app proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is routed to `autoclosure` when in scope, or marked N/A with reason.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split, merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-state source audit recorded before new runtime patches.
- [x] Behavior proof packet recorded for every in-scope stable editor family or explicitly skipped/deferred with reason.
- [x] Visual/native selection proof packet recorded for browser-visible selection/editing risks or explicitly scoped.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or deferred with owner and proof command.
- [x] Repeated browser proof patterns are promoted to `@platejs/browser` or queued with reason.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited; Playwright viewport proof is not recorded as raw-device proof.
- [x] Huge-document correctness smoke is run or deferred with owner and reason.
- [x] Perf packet runs only after correctness is green, or is marked N/A for this run.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are audited when in scope.
- [x] Docs/vision/rule consolidation is applied when a reusable decision is accepted, or marked N/A.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark, docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or marked N/A with reason.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or prompt/tooling changes, or marked N/A with reason.
- [x] Output budget discipline is followed: broad scans are capped or written to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run scoped proof | `pnpm check:core` passed; Table spillover typecheck/tests passed. |
| Dynamic checkpoint reconciliation | yes | Reconcile from evidence | Added Table spillover proof and marked browser/mobile/perf/docs/skill rows N/A after scope audit. |
| Lane authority proof | yes | Prove in owning packages | Commands ran from repo root against `packages/core`, `packages/plite`, and touched `packages/table`. |
| Workspace authority proof | yes | Record cwd/tool | cwd `/Users/zbeyens/git/plate-2`; tools `pnpm`, `bun`, `rg`, `biome` via package scripts. |
| Behavior gates | N/A | Record scoped defer | No browser-visible behavior claim; package/runtime tests cover changed API behavior. |
| Visual/native selection proof | N/A | Record scoped defer | No rendered route or selection UI touched. |
| Missing oracle repair | yes | Add/verify oracles | Added Plite direct read coverage and repaired Core/Table tests for current API. |
| `@platejs/browser` promotion | N/A | Record scoped defer | No repeated browser proof pattern in scope. |
| Mobile/raw-device claim width | N/A | Record scoped defer | No mobile claim. |
| Huge-document correctness smoke | N/A | Record scoped defer | No huge-document claim. |
| Package/API proof | yes | Source-audit and package proof | Legacy helper audits clean; `pnpm check:core`; `pnpm --filter @platejs/core build`; Table proof passed. |
| Autoclosure handoff | N/A | Record scoped defer | Post-merge/current-tree closure not requested. |
| Skill/rule sync | N/A | Record scoped defer | No `.agents/rules/**` edits. |
| Changed list / review attention / stopping checkpoints | yes | Fill final ledgers | Changed list, attention rows, and no-stopping-checkpoint row below. |
| Final lint/check | yes | Run scoped check | `pnpm check:core` passed after lint fixes. |
| Workflow slowdown review | yes | Log slowdown | Core check had to expose Core declaration build through Table proof; no skill repair needed. |
| Agent-native review for agent/tooling changes | N/A | Record scoped defer | No agent/tooling changes. |
| Autoreview for non-trivial implementation changes | N/A | Record scoped defer | User asked `auto` proof, not autoreview; no review skill invoked in this goal. |
| Goal plan complete | yes | Run check-complete | To run after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | done | prompt rows, boundaries, proof strategy recorded | status |
| Status and current-state read | done | active goal and current plan inspected | gap scan |
| Gap scan and scenario matrix | done | source audits plus type/test failures identified helper/test gaps | helper cut |
| Core helper cut | done | redundant alias removed; direct read/update methods adopted; recursive type context cut | core test migration |
| Core test migration | done | Core specs/type-tests repaired; focused specs passed | package proof |
| Package proof | done | `pnpm check:core` passed | final handoff |
| Table spillover proof | done | Table typecheck/tests passed after touched merge files | final handoff |
| Behavior proof | N/A | no browser-visible behavior claim; package tests cover runtime API contract | oracle repair |
| Oracle repair | done | Plite direct read test and Core/Table test repairs kept | visual proof |
| Visual/native proof | N/A | no rendered route touched | browser helper promotion |
| Browser helper promotion | N/A | no browser proof helper work in scope | mobile claim width |
| Mobile/raw-device claim width | N/A | no mobile claim | huge-document smoke |
| Huge-document correctness smoke | N/A | no huge-document claim | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | N/A | no perf/docs/skill change requested or needed | consolidation |
| Consolidation and review | N/A | no durable docs/rules decision emerged | final handoff |
| Final handoff and goal-plan check | done | final ledgers filled; checker run next | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Core/Plite API | package runtime/types | source/type/test | direct `editor.read.*` and `editor.update.*` usage | source audit, type contracts, package tests | done |
| Table spillover | package runtime/types | source/type/test | path-ref + update test double | Table typecheck/tests | done |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| Plite direct reads | 1 | Plite/Core | Core needed direct methods instead of callback reads. | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/editor-lifecycle-api.ts`, `packages/plite/test/accessor-transaction.test.ts` | package test in `check:core` | keep | none |
| Core helper cut | 1 | Core | Fake aliases and recursive update-context types caused API/type debt. | Core editor/plugin/runtime files; audits for old helper names | `pnpm check:core` | keep | none |
| Core test migration | 1 | Core | Mechanical update rewrite left stale `tx` references and old callback reads. | Core specs/type-tests | focused specs + `pnpm check:core` | keep | none |
| Declaration build fix | 1 | Core | Core declaration bundling overflowed on recursive editor update context. | `BaseEditor.ts`, `PlateEditor.ts`, `createPlateRuntimeEditor.ts` | `pnpm --filter @platejs/core build` | keep | none |
| Table spillover | 1 | Table | Touched Table path-ref/test-double code needed package proof. | Table merge files/spec | Table typecheck/tests | keep | none |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Core package runtime/API | `packages/core`, `packages/plite` | `pnpm check:core` | N/A | pass | none |
| Table touched spillover | `packages/table` | `pnpm turbo typecheck --filter=./packages/table && pnpm --filter @platejs/table test` | N/A | pass | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| N/A | no rendered selection surface touched | N/A | N/A | N/A | claim not made |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | no browser proof pattern in this package-only lane | N/A | N/A | no action |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| N/A | N/A | N/A | N/A | no mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | no huge-document claim |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Table proof after `check:core` | auto | about 18s | Table typecheck builds Core declarations and exposed a dts recursion not covered by source-only `check:core`. | Core build fixed; Table proof passed. | keep as package spillover proof habit; no skill repair needed. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added Plite direct read methods; migrated Core to direct read/update API; cut `createCurrentRuntimeEditor`; narrowed recursive update context/declaration types; kept current runtime command bridge where it has real behavior. |
| tests/oracles/browser proof | Added Plite direct-read coverage; repaired Core specs/type-tests; repaired Table merge spec mock. |
| benchmarks/metrics/targets | N/A. |
| examples/docs | N/A. |
| skills/workflow | N/A. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Core plugin input type was intentionally lightened. | Prevents TS/dts recursion while preserving returned plugin inference. | `packages/core/src/lib/plugin/createBasePlugin.ts` | Review public DX if you want stricter contextual config typing later. |
| 2 | `EditorUpdateContext<any>` is deliberate. | Avoids recursive declaration/type instantiation; transaction inference remains the important part. | `packages/core/src/lib/editor/BaseEditor.ts`, `packages/core/src/react/editor/PlateEditor.ts` | Keep unless you need strongly typed `afterCommit` editor payload. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | none | no user decision required for scoped closure | none | completed scoped migration | none | N/A |

Findings:
- Core direct read/update migration is green under package, type-contract, declaration, and touched Table spillover proof.
- `check:core` alone does not build Core declarations, so the Table proof usefully caught a dts recursion; the fix is kept.

Decisions and tradeoffs:
- Keep the current runtime command bridge because it still owns command composition behavior, not just a fake helper alias.
- Erase update-context editor generics to `any`; keep transaction/plugin tx inference as the public DX priority.
- Make `createBasePlugin` input config data-shaped instead of deriving it from full `BasePlugin` methods.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Core type contracts exposed recursive plugin/editor types | 4 | Erase recursive context generics and lighten constructor input types | resolved |
| `check:core` initially missed Core declaration overflow until Table proof | 1 | Run Core build/Table proof for touched spillover | resolved |

Verification evidence:
- `pnpm test:types` passed.
- `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/accessor-transaction.test.ts` passed.
- Focused Core specs passed: `createPlateRuntimeEditor.spec.ts` and `createPlateStore.spec.tsx`.
- Legacy helper/source audits returned no matches for old transform/API bridge patterns in Core.
- `pnpm --filter @platejs/core build` passed.
- `pnpm check:core` passed.
- `pnpm turbo typecheck --filter=./packages/table && pnpm --filter @platejs/table test` passed.

Final handoff contract:
- Goal plan: complete after checker.
- Lane: shared editor / Plate core.
- Surface and route/package: `packages/core`, `packages/plite`, touched `packages/table`.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full scoped closure, no minimum runtime, one main loop plus spillover proof.
- Behavior gates and visual proof: package runtime/type tests only; no browser-visible claim.
- Primary metric baseline/latest/best and stop reason: pass-gated package closure; stop because proof/audits are green.
- Bugs fixed and oracles added: direct-read Plite test; Core/Table stale test repairs; declaration recursion fix.
- Benchmark/skill/docs repairs: N/A.
- Workflow slowdowns and repairs: Table proof exposed Core declaration overflow; no reusable skill repair needed.
- Changed list: see Changed list.
- Needs your attention: review plugin config input looseness and update-context generic erasure if you want stricter public types.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: browser/mobile/perf/docs are out of scope for this package-only lane.
- Next owner: none.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff |
| Where am I going? | Goal completion |
| What is the goal? | Core package/tests migrated to Plite direct read/update API with redundant helpers cut and `check:core` green. |
| What have I learned? | Declaration build can still fail after source typecheck; Table spillover proof is useful when Core public types changed. |
| What have I done? | Migrated direct API usage, cut fake helper aliases, repaired tests/types, and proved Core plus touched Table spillover. |
| What changed in the checkpoint plan? | Added Table spillover proof, marked browser/mobile/perf/docs/skill rows N/A, and closed package proof rows. |

Timeline:
- 2026-06-26T16:29:58.838Z Goal plan created.
- 2026-06-26T16:55:00.000Z Core/Plite direct API migration and proof closed.

Open risks:
- None for the scoped Core/Plite API migration. Broader Plate package migration remains a separate lane.
