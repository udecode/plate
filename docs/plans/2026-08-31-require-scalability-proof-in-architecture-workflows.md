# Require scalability proof in architecture workflows

Objective:
Require scalability proof in architecture/API workflows; done when all
applicable owners/templates are covered and mirror/forward tests pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-require-scalability-proof-in-architecture-workflows.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Expectation:
- user expectation: architecture and API work must discover performance risk,
  set scale guards, measure a baseline, and prove the chosen owner before the
  architecture is accepted or implementation is called complete.
- observed miss: transient projection was rearchitected and presented as done;
  only a later user request measured scale, exposed whole-collection work, and
  forced a second architecture pass.
- owning skill/template/helper: architecture/API derived rules plus the
  reusable Autogoal templates and packs that materialize their gates.
- repair classification: derived-skill workflow and future-plan template repair;
  generic Autogoal owns the cross-template applicability law only.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: exact owner/template coverage is measurable
- improvement loop: close every applicable row in the owner/template ledger
- final score / loop closure: 100% applicable owners covered, zero stale mirrors

Completion threshold:
- Every applicable architecture/API planning or implementation owner in the
  audited denominator requires a pre-implementation performance/scalability
  applicability decision and blocks acceptance/closeout until baseline,
  scale cohort, budget, exact rerun, and correctness evidence exist, or until a
  concrete source-backed N/A reason proves no repeated or hot runtime work.
- Every applicable Autogoal primary template or pack materializes that decision
  without requiring a user to ask for performance after architecture work.
- Canonical-rule mirrors have zero drift, template smoke proves unfinished plans
  cannot complete, completed plans can represent the contract, and the
  agent-native review has zero accepted findings left open.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-require-scalability-proof-in-architecture-workflows.md` passes.

Verification surface:
- bounded owner/template coverage ledger in this plan
- source audits over canonical `.agents/rules/**` and `docs/plans/templates/**`
- focused rule/template contract tests and Autogoal checker smoke fixtures
- `pnpm install` plus source/generated mirror parity
- `agent-native-reviewer` capability map and zero open accepted findings

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest `autogoal repair <expectation>` request.
- Allowed edit scope: canonical `.agents/rules/**` architecture/API/performance
  workflow owners, `docs/plans/templates/**`, canonical shared Autogoal sources
  under `/Users/zbeyens/git/dotai/skills/autogoal/**`, and the smallest focused
  contract tests or generation inputs required to enforce the repair.
- Derived skill scope: only skills that can accept, plan, or implement reusable
  Plate/Plite architecture, public APIs, plugins, or runtime layers.
- Non-goals: product/runtime optimization, benchmark result changes, new public
  APIs, unrelated Plate skills/templates, Plate commits/pushes, or PRs. The
  canonical Dotai commit/push became in-scope when shared Autogoal ownership was
  proven and `sync-skills` required landing that source before refresh.

Output budget strategy:
- Inventory filenames and match counts first. Read only candidate owner rules,
  directly linked references, and relevant templates. Exclude generated output,
  build artifacts, dependencies, registry payloads, and historical plans except
  the observed-miss plan. Cap ordinary reads and keep the coverage ledger here.

Blocked condition:
- Stop only if canonical ownership cannot be resolved after the Autogoal,
  Benchmark, architecture/API rule, and template sources are compared, or if
  generation cannot preserve an edited canonical contract.

Repair state:
- repair_type: derived-skill plus reusable-template repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: repaired
- confidence: high
- next owner: architecture/API workflows consume the repaired contract
- reason: target acceptance and implementation closeout now have separate,
  mechanically materialized scale gates owned by Benchmark and Autogoal.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-require-scalability-proof-in-architecture-workflows.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope, non-goals, stop condition, deliverables, verification, and success threshold are explicit above |
| Timed checkpoint parsed | no | N/A: none requested |
| Expectation restated | yes | Expectation section names the premature architecture closeout |
| Active goal checked | yes | `get_goal` returned none; matching repair goal created |
| Named plan or skill read | yes | observed benchmark plan plus Autogoal, Benchmark, Skill Creator, and agent-native owner instructions |
| Owning source selected | yes | canonical derived rules plus reusable Autogoal templates; exact denominator is the target-selection ledger |
| Repair classification selected | yes | derived-skill plus future-plan template repair |
| Safety conflict checked | yes | no product or public mutation; completion evidence is strengthened |
| Output budget strategy recorded | yes | bounded strategy above |
| Agent-native pack selected | yes | materialized `agent-native` pack |
| Agent-facing action surface identified | yes | architecture/API planning and implementation skill routes |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | skill read completely before target audit |

Work Checklist:
- [x] N/A: no duration was requested; no timed scorecard applies.
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: Benchmark owns executable scale measurement;
      Autogoal owns pack selection/materialization; architecture and
      implementation skills own the acceptance/closeout route into Benchmark.
- [x] Secondary owners are justified or marked N/A in the denominator below.
- [x] Patch touches source-of-truth files only; generated mirrors changed only
      through Dotai install or `pnpm install`.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed after one bounded batch
      exceeded its display cap: later reads were per-owner and capped.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded in Final repair handoff.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced after `.agents/rules/**` changes.
- [x] Agent-native pack: the one accepted review finding, unsafe targeted
      `skills update` teaching, is fixed in `sync-skills`; no accepted finding remains open.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | Dotai Autogoal commit `e4bc2af`; Plate canonical rules/templates patched; global `sync-skills` source patched |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; 44 source/mirror contract rows passed; resource sync exact |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | Temporary `scale-smoke` plan composed `performance-observability` through the real helper |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | Forward test saw exit 1 naming `Pre-acceptance scale proof` |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | Same generated fixture resolved receipts and passed the real checker without template edits |
| Helper/checker tests | yes | If scripts changed, run focused script tests; otherwise N/A | Benchmark/source/mirror suite 44/44; Plate Feature suite 13/13 |
| P1 autoreview / review | no | Run applicable autoreview gate with `--max-priority P1`; P2/P3 are opt-in only, or record N/A for docs-only/source-rule-only repair | N/A: branch is `next`, where repo policy forbids Autoreview; agent-native review completed instead |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | Ultracite passed on matched JS; `git diff --check` passed; rule sources ran through Node contract tests |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One multi-owner read was truncated; subsequent reads/searches were narrowed and capped; no unbounded repo scan ran |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-require-scalability-proof-in-architecture-workflows.md` | Exact command passed after final evidence was recorded |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install`; `sync-resources.mjs --check`; source/mirror test passed |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | All eight acceptance/implementation owners expose the early gate; all relevant templates expose scale applicability/receipt rows |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Capability map below; unsafe CLI targeting finding fixed; zero accepted findings open |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | requirements, boundaries, proof, and active goal recorded | target selection |
| Target selection | complete | bounded denominator records repaired owners/surfaces and four deliberate non-repairs | patch |
| Patch | complete | Dotai shared source, Plate rules/templates/checkers, and global sync instructions repaired | verification |
| Verification | complete | 57 focused tests passed; mirror/resource/pack parity and lint checks passed | closeout |
| Closeout | complete | plan evidence and final handoff prepared | final response |

Findings:
- The generic Autogoal lifecycle already requires measurable outcomes, but it
  does not force architecture goals to decide performance applicability before
  design acceptance.
- Benchmark owns measurement mechanics; architecture/API skills must invoke it
  early enough to influence the target rather than after implementation.
- The observed plan contained asymptotic budgets and deferred warm-sample
  instructions, but its completion gate accepted a review/prototype score in
  place of an executable scale comparison. Paper budgets were therefore able
  to look complete while leaving the architecture unfalsified.

Owner/template denominator:
| Owner | Role | Repair | Reason |
| --- | --- | --- | --- |
| shared `autogoal` | pack selection and generic template seeding | yes | Future architecture goals must materialize the performance pack before target acceptance |
| `benchmark` | executable pre-acceptance probe and production rerun law | yes | Single measurement owner |
| `major-task` | generic heavyweight architecture acceptance | yes | The observed planning class could otherwise close on prose/review |
| `best-api` | reusable public/runtime target selection | yes | It can retain or create scale-sensitive machinery before a layer plan exists |
| `plate-plan` | Plate runtime/API architecture acceptance and execution | yes | Direct target-lock owner |
| `plite-plan` | Plite runtime/API architecture acceptance and execution | yes | Direct target-lock owner |
| `plate-plugin-creator` | entrypoint/plugin runtime implementation | yes | Can implement a bounded runtime owner directly |
| `plate-feature` | end-to-end feature manifest and closeout | yes | Can introduce package, React, or registry repeated work |
| `architecture-cleanup` | behavior-neutral cleanup packets | yes | Hot-owner cleanup still needs measured scale preservation |
| `package-api` pack | public/package runtime-boundary trigger | yes | Must compose the performance pack when public shape changes runtime work |
| `sync-skills` | targeted canonical skill refresh | yes | Its stale update command silently refreshed unrelated global skills during this run |
| `task` | ordinary task execution | no | Routes heavyweight architecture to `major-task` and measured work to `benchmark` |
| `auto` | supervisor/router | no | Routes measured work to Benchmark and does not accept architecture itself |
| `plate-next` | adoption audit | no | Routes unresolved runtime/API decisions to the owning plan |
| `performance` | review lens | no | Defines cohorts/budgets but intentionally does not execute measurements |

Decisions and tradeoffs:
- Strengthen applicability and closure gates instead of copying Benchmark's
  full lane methodology into every architecture skill -> one measurement owner,
  no duplicate benchmark supervisors -> risk is missed routing, covered by
  source/template contract tests and the owner ledger.
- Use a narrowed pre-acceptance design probe inside the active architecture
  goal, not a second Benchmark goal or public mode -> measurement can change the
  plan before source writes without duplicating the full all-lane diagnostic
  loop -> production implementation still requires an exact production-path
  rerun and correctness guard.
- Treat type-only or zero-runtime changes as source-backed N/A -> avoids forcing
  timing theater onto work with no repeated or hot runtime cost.

Repair patch notes:
- Shared Autogoal: strengthened and seeded `performance-observability`; generic
  major-task and package/API templates require early scale classification.
- Benchmark: owns one embedded pre-acceptance design probe inside the parent
  goal and the exact final production rerun; no second public mode or goal.
- Plate acceptance owners: Best API, Major Task, Plate Plan, and Plite Plan
  cannot lock scale-sensitive targets from prose, scores, or deferred proof.
- Plate implementation owners: Plugin Creator, Plate Feature, and Architecture
  Cleanup carry the frozen contract into final production-path proof.
- Plate Feature: Feature Manifest gained a fail-closed Scale proof surface;
  checker accepts source-backed N/A and rejects a missing row.
- Skill sync: targeted refresh uses `skills add --skill`; update-all is explicit
  and cannot masquerade as a narrow command.

Deliberate non-repairs:
- `task`, `auto`, and `plate-next`: route work but do not accept a runtime target
  or close its implementation.
- `performance`: remains a cohort/budget review lens; Benchmark remains the one
  executable measurement owner.
- Product runtime and the prior cursor/projection implementation: explicitly
  outside this workflow-repair goal.

Agent-native capability map:
| Capability | Discoverable owner | Native action | Mechanical proof | Verdict |
| --- | --- | --- | --- | --- |
| Select scale proof before architecture | shared Autogoal SKILL plus performance pack | Compose pack during plan creation | Real helper forward test | pass |
| Measure without a second supervisor | Benchmark rule and methodology | Embedded parent-goal design probe | Source/mirror contract suite | pass |
| Block target acceptance | Best API, Major Task, Plate/Plite Plan | Keep verdict provisional until executable receipt passes | Template gate audit plus checker fixture | pass |
| Block implementation closeout | Plugin Creator, Plate Feature, Architecture Cleanup | Exact final production-path rerun plus correctness guard | Feature checker and template gate audit | pass |
| Reach all agent runtimes | canonical rules and Dotai install | `pnpm install` / targeted Skills add | mirror/resource/pack parity | pass |
| Refresh one shared skill safely | global `sync-skills` source | targeted `skills add --skill` | quick validator plus source audit | pass |

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Batched source read exceeded display cap | 1 | Read one owner or narrow slice at a time | Subsequent reads were bounded; no evidence was lost |
| Generic skill validator lacked PyYAML | 2 | Use isolated `uv run --with pyyaml` | Dotai Autogoal and global sync-skills both validated |
| `skills update autogoal` invoked update-all and refreshed two unrelated global skills | 1 | Use targeted `skills add <source> --skill <name>` and repair sync teaching | Plate Autogoal refreshed by targeted add; global collateral disclosed because no prior tracked baseline exists |
| `pnpm exec biome` unavailable | 1 | Use repository-owned Ultracite | Scoped fix/check passed |

Verification evidence:
- `scripts/validate-skills` in `/Users/zbeyens/git/dotai` -> `skills ok`.
- Skill Creator quick validation through isolated PyYAML -> Autogoal and
  sync-skills valid.
- `pnpm install` -> Skiller apply and required-resource sync passed.
- `node --test .agents/rules/benchmark/scripts/benchmark-contract.test.mjs .agents/skills/benchmark/scripts/benchmark-contract.test.mjs` -> 44/44 passed, including unresolved/resolved generated-plan forward test.
- `node --test tooling/scripts/check-plate-feature.test.mjs` -> 13/13 passed.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` -> exact.
- Dotai, installed Autogoal, and Plate performance-pack contents -> byte-identical.
- `pnpm exec ultracite check ...` -> formatting/lint passed on matched JS.
- `git diff --check` -> passed.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-require-scalability-proof-in-architecture-workflows.md` -> complete.

Final repair handoff:
- Expectation: performance/scalability is an architecture design input and
  closeout gate, never an optional follow-up request.
- Repaired owner: Benchmark measurement law, shared Autogoal materialization,
  eight Plate acceptance/implementation owners, six project template/pack
  surfaces, Plate Feature checker, and targeted sync instructions.
- Files changed: canonical rules/references, generated skill mirrors, project
  templates, Autogoal install/lock, two focused contract tests, and this plan.
- Verification: 57/57 focused tests, source/mirror/resource/pack parity,
  Dotai/Skill Creator validation, Ultracite, and diff check passed.
- Caveat: the first incorrect update-all command refreshed the global
  `create-payment-credential` and `financial-insights` skills. They have no
  Plate repo diff, and no tracked prior baseline exists for a safe rollback.

Timeline:
- 2026-08-31T08:51:29.376Z Goal repair plan created.
- 2026-08-31T08:52:00Z Matching goal created; requirements and repair boundaries frozen before the owner/template audit.
- 2026-08-31T09:15:00Z Canonical shared Autogoal owner resolved to `/Users/zbeyens/git/dotai`; installed Plate copies remain generated, not hand-edited.
- 2026-08-31T09:20:00Z Applicable denominator fixed at eight workflow owners, six project template/pack surfaces, and the shared Autogoal source pack/templates; four routers/lenses deliberately excluded.
- 2026-08-31T09:45:00Z Dotai Autogoal validation passed; commit `e4bc2af` pushed to `origin/main`.
- 2026-08-31T10:00:00Z Plate Autogoal refreshed through targeted Skills add; project templates preserved and rule mirrors regenerated with `pnpm install`.
- 2026-08-31T10:15:00Z Forward test proved unresolved generated scale gates fail and resolved receipts pass; Benchmark/feature suites closed 57/57.
- 2026-08-31T10:25:00Z Agent-native review found unsafe targeted-update teaching; `sync-skills` repaired and validated with zero accepted findings open.
- 2026-08-31T10:30:00Z Final Autogoal mechanical checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Report the completed repair |
| What is the goal? | Require scalability proof in every applicable architecture/API workflow |
| What have I learned? | Paper scale budgets need an executable pre-acceptance receipt, and targeted skill sync must not use update-all |
| What have I done? | Repaired shared and Plate owners/templates, regenerated mirrors, fixed sync teaching, and passed 57 focused tests |

Open risks:
- The first incorrect update-all command refreshed two unrelated global skills;
  no tracked prior snapshot exists for a safe rollback. Plate files were not
  changed by that collateral update.
- Benchmark theater remains possible if an agent records fabricated evidence;
  the workflow now makes the required receipt fail-closed and reviewable, while
  executable commands/artifacts remain the authority.
